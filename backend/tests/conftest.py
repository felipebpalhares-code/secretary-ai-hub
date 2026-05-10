"""
Configuração compartilhada de testes.

- DB SQLite em arquivo temporário
- ENCRYPTION_KEY gerada na hora
- Mocks de Chroma, sentence-transformers e Anthropic configurados em fixtures
"""
from __future__ import annotations
import os
import sys
import tempfile
from pathlib import Path
from unittest.mock import MagicMock

# Envs precisam estar configurados ANTES dos imports da aplicação.
# CRÍTICO: usar atribuição direta (não setdefault). No container Docker, a env
# DATABASE_PATH=/data/felipe_hub.db já vem setada — se usássemos setdefault,
# os testes rodariam contra o DB de produção e o teardown
# (Base.metadata.drop_all) apagaria todas as tabelas.
_TMPDIR = tempfile.mkdtemp(prefix="felipe-hub-tests-")
os.environ["DATABASE_PATH"]  = str(Path(_TMPDIR) / "test.db")
os.environ["UPLOADS_PATH"]   = str(Path(_TMPDIR) / "uploads")
os.environ["WEBHOOK_LOG_PATH"] = str(Path(_TMPDIR) / "webhooks.log")
os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")

# Sprint H — JWT secret obrigatório pra todos os testes (auth e demais).
os.environ.setdefault("JWT_SECRET", "test-jwt-secret-do-not-use-in-prod")

if not os.environ.get("ENCRYPTION_KEY"):
    from cryptography.fernet import Fernet
    os.environ["ENCRYPTION_KEY"] = Fernet.generate_key().decode()

# Permite import absoluto a partir de backend/
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402
from services.database import init_db, SessionLocal, engine  # noqa: E402
from models.profile import Base  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _create_schema():
    init_db()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    s = SessionLocal()
    try:
        yield s
    finally:
        s.close()


# ───────── Sprint H — autenticação nos testes ─────────
#
# A maioria dos testes operacionais precisa de um cliente já autenticado como
# admin. `client` faz isso por padrão; `unauth_client` retorna um TestClient
# sem cookie pra cobrir os caminhos 401.

ADMIN_EMAIL    = "test-admin@example.com"
ADMIN_PASSWORD = "TestAdminPasswordABC123!"


def _ensure_admin():
    from services.user_service import get_user_by_email, create_user
    from models.user import UserRole
    with SessionLocal() as db:
        if get_user_by_email(db, ADMIN_EMAIL):
            return
        create_user(
            db,
            email=ADMIN_EMAIL,
            name="Test Admin",
            role=UserRole.ADMIN,
            raw_password=ADMIN_PASSWORD,
            must_change_password=False,
        )


@pytest.fixture
def unauth_client():
    """TestClient sem autenticação. Use pra testar 401."""
    return TestClient(app)


@pytest.fixture
def client():
    """TestClient autenticado como admin (cookie httpOnly setado)."""
    _ensure_admin()
    c = TestClient(app)
    r = c.post("/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login falhou no fixture: {r.status_code} {r.text}"
    return c


@pytest.fixture
def assistant_factory():
    """
    Cria um ASSISTANT com permissões configuráveis e retorna um TestClient
    autenticado como ele. Uso:
        c = assistant_factory({'contatos': {'ver': True, 'criar': True}})
    """
    from services.user_service import create_user, get_user_by_email
    from models.user import UserRole

    created_emails: list[str] = []

    def _make(permissions: dict | None = None, *, email: str | None = None, password: str = "AssistantTest123!"):
        email = email or f"assistant-{len(created_emails)}@example.com"
        with SessionLocal() as db:
            if not get_user_by_email(db, email):
                create_user(
                    db,
                    email=email,
                    name="Assistant Teste",
                    role=UserRole.ASSISTANT,
                    permissions=permissions or {},
                    raw_password=password,
                    must_change_password=False,
                )
        created_emails.append(email)
        c = TestClient(app)
        r = c.post("/api/auth/login", json={"email": email, "password": password})
        assert r.status_code == 200, f"Login do assistant falhou: {r.text}"
        return c

    yield _make


@pytest.fixture
def mock_chroma(monkeypatch):
    """Substitui Chroma e sentence-transformers por mocks em document_service."""
    from services.agents import document_service as docsvc

    fake_collection = MagicMock()
    fake_collection.count.return_value = 0
    fake_collection.upsert = MagicMock()
    fake_collection.delete = MagicMock()
    fake_collection.query = MagicMock(return_value={
        "documents":  [[]],
        "metadatas":  [[]],
        "distances": [[]],
    })

    fake_chroma = MagicMock()
    fake_chroma.get_or_create_collection.return_value = fake_collection
    fake_chroma.delete_collection = MagicMock()

    fake_embedder = MagicMock()
    # encode([...]) -> ndarray-like com .tolist() retornando matriz de floats
    fake_embedder.encode = MagicMock(side_effect=lambda items, **kw: _FakeNDArray(
        [[0.0] * 384 for _ in items]
    ))

    monkeypatch.setattr(docsvc, "_get_chroma",   lambda: fake_chroma)
    monkeypatch.setattr(docsvc, "_get_embedder", lambda: fake_embedder)

    return {"chroma": fake_chroma, "collection": fake_collection, "embedder": fake_embedder}


class _FakeNDArray:
    """Mínimo necessário pra simular numpy.ndarray.tolist() retornando lista."""
    def __init__(self, data):
        self._data = data
    def tolist(self):
        return self._data


@pytest.fixture
def mock_anthropic(monkeypatch):
    """Substitui o cliente Anthropic por um stream que devolve um texto fixo."""
    from services.agents import chat_service

    class _FakeStream:
        def __init__(self, text: str):
            self._text = text
            self.text_stream = self._iter()
        async def _iter(self):
            for ch in [self._text[i:i+8] for i in range(0, len(self._text), 8)]:
                yield ch
        async def __aenter__(self):  return self
        async def __aexit__(self, *a): return False
        async def get_final_message(self):
            usage = type("U", (), {"output_tokens": 7})()
            return type("M", (), {"usage": usage})()

    class _FakeMessages:
        def stream(self, **kwargs):
            return _FakeStream("Olá Felipe! Resposta de teste.")

    class _FakeAnthropic:
        messages = _FakeMessages()

    monkeypatch.setattr(chat_service, "_get_anthropic", lambda: _FakeAnthropic())
    return _FakeAnthropic
