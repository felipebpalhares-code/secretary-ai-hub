"""Sprint G — endpoints de sincronização Google Contacts → hub (módulo contatos)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.dependencies import require_permission
from models.user import User
from services.database import get_session
from services.google import contacts_sync_service as svc

router = APIRouter(prefix="/api/google/contacts", tags=["google-contacts"])

PERM_VER    = Depends(require_permission("contatos", "ver"))
PERM_EDITAR = Depends(require_permission("contatos", "editar"))


@router.post("/sync")
def sync_now(_: User = PERM_EDITAR, db: Session = Depends(get_session)):
    try:
        report = svc.sync_google_contacts(db)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"ok": True, "report": report.to_dict()}


@router.get("/sync-status")
def sync_status(_: User = PERM_VER, db: Session = Depends(get_session)):
    return svc.get_sync_state(db)
