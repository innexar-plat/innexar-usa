# Innexar Workspace — Docker (containers de produção com volumes / hot-reload)
.PHONY: help build up down rebuild logs test-backend

help:
	@echo "  make build        - Build da imagem do backend"
	@echo "  make up           - Sobe postgres + backend (com volumes, uvicorn --reload)"
	@echo "  make down         - Para e remove containers"
	@echo "  make rebuild      - build + up"
	@echo "  make logs         - Logs do backend (follow)"
	@echo "  make test-backend - Roda pytest no backend (cd backend && pytest)"
test-backend:
	$(MAKE) -C backend test

build:
	docker compose build --no-cache backend

up:
	docker compose up -d --force-recreate

down:
	docker compose down

rebuild: build up
	@echo "Rebuild e up concluídos. Verifique: make logs"

logs:
	docker compose logs -f --tail=80 backend
