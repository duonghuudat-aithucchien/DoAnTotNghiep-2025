"""A lazy adapter with a bounded query cache and disk document cache."""
from functools import lru_cache
from pathlib import Path
from threading import RLock
import hashlib
import logging
import os

logger = logging.getLogger(__name__)


class SentenceEmbedding:
    def __init__(self, settings):
        self.settings = settings
        self.model = None
        self.resolved_revision = ""
        self.lock = RLock()
        self.last_error = ""
        self.retry_at = 0

    def _model(self):
        import time
        if time.monotonic() < self.retry_at:
            raise RuntimeError("Embedding temporarily unavailable")
        with self.lock:
            if self.model is None:
                os.environ.setdefault("USE_TF", "0")
                from sentence_transformers import SentenceTransformer
                kwargs = {"device": "cpu", "trust_remote_code": False}
                if self.settings.embedding_revision:
                    kwargs["revision"] = self.settings.embedding_revision
                self.model = SentenceTransformer(self.settings.embedding_model, **kwargs)
                config = getattr(getattr(self.model[0], 'auto_model', None), 'config', None)
                self.resolved_revision = self.settings.embedding_revision or getattr(config, '_commit_hash', '') or 'unresolved'
                if self.resolved_revision == 'unresolved':
                    from huggingface_hub import try_to_load_from_cache
                    try:
                        cached = try_to_load_from_cache(self.settings.embedding_model, 'config.json')
                        parts = Path(cached).parts if isinstance(cached, str) else ()
                        if 'snapshots' in parts:
                            self.resolved_revision = parts[parts.index('snapshots') + 1]
                    except (ValueError, IndexError):
                        pass
            return self.model

    def _encode(self, texts, prefix):
        import numpy as np
        prefix = prefix if "e5" in self.settings.embedding_model.lower() else ""
        return np.asarray(self._model().encode(
            [prefix + text for text in texts], normalize_embeddings=True,
            convert_to_numpy=True, show_progress_bar=False, batch_size=32,
        ), dtype="float32")

    def documents(self, documents):
        import numpy as np
        cache = Path(self.settings.index_cache_dir)
        cache.mkdir(parents=True, exist_ok=True)
        # Resolve mutable model names before choosing cache keys: model updates must
        # not mix old document vectors with queries from new weights.
        self._model()
        if self.resolved_revision == 'unresolved':
            # Unknown/local mutable weights: recompute rather than reuse stale vectors.
            return self._encode(documents, 'passage: ')
        identity = self.settings.embedding_model + self.resolved_revision
        keys = [hashlib.sha256((identity + text).encode()).hexdigest() for text in documents]
        arrays = {}
        missing = []
        for key, text in zip(keys, documents):
            try:
                vector = np.load(cache / f"{key}.npy", allow_pickle=False)
                if vector.ndim != 1 or not np.isfinite(vector).all():
                    raise ValueError("Invalid cached vector")
                arrays[key] = vector
            except (OSError, ValueError):
                missing.append((key, text))
        if missing:
            vectors = self._encode([text for _, text in missing], "passage: ")
            for (key, _), vector in zip(missing, vectors):
                arrays[key] = vector
                temporary = cache / f"{key}.{os.getpid()}.tmp"
                with temporary.open("wb") as stream:
                    np.save(stream, vector, allow_pickle=False)
                os.replace(temporary, cache / f"{key}.npy")
        return np.stack([arrays[key] for key in keys])

    @lru_cache(maxsize=256)
    def query(self, text):
        return self._encode([text], "query: ")

    def failed(self, error):
        import time
        self.last_error = type(error).__name__
        self.retry_at = time.monotonic() + 300
        logger.warning("embedding_unavailable", extra={"error_type": self.last_error})


class CrossEncoderReranker:
    def __init__(self, model_name):
        self.model_name = model_name
        self.model = None
        self.lock = RLock()

    def rank(self, query, candidates):
        with self.lock:
            if self.model is None:
                from sentence_transformers import CrossEncoder
                self.model = CrossEncoder(self.model_name, device="cpu", trust_remote_code=False)
            values = self.model.predict([(query, text) for _, text in candidates], show_progress_bar=False)
        return [candidate[0] for candidate, _ in sorted(zip(candidates, values), key=lambda pair: float(pair[1]), reverse=True)]

