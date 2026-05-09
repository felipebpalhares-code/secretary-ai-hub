"""
Rotas REST do módulo Contatos.

Convenção: rotas com path concreto vêm ANTES das paramétricas pra evitar
match acidental (ex: /contacts/categories antes de /contacts/{id}).
"""
from __future__ import annotations
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from services.database import get_session
from services import contact_service as svc
from services.backup_service import run_backup
from schemas.contact import (
    ContactCreate, ContactUpdate, ContactRead, ContactStats,
    CategoryCreate, CategoryUpdate, CategoryRead,
    TagRead,
)

router = APIRouter(prefix="/api/contacts", tags=["contacts"])


# ───────── Stats ─────────

@router.get("/stats", response_model=ContactStats)
def stats(db: Session = Depends(get_session)) -> ContactStats:
    return ContactStats(**svc.get_stats(db))


# ───────── Backup ─────────

@router.post("/backup/now")
def backup_now():
    """Dispara o backup imediatamente (útil pra teste e e2e manual)."""
    path = run_backup()
    return {"ok": True, "path": str(path)}


# ───────── Categorias ─────────

@router.get("/categories", response_model=List[CategoryRead])
def list_categories(db: Session = Depends(get_session)):
    return svc.list_categories(db)


@router.post("/categories", response_model=CategoryRead, status_code=201)
def create_category(payload: CategoryCreate, db: Session = Depends(get_session)):
    return svc.create_category(db, payload.name, payload.color)


@router.patch("/categories/{cat_id}", response_model=CategoryRead)
def update_category(cat_id: int, payload: CategoryUpdate, db: Session = Depends(get_session)):
    return svc.update_category(db, cat_id, payload.model_dump(exclude_unset=True))


@router.delete("/categories/{cat_id}")
def delete_category(cat_id: int, db: Session = Depends(get_session)):
    svc.delete_category(db, cat_id)
    return {"ok": True}


# ───────── Tags ─────────

@router.get("/tags", response_model=List[TagRead])
def search_tags(q: str = "", limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_session)):
    return svc.search_tags(db, q, limit)


# ───────── Contacts ─────────

@router.get("", response_model=List[ContactRead])
def list_contacts(
    category_id: Optional[int] = None,
    has_email: bool = False,
    has_phone: bool = False,
    has_company: bool = False,
    last_30_days: bool = False,
    search: Optional[str] = None,
    tag_ids: Optional[List[int]] = Query(default=None),
    db: Session = Depends(get_session),
):
    return svc.list_contacts(db, {
        "category_id": category_id,
        "has_email": has_email,
        "has_phone": has_phone,
        "has_company": has_company,
        "last_30_days": last_30_days,
        "search": search,
        "tag_ids": tag_ids,
    })


@router.get("/{contact_id}", response_model=ContactRead)
def get_contact(contact_id: int, db: Session = Depends(get_session)):
    return svc.get_contact(db, contact_id)


@router.post("", response_model=ContactRead, status_code=201)
def create_contact(payload: ContactCreate, db: Session = Depends(get_session)):
    return svc.create_contact(db, payload.model_dump())


@router.patch("/{contact_id}", response_model=ContactRead)
def update_contact(contact_id: int, payload: ContactUpdate, db: Session = Depends(get_session)):
    return svc.update_contact(db, contact_id, payload.model_dump(exclude_unset=True))


@router.delete("/{contact_id}")
def delete_contact(contact_id: int, db: Session = Depends(get_session)):
    svc.soft_delete_contact(db, contact_id)
    return {"ok": True}
