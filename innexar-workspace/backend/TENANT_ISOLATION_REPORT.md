# Relatório de isolamento por tenant (org_id) — Workspace API

**Escopo:** rotas workspace que acessam dados por organização/tenant (billing, customers, projects, system, support, dashboard).  
**Critério:** toda leitura/escrita de dados sensíveis deve estar escopada por `org_id` (ou `tenant_id`) para que um tenant não acesse dados de outro.  
**Rotas públicas de login/webhook que não acessam dados por tenant foram ignoradas.**

---

## 1. Rotas workspace que acessam dados por tenant

| Módulo | Arquivo principal | Endpoints sensíveis (ex.) |
|--------|-------------------|---------------------------|
| Billing | `modules/billing/router_workspace.py` → `workspace/` (products, price_plans, subscriptions, invoices) | GET/POST/PATCH products, plans, subscriptions, invoices; link-hestia; payment-link; mark-paid; process-overdue; generate-recurring |
| Customers | `modules/customers/router_workspace.py` | GET/POST/PATCH/DELETE customers; cleanup-test; generate-password; send-credentials |
| Projects | `modules/projects/router_workspace.py` + `api/workspace_router.py` | GET/POST/PATCH projects; messages; modification-requests |
| System | `modules/system/router_workspace.py` | GET/POST/PATCH config/integrations; test integration; GET/PUT config/hestia/settings |
| Support | `modules/support/router_workspace.py` | GET/POST tickets; GET/POST tickets/{id}/messages |
| Dashboard | `modules/dashboard/router_workspace.py` | GET /summary; GET /revenue |

---

## 2. Verificação por rota — Conforme / Risco

### Billing (workspace)

- **Risco:** `modules/billing/workspace_service.py` + `repositories/billing_repository.py` — `list_products`, `get_product_by_id`, `list_price_plans`, `get_price_plan_by_id` não filtram por `org_id`. Modelo `Product` possui `org_id`. Endpoints: GET/POST/PATCH `/billing/products`, GET `/billing/products/{id}`, GET/POST/PATCH `/billing/price-plans`, GET `/billing/price-plans/{id}`.
- **Risco:** `BillingRepository.list_subscriptions` (sem `customer_id` retorna todas), `get_subscription_by_id`, `list_invoices`, `get_invoice_by_id` não filtram por org. Subscriptions/Invoices são por `customer_id`; não há validação de que o customer pertence à org do staff. Endpoints: GET/PATCH `/billing/subscriptions`, GET/POST `/billing/subscriptions/{id}/link-hestia`, GET/POST/PATCH `/billing/invoices`, GET `/billing/invoices/{id}`, etc.
- **Conforme:** create_subscription e update_subscription passam `org_id` para audit/sync; mark-paid, process-overdue, generate-recurring, pay-bricks usam `current.org_id` onde aplicável.

### Customers (workspace)

- **Risco:** `modules/customers/service.py` + `repositories/customer_repository.py` — `list_all_with_users()` e `get_by_id_with_users(customer_id)` não filtram por `org_id`. Qualquer staff pode listar/obter/alterar/deletar clientes de outra org. Endpoints: GET `/customers`, GET/PATCH/DELETE `/customers/{id}`, generate-password, send-credentials.
- **Risco:** `CustomerService.create_customer` usa `org_id="innexar"` fixo; não usa `current_user.org_id`. Em multi-tenant, novo cliente seria criado na org errada.
- **Risco:** `cleanup_test_customers` deleta por email/nome sem filtrar por org; pode remover clientes de teste de outra org.

### Projects (workspace)

- **Risco:** `repositories/project_repository.py` — `list_all()` e `get_by_id(project_id)` não filtram por `org_id`. Modelo `Project` possui `org_id`. Endpoints: GET `/projects`, GET/PATCH `/projects/{id}`.
- **Risco:** Mensagens e modification-requests acessados por `project_id` em `api/workspace_router.py` e `modules/projects/workspace_service.py`; não há verificação de que o projeto pertence à org do staff. Endpoints: GET/POST `/projects/{id}/messages`, GET `/projects/{id}/modification-requests`, PATCH `/modification-requests/{id}`.

### System (workspace)

- **Conforme:** `create_integration` usa `current.org_id`; GET/PUT `/config/hestia/settings` filtram por `current.org_id`.
- **Risco:** `list_integrations` — query em `IntegrationConfig` sem filtro por `org_id`; retorna configs de todas as orgs. Endpoint: GET `/config/integrations`.
- **Risco:** `update_integration` e `test_integration` usam apenas `config_id`; não verificam se `config.org_id == current.org_id`. Endpoints: PATCH `/config/integrations/{id}`, POST `/config/integrations/{id}/test`.

### Support (workspace)

- **Risco:** `repositories/support_repository.py` — `list_tickets` e `get_ticket_by_id` não filtram por `org_id`. Modelo `Ticket` possui `org_id` (e create_ticket não o seta no modelo). Endpoints: GET `/support/tickets`, GET `/support/tickets/{id}`, POST `/support/tickets/{id}/messages`.

### Dashboard (workspace)

- **Risco:** `modules/dashboard/router_workspace.py` — `get_dashboard_summary` e `get_dashboard_revenue` fazem queries em `Invoice`, `Subscription`, `Project`, `Ticket` sem filtro por `org_id`; agregam dados de todos os tenants. Endpoints: GET `/dashboard/summary`, GET `/dashboard/revenue`.

---

## 3. Resumo

| Área | Status | Observação |
|------|--------|------------|
| Billing — products/plans | Risco | List/get/create/update sem escopo org no repositório/serviço. |
| Billing — subscriptions/invoices | Risco | List/get por id sem garantir que recurso pertence à org do staff. |
| Customers | Risco | List/get/update/delete/create sem org_id; create com org fixo. |
| Projects | Risco | List/get e mensagens/modification-requests sem filtro org. |
| System — integrations | Risco | List retorna todas as orgs; update/test não verificam org do config. |
| System — Hestia settings | Conforme | Filtro por current.org_id. |
| Support | Risco | List/get/add message sem filtro por org_id. |
| Dashboard | Risco | Summary e revenue sem filtro org. |

**Conclusão:** Na configuração atual, a maioria das rotas workspace **não** restringe acesso por `org_id`. Em cenário multi-tenant, um usuário staff de uma org poderia ver ou alterar dados de outra org. Recomenda-se introduzir escopo por `org_id` (ou tenant) em repositórios/serviços e passar `current_user.org_id` de forma consistente em todas as operações sensíveis.
