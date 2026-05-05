# Módulo de Agentes IA — Sprint 1 (backend)

> Backend completo para criação, treinamento e operação de agentes IA do Felipe Hub.
> Frontend será o **Sprint 2** — não foi tocado neste sprint.

## Visão geral do fluxo

```
                    ┌──────────────────────────────────────────┐
                    │              ROTA / ENDPOINT             │
                    └──────────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┼─────────────────────────────┐
        ▼                              ▼                             ▼
   agent_service              document_service                  chat_service
   (CRUD + system_prompt)     (upload→extract→chunk→Chroma)    (RAG → Anthropic stream)
                                       │                             │
                                       ▼                             ▼
                                  ChromaDB                   webhook_service (fire-and-forget)
                                  (HttpClient)                       │
                                                                     ▼
                                                              N8N / sistema externo
```

- Embeddings: `sentence-transformers/all-MiniLM-L6-v2`, **rodam no backend** (local, grátis)
- Vector store: ChromaDB em container separado (`http://chroma:8000` na rede Docker; porta 8001 no host só pra inspeção)
- LLM: Anthropic API direto, com `messages.stream()`
- Webhooks: `httpx` async, retry 3× com backoff exponencial, HMAC-SHA256 opcional

## Schema do banco

Todas as tabelas usam UUID hex como PK (string). Mono-usuário: nenhuma tabela carrega `user_id` — o agente pertence implicitamente ao Felipe.

| Tabela                  | Colunas-chave                                                                                        |
|-------------------------|------------------------------------------------------------------------------------------------------|
| `agents`                | `id, name, role, description, persona, system_prompt, model, temperature, max_tokens, status, …`   |
| `agent_instructions`    | `id, agent_id, content, order, created_at`                                                          |
| `agent_documents`       | `id, agent_id, filename, file_path, mime_type, chunks_count, total_tokens, status, error_message`  |
| `agent_conversations`   | `id, agent_id, title, created_at, updated_at`                                                       |
| `agent_messages`        | `id, conversation_id, role, content, tokens_used, created_at`                                       |
| `agent_webhooks`        | `id, agent_id, event, url, secret(encrypted), active, created_at`                                  |

Estados:
- `agents.status` ∈ `{draft, active, paused}`
- `agent_documents.status` ∈ `{processing, ready, failed}`
- `agent_messages.role` ∈ `{user, assistant, system}`
- `agent_webhooks.event` ∈ `{on_message_received, on_response_sent, on_action_taken}`

## Endpoints

### Agentes

```bash
# Criar
curl -X POST http://localhost:8000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Silva",
    "role": "Advogado Pessoal",
    "persona": "Detalhista, objetivo, especialista em direito civil",
    "instructions": [
      {"content": "Sempre alertar prazos processuais", "order": 0},
      {"content": "Marcar pareceres como RASCUNHO", "order": 1}
    ],
    "status": "active"
  }'

# Listar
curl http://localhost:8000/api/agents

# Detalhar
curl http://localhost:8000/api/agents/{agent_id}

# Atualizar
curl -X PATCH http://localhost:8000/api/agents/{agent_id} \
  -H "Content-Type: application/json" \
  -d '{"temperature": 0.3, "status": "active"}'

# Apagar (também limpa a collection do Chroma)
curl -X DELETE http://localhost:8000/api/agents/{agent_id}
```

### Instruções

```bash
curl -X POST http://localhost:8000/api/agents/{agent_id}/instructions \
  -H "Content-Type: application/json" \
  -d '{"content": "Citar OAB e nº do processo quando relevante", "order": 2}'

curl -X DELETE http://localhost:8000/api/agents/{agent_id}/instructions/{instruction_id}
```

> Toda mudança em persona/instructions recompila e persiste o `system_prompt`.

### Documentos (RAG)

```bash
# Upload (multipart) — pdf/docx/txt/md
curl -X POST http://localhost:8000/api/agents/{agent_id}/documents \
  -F "file=@contrato.pdf"

# Listar
curl http://localhost:8000/api/agents/{agent_id}/documents

# Apagar (remove vetores no Chroma + arquivo físico)
curl -X DELETE http://localhost:8000/api/agents/{agent_id}/documents/{document_id}
```

Pipeline interno: `extract_text` → `chunk_text(~500 tok, overlap 50)` → embeddings local → `chroma.upsert(...)`.

### Conversas e mensagens

```bash
# Criar conversa
curl -X POST http://localhost:8000/api/agents/{agent_id}/conversations \
  -H "Content-Type: application/json" -d '{"title": null}'

# Listar conversas do agente
curl http://localhost:8000/api/agents/{agent_id}/conversations

# Histórico de mensagens
curl http://localhost:8000/api/conversations/{conversation_id}/messages

# Apagar conversa
curl -X DELETE http://localhost:8000/api/conversations/{conversation_id}
```

#### Enviar mensagem (streaming SSE)

```bash
curl -N -X POST http://localhost:8000/api/conversations/{conversation_id}/messages \
  -H "Content-Type: application/json" \
  -d '{"content": "Quais prazos do processo trabalhista têm para essa semana?"}'
```

A resposta é `text/event-stream`. Cada frame `data:` traz um JSON:

```text
data: {"type":"meta","user_message_id":"...","assistant_message_id":"..."}
data: {"type":"delta","content":"Olá"}
data: {"type":"delta","content":" Felipe"}
...
data: {"type":"done","tokens_used":312}
```

Tipos: `meta` (1×, ids), `delta` (N×, pedaço de texto), `done` (1×, totais), `error` (em falha).

### Webhooks

```bash
# Criar
curl -X POST http://localhost:8000/api/agents/{agent_id}/webhooks \
  -H "Content-Type: application/json" \
  -d '{
    "event": "on_response_sent",
    "url":   "https://n8n.felipe.com/webhook/agent-resp",
    "secret": "minha-chave-compartilhada",
    "active": true
  }'

# Listar
curl http://localhost:8000/api/agents/{agent_id}/webhooks

# Atualizar (eventos, url, secret, active)
curl -X PATCH http://localhost:8000/api/webhooks/{webhook_id} \
  -H "Content-Type: application/json" -d '{"active": false}'

# Apagar
curl -X DELETE http://localhost:8000/api/webhooks/{webhook_id}
```

## Webhooks pra N8N

### Eventos disparados

| Evento                  | Quando                                                                |
|-------------------------|-----------------------------------------------------------------------|
| `on_message_received`   | Logo após o backend persistir a mensagem do usuário                  |
| `on_response_sent`      | Após o agente terminar de gerar a resposta (final do streaming)      |
| `on_action_taken`       | Reservado para Sprint 2 (function calling / ações)                   |

### Payload

```json
{
  "event":      "on_response_sent",
  "agent_id":   "5e6c2…",
  "timestamp":  "2026-05-05T14:32:11Z",
  "payload": {
    "conversation_id": "c3a8…",
    "message_id":      "m7e1…",
    "content":         "<texto da resposta>",
    "tokens_used":     312
  }
}
```

### Headers

| Header                   | Valor                                                  |
|--------------------------|--------------------------------------------------------|
| `Content-Type`           | `application/json`                                     |
| `User-Agent`             | `felipe-hub-agent-webhook/1.0`                        |
| `X-Webhook-Event`        | `on_message_received` \| `on_response_sent` \| …       |
| `X-Webhook-Agent-Id`     | UUID do agente                                         |
| `X-Webhook-Signature`    | `sha256=<hex>` — HMAC-SHA256(secret, body) (opcional) |

### Verificando a assinatura no N8N

No nó **Function** após o **Webhook**:

```js
const crypto = require('crypto');
const secret  = 'minha-chave-compartilhada';
const sig     = $headers['x-webhook-signature'];   // "sha256=..."
const expected = 'sha256=' + crypto
  .createHmac('sha256', secret)
  .update(JSON.stringify($json))   // ou rawBody
  .digest('hex');

if (sig !== expected) throw new Error('Assinatura inválida');
return [$json];
```

### Fluxo N8N básico (exemplo)

```
[Webhook]  ── POST /agent-resp
   │
   ▼
[Function] verifica X-Webhook-Signature
   │
   ▼
[Switch] $json.event
   ├── on_message_received → [Slack] notifica que chegou pergunta
   └── on_response_sent    → [Gmail] envia resposta para felipe@
```

### Confiabilidade

- 3 tentativas com backoff exponencial (1s → 2s → 4s)
- Falha não bloqueia o chat (fire-and-forget via `asyncio.create_task`)
- Logs em `/app/logs/webhooks.log` dentro do container do backend

## Arquivos físicos e ChromaDB

- Uploads: `/data/uploads/agents/{agent_id}/{document_id}__{filename}` (volume `hub-data`)
- ChromaDB: `./backend/chroma_data` no host, montado em `/chroma/chroma`
- Cache do modelo de embeddings: `/data/st-cache` e `/data/hf-cache` (mesmo volume `hub-data`)

## Rodando

```bash
docker compose up -d --build
docker compose logs -f backend
docker compose logs -f chroma
```

A 1ª subida do backend baixa o modelo `all-MiniLM-L6-v2` (~80MB). Persistido no volume.

## Testes

```bash
docker compose exec backend pytest tests/test_agents.py -v
```

Os testes mockam Chroma + sentence-transformers + Anthropic (não exigem rede).
