"""
Rotas HTTP para conexões externas:
  - WhatsApp (Evolution): status, qrcode, webhook, envio proativo
  - Telegram: webhook, envio
  - Discord: posting via webhooks
  - Log unificado (busca cross-canal)
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from services.database import get_session
from services.evolution_client import client as wa
from services.telegram_client import client as tg
from services.discord_client import client as dc
from services.whatsapp_router import router as wa_router
from services.briefing_builder import build_morning_briefing
from models.message_log import MessageLog
from agents.orchestrator import process as orchestrator_process

router = APIRouter(prefix="/api/connections", tags=["connections"])


# ─────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────

def log_msg(db: Session, channel: str, direction: str, sender: str,
            body: str, agent: str | None = None, flag: str | None = None) -> None:
    db.add(MessageLog(
        channel=channel, direction=direction, sender=sender,
        body=body, agent=agent, flag=flag,
    ))
    db.commit()


async def _ask_agent(agent_key: str, text: str) -> str:
    """Coleta a resposta final do orchestrator (último chunk de type=message)."""
    reply = ""
    async for chunk in orchestrator_process(f"[Agente: {agent_key}] {text}"):
        if chunk.get("type") == "message":
            reply = chunk.get("content", "")
    return reply or "Processando..."


# ─────────────────────────────────────────────────────
# WhatsApp
# ─────────────────────────────────────────────────────

@router.get("/whatsapp/status")
async def whatsapp_status():
    return {"channel": "whatsapp", "state": await wa.connection_state()}


@router.get("/whatsapp/qrcode")
async def whatsapp_qrcode():
    return await wa.get_qrcode()


@router.post("/whatsapp/disconnect")
async def whatsapp_disconnect():
    return await wa.disconnect()


@router.post("/webhooks/whatsapp/{event:path}")
@router.post("/webhooks/whatsapp")
async def whatsapp_webhook(request: Request, db: Session = Depends(get_session), event: str = ""):
    if event:
        # Evento por subpath (qrcode-updated, connection-update, etc)
        try:
            data = await request.json()
            print(f"[WA webhook] event={event} data={str(data)[:300]}", flush=True)
            if event == "qrcode-updated" or "qr" in event.lower():
                qr = data.get("qrcode") or data.get("data", {}).get("qrcode") or data.get("data", {}).get("base64")
                if qr:
                    with open("/tmp/last_qr.txt", "w") as f:
                        f.write(str(qr))
                    print(f"[WA webhook] QR captured, length={len(str(qr))}", flush=True)
        except Exception as e:
            print(f"[WA webhook] error: {e}", flush=True)
        return {"ok": True}

    # endpoint principal (mensagens upsert)

    data = await request.json()
    if data.get("event") != "messages.upsert":
        return {"ok": True, "ignored": True}

    payload = data.get("data", {})
    sender = payload.get("key", {}).get("remoteJid", "").replace("@s.whatsapp.net", "")
    text = (
        payload.get("message", {}).get("conversation")
        or payload.get("message", {}).get("extendedTextMessage", {}).get("text", "")
    )
    if not sender or not text:
        return {"ok": True, "empty": True}

    log_msg(db, "whatsapp", "in", sender, text)
    decision = wa_router.route(sender, text)

    # MENU
    if decision["action"] == "menu":
        await wa.send_menu(sender)
        log_msg(db, "whatsapp", "out", sender, "(menu)", agent="hub")
        return {"ok": True, "action": "menu"}

    # BRIEFING
    if decision["action"] == "briefing":
        briefing = await build_morning_briefing(db)
        await wa.send_text(sender, briefing)
        log_msg(db, "whatsapp", "out", sender, briefing, agent="hub", flag="briefing")
        return {"ok": True, "action": "briefing"}

    # URGENTE — aciona todos (placeholder: em produção rodar agentes em paralelo)
    if decision["action"] == "urgent":
        await wa.send_text(sender, "🚨 *Urgência recebida* — acionando todos os agentes.")
        # TODO: await asyncio.gather(*[_ask_agent(a, text) for a in AGENT_KEYS])
        log_msg(db, "whatsapp", "out", sender, "urgent-broadcast", agent="hub", flag="urgent")
        return {"ok": True, "action": "urgent"}

    # AGENT — resposta real do orchestrator
    agent_key = decision["agent"]
    reply = await _ask_agent(agent_key, text)
    formatted = f"*[{agent_key.upper()}]*\n{reply}"
    await wa.send_text(sender, formatted)
    log_msg(db, "whatsapp", "out", sender, reply, agent=agent_key)
    return {"ok": True, "action": "agent", "agent": agent_key}


@router.post("/whatsapp/send-alert")
async def wa_send_alert(body: dict, db: Session = Depends(get_session)):
    to, agent, message = body["to"], body.get("agent", "hub"), body["message"]
    formatted = f"*[{agent.upper()}]*\n{message}"
    await wa.send_text(to, formatted)
    log_msg(db, "whatsapp", "out", to, message, agent=agent, flag="alert")
    return {"ok": True}


# ─────────────────────────────────────────────────────
# Telegram
# ─────────────────────────────────────────────────────

@router.post("/webhooks/telegram")
async def telegram_webhook(request: Request, db: Session = Depends(get_session)):
    data = await request.json()
    msg = data.get("message") or {}
    chat_id = msg.get("chat", {}).get("id")
    text = msg.get("text", "")
    if not chat_id or not text:
        return {"ok": True, "empty": True}

    log_msg(db, "telegram", "in", str(chat_id), text)
    decision = wa_router.route(str(chat_id), text)

    if decision["action"] == "menu":
        await tg.send_text(chat_id, "Escolha um agente pelo número (1-8) ou digite livre.")
        return {"ok": True, "action": "menu"}
    if decision["action"] == "briefing":
        briefing = await build_morning_briefing(db)
        await tg.send_text(chat_id, briefing)
        log_msg(db, "telegram", "out", str(chat_id), briefing, agent="hub", flag="briefing")
        return {"ok": True}

    agent_key = decision["agent"] or "silva"
    reply = await _ask_agent(agent_key, text)
    await tg.send_text(chat_id, f"*[{agent_key.upper()}]*\n{reply}")
    log_msg(db, "telegram", "out", str(chat_id), reply, agent=agent_key)
    return {"ok": True, "agent": agent_key}


@router.post("/telegram/set-webhook")
async def telegram_set_webhook(body: dict):
    return await tg.set_webhook(body["url"])


# ─────────────────────────────────────────────────────
# Discord
# ─────────────────────────────────────────────────────

@router.post("/discord/post")
async def discord_post(body: dict, db: Session = Depends(get_session)):
    """body = {agent, content}"""
    result = await dc.post_as_agent(body["agent"], body["content"])
    log_msg(db, "discord", "out", f"#{body['agent']}", body["content"], agent=body["agent"])
    return result


@router.post("/discord/internal")
async def discord_internal(body: dict, db: Session = Depends(get_session)):
    """Registra comunicação entre agentes no canal interno."""
    result = await dc.post_internal(body["from"], body["to"], body["message"])
    log_msg(db, "discord", "out", "#agentes-internos",
            f"{body['from']} → {body['to']}: {body['message']}",
            agent=body["from"])
    return result


# ─────────────────────────────────────────────────────
# Log unificado
# ─────────────────────────────────────────────────────

@router.get("/logs")
async def get_logs(channel: str | None = None, limit: int = 100, db: Session = Depends(get_session)):
    q = db.query(MessageLog).order_by(MessageLog.created_at.desc())
    if channel:
        q = q.filter(MessageLog.channel == channel)
    rows = q.limit(limit).all()
    return [
        {
            "id": r.id, "channel": r.channel, "direction": r.direction,
            "sender": r.sender, "agent": r.agent, "body": r.body,
            "flag": r.flag, "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@router.get("/logs/search")
async def search_logs(q: str, limit: int = 50, db: Session = Depends(get_session)):
    rows = (
        db.query(MessageLog)
        .filter(MessageLog.body.contains(q))
        .order_by(MessageLog.created_at.desc())
        .limit(limit)
        .all()
    )
    return [{"id": r.id, "channel": r.channel, "body": r.body, "created_at": r.created_at.isoformat()} for r in rows]
