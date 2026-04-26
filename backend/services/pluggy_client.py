"""
Cliente Pluggy (Open Finance Brasil).
Docs: https://docs.pluggy.ai/

Pluggy oferece um auth de 2 etapas:
1. POST /auth com clientId/secret → retorna apiKey (TTL 2h)
2. Demais requests usam X-API-KEY header

Para o widget de conexão (frontend), gere connectToken via /connect_token.
"""
from __future__ import annotations
import os
import time
import httpx
from typing import Any

PLUGGY_BASE_URL = os.getenv("PLUGGY_BASE_URL", "https://api.pluggy.ai")
PLUGGY_CLIENT_ID = os.getenv("PLUGGY_CLIENT_ID", "")
PLUGGY_CLIENT_SECRET = os.getenv("PLUGGY_CLIENT_SECRET", "")


class PluggyClient:
    def __init__(self):
        self._api_key: str | None = None
        self._expires_at: float = 0

    async def _get_api_key(self) -> str:
        """Auto-refresh do API key (cache de ~110min)."""
        if self._api_key and time.time() < self._expires_at:
            return self._api_key
        if not PLUGGY_CLIENT_ID or not PLUGGY_CLIENT_SECRET:
            raise RuntimeError("PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET não configurados")
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.post(
                f"{PLUGGY_BASE_URL}/auth",
                json={"clientId": PLUGGY_CLIENT_ID, "clientSecret": PLUGGY_CLIENT_SECRET},
            )
            r.raise_for_status()
            self._api_key = r.json()["apiKey"]
            self._expires_at = time.time() + 110 * 60
            return self._api_key

    async def _request(self, method: str, path: str, **kwargs) -> Any:
        api_key = await self._get_api_key()
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.request(
                method,
                f"{PLUGGY_BASE_URL}{path}",
                headers={"X-API-KEY": api_key, **kwargs.pop("headers", {})},
                **kwargs,
            )
            r.raise_for_status()
            return r.json() if r.content else {}

    # ── Connect Token (frontend widget) ────────────────────

    async def create_connect_token(self, item_id: str | None = None) -> dict:
        """Token de curta duração pra abrir o Pluggy Connect Widget no frontend."""
        body = {"itemId": item_id} if item_id else {}
        return await self._request("POST", "/connect_token", json=body)

    # ── Items (conexões bancárias) ─────────────────────────

    async def list_items(self) -> list[dict]:
        """Lista todas as conexões bancárias do client (Felipe)."""
        result = await self._request("GET", "/items")
        return result.get("results", [])

    async def get_item(self, item_id: str) -> dict:
        return await self._request("GET", f"/items/{item_id}")

    async def update_item(self, item_id: str) -> dict:
        """Força sync da conexão."""
        return await self._request("PATCH", f"/items/{item_id}")

    async def delete_item(self, item_id: str) -> dict:
        return await self._request("DELETE", f"/items/{item_id}")

    # ── Accounts ───────────────────────────────────────────

    async def list_accounts(self, item_id: str) -> list[dict]:
        result = await self._request("GET", f"/accounts?itemId={item_id}")
        return result.get("results", [])

    async def get_account(self, account_id: str) -> dict:
        return await self._request("GET", f"/accounts/{account_id}")

    # ── Transactions ───────────────────────────────────────

    async def list_transactions(
        self,
        account_id: str,
        from_date: str | None = None,
        to_date: str | None = None,
        page: int = 1,
        page_size: int = 100,
    ) -> dict:
        params = {"accountId": account_id, "page": page, "pageSize": page_size}
        if from_date:
            params["from"] = from_date
        if to_date:
            params["to"] = to_date
        qs = "&".join(f"{k}={v}" for k, v in params.items())
        return await self._request("GET", f"/transactions?{qs}")

    # ── Investments (opcional) ─────────────────────────────

    async def list_investments(self, item_id: str) -> list[dict]:
        result = await self._request("GET", f"/investments?itemId={item_id}")
        return result.get("results", [])


client = PluggyClient()
