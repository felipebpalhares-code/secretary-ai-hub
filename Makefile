# Felipe Hub — atalhos de desenvolvimento
.PHONY: help up up-wa down logs build keygen sh shell ps clean

help:
	@echo "Felipe Hub — comandos disponíveis"
	@echo ""
	@echo "  make keygen       Gera ENCRYPTION_KEY (cole no .env)"
	@echo "  make up           Sobe backend"
	@echo "  make up-wa        Sobe backend + Evolution API (WhatsApp)"
	@echo "  make down         Para tudo"
	@echo "  make logs         Logs do backend (segue)"
	@echo "  make build        Rebuild da imagem do backend"
	@echo "  make sh           Shell dentro do container"
	@echo "  make ps           Status dos containers"
	@echo "  make clean        Remove containers + volumes (apaga banco!)"

keygen:
	@docker run --rm python:3.12-slim sh -c "pip install -q cryptography 2>/dev/null && python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'"

up:
	docker compose up -d
	@echo ""
	@echo "✓ Backend rodando em http://localhost:8000"
	@echo "  Health: curl http://localhost:8000/health"
	@echo "  Logs:   make logs"

up-wa:
	docker compose --profile wa up -d
	@echo ""
	@echo "✓ Backend rodando em http://localhost:8000"
	@echo "✓ Evolution API em http://localhost:8080"

down:
	docker compose down

logs:
	docker compose logs -f backend

build:
	docker compose build backend

sh shell:
	docker compose exec backend bash

ps:
	docker compose ps

clean:
	docker compose down -v
	@echo "⚠️  Volumes removidos (banco SQLite apagado)"
