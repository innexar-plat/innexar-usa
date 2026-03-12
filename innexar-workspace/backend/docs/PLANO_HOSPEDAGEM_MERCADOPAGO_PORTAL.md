# Plano completo: Hospedagem + Mercado Pago + Portal do cliente

Objetivo: vender hospedagem de sites com pagamento via **Mercado Pago**, provisionamento automático no **HestiaCP** após pagamento, e **portal do cliente** mostrando plano, site, fatura (e botão pagar), dados do painel e suporte/mensagens. Sem regressão; seguir padrões do projeto (IntegrationConfig, 3 camadas, Pydantic, feature flags).

**Implementado no código**: migrations (Product.provisioning_type, hestia_package, ProvisioningRecord, HestiaSettings), Mercado Pago (create_payment_link + webhook), cliente Hestia + loader + test em integrações, área Config → Hestia (GET/PUT /api/workspace/config/hestia/settings), provisionamento após webhook (BackgroundTasks), job de inadimplência (POST /api/workspace/billing/process-overdue) e reativação ao pagar, checkout com domain obrigatório para hospedagem, GET /api/portal/me/dashboard (plan, site, invoice, panel, support, messages).

---

## Parte 1: O que você precisa no Hestia (servidor)

No servidor onde está o HestiaCP:

1. **Criar Access Key** (recomendado em vez de senha/API key antiga):
   - No Hestia: **User** → **API Access Keys** ou via SSH:
   ```bash
   v-add-access-key 'admin' '*' 'innexar-workspace' json
   ```
   - Saída: **Access key** e **Secret key**. Guardar em lugar seguro.

2. **Whitelist de IP** (desde Hestia 1.4):
   - **Server** → **Configure** → **Security** → **API**: colocar o IP do servidor onde roda a API do workspace (ou `allow-all` só em dev).

3. **Dados para configurar no Workspace**:
   - **URL base do painel**: `https://seu-servidor:8083` (ou a URL que você usa para acessar o Hestia).
   - **Access key** e **Secret key** gerados acima.

No Workspace (painel admin): **Configurações** → **Integrações** → **Nova integração**:
- Provider: `hestia`
- Key: `api_credentials`
- Value (será criptografado): JSON
  ```json
  {
    "base_url": "https://seu-servidor:8083",
    "access_key": "xxx",
    "secret_key": "yyy"
  }
  ```
- Scope: global (ou tenant se multi-tenant).

Não é necessário instalar nada no Hestia além do que já existe; só criar a chave e configurar no workspace.

---

## Parte 2: Mercado Pago (pagamento)

### 2.1 O que já existe

- `_get_payment_provider`: já escolhe `mercadopago` quando `currency == "BRL"` e lê `IntegrationConfig` (provider `mercadopago`, key `access_token`).
- `create_payment_attempt`: já chama `provider.create_payment_link(...)`; hoje o MercadoPagoProvider levanta erro.
- `process_webhook`: só implementado para `stripe`; para `mercadopago` retorna "unknown provider" na prática (o stub retorna processed=False).

### 2.2 O que implementar

- **MercadoPagoProvider.create_payment_link**:
  - Usar [Checkout Pro – Create Preference](https://www.mercadopago.com.ar/developers/en/docs/checkout-pro/create-payment-payment) (REST ou SDK Python).
  - Parâmetros: `invoice_id`, `amount`, `currency`, `success_url`, `cancel_url`, `customer_email`, `description`.
  - Incluir na preference: `external_reference` = `str(invoice_id)` (para o webhook identificar a fatura).
  - Incluir `notification_url` = URL pública do workspace (ex.: `https://api.seudominio.com/api/public/webhooks/mercadopago`) para o MP avisar quando o pagamento mudar de status.
  - Retornar `PaymentLinkResult(payment_url=init_point, external_id=preference_id)`.

- **MercadoPagoProvider.handle_webhook**:
  - MP envia POST com body tipo `{"type":"payment","data":{"id":"123456"}}` (ou similar; checar doc atual).
  - Extrair `payment_id`, chamar API MP `GET /v1/payments/{id}` (com access_token) para obter `status` e `external_reference`.
  - Se `status == "approved"` e `external_reference` numérico: considerar invoice_id; retornar `WebhookResult(processed=True, invoice_id=..., message=payment_id)`.
  - Idempotência: no `process_webhook` usar `WebhookEvent(provider="mercadopago", event_id=payment_id)` para não processar o mesmo pagamento duas vezes.

- **process_webhook (branch mercadopago)**:
  - Mesma lógica do branch stripe: buscar Invoice por `result.invoice_id`, marcar PAID, ativar Subscription, log audit, retornar `paid_invoice_id`.
  - Manter Stripe inalterado (sem regressão).

- **Configuração MP no Workspace**:
  - IntegrationConfig: provider `mercadopago`, key `access_token`, value = Access Token da aplicação MP (produção ou teste).
  - Opcional: key `webhook_secret` se o MP enviar assinatura (validar no handle_webhook se a doc indicar).

---

## Parte 3: Configuração Hestia no Workspace

- **IntegrationConfig**: provider `hestia`, key `api_credentials`, value (criptografado) = JSON com `base_url`, `access_key`, `secret_key`.
- **Resolver** (como em Stripe/SMTP): função `get_hestia_config(db, org_id)` que lê tenant → global e retorna o config descriptografado ou None.
- **Teste de conexão**: no endpoint existente `POST /api/workspace/config/integrations/{id}/test`, adicionar branch `provider == "hestia"`: chamar comando simples (ex.: `v-list-users`) e retornar ok/erro; atualizar `last_tested_at`.
- **Cliente Hestia**: módulo `app/providers/hestia/` (ou `app/integrations/hestia/`) com `HestiaClient(base_url, access_key, secret_key)`, método `request(cmd, **args)` (POST com `hash=access:secret`, `returncode=yes`, `cmd=...`, arg1, arg2…), e funções `create_user`, `add_web_domain` conforme [CLI Reference](https://hestiacp.com/docs/reference/cli.html).

---

## Parte 4: Produto “Hospedagem” e provisionamento

### 4.1 Modelo de dados

- **Product**: adicionar coluna `provisioning_type: str | None` (ex.: `"hestia_hosting"`) ou um JSON `metadata` com `{"provisioning": "hestia_hosting", "hestia_package": "default"}`. Recomendação: coluna `provisioning_type` (indexada) para consultas simples.
- **ProvisioningRecord** (nova tabela):
  - `id`, `subscription_id` (FK), `invoice_id` (FK, opcional), `provider` (ex.: `hestia`), `external_user` (usuário no Hestia), `domain`, `site_url` (ex.: `https://dominio.com`), `panel_login` (igual a external_user ou outro), `panel_password_encrypted` (opcional; alternativa: não guardar e só enviar por email na hora do provisionamento), `status` (`pending` | `provisioned` | `failed` | `canceled`), `meta` (JSON), `provisioned_at`, `created_at`, `updated_at`.
  - Índices: `subscription_id`, `customer_id` (via subscription) para o portal.
- Migration Alembic: adicionar coluna em `billing_products` e criar tabela `provisioning_records`.

### 4.2 Checkout com domínio

- **CheckoutStartRequest**: campo `domain: str | None = None`.
- No checkout: se `Product.provisioning_type == "hestia_hosting"` e `domain` estiver vazio ou inválido → 400. Validação mínima: não vazio, formato de domínio aceitável.
- Ao criar a Invoice, incluir no `line_items` (ex.: primeiro item) o campo `domain`: `[{"description": "...", "amount": ..., "domain": "cliente.com.br"}]`.

### 4.3 Fluxo após pagamento

- No `process_webhook`, após marcar Invoice PAID e Subscription ACTIVE (tanto Stripe quanto Mercado Pago), chamar **BackgroundTasks** (ou fila) com `trigger_provisioning_if_needed(db, invoice_id)`.
- **trigger_provisioning_if_needed**:
  - Carregar Invoice, Subscription, Product.
  - Se `Product.provisioning_type != "hestia_hosting"`: return.
  - Obter domínio de `invoice.line_items` (ex.: primeiro item com chave `domain`).
  - Gerar usuário Hestia (ex.: `cust_{customer_id}_{domain_sanitizado}`) e senha aleatória.
  - Chamar HestiaClient: criar usuário, depois `v-add-web-domain` (ou equivalente).
  - Criar ProvisioningRecord com status `provisioned`, `site_url`, `panel_login`, `panel_password_encrypted` (se guardar) ou apenas enviar senha por email e não persistir.
  - Em falha: ProvisioningRecord com status `failed`, `meta` com erro; log/audit; opcional notificar admin.

---

## Parte 5: Portal do cliente (visão única)

O cliente entra e vê tudo em uma tela (ou um endpoint que o front consome para montar a tela).

### 5.1 Endpoint: GET /api/portal/me/dashboard

Retornar um único JSON com:

- **plan**: status do plano da subscription ativa (ou a mais recente).
  - `status`: `"active"` | `"inactive"` (derivado de Subscription.status).
  - `product_name`, `price_plan_name`, `since` (start_date).
  - Se não houver subscription: `plan: null` ou `status: "none"`.

- **site**: dados do provisionamento (hospedagem).
  - `url`: ex.: `"https://meusite.com.br"` (de ProvisioningRecord.site_url).
  - `status`: `"provisioned"` | `"pending"` | `"failed"` (de ProvisioningRecord).
  - Se não houver registro: `site: null`.

- **invoice**: última fatura da subscription do cliente (para exibir “Fatura: paga” ou “Fatura: pendente”).
  - `id`, `status` (paid/pending/draft), `due_date`, `total`, `currency`.
  - **can_pay_invoice**: booleano (ex.: status == pending e fatura não vencida em atraso crítico).
  - Assim o front mostra “Fatura: paga” ou “Fatura pendente” + botão **Pagar fatura** (link para fluxo de pagamento usando `invoice_id`).

- **panel**: dados de acesso ao painel Hestia (somente se houver ProvisioningRecord provisionado).
  - `login`: usuário do painel (panel_login ou external_user).
  - `password`: senha (se estiver armazenada descriptografada em memória apenas para exibir uma vez, ou “••••••” com botão “Reenviar por email”; recomenda-se não devolver senha em texto e sim “Reenviar credenciais por email”).
  - Alternativa segura: não retornar senha; retornar `login` + `panel_url` (URL do Hestia) e um endpoint “Reenviar credenciais por email” que gera link temporário ou envia senha por email.

- **support**: resumo de suporte (tickets).
  - `tickets_open_count` (ou lista mínima).
  - Link ou slug para “Suporte” (já existe `GET /api/portal/tickets`).

- **messages**: notificações / mensagens (entregáveis).
  - `unread_count` (notificações não lidas).
  - Ou últimas N notificações (já existe `GET /api/portal/notifications`).
  - “Entregáveis” pode ser a mesma lista de notificações ou um tipo específico (ex.: notificações com channel “deliverable”); pode ficar como extensão futura.

Tudo isso com **feature flag** (ex.: `portal.dashboard.enabled` ou reaproveitar `billing.enabled` / `portal.invoices.enabled`) e atrás de `get_current_customer`; só dados do `customer_id` do usuário logado.

### 5.2 Botão “Pagar fatura”

- O front usa `invoice.id` e `can_pay_invoice` do dashboard.
- Chama `POST /api/portal/invoices/{invoice_id}/pay` (já existe) com `success_url` e `cancel_url`; a API retorna `payment_url` (Mercado Pago ou Stripe). Front redireciona para `payment_url`.

### 5.3 Segurança do painel (login/senha)

- **Recomendação**: não armazenar senha em claro; no provisionamento enviar senha por email e opcionalmente guardar hash ou não guardar. No portal: mostrar apenas `login` e `panel_url`; ter ação “Reenviar credenciais por email” (gera nova senha no Hestia, atualiza no Hestia, envia por email, e opcionalmente atualiza `panel_password_encrypted` se quiser guardar).

---

## Parte 6: Ordem de implementação (sem gaps / sem regressão)

1. **Migration**: `Product.provisioning_type` (nullable string); tabela `provisioning_records` com FKs e índices.
2. **Mercado Pago**: implementar `create_payment_link` (preference com external_reference e notification_url) e `handle_webhook` (ler payment, idempotência por payment id); branch `mercadopago` em `process_webhook` (mesma lógica de marcar PAID e ativar subscription).
3. **Hestia**: IntegrationConfig `hestia` + `api_credentials`; resolver `get_hestia_config`; cliente `HestiaClient` + `create_user` + `add_web_domain`; no `POST .../integrations/{id}/test` branch hestia.
4. **Provisioning**: serviço `trigger_provisioning_if_needed(db, invoice_id)` (ler Product.provisioning_type, domínio de line_items, chamar Hestia, criar ProvisioningRecord); chamada em BackgroundTasks no `process_webhook` (Stripe e Mercado Pago) após marcar PAID.
5. **Checkout**: `domain` em `CheckoutStartRequest`; validação “obrigatório se hospedagem”; gravar `domain` em `line_items`.
6. **Portal dashboard**: `GET /api/portal/me/dashboard` com schema Pydantic (plan, site, invoice, can_pay_invoice, panel, support, messages); feature flag; usar apenas dados do customer do token.
7. **Reenviar credenciais** (opcional fase 1): endpoint `POST /api/portal/me/resend-panel-credentials` que envia email com login + senha (se guardada) ou gera nova senha no Hestia e envia.
8. **Feature flags**: adicionar `portal.dashboard.enabled` ou reaproveitar billing; em `GET /api/portal/me/features` incluir `hosting` ou `dashboard` conforme o que o front precisar para mostrar/ocultar o bloco.
9. **Testes**: unitários para MercadoPagoProvider (mock HTTP); para HestiaClient (mock); integração do webhook MP e do provisionamento (mock Hestia); portal dashboard (fixture com subscription + invoice + ProvisioningRecord).
10. **Documentação**: atualizar `docs/API.md` com Mercado Pago (webhook URL, external_reference), Hestia (config), checkout (domain), portal dashboard (estrutura da resposta).

---

## Parte 7: Checklist “sem regressão”

- [ ] Stripe continua funcionando (checkout e webhook) quando currency != BRL.
- [ ] Listagem de faturas e “pagar fatura” no portal continuam iguais.
- [ ] Feature flags existentes (invoices, tickets, projects) intactas.
- [ ] Testes existentes passando (billing, portal, webhook Stripe).
- [ ] Novos fluxos (MP, provisionamento, dashboard) cobertos por testes e documentação.

---

## Resumo do que você configura

| Onde        | O quê |
|------------|--------|
| **Hestia** | Access Key + Secret Key; whitelist IP do servidor da API; anotar URL base do painel. |
| **Workspace** | Integração **Mercado Pago**: provider `mercadopago`, key `access_token`, value = token da app MP. Integração **Hestia**: provider `hestia`, key `api_credentials`, value = JSON com `base_url`, `access_key`, `secret_key`. |
| **Mercado Pago (app)** | Configurar no dashboard a URL de notificação (webhook) para produção e teste: `https://sua-api/api/public/webhooks/mercadopago`. |

Com isso, o plano fica fechado: pagamento (Mercado Pago), provisionamento (Hestia), portal (plano, site, fatura, botão pagar, dados do painel, suporte/mensagens), sem gaps e sem regressão, no padrão do projeto.
