"""
Cliente para Evolution API (WhatsApp não-oficial).
Docs: https://doc.evolution-api.com/
"""
from __future__ import annotations
import os
import httpx
from typing import Any


EVOLUTION_URL      = os.getenv("EVOLUTION_API_URL", "http://localhost:8080")
EVOLUTION_API_KEY  = os.getenv("EVOLUTION_API_KEY", "")
EVOLUTION_INSTANCE = os.getenv("EVOLUTION_INSTANCE", "felipe-hub")


class EvolutionClient:
    def __init__(self, url: str = EVOLUTION_URL, api_key: str = EVOLUTION_API_KEY, instance: str = EVOLUTION_INSTANCE):
        self.url = url.rstrip("/")
        self.instance = instance
        self.headers = {"apikey": api_key, "Content-Type": "application/json"}

    async def _request(self, method: str, path: str, **kwargs) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.request(method, f"{self.url}{path}", headers=self.headers, **kwargs)
            r.raise_for_status()
            return r.json() if r.content else {}

    async def send_text(self, to: str, text: str) -> dict[str, Any]:
        """Envia texto simples para um número (formato: 5541998765432)."""
        payload = {"number": to, "text": text}
        return await self._request("POST", f"/message/sendText/{self.instance}", json=payload)

    async def send_menu(self, to: str) -> dict[str, Any]:
        """Envia o menu principal com os 8 agentes."""
        menu_text = (
            "*Bom dia Felipe!* 👋\n"
            "Sua equipe está pronta. Com quem quer falar?\n\n"
            "1️⃣ Dr. Silva — Jurídico\n"
            "2️⃣ Ricardo — Financeiro\n"
            "3️⃣ Engenheiro — Obras Vimar\n"
            "4️⃣ Ana — Família e Agenda\n"
            "5️⃣ Diretor — Empresas\n"
            "6️⃣ Marcos — Governo\n"
            "7️⃣ Clara — Emails\n"
            "8️⃣ Dr. Carlos — Saúde\n"
            "9️⃣ Todos — Briefing completo\n"
            "0️⃣ Urgente — Aciona todos agora\n\n"
            "Ou fale direto que eu te direciono! 🎯"
        )
        return await self.send_text(to, menu_text)

    async def get_qrcode(self) -> dict[str, Any]:
        return await self._request("GET", f"/instance/connect/{self.instance}")

    async def connection_state(self) -> dict[str, Any]:
        return await self._request("GET", f"/instance/connectionState/{self.instance}")

    async def disconnect(self) -> dict[str, Any]:
        return await self._request("DELETE", f"/instance/logout/{self.instance}")


client = EvolutionClient()
