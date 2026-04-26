"""
Endpoints REST para o frontend Bancos.
Faz cache local em SQLite das chamadas Pluggy.
"""
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from services.database import get_session
from services.pluggy_client import client as pluggy
from models.banking import PluggyConnection, PluggyAccount, PluggyTransaction

router = APIRouter(prefix="/api/banks", tags=["banks"])


# ── Connect Token (frontend abre o widget) ─────────────

@router.post("/connect-token")
async def connect_token(body: dict | None = None):
    """
    Retorna token de curta duração para o Pluggy Connect Widget.
    Body opcional: { "itemId": "uuid" } para reconectar item existente.
    """
    item_id = (body or {}).get("itemId")
    try:
        result = await pluggy.create_connect_token(item_id=item_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Pluggy error: {e}")


# ── Connections ────────────────────────────────────────

@router.get("/connections")
async def list_connections(db: Session = Depends(get_session)):
    """Lista conexões bancárias do banco local (cache)."""
    rows = db.query(PluggyConnection).all()
    return [
        {
            "id": r.id,
            "pluggyItemId": r.pluggy_item_id,
            "bankName": r.bank_name,
            "imageUrl": r.bank_image_url,
            "entity": r.entity,
            "status": r.status,
            "lastSyncedAt": r.last_synced_at.isoformat() if r.last_synced_at else None,
        }
        for r in rows
    ]


@router.post("/connections/sync")
async def sync_connections(db: Session = Depends(get_session)):
    """Puxa snapshot Pluggy → atualiza/insere connections + accounts."""
    items = await pluggy.list_items()

    for item in items:
        conn = (
            db.query(PluggyConnection)
            .filter(PluggyConnection.pluggy_item_id == item["id"])
            .first()
        )
        if not conn:
            conn = PluggyConnection(pluggy_item_id=item["id"])
            db.add(conn)
        conn.bank_name = item.get("connector", {}).get("name", "Desconhecido")
        conn.bank_image_url = item.get("connector", {}).get("imageUrl")
        conn.status = item.get("status", "UNKNOWN")
        conn.last_synced_at = datetime.utcnow()
        db.flush()

        # Sync accounts deste item
        accounts = await pluggy.list_accounts(item["id"])
        for acc in accounts:
            row = (
                db.query(PluggyAccount).filter(PluggyAccount.pluggy_id == acc["id"]).first()
            )
            if not row:
                row = PluggyAccount(pluggy_id=acc["id"])
                db.add(row)
            row.pluggy_item_id = item["id"]
            row.name = acc.get("name", "")
            row.number = acc.get("number", "")
            row.agency = acc.get("bankData", {}).get("transferNumber") if acc.get("bankData") else None
            row.type = acc.get("type", "CHECKING")
            row.subtype = acc.get("subtype")
            row.balance = float(acc.get("balance") or 0)
            row.currency = acc.get("currencyCode", "BRL")
            row.entity = conn.entity or "pf"
            row.last_synced_at = datetime.utcnow()

    db.commit()
    return {"ok": True, "items_synced": len(items)}


@router.delete("/connections/{item_id}")
async def disconnect(item_id: str, db: Session = Depends(get_session)):
    await pluggy.delete_item(item_id)
    db.query(PluggyConnection).filter(PluggyConnection.pluggy_item_id == item_id).delete()
    db.query(PluggyAccount).filter(PluggyAccount.pluggy_item_id == item_id).delete()
    db.commit()
    return {"ok": True}


# ── Accounts ───────────────────────────────────────────

@router.get("/accounts")
async def list_accounts(entity: str | None = None, db: Session = Depends(get_session)):
    q = db.query(PluggyAccount)
    if entity:
        q = q.filter(PluggyAccount.entity == entity)
    rows = q.all()
    return [
        {
            "id": r.id,
            "pluggyId": r.pluggy_id,
            "name": r.name,
            "number": r.number,
            "agency": r.agency,
            "type": r.type,
            "subtype": r.subtype,
            "balance": r.balance,
            "currency": r.currency,
            "entity": r.entity,
            "isPrimary": bool(r.is_primary),
            "lastSyncedAt": r.last_synced_at.isoformat(),
        }
        for r in rows
    ]


@router.get("/accounts/summary")
async def accounts_summary(db: Session = Depends(get_session)):
    """Total consolidado + por entidade."""
    rows = db.query(PluggyAccount).all()
    by_entity: dict[str, float] = {}
    total = 0.0
    for r in rows:
        by_entity[r.entity] = by_entity.get(r.entity, 0) + r.balance
        total += r.balance
    return {
        "total": total,
        "byEntity": by_entity,
        "accountCount": len(rows),
    }


# ── Transactions ───────────────────────────────────────

@router.get("/transactions")
async def list_transactions(
    account_id: str | None = None,
    entity: str | None = None,
    days: int = 30,
    db: Session = Depends(get_session),
):
    """Extrato unificado · filtros opcionais."""
    q = db.query(PluggyTransaction)

    if account_id:
        q = q.filter(PluggyTransaction.account_id == account_id)
    if entity:
        # join via account
        account_ids = [
            a.pluggy_id for a in db.query(PluggyAccount).filter(PluggyAccount.entity == entity).all()
        ]
        q = q.filter(PluggyTransaction.account_id.in_(account_ids))

    cutoff = datetime.utcnow() - timedelta(days=days)
    q = q.filter(PluggyTransaction.date >= cutoff).order_by(PluggyTransaction.date.desc())

    rows = q.limit(500).all()
    return [
        {
            "id": r.id,
            "pluggyId": r.pluggy_id,
            "accountId": r.account_id,
            "date": r.date.isoformat(),
            "amount": r.amount,
            "description": r.description,
            "category": r.category,
            "agentCategory": r.agent_category,
            "agentAssigned": r.agent_assigned,
            "type": r.type,
            "conciliated": bool(r.conciliated),
        }
        for r in rows
    ]


@router.post("/transactions/sync")
async def sync_transactions(body: dict, db: Session = Depends(get_session)):
    """Puxa transações do Pluggy de um account específico."""
    account_id = body.get("accountId")
    days = body.get("days", 30)
    if not account_id:
        raise HTTPException(status_code=400, detail="accountId required")

    from_date = (datetime.utcnow() - timedelta(days=days)).strftime("%Y-%m-%d")
    page = 1
    inserted = 0

    while True:
        result = await pluggy.list_transactions(account_id, from_date=from_date, page=page)
        for tx in result.get("results", []):
            existing = (
                db.query(PluggyTransaction)
                .filter(PluggyTransaction.pluggy_id == tx["id"])
                .first()
            )
            if existing:
                continue
            db.add(
                PluggyTransaction(
                    pluggy_id=tx["id"],
                    account_id=account_id,
                    date=datetime.fromisoformat(tx["date"].replace("Z", "")),
                    amount=float(tx["amount"]),
                    description=tx.get("description", ""),
                    description_raw=tx.get("descriptionRaw"),
                    category=tx.get("category"),
                    category_id=tx.get("categoryId"),
                    type=tx.get("type", "DEBIT"),
                    balance=tx.get("balance"),
                    currency=tx.get("currencyCode", "BRL"),
                )
            )
            inserted += 1

        if result.get("page", 1) >= result.get("totalPages", 1):
            break
        page += 1

    db.commit()
    return {"ok": True, "inserted": inserted}


@router.patch("/transactions/{tx_id}/categorize")
async def categorize_transaction(tx_id: int, body: dict, db: Session = Depends(get_session)):
    """Felipe ou um agente classifica manualmente a transação."""
    tx = db.query(PluggyTransaction).filter(PluggyTransaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    if "agentCategory" in body:
        tx.agent_category = body["agentCategory"]
    if "agentAssigned" in body:
        tx.agent_assigned = body["agentAssigned"]
    if "costCenterId" in body:
        tx.cost_center_id = body["costCenterId"]
    if "conciliated" in body:
        tx.conciliated = 1 if body["conciliated"] else 0
    db.commit()
    return {"ok": True}
