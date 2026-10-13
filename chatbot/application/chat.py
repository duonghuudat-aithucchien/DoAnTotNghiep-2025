from datetime import datetime, timezone
import json
import logging
import re
import time
import uuid

from application.understanding import baseline_plan, validate_llm_plan
from application.budget import CallBudget
from domain.models import QueryPlan
from domain.privacy import redact, unsafe_instruction

logger = logging.getLogger(__name__)


def safe_sentence(text):
    # Numerical/catalog claims come from server product cards, not generated prose.
    return bool(text.strip()) and not re.search(r"\d|https?://|www\.", text) and not unsafe_instruction(text)


class ChatUseCase:
    def __init__(self, settings, conversations, tools, llm):
        self.settings = settings
        self.conversations = conversations
        self.tools = tools
        self.llm = llm

    def run(self, message, actor, conversation_id=None, request_id=None):
        request_id = request_id or str(uuid.uuid4())
        started = time.perf_counter()
        conversation = self.conversations.open(actor.owner, conversation_id)
        self.conversations.acquire(conversation)
        trace = {
            "request_id": request_id, "conversation_id": conversation["id"],
            "prompt_version": self.settings.prompt_version,
            "model": self.settings.gemini_model, "embedding_model": self.settings.embedding_model,
            "prompt_tokens": 0, "output_tokens": 0, "fallback": False,
        }
        completed = False
        try:
            yield "meta", {"conversation_id": conversation["id"], "request_id": request_id}
            state = conversation["state"]
            plan = baseline_plan(message, state)
            if unsafe_instruction(message):
                plan = QueryPlan(intent="blocked", query=message)
            allow_llm = self.llm.enabled and plan.intent in {"unknown", "product_search", "stock_check", "outfit_advice"}
            budget = CallBudget(self.settings, self.conversations)
            if allow_llm:
                try:
                    payload, usage = self.llm.plan(message, state, budget=budget)
                    plan = validate_llm_plan(payload, message, plan)
                    for key, value in usage.items():
                        trace[key] += value
                except Exception as error:
                    logger.warning("query_understanding_fallback", extra={"request_id": request_id, "error_type": type(error).__name__})
                    trace["fallback"] = True
                    allow_llm = False
            trace["intent"] = plan.intent
            yield "status", {"message": "Đang kiểm tra thông tin phù hợp…"}
            tool_started = time.perf_counter()
            result = self.tools.execute(plan, actor, state)
            trace["tool"] = result["tool"]
            trace["tool_ms"] = round((time.perf_counter() - tool_started) * 1000, 2)
            trace.update(result.get("metadata", {}))
            trace["no_result"] = plan.intent in {"product_search", "stock_check", "outfit_advice"} and not result["products"]
            response_text = ""
            if allow_llm and not result.get("deterministic") and result["products"]:
                context = {
                    "query": redact(message), "intent": plan.intent,
                    "conversation_summary": conversation.get("summary", ""),
                    "history": [{key: turn[key] for key in ["message", "response"]} for turn in conversation["turns"][-self.settings.history_turns:]],
                    "filters": plan.filters, "tool": result["tool"], "tool_result": result["facts"],
                }
                buffer = ""
                usage = {}
                try:
                    for chunk in self.llm.answer_stream(context, budget=budget):
                        buffer += chunk.get("text", "")
                        if chunk.get("usage"):
                            usage = chunk["usage"]
                        sentences = re.split(r"(?<=[.!?。\n])\s+", buffer)
                        buffer = sentences.pop() if sentences else ""
                        for sentence in sentences:
                            if not safe_sentence(sentence):
                                raise ValueError("Unsupported generated claim")
                            response_text += sentence + " "
                            yield "delta", {"text": sentence + " "}
                        if len(response_text) + len(buffer) > 1800:
                            raise ValueError("Generated response is too long")
                    if buffer.strip():
                        if not safe_sentence(buffer):
                            raise ValueError("Unsupported generated claim")
                        response_text += buffer
                        yield "delta", {"text": buffer}
                    if not response_text.strip():
                        raise ValueError("Empty model response")
                    for key, value in usage.items():
                        trace[key] += value
                except Exception as error:
                    trace["fallback"] = True
                    response_text = ""
                    yield "reset", {}
                    logger.warning("answer_fallback", extra={"request_id": request_id, "error_type": type(error).__name__})
            if not response_text:
                response_text = result["fallback"]
                for start in range(0, len(response_text), 80):
                    yield "delta", {"text": response_text[start:start + 80]}
            message_id = str(uuid.uuid4())
            if plan.intent in {"product_search", "stock_check", "outfit_advice"}:
                conversation["state"] = {
                    **state, "intent": plan.intent, "filters": plan.filters,
                    "last_product_ids": [product["id"] for product in result["products"]],
                }
            elif plan.intent in {"order_tracking", "return_eligibility"}:
                conversation["state"] = {**state, "intent": plan.intent, "last_order_id": plan.order_id or state.get("last_order_id", "")}
            conversation["turns"].append({
                "id": message_id, "message": redact(message), "response": redact(response_text),
                "products": result["products"], "sources": result["sources"], "intent": plan.intent,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            conversation["turns"] = conversation["turns"][-60:]
            # Deterministic context compression avoids an extra model call and a fabricated summary.
            conversation["summary"] = redact(json.dumps({
                "preferences": conversation["state"].get("filters", {}),
                "recent_intent": plan.intent,
                "last_question": message[:300],
                "recent_product_ids": conversation["state"].get("last_product_ids", []),
            }, ensure_ascii=False))[:1200]
            self.conversations.save(conversation)
            trace["total_ms"] = round((time.perf_counter() - started) * 1000, 2)
            payload = {
                "status": "OK", "response": response_text.strip(), "conversation_id": conversation["id"],
                "message_id": message_id, "request_id": request_id, "intent": plan.intent,
                "filters": plan.filters, "products": result["products"], "sources": result["sources"],
                "suggestions": ["Tìm áo sơ mi dưới 500k", "Có size L màu đen không?", "Chính sách đổi trả"],
                "metadata": {
                    "latency_ms": trace["total_ms"], "model": self.settings.gemini_model,
                    "prompt_version": self.settings.prompt_version, "fallback": trace["fallback"],
                    "retrieval": result.get("metadata", {}),
                },
            }
            completed = True
            yield "done", payload
        except Exception as error:
            trace["error_type"] = type(error).__name__
            raise
        finally:
            trace["completed"] = completed
            trace["total_ms"] = round((time.perf_counter() - started) * 1000, 2)
            try:
                self.conversations.trace(trace)
            except Exception as error:
                logger.warning("trace_persistence_failed", extra={"request_id": request_id, "error_type": type(error).__name__})
            self.conversations.release(conversation)
            logger.info("chat_completed", extra={
                "request_id": request_id, "conversation_id": conversation["id"],
                "intent": trace.get("intent", ""), "total_ms": trace["total_ms"],
            })

