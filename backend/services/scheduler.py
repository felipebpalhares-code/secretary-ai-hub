"""
Scheduler de alertas automáticos — roda os briefings nos horários fixos.
Start/stop controlado pelo main.py via FastAPI lifespan.
"""
import logging
import os
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from services.database import SessionLocal
from services.briefing_builder import (
    build_morning_briefing, build_noon_alerts, build_evening_summary
)
from services.evolution_client import client as wa
from services.telegram_client import client as tg
from services.discord_client import client as dc

log = logging.getLogger(__name__)

FELIPE_WHATSAPP = os.getenv("FELIPE_WHATSAPP_NUMBER", "5541998765432")
FELIPE_TELEGRAM = os.getenv("FELIPE_TELEGRAM_CHAT_ID", "")

scheduler = AsyncIOScheduler(timezone="America/Sao_Paulo")


async def _send_everywhere(text: str, is_briefing: bool = False) -> None:
    """Envia para todos os canais configurados."""
    try:
        await wa.send_text(FELIPE_WHATSAPP, text)
    except Exception as e:
        log.warning(f"WhatsApp falhou: {e}")

    if FELIPE_TELEGRAM:
        try:
            await tg.send_text(FELIPE_TELEGRAM, text)
        except Exception as e:
            log.warning(f"Telegram falhou: {e}")

    try:
        if is_briefing:
            await dc.post_briefing(text)
    except Exception as e:
        log.warning(f"Discord falhou: {e}")


async def job_morning() -> None:
    with SessionLocal() as db:
        text = await build_morning_briefing(db)
    await _send_everywhere(text, is_briefing=True)


async def job_noon() -> None:
    with SessionLocal() as db:
        text = await build_noon_alerts(db)
    await _send_everywhere(text)


async def job_evening() -> None:
    with SessionLocal() as db:
        text = await build_evening_summary(db)
    await _send_everywhere(text)


def start_scheduler() -> None:
    scheduler.add_job(job_morning, CronTrigger(hour=7,  minute=0),  id="morning", replace_existing=True)
    scheduler.add_job(job_noon,    CronTrigger(hour=12, minute=0),  id="noon",    replace_existing=True)
    scheduler.add_job(job_evening, CronTrigger(hour=18, minute=0),  id="evening", replace_existing=True)
    scheduler.start()
    log.info("Scheduler started: morning (7h), noon (12h), evening (18h)")


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
