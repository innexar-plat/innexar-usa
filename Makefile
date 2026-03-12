# Innexar USA (WaaS) - build e subir stack completa
# Ordem: workspace (API + DB + MinIO) → website → portal → workspace-app

WORKSPACE_DIR := innexar-workspace
WEBSITE_DIR   := innexar-website
PORTAL_DIR    := innexar-portal
APP_DIR       := innexar-workspace-app

.PHONY: up down up-all down-all build all logs ps clean help
.PHONY: up-workspace up-website up-portal up-app
.PHONY: build-workspace build-website build-portal build-app

help:
	@echo "Innexar USA - alvos disponíveis:"
	@echo "  make all        - build (--no-cache) em tudo + sobe toda a stack"
	@echo "  make build     - build (--no-cache) em todos os projetos"
	@echo "  make up-all    - sobe toda a stack (workspace, website, portal, workspace-app)"
	@echo "  make down-all  - para toda a stack"
	@echo "  make up        - igual a up-all"
	@echo "  make down      - igual a down-all"
	@echo "  make logs      - logs com follow (últimos 100 linhas)"
	@echo "  make ps        - status dos containers USA"
	@echo "  make up-workspace   - sobe só API + Postgres + MinIO"
	@echo "  make up-website     - sobe só website"
	@echo "  make up-portal     - sobe só portal"
	@echo "  make up-app        - sobe só workspace-app"
	@echo "  make build-workspace / build-website / build-portal / build-app - build de um projeto"

# Build em tudo (--no-cache) e depois sobe tudo
all: build up-all
	@echo ">>> Build e up concluídos. Stack USA no ar."

# Build com --no-cache em todos os projetos
build: build-workspace build-website build-portal build-app
	@echo ">>> Build de todos os projetos concluído."

build-workspace:
	@echo ">>> Build workspace (backend, postgres, minio)..."
	cd $(WORKSPACE_DIR) && docker compose build --no-cache
	@echo ">>> Workspace build OK."

build-website:
	@echo ">>> Build website (produção)..."
	cd $(WEBSITE_DIR) && rm -rf .next 2>/dev/null; docker compose -f docker-compose.yml build --no-cache
	@echo ">>> Website build OK."

build-portal:
	@echo ">>> Build portal (produção)..."
	cd $(PORTAL_DIR) && docker compose -f docker-compose.yml build --no-cache
	@echo ">>> Portal build OK."

build-app:
	@echo ">>> Build workspace-app (produção)..."
	cd $(APP_DIR) && docker compose -f docker-compose.yml build --no-cache
	@echo ">>> Workspace-app build OK."

up: up-all
up-all: up-workspace up-website up-portal up-app
	@echo "Stack USA no ar. API: api3.innexar.app | Site: innexar.app | Portal: panel.innexar.app | App: workspace.innexar.app"

up-workspace:
	@echo ">>> Subindo workspace (API, Postgres, MinIO)..."
	cd $(WORKSPACE_DIR) && docker compose up -d --force-recreate
	@echo ">>> Workspace OK."

up-website:
	@echo ">>> Subindo website (produção)..."
	cd $(WEBSITE_DIR) && docker compose -f docker-compose.yml up -d --force-recreate
	@echo ">>> Website OK."

up-portal:
	@echo ">>> Subindo portal (produção)..."
	cd $(PORTAL_DIR) && docker compose -f docker-compose.yml up -d --force-recreate
	@echo ">>> Portal OK."

up-app:
	@echo ">>> Subindo workspace-app (produção)..."
	cd $(APP_DIR) && docker compose -f docker-compose.yml up -d --force-recreate
	@echo ">>> Workspace-app OK."

down: down-all
down-all: down-app down-portal down-website down-workspace
	@echo "Stack USA parada."

down-workspace:
	cd $(WORKSPACE_DIR) && docker compose down

down-website:
	cd $(WEBSITE_DIR) && docker compose down

down-portal:
	cd $(PORTAL_DIR) && docker compose -f docker-compose.yml down

down-app:
	cd $(APP_DIR) && docker compose down

logs:
	cd $(WORKSPACE_DIR) && docker compose logs -f --tail=100

ps:
	@echo "--- Workspace ---"
	@cd $(WORKSPACE_DIR) && docker compose ps
	@echo "--- Website ---"
	@cd $(WEBSITE_DIR) && docker compose ps 2>/dev/null || true
	@echo "--- Portal ---"
	@cd $(PORTAL_DIR) && docker compose -f docker-compose.yml ps 2>/dev/null || true
	@echo "--- Workspace-app ---"
	@cd $(APP_DIR) && docker compose ps 2>/dev/null || true

clean: down-all
	@echo "Stack parada. Volumes e imagens mantidos."
