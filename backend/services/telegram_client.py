"""
Wrapper simples do Telegram Bot API.
Usa o mesmo router (whatsapp_router) para manter regras de roteamento consistentes.
"""
import os
import httpx

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
BASE = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"


class TelegramClient:
    async def send_text(self, chat_id: str | int, text: str, parse_mode: str = "Markdown") -> dict:
        if not TELEGRAM_BOT_TOKEN:
            return {"ok": False, "error": "TELEGRAM_BOT_TOKEN não configurada"}
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(f"{BASE}/sendMessage", json={
                "chat_id": chat_id, "text": text, "parse_mode": parse_mode
            })
            r.raise_for_status()
            return r.json()

    async def send_document(self, chat_id: str | int, file_bytes: bytes, filename: str, caption: str = "") -> dict:
        if not TELEGRAM_BOT_TOKEN:
            return {"ok": False, "error": "TELEGRAM_BOT_TOKEN não configurada"}
        async with httpx.AsyncClient(timeout=60) as c:
            r = await c.post(
                f"{BASE}/sendDocument",
                data={"chat_id": str(chat_id), "caption": caption},
                files={"document": (filename, file_bytes)},
            )
            r.raise_for_status()
            return r.json()

    async def set_webhook(self, webhook_url: str) -> dict:
        if not TELEGRAM_BOT_TOKEN:
            return {"ok": False, "error": "TELEGRAM_BOT_TOKEN não configurada"}
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(f"{BASE}/setWebhook", json={"url": webhook_url})
            r.raise_for_status()
            return r.json()


client = TelegramClient()
