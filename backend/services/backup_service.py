"""
Backup diário do módulo Contatos.

Estratégia: dump JSON simples (não SQL). Roda no APScheduler já existente
(services.scheduler) com cron diário às 03:00 + cleanup às 03:05.

Localização do arquivo: /data/backups/contacts/YYYY-MM-DD.json
(sub-bind no docker-compose pra ficar visível no host em ./data/backups/contacts).
"""
from __future__ import annotations
import json
import logging
import os
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

from models.contact import Contact, Category, Tag
from services.database import SessionLocal

log = logging.getLogger(__name__)

BACKUP_ROOT = Path(os.getenv("CONTACTS_BACKUP_DIR", "/data/backups/contacts"))
RETENTION_DAYS = 30


def _serialize_value(v: Any) -> Any:
    if isinstance(v, (datetime, date)):
        return v.isoformat()
    return v


def _row_to_dict(row: Any) -> dict:
    return {c.name: _serialize_value(getattr(row, c.name)) for c in row.__table__.columns}


def _dump(db: Session) -> dict:
    contacts = db.query(Contact).all()  # inclui soft-deleted (deleted_at)
    categories = db.query(Category).all()
    tags = db.query(Tag).all()
    contact_tags = db.execute(text("SELECT contact_id, tag_id FROM contact_tags")).fetchall()

    return {
        "exported_at": datetime.utcnow().isoformat() + "Z",
        "schema_version": 1,
        "categories":   [_row_to_dict(c) for c in categories],
        "tags":         [_row_to_dict(t) for t in tags],
        "contacts":     [_row_to_dict(c) for c in contacts],
        "contact_tags": [{"contact_id": r[0], "tag_id": r[1]} for r in contact_tags],
    }


def run_backup() -> Path:
    """Gera o arquivo JSON do dia e devolve o Path. Sobrescreve se já existir."""
    BACKUP_ROOT.mkdir(parents=True, exist_ok=True)
    out = BACKUP_ROOT / f"{date.today().isoformat()}.json"
    try:
        with SessionLocal() as db:
            payload = _dump(db)
        with out.open("w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
        log.info(
            "Backup OK em %s (contatos=%d, categorias=%d, tags=%d)",
            out, len(payload["contacts"]), len(payload["categories"]), len(payload["tags"]),
        )
        return out
    except Exception as e:
        log.exception("Backup falhou: %s", e)
        raise


def cleanup_old_backups(retention_days: int = RETENTION_DAYS) -> int:
    """Apaga arquivos com mtime > retention_days. Retorna quantos removeu."""
    if not BACKUP_ROOT.exists():
        return 0
    cutoff = datetime.utcnow() - timedelta(days=retention_days)
    removed = 0
    for f in BACKUP_ROOT.iterdir():
        if not f.is_file():
            continue
        if datetime.utcfromtimestamp(f.stat().st_mtime) < cutoff:
            try:
                f.unlink()
                removed += 1
            except OSError as e:
                log.warning("Falhou ao remover %s: %s", f, e)
    if removed:
        log.info("Cleanup de backups antigos: removidos=%d", removed)
    return removed
