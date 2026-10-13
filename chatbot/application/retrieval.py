from collections import Counter
from threading import RLock
import hashlib
import json
import logging
import math
import re
import time

from domain.models import matching_variants, normalize, product_document

logger = logging.getLogger(__name__)
STOP_WORDS = set("toi minh ban shop can tim muon mua co khong va la cho mot nhung san pham size mau duoi tren toi da ngan sach voi".split())


def tokens(text):
    return [token for token in re.findall(r"\w+", normalize(text)) if token not in STOP_WORDS]


class BM25:
    def __init__(self, documents):
        self.documents = [Counter(tokens(document)) for document in documents]
        self.lengths = [sum(document.values()) for document in self.documents]
        self.average = sum(self.lengths) / max(len(documents), 1)
        self.df = Counter(token for document in self.documents for token in document)

    def scores(self, query):
        n = len(self.documents)
        scores = []
        for document, length in zip(self.documents, self.lengths):
            score = 0
            for token in set(tokens(query)):
                frequency = document[token]
                if not frequency:
                    continue
                idf = math.log(1 + (n - self.df[token] + .5) / (self.df[token] + .5))
                denominator = frequency + 1.5 * (1 - .75 + .75 * length / max(self.average, 1))
                score += idf * frequency * 2.5 / denominator
            scores.append(score)
        return scores


def reciprocal_rank_fusion(rankings, constant=60):
    scores = Counter()
    for ranking in rankings:
        for rank, identifier in enumerate(ranking, start=1):
            scores[identifier] += 1 / (constant + rank)
    return [identifier for identifier, _ in sorted(scores.items(), key=lambda pair: (-pair[1], pair[0]))]


class HybridRetriever:
    def __init__(self, repository, settings, embedding=None, reranker=None):
        self.repository = repository
        self.settings = settings
        self.embedding = embedding
        self.reranker = reranker
        self.lock = RLock()
        self.snapshot = None
        self.refreshed_at = 0
        self.fingerprint = ""
        self.last_error = ""

    def refresh(self, force=False):
        if self.snapshot is not None and not force and time.monotonic() - self.refreshed_at < self.settings.index_refresh_seconds:
            return
        with self.lock:
            if self.snapshot is not None and not force and time.monotonic() - self.refreshed_at < self.settings.index_refresh_seconds:
                return
            products = self.repository.all()
            docs = [product_document(product) for product in products]
            fingerprint = hashlib.sha256(json.dumps(
                [(product["id"], text) for product, text in zip(products, docs)],
                ensure_ascii=False,
            ).encode()).hexdigest()
            retry_dense = self.embedding and docs and self.snapshot and self.snapshot["index"] is None and time.monotonic() >= getattr(self.embedding, "retry_at", 0)
            if self.snapshot is not None and self.fingerprint == fingerprint and not retry_dense:
                self.refreshed_at = time.monotonic()
                return
            index = None
            if self.embedding and docs:
                try:
                    import faiss
                    embeddings = self.embedding.documents(docs)
                    index = faiss.IndexFlatIP(embeddings.shape[1])
                    index.add(embeddings)
                    self.last_error = ""
                except Exception as error:
                    self.embedding.failed(error)
                    self.last_error = "dense_unavailable"
            self.snapshot = {"products": products, "docs": docs, "bm25": BM25(docs), "index": index}
            self.fingerprint = fingerprint
            self.refreshed_at = time.monotonic()

    def search(self, query, filters, top_k=5, mode="hybrid", allow_category_fallback=True):
        started = time.perf_counter()
        self.refresh()
        snapshot = self.snapshot
        indexed = snapshot["products"]
        # Live documents are required even when vector index metadata is cached.
        fresh = {product["id"]: product for product in self.repository.by_ids([p["id"] for p in indexed])}
        eligible = {identifier for identifier, product in fresh.items() if matching_variants(product, filters)}
        lexical_scores = snapshot["bm25"].scores(query)
        lexical = [
            indexed[i]["id"] for i in sorted(range(len(indexed)), key=lambda i: (-lexical_scores[i], indexed[i]["id"]))
            if indexed[i]["id"] in eligible and lexical_scores[i] > 0
        ][:30]
        dense = []
        if mode != "bm25" and snapshot["index"] is not None:
            try:
                distances, positions = snapshot["index"].search(self.embedding.query(query), len(indexed))
                dense = [
                    indexed[int(position)]["id"] for score, position in zip(distances[0], positions[0])
                    if position >= 0 and indexed[int(position)]["id"] in eligible and score >= self.settings.retrieval_min_score
                ][:30]
            except Exception as error:
                self.embedding.failed(error)
                self.last_error = "dense_unavailable"
        rankings = [lexical] if mode == "bm25" else [dense] if mode == "dense" else [lexical, dense]
        identifiers = reciprocal_rank_fusion(rankings)
        if allow_category_fallback and not identifiers and filters.get("category"):
            identifiers = sorted(eligible)
        if self.reranker and mode == "hybrid" and identifiers:
            try:
                identifiers = self.reranker.rank(query, [(identifier, product_document(fresh[identifier])) for identifier in identifiers[:15]])
            except Exception as error:
                logger.warning("reranker_unavailable", extra={"error_type": type(error).__name__})
        result = [fresh[identifier] for identifier in identifiers[:top_k]]
        metadata = {
            "mode": mode if snapshot["index"] is not None else "bm25",
            "dense_available": snapshot["index"] is not None,
            "lexical_candidates": len(lexical), "dense_candidates": len(dense),
            "catalog_size": len(indexed), "index_fingerprint": self.fingerprint[:12],
            "retrieval_ms": round((time.perf_counter() - started) * 1000, 2),
        }
        return result, metadata

    def status(self):
        return {
            "indexed": self.snapshot is not None,
            "catalog_size": len(self.snapshot["products"]) if self.snapshot else 0,
            "dense_available": bool(self.snapshot and self.snapshot["index"] is not None),
            "fingerprint": self.fingerprint[:12],
            "refresh_seconds": self.settings.index_refresh_seconds,
        }

