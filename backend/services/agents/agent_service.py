"""
CRUD de agentes IA + gerenciamento de instruções.

Toda mudança em persona/instructions recompila o system_prompt e persiste
no campo `Agent.system_prompt` — assim o chat_service não precisa montar
em cada chamada.
"""
from __future__ import annotations
from typing import Optional

from sqlalchemy.orm import Session

from models.agent import Agent, AgentInstruction
from schemas.agents import AgentCreate, AgentUpdate, InstructionCreate


# ───────────────────── system prompt builder ─────────────────────

_SYSTEM_PROMPT_TEMPLATE = """\
Você é {name}, {role}.

{persona_section}{instructions_section}\
Responda sempre em português brasileiro, de forma direta e profissional.
Quando houver contexto relevante de documentos, use-o como base factual e
cite trechos quando apropriado. Se a pergunta estiver fora do seu escopo
ou dos documentos disponíveis, diga isso claramente em vez de inventar.
"""


def build_system_prompt(agent: Agent) -> str:
    persona_section = ""
    if agent.persona and agent.persona.strip():
        persona_section = f"## Quem você é\n{agent.persona.strip()}\n\n"

    instructions_section = ""
    if agent.instructions:
        ordered = sorted(agent.instructions, key=lambda i: i.order)
        bullets = "\n".join(f"- {i.content.strip()}" for i in ordered if i.content.strip())
        if bullets:
            instructions_section = f"## Instruções específicas\n{bullets}\n\n"

    return _SYSTEM_PROMPT_TEMPLATE.format(
        name=agent.name,
        role=agent.role,
        persona_section=persona_section,
        instructions_section=instructions_section,
    )


def _refresh_system_prompt(db: Session, agent: Agent) -> None:
    db.refresh(agent)
    agent.system_prompt = build_system_prompt(agent)
    db.commit()
    db.refresh(agent)


# ───────────────────── agents CRUD ─────────────────────

def create_agent(db: Session, payload: AgentCreate) -> Agent:
    agent = Agent(
        name=payload.name.strip(),
        role=payload.role.strip(),
        description=payload.description,
        persona=payload.persona,
        model=payload.model,
        temperature=payload.temperature,
        max_tokens=payload.max_tokens,
        status=payload.status,
    )
    db.add(agent)
    db.flush()  # gera o id

    for instr in payload.instructions:
        db.add(AgentInstruction(
            agent_id=agent.id,
            content=instr.content.strip(),
            order=instr.order,
        ))

    db.commit()
    _refresh_system_prompt(db, agent)
    return agent


def list_agents(db: Session) -> list[Agent]:
    return db.query(Agent).order_by(Agent.created_at.desc()).all()


def get_agent(db: Session, agent_id: str) -> Optional[Agent]:
    return db.get(Agent, agent_id)


def update_agent(db: Session, agent_id: str, payload: AgentUpdate) -> Optional[Agent]:
    agent = db.get(Agent, agent_id)
    if not agent:
        return None
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(agent, k, v)
    db.commit()
    _refresh_system_prompt(db, agent)
    return agent


def delete_agent(db: Session, agent_id: str) -> bool:
    agent = db.get(Agent, agent_id)
    if not agent:
        return False

    # Limpa a collection do Chroma antes de apagar a row (cascade leva o resto).
    # Import inline pra evitar ciclo: agent_service ↔ document_service.
    try:
        from services.agents.document_service import drop_agent_collection
        drop_agent_collection(agent_id)
    except Exception:
        # Se o Chroma estiver fora do ar, a row vai ainda assim — orfão é melhor
        # que bloquear o delete. Rotina de manutenção pode limpar depois.
        pass

    db.delete(agent)
    db.commit()
    return True


# ───────────────────── instructions ─────────────────────

def add_instruction(db: Session, agent_id: str, payload: InstructionCreate) -> Optional[AgentInstruction]:
    agent = db.get(Agent, agent_id)
    if not agent:
        return None
    instr = AgentInstruction(
        agent_id=agent_id,
        content=payload.content.strip(),
        order=payload.order,
    )
    db.add(instr)
    db.commit()
    db.refresh(instr)
    _refresh_system_prompt(db, agent)
    return instr


def delete_instruction(db: Session, instruction_id: str) -> bool:
    instr = db.get(AgentInstruction, instruction_id)
    if not instr:
        return False
    agent = instr.agent
    db.delete(instr)
    db.commit()
    if agent:
        _refresh_system_prompt(db, agent)
    return True
