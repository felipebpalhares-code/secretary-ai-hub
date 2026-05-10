"""
Sprint H — testes de gestão de usuários (/api/users — admin-only).
"""
from __future__ import annotations

from services.database import SessionLocal
from services.user_service import create_user, get_user_by_email
from models.user import UserRole


# ───────── ADMIN-only access ─────────

def test_admin_can_list_users(client):
    r = client.get("/api/users")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_assistant_gets_403_listing_users(assistant_factory):
    c = assistant_factory({"contatos": {"ver": True}})
    r = c.get("/api/users")
    assert r.status_code == 403


# ───────── Create user ─────────

def test_admin_creates_user_and_receives_temporary_password(client):
    r = client.post(
        "/api/users",
        json={
            "email": "novo-assistant@example.com",
            "name": "Novo Assistente",
            "role": "ASSISTANT",
            "permissions": {"contatos": {"ver": True, "criar": True}},
        },
    )
    assert r.status_code == 201
    body = r.json()
    assert body["user"]["email"] == "novo-assistant@example.com"
    assert body["user"]["role"] == "ASSISTANT"
    # Senha temporária retornada uma única vez
    assert isinstance(body["temporary_password"], str)
    assert len(body["temporary_password"]) >= 12


def test_create_user_with_duplicate_email_returns_409(client):
    payload = {
        "email": "dup@example.com",
        "name": "Dup",
        "role": "ASSISTANT",
        "permissions": {},
    }
    r1 = client.post("/api/users", json=payload)
    assert r1.status_code == 201
    r2 = client.post("/api/users", json=payload)
    assert r2.status_code == 409


# ───────── Update permissions ─────────

def test_admin_edits_permissions_of_assistant(client):
    r = client.post(
        "/api/users",
        json={
            "email": "perm-edit@example.com",
            "name": "Perm Edit",
            "role": "ASSISTANT",
            "permissions": {},
        },
    )
    user_id = r.json()["user"]["id"]
    r2 = client.patch(
        f"/api/users/{user_id}",
        json={"permissions": {"empresas": {"ver": True}}},
    )
    assert r2.status_code == 200
    perms = r2.json()["permissions"]
    assert perms["empresas"]["ver"] is True


# ───────── Reset password ─────────

def test_admin_resets_user_password(client):
    r = client.post(
        "/api/users",
        json={"email": "reset-target@example.com", "name": "X", "role": "ASSISTANT", "permissions": {}},
    )
    user_id = r.json()["user"]["id"]
    r2 = client.post(f"/api/users/{user_id}/reset-password")
    assert r2.status_code == 200
    assert "temporary_password" in r2.json()


# ───────── Bloqueia desativar último admin ─────────

def test_cannot_deactivate_last_active_admin(client):
    """
    O fixture client cria test-admin@example.com como único admin ativo.
    Tentar desativá-lo deve falhar com 400.
    """
    # Garantir que test-admin é o único admin ativo
    with SessionLocal() as db:
        from models.user import User
        # Desativa qualquer outro admin que tenha vazado de outros testes
        others = (
            db.query(User)
            .filter(User.role == UserRole.ADMIN, User.email != "test-admin@example.com")
            .all()
        )
        for o in others:
            o.is_active = False
        db.commit()
        admin = get_user_by_email(db, "test-admin@example.com")
        admin_id = admin.id

    r = client.patch(f"/api/users/{admin_id}", json={"is_active": False})
    assert r.status_code == 400


# ───────── Soft delete ─────────

def test_soft_delete_sets_is_active_false(client):
    r = client.post(
        "/api/users",
        json={"email": "delete-me@example.com", "name": "Bye", "role": "ASSISTANT", "permissions": {}},
    )
    user_id = r.json()["user"]["id"]
    r2 = client.delete(f"/api/users/{user_id}")
    assert r2.status_code == 204
    # User segue na listagem mas inativo
    listing = client.get("/api/users").json()
    found = next(u for u in listing if u["id"] == user_id)
    assert found["is_active"] is False
