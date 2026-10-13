import json
from pathlib import Path
from application.chat import ChatUseCase
from application.retrieval import HybridRetriever
from application.tools import ShoppingTools
from infrastructure.commerce import HTTPCommerce, DemoCommerce
from infrastructure.embedding import SentenceEmbedding, CrossEncoderReranker
from infrastructure.gemini import GeminiProvider, DisabledLLM
from infrastructure.repositories import MongoProducts, MongoConversations, MemoryProducts, MemoryConversations


def build_dependencies(settings):
    if settings.storage_mode == "memory":
        catalog = json.loads((Path(__file__).resolve().parents[1] / "evaluation" / "catalog.json").read_text(encoding="utf-8"))
        products = MemoryProducts(catalog)
        conversations = MemoryConversations(settings)
        commerce = DemoCommerce()
        llm = DisabledLLM()
    elif settings.storage_mode == "mongo":
        if not settings.mongo_uri:
            raise ValueError("MONGO_URI is required when CHATBOT_STORAGE=mongo")
        from pymongo import MongoClient
        client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=5000, connectTimeoutMS=3000, socketTimeoutMS=5000, tz_aware=True)
        db = client[settings.mongo_db]
        products = MongoProducts(db)
        conversations = MongoConversations(db, settings)
        commerce = HTTPCommerce(settings)
        llm = GeminiProvider(settings) if settings.google_api_key else DisabledLLM()
    else:
        raise ValueError("CHATBOT_STORAGE must be mongo or memory")
    embedding = SentenceEmbedding(settings) if settings.embedding_enabled else None
    reranker = CrossEncoderReranker(settings.reranker_model) if settings.reranker_model else None
    retriever = HybridRetriever(products, settings, embedding, reranker)
    tools = ShoppingTools(retriever, commerce, settings)
    return {
        "products": products, "conversations": conversations, "retriever": retriever,
        "llm": llm, "commerce": commerce, "chat": ChatUseCase(settings, conversations, tools, llm),
    }

