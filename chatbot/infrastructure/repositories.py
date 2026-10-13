from copy import deepcopy
from datetime import datetime, timedelta, timezone
from threading import RLock
import hashlib
import secrets
import time
import uuid

from domain.models import ChatError, catalog_product


def utcnow():
    return datetime.now(timezone.utc)


def new_conversation(owner, retention_days):
    return {
        "id": str(uuid.uuid4()), "owner": owner, "state": {}, "summary": "",
        "turns": [], "createdAt": utcnow(), "updatedAt": utcnow(),
        "expiresAt": utcnow() + timedelta(days=retention_days),
    }


class MemoryProducts:
    def __init__(self, products):
        self.documents = products

    def all(self):
        return [catalog_product(document) for document in deepcopy(self.documents)]

    def by_ids(self, ids):
        return [product for product in self.all() if product["id"] in ids]

    def ping(self):
        return True


class MemoryConversations:
    """Explicit test/demo adapter; production uses Mongo, never silent fallback."""
    def __init__(self, settings):
        self.settings = settings
        self.documents = {}
        self.traces = {}
        self.feedbacks = {}
        self.counters = {}
        self.busy = set()
        self.lock = RLock()

    def open(self, owner, conversation_id=None):
        with self.lock:
            if conversation_id:
                conversation = self.documents.get(conversation_id)
                if not conversation or conversation["owner"] != owner or conversation["expiresAt"] < utcnow():
                    raise ChatError("Không tìm thấy phiên trò chuyện.", "CONVERSATION_NOT_FOUND", 404)
            else:
                conversation = new_conversation(owner, self.settings.retention_days)
                self.documents[conversation["id"]] = conversation
            return deepcopy(conversation)

    def acquire(self, conversation):
        with self.lock:
            if conversation["id"] in self.busy:
                raise ChatError("Một tin nhắn đang được xử lý. Vui lòng đợi.", "CONVERSATION_BUSY", 409)
            self.busy.add(conversation["id"])

    def release(self, conversation):
        with self.lock:
            self.busy.discard(conversation["id"])

    def save(self, conversation):
        with self.lock:
            if conversation["id"] not in self.documents:
                raise ChatError("Phiên trò chuyện đã bị xóa.", "CONVERSATION_NOT_FOUND", 404)
            conversation["updatedAt"] = utcnow()
            conversation["expiresAt"] = utcnow() + timedelta(days=self.settings.retention_days)
            self.documents[conversation["id"]] = deepcopy(conversation)

    def list(self, owner, limit=20):
        return sorted(
            [deepcopy(doc) for doc in self.documents.values() if doc["owner"] == owner and doc["expiresAt"] > utcnow()],
            key=lambda doc: doc["updatedAt"], reverse=True,
        )[:limit]

    def delete(self, owner, conversation_id):
        self.open(owner, conversation_id)
        with self.lock:
            if conversation_id in self.busy:
                raise ChatError("Đợi tin nhắn hiện tại hoàn tất trước khi xóa.", "CONVERSATION_BUSY", 409)
            self.documents.pop(conversation_id, None)
            self.traces = {key: value for key, value in self.traces.items() if value.get("conversation_id") != conversation_id}
            self.feedbacks = {key: value for key, value in self.feedbacks.items() if value.get("conversation_id") != conversation_id}

    def increment(self, key, ttl_seconds):
        with self.lock:
            counter, expires = self.counters.get(key, (0, 0))
            if expires < time.time():
                counter = 0
            self.counters[key] = (counter + 1, time.time() + ttl_seconds)
            self.counters = {k: v for k, v in self.counters.items() if v[1] > time.time()}
            return counter + 1

    def trace(self, trace):
        if trace.get('conversation_id') in self.documents:
            self.traces[trace["request_id"]] = {**deepcopy(trace), "timestamp": utcnow()}

    def feedback(self, owner, conversation_id, message_id, rating):
        conversation = self.open(owner, conversation_id)
        if message_id not in [turn["id"] for turn in conversation["turns"]]:
            raise ChatError("Không tìm thấy câu trả lời.", "MESSAGE_NOT_FOUND", 404)
        self.feedbacks[(owner, message_id)] = {
            "owner": owner, "conversation_id": conversation_id, "message_id": message_id, "rating": rating, "timestamp": utcnow(),
        }

    def metrics(self):
        return aggregate_metrics(list(self.traces.values()), list(self.feedbacks.values()))

    def ping(self):
        return True


class MongoProducts:
    def __init__(self, db):
        self.collection = db["products"]

    def all(self):
        projection = {key: 1 for key in [
            "name", "type", "description", "price", "discount", "rating", "countInStock",
            "image", "sizes", "colors", "variants", "gender", "occasion", "style", "isActive",
        ]}
        return [catalog_product(document) for document in self.collection.find({}, projection)]

    def by_ids(self, ids):
        from bson import ObjectId
        valid_ids = [ObjectId(value) for value in ids if ObjectId.is_valid(value)]
        return [catalog_product(document) for document in self.collection.find({"_id": {"$in": valid_ids}}, {"reviews": 0, "subImages": 0})]

    def ping(self):
        self.collection.database.client.admin.command("ping")
        return True


class MongoConversations:
    def __init__(self, db, settings):
        self.settings = settings
        self.collection = db["ai_conversations"]
        self.traces = db["ai_traces"]
        self.feedbacks = db["ai_feedback"]
        self.counters = db["ai_rate_limits"]
        self._indexed = False
        self._index_lock = RLock()

    def ensure_indexes(self):
        if self._indexed:
            return
        with self._index_lock:
            if self._indexed:
                return
            self.collection.create_index("id", unique=True)
            self.collection.create_index([("owner", 1), ("updatedAt", -1)])
            for collection in [self.collection, self.traces, self.feedbacks, self.counters]:
                collection.create_index("expiresAt", expireAfterSeconds=0)
            self.traces.create_index("request_id", unique=True)
            self.feedbacks.create_index([("owner", 1), ("message_id", 1)], unique=True)
            self._indexed = True

    def open(self, owner, conversation_id=None):
        self.ensure_indexes()
        if conversation_id:
            conversation = self.collection.find_one(
                {"id": conversation_id, "owner": owner, "expiresAt": {"$gt": utcnow()}}, {"_id": 0}
            )
            if not conversation:
                raise ChatError("Không tìm thấy phiên trò chuyện.", "CONVERSATION_NOT_FOUND", 404)
        else:
            conversation = new_conversation(owner, self.settings.retention_days)
            self.collection.insert_one(deepcopy(conversation))
        return conversation

    def acquire(self, conversation):
        lease_token = secrets.token_hex(16)
        now = utcnow()
        result = self.collection.update_one(
            {"id": conversation["id"], "owner": conversation["owner"],
             "$or": [{"leaseUntil": {"$exists": False}}, {"leaseUntil": {"$lt": now}}]},
            {"$set": {"leaseUntil": now + timedelta(minutes=3), "leaseToken": lease_token}},
        )
        if result.modified_count != 1:
            raise ChatError("Một tin nhắn đang được xử lý. Vui lòng đợi.", "CONVERSATION_BUSY", 409)
        conversation["_lease_token"] = lease_token

    def release(self, conversation):
        self.collection.update_one(
            {"id": conversation["id"], "leaseToken": conversation.get("_lease_token")},
            {"$unset": {"leaseUntil": "", "leaseToken": ""}},
        )

    def save(self, conversation):
        payload = {key: value for key, value in conversation.items() if key not in {"_id", "_lease_token", "leaseUntil", "leaseToken"}}
        payload["updatedAt"] = utcnow()
        payload["expiresAt"] = utcnow() + timedelta(days=self.settings.retention_days)
        result = self.collection.update_one(
            {"id": conversation["id"], "owner": conversation["owner"], "leaseToken": conversation.get("_lease_token")},
            {"$set": payload},
        )
        if result.matched_count != 1:
            raise ChatError("Phiên trò chuyện đã bị xóa hoặc hết thời gian xử lý.", "CONVERSATION_NOT_FOUND", 409)

    def list(self, owner, limit=20):
        self.ensure_indexes()
        return list(self.collection.find(
            {"owner": owner, "expiresAt": {"$gt": utcnow()}}, {"_id": 0}
        ).sort("updatedAt", -1).limit(limit))

    def delete(self, owner, conversation_id):
        self.open(owner, conversation_id)
        removed = self.collection.delete_one({
            "owner": owner, "id": conversation_id,
            "$or": [{"leaseUntil": {"$exists": False}}, {"leaseUntil": {"$lt": utcnow()}}],
        })
        if not removed.deleted_count:
            raise ChatError("Đợi tin nhắn hiện tại hoàn tất trước khi xóa.", "CONVERSATION_BUSY", 409)
        self.traces.delete_many({"conversation_id": conversation_id})
        self.feedbacks.delete_many({"owner": owner, "conversation_id": conversation_id})

    def increment(self, key, ttl_seconds):
        from pymongo import ReturnDocument
        self.ensure_indexes()
        identifier = hashlib.sha256(key.encode()).hexdigest()
        return self.counters.find_one_and_update(
            {"_id": identifier},
            {"$inc": {"count": 1}, "$setOnInsert": {"expiresAt": utcnow() + timedelta(seconds=ttl_seconds)}},
            upsert=True, return_document=ReturnDocument.AFTER,
        )["count"]

    def trace(self, trace):
        if not self.collection.find_one({"id": trace["conversation_id"]}, {"_id": 1}):
            return
        self.traces.update_one(
            {"request_id": trace["request_id"]},
            {"$set": {**trace, "timestamp": utcnow(), "expiresAt": utcnow() + timedelta(days=self.settings.retention_days)}},
            upsert=True,
        )

    def feedback(self, owner, conversation_id, message_id, rating):
        conversation = self.open(owner, conversation_id)
        if message_id not in [turn["id"] for turn in conversation["turns"]]:
            raise ChatError("Không tìm thấy câu trả lời.", "MESSAGE_NOT_FOUND", 404)
        self.feedbacks.update_one(
            {"owner": owner, "message_id": message_id},
            {"$set": {"conversation_id": conversation_id, "rating": rating, "timestamp": utcnow(), "expiresAt": conversation["expiresAt"]}},
            upsert=True,
        )

    def metrics(self):
        since = utcnow() - timedelta(days=7)
        return aggregate_metrics(
            list(self.traces.find({"timestamp": {"$gte": since}}, {"_id": 0}).sort("timestamp", -1).limit(1000)),
            list(self.feedbacks.find({"timestamp": {"$gte": since}}, {"_id": 0}).sort("timestamp", -1).limit(1000)),
        )

    def ping(self):
        self.collection.database.client.admin.command("ping")
        return True


def aggregate_metrics(traces, feedbacks):
    latencies = sorted(trace.get("total_ms", 0) for trace in traces)
    count = len(traces)
    return {
        "sample_count": count,
        "window": "last_7_days_up_to_1000_requests",
        "p50_ms": latencies[int((count - 1) * .5)] if count else 0,
        "p95_ms": latencies[int((count - 1) * .95)] if count else 0,
        "fallback_rate": sum(bool(trace.get("fallback")) for trace in traces) / count if count else 0,
        "no_result_rate": sum(trace.get("no_result", False) for trace in traces) / count if count else 0,
        "prompt_tokens": sum(trace.get("prompt_tokens", 0) for trace in traces),
        "output_tokens": sum(trace.get("output_tokens", 0) for trace in traces),
        "positive_feedback": sum(item.get("rating") == 1 for item in feedbacks),
        "negative_feedback": sum(item.get("rating") == -1 for item in feedbacks),
        "product_clicks": sum(item.get("rating") == 2 for item in feedbacks),
    }

