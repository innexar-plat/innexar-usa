# Análise do Projeto Innexar (codebase)

**Data:** 2025-03-09  
**Escopo:** repositório `/opt/innexar-usa` (monorepo multi-app)  
**Critérios:** skill analyze-codebase; regras em `.cursor/rules/` (project-rules, architecture).

---

## 1. Visão geral do repositório

O repositório é um **monorepo** com vários produtos:

| App / pasta | Tipo | Descrição |
|-------------|------|-----------|
| **innexar-workspace** | Backend (FastAPI) + referência de API | API 3 camadas: workspace (staff), portal (cliente), public (webhooks, checkout, auth). Escopo principal da padronização (BACKEND_ANALYSIS.md). |
| **innexar-portal** | Frontend (Next.js 16, React 19) | Portal do cliente: projetos, faturamento, suporte, perfil. `src/app`, `src/components`, `src/hooks`, next-intl, Tailwind. |
| **innexar-workspace-app** | Frontend | App workspace (equipe): gestão de clientes, projetos, billing, Hestia. |
| **innexar-website** | Frontend | Site institucional Innexar. |
| **innexar-framework** | Monorepo (workspaces) | Temas, apps, módulos, pacotes compartilhados. |
| **innexar-crm** | Frontend (Apollo, etc.) | CRM. |
| **.cursor** | Config | Rules, skills, agents (subagentes de arquitetura, backend, frontend, DB, security, etc.). |

Foco da análise abaixo: **innexar-workspace/backend** (arquitetura, camadas, padrões) e **innexar-portal** (estrutura frontend), alinhados às regras do projeto.

---

## 2. Backend — innexar-workspace/backend

### 2.1 Arquitetura (3 camadas)

- **Routers (controllers):** `app/api/`, `app/modules/*/router_*.py`
  - Validam entrada (Pydantic); injetam `get_db` → session; chamam **services**; retornam response.
  - Não acessam DB direto; não contêm lógica de negócio.
  - Padrão: `def get_*_service(db: Annotated[AsyncSession, Depends(get_db)]) -> Service: return Service(db, repo1(db), repo2(db))`.

- **Services:** `app/core/workspace_auth_service.py`, `app/modules/*/service.py`, `*_portal_service.py`, `*_workspace_service.py`, `app/api/portal/*_service.py`, `app/api/public_service.py`, `app/modules/billing/*_ops.py`
  - Contêm a lógica de negócio; orquestram **repositories** (e providers quando aplicável).
  - Após padronização: a maioria usa apenas repositórios; exceção conhecida: `invoice_ops`, `webhook_ops`, `recurring_ops` ainda com `db.execute` direto (Fase 4.2 pendente).

- **Repositories:** `app/repositories/*.py`
  - Um por agregado/entidade: `CustomerRepository`, `BillingRepository`, `SupportRepository`, `ProjectRepository`, `ProjectActivityRepository`, `ProjectFileRepository`, `ContactRepository`, `NotificationRepository`, `UserRepository`, `FeatureFlagRepository`, `IntegrationConfigRepository`, `HestiaSettingsRepository`, `ProjectRequestRepository`.
  - Métodos claros: `get_by_id`, `list_*`, `add`, `flush`, etc.; evitam N+1 (selectinload, joins quando necessário).

- **Models:** `app/models/`, `app/modules/*/models.py`
  - SQLAlchemy (ORM) e Pydantic em `schemas` para request/response.

### 2.2 Frameworks e bibliotecas

- **Web:** FastAPI, Uvicorn.
- **DB:** SQLAlchemy 2 (async), asyncpg, PostgreSQL.
- **Validação/config:** Pydantic, pydantic-settings.
- **Auth:** python-jose (JWT), passlib (bcrypt); Bearer staff/customer; RBAC (`RequirePermission`).
- **Outros:** httpx, python-multipart, python-dotenv; Alembic (migrations).
- **Testes:** pytest, pytest-asyncio, pytest-cov.
- **Qualidade:** ruff, black, mypy (py311, strict).

### 2.3 Estrutura de pastas (backend)

```
app/
├── main.py                 # FastAPI app; monta routers; lifespan (tabelas, MP schema)
├── api/
│   ├── deps.py
│   ├── workspace_router.py # Staff: login, forgot/reset password, config (integrations, hestia, seed)
│   ├── public_router.py    # Public: login cliente, checkout login, forgot/reset, web-to-lead
│   └── portal/             # Portal cliente: me, me_dashboard, requests, projects, project_activity
│       ├── me.py, me_dashboard.py, requests.py, projects.py, project_activity.py
│       └── *_service.py, schemas.py, helpers.py
├── core/
│   ├── config.py, database.py, security.py, encryption.py, audit.py
│   ├── auth_staff.py, auth_customer.py, rbac.py, tenancy.py
│   ├── workspace_auth_service.py
│   ├── storage/, feature_flags.py, datetime_utils.py, debug_log.py
├── models/                 # Entidades globais: User, Customer, CustomerUser, Notification, etc.
├── repositories/           # Uma pasta; um repo por arquivo (customer, billing, support, ...)
├── modules/
│   ├── billing/            # workspace, portal, public routers; invoice_ops, webhook_ops, recurring_ops; overdue, provisioning, post_payment
│   ├── checkout/, crm/, dashboard/, files/, hestia/, notifications/, orders/, products/, projects/, support/, system/
│   └── por módulo: router_workspace.py, router_portal.py, router_public.py, *service*.py, schemas*.py, models.py
├── providers/              # email, payments (stripe, mercadopago), hestia, cloudflare, storage
├── schemas/                # response_envelope, etc.
docs/                       # API.md, API_PORTAL.md, INTEGRATION_PROVIDERS.md
tests/
├── unit/                   # core, api, repositories, modules/* (por módulo)
├── integration/
scripts/
```

Convenções: arquivos em **kebab-case** quando múltiplas palavras; módulos em **snake_case**; routers nomeados `router_workspace`, `router_portal`, `router_public` conforme contexto.

### 2.4 Padrões existentes (backend)

- **Injeção de dependência:** `get_db()` → `AsyncSession`; factories `get_*_service(db)` que instanciam repositórios e o service.
- **Autenticação:** `get_current_staff`, `get_current_customer` (Bearer); `RequirePermission("scope:action")` para workspace.
- **Tenant/org:** `org_id` em modelos e filtros; resolvido via token/config.
- **Respostas:** Pydantic `response_model` nos endpoints; envelope `{ success, data, error }` em `schemas/response_envelope.py` (uso gradual).
- **Erros:** `HTTPException` com status e detail; sem expor stack trace ao cliente.
- **Testes:** pytest-asyncio; `db_session` fixture; mocks em `app.modules.*` (service/ops) onde a lógica foi extraída.

Status detalhado de conformidade e pendências: **innexar-workspace/backend/BACKEND_ANALYSIS.md**.

---

## 3. Frontend — innexar-portal

### 3.1 Stack

- **Framework:** Next.js 16, React 19.
- **Linguagem:** TypeScript.
- **Estilo:** Tailwind CSS (PostCSS).
- **i18n:** next-intl.
- **Outros:** framer-motion, lucide-react, zod.

### 3.2 Estrutura de pastas

```
src/
├── app/[locale]/           # Rotas: page.tsx (dashboard), projects/, projects/[id]/
├── components/             # Por feature: auth, billing, dashboard, layout, new-project, payment, profile, project-details, projects, site-briefing, support; header/, layout/
├── hooks/                  # use-login, use-billing, use-dashboard-workspace, use-new-project, use-profile, use-project-details, use-projects-list, use-site-briefing, use-support, use-payment-brick, use-portal-nav
├── contexts/               # theme-context
├── lib/                    # Utilitários e clientes API
├── types/
├── i18n/
└── __tests__/
```

Padrão: **PascalCase** para componentes; **kebab-case** para arquivos de hooks/páginas; pastas por domínio (billing, projects, support, etc.).

### 3.3 Padrões

- App Router (Next 16); rotas sob `[locale]`.
- Componentes funcionais; hooks para estado e chamadas API.
- Documentação de API do portal: **innexar-workspace/backend/docs/API_PORTAL.md**.

---

## 4. Regras e convenções (resumo)

- **Entrega:** plan → implement → tests → lint → build → commit → push → container build → logs → validar fluxo → PR.
- **Backend:** routers thin; services com repositórios; sem DB direto nos routers; arquivos ≤ ~300 linhas; funções ≤ ~40 linhas.
- **Segurança:** SQL parametrizado; bcrypt; secrets em env; sem log de senha/token; rate limit em endpoints públicos sensíveis.
- **Testes:** novo módulo/feature com testes; bug fix com teste de regressão primeiro.
- **Docs:** não criar .md por padrão; documentar em PR; API e integrações em `backend/docs/`.

---

## 5. Checklist pré-implementação (analyze-codebase)

Antes de implementar qualquer mudança:

- [x] **Arquitetura e camadas identificadas:** routers → services → repositories; models/schemas; providers.
- [x] **Código existente relevante localizado:** BACKEND_ANALYSIS.md para backend; `app/`, `modules/`, `api/portal/`; frontend em `innexar-portal/src/`.
- [x] **Padrões e convenções anotados:** get_db + factory de service; Pydantic response_model; repositórios por agregado; testes unitários por módulo.
- [x] **Candidatos a reuso identificados:** BillingRepository, CustomerRepository, etc.; envelope em schemas; deps em api/deps.py e core.

**Pendências conhecidas (backend):**

- Fase 4.2: concentrar acesso a dados de `invoice_ops`, `webhook_ops`, `recurring_ops` em BillingRepository.
- Fase 6: uso gradual do envelope; revisão multi-tenant.

---

## 6. Referências

- **Backend (conformidade e plano):** `innexar-workspace/backend/BACKEND_ANALYSIS.md`
- **API e portal:** `innexar-workspace/backend/docs/API.md`, `API_PORTAL.md`
- **Regras do projeto:** `.cursor/rules/project-rules.mdc`, `core/architecture.mdc`, `context-rules.mdc`
- **Skill:** `.cursor/skills/analyze-codebase/SKILL.md`

Este documento deve ser atualizado quando a estrutura do projeto ou os padrões mudarem de forma relevante.
