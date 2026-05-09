"""Rotas REST de Organization (Sprint E — sem enrich, vem no commit 3)."""
from __future__ import annotations
from typing import Optional, List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from services.database import get_session
from services import organization_service as svc
from schemas.organization import (
    OrganizationCreate, OrganizationUpdate, OrganizationRead,
)

router = APIRouter(prefix="/api/organizations", tags=["organizations"])


@router.get("", response_model=List[OrganizationRead])
def list_organizations(
    q: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_session),
):
    return svc.list_organizations(db, q, limit)


@router.post("", response_model=OrganizationRead, status_code=201)
def create_organization(payload: OrganizationCreate, db: Session = Depends(get_session)):
    return svc.create_organization(db, payload.model_dump())


@router.get("/{org_id}", response_model=OrganizationRead)
def get_organization(org_id: int, db: Session = Depends(get_session)):
    return svc.get_organization(db, org_id)


@router.patch("/{org_id}", response_model=OrganizationRead)
def update_organization(org_id: int, payload: OrganizationUpdate, db: Session = Depends(get_session)):
    return svc.update_organization(db, org_id, payload.model_dump(exclude_unset=True))


@router.delete("/{org_id}")
def delete_organization(org_id: int, db: Session = Depends(get_session)):
    svc.delete_organization(db, org_id)
    return {"ok": True}


@router.post("/{org_id}/enrich", response_model=OrganizationRead)
async def enrich_organization(org_id: int, db: Session = Depends(get_session)):
    return await svc.enrich_from_cnpj(db, org_id)
