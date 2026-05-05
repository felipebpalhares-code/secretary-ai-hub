"""
Agentes IA — modelos do Sprint 1.

Mono-usuário (Felipe): nenhum modelo carrega user_id. Quando virarmos multi-user
no futuro, criamos a tabela `users` e fazemos migration retroativa.

IDs são UUID hex (string) — mesmo padrão de models/task.py.
"""
from __future__ import annotations
import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship

from models.profile import Base
from services.encryption import EncryptedString


def _uuid_hex() -> str:
    return uuid.uuid4().hex


# ─── Constantes de "enum" (mantidas como String pra SQLite friendliness) ───

AGENT_STATUS = ("draft", "active", "paused")
DOCUMENT_STATUS = ("processing", "ready", "failed")
MESSAGE_ROLE = ("user", "assistant", "system")
WEBHOOK_EVENTS = ("on_message_received", "on_response_sent", "on_action_taken")


class Agent(Base):
    __tablename__ = "agents"

    id            = Column(String, primary_key=True, default=_uuid_hex)
    name          = Column(String, nullable=False)             # ex: "Dr. Silva"
    role          = Column(String, nullable=False)             # ex: "Advogado Pessoal"
    description   = Column(Text)
    persona       = Column(Text)                               # quem é, tom, especialidade
    system_prompt = Column(Text)                               # gerado a partir de persona+instructions
    model         = Column(String, default="claude-sonnet-4-5-20250929", nullable=False)
    temperature   = Column(Float, default=0.7, nullable=False)
    max_tokens    = Column(Integer, default=2048, nullable=False)
    status        = Column(String, default="draft", nullable=False)  # AGENT_STATUS
    created_at    = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    instructions  = relationship(
        "AgentInstruction",
        back_populates="agent",
        cascade="all, delete-orphan",
        order_by="AgentInstruction.order",
    )
    documents     = relationship(
        "AgentDocument",
        back_populates="agent",
        cascade="all, delete-orphan",
        order_by="AgentDocument.created_at",
    )
    conversations = relationship(
        "AgentConversation",
        back_populates="agent",
        cascade="all, delete-orphan",
        order_by="AgentConversation.created_at.desc()",
    )
    webhooks      = relationship(
        "AgentWebhook",
        back_populates="agent",
        cascade="all, delete-orphan",
    )


class AgentInstruction(Base):
    __tablename__ = "agent_instructions"

    id         = Column(String, primary_key=True, default=_uuid_hex)
    agent_id   = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    content    = Column(Text, nullable=False)
    order      = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    agent = relationship("Agent", back_populates="instructions")


class AgentDocument(Base):
    __tablename__ = "agent_documents"

    id            = Column(String, primary_key=True, default=_uuid_hex)
    agent_id      = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    filename      = Column(String, nullable=False)
    file_path     = Column(String, nullable=False)             # caminho absoluto no container
    mime_type     = Column(String)
    chunks_count  = Column(Integer, default=0, nullable=False)
    total_tokens  = Column(Integer, default=0, nullable=False)
    status        = Column(String, default="processing", nullable=False)  # DOCUMENT_STATUS
    error_message = Column(Text)                               # se status=failed
    created_at    = Column(DateTime, default=datetime.utcnow, nullable=False)

    agent = relationship("Agent", back_populates="documents")


class AgentConversation(Base):
    __tablename__ = "agent_conversations"

    id         = Column(String, primary_key=True, default=_uuid_hex)
    agent_id   = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    title      = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    agent    = relationship("Agent", back_populates="conversations")
    messages = relationship(
        "AgentMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="AgentMessage.created_at",
    )


class AgentMessage(Base):
    __tablename__ = "agent_messages"

    id              = Column(String, primary_key=True, default=_uuid_hex)
    conversation_id = Column(String, ForeignKey("agent_conversations.id", ondelete="CASCADE"), nullable=False)
    role            = Column(String, nullable=False)           # MESSAGE_ROLE
    content         = Column(Text, nullable=False)
    tokens_used     = Column(Integer, default=0, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow, nullable=False)

    conversation = relationship("AgentConversation", back_populates="messages")


class AgentWebhook(Base):
    __tablename__ = "agent_webhooks"

    id         = Column(String, primary_key=True, default=_uuid_hex)
    agent_id   = Column(String, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    event      = Column(String, nullable=False)                # WEBHOOK_EVENTS
    url        = Column(String, nullable=False)
    secret     = Column(EncryptedString)                       # opcional — usado em HMAC-SHA256
    active     = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    agent = relationship("Agent", back_populates="webhooks")
