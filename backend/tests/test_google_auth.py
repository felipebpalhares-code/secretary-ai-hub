"""Testes do flow OAuth Google. Tudo mockado — nada chama o Google real."""
from __future__ import annotations
import json
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

from models.oauth_credential import OAuthCredential
from services.encryption import encrypt, decrypt
from services.google.oauth_service import generate_auth_url, SCOPES


@pytest.fixture(autouse=True)
def _set_google_envs(monkeypatch):
    monkeypatch.setenv("GOOGLE_CLIENT_ID", "fake-client-id")
    monkeypatch.setenv("GOOGLE_CLIENT_SECRET", "fake-client-secret")
    monkeypatch.setenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")
    monkeypatch.setenv("FRONTEND_URL", "http://localhost:3000")


@pytest.fixture(autouse=True)
def _clear_oauth_table(db):
    db.query(OAuthCredential).delete()
    db.commit()
    yield
    db.query(OAuthCredential).delete()
    db.commit()


def test_auth_url_contains_required_scopes():
    url = generate_auth_url("state-abc")
    assert url.startswith("https://accounts.google.com/o/oauth2/v2/auth?")
    assert "client_id=fake-client-id" in url
    assert "access_type=offline" in url
    assert "prompt=consent" in url
    assert "state=state-abc" in url
    # Os 3 escopos exigidos pela spec precisam estar lá
    assert "contacts.readonly" in url
    assert "gmail.readonly" in url
    assert "calendar.events" in url
    # Todos os escopos da constante devem estar serializados na URL
    for scope in SCOPES:
        # url-encoded, então testamos pelo último segmento (mais estável)
        assert scope.split("/")[-1] in url


def test_encrypt_decrypt_roundtrip():
    plaintext = "ya29.a0AfH6SMC-fake-access-token"
    ciphertext = encrypt(plaintext)
    assert ciphertext != plaintext
    assert decrypt(ciphertext) == plaintext


def test_status_when_disconnected_returns_false(client):
    resp = client.get("/api/auth/google/status")
    assert resp.status_code == 200
    body = resp.json()
    assert body == {"connected": False, "email": None, "expires_at": None, "scopes": []}


def test_status_when_connected_returns_email(client, db):
    expiry = datetime.utcnow() + timedelta(hours=1)
    db.add(OAuthCredential(
        provider="google",
        account_email="felipebpalhares@gmail.com",
        access_token_encrypted=encrypt("fake-access"),
        refresh_token_encrypted=encrypt("fake-refresh"),
        token_expiry=expiry,
        scopes=json.dumps(SCOPES),
    ))
    db.commit()

    resp = client.get("/api/auth/google/status")
    assert resp.status_code == 200
    body = resp.json()
    assert body["connected"] is True
    assert body["email"] == "felipebpalhares@gmail.com"
    assert body["expires_at"] is not None
    assert "https://www.googleapis.com/auth/contacts.readonly" in body["scopes"]


def test_callback_without_code_returns_400(client):
    resp = client.get("/api/auth/google/callback?state=anything", follow_redirects=False)
    assert resp.status_code == 400
    assert resp.json()["ok"] is False


def test_callback_with_invalid_state_returns_400(client):
    # State no query nao bate com o cookie
    client.cookies.set("google_oauth_state", "real-state-in-cookie")
    resp = client.get(
        "/api/auth/google/callback?code=fake-code&state=other-state",
        follow_redirects=False,
    )
    assert resp.status_code == 400
    assert resp.json()["ok"] is False


def test_callback_access_denied_redirects_with_msg(client):
    resp = client.get(
        "/api/auth/google/callback?error=access_denied",
        follow_redirects=False,
    )
    assert resp.status_code == 302
    assert "google=error" in resp.headers["location"]
    assert "Usuario+cancelou" in resp.headers["location"] or "Usuario%20cancelou" in resp.headers["location"]


def test_disconnect_removes_credential(client, db):
    expiry = datetime.utcnow() + timedelta(hours=1)
    db.add(OAuthCredential(
        provider="google",
        account_email="felipe@example.com",
        access_token_encrypted=encrypt("a"),
        refresh_token_encrypted=encrypt("r"),
        token_expiry=expiry,
        scopes="[]",
    ))
    db.commit()

    with patch("services.google.oauth_service.httpx.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_client.__enter__.return_value = mock_client
        mock_client.__exit__.return_value = False
        mock_client.post.return_value = MagicMock(status_code=200)
        mock_client_cls.return_value = mock_client

        resp = client.post("/api/auth/google/disconnect")

    assert resp.status_code == 200
    assert resp.json() == {"ok": True}
    assert db.query(OAuthCredential).count() == 0


def test_google_test_when_disconnected_returns_401(client):
    resp = client.get("/api/google/test")
    assert resp.status_code == 401
    body = resp.json()
    assert body["ok"] is False
    assert "nao conectado" in body["error"].lower()
