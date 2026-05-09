"""Sprint E — testes de Organization. Sem rede, sem BrasilAPI real."""
from __future__ import annotations
import pytest
from sqlalchemy import text

from models.contact import Contact, Organization


def _wipe(db):
    db.query(Contact).delete()
    db.query(Organization).delete()
    db.commit()
    db.expire_all()


@pytest.fixture(autouse=True)
def _clean_orgs(db):
    _wipe(db)
    yield
    _wipe(db)


# ── 1. POST sem CNPJ, só nome → 201 ─────────────────────────────────
def test_create_without_cnpj_returns_201(client):
    r = client.post("/api/organizations", json={"name": "PalharesTech"})
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["name"] == "PalharesTech"
    assert body["cnpj"] is None
    assert body["enriched_at"] is None


# ── 2. POST com CNPJ válido → 201 ───────────────────────────────────
def test_create_with_valid_cnpj_returns_201(client):
    r = client.post("/api/organizations", json={
        "name": "Distribuidora Braz",
        "cnpj": "12.345.678/0001-90",  # com pontuação — backend normaliza
    })
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["cnpj"] == "12345678000190"  # 14 dígitos limpos


# ── 3. POST com CNPJ malformado → 422 ──────────────────────────────
def test_create_with_short_cnpj_returns_422(client):
    r = client.post("/api/organizations", json={
        "name": "X",
        "cnpj": "12345678901",  # 11 dígitos (CPF)
    })
    assert r.status_code == 422
    detail = r.json().get("detail", [])
    msg = " ".join(str(d.get("msg", "")) for d in detail) if isinstance(detail, list) else str(detail)
    assert "14 dígitos" in msg


# ── 4. POST com CNPJ duplicado → 400 ───────────────────────────────
def test_create_duplicate_cnpj_returns_400(client):
    payload = {"name": "Empresa A", "cnpj": "11222333000144"}
    assert client.post("/api/organizations", json=payload).status_code == 201
    r = client.post("/api/organizations", json={"name": "Empresa B", "cnpj": "11.222.333/0001-44"})
    assert r.status_code == 400
    assert "cnpj" in r.json()["detail"].lower()


# ── 5. GET ?q=palh → autocomplete por prefixo ───────────────────────
def test_autocomplete_by_name_prefix(client):
    client.post("/api/organizations", json={"name": "PalharesTech"})
    client.post("/api/organizations", json={"name": "Palmares Solutions"})
    client.post("/api/organizations", json={"name": "Outra Empresa"})

    r = client.get("/api/organizations?q=palh")
    assert r.status_code == 200
    names = [o["name"] for o in r.json()]
    assert "PalharesTech" in names
    assert "Palmares Solutions" not in names  # "palh" não é prefixo de "palm"
    assert "Outra Empresa" not in names


# ── 6. PATCH troca nome → autocomplete acha pelo novo nome ─────────
def test_update_changes_autocomplete_target(client):
    created = client.post("/api/organizations", json={"name": "AcmeCo"}).json()
    client.patch(f"/api/organizations/{created['id']}", json={"name": "AcmeCorp"})

    r = client.get("/api/organizations?q=acmeco")
    names_old = [o["name"] for o in r.json()]
    assert "AcmeCo" not in names_old
    assert "AcmeCorp" in names_old  # "acmeco" é prefixo de "AcmeCorp"

    r2 = client.get("/api/organizations?q=acmecorp")
    assert r2.status_code == 200
    assert any(o["name"] == "AcmeCorp" for o in r2.json())


# ── 7. DELETE Organization vinculada → Contact.organization_id = null ─
def test_delete_org_unlinks_contacts(client, db):
    org = client.post("/api/organizations", json={"name": "Vinculada"}).json()
    c1 = client.post("/api/contacts", json={"name": "Felipe", "organization_id": org["id"]}).json()

    assert c1["organization_id"] == org["id"]
    assert c1["organization"]["name"] == "Vinculada"

    assert client.delete(f"/api/organizations/{org['id']}").status_code == 200
    assert db.query(Organization).filter(Organization.id == org["id"]).count() == 0

    refreshed = client.get(f"/api/contacts/{c1['id']}").json()
    assert refreshed["organization_id"] is None
    assert refreshed["organization"] is None
