"""Sprint G — sync Google Contacts. Tudo mockado, sem rede."""
from __future__ import annotations
import pytest
from sqlalchemy import text

from models.contact import Contact, Tag, GoogleSyncState
from services.google import contacts_sync_service as svc
from services.google.contacts_sync_service import GoogleContact


def _wipe(db):
    db.execute(text("DELETE FROM contact_tags"))
    db.query(Contact).delete()
    db.query(Tag).delete()
    db.query(GoogleSyncState).delete()
    db.commit()
    db.expire_all()


@pytest.fixture(autouse=True)
def _clean(db):
    _wipe(db)
    yield
    _wipe(db)


def _stub_fetch(monkeypatch, contacts):
    monkeypatch.setattr(svc, "fetch_all_google_contacts", lambda _db: contacts)


# ── 1. Match por external_id atualiza ──────────────────────────────
def test_match_by_external_id_updates(client, db, monkeypatch):
    # Cria contato manual já com resourceName persistido
    existing = Contact(
        name="Felipe (versão antiga)",
        email="old@x.com",
        external_source="google",
        external_id="people/c-felipe",
        notes="anotação manual",
    )
    db.add(existing); db.commit()
    eid = existing.id

    _stub_fetch(monkeypatch, [GoogleContact(
        resource_name="people/c-felipe",
        name="Felipe Atualizado",
        email="new@x.com",
        phone=None, birthday=None, photo_url=None,
    )])

    r = client.post("/api/google/contacts/sync")
    assert r.status_code == 200, r.text
    rep = r.json()["report"]
    assert (rep["count_updated"], rep["count_imported"]) == (1, 0)

    db.expire_all()
    refreshed = db.query(Contact).filter(Contact.id == eid).first()
    assert refreshed.name == "Felipe Atualizado"
    assert refreshed.email == "new@x.com"
    assert refreshed.notes == "anotação manual"  # preservado


# ── 2. Match por email preserva notes ──────────────────────────────
def test_match_by_email_preserves_notes(client, db, monkeypatch):
    existing = Contact(name="Maria", email="MARIA@X.com", notes="vip")
    db.add(existing); db.commit()
    eid = existing.id

    _stub_fetch(monkeypatch, [GoogleContact(
        resource_name="people/c-maria",
        name="Maria Silva",
        email="maria@x.com",  # mesmo email, casing diferente
        phone="11988887777", birthday=None, photo_url=None,
    )])

    client.post("/api/google/contacts/sync")
    db.expire_all()
    r = db.query(Contact).filter(Contact.id == eid).first()
    assert r.name == "Maria Silva"
    assert r.email == "maria@x.com"
    assert r.notes == "vip"
    assert r.external_id == "people/c-maria"
    assert r.external_source == "google"


# ── 3. Match por phone normalizado ─────────────────────────────────
def test_match_by_phone_normalized(client, db, monkeypatch):
    existing = Contact(name="João", phone="(11) 99999-8888")
    db.add(existing); db.commit()
    eid = existing.id

    _stub_fetch(monkeypatch, [GoogleContact(
        resource_name="people/c-joao",
        name="João Pereira",
        email=None,
        phone="+55 11 99999-8888",  # mesmo número com DDI internacional
        birthday=None, photo_url=None,
    )])

    client.post("/api/google/contacts/sync")
    db.expire_all()
    r = db.query(Contact).filter(Contact.id == eid).first()
    assert r.name == "João Pereira"
    assert r.external_id == "people/c-joao"


# ── 4. Sem match → cria novo com tag google ────────────────────────
def test_creates_with_google_tag(client, db, monkeypatch):
    _stub_fetch(monkeypatch, [GoogleContact(
        resource_name="people/c-novo",
        name="Novo Contato",
        email="novo@x.com",
        phone="11999990000", birthday=None, photo_url=None,
    )])

    client.post("/api/google/contacts/sync")
    db.expire_all()
    rows = db.query(Contact).all()
    assert len(rows) == 1
    new = rows[0]
    assert new.external_source == "google"
    assert new.external_id == "people/c-novo"
    tag_names = [t.name for t in new.tags]
    assert "google" in tag_names


# ── 5. Sync vazio não quebra ───────────────────────────────────────
def test_empty_sync_ok(client, db, monkeypatch):
    _stub_fetch(monkeypatch, [])
    r = client.post("/api/google/contacts/sync")
    assert r.status_code == 200
    rep = r.json()["report"]
    assert rep["count_imported"] == 0
    assert rep["count_updated"] == 0
    assert rep["count_skipped"] == 0

    status = client.get("/api/google/contacts/sync-status").json()
    assert status["last_sync_at"] is not None
    assert status["last_report"] is not None


# ── 6. People API erro 401 → 500 com mensagem clara ───────────────
def test_people_api_error_returns_500(client, monkeypatch):
    from googleapiclient.errors import HttpError

    class _Resp:
        status = 401
        reason = "Unauthorized"

    def _explode(_db):
        raise HttpError(resp=_Resp(), content=b'{"error":"unauthorized"}')

    monkeypatch.setattr(svc, "fetch_all_google_contacts", _explode)

    r = client.post("/api/google/contacts/sync")
    assert r.status_code == 500
    assert "Google People" in r.json()["detail"]
