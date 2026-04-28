# Cleanup de dados — produção (VPS Hostinger)

Procedimento pra zerar o banco e os uploads no servidor de produção,
preservando configurações e credenciais externas (login Hostinger, SSH, env vars).

## Pré-requisitos

- Acesso ao terminal web da Hostinger ou SSH na VPS (`76.13.231.189`)
- O sistema rodando via `docker-compose.prod.yml` na VPS
- Pelo menos 50 MB livres pro backup

## Passos

### 1) Acesse a VPS

Abre o **terminal web** no painel Hostinger
(*VPS → seu host → Terminal*) ou via SSH:

```bash
ssh root@76.13.231.189
```

### 2) Vá pro diretório do projeto

```bash
cd ~/secretary-ai      # ou onde o repo estiver clonado na VPS
```

### 3) Faça backup ANTES de qualquer coisa

```bash
mkdir -p backend/backups
TS=$(date +%Y-%m-%d-%H%M%S)

# Backup binário do SQLite
docker cp felipe-backend:/data/felipe_hub.db backend/backups/pre_cleanup_VPS_$TS.db

# Dump SQL (texto, fácil de inspecionar)
docker exec felipe-backend python -c "
import sqlite3
conn = sqlite3.connect('/data/felipe_hub.db')
with open('/data/dump.sql', 'w') as f:
    for line in conn.iterdump():
        f.write(line + '\n')
"
docker cp felipe-backend:/data/dump.sql backend/backups/pre_cleanup_VPS_$TS.sql
docker exec felipe-backend rm /data/dump.sql

ls -lh backend/backups/pre_cleanup_VPS_$TS.*
```

**Confirme que ambos os arquivos têm tamanho > 0 antes de seguir.**

### 4) (Opcional, mas recomendado) Veja o que tem no banco agora

```bash
docker exec felipe-backend python -c "
from sqlalchemy import inspect, text
from services.database import engine, SessionLocal
import models.profile, models.message_log, models.banking, models.task
db = SessionLocal()
for t in sorted(inspect(engine).get_table_names()):
    n = db.execute(text(f'SELECT COUNT(*) FROM {t}')).scalar()
    if n > 0:
        print(f'  {t}: {n}')
"
```

### 5) Garanta que o repo está atualizado (pega o script de cleanup)

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build backend
```

(Se a VPS já tem o commit `chore: scripts de limpeza de dados`, este passo é só `git pull`.)

### 6) Execute a limpeza

```bash
docker exec felipe-backend python /app/scripts/cleanup_data.py
```

Saída esperada (pode variar):

```
════════════════════════════════════════════════════════════
Felipe Hub — Cleanup de dados
════════════════════════════════════════════════════════════

Estado antes: N linhas em 23 tabelas
  · ...
Drop all tables…
Recreate all tables…

Estado depois: 0 linhas em 23 tabelas

Apagando N arquivo(s) em /data/uploads…

✓ N linhas removidas de 23 tabelas
✓ N arquivo(s) apagados em /data/uploads
✓ Schemas recriados (autoincrement zerado)
```

### 7) Verifique

```bash
docker exec felipe-backend python -c "
from sqlalchemy import inspect, text
from services.database import engine, SessionLocal
import models.profile, models.message_log, models.banking, models.task
db = SessionLocal()
total = sum(db.execute(text(f'SELECT COUNT(*) FROM {t}')).scalar() for t in inspect(engine).get_table_names())
print(f'TOTAL: {total} linhas')
"
docker exec felipe-backend find /data/uploads -type f
```

`TOTAL: 0 linhas` e `find` sem arquivos = sucesso.

### 8) Reinicie o backend (limpa cache em memória — CNPJ, CPF lookups)

```bash
docker compose -f docker-compose.prod.yml restart backend
```

### 9) Confirme no navegador

Acessa https://hub.76-13-231-189.sslip.io/quem-sou-eu — perfil deve estar
vazio. https://hub.76-13-231-189.sslip.io/tarefas — 3 colunas padrão recém-criadas.

## Em caso de erro

Se algo der errado e quiser reverter:

```bash
# Restaura o backup binário
docker cp backend/backups/pre_cleanup_VPS_TS.db felipe-backend:/data/felipe_hub.db
docker compose -f docker-compose.prod.yml restart backend
```

## O que **NÃO** foi tocado (e não deve ser)

- `.env` (chaves Anthropic, ENCRYPTION_KEY, CPF_LOOKUP_API_KEY) — preservadas
- Credenciais Hostinger / SSH / GitHub — externas ao app, intactas
- Volume `caddy-data` (certificados Let's Encrypt) — intacto
- `evolution-postgres` / `evolution-redis` (dados WhatsApp Evolution) — intactos.
  Se quiser limpar histórico de WhatsApp também, é outro procedimento separado.
