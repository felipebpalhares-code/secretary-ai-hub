"""
Cliente Discord via webhooks + API REST.
Cada agente posta no seu canal próprio (#dr-silva, #ricardo, etc) via webhook URL.
"""
import os
import httpx

DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN", "")
DISCORD_GUILD_ID  = os.getenv("DISCORD_GUILD_ID", "")
API = "https://discord.com/api/v10"

# Mapeamento agente → webhook URL (configurado no painel; guardado no banco em produção)
AGENT_WEBHOOKS: dict[str, str] = {
    "silva":      os.getenv("DISCORD_WH_SILVA", ""),
    "ricardo":    os.getenv("DISCORD_WH_RICARDO", ""),
    "engenheiro": os.getenv("DISCORD_WH_ENGENHEIRO", ""),
    "ana":        os.getenv("DISCORD_WH_ANA", ""),
    "diretor":    os.getenv("DISCORD_WH_DIRETOR", ""),
    "marcos":     os.getenv("DISCORD_WH_MARCOS", ""),
    "clara":      os.getenv("DISCORD_WH_CLARA", ""),
    "carlos":     os.getenv("DISCORD_WH_CARLOS", ""),
    "briefing":   os.getenv("DISCORD_WH_BRIEFING", ""),
    "urgencias":  os.getenv("DISCORD_WH_URGENCIAS", ""),
    "internos":   os.getenv("DISCORD_WH_INTERNOS", ""),
}


AGENT_AVATAR: dict[str, str] = {
    "silva": "⚖️", "ricardo": "💰", "engenheiro": "🏗️", "ana": "🌸",
    "diretor": "🏢", "marcos": "🏛️", "clara": "✉️", "carlos": "🩺",
    "briefing": "🌅", "urgencias": "🚨", "internos": "🤖",
}


class DiscordClient:
    async def post_as_agent(self, agent: str, content: str) -> dict:
        """Envia mensagem no canal do agente via webhook, com username e avatar customizados."""
        url = AGENT_WEBHOOKS.get(agent)
        if not url:
            return {"ok": False, "error": f"Webhook não configurado para {agent}"}
        emoji = AGENT_AVATAR.get(agent, "🤖")
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(url, json={
                "username": f"{emoji} {agent.title()}",
                "content": content,
            })
            r.raise_for_status()
            return {"ok": True}

    async def post_urgent(self, content: str) -> dict:
        return await self.post_as_agent("urgencias", f"@here 🚨 **URGENTE**\n{content}")

    async def post_briefing(self, content: str) -> dict:
        return await self.post_as_agent("briefing", content)

    async def post_internal(self, from_agent: str, to_agent: str, message: str) -> dict:
        """Log de comunicação entre agentes no canal #agentes-internos."""
        content = f"**{from_agent.title()}** → **{to_agent.title()}**: {message}"
        return await self.post_as_agent("internos", content)


client = DiscordClient()
