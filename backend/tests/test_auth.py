"""
Sprint H — testes do fluxo de autenticação (/api/auth/*).

Usa o fixture `unauth_client` quando precisa simular não autenticado, e
o fixture `client` (admin logado) ou `assistant_factory` quando precisa
de uma sessão válida.
"""
from __future__ import annotations
import pytest

from services.database import SessionLocal
from services.user_service import (
    create_user,
    get_user_by_email,
)
from models.user import UserRole
from core.security import COOKIE_NAME


# ───────── helpers ─────────

def _make_admin(email: str, password: str = "AdminPass123!Strong"):
    with SessionLocal() as db:
        if not get_user_by_email(db, email):
            create_user(
                db,
                email=email,
                name="Admin Auth",
                role=UserRole.ADMIN,
                raw_password=password,
                must_change_password=False,
            )
    return email, password


# ───────── /api/auth/login ─────────

def test_login_with_valid_credentials_sets_cookie(unauth_client):
    email, pwd = _make_admin("login-valid@example.com")
    r = unauth_client.post("/api/auth/login", json={"email": email, "password": pwd})
    assert r.status_code == 200
    body = r.json()
    assert body["user"]["email"] == email
    assert body["user"]["role"] == "ADMIN"
    # Cookie httpOnly setado
    assert COOKIE_NAME in unauth_client.cookies


def test_login_with_unknown_email_returns_401(unauth_client):
    r = unauth_client.post(
        "/api/auth/login",
        json={"email": "ninguem@example.com", "password": "qualquer-senha-12345"},
    )
    assert r.status_code == 401
    assert r.json()["detail"] == "Credenciais inválidas"


def test_login_with_wrong_password_returns_401(unauth_client):
    email, _ = _make_admin("login-wrongpwd@example.com")
    r = unauth_client.post(
        "/api/auth/login",
        json={"email": email, "password": "senha-errada-12345"},
    )
    assert r.status_code == 401


def test_login_with_inactive_user_returns_401(unauth_client):
    email, pwd = _make_admin("login-inactive@example.com")
    with SessionLocal() as db:
        user = get_user_by_email(db, email)
        # Cria um segundo admin ativo pra não bloquear soft_delete por "último admin"
        if not get_user_by_email(db, "guard-admin-1@example.com"):
            create_user(
                db,
                email="guard-admin-1@example.com",
                name="Guard",
                role=UserRole.ADMIN,
                raw_password="GuardPass123!",
                must_change_password=False,
            )
        user.is_active = False
        db.commit()
    r = unauth_client.post("/api/auth/login", json={"email": email, "password": pwd})
    assert r.status_code == 401


# ───────── /api/auth/me ─────────

def test_me_without_cookie_returns_401(unauth_client):
    r = unauth_client.get("/api/auth/me")
    assert r.status_code == 401


def test_me_with_valid_cookie_returns_user(client):
    r = client.get("/api/auth/me")
    assert r.status_code == 200
    assert r.json()["role"] == "ADMIN"


# ───────── /api/auth/logout ─────────

def test_logout_clears_cookie(client):
    # Antes do logout, /me passa
    assert client.get("/api/auth/me").status_code == 200
    r = client.post("/api/auth/logout")
    assert r.status_code == 204
    # Resposta do logout retorna Set-Cookie com max-age=0 (cookie limpado).
    # O TestClient (httpx) não respeita Max-Age=0 automaticamente, então
    # validamos via header e clearing explícito.
    set_cookie = (r.headers.get("set-cookie") or "").lower()
    assert COOKIE_NAME in set_cookie
    assert "max-age=0" in set_cookie
    client.cookies.clear()
    assert client.get("/api/auth/me").status_code == 401


# ───────── /api/auth/change-password ─────────

def test_change_password_with_wrong_current_returns_400(unauth_client):
    email, pwd = _make_admin("change-wrong@example.com")
    unauth_client.post("/api/auth/login", json={"email": email, "password": pwd})
    r = unauth_client.post(
        "/api/auth/change-password",
        json={"current_password": "errada", "new_password": "NovaSenhaForte-987"},
    )
    assert r.status_code == 400


def test_change_password_with_correct_current_succeeds(unauth_client):
    email, pwd = _make_admin("change-ok@example.com")
    unauth_client.post("/api/auth/login", json={"email": email, "password": pwd})
    new_pwd = "NovaSenhaForte-987-xyz"
    r = unauth_client.post(
        "/api/auth/change-password",
        json={"current_password": pwd, "new_password": new_pwd},
    )
    assert r.status_code == 204
    # Nova senha funciona
    r2 = unauth_client.post("/api/auth/login", json={"email": email, "password": new_pwd})
    assert r2.status_code == 200
