# Innexar Workspace Backend - quality and tests
# Usage: make venv then make install then make test
#
# Tests: 288 tests em sequência demoram ~2 min (import do app + fixtures).
# Mais rápido: make test-parallel (pytest-xdist -n auto) ou rodar no container.

PYTHON ?= python3
VENV = .venv
BIN = $(VENV)/bin
PY = $(BIN)/python
PIP = $(BIN)/pip
PYTEST = $(BIN)/pytest

venv:
	$(PYTHON) -m venv $(VENV)

install: venv
	$(PIP) install -r requirements.txt
	$(PIP) install pytest pytest-asyncio aiosqlite

lint:
	$(PY) -m ruff check app tests

format:
	$(PY) -m black app tests

format-check:
	$(PY) -m black --check app tests

typecheck:
	$(PY) -m mypy app

test:
	PYTHONPATH=. $(PYTEST) tests/ -v --tb=short

# Paralelo (bem mais rápido): usa todos os CPUs. Requer pytest-xdist.
test-parallel:
	PYTHONPATH=. $(PYTEST) tests/ -n auto -q --tb=short

test-unit:
	PYTHONPATH=. $(PYTEST) tests/unit/ -v --tb=short

test-integration:
	PYTHONPATH=. $(PYTEST) tests/integration/ -v --tb=short

test-e2e:
	PYTHONPATH=. $(PYTEST) tests/e2e/ -v --tb=short

# Coverage: pytest-cov (install with pip install -e ".[dev]")
coverage:
	PYTHONPATH=. $(PYTEST) tests/ --cov=app --cov-report=term-missing --cov-report=html -v --tb=short

# Run tests inside Docker (from repo root: make -C .. docker-test or cd .. && docker compose run --rm backend pytest tests/ -v)
docker-test:
	cd .. && docker compose run --rm backend pytest tests/ -v --tb=short

all: format-check lint typecheck test

.PHONY: venv install lint format format-check typecheck test test-parallel test-unit test-integration test-e2e coverage docker-test all
