import hashlib
import json
import logging
import re
import secrets
import time
import uuid

import jwt
from flask import Blueprint, Response, g, jsonify, request, stream_with_context
from pydantic import ValidationError
from werkzeug.exceptions import BadRequest, RequestEntityTooLarge

from api.schemas import ChatInput, FeedbackInput
from domain.models import Actor, ChatError

logger = logging.getLogger(__name__)


def serialize_conversation(conversation, include_turns=True):
    payload = {
        "id": conversation["id"],
        "createdAt": conversation["createdAt"].isoformat(),
        "updatedAt": conversation["updatedAt"].isoformat(),
        "expiresAt": conversation["expiresAt"].isoformat(),
        "title": conversation["turns"][0]["message"][:80] if conversation["turns"] else "Cuộc trò chuyện mới",
    }
    if include_turns:
        payload["turns"] = conversation["turns"]
    return payload


def register_routes(app, dependencies, settings):
    conversations = dependencies["conversations"]
    products = dependencies["products"]
    retriever = dependencies["retriever"]
    use_case = dependencies["chat"]
    api = Blueprint("chat_api", __name__)

    def actor():
        header = request.headers.get("Authorization", "")
        if header:
            if not header.startswith("Bearer ") or not settings.jwt_secret:
                raise ChatError("Phiên đăng nhập không hợp lệ.", "INVALID_TOKEN", 401)
            try:
                claims = jwt.decode(header[7:], settings.jwt_secret, algorithms=["HS256"], options={"require": ["exp", "iat"]})
                identifier = claims.get("id", "")
                if not re.fullmatch(r"[0-9a-fA-F]{24}", str(identifier)):
                    raise ValueError("Missing user")
                return Actor(owner="user:" + identifier, user_id=identifier, token=header[7:], is_admin=claims.get("isAdmin") is True)
            except (jwt.PyJWTError, ValueError):
                raise ChatError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "INVALID_TOKEN", 401) from None
        session = request.headers.get("X-Chat-Session") or request.cookies.get("chat_session") or secrets.token_urlsafe(32)
        if not re.fullmatch(r"[A-Za-z0-9_-]{20,128}", session):
            raise ChatError("Mã phiên trò chuyện không hợp lệ.", "INVALID_SESSION", 400)
        g.guest_session = session
        return Actor(owner="guest:" + hashlib.sha256(session.encode()).hexdigest())

    def require_admin():
        current_actor = actor()
        if not current_actor.is_admin:
            raise ChatError("Cần quyền quản trị viên.", "ADMIN_REQUIRED", 403)
        return current_actor

    def limited(current_actor, kind="chat"):
        minute = int(time.time() // 60)
        key = f"{kind}:actor:{current_actor.owner}:{minute}"
        if conversations.increment(key, 120) > settings.rate_limit_per_minute:
            raise ChatError("Bạn gửi tin nhắn hơi nhanh. Vui lòng thử lại sau một phút.", "RATE_LIMITED", 429)
        if not current_actor.user_id:
            # A new guest header cannot bypass the shared per-IP budget.
            ip = hashlib.sha256(str(request.remote_addr).encode()).hexdigest()
            if conversations.increment(f"{kind}:ip:{ip}:{minute}", 120) > settings.rate_limit_per_minute * 3:
                raise ChatError("Vui lòng thử lại sau một phút.", "RATE_LIMITED", 429)

    def chat_input():
        try:
            payload = ChatInput.model_validate(request.get_json())
        except (ValidationError, BadRequest):
            raise ChatError("Tin nhắn hoặc mã phiên không hợp lệ.", "VALIDATION_ERROR", 400) from None
        if len(payload.message) > settings.max_message_chars:
            raise ChatError("Tin nhắn quá dài.", "MESSAGE_TOO_LONG", 400)
        return payload

    @app.before_request
    def request_id():
        g.request_id = str(uuid.uuid4())

    @app.after_request
    def response_headers(response):
        response.headers["X-Request-ID"] = g.request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Cache-Control"] = "no-store"
        if g.get("guest_session"):
            response.set_cookie(
                "chat_session", g.guest_session, httponly=True,
                secure=request.is_secure, samesite="Lax", max_age=settings.retention_days * 86400,
            )
        return response

    @app.errorhandler(ChatError)
    def chat_error(error):
        response = jsonify({"status": "ERR", "response": str(error), "message": str(error), "code": error.code, "request_id": g.request_id})
        response.status_code = error.status
        if error.status == 429:
            response.headers["Retry-After"] = "60"
        return response

    @app.errorhandler(RequestEntityTooLarge)
    def too_large(error):
        return chat_error(ChatError("Nội dung gửi lên quá lớn.", "REQUEST_TOO_LARGE", 413))

    @app.errorhandler(Exception)
    def unexpected(error):
        from werkzeug.exceptions import HTTPException
        if isinstance(error, HTTPException):
            return chat_error(ChatError("Yêu cầu không hợp lệ.", "HTTP_ERROR", error.code))
        logger.error("request_failed", extra={"request_id": g.request_id, "error_type": type(error).__name__})
        return chat_error(ChatError("Dịch vụ tạm thời chưa sẵn sàng. Vui lòng thử lại.", "SERVICE_UNAVAILABLE", 503))

    @api.get("/api/health")
    def health():
        return jsonify({"status": "OK", "service": "fashion-ai-assistant", "version": "2.0"})

    @api.get("/api/ready")
    def ready():
        try:
            products.ping()
            conversations.ping()
        except Exception:
            return jsonify({"status": "ERR", "ready": False}), 503
        return jsonify({"status": "OK", "ready": True, "llm_configured": dependencies["llm"].enabled, "retrieval": retriever.status()})

    @api.post("/get")
    @api.post("/api/chat")
    def chat():
        payload = chat_input()
        current_actor = actor()
        limited(current_actor)
        result = None
        for event, value in use_case.run(payload.message, current_actor, payload.conversation_id, g.request_id):
            if event == "done":
                result = value
        return jsonify(result)

    @api.post("/api/chat/stream")
    def stream():
        payload = chat_input()
        current_actor = actor()
        limited(current_actor)
        events = use_case.run(payload.message, current_actor, payload.conversation_id, g.request_id)
        # Start the generator before headers so ownership/busy errors have real HTTP status.
        first = next(events)

        @stream_with_context
        def generate():
            try:
                yield f"event: {first[0]}\ndata: {json.dumps(first[1], ensure_ascii=False)}\n\n"
                for event, value in events:
                    yield f"event: {event}\ndata: {json.dumps(value, ensure_ascii=False)}\n\n"
            except ChatError as error:
                yield f"event: error\ndata: {json.dumps({'message': str(error), 'code': error.code}, ensure_ascii=False)}\n\n"
            except Exception as error:
                logger.error("stream_failed", extra={"request_id": g.request_id, "error_type": type(error).__name__})
                yield 'event: error\ndata: {"message":"Dịch vụ tạm thời không phản hồi.","code":"SERVICE_UNAVAILABLE"}\n\n'
            finally:
                events.close()
        response = Response(generate(), mimetype="text/event-stream", headers={"X-Accel-Buffering": "no", "Cache-Control": "no-cache"})
        response.call_on_close(events.close)
        return response

    @api.get("/api/conversations")
    def list_conversations():
        current_actor = actor()
        limited(current_actor, "history")
        return jsonify({"status": "OK", "data": [serialize_conversation(conversation, False) for conversation in conversations.list(current_actor.owner)]})

    @api.get("/api/conversations/<conversation_id>")
    def conversation_detail(conversation_id):
        current_actor = actor()
        limited(current_actor, "history")
        return jsonify({"status": "OK", "data": serialize_conversation(conversations.open(current_actor.owner, conversation_id))})

    @api.delete("/api/conversations/<conversation_id>")
    def delete_conversation(conversation_id):
        current_actor = actor()
        limited(current_actor, "history")
        conversations.delete(current_actor.owner, conversation_id)
        return jsonify({"status": "OK", "message": "Đã xóa cuộc trò chuyện."})

    @api.get("/get-conversations")
    def legacy_history():
        current_actor = actor()
        if not current_actor.user_id:
            raise ChatError("Đăng nhập để xem lịch sử.", "AUTH_REQUIRED", 401)
        docs = conversations.list(current_actor.owner)
        turns = [turn for doc in reversed(docs) for turn in doc["turns"]]
        return jsonify({"conversations": [{key: value for key, value in turn.items() if key in {"message", "response", "timestamp", "products"}} for turn in turns[-60:]]})

    @api.post("/api/feedback")
    def feedback():
        current_actor = actor()
        limited(current_actor, "feedback")
        try:
            payload = FeedbackInput.model_validate(request.get_json())
        except (ValidationError, BadRequest):
            raise ChatError("Phản hồi không hợp lệ.", "VALIDATION_ERROR", 400) from None
        conversations.feedback(current_actor.owner, payload.conversation_id, payload.message_id, payload.rating)
        return jsonify({"status": "OK"})

    @api.post("/api/admin/reindex")
    def reindex():
        current_actor = require_admin()
        limited(current_actor, "reindex")
        retriever.refresh(force=True)
        return jsonify({"status": "OK", "data": retriever.status()})

    @api.get("/api/admin/metrics")
    def metrics():
        require_admin()
        return jsonify({"status": "OK", "data": conversations.metrics(), "retrieval": retriever.status()})

    app.register_blueprint(api)

