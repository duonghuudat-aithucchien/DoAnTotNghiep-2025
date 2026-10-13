import json
from pathlib import Path
import pytest
from config import Settings
from application.bootstrap import build_dependencies
from app import create_app


@pytest.fixture
def settings():
    return Settings(storage_mode="memory", embedding_enabled=False, jwt_secret="test-signing-secret-with-at-least-32-characters", rate_limit_per_minute=100)


@pytest.fixture
def dependencies(settings):
    return build_dependencies(settings)


@pytest.fixture
def client(settings, dependencies):
    application = create_app(settings, dependencies)
    application.config["TESTING"] = True
    return application.test_client()


@pytest.fixture
def guest_headers():
    return {"X-Chat-Session": "test-session-with-at-least-32-characters"}

