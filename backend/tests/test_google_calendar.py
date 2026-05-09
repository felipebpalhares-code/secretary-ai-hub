"""Sprint H — sync de aniversários. Tudo mockado, sem rede."""
from __future__ import annotations
from datetime import date

import pytest
from sqlalchemy import text

from models.contact import Contact, GoogleSyncState
from services.google import calendar_service as svc


def _wipe(db):
    db.execute(text("DELETE FROM contact_tags"))
    db.query(Contact).delete()
    db.query(GoogleSyncState).delete()
    db.commit()
    db.expire_all()


@pytest.fixture(autouse=True)
def _clean(db):
    _wipe(db)
    yield
    _wipe(db)


@pytest.fixture
def calendar_recorder(monkeypatch):
    """
    Substitui os helpers de Calendar API por mocks que registram chamadas.
    Retorna o recorder pra os testes inspecionarem.
    """
    state = {
        "calendar_id": None,         # set pelo ensure_birthday_calendar
        "existing": {},              # contact_id -> event_id (configurável)
        "inserts": [],               # lista de bodies
        "updates": [],               # lista de (event_id, body)
        "create_called": False,
    }

    def fake_build(_db):
        return object()

    def fake_find(_service):
        return state["calendar_id"]

    def fake_create(_service):
        state["create_called"] = True
        state["calendar_id"] = "cal-fixture-1"
        return state["calendar_id"]

    def fake_existing(_service, _cal_id):
        return dict(state["existing"])

    def fake_insert(_service, _cal_id, body):
        state["inserts"].append(body)

    def fake_update(_service, _cal_id, event_id, body):
        state["updates"].append((event_id, body))

    monkeypatch.setattr(svc, "_build_service", fake_build)
    monkeypatch.setattr(svc, "_find_birthday_calendar", fake_find)
    monkeypatch.setattr(svc, "_create_birthday_calendar", fake_create)
    monkeypatch.setattr(svc, "_existing_events", fake_existing)
    monkeypatch.setattr(svc, "_insert_event", fake_insert)
    monkeypatch.setattr(svc, "_update_event", fake_update)

    return state


# ── 1. Cria calendar quando não existe + 2 eventos pra 2 contatos ──
def test_creates_calendar_and_events(client, db, calendar_recorder):
    db.add_all([
        Contact(name="Felipe", birthday=date(1985, 6, 15)),
        Contact(name="Mateus", birthday=date(2013, 3, 4)),
        Contact(name="Sem birthday"),  # ignorado
    ])
    db.commit()

    r = client.post("/api/google/calendar/sync-birthdays")
    assert r.status_code == 200, r.text
    rep = r.json()["report"]
    assert rep["created"] == 2
    assert rep["updated"] == 0
    assert rep["total_contacts"] == 2
    assert rep["calendar_id"] == "cal-fixture-1"

    assert calendar_recorder["create_called"] is True
    assert len(calendar_recorder["inserts"]) == 2

    # Cada evento tem extendedProperties.private.contact_id setado e RRULE anual
    for body in calendar_recorder["inserts"]:
        priv = body["extendedProperties"]["private"]
        assert priv["hub_kind"] == "birthday"
        assert priv["contact_id"]
        assert "RRULE:FREQ=YEARLY" in body["recurrence"]
        # Lembrete 1 dia antes
        overrides = body["reminders"]["overrides"]
        assert any(o["method"] == "popup" and o["minutes"] == 24 * 60 for o in overrides)


# ── 2. Re-rodar atualiza sem duplicar ──────────────────────────────
def test_rerun_updates_no_duplicates(client, db, calendar_recorder):
    c1 = Contact(name="Felipe", birthday=date(1985, 6, 15))
    c2 = Contact(name="Mateus", birthday=date(2013, 3, 4))
    db.add_all([c1, c2]); db.commit()

    # Calendar já existe, eventos já existem mapeados por contact_id
    calendar_recorder["calendar_id"] = "cal-old"
    calendar_recorder["existing"] = {c1.id: "ev-felipe", c2.id: "ev-mateus"}

    r = client.post("/api/google/calendar/sync-birthdays")
    assert r.status_code == 200
    rep = r.json()["report"]
    assert rep["created"] == 0
    assert rep["updated"] == 2
    assert rep["calendar_id"] == "cal-old"

    assert calendar_recorder["create_called"] is False
    assert len(calendar_recorder["inserts"]) == 0
    assert {ev_id for ev_id, _ in calendar_recorder["updates"]} == {"ev-felipe", "ev-mateus"}


# ── 3. Contatos sem birthday são ignorados ─────────────────────────
def test_ignores_contacts_without_birthday(client, db, calendar_recorder):
    db.add_all([
        Contact(name="Sem aniversário 1"),
        Contact(name="Sem aniversário 2", email="x@y.com"),
    ])
    db.commit()

    r = client.post("/api/google/calendar/sync-birthdays")
    assert r.status_code == 200
    rep = r.json()["report"]
    assert (rep["created"], rep["updated"], rep["total_contacts"]) == (0, 0, 0)
    assert calendar_recorder["inserts"] == []
    assert calendar_recorder["updates"] == []
