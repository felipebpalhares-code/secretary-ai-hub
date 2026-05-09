"""
Sprint H — sincronização de aniversários dos contatos com o Google Calendar.

Cria (uma vez) o calendar "Aniversários · Felipe Hub", e pra cada Contact
com birthday preenchido cria/atualiza um evento anual com lembrete.

Idempotência: cada evento carrega
    extendedProperties.private.contact_id = "<id-do-contato>"
    extendedProperties.private.hub_kind   = "birthday"
Re-rodar a sync casa eventos existentes pelo contact_id e atualiza
em vez de duplicar.
"""
from __future__ import annotations
import json
import logging
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Any, Optional

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from sqlalchemy.orm import Session

from models.contact import Contact, GoogleSyncState
from services.google.oauth_service import get_credentials

log = logging.getLogger(__name__)

BIRTHDAY_CALENDAR_SUMMARY = "Aniversários · Felipe Hub"
HUB_KIND_VALUE = "birthday"
SYNC_STATE_ID = 2  # singleton separado do contacts sync (id=1)


@dataclass
class BirthdaySyncReport:
    started_at: datetime
    finished_at: datetime
    calendar_id: str
    created: int
    updated: int
    total_contacts: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "started_at": self.started_at.isoformat(),
            "finished_at": self.finished_at.isoformat(),
            "calendar_id": self.calendar_id,
            "created": self.created,
            "updated": self.updated,
            "total_contacts": self.total_contacts,
        }


# ───────── helpers (testáveis via monkeypatch) ─────────

def _build_service(db: Session) -> Any:
    creds = get_credentials(db)
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def _find_birthday_calendar(service: Any) -> Optional[str]:
    page_token: Optional[str] = None
    while True:
        resp = service.calendarList().list(pageToken=page_token).execute()
        for c in resp.get("items") or []:
            if c.get("summary") == BIRTHDAY_CALENDAR_SUMMARY:
                return c.get("id")
        page_token = resp.get("nextPageToken")
        if not page_token:
            return None


def _create_birthday_calendar(service: Any) -> str:
    body = {"summary": BIRTHDAY_CALENDAR_SUMMARY, "timeZone": "America/Sao_Paulo"}
    return service.calendars().insert(body=body).execute()["id"]


def ensure_birthday_calendar(service: Any) -> str:
    return _find_birthday_calendar(service) or _create_birthday_calendar(service)


def _existing_events(service: Any, calendar_id: str) -> dict[int, str]:
    """Mapeia contact_id (extendedProperties.private) → eventId."""
    out: dict[int, str] = {}
    page_token: Optional[str] = None
    while True:
        resp = service.events().list(
            calendarId=calendar_id,
            privateExtendedProperty=f"hub_kind={HUB_KIND_VALUE}",
            pageToken=page_token,
        ).execute()
        for ev in resp.get("items") or []:
            ext = (ev.get("extendedProperties") or {}).get("private") or {}
            raw = ext.get("contact_id")
            if raw is None:
                continue
            try:
                out[int(raw)] = ev["id"]
            except (TypeError, ValueError):
                continue
        page_token = resp.get("nextPageToken")
        if not page_token:
            break
    return out


def _display_label(c: Contact) -> str:
    return c.name or c.email or c.phone or f"contato #{c.id}"


def _build_event_body(c: Contact) -> dict[str, Any]:
    bday: date = c.birthday  # type: ignore[assignment]
    end_day = bday + timedelta(days=1)
    return {
        "summary": f"🎂 Aniversário de {_display_label(c)}",
        "start": {"date": bday.isoformat()},
        "end": {"date": end_day.isoformat()},
        "recurrence": ["RRULE:FREQ=YEARLY"],
        "reminders": {
            "useDefault": False,
            "overrides": [{"method": "popup", "minutes": 24 * 60}],
        },
        "extendedProperties": {
            "private": {
                "hub_kind": HUB_KIND_VALUE,
                "contact_id": str(c.id),
            }
        },
    }


def _insert_event(service: Any, calendar_id: str, body: dict[str, Any]) -> None:
    service.events().insert(calendarId=calendar_id, body=body).execute()


def _update_event(service: Any, calendar_id: str, event_id: str, body: dict[str, Any]) -> None:
    service.events().update(calendarId=calendar_id, eventId=event_id, body=body).execute()


# ───────── orquestração ─────────

def sync_birthdays(db: Session) -> BirthdaySyncReport:
    started_at = datetime.utcnow()
    try:
        service = _build_service(db)
        calendar_id = ensure_birthday_calendar(service)
        existing = _existing_events(service, calendar_id)
    except HttpError as e:
        log.exception("Calendar API falhou")
        raise RuntimeError(f"Falha consultando Google Calendar: {e}") from e

    contacts = (
        db.query(Contact)
        .filter(Contact.deleted_at.is_(None))
        .filter(Contact.birthday.isnot(None))
        .all()
    )

    created = 0
    updated = 0
    for c in contacts:
        body = _build_event_body(c)
        try:
            if c.id in existing:
                _update_event(service, calendar_id, existing[c.id], body)
                updated += 1
            else:
                _insert_event(service, calendar_id, body)
                created += 1
        except HttpError as e:
            log.warning("Falha em contato %s: %s", c.id, e)
            continue

    finished_at = datetime.utcnow()
    report = BirthdaySyncReport(
        started_at=started_at,
        finished_at=finished_at,
        calendar_id=calendar_id,
        created=created,
        updated=updated,
        total_contacts=len(contacts),
    )
    _save_state(db, report)
    return report


def _save_state(db: Session, report: BirthdaySyncReport) -> None:
    row = db.query(GoogleSyncState).filter(GoogleSyncState.id == SYNC_STATE_ID).first()
    if row is None:
        row = GoogleSyncState(id=SYNC_STATE_ID)
        db.add(row)
    row.last_sync_at = report.finished_at
    row.last_report_json = json.dumps(report.to_dict(), ensure_ascii=False)
    db.commit()


def get_birthday_sync_state(db: Session) -> dict[str, Any]:
    row = db.query(GoogleSyncState).filter(GoogleSyncState.id == SYNC_STATE_ID).first()
    if row is None or row.last_sync_at is None:
        return {"last_sync_at": None, "last_report": None}
    try:
        last = json.loads(row.last_report_json) if row.last_report_json else None
    except json.JSONDecodeError:
        last = None
    return {
        "last_sync_at": row.last_sync_at.isoformat(),
        "last_report": last,
    }
