"""Sprint H — endpoints de sync de aniversários."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from services.database import get_session
from services.google import calendar_service as svc

router = APIRouter(prefix="/api/google/calendar", tags=["google-calendar"])


@router.post("/sync-birthdays")
def sync_birthdays(db: Session = Depends(get_session)):
    try:
        report = svc.sync_birthdays(db)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"ok": True, "report": report.to_dict()}


@router.get("/sync-birthdays/status")
def status(db: Session = Depends(get_session)):
    return svc.get_birthday_sync_state(db)
