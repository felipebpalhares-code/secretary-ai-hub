"""
Despacho assíncrono de webhooks de saída dos agentes.

- Fire-and-forget via asyncio.create_task (não bloqueia a resposta do chat)
- Retry 3x com backoff exponencial (1s, 2s, 4s)
- Se a webhook tem secret: assina o body com HMAC-SHA256 → X-Webhook-Signature
- Logs em /app/logs/webhooks.log (criado se não existir)
"""
from __future__ import annotations
import asyncio
import hashlib
import hmac
import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Any

import httpx

from models.agent import AgentWebhook
from services.database import SessionLocal

# ───────────────────────── logger dedicado ─────────────────────────

LOG_PATH = Path(os.getenv("WEBHOOK_LOG_PATH", "/app/logs/webhooks.log"))
LOG_PATH.parent.mkdir(parents=True, exist_ok=True)

_logger = logging.getLogger("agent.webhooks")
if not _logger.handlers:
    _logger.setLevel(logging.INFO)
    handler = logging.FileHandler(LOG_PATH, encoding="utf-8")
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
    _logger.addHandler(handler)
    _logger.propagate = False


# ───────────────────────── helpers ─────────────────────────

def _sign(secret: str, body: bytes) -> str:
    mac = hmac.new(secret.encode("utf-8"), body, hashlib.sha256)
    return f"sha256={mac.hexdigest()}"


async def _post_with_retry(url: str, body: bytes, headers: dict[str, str]) -> tuple[bool, str]:
    backoff = 1.0
    last_err = ""
    async with httpx.AsyncClient(timeout=10.0) as client:
        for attempt in range(1, 4):
            try:
                r = await client.post(url, content=body, headers=headers)
                if 200 <= r.status_code < 300:
                    return True, f"HTTP {r.status_code}"
                last_err = f"HTTP {r.status_code}: {r.text[:200]}"
            except Exception as e:
                last_err = f"{type(e).__name__}: {e}"
            if attempt < 3:
                await asyncio.sleep(backoff)
                backoff *= 2
    return False, last_err


# ───────────────────────── public API ─────────────────────────

async def _deliver_to_webhook(webhook_row: dict[str, Any], payload: dict[str, Any]) -> None:
    body = json.dumps(payload, ensure_ascii=False, default=str).encode("utf-8")
    headers = {
        "Content-Type": "application/json",
        "User-Agent":   "felipe-hub-agent-webhook/1.0",
        "X-Webhook-Event": webhook_row["event"],
        "X-Webhook-Agent-Id": webhook_row["agent_id"],
    }
    if webhook_row.get("secret"):
        headers["X-Webhook-Signature"] = _sign(webhook_row["secret"], body)

    ok, info = await _post_with_retry(webhook_row["url"], body, headers)
    level = logging.INFO if ok else logging.ERROR
    _logger.log(
        level,
        "webhook agent=%s event=%s url=%s ok=%s info=%s",
        webhook_row["agent_id"], webhook_row["event"], webhook_row["url"], ok, info,
    )


async def _dispatch_async(agent_id: str, event: str, payload: dict[str, Any]) -> None:
    # Sessão própria — a sessão do request original já foi fechada quando
    # esta task acorda. Carregamos os webhooks aqui e copiamos para dicts pra
    # poder fechar a sessão antes de bater HTTP.
    db = SessionLocal()
    try:
        rows = (
            db.query(AgentWebhook)
            .filter(
                AgentWebhook.agent_id == agent_id,
                AgentWebhook.event == event,
                AgentWebhook.active.is_(True),
            )
            .all()
        )
        snapshot = [{
            "id":       w.id,
            "agent_id": w.agent_id,
            "event":    w.event,
            "url":      w.url,
            "secret":   w.secret,  # decriptado pelo EncryptedString
        } for w in rows]
    finally:
        db.close()

    if not snapshot:
        return

    # Envia em paralelo, mas não levanta se algum falhar — log já cobre.
    await asyncio.gather(
        *[_deliver_to_webhook(w, payload) for w in snapshot],
        return_exceptions=True,
    )


def dispatch_webhook(agent_id: str, event: str, payload: dict[str, Any]) -> None:
    """
    Dispara webhooks pra todos os AgentWebhook(agent_id, event, active=True).
    Não bloqueia: agenda como task no event loop atual (fire-and-forget).
    """
    enriched = {
        "event":     event,
        "agent_id":  agent_id,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "payload":   payload,
    }
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(_dispatch_async(agent_id, event, enriched))
    except RuntimeError:
        # Sem loop rodando (ex: chamada síncrona/teste) — execução direta.
        asyncio.run(_dispatch_async(agent_id, event, enriched))
