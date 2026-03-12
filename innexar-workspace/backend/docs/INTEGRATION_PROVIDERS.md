# Integration providers – padrão e por provedor

Visão única dos provedores de integração (Payment, Hosting, Email, DNS) e documentação por provedor conforme template: requisitos, credenciais, endpoints, eventos, erros e testes.

## Tipos de provedor

| Tipo       | Uso                    | Implementações                          |
| ---------- | ---------------------- | --------------------------------------- |
| **Payment**  | Links de pagamento, webhooks | Stripe, Mercado Pago                    |
| **Hosting**  | Conta, domínio, e-mail, suspensão | Hestia (HestiaCP)                       |
| **Email**    | Envio de notificações  | SMTP (Resend ou servidor próprio)       |
| **DNS**      | Zonas e registros DNS  | Cloudflare (API v4)                     |

Contratos em código: `PaymentProviderProtocol` (`app/providers/payments/base.py`), `HostingProviderProtocol` (`app/providers/hosting/base.py`), `EmailProviderProtocol` (`app/providers/email/base.py`). Cloudflare não segue um protocolo genérico; cliente em `app/providers/cloudflare/client.py`.

---

## Stripe

- **Visão geral**: pagamentos em cartão; link de checkout e webhook para confirmar pagamento e atualizar fatura.
- **Credenciais**: IntegrationConfig `provider=stripe`, `key=api_credentials`. Valor (JSON criptografado): `secret_key` (Sk_live_... ou Sk_test_...). Obter em [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys).
- **Configuração**: env ou IntegrationConfig; teste via `POST /api/workspace/config/integrations/{id}/test` (usa `Balance.retrieve()`).
- **Métodos (protocolo)**: `create_payment_link(...)` → URL + external_id; `handle_webhook(body, headers)` → verifica assinatura, retorna invoice_id quando aplicável.
- **Webhook**: `POST /api/public/webhooks/stripe`. Configurar no Stripe Dashboard a URL e o signing secret (header `Stripe-Signature`). Eventos tratados: `checkout.session.completed`; idempotência via tabela `billing_webhook_events` (provider + event_id).
- **Erros comuns**: assinatura inválida (verificar signing secret); event_id duplicado (já processado). Troubleshooting: logs do router público, conferir `WebhookEvent` e status da Invoice.
- **Testes**: usar chaves de teste (Sk_test_...); sandbox do Stripe. Checklist produção: URL de webhook HTTPS, signing secret de produção, modo live no config.

---

## Mercado Pago (BRL)

- **Visão geral**: pagamentos em BRL; Checkout Pro (Preference); webhook para notificação de pagamento.
- **Credenciais**: IntegrationConfig `provider=mercadopago`, `key=access_token` (ou armazenado como JSON em `api_credentials` conforme implementação). Obter em [Mercado Pago Developers](https://www.mercadopago.com.br/developers) → Sua integração → Credenciais.
- **Configuração**: IntegrationConfig; teste via workspace pode retornar "test not implemented".
- **Métodos (protocolo)**: `create_payment_link(...)` cria Preference com `external_reference=invoice_id`; `handle_webhook(body, headers)` processa notificação e resolve fatura.
- **Webhook**: `POST /api/public/webhooks/mercadopago`. Configurar no app MP a URL de notificação. Variável opcional: `MP_NOTIFICATION_URL` ou `MERCADOPAGO_NOTIFICATION_URL`. Idempotência via `WebhookEvent` (provider + event_id).
- **Erros comuns**: URL de notificação não alcançável; external_reference não encontrado. Troubleshooting: logs do router público, verificar payload da notificação e mapeamento para invoice_id.
- **Testes**: credenciais de teste (sandbox MP). Checklist produção: URL HTTPS, credenciais de produção.

---

## Hestia (Hosting)

- **Visão geral**: hospedagem (usuário, domínio web, opcionalmente e-mail). Provisionamento após fatura paga; suspensão por inadimplência; reativação após pagamento.
- **Credenciais**: IntegrationConfig `provider=hestia`, `key=api_credentials`. Valor (JSON criptografado): `base_url`, `access_key`, `secret_key`. Obter no HestiaCP: User → API.
- **Configuração**: `GET/PUT /api/workspace/config/hestia/settings` (grace_period_days, default_hestia_package, auto_suspend). Teste: `POST /api/workspace/config/integrations/{id}/test`.
- **Métodos (HostingProviderProtocol)**: `create_user`, `ensure_domain`, `ensure_mail`, `suspend_user`, `unsuspend_user`, `healthcheck`. Cliente: `HestiaClient` em `app/providers/hestia/client.py`.
- **Endpoints / fluxo**: provisionamento disparado após webhook (fatura paga) ou mark-paid; job em `ProvisioningJob` com steps create_user → add_domain → create_mail → finalize. Inadimplência: `POST /api/workspace/billing/process-overdue` (cron).
- **Erros comuns**: "already exists" (domínio/usuário) — tratado como idempotente em `ensure_domain`/`ensure_mail`; conexão recusada (verificar base_url e firewall). Troubleshooting: logs de provisioning, `ProvisioningJob.logs` e `last_error`.
- **Testes**: HestiaCP de desenvolvimento; healthcheck via list_users. Checklist produção: HTTPS, credenciais de produção, grace_period_days e process-overdue configurados.

---

## Email (SMTP)

- **Visão geral**: envio de e-mails (convites, recuperação de senha, notificações). Protocolo: `send(to, subject, body, html)` e opcionalmente `test_connection()`.
- **Credenciais**: IntegrationConfig ou env; provider SMTP com JSON (host, port, user, password). Resend ou servidor SMTP próprio. Obter: painel do provedor (Resend, SendGrid, etc.) ou configuração do servidor.
- **Configuração**: teste via `POST /api/workspace/config/integrations/{id}/test` (conexão + STARTTLS + login).
- **Métodos**: `send(to, subject, body, html=None)`; implementação em `app/providers/email/smtp.py`.
- **Eventos**: não há webhooks; envio síncrono ou em background (BackgroundTasks).
- **Erros comuns**: autenticação falhou (usuário/senha); porta bloqueada; TLS. Troubleshooting: test connection no workspace, logs do servidor de e-mail.
- **Testes**: SMTP de teste (ex.: Mailtrap). Checklist produção: credenciais de envio, domínio verificado, rate limits.

---

## Cloudflare (DNS)

- **Visão geral**: DNS principal quando o cliente usa Cloudflare; criação de zona, registros MX/SPF (e opcionalmente DKIM/DMARC após obter dados do Hestia). Provisionamento opcional após Hestia (steps create_cloudflare_zone, create_cloudflare_records).
- **Credenciais**: IntegrationConfig `provider=cloudflare`, `key=api_credentials`. Valor (JSON criptografado): `api_token`, `account_id`. Obter em [Cloudflare Dashboard → My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens). Usar **API Token** (não Global API Key); permissões: Zone → DNS → Edit, Zone → Zone → Read, Account → Zone → Edit. `account_id` em Overview do dashboard.
- **Configuração**: armazenamento em IntegrationConfig; sem endpoint de teste dedicado no workspace (pode ser adicionado).
- **Métodos (cliente)**: `list_zones(name)`, `get_zone_by_name(name)`, `create_zone(name, account_id, type="full")`, `create_dns_record(zone_id, type, name, content, ttl, proxied, priority)`. Base URL: `https://api.cloudflare.com/client/v4`.
- **Fluxo**: durante o provisioning (após ensure_mail no Hestia), se Cloudflare configurado: criar zona se não existir; criar registros MX e SPF (TXT). Nameservers retornados na criação da zona devem ser informados ao cliente para apontar no registrador.
- **Erros comuns**: 403 (token sem permissão); account_id ausente (obrigatório para create zone). Troubleshooting: verificar escopo do token e account_id.
- **Testes**: conta Cloudflare de teste; criar zona de teste. Checklist produção: API Token com permissões mínimas, account_id correto.

---

## Referências na API

- **API.md**: contrato de endpoints públicos e workspace (webhooks, dashboard, mark-paid, PATCH subscription, customers, forgot/reset password).
- **Idempotência**: webhooks de pagamento usam `billing_webhook_events` (provider + event_id).
- **Provisioning**: `ProvisioningJob` rastreia steps e logs; `ProvisioningRecord` armazena resultado (user, domain, status) por subscription/invoice.
