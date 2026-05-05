"""
Rotas REST do módulo de Agentes IA.
"""
from __future__ import annotations
import json
from typing import Any, AsyncGenerator

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from models.agent import AgentWebhook
from schemas.agents import (
    AgentCreate, AgentUpdate, AgentResponse,
    InstructionCreate, InstructionResponse,
    DocumentResponse,
    ConversationCreate, ConversationResponse,
    MessageCreate, MessageResponse,
    WebhookCreate, WebhookUpdate, WebhookResponse,
)
from services.agents import agent_service, chat_service
from services.agents import document_service as docsvc
from services.database import get_session

router = APIRouter(prefix="/api", tags=["agents"])


# ═══════════════════════════ AGENTS ═══════════════════════════

@router.post("/agents", response_model=AgentResponse, status_code=201)
def create_agent(payload: AgentCreate, db: Session = Depends(get_session)):
    return agent_service.create_agent(db, payload)


@router.get("/agents", response_model=list[AgentResponse])
def list_agents(db: Session = Depends(get_session)):
    return agent_service.list_agents(db)


@router.get("/agents/{agent_id}", response_model=AgentResponse)
def get_agent(agent_id: str, db: Session = Depends(get_session)):
    agent = agent_service.get_agent(db, agent_id)
    if not agent:
        raise HTTPException(404, "Agente não encontrado")
    return agent


@router.patch("/agents/{agent_id}", response_model=AgentResponse)
def update_agent(agent_id: str, payload: AgentUpdate, db: Session = Depends(get_session)):
    agent = agent_service.update_agent(db, agent_id, payload)
    if not agent:
        raise HTTPException(404, "Agente não encontrado")
    return agent


@router.delete("/agents/{agent_id}")
def delete_agent(agent_id: str, db: Session = Depends(get_session)):
    if not agent_service.delete_agent(db, agent_id):
        raise HTTPException(404, "Agente não encontrado")
    return {"ok": True}


# ═══════════════════════════ INSTRUCTIONS ═══════════════════════════

@router.post("/agents/{agent_id}/instructions", response_model=InstructionResponse, status_code=201)
def add_instruction(agent_id: str, payload: InstructionCreate, db: Session = Depends(get_session)):
    instr = agent_service.add_instruction(db, agent_id, payload)
    if not instr:
        raise HTTPException(404, "Agente não encontrado")
    return instr


@router.delete("/agents/{agent_id}/instructions/{instruction_id}")
def remove_instruction(agent_id: str, instruction_id: str, db: Session = Depends(get_session)):
    if not agent_service.delete_instruction(db, instruction_id):
        raise HTTPException(404, "Instrução não encontrada")
    return {"ok": True}


# ═══════════════════════════ DOCUMENTS ═══════════════════════════

@router.post("/agents/{agent_id}/documents", response_model=DocumentResponse, status_code=201)
async def upload_document(
    agent_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_session),
):
    if file.content_type not in docsvc.ALLOWED_MIME and file.filename.split(".")[-1].lower() not in {"pdf", "docx", "doc", "txt", "md"}:
        raise HTTPException(415, f"Tipo não suportado: {file.content_type}")
    content = await file.read()
    doc = docsvc.upload_document(
        db=db,
        agent_id=agent_id,
        filename=file.filename or "upload.bin",
        content=content,
        mime_type=file.content_type,
    )
    if not doc:
        raise HTTPException(404, "Agente não encontrado")
    return doc


@router.get("/agents/{agent_id}/documents", response_model=list[DocumentResponse])
def list_documents(agent_id: str, db: Session = Depends(get_session)):
    if not agent_service.get_agent(db, agent_id):
        raise HTTPException(404, "Agente não encontrado")
    return docsvc.list_documents(db, agent_id)


@router.delete("/agents/{agent_id}/documents/{document_id}")
def delete_document(agent_id: str, document_id: str, db: Session = Depends(get_session)):
    doc = docsvc.get_document(db, document_id)
    if not doc or doc.agent_id != agent_id:
        raise HTTPException(404, "Documento não encontrado")
    docsvc.delete_document(db, document_id)
    return {"ok": True}


# ═══════════════════════════ CONVERSATIONS ═══════════════════════════

@router.post("/agents/{agent_id}/conversations", response_model=ConversationResponse, status_code=201)
def create_conversation(agent_id: str, payload: ConversationCreate, db: Session = Depends(get_session)):
    conv = chat_service.create_conversation(db, agent_id, payload.title)
    if not conv:
        raise HTTPException(404, "Agente não encontrado")
    return conv


@router.get("/agents/{agent_id}/conversations", response_model=list[ConversationResponse])
def list_conversations(agent_id: str, db: Session = Depends(get_session)):
    if not agent_service.get_agent(db, agent_id):
        raise HTTPException(404, "Agente não encontrado")
    return chat_service.list_conversations(db, agent_id)


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: str, db: Session = Depends(get_session)):
    conv = chat_service.get_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(404, "Conversa não encontrada")
    return conv


@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str, db: Session = Depends(get_session)):
    if not chat_service.delete_conversation(db, conversation_id):
        raise HTTPException(404, "Conversa não encontrada")
    return {"ok": True}


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
def list_messages(conversation_id: str, db: Session = Depends(get_session)):
    conv = chat_service.get_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(404, "Conversa não encontrada")
    return chat_service.get_conversation_messages(db, conversation_id)


# ─── streaming SSE: POST /api/conversations/{id}/messages ───

async def _sse_stream(generator: AsyncGenerator[dict[str, Any], None]) -> AsyncGenerator[bytes, None]:
    """Embrulha um async-generator de dicts em frames SSE."""
    async for chunk in generator:
        yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n".encode("utf-8")


@router.post("/conversations/{conversation_id}/messages")
async def post_message(
    conversation_id: str,
    payload: MessageCreate,
    db: Session = Depends(get_session),
):
    """
    Envia mensagem do usuário para o agente e retorna a resposta em streaming SSE.

    Cada `data:` carrega um dict com `type` ∈ {"meta","delta","done","error"}.
    Veja schemas.agents.MessageChunk.
    """
    conv = chat_service.get_conversation(db, conversation_id)
    if not conv:
        raise HTTPException(404, "Conversa não encontrada")

    gen = chat_service.send_message(db, conversation_id, payload.content)
    return StreamingResponse(
        _sse_stream(gen),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection":    "keep-alive",
            "X-Accel-Buffering": "no",  # disable nginx/caddy buffering
        },
    )


# ═══════════════════════════ WEBHOOKS ═══════════════════════════

def _webhook_to_out(w: AgentWebhook) -> WebhookResponse:
    return WebhookResponse(
        id=w.id,
        agent_id=w.agent_id,
        event=w.event,
        url=w.url,
        has_secret=bool(w.secret),
        active=w.active,
        created_at=w.created_at,
    )


@router.post("/agents/{agent_id}/webhooks", response_model=WebhookResponse, status_code=201)
def create_webhook(agent_id: str, payload: WebhookCreate, db: Session = Depends(get_session)):
    if not agent_service.get_agent(db, agent_id):
        raise HTTPException(404, "Agente não encontrado")
    w = AgentWebhook(
        agent_id=agent_id,
        event=payload.event,
        url=str(payload.url),
        secret=payload.secret,
        active=payload.active,
    )
    db.add(w); db.commit(); db.refresh(w)
    return _webhook_to_out(w)


@router.get("/agents/{agent_id}/webhooks", response_model=list[WebhookResponse])
def list_webhooks(agent_id: str, db: Session = Depends(get_session)):
    if not agent_service.get_agent(db, agent_id):
        raise HTTPException(404, "Agente não encontrado")
    rows = db.query(AgentWebhook).filter(AgentWebhook.agent_id == agent_id).all()
    return [_webhook_to_out(w) for w in rows]


@router.patch("/webhooks/{webhook_id}", response_model=WebhookResponse)
def update_webhook(webhook_id: str, payload: WebhookUpdate, db: Session = Depends(get_session)):
    w = db.get(AgentWebhook, webhook_id)
    if not w:
        raise HTTPException(404, "Webhook não encontrado")
    data = payload.model_dump(exclude_unset=True)
    if "url" in data and data["url"] is not None:
        data["url"] = str(data["url"])
    for k, v in data.items():
        setattr(w, k, v)
    db.commit(); db.refresh(w)
    return _webhook_to_out(w)


@router.delete("/webhooks/{webhook_id}")
def delete_webhook(webhook_id: str, db: Session = Depends(get_session)):
    w = db.get(AgentWebhook, webhook_id)
    if not w:
        raise HTTPException(404, "Webhook não encontrado")
    db.delete(w); db.commit()
    return {"ok": True}
