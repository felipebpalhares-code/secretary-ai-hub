"""
Sprint H — testes de permissão granular (require_permission / require_role).
"""
from __future__ import annotations

from models.user import (
    DEFAULT_ASSISTANT_PERMISSIONS,
    User,
    UserRole,
    has_permission,
)


# ───────── Unit: has_permission ─────────

def test_admin_has_permission_for_anything():
    admin = User(role=UserRole.ADMIN, is_active=True, permissions={})
    assert has_permission(admin, "contatos", "ver")
    assert has_permission(admin, "qualquer-coisa-mesmo", "deletar")
    assert has_permission(admin, "configuracoes", "ver")


def test_inactive_user_never_passes():
    user = User(role=UserRole.ADMIN, is_active=False, permissions={})
    assert not has_permission(user, "contatos", "ver")


def test_assistant_with_explicit_true_passes():
    perms = {**DEFAULT_ASSISTANT_PERMISSIONS, "contatos": {"ver": True, "criar": True, "editar": False, "deletar": False}}
    a = User(role=UserRole.ASSISTANT, is_active=True, permissions=perms)
    assert has_permission(a, "contatos", "ver")
    assert has_permission(a, "contatos", "criar")
    assert not has_permission(a, "contatos", "editar")


def test_assistant_admin_only_modules_always_false():
    perms = {"configuracoes": {"ver": True}, "usuarios": {"ver": True}}
    a = User(role=UserRole.ASSISTANT, is_active=True, permissions=perms)
    assert not has_permission(a, "configuracoes", "ver")
    assert not has_permission(a, "usuarios", "ver")


def test_assistant_unknown_module_denied():
    a = User(role=UserRole.ASSISTANT, is_active=True, permissions={})
    assert not has_permission(a, "modulo-que-nao-existe", "ver")


# ───────── Integração HTTP ─────────

def test_assistant_with_only_ver_can_list_contacts(assistant_factory, client):
    # Garante que existe pelo menos um contato (criado pelo admin)
    client.post(
        "/api/contacts",
        json={"name": "Felipe Test Permissão", "email": "ft@example.com"},
    )
    c = assistant_factory({"contatos": {"ver": True}})
    r = c.get("/api/contacts")
    assert r.status_code == 200
    assert any(item["name"] == "Felipe Test Permissão" for item in r.json())


def test_assistant_without_ver_gets_403_listing(assistant_factory):
    c = assistant_factory({"contatos": {"ver": False}})
    assert c.get("/api/contacts").status_code == 403


def test_assistant_can_view_but_not_create_contacts(assistant_factory):
    c = assistant_factory({"contatos": {"ver": True, "criar": False}})
    r = c.post("/api/contacts", json={"name": "X", "email": "x@example.com"})
    assert r.status_code == 403


def test_assistant_with_criar_can_post_contact(assistant_factory):
    c = assistant_factory({"contatos": {"ver": True, "criar": True}})
    r = c.post("/api/contacts", json={"name": "Y", "email": "y@example.com"})
    assert r.status_code == 201


def test_admin_only_endpoint_blocks_assistant(assistant_factory):
    """connections/logs é admin-only."""
    c = assistant_factory({"contatos": {"ver": True}})
    r = c.get("/api/connections/logs")
    assert r.status_code == 403


def test_users_endpoint_blocks_assistant_with_usuarios_true(assistant_factory):
    """ASSISTANT mesmo com usuarios.ver=true não acessa /api/users (admin-only)."""
    c = assistant_factory({"usuarios": {"ver": True}})
    r = c.get("/api/users")
    assert r.status_code == 403


def test_unauth_endpoint_returns_401(unauth_client):
    """Sem cookie, qualquer endpoint protegido retorna 401."""
    r = unauth_client.get("/api/contacts")
    assert r.status_code == 401
