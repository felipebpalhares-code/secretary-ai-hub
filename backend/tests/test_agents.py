"""
Sprint 1 — testes do módulo de Agentes IA.
"""
from __future__ import annotations
import json


# ───────────────────────── helpers ─────────────────────────

def _create_agent(client, **overrides):
    payload = {
        "name": "Dr. Silva",
        "role": "Advogado Pessoal",
        "description": "Cuida dos contratos e processos",
        "persona": "Detalhista, objetivo, conhece direito civil",
        "instructions": [
            {"content": "Sempre alertar prazos processuais", "order": 0},
            {"content": "Nunca dar conselho sem ressalva 'rascunho — revisar'", "order": 1},
        ],
    }
    payload.update(overrides)
    r = client.post("/api/agents", json=payload)
    assert r.status_code == 201, r.text
    return r.json()


# ───────────────────────── tests ─────────────────────────

def test_create_agent(client):
    data = _create_agent(client)
    assert data["id"]
    assert data["name"] == "Dr. Silva"
    assert data["role"] == "Advogado Pessoal"
    assert data["status"] == "draft"
    assert len(data["instructions"]) == 2
    # system_prompt foi gerado a partir de persona+instructions
    assert "Detalhista" in (data["system_prompt"] or "")
    assert "prazos processuais" in (data["system_prompt"] or "")


def test_list_agents(client):
    _create_agent(client, name="Maria")
    _create_agent(client, name="João")
    r = client.get("/api/agents")
    assert r.status_code == 200
    body = r.json()
    names = [a["name"] for a in body]
    assert "Maria" in names and "João" in names


def test_upload_document_indexes_to_chroma(client, mock_chroma, tmp_path):
    agent = _create_agent(client)
    txt = b"Felipe Braz Palhares e dono da PalharesTech.\n" * 10
    files = {"file": ("notas.txt", txt, "text/plain")}
    r = client.post(f"/api/agents/{agent['id']}/documents", files=files)
    assert r.status_code == 201, r.text
    doc = r.json()
    assert doc["status"] == "ready"
    assert doc["chunks_count"] >= 1

    # Confirma que o upsert no Chroma foi chamado com vetores e metadados
    upsert_calls = mock_chroma["collection"].upsert.call_args_list
    assert upsert_calls, "esperava upsert na collection do Chroma"
    kwargs = upsert_calls[0].kwargs
    assert kwargs["ids"]
    assert kwargs["documents"]
    assert kwargs["embeddings"]
    assert all(m.get("document_id") == doc["id"] for m in kwargs["metadatas"])

    # GET lista o documento
    r = client.get(f"/api/agents/{agent['id']}/documents")
    assert r.status_code == 200
    assert any(d["id"] == doc["id"] for d in r.json())


def test_chat_returns_response(client, mock_chroma, mock_anthropic):
    agent = _create_agent(client)

    # cria conversa
    r = client.post(f"/api/agents/{agent['id']}/conversations", json={"title": None})
    assert r.status_code == 201, r.text
    conv = r.json()

    # envia mensagem (SSE)
    with client.stream(
        "POST",
        f"/api/conversations/{conv['id']}/messages",
        json={"content": "Oi, quem é você?"},
    ) as resp:
        assert resp.status_code == 200
        events = []
        for line in resp.iter_lines():
            if not line or not line.startswith("data: "):
                continue
            events.append(json.loads(line[len("data: "):]))

    types = [e["type"] for e in events]
    assert "meta" in types
    assert "delta" in types
    assert types[-1] == "done"

    full = "".join(e.get("content", "") for e in events if e["type"] == "delta")
    assert "Olá Felipe" in full

    # histórico foi persistido (user + assistant)
    r = client.get(f"/api/conversations/{conv['id']}/messages")
    assert r.status_code == 200
    msgs = r.json()
    roles = [m["role"] for m in msgs]
    assert roles == ["user", "assistant"]
    assert msgs[1]["content"].strip() != ""
