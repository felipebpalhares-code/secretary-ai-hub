"""Sprint D — testes do módulo Contatos. Sem scheduler real, sem rede."""
from __future__ import annotations
import pytest
from sqlalchemy import text

from models.contact import Contact, Category, Tag
from services.contact_service import seed_default_categories


def _wipe(db):
    # Ordem importa: limpa associação primeiro (SQLite local não roda PRAGMA
    # foreign_keys=ON, então a cascade do schema não dispara).
    db.execute(text("DELETE FROM contact_tags"))
    db.query(Contact).delete()
    db.query(Tag).delete()
    db.query(Category).delete()
    db.commit()
    db.expire_all()


@pytest.fixture(autouse=True)
def _clean_contacts_state(db):
    """Cada teste começa com tabelas limpas + 4 categorias default re-semeadas."""
    _wipe(db)
    seed_default_categories(db)
    yield
    _wipe(db)


def _post_contact(client, payload):
    return client.post("/api/contacts", json=payload)


# ── 1. Só nome ──────────────────────────────────────────────────────
def test_create_contact_with_only_name_returns_201(client):
    r = _post_contact(client, {"name": "Felipe"})
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["name"] == "Felipe"
    assert body["email"] is None
    assert body["phone"] is None


# ── 2. Só email ─────────────────────────────────────────────────────
def test_create_contact_with_only_email_returns_201(client):
    r = _post_contact(client, {"email": "x@y.com"})
    assert r.status_code == 201, r.text
    assert r.json()["email"] == "x@y.com"


# ── 3. Só telefone ─────────────────────────────────────────────────
def test_create_contact_with_only_phone_returns_201(client):
    r = _post_contact(client, {"phone": "11999998888"})
    assert r.status_code == 201, r.text
    assert r.json()["phone"] == "11999998888"


# ── 4. Os 3 vazios → 422 ───────────────────────────────────────────
def test_create_contact_all_blank_returns_422(client):
    r = _post_contact(client, {"name": "  ", "email": None, "phone": ""})
    assert r.status_code == 422
    detail = r.json().get("detail", [])
    msg = " ".join(str(d.get("msg", "")) for d in detail) if isinstance(detail, list) else str(detail)
    assert "Informe ao menos nome, e-mail ou telefone" in msg


# ── 5. Email inválido → 422 ────────────────────────────────────────
def test_create_contact_invalid_email_returns_422(client):
    r = _post_contact(client, {"name": "X", "email": "not-an-email"})
    assert r.status_code == 422


# ── 6. List filtra deleted_at IS NULL ──────────────────────────────
def test_list_returns_only_non_deleted(client):
    a = _post_contact(client, {"name": "Alice"}).json()
    _post_contact(client, {"name": "Bob"})
    client.delete(f"/api/contacts/{a['id']}")

    r = client.get("/api/contacts")
    assert r.status_code == 200
    names = [c["name"] for c in r.json()]
    assert "Bob" in names
    assert "Alice" not in names


# ── 7. DELETE seta deleted_at ──────────────────────────────────────
def test_delete_sets_deleted_at(client, db):
    c = _post_contact(client, {"name": "Carlos"}).json()
    r = client.delete(f"/api/contacts/{c['id']}")
    assert r.status_code == 200
    assert r.json() == {"ok": True}
    row = db.query(Contact).filter(Contact.id == c["id"]).first()
    assert row.deleted_at is not None
    assert client.get(f"/api/contacts/{c['id']}").status_code == 404


# ── 8. Tag duplicada (case-insensitive) reaproveita id ─────────────
def test_tag_dedup_case_insensitive(client, db):
    c1 = _post_contact(client, {"name": "C1", "tags": ["Amigo"]}).json()
    c2 = _post_contact(client, {"name": "C2", "tags": ["amigo"]}).json()

    tag_ids_c1 = {t["id"] for t in c1["tags"]}
    tag_ids_c2 = {t["id"] for t in c2["tags"]}
    assert tag_ids_c1 == tag_ids_c2
    assert db.query(Tag).filter(Tag.name == "amigo").count() == 1


# ── 9. Auto-complete de tag por prefixo ────────────────────────────
def test_tags_search_by_prefix(client):
    _post_contact(client, {"name": "X", "tags": ["amigo", "amizade", "trabalho"]})
    r = client.get("/api/contacts/tags?q=ami")
    assert r.status_code == 200
    names = [t["name"] for t in r.json()]
    assert "amigo" in names
    assert "amizade" in names
    assert "trabalho" not in names


# ── 10. Excluir categoria default → 400 ───────────────────────────
def test_delete_default_category_returns_400(client, db):
    default = db.query(Category).filter(Category.is_default.is_(True)).first()
    r = client.delete(f"/api/contacts/categories/{default.id}")
    assert r.status_code == 400
    assert "padrão" in r.json()["detail"].lower()
