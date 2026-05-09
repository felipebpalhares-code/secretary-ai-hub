"""Rotas REST de Organization (Sprint E — sem enrich, vem no commit 3)."""
from __future__ import annotations
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from services.database import get_session
from services import organization_service as svc
from models.contact import Contact
from schemas.organization import (
    OrganizationCreate, OrganizationUpdate, OrganizationRead, OrganizationStats,
)


def _count_contacts(db: Session, org_id: int) -> int:
    return (
        db.query(Contact)
        .filter(Contact.organization_id == org_id, Contact.deleted_at.is_(None))
        .count()
    )

router = APIRouter(prefix="/api/organizations", tags=["organizations"])


def _to_read(org, contact_count: int = 0) -> OrganizationRead:
    return OrganizationRead.model_validate({
        **{c.name: getattr(org, c.name) for c in org.__table__.columns},
        "contact_count": contact_count,
    })


@router.get("/stats", response_model=OrganizationStats)
def stats(db: Session = Depends(get_session)) -> OrganizationStats:
    return OrganizationStats(**svc.get_stats(db))


@router.get("", response_model=List[OrganizationRead])
def list_organizations(
    q: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_session),
):
    rows = svc.list_organizations(db, q, limit)
    return [_to_read(org, n) for org, n in rows]


@router.post("", response_model=OrganizationRead, status_code=201)
def create_organization(payload: OrganizationCreate, db: Session = Depends(get_session)):
    return _to_read(svc.create_organization(db, payload.model_dump()), 0)


@router.get("/{org_id}", response_model=OrganizationRead)
def get_organization(org_id: int, db: Session = Depends(get_session)):
    org = svc.get_organization(db, org_id)
    return _to_read(org, _count_contacts(db, org_id))


@router.patch("/{org_id}", response_model=OrganizationRead)
def update_organization(org_id: int, payload: OrganizationUpdate, db: Session = Depends(get_session)):
    org = svc.update_organization(db, org_id, payload.model_dump(exclude_unset=True))
    return _to_read(org, _count_contacts(db, org_id))


@router.delete("/{org_id}")
def delete_organization(org_id: int, db: Session = Depends(get_session)):
    svc.delete_organization(db, org_id)
    return {"ok": True}


@router.post("/{org_id}/enrich", response_model=OrganizationRead)
async def enrich_organization(org_id: int, db: Session = Depends(get_session)):
    org = await svc.enrich_from_cnpj(db, org_id)
    return _to_read(org, _count_contacts(db, org_id))
