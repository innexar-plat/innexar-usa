# Análise do Backend — Conformidade e Plano de Padronização

**Data:** 2025-03-08  
**Última atualização:** 2025-03-08  
**Escopo:** `innexar-workspace/backend/app`  
**Critérios:** `.cursor/rules/` (project-rules, architecture, context backend, security).

---

## 1. Resumo executivo (status atual)

| Aspecto | Status | Observação |
|--------|--------|------------|
| Controllers só validar → service → response | ⚠️ Parcial | **Conformes:** customers, projects (workspace+portal), billing workspace, **billing portal**, **billing public (webhooks)**, CRM, **dashboard workspace**, **checkout public**, notifications portal, products public, portal list projects, support portal, orders, files portal, **public_router**, **portal me**, **portal me_dashboard**, **portal requests**, **portal project_activity**; **Conformes:** também **system** (sub-routers + services). |
| Acesso a dados apenas via repositories | ✅ Conforme | Repositories: customer, billing, contact, notification, project_file, project, project_activity, support, user, feature_flag, integration_config, hestia_settings. Todos os services e ops (customers, support, files, workspace_auth, overdue, provisioning, post_payment, **invoice_ops, webhook_ops, recurring_ops**) usam apenas repositórios (Fase 4.2 concluída). |
| Retorno com schema (não raw dict) | ✅ Conforme | public_router, hestia e demais refatorados usam Pydantic; Fase 2 concluída |
| Resposta API padronizada `{ success, data, error }` | ⚠️ Parcial | `response_envelope.py` existe; uso gradual em novos endpoints |
| Tamanho de arquivo (~300 linhas) | ✅ Conforme | `modules/billing/service.py` dividido em _provider, _subscription_helpers, invoice_ops, webhook_ops, recurring_ops; service.py re-exporta (≤40 linhas) |
| Arquivos no lugar certo (sem soltos em app/) | ✅ Conforme | `test_stripe_key.py` removido de app/; script seguro em `backend/scripts/test_stripe_key.py` |
| Logging (sem print; sem log de segredos) | ✅ Conforme | Script em scripts/ usa logging; sem exposição de API key |
| Segurança (SQL, hashing, secrets) | ✅ Conforme | SQL parametrizado, bcrypt, secrets em config/env |
| Type hints / Pydantic | ✅ Conforme | Uso consistente |
| Estrutura de pastas | ✅ Conforme | api/, modules/, repositories/, core/, models/, schemas/, providers/ |

---

## 2. Plano de padronização (ordem de execução)

### Fase 1 — Correções imediatas (segurança e organização)

| # | Ação | Prioridade | Responsável |
|---|------|------------|-------------|
| 1.1 | Remover ou relocar `app/test_stripe_key.py`: não deixar em `app/`; eliminar `print` e qualquer log/exposição de API key | Alta | Backend |
| 1.2 | Garantir que nenhum outro arquivo use `print` para debug ou logue segredos | Alta | Backend / Security |

### Fase 2 — Retornos Pydantic (não retornar dict quando há schema)

| # | Ação | Prioridade |
|---|------|------------|
| 2.1 | `api/public_router.py`: criar schemas `MessageResponse`, `ContactIdResponse` e usar como `response_model` nos endpoints que hoje retornam `dict` | Média |
| 2.2 | `modules/hestia/router_workspace.py`: criar schemas para respostas (ex.: `HestiaUserOkResponse`) e substituir `return {"ok": True, "user": ...}` por instâncias Pydantic | Média |

### Fase 3 — Routers thin (sem acesso direto ao DB)

Routers devem apenas: validar entrada → chamar service → retornar response. Acesso a dados apenas via **services** que usam **repositories**.

| # | Módulo / Área | Ação |
|---|----------------|------|
| 3.1 | `api/portal/*` (project_activity, me_dashboard, requests, projects, me, helpers) | Extrair lógica para services (portal); usar repositórios existentes ou criar (ex.: ProjectActivityRepository já existe) |
| 3.2 | `api/public_router.py` | Extrair login, reset password, web-to-lead para services; usar UserRepository/CustomerRepository/ContactRepository |
| 3.3 | `modules/dashboard/router_workspace.py` | Extrair métricas para DashboardWorkspaceService + repositórios ou BillingRepository/ProjectRepository |
| 3.4 | `modules/billing/router_portal.py`, `router_public.py` | Já existe BillingRepository; mover chamadas de `db.execute` do router para BillingService (ou workspace/portal service) |
| 3.5 | `modules/checkout/router_public.py` | Extrair fluxo de checkout para CheckoutService + BillingRepository/CustomerRepository |
| 3.6 | `modules/crm/router_workspace.py` | Criar ContactRepository; ContactService; router só chama service |
| 3.7 | `modules/system/router_workspace.py` | Dividir em sub-routers (integrations, seed, hestia_config, feature_flags); cada um com service + repository onde houver acesso a dados |
| 3.8 | `modules/support/router_portal.py` | Extrair para SupportPortalService + SupportRepository |
| 3.9 | `modules/orders/router_workspace.py` | OrderService + repository (ou reuso de repositórios existentes) |
| 3.10 | `modules/products/router_public.py` | ProductService (ou BillingRepository para produtos) no router |
| 3.11 | `modules/files/router_portal.py` | FilesPortalService + repository de files |
| 3.12 | `modules/notifications/router_portal.py` | NotificationService + repository |

### Fase 4 — Services usando apenas repositórios

| # | Arquivo | Ação |
|---|---------|------|
| 4.1 | `modules/customers/service.py` | Substituir `self._db.execute(select(Customer...))` em cleanup_test e send_portal_credentials por métodos em CustomerRepository/BillingRepository |
| 4.2 | `modules/billing/service.py` | Concentrar todo acesso a dados em BillingRepository (e repositórios auxiliares se necessário); service só orquestra |
| 4.3 | `modules/support/workspace_service.py` | Usar CustomerRepository (ou equivalente) em vez de `self._db.execute` |
| 4.4 | `modules/files/service.py` | Criar/usar ProjectFileRepository para add/execute/delete |
| 4.5 | `core/workspace_auth_service.py` | Introduzir UserRepository para leitura/escrita de User (e tokens de reset) |
| 4.6 | `modules/billing/overdue.py`, `provisioning.py`, `post_payment.py` | Acesso a dados via repositórios; chamadas a partir de services ou jobs, não expor DB direto |

### Fase 5 — Tamanho de arquivos (≤ 300 linhas)

| # | Arquivo | Ação |
|---|---------|------|
| 5.1 | ~~`modules/system/router_workspace.py` (622 linhas)~~ | ✅ Feito: integrations_router, seed_router, hestia_config_router + IntegrationConfigRepository, HestiaSettingsRepository, SystemIntegrationService, SystemHestiaConfigService, SystemSeedService; router_workspace só re-exporta; testes atualizados (patch em integration_service/seed_service) |
| 5.2 | ~~`modules/billing/service.py` (682 linhas)~~ | ✅ Feito: _provider.py, _subscription_helpers.py, invoice_ops.py, webhook_ops.py, recurring_ops.py; service.py re-exporta; testes atualizados (patch em invoice_ops/webhook_ops/recurring_ops/_provider) |
| 5.3 | ~~`api/portal/me_dashboard.py` (321 linhas)~~ | ✅ Feito: PortalDashboardService + FeatureFlagRepository; router thin (~75 linhas) |

### Fase 6 — Opcionais

| # | Item | Observação |
|---|------|------------|
| 6.1 | Envelope `{ success, data, error }` | Uso gradual; documentar em API.md; aplicar em novos endpoints e, quando possível, em refactors |
| 6.2 | Revisão multi-tenant | Garantir `org_id`/tenant em todas as rotas que acessam dados por organização (security-reviewer ou auth-specialist) |

---

## 3. Arquitetura de referência (regras)

- **Controllers/Routers:** validar input (Pydantic); chamar services; retornar response. Sem lógica de negócio e sem acesso direto ao DB.
- **Services:** toda lógica de negócio; chamam apenas repositórios para dados; não usam `db.execute`/`db.add` direto.
- **Repositories:** um por agregado/entidade; métodos claros (get_by_id, list, add, update, delete); evitam N+1.
- **Respostas:** sempre que possível schema Pydantic (nunca `return {"key": ...}` quando existir ou puder existir schema).
- **Arquivos:** máximo ~300 linhas; funções ~40 linhas.
- **Nada solto em `app/`:** scripts de teste/debug em `scripts/` ou `tests/`, nunca em `app/`.

---

## 4. Progresso da padronização

### Concluído antes deste plano

- Repositórios: `CustomerRepository`, `BillingRepository`, `SupportRepository`, `ProjectRepository`, `ProjectActivityRepository`.
- Routers thin: `api/workspace_router`, `modules/customers/router_workspace`, `modules/projects/router_workspace` (messages, modification-requests), billing workspace (products, price_plans, subscriptions, invoices).
- Portal e billing workspace: split em arquivos em `api/portal/` e `modules/billing/workspace/` (cada ≤300 linhas onde já aplicado).
- Envelope: `app/schemas/response_envelope.py` (ApiEnvelope, success_envelope, error_envelope).
- Segurança: SQL parametrizado, bcrypt, secrets em env; sem log de senha/token nos trechos revisados.

### Concluído nesta rodada (padronização)

| Fase | Item | Status |
|------|------|--------|
| 1.1 | Remover/relocar `test_stripe_key.py` | ✅ Feito: arquivo removido de `app/`; script seguro em `backend/scripts/test_stripe_key.py` (logging, sem expor API key) |
| 2.1 | Schemas Pydantic em `api/public_router.py` | ✅ Feito: `MessageResponse` (auth) para forgot-password, reset-password e password-updated; `WebToLeadResponse(id)` para web-to-lead; `response_model` e tipo de retorno ajustados |

### Concluído (continuação)

| Fase | Item | Status |
|------|------|--------|
| 2.2 | Schemas Pydantic em `modules/hestia/router_workspace.py` | ✅ Feito: `HestiaUserOkResponse`, `HestiaDomainOkResponse`, `HestiaUserSuspendResponse`; todos os endpoints POST/DELETE que retornavam `dict` passam a usar `response_model` e instâncias Pydantic |

### Concluído (Fase 3 — módulos refatorados)

| Fase | Item | Status |
|------|------|--------|
| 3.6 | CRM: ContactRepository + ContactService; router thin | ✅ Feito |
| 3.12 | **Notifications portal:** NotificationRepository + NotificationPortalService; router thin | ✅ Feito |
| 3.10 | **Products public:** ProductPublicService (BillingRepository); router thin; schemas em `schemas_public.py` | ✅ Feito |
| 3.1 (parcial) | **Projects portal:** ProjectPortalService (ProjectRepository + ProjectFileRepository); `router_portal` e `api/portal/projects` list/get thin | ✅ Feito |
| 3.8 | **Support portal:** SupportPortalService (SupportRepository + ProjectRepository); router thin; list/create tickets, list/add messages | ✅ Feito |
| 3.9 | **Orders workspace:** OrderWorkspaceService + BillingRepository.list_paid_site_delivery_orders, ProjectRepository.list_by_subscription_ids, ProjectRequestRepository; router thin (orders, briefings, download) | ✅ Feito |
| 3.11 | **Files portal:** api/portal/projects e modules/files/router_portal usam ProjectPortalService para ownership; sem db direto no router | ✅ Feito |
| 3.3 | **Dashboard workspace:** BillingRepository (get_dashboard_invoice_summary, get_dashboard_subscription_summary, get_active_customer_count, get_revenue_rows), SupportRepository.get_ticket_counts, ProjectRepository.get_project_counts_by_status; DashboardWorkspaceService; router thin | ✅ Feito |
| 3.4 (portal) | **Billing portal:** BillingRepository (get_invoice_by_id_and_customer, get_latest_payment_attempt_by_invoice_id); BillingPortalService (list_my_invoices, get_my_invoice, pay_invoice, get_invoice_download_html); router thin; testes atualizados (mock em portal_service) | ✅ Feito |
| 3.5 | **Checkout public:** CustomerRepository.get_customer_user_by_email; BillingRepository.add_invoice; CheckoutService + checkout_bricks (resolve product/plan, find or create customer, sub+invoice, Bricks ou Checkout Pro); router thin; testes atualizados | ✅ Feito |
| 3.4 (public) | **Billing public (webhooks):** BillingPublicService (handle_stripe_webhook, handle_mercadopago_webhook); BillingRepository.get_invoice_by_id, CustomerRepository.get_customer_user_by_customer_id; assinatura MP e post-payment no service; router thin; testes atualizados | ✅ Feito |
| 3.2 | **Public router:** CustomerRepository (get_customer_user_by_id, add_password_reset_token, get_valid_reset_token, delete_reset_tokens_for_customer_user, delete_reset_token_by_id, update_customer_user_password); PublicService (customer_login, checkout_login, forgot_password, reset_password, web_to_lead); router thin; rate limit e audit no service; testes atualizados | ✅ Feito |
| 3.1 (me) | **Portal me:** CustomerRepository (update_customer_user, update_customer); PortalMeService (change_password, set_initial_password, get_profile, update_profile); api/portal/me.py router thin | ✅ Feito |
| 3.1 (me_dashboard) | **Portal me_dashboard:** FeatureFlagRepository (get_by_key, is_enabled); BillingRepository (list_subscriptions_with_product_plan, get_last_invoice_*, get_hestia_provisioning_for_subscription, list_active_products_for_customer); NotificationRepository (get_unread_count); SupportRepository (get_open_ticket_count_for_customer); ProjectRepository (get_first_aguardando_briefing_without_briefing); PortalDashboardService (get_features, get_project_aguardando_briefing, get_dashboard); api/portal/me_dashboard.py router thin | ✅ Feito |
| 3.1 (requests) | **Portal requests:** ProjectRequestRepository (add, flush_and_refresh); PortalRequestsService (create_new_project, submit_site_briefing, submit_site_briefing_with_uploads); api/portal/requests.py router thin; upload aceita File único ou lista | ✅ Feito |
| 3.1 (project_activity) | **Portal project_activity:** ProjectActivityRepository (count_modification_requests_this_month, add_modification_request); PortalProjectActivityService (list_messages, send_message, send_message_with_file, list_modification_requests, create_modification_request); api/portal/project_activity.py router thin; quota via BillingRepository (subscription/plan) | ✅ Feito |
| 3.7 | **System workspace:** IntegrationConfigRepository, HestiaSettingsRepository, FeatureFlagRepository (add, flush_and_refresh); SystemIntegrationService, SystemHestiaConfigService, SystemSeedService; integrations_router, seed_router, hestia_config_router thin; router_workspace re-exporta; testes atualizados (patch em integration_service/seed_service) | ✅ Feito |

| 4.1 | **customers/service.py:** CustomerRepository.list_test_customer_ids_for_cleanup; send_portal_credentials usa BillingRepository.get_invoice_by_id; sem self._db.execute | ✅ Feito |
| 4.3 | **support/workspace_service.py:** CustomerRepository injetado; create_ticket usa get_by_id_with_users e get_customer_user_by_customer_id em vez de self._db.execute | ✅ Feito |
| 4.4 | **files/service.py:** ProjectFileRepository (list_by_project_id, get_by_id, add, flush_and_refresh, delete); upload/list/get/delete usam repo | ✅ Feito |
| 5.2 | **billing/service.py:** Split em _provider, _subscription_helpers, invoice_ops, webhook_ops, recurring_ops; service.py re-exporta | ✅ Feito |
| 4.5 | **workspace_auth_service:** UserRepository (get_by_email, get_by_id, add_reset_token, get_valid_reset_token, delete_reset_token_*, update_user_password); staff_login/forgot/reset/change_password usam repo | ✅ Feito |
| 4.6 | **overdue:** HestiaSettingsRepository.get_by_org_id; BillingRepository (list_overdue_invoice_subscription_product, get_hestia_provisioned_record_for_subscription, get_subscription_by_id) | ✅ Feito |
| 4.6 | **post_payment:** BillingRepository.get_invoice_with_subscription_product_customer; ProjectRepository.get_by_subscription_id, add; UserRepository.list_by_org_id; NotificationRepository.add, flush | ✅ Feito |
| 4.6 | **provisioning:** BillingRepository (get_invoice_subscription_product, add_provisioning_job, add_provisioning_record); CustomerRepository.get_by_id_with_users; HestiaSettingsRepository.get_by_org_id | ✅ Feito |
| 4.2 | **billing invoice_ops, webhook_ops, recurring_ops:** BillingRepository (flush, add_payment_attempt, get_subscription_with_plan_product, add_mp_subscription_checkout, get/add_webhook_event, get_mp_subscription_checkout_by_plan_id, list_subscriptions_due_with_plan_product, list_pending_invoices_with_subscription_customer, list_pending_invoices_for_reminders); CustomerRepository para org_id e customer com users; sem db.execute/db.add direto | ✅ Feito |

### Fase 6 (opcionais — documentado)

- **Envelope** `{ success, data, error }`: definido em `app/schemas/response_envelope.py`; documentado em `docs/API.md`; uso gradual em novos endpoints (frontend deve consumir `response.data`).
- **Multi-tenant:** rotas workspace usam `get_current_staff` → `User.org_id`; portal usa `get_current_customer` → `CustomerUser.customer.org_id`; repositórios e queries filtram por `org_id` quando aplicável. Revisão pontual recomendada em novos endpoints (garantir filtro por tenant).

---

## 5. Testes e qualidade

- **Testes:** Manter e estender cobertura ao refatorar (cada novo service/repository com testes).
- **Lint/format:** Ruff e Black nos arquivos alterados; CI com lint e testes antes de merge.
- **Entrega:** Seguir sequência do projeto (plan → implement → tests → lint → build → commit → push → container build → logs → validar fluxo → PR).

---

## 6. Referências

- `.cursor/rules/project-rules.mdc` — sequência de entrega, stack, estrutura, arquitetura, API, testes.
- `.cursor/rules/core/architecture.mdc` — camadas (controllers, services, repositories).
- `.cursor/rules/context-rules.mdc` — contexto Backend (FastAPI, Pydantic, type hints, logging).
- Subagentes: software-architect, backend-engineer, security-reviewer (e database-engineer quando houver mudança de schema).

Este documento deve ser atualizado à medida que cada item do plano for concluído.
