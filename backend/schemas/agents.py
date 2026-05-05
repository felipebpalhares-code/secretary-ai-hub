"""
Schemas Pydantic do módulo de Agentes IA.
"""
from __future__ import annotations
from datetime import datetime
from typing import List, Optional, Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


# ───────────────────────── Instructions ─────────────────────────

class InstructionCreate(BaseModel):
    content: str
    order: int = 0


class InstructionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    agent_id: str
    content: str
    order: int
    created_at: datetime


# ───────────────────────── Agents ─────────────────────────

AgentStatus = Literal["draft", "active", "paused"]


class AgentCreate(BaseModel):
    name: str
    role: str
    description: Optional[str] = None
    persona: Optional[str] = None
    model: str = "claude-sonnet-4-5-20250929"
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(default=2048, ge=1, le=64_000)
    status: AgentStatus = "draft"
    instructions: List[InstructionCreate] = []


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None
    persona: Optional[str] = None
    model: Optional[str] = None
    temperature: Optional[float] = Field(default=None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(default=None, ge=1, le=64_000)
    status: Optional[AgentStatus] = None


class AgentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    role: str
    description: Optional[str] = None
    persona: Optional[str] = None
    system_prompt: Optional[str] = None
    model: str
    temperature: float
    max_tokens: int
    status: AgentStatus
    created_at: datetime
    updated_at: datetime
    instructions: List[InstructionResponse] = []


# ───────────────────────── Documents ─────────────────────────

DocumentStatus = Literal["processing", "ready", "failed"]


class DocumentResponse(BaseModel):
    """Sem o conteúdo do arquivo — apenas metadados."""
    model_config = ConfigDict(from_attributes=True)
    id: str
    agent_id: str
    filename: str
    mime_type: Optional[str] = None
    chunks_count: int
    total_tokens: int
    status: DocumentStatus
    error_message: Optional[str] = None
    created_at: datetime


# ───────────────────────── Conversations & Messages ─────────────────────────

MessageRole = Literal["user", "assistant", "system"]


class ConversationCreate(BaseModel):
    title: Optional[str] = None


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    agent_id: str
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    conversation_id: str
    role: MessageRole
    content: str
    tokens_used: int
    created_at: datetime


class MessageChunk(BaseModel):
    """Pedaço do streaming SSE — usado em POST /api/conversations/{id}/messages."""
    type: Literal["delta", "done", "error", "meta"]
    content: Optional[str] = None
    # meta: enviado uma vez antes do primeiro delta
    user_message_id: Optional[str] = None
    assistant_message_id: Optional[str] = None
    # done: tokens totais e id final
    tokens_used: Optional[int] = None


# ───────────────────────── Webhooks ─────────────────────────

WebhookEvent = Literal["on_message_received", "on_response_sent", "on_action_taken"]


class WebhookCreate(BaseModel):
    event: WebhookEvent
    url: HttpUrl
    secret: Optional[str] = None
    active: bool = True


class WebhookUpdate(BaseModel):
    event: Optional[WebhookEvent] = None
    url: Optional[HttpUrl] = None
    secret: Optional[str] = None
    active: Optional[bool] = None


class WebhookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    agent_id: str
    event: WebhookEvent
    url: str
    has_secret: bool
    active: bool
    created_at: datetime
