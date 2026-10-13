"""Configuration is loaded at app creation, never at module import."""
from dataclasses import dataclass, field
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent


def positive_int(name, default, minimum=1):
    value = int(os.getenv(name, str(default)))
    if value < minimum:
        raise ValueError(f"{name} must be >= {minimum}")
    return value


@dataclass(frozen=True)
class Settings:
    mongo_uri: str = field(default="", repr=False)
    mongo_db: str = "test"
    jwt_secret: str = field(default="", repr=False)
    google_api_key: str = field(default="", repr=False)
    gemini_model: str = "gemini-2.5-flash"
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:3001/api"
    storage_mode: str = "mongo"
    embedding_enabled: bool = True
    embedding_model: str = "intfloat/multilingual-e5-small"
    embedding_revision: str = ""
    reranker_model: str = ""
    index_refresh_seconds: int = 60
    index_cache_dir: str = str(BASE_DIR / ".cache")
    max_message_chars: int = 2000
    history_turns: int = 8
    retention_days: int = 30
    rate_limit_per_minute: int = 20
    llm_timeout_seconds: int = 20
    llm_max_output_tokens: int = 512
    llm_max_calls_per_turn: int = 2
    llm_max_calls_per_day: int = 2000
    retrieval_min_score: float = 0.70
    prompt_version: str = "fashion-v2.0"
    port: int = 5000
    log_level: str = "INFO"

    @classmethod
    def from_env(cls):
        from dotenv import load_dotenv, dotenv_values
        load_dotenv(BASE_DIR / ".env")
        jwt_secret = os.getenv("ACCESS_TOKEN", "")
        # Explicit local-only opt-in. Deployments should inject ACCESS_TOKEN directly.
        auth_file = os.getenv("BACKEND_AUTH_ENV_FILE", "")
        if auth_file:
            path = (BASE_DIR / auth_file).resolve()
            if not path.is_file():
                raise ValueError("BACKEND_AUTH_ENV_FILE does not exist")
            jwt_secret = dotenv_values(path).get("ACCESS_TOKEN") or ""
            if not jwt_secret:
                raise ValueError("ACCESS_TOKEN missing from BACKEND_AUTH_ENV_FILE")
        return cls(
            mongo_uri=os.getenv("MONGO_URI", ""),
            mongo_db=os.getenv("MONGO_DB", "test"),
            jwt_secret=jwt_secret,
            google_api_key=os.getenv("GOOGLE_API_KEY", ""),
            gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            frontend_url=os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/"),
            backend_url=os.getenv("BACKEND_API_URL", "http://localhost:3001/api").rstrip("/"),
            storage_mode=os.getenv("CHATBOT_STORAGE", "mongo"),
            embedding_enabled=os.getenv("EMBEDDING_ENABLED", "true").lower() == "true",
            embedding_model=os.getenv("EMBEDDING_MODEL", "intfloat/multilingual-e5-small"),
            embedding_revision=os.getenv("EMBEDDING_REVISION", ""),
            reranker_model=os.getenv("RERANKER_MODEL", ""),
            index_refresh_seconds=positive_int("INDEX_REFRESH_SECONDS", 60),
            index_cache_dir=os.getenv("INDEX_CACHE_DIR", str(BASE_DIR / ".cache")),
            max_message_chars=positive_int("MAX_MESSAGE_CHARS", 2000),
            history_turns=positive_int("HISTORY_TURNS", 8),
            retention_days=positive_int("CONVERSATION_RETENTION_DAYS", 30),
            rate_limit_per_minute=positive_int("CHAT_RATE_LIMIT", 20),
            llm_timeout_seconds=positive_int("LLM_TIMEOUT_SECONDS", 20),
            llm_max_output_tokens=positive_int("LLM_MAX_OUTPUT_TOKENS", 512),
            llm_max_calls_per_day=positive_int("LLM_MAX_CALLS_PER_DAY", 2000),
            retrieval_min_score=float(os.getenv("RETRIEVAL_MIN_COSINE", "0.70")),
            port=positive_int("PORT", 5000),
            log_level=os.getenv("LOG_LEVEL", "INFO"),
        )

