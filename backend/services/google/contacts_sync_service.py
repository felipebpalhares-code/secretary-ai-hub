"""
Sprint G — sincronização Google Contacts → hub (pull-only).

Estratégia de match (em ordem):
  1. external_id == Google resourceName  → atualiza
  2. email exato (case-insensitive)       → atualiza + grava resourceName
  3. phone normalizado (últimos 8 dígitos) → atualiza + grava resourceName
  4. cria novo (com tag "google")

Em conflito de campos, Google ganha em name/email/phone/birthday.
Notes do hub são SEMPRE preservadas. Tags são merged (não substituídas).
"""
from __future__ import annotations
import json
import logging
import re
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any, Optional

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.contact import Contact, GoogleSyncState, Tag
from services.contact_service import _resolve_tags
from services.google.oauth_service import get_credentials

log = logging.getLogger(__name__)

GOOGLE_TAG = "google"


# ───────── DTO + report ─────────

@dataclass
class GoogleContact:
    resource_name: str
    name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    birthday: Optional[date]
    photo_url: Optional[str]


@dataclass
class SyncReport:
    started_at: datetime
    finished_at: datetime
    count_imported: int = 0
    count_updated: int = 0
    count_skipped: int = 0
    errors: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "started_at": self.started_at.isoformat(),
            "finished_at": self.finished_at.isoformat(),
            "count_imported": self.count_imported,
            "count_updated": self.count_updated,
            "count_skipped": self.count_skipped,
            "errors": list(self.errors),
        }


# ───────── helpers ─────────

def _normalize_phone(raw: Optional[str]) -> Optional[str]:
    """Últimos 8 dígitos — pragmático pra evitar duplicatas com/sem +DDI."""
    if not raw:
        return None
    digits = re.sub(r"\D", "", raw)
    if len(digits) < 4:
        return None
    return digits[-8:]


def _parse_birthday(raw: Optional[dict[str, Any]]) -> Optional[date]:
    """Aceita {date: {year?, month, day}}. Sem mês/dia → None. Sem ano → ano atual."""
    if not isinstance(raw, dict):
        return None
    d = raw.get("date") or {}
    month = d.get("month")
    day = d.get("day")
    if not month or not day:
        return None
    year = d.get("year") or datetime.utcnow().year
    try:
        return date(int(year), int(month), int(day))
    except (TypeError, ValueError):
        return None


def _from_google_person(person: dict[str, Any]) -> Optional[GoogleContact]:
    rn = person.get("resourceName")
    if not rn:
        return None

    names = person.get("names") or []
    name = (names[0].get("displayName") if names else None) or None

    emails = person.get("emailAddresses") or []
    email = (emails[0].get("value") if emails else None) or None

    phones = person.get("phoneNumbers") or []
    phone_raw = (phones[0].get("value") if phones else None) or None

    bdays = person.get("birthdays") or []
    birthday = _parse_birthday(bdays[0]) if bdays else None

    photos = person.get("photos") or []
    photo_url = (photos[0].get("url") if photos else None) or None

    if not (name or email or phone_raw):
        return None

    return GoogleContact(
        resource_name=rn,
        name=name,
        email=email,
        phone=phone_raw,
        birthday=birthday,
        photo_url=photo_url,
    )


# ───────── Google fetch ─────────

PERSON_FIELDS = "names,emailAddresses,phoneNumbers,birthdays,photos,metadata"


def fetch_all_google_contacts(db: Session) -> list[GoogleContact]:
    """Pagina por todas as connections do user e devolve DTOs limpos."""
    creds = get_credentials(db)
    service = build("people", "v1", credentials=creds, cache_discovery=False)

    out: list[GoogleContact] = []
    page_token: Optional[str] = None
    while True:
        req = service.people().connections().list(
            resourceName="people/me",
            pageSize=200,
            personFields=PERSON_FIELDS,
            pageToken=page_token,
        )
        resp = req.execute()
        for p in resp.get("connections") or []:
            dto = _from_google_person(p)
            if dto is not None:
                out.append(dto)
        page_token = resp.get("nextPageToken")
        if not page_token:
            break
    return out


# ───────── Sync ─────────

def _find_existing(db: Session, g: GoogleContact) -> Optional[Contact]:
    # 1. external_id
    c = (
        db.query(Contact)
        .filter(Contact.external_id == g.resource_name, Contact.deleted_at.is_(None))
        .first()
    )
    if c:
        return c

    # 2. email exato (case-insensitive)
    if g.email:
        c = (
            db.query(Contact)
            .filter(func.lower(Contact.email) == g.email.lower(), Contact.deleted_at.is_(None))
            .first()
        )
        if c:
            return c

    # 3. phone normalizado (últimos 8 dígitos)
    norm = _normalize_phone(g.phone)
    if norm:
        # Como guardamos o phone formatado original em Contact.phone, comparamos
        # via normalização in-memory dos candidatos com o mesmo prefixo (último dígito).
        candidates = (
            db.query(Contact)
            .filter(Contact.phone.like(f"%{norm[-4:]}"), Contact.deleted_at.is_(None))
            .all()
        )
        for cand in candidates:
            if _normalize_phone(cand.phone) == norm:
                return cand
    return None


def _apply_google_to_contact(c: Contact, g: GoogleContact) -> None:
    # Google ganha em name/email/phone/birthday/photo
    if g.name:
        c.name = g.name
    if g.email:
        c.email = g.email
    if g.phone:
        c.phone = g.phone
    if g.birthday:
        c.birthday = g.birthday
    if g.photo_url:
        c.photo_url = g.photo_url
    c.external_source = "google"
    c.external_id = g.resource_name


def _ensure_google_tag(db: Session, contact: Contact) -> None:
    has_google = any(t.name == GOOGLE_TAG for t in (contact.tags or []))
    if not has_google:
        contact.tags = list(contact.tags or []) + _resolve_tags(db, [GOOGLE_TAG])


def sync_google_contacts(db: Session) -> SyncReport:
    """Executa a sync inteira. Atualiza GoogleSyncState ao final."""
    started_at = datetime.utcnow()
    report = SyncReport(started_at=started_at, finished_at=started_at)

    try:
        google_contacts = fetch_all_google_contacts(db)
    except HttpError as e:
        log.exception("Google People API falhou")
        report.errors.append(f"People API: {e}")
        report.finished_at = datetime.utcnow()
        _save_state(db, report)
        raise RuntimeError(f"Falha consultando Google People: {e}") from e

    for g in google_contacts:
        try:
            existing = _find_existing(db, g)
            if existing is None:
                new_c = Contact(
                    name=g.name,
                    email=g.email,
                    phone=g.phone,
                    birthday=g.birthday,
                    photo_url=g.photo_url,
                    external_source="google",
                    external_id=g.resource_name,
                )
                new_c.tags = _resolve_tags(db, [GOOGLE_TAG])
                db.add(new_c)
                db.flush()
                report.count_imported += 1
            else:
                _apply_google_to_contact(existing, g)
                _ensure_google_tag(db, existing)
                report.count_updated += 1
        except Exception as e:
            db.rollback()
            log.warning("Skip contato %s: %s", g.resource_name, e)
            report.count_skipped += 1
            report.errors.append(f"{g.resource_name}: {e}")
            continue

    db.commit()
    report.finished_at = datetime.utcnow()
    _save_state(db, report)
    return report


def _save_state(db: Session, report: SyncReport) -> None:
    row = db.query(GoogleSyncState).filter(GoogleSyncState.id == 1).first()
    if row is None:
        row = GoogleSyncState(id=1)
        db.add(row)
    row.last_sync_at = report.finished_at
    row.last_report_json = json.dumps(report.to_dict(), ensure_ascii=False)
    db.commit()


def get_sync_state(db: Session) -> dict[str, Any]:
    row = db.query(GoogleSyncState).filter(GoogleSyncState.id == 1).first()
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
