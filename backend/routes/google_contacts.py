"""Sprint G — endpoints de sincronização Google Contacts → hub."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from services.database import get_session
from services.google import contacts_sync_service as svc

router = APIRouter(prefix="/api/google/contacts", tags=["google-contacts"])


@router.post("/sync")
def sync_now(db: Session = Depends(get_session)):
    try:
        report = svc.sync_google_contacts(db)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"ok": True, "report": report.to_dict()}


@router.get("/sync-status")
def sync_status(db: Session = Depends(get_session)):
    return svc.get_sync_state(db)
