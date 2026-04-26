"""
Monta o briefing matinal / meio-dia / noite consultando cada agente.
Retorna texto pronto para envio por WhatsApp/Telegram/Discord.
"""
from __future__ import annotations
from datetime import date, datetime
from sqlalchemy.orm import Session
from services.profile_context import build_context


AGENT_ORDER = ["silva", "ricardo", "ana", "clara", "engenheiro", "diretor", "marcos", "carlos"]

AGENT_EMOJI = {
    "silva": "⚖️", "ricardo": "💰", "ana": "🌸", "clara": "✉️",
    "engenheiro": "🏗️", "diretor": "🏢", "marcos": "🏛️", "carlos": "🩺",
}


async def build_morning_briefing(db: Session) -> str:
    """Briefing das 7h — todos os agentes contribuem."""
    today = date.today().strftime("%d/%m/%Y")
    lines = [f"🌅 *Bom dia, Felipe! Briefing de {today}*\n"]

    context = build_context(db)

    # TODO: em produção, iterar pelos agentes chamando o orquestrador com contexto.
    # Por ora, placeholder com estrutura real.
    for key in AGENT_ORDER:
        emoji = AGENT_EMOJI[key]
        # contribution = await orchestrator.ask_for_briefing(agent=key, context=context, window="morning")
        contribution = f"(Contribuição de {key} — chamada ao LLM aqui)"
        lines.append(f"{emoji} *{key.title()}*: {contribution}")

    return "\n\n".join(lines)


async def build_noon_alerts(db: Session) -> str:
    today = datetime.now().strftime("%d/%m %H:%M")
    return f"☀️ *Alertas do meio-dia — {today}*\n\n(Agentes com alertas pendentes respondem aqui)"


async def build_evening_summary(db: Session) -> str:
    today = date.today().strftime("%d/%m/%Y")
    return f"🌙 *Resumo do dia — {today}*\n\n(Agentes consolidam o que aconteceu e pendências para amanhã)"
