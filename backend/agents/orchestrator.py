from crewai import Agent, Task, Crew, Process, LLM
from typing import AsyncGenerator
import asyncio
import config


AGENTS_CONFIG = {
    "claude": {
        "name": "Claude (Escrita & Raciocínio)",
        "model": "claude-sonnet-4-6",
        "color": "purple",
        "role": "Especialista em Escrita e Raciocínio",
        "goal": "Redigir textos, e-mails, relatórios e fazer análises complexas com excelência",
        "backstory": "Você é o Claude, especialista em linguagem natural, escrita criativa e raciocínio lógico. Use suas capacidades para produzir respostas claras, bem estruturadas e precisas.",
        "keywords": ["escrever", "redigir", "email", "relatório", "texto", "resumo", "explicar", "analisar", "documento", "carta", "mensagem"],
    },
    "gpt": {
        "name": "GPT-4o (Código & Dados)",
        "model": "gpt-4o",
        "color": "green",
        "role": "Especialista em Código e Análise de Dados",
        "goal": "Escrever código, depurar erros, analisar dados e resolver problemas técnicos",
        "backstory": "Você é o GPT-4o, especialista em programação e análise de dados. Você produz código limpo, eficiente e bem documentado em qualquer linguagem.",
        "keywords": ["código", "code", "programar", "script", "bug", "erro", "python", "javascript", "dados", "análise", "calcular", "função", "api", "banco"],
    },
    "gemini": {
        "name": "Gemini (Pesquisa & Multimodal)",
        "model": "gemini/gemini-1.5-pro",
        "color": "blue",
        "role": "Especialista em Pesquisa e Conteúdo Multimodal",
        "goal": "Pesquisar informações, analisar imagens, vídeos e processar documentos grandes",
        "backstory": "Você é o Gemini, especialista em pesquisa profunda e processamento multimodal. Você analisa grandes volumes de informação e extrai insights valiosos.",
        "keywords": ["pesquisar", "buscar", "pesquisa", "imagem", "foto", "vídeo", "documento longo", "comparar", "mercado", "notícia", "atualidade"],
    },
}


def _get_llm(agent_key: str) -> LLM:
    cfg = AGENTS_CONFIG[agent_key]
    model = cfg["model"]

    if agent_key == "claude":
        return LLM(model=model, api_key=config.ANTHROPIC_API_KEY)
    elif agent_key == "gpt":
        return LLM(model=model, api_key=config.OPENAI_API_KEY)
    elif agent_key == "gemini":
        return LLM(model=model, api_key=config.GOOGLE_API_KEY)

    return LLM(model=model)


def _route(user_input: str) -> str:
    lower = user_input.lower()
    scores = {key: 0 for key in AGENTS_CONFIG}

    for key, cfg in AGENTS_CONFIG.items():
        for kw in cfg["keywords"]:
            if kw in lower:
                scores[key] += 1

    best = max(scores, key=lambda k: scores[k])
    # fallback to claude if no keywords matched
    return best if scores[best] > 0 else "claude"


async def process(user_input: str) -> AsyncGenerator[dict, None]:
    yield {"type": "status", "agent": "orchestrator", "agentName": "Secretário", "color": "gray", "message": "Analisando sua solicitação..."}

    agent_key = _route(user_input)
    cfg = AGENTS_CONFIG[agent_key]

    yield {"type": "status", "agent": agent_key, "agentName": cfg["name"], "color": cfg["color"], "message": f"Delegando para {cfg['name']}..."}

    llm = _get_llm(agent_key)

    agent = Agent(
        role=cfg["role"],
        goal=cfg["goal"],
        backstory=cfg["backstory"],
        llm=llm,
        verbose=False,
    )

    task = Task(
        description=f"Responda em português brasileiro: {user_input}",
        agent=agent,
        expected_output="Uma resposta completa e útil para o usuário.",
    )

    crew = Crew(
        agents=[agent],
        tasks=[task],
        process=Process.sequential,
        verbose=False,
    )

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, crew.kickoff)

    yield {
        "type": "message",
        "agent": agent_key,
        "agentName": cfg["name"],
        "color": cfg["color"],
        "content": str(result),
    }
