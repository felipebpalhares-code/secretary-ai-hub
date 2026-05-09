"""Camada de serviço de Organization (Sprint E + F)."""
from __future__ import annotations
import re
from datetime import datetime
from typing import Optional, List, Dict, Any, Tuple

from fastapi import HTTPException
from sqlalchemy import or_, func, select
from sqlalchemy.orm import Session

from models.contact import Organization, Contact
# Reusa os helpers async da rota /api/utils/cnpj — sem reescrever a lógica de
# BrasilAPI/OpenCNPJ. Spec do Sprint E é explícita: "só vamos consumir".
from routes.utils import _try_brasilapi, _try_opencnpj


def _is_digits_only(s: str) -> bool:
    return bool(s) and s.replace(" ", "").isdigit()


def list_organizations(
    db: Session,
    q: Optional[str] = None,
    limit: int = 20,
) -> List[Tuple[Organization, int]]:
    """
    Autocomplete por prefixo de name (case-insensitive) ou substring de cnpj.
    Retorna lista de tuplas (org, contact_count) — só conta contatos não-deletados.
    """
    contact_count = (
        db.query(Contact.organization_id, func.count(Contact.id).label("cnt"))
        .filter(Contact.deleted_at.is_(None))
        .filter(Contact.organization_id.isnot(None))
        .group_by(Contact.organization_id)
        .subquery()
    )

    query = db.query(
        Organization,
        func.coalesce(contact_count.c.cnt, 0).label("contact_count"),
    ).outerjoin(contact_count, Organization.id == contact_count.c.organization_id)

    if q:
        clean = q.strip()
        if clean:
            digits = re.sub(r"\D", "", clean)
            if _is_digits_only(clean) and digits:
                query = query.filter(Organization.cnpj.like(f"{digits}%"))
            else:
                query = query.filter(func.lower(Organization.name).like(f"{clean.lower()}%"))

    rows = (
        query.order_by(Organization.name.asc().nulls_last(), Organization.id.asc())
        .limit(max(1, min(limit, 100)))
        .all()
    )
    return [(r[0], int(r[1])) for r in rows]


def get_stats(db: Session) -> Dict[str, int]:
    base = db.query(Organization)
    total = base.count()
    with_cnpj = base.filter(Organization.cnpj.isnot(None), Organization.cnpj != "").count()
    enriched = base.filter(Organization.enriched_at.isnot(None)).count()

    # Sub: orgs com pelo menos 1 contato não-deletado
    linked_ids = (
        db.query(Contact.organization_id)
        .filter(Contact.deleted_at.is_(None))
        .filter(Contact.organization_id.isnot(None))
        .distinct()
    )
    without_contacts = base.filter(~Organization.id.in_(linked_ids)).count()

    return {
        "total": total,
        "with_cnpj": with_cnpj,
        "enriched": enriched,
        "without_contacts": without_contacts,
    }


def get_organization(db: Session, org_id: int) -> Organization:
    org = db.query(Organization).filter(Organization.id == org_id).first()
    if org is None:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")
    return org


def create_organization(db: Session, data: Dict[str, Any]) -> Organization:
    cnpj = data.get("cnpj")
    if cnpj:
        clash = db.query(Organization).filter(Organization.cnpj == cnpj).first()
        if clash:
            raise HTTPException(status_code=400, detail="Já existe empresa com este CNPJ")
    org = Organization(**data)
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


def update_organization(db: Session, org_id: int, data: Dict[str, Any]) -> Organization:
    org = get_organization(db, org_id)
    if "cnpj" in data and data["cnpj"]:
        clash = (
            db.query(Organization)
            .filter(Organization.cnpj == data["cnpj"], Organization.id != org_id)
            .first()
        )
        if clash:
            raise HTTPException(status_code=400, detail="Já existe outra empresa com este CNPJ")
    for k, v in data.items():
        setattr(org, k, v)
    db.commit()
    db.refresh(org)
    return org


def delete_organization(db: Session, org_id: int) -> None:
    org = get_organization(db, org_id)
    # Desvincula contatos antes de deletar — depende menos de PRAGMA fk_on em SQLite.
    db.query(Contact).filter(Contact.organization_id == org_id).update(
        {Contact.organization_id: None}
    )
    db.delete(org)
    db.commit()


# ───────── Enrichment via BrasilAPI ─────────

async def _fetch_cnpj_data(cnpj: str) -> Optional[Dict[str, Any]]:
    """Wrapper testável: tenta BrasilAPI, cai pra OpenCNPJ. Retorna dict normalizado ou None."""
    payload = await _try_brasilapi(cnpj)
    if payload is None:
        payload = await _try_opencnpj(cnpj)
    return payload


async def enrich_from_cnpj(db: Session, org_id: int) -> Organization:
    """
    Consulta a Receita pelo CNPJ da Organization e preenche os campos derivados.
    Só sobrescreve campos quando a API retorna valor não-nulo — preserva o que
    Felipe digitou manualmente (notes/website).
    """
    org = get_organization(db, org_id)
    if not org.cnpj:
        raise HTTPException(status_code=400, detail="Sem CNPJ pra enriquecer")

    payload = await _fetch_cnpj_data(org.cnpj)
    if payload is None:
        raise HTTPException(
            status_code=502,
            detail="Não foi possível consultar a Receita (BrasilAPI e OpenCNPJ indisponíveis ou CNPJ não encontrado)",
        )

    # API → modelo. Só atribui se a API trouxe valor; preserva o existente caso
    # contrário (re-enrich não nula campos que já tinham sido preenchidos).
    if payload.get("razao_social"):
        org.name = payload["razao_social"]
    if payload.get("nome_fantasia"):
        org.trade_name = payload["nome_fantasia"]
    if payload.get("ramo"):
        org.industry = payload["ramo"]

    org.enriched_at = datetime.utcnow()
    db.commit()
    db.refresh(org)
    return org
