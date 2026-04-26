"""
Roteador de mensagens WhatsApp → agente correto.
Mantém sessão por número (expira em 30min) e responde menu / comandos.
"""
from __future__ import annotations
import time
from dataclasses import dataclass, field
from typing import Literal

SESSION_TTL = 30 * 60   # 30 minutos

AgentKey = Literal["silva", "ricardo", "engenheiro", "ana", "diretor", "marcos", "clara", "carlos"]


# Mapeamento de opção de menu → agente
MENU_MAP: dict[str, AgentKey | str] = {
    "1": "silva", "2": "ricardo", "3": "engenheiro", "4": "ana",
    "5": "diretor", "6": "marcos", "7": "clara", "8": "carlos",
    "9": "briefing", "0": "urgente",
}

# Palavras-chave → agente (roteamento livre)
KEYWORD_RULES: list[tuple[list[str], AgentKey]] = [
    (["processo", "prazo", "advogado", "contrato", "ação", "vara", "oab"], "silva"),
    (["fatura", "boleto", "banco", "dinheiro", "investimento", "conta", "pagar", "gastar"], "ricardo"),
    (["obra", "bloco", "empreiteiro", "vimar", "cronograma", "terreno"], "engenheiro"),
    (["agenda", "família", "filho", "ana", "sofia", "mateus", "aniversário", "escola"], "ana"),
    (["empresa", "sócio", "palharestech", "distribuidora", "cnpj", "pipeline"], "diretor"),
    (["certidão", "e-cac", "gov.br", "receita", "darf", "fgts", "imposto"], "marcos"),
    (["email", "e-mail", "resposta", "responder", "caixa"], "clara"),
    (["consulta", "exame", "saúde", "médico", "dr.", "doutor", "plano"], "carlos"),
]


@dataclass
class Session:
    number: str
    current_agent: AgentKey | None = None
    last_activity: float = field(default_factory=time.time)
    history: list[dict] = field(default_factory=list)

    def expired(self) -> bool:
        return (time.time() - self.last_activity) > SESSION_TTL

    def touch(self) -> None:
        self.last_activity = time.time()


class WhatsAppRouter:
    def __init__(self):
        self.sessions: dict[str, Session] = {}

    def _get_session(self, number: str) -> Session:
        s = self.sessions.get(number)
        if not s or s.expired():
            s = Session(number=number)
            self.sessions[number] = s
        return s

    def route(self, number: str, text: str) -> dict:
        """
        Retorna um dict com:
          - action: "menu" | "agent" | "broadcast" | "urgent" | "briefing"
          - agent: AgentKey | None
          - reply: str | None   (resposta imediata do sistema, se houver)
        """
        session = self._get_session(number)
        session.touch()
        session.history.append({"ts": time.time(), "from": "user", "text": text})

        t = text.strip().lower()

        # Comandos especiais
        if t in ("menu", "ajuda", "help", "oi", "olá"):
            session.current_agent = None
            return {"action": "menu", "agent": None, "reply": None}

        if t in ("trocar", "mudar", "sair"):
            session.current_agent = None
            return {"action": "menu", "agent": None, "reply": "Trocando de agente.\nQual você quer agora?"}

        if t.startswith("urgente"):
            return {"action": "urgent", "agent": None, "reply": None, "message": text}

        if t in ("briefing", "resumo", "status"):
            return {"action": "briefing", "agent": None, "reply": None}

        # Seleção por número do menu
        if t in MENU_MAP:
            choice = MENU_MAP[t]
            if choice == "briefing":
                return {"action": "briefing", "agent": None, "reply": None}
            if choice == "urgente":
                return {"action": "urgent", "agent": None, "reply": None, "message": ""}
            session.current_agent = choice  # type: ignore[assignment]
            return {"action": "agent", "agent": choice, "reply": None}

        # Já tem sessão com agente → continua com ele
        if session.current_agent:
            return {"action": "agent", "agent": session.current_agent, "reply": None}

        # Roteamento por palavras-chave
        agent = self._match_keywords(t)
        if agent:
            session.current_agent = agent
            return {"action": "agent", "agent": agent, "reply": None}

        # Fallback: Hub IA decide
        return {"action": "agent", "agent": "silva", "reply": None}  # default conservador

    def _match_keywords(self, text: str) -> AgentKey | None:
        scores: dict[AgentKey, int] = {}
        for keywords, agent in KEYWORD_RULES:
            hits = sum(1 for kw in keywords if kw in text)
            if hits:
                scores[agent] = scores.get(agent, 0) + hits
        if not scores:
            return None
        return max(scores, key=lambda a: scores[a])


router = WhatsAppRouter()
