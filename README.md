# Felipe Hub

Hub multi-agente de IA conectado a Claude, GPT-4o e Gemini — com integração WhatsApp via Evolution API.

```
secretary-ai/
├── frontend/         Next.js 14 + Tailwind + TypeScript (10 telas)
├── backend/          FastAPI + WebSocket + SQLite + scheduler
├── docker-compose.yml
└── Makefile
```

## Setup rápido (2 caminhos)

### Caminho A · Docker (recomendado)

**1.** Instale uma engine Docker:
- **Docker Desktop**: https://www.docker.com/products/docker-desktop/
- **OrbStack** (mais leve no Mac): https://orbstack.dev

**2.** Configure as chaves:
```bash
cd secretary-ai
cp .env.example .env

# Gera uma ENCRYPTION_KEY (precisa pro cofre)
make keygen
# Cole a saída no .env como ENCRYPTION_KEY=...

# Adicione pelo menos um LLM no .env:
# ANTHROPIC_API_KEY=sk-ant-...
```

**3.** Sobe o backend:
```bash
make up
# ✓ Backend em http://localhost:8000

# Rodar com WhatsApp:
make up-wa
# ✓ Backend + Evolution API em http://localhost:8080
```

**4.** Sobe o frontend:
```bash
cd frontend
npm install --cache /tmp/npm-cache
npm run dev
# ✓ Frontend em http://localhost:3000
```

Abra **http://localhost:3000/bater-papo** — o badge no topo vai virar **🟢 Online**.

### Caminho B · Python local

```bash
xcode-select --install                    # Mac: Xcode tools
brew install python@3.12                  # Python 3.12

cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env                      # editar com chaves
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Cola no .env como ENCRYPTION_KEY=

uvicorn main:app --reload
```

## Comandos Make

```bash
make help     # lista comandos
make keygen   # gera ENCRYPTION_KEY
make up       # sobe backend
make up-wa    # sobe backend + Evolution (WhatsApp)
make down     # para tudo
make logs     # streams logs do backend
make build    # rebuild da imagem
make sh       # shell no container
make clean    # ⚠️ apaga banco SQLite
```

## Endpoints do backend

| Método | Path | Descrição |
|---|---|---|
| GET | `/health` | Healthcheck |
| WS | `/ws` | Chat com orchestrator (multi-agente) |
| GET | `/api/connections/whatsapp/status` | Status Evolution |
| GET | `/api/connections/whatsapp/qrcode` | QR pra parear |
| POST | `/api/connections/whatsapp/disconnect` | Desconecta sessão |
| POST | `/api/connections/whatsapp/send-alert` | Envia alerta proativo |
| POST | `/api/connections/webhooks/whatsapp` | Webhook Evolution (incoming) |
| POST | `/api/connections/webhooks/telegram` | Webhook Telegram |
| POST | `/api/connections/discord/post` | Posta como agente |
| GET | `/api/connections/logs` | Log unificado (todos os canais) |
| GET | `/api/connections/logs/search?q=` | Busca cross-canal |

## Frontend (10 telas)

| URL | Descrição |
|---|---|
| `/` | Painel · 6 stats + 3 alertas |
| `/quem-sou-eu` | Perfil 7 abas (Identidade, Empresarial, Família, etc) |
| `/agentes` | 8 agentes com painel de treinamento |
| `/bater-papo` | Chat 3 colunas com WebSocket |
| `/financas` | Árvore dinâmica + entity detail |
| `/contatos` | CRM com filtros |
| `/agenda` | Week view + Google Calendar |
| `/bancos` | 7 abas: Geral / Extrato / Cartões / PIX / Boletos / Tributos / Análise |
| `/documentos` | Grid + OCR + drawer |
| `/configuracoes` | WhatsApp Evolution + logs |

## Os 8 agentes

| Agente | Especialidade | LLM |
|---|---|---|
| ⚖️ **Dr. Silva** | Jurídico | Claude |
| 💰 **Ricardo** | Financeiro (CFO) | Claude |
| 🏗️ **Engenheiro** | Obras Vimar | GPT-4o |
| 🌸 **Ana** | Família e agenda | Claude |
| 🏢 **Diretor** | Empresas | GPT-4o |
| 🏛️ **Marcos** | Governo / tributos | Gemini |
| ✉️ **Clara** | E-mails | Claude |
| 🩺 **Dr. Carlos** | Saúde | Claude |

Cada agente tem system prompt próprio, especialidades editáveis, base de documentos e nível (Master/Expert/Sênior/Básico) baseado em quanto foi treinado.

## Scheduler

Rodando em background ao subir o backend:

- **07:00** — Briefing diário (todos os agentes)
- **12:00** — Alertas do meio-dia
- **18:00** — Resumo do dia + pendências

Cada um envia para WhatsApp + Telegram + Discord (se configurados).

## Segurança

- Cofre de senhas com **AES-256 (Fernet)** — campos sensíveis criptografados antes de salvar no SQLite
- WhatsApp via **Evolution API** auto-hospedada (não dependemos de WhatsApp Business oficial)
- Modo "Não Perturbe" 22h–06h30, urgências sempre passam
- Confirmações 2FA exigidas pra PIX > R$1.000
- Aprovação do Ricardo pra PIX > R$50k
