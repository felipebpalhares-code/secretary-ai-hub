"""Camada de serviço do módulo Contatos."""
from __future__ import annotations
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

from fastapi import HTTPException
from sqlalchemy import or_, and_, func
from sqlalchemy.orm import Session, selectinload

from models.contact import Contact, Category, Tag


# ───────── Tags helpers ─────────

def _normalize_tag(name: str) -> str:
    return name.strip().lower()


def _resolve_tags(db: Session, names: List[str]) -> List[Tag]:
    """Encontra tags existentes (case-insensitive) e cria as que faltam."""
    out: List[Tag] = []
    seen: set[str] = set()
    for raw in names:
        n = _normalize_tag(raw)
        if not n or n in seen:
            continue
        seen.add(n)
        tag = db.query(Tag).filter(func.lower(Tag.name) == n).first()
        if tag is None:
            tag = Tag(name=n)
            db.add(tag)
            db.flush()
        out.append(tag)
    return out


# ───────── Contact ─────────

def list_contacts(db: Session, filters: Dict[str, Any]) -> List[Contact]:
    q = (
        db.query(Contact)
        .options(selectinload(Contact.tags))
        .filter(Contact.deleted_at.is_(None))
    )

    if (cat_id := filters.get("category_id")) is not None:
        q = q.filter(Contact.category_id == cat_id)

    if filters.get("has_email"):
        q = q.filter(Contact.email.isnot(None), Contact.email != "")
    if filters.get("has_phone"):
        q = q.filter(Contact.phone.isnot(None), Contact.phone != "")
    if filters.get("has_company"):
        q = q.filter(Contact.company_name.isnot(None), Contact.company_name != "")

    if filters.get("last_30_days"):
        since = datetime.utcnow() - timedelta(days=30)
        q = q.filter(Contact.created_at >= since)

    if (search := filters.get("search")):
        like = f"%{search.lower()}%"
        q = q.filter(or_(
            func.lower(Contact.name).like(like),
            func.lower(Contact.email).like(like),
            func.lower(Contact.phone).like(like),
            func.lower(Contact.company_name).like(like),
        ))

    if (tag_ids := filters.get("tag_ids")):
        q = q.filter(Contact.tags.any(Tag.id.in_(tag_ids)))

    return q.order_by(Contact.name.asc().nulls_last(), Contact.id.asc()).all()


def get_contact(db: Session, contact_id: int) -> Contact:
    c = (
        db.query(Contact)
        .options(selectinload(Contact.tags))
        .filter(Contact.id == contact_id, Contact.deleted_at.is_(None))
        .first()
    )
    if c is None:
        raise HTTPException(status_code=404, detail="Contato não encontrado")
    return c


def create_contact(db: Session, data: Dict[str, Any]) -> Contact:
    tag_names = data.pop("tags", []) or []
    tags = _resolve_tags(db, tag_names)
    contact = Contact(**data)
    contact.tags = tags
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return contact


def update_contact(db: Session, contact_id: int, data: Dict[str, Any]) -> Contact:
    c = get_contact(db, contact_id)
    tags = data.pop("tags", None)
    for k, v in data.items():
        setattr(c, k, v)
    if tags is not None:
        c.tags = _resolve_tags(db, tags)
    db.commit()
    db.refresh(c)
    return c


def soft_delete_contact(db: Session, contact_id: int) -> None:
    c = get_contact(db, contact_id)
    c.deleted_at = datetime.utcnow()
    db.commit()


# ───────── Category ─────────

def list_categories(db: Session) -> List[Category]:
    return (
        db.query(Category)
        .order_by(Category.sort_order.asc(), Category.id.asc())
        .all()
    )


def create_category(db: Session, name: str, color: Optional[str]) -> Category:
    if db.query(Category).filter(func.lower(Category.name) == name.lower()).first():
        raise HTTPException(status_code=400, detail="Já existe categoria com este nome")
    last = db.query(func.max(Category.sort_order)).scalar() or 0
    cat = Category(name=name, color=color, is_default=False, sort_order=last + 1)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def update_category(db: Session, cat_id: int, data: Dict[str, Any]) -> Category:
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if cat is None:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    if "name" in data and data["name"]:
        clash = (
            db.query(Category)
            .filter(func.lower(Category.name) == data["name"].lower(), Category.id != cat_id)
            .first()
        )
        if clash:
            raise HTTPException(status_code=400, detail="Já existe categoria com este nome")
        cat.name = data["name"]
    if "color" in data:
        cat.color = data["color"]
    db.commit()
    db.refresh(cat)
    return cat


def delete_category(db: Session, cat_id: int) -> None:
    cat = db.query(Category).filter(Category.id == cat_id).first()
    if cat is None:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    if cat.is_default:
        raise HTTPException(status_code=400, detail="Categoria padrão não pode ser excluída")
    db.query(Contact).filter(Contact.category_id == cat_id).update({Contact.category_id: None})
    db.delete(cat)
    db.commit()


# ───────── Tags ─────────

def search_tags(db: Session, prefix: str, limit: int = 10) -> List[Tag]:
    p = (prefix or "").strip().lower()
    if not p:
        return (
            db.query(Tag).order_by(Tag.name.asc()).limit(limit).all()
        )
    return (
        db.query(Tag)
        .filter(func.lower(Tag.name).like(f"{p}%"))
        .order_by(Tag.name.asc())
        .limit(limit)
        .all()
    )


# ───────── Stats ─────────

def get_stats(db: Session) -> Dict[str, Any]:
    base = db.query(Contact).filter(Contact.deleted_at.is_(None))

    total = base.count()
    with_email = base.filter(Contact.email.isnot(None), Contact.email != "").count()
    with_phone = base.filter(Contact.phone.isnot(None), Contact.phone != "").count()
    with_company = base.filter(Contact.company_name.isnot(None), Contact.company_name != "").count()

    rows = (
        db.query(Contact.category_id, func.count(Contact.id))
        .filter(Contact.deleted_at.is_(None))
        .group_by(Contact.category_id)
        .all()
    )
    by_category = [{"category_id": r[0], "count": r[1]} for r in rows]

    return {
        "total": total,
        "with_email": with_email,
        "with_phone": with_phone,
        "with_company": with_company,
        "by_category": by_category,
    }


# ───────── Seed ─────────

DEFAULT_CATEGORIES = [
    ("Família", "#3B82F6", 1),
    ("Sócios", "#8B5CF6", 2),
    ("Profissionais de confiança", "#10B981", 3),
    ("Negócios", "#F59E0B", 4),
]


def seed_default_categories(db: Session) -> int:
    """Insere as 4 categorias default se a tabela estiver vazia. Retorna quantas inseriu."""
    if db.query(Category).count() > 0:
        return 0
    for name, color, order in DEFAULT_CATEGORIES:
        db.add(Category(name=name, color=color, is_default=True, sort_order=order))
    db.commit()
    return len(DEFAULT_CATEGORIES)
