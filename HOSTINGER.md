# Deploy na Hostinger VPS

## Pré-requisitos

- ✅ VPS Hostinger comprada (KVM 2 ou superior · Ubuntu 22.04+)
- ✅ Domínio próprio (pode comprar na Hostinger)
- ✅ Acesso ao painel da Hostinger

---

## Passo 1 · DNS dos subdomínios

No painel da Hostinger → **Domínios** → seu domínio → **DNS / Nameservers** → **Records**:

Crie 3 registros tipo **A** apontando pro IP da VPS:

| Tipo | Nome | Valor (IP da VPS) | TTL |
|---|---|---|---|
| A | `hub` | `203.0.113.42` | 3600 |
| A | `api` | `203.0.113.42` | 3600 |
| A | `wa` | `203.0.113.42` | 3600 *(opcional)* |

> Substitua `203.0.113.42` pelo IP real. Aguarde ~5min pra propagar.

---

## Passo 2 · Conectar na VPS via SSH

No seu Mac:

```bash
# Substitua pelo IP real
ssh root@203.0.113.42
```

A senha root está no painel Hostinger → VPS → "Visão Geral" / "Acesso SSH".

---

## Passo 3 · Setup inicial do servidor (no VPS)

```bash
# Atualizar pacotes
apt update && apt upgrade -y

# Instalar essenciais
apt install -y git curl ufw fail2ban

# Firewall
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw --force enable

# Criar usuário não-root
adduser felipe
usermod -aG sudo felipe
mkdir -p /home/felipe/.ssh
cp ~/.ssh/authorized_keys /home/felipe/.ssh/   # se tiver SSH key
chown -R felipe:felipe /home/felipe/.ssh
chmod 700 /home/felipe/.ssh
chmod 600 /home/felipe/.ssh/authorized_keys 2>/dev/null

# Swap de 2GB (recomendado pra KVM 2)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

Reconecte como `felipe`:
```bash
exit
ssh felipe@203.0.113.42
```

---

## Passo 4 · Instalar Docker (no VPS)

```bash
# Docker CE oficial
curl -fsSL https://get.docker.com | sudo sh

# Permissão pro usuário
sudo usermod -aG docker felipe
newgrp docker   # ou logout+login

# Compose (já vem com Docker recente como plugin)
docker --version && docker compose version
```

---

## Passo 5 · Subir o código pra VPS

**Opção A · git clone** (se subiu pro GitHub):
```bash
cd ~
git clone https://github.com/SEU-USER/secretary-ai.git
cd secretary-ai
```

**Opção B · scp do Mac** (se ainda não subiu):
```bash
# Rode NO MAC:
cd /Users/flbx2026
tar czf secretary-ai.tgz \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.git' \
  --exclude='*.db' \
  secretary-ai/

scp secretary-ai.tgz felipe@203.0.113.42:~/

# Volte pra VPS:
ssh felipe@203.0.113.42
tar xzf secretary-ai.tgz
rm secretary-ai.tgz
cd secretary-ai
```

---

## Passo 6 · Configurar `.env` (na VPS)

```bash
cp .env.production.example .env
nano .env
```

Preencha **obrigatórios**:
```
DOMAIN_HUB=hub.seudominio.com.br
DOMAIN_API=api.seudominio.com.br
DOMAIN_WA=wa.seudominio.com.br
ACME_EMAIL=seu@email.com

ANTHROPIC_API_KEY=sk-ant-...
ENCRYPTION_KEY=    # gera com: openssl rand -base64 32 | tr '+/' '-_'
```

Gera a `ENCRYPTION_KEY`:
```bash
openssl rand -base64 32 | tr '+/' '-_'
# Cola a saída no .env
```

Salva (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## Passo 7 · Subir tudo

**Sem WhatsApp** (recomendo começar assim):
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

**Com WhatsApp** (Evolution):
```bash
docker compose -f docker-compose.prod.yml --profile wa up -d --build
```

A primeira build leva ~5min (frontend Next.js).

---

## Passo 8 · Verificar

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f caddy
```

Caddy vai obter certificados SSL automaticamente em ~30s.

Acesse no navegador:
- `https://hub.seudominio.com.br` → frontend
- `https://api.seudominio.com.br/health` → `{"status":"ok"}`

---

## Atualizar depois (deploy)

Sempre que mudar código:
```bash
ssh felipe@203.0.113.42
cd secretary-ai
git pull   # ou scp novo .tgz
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Comandos úteis no VPS

```bash
# Logs
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend

# Reiniciar serviço
docker compose -f docker-compose.prod.yml restart backend

# Parar tudo
docker compose -f docker-compose.prod.yml down

# Ver uso de recursos
docker stats

# Backup do SQLite
docker compose -f docker-compose.prod.yml exec backend cp /data/felipe_hub.db /tmp/backup.db
docker cp felipe-backend:/tmp/backup.db ~/backup-$(date +%Y%m%d).db
```

---

## Troubleshooting

**SSL não obtém certificado**
- DNS ainda não propagou → aguarde 10min e veja `docker compose logs caddy`
- Porta 80 bloqueada → `sudo ufw status`

**502 Bad Gateway**
- Backend caiu → `docker compose ps` e `docker compose logs backend`

**Frontend "Backend offline"**
- Verifique CORS_ORIGINS no `.env` está com domínio correto
- WebSocket precisa wss:// (não ws://) — Caddy já cuida disso

**RAM alta**
- `docker stats` pra ver consumo
- Se passar de 90%, considere KVM 4 ou desativar Evolution
