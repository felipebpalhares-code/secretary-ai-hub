"""
Chat com agentes IA — gerencia conversas, mensagens e o fluxo
RAG → Anthropic streaming → persistência → webhooks de saída.
"""
from __future__ import annotations
import logging
import os
from datetime import datetime
from typing import AsyncGenerator, Optional

from sqlalchemy.orm import Session

from models.agent import Agent, AgentConversation, AgentMessage
from services.agents import rag_service
from services.agents import document_service as docsvc
from services.agents.webhook_service import dispatch_webhook

log = logging.getLogger(__name__)

ANTHROPIC_API_KEY      = os.getenv("ANTHROPIC_API_KEY", "")
HISTORY_TOKEN_BUDGET   = int(os.getenv("AGENT_HISTORY_TOKEN_BUDGET", "4000"))
RAG_TOP_K              = int(os.getenv("AGENT_RAG_TOP_K", "5"))


# ───────────────────────── Anthropic client (lazy) ─────────────────────────

_anthropic_client = None


def _get_anthropic():
    global _anthropic_client
    if _anthropic_client is None:
        from anthropic import AsyncAnthropic
        _anthropic_client = AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    return _anthropic_client


# ───────────────────────── conversations ─────────────────────────

def create_conversation(db: Session, agent_id: str, title: Optional[str] = None) -> Optional[AgentConversation]:
    agent = db.get(Agent, agent_id)
    if not agent:
        return None
    conv = AgentConversation(agent_id=agent_id, title=title)
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def list_conversations(db: Session, agent_id: str) -> list[AgentConversation]:
    return (
        db.query(AgentConversation)
        .filter(AgentConversation.agent_id == agent_id)
        .order_by(AgentConversation.updated_at.desc())
        .all()
    )


def get_conversation(db: Session, conversation_id: str) -> Optional[AgentConversation]:
    return db.get(AgentConversation, conversation_id)


def get_conversation_messages(db: Session, conversation_id: str) -> list[AgentMessage]:
    return (
        db.query(AgentMessage)
        .filter(AgentMessage.conversation_id == conversation_id)
        .order_by(AgentMessage.created_at)
        .all()
    )


def delete_conversation(db: Session, conversation_id: str) -> bool:
    conv = db.get(AgentConversation, conversation_id)
    if not conv:
        return False
    db.delete(conv)
    db.commit()
    return True


# ───────────────────────── helpers de contexto ─────────────────────────

def _trim_history_to_budget(messages: list[AgentMessage], budget_tokens: int) -> list[AgentMessage]:
    """Mantém as mensagens mais recentes que cabem no orçamento de tokens."""
    if not messages:
        return []
    enc = docsvc._get_token_encoder()
    kept: list[AgentMessage] = []
    used = 0
    for m in reversed(messages):
        cost = len(enc.encode(m.content or ""))
        if used + cost > budget_tokens and kept:
            break
        kept.append(m)
        used += cost
    return list(reversed(kept))


def _to_anthropic_messages(history: list[AgentMessage], new_user_text: str) -> list[dict]:
    msgs: list[dict] = []
    for m in history:
        if m.role in ("user", "assistant"):
            msgs.append({"role": m.role, "content": m.content})
    msgs.append({"role": "user", "content": new_user_text})
    return msgs


def _compose_system_prompt(agent: Agent, rag_context: str) -> str:
    base = (agent.system_prompt or "").strip()
    if rag_context:
        return f"{base}\n\n{rag_context}".strip()
    return base


def _autotitle(text: str, limit: int = 60) -> str:
    text = (text or "").strip().replace("\n", " ")
    return text if len(text) <= limit else text[:limit].rstrip() + "…"


# ───────────────────────── send_message (streaming) ─────────────────────────

async def send_message(db: Session, conversation_id: str, user_text: str) -> AsyncGenerator[dict, None]:
    """
    Async generator que produz dicts no formato MessageChunk:
      {type: "meta",  user_message_id, assistant_message_id}
      {type: "delta", content: "..."}            ← repete várias vezes
      {type: "done",  tokens_used}
      {type: "error", content}
    A rota encapsula esses dicts em SSE (data: <json>\\n\\n).
    """
    conv = db.get(AgentConversation, conversation_id)
    if not conv:
        yield {"type": "error", "content": "Conversa não encontrada"}
        return
    agent: Agent = conv.agent
    if not agent:
        yield {"type": "error", "content": "Agente não encontrado"}
        return

    user_text = (user_text or "").strip()
    if not user_text:
        yield {"type": "error", "content": "Mensagem vazia"}
        return

    # 1. salva user message
    user_msg = AgentMessage(
        conversation_id=conv.id,
        role="user",
        content=user_text,
        tokens_used=docsvc.count_tokens(user_text),
    )
    db.add(user_msg)
    if not conv.title:
        conv.title = _autotitle(user_text)
    db.commit()
    db.refresh(user_msg)

    dispatch_webhook(agent.id, "on_message_received", {
        "conversation_id": conv.id,
        "message_id":      user_msg.id,
        "content":         user_text,
    })

    # 2. RAG
    rag_chunks  = rag_service.search_relevant_chunks(agent.id, user_text, top_k=RAG_TOP_K)
    rag_context = rag_service.format_context(rag_chunks)
    system_prompt = _compose_system_prompt(agent, rag_context)

    # 3. histórico (sem a mensagem que acabamos de salvar — vai como "user" final)
    all_msgs = (
        db.query(AgentMessage)
        .filter(AgentMessage.conversation_id == conv.id, AgentMessage.id != user_msg.id)
        .order_by(AgentMessage.created_at)
        .all()
    )
    trimmed = _trim_history_to_budget(all_msgs, HISTORY_TOKEN_BUDGET)
    anthropic_msgs = _to_anthropic_messages(trimmed, user_text)

    # 4. cria placeholder do assistant pra já ter id
    asst_msg = AgentMessage(
        conversation_id=conv.id,
        role="assistant",
        content="",
        tokens_used=0,
    )
    db.add(asst_msg)
    db.commit()
    db.refresh(asst_msg)

    yield {
        "type":                 "meta",
        "user_message_id":      user_msg.id,
        "assistant_message_id": asst_msg.id,
    }

    # 5. streaming Anthropic
    full: list[str] = []
    output_tokens = 0
    try:
        client = _get_anthropic()
        async with client.messages.stream(
            model=agent.model,
            system=system_prompt,
            messages=anthropic_msgs,
            max_tokens=agent.max_tokens,
            temperature=agent.temperature,
        ) as stream:
            async for text in stream.text_stream:
                if text:
                    full.append(text)
                    yield {"type": "delta", "content": text}
            final = await stream.get_final_message()
            if final and getattr(final, "usage", None):
                output_tokens = final.usage.output_tokens or 0

    except Exception as e:
        log.exception("Falha no streaming Anthropic (conv=%s)", conv.id)
        # persiste o que veio antes do erro pra não perder
        asst_msg.content = "".join(full)
        asst_msg.tokens_used = docsvc.count_tokens(asst_msg.content)
        db.commit()
        yield {"type": "error", "content": str(e)}
        return

    full_text = "".join(full)
    asst_msg.content = full_text
    asst_msg.tokens_used = output_tokens or docsvc.count_tokens(full_text)
    conv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(asst_msg)

    dispatch_webhook(agent.id, "on_response_sent", {
        "conversation_id": conv.id,
        "message_id":      asst_msg.id,
        "content":         full_text,
        "tokens_used":     asst_msg.tokens_used,
    })

    yield {
        "type":        "done",
        "tokens_used": asst_msg.tokens_used,
    }
