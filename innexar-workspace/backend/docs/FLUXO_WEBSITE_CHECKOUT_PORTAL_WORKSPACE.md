# Fluxo completo: Website → Checkout → Portal → Workspace

Documento de referência da integração entre as três aplicações.

---

## 1. Aplicações e URLs

| Aplicação | Repositório | URL (default) | Função |
|-----------|-------------|----------------|--------|
| **Website** | innexar-websitebr | innexar.com.br | Site institucional + **página e UI de checkout** (Criar meu site) |
| **Portal** | innexar-portal | portal.innexar.com.br | Área do **cliente**: dashboard, briefing, faturas, projetos, suporte |
| **Workspace** | innexar-workspace-app | app.innexar.com.br | Área **staff/admin**: clientes, projetos, billing, Hestia, etc. |
| **API** | innexar-workspace (backend) | api.innexar.com.br | Backend único: checkout público, API portal (cliente), API workspace (staff) |

---

## 2. Redirecionamentos no Website

No **innexar-websitebr** (`next.config.ts`):

- `/:locale/portal` e `/:locale/portal/:path*` → redirecionam para **PORTAL_URL** (ex.: `https://portal.innexar.com.br/:locale/...`).
- `/:locale/workspace` e `/:locale/workspace/:path*` → redirecionam para **WORKSPACE_URL** (ex.: `https://app.innexar.com.br/:locale/...`).

Ou seja: no domínio do site, `/portal` e `/workspace` não são páginas locais; são redirects para as apps separadas.

Variáveis (website):

- `NEXT_PUBLIC_PORTAL_URL` — base do portal (usada em redirects e em **success_url** do checkout).
- `NEXT_PUBLIC_WORKSPACE_URL` — base do workspace.
- `NEXT_PUBLIC_USE_WORKSPACE_API` — se a UI usa a API do workspace (checkout, etc.).
- `NEXT_PUBLIC_WORKSPACE_API_URL` — base da API (ex.: `https://api.innexar.com.br`).

---

## 3. Fluxo "Criar meu site" (end-to-end)

### 3.1 Entrada

- Usuário no **website** (innexar-websitebr).
- Páginas: `/[locale]/criar-site` → CTA leva para `/[locale]/criar-site/checkout`.
- Checkout pode receber `?plano=essencial` ou `?plano=completo`.

### 3.2 Checkout (UI no website, API no workspace)

- **UI:** `innexar-websitebr` → `/[locale]/criar-site/checkout`.
- **API:** `POST https://api.innexar.com.br/api/public/checkout/start` (backend innexar-workspace).
- Body inclui: `customer_email`, `customer_name`, `customer_phone`, `product_id`, `price_plan_id`, **`success_url`**, **`cancel_url`**.
- `success_url` enviado pelo front: `{NEXT_PUBLIC_PORTAL_URL}/{locale}?checkout=success` (ex.: `https://portal.innexar.com.br/pt?checkout=success`).
- `cancel_url`: `{origin}/{locale}/criar-site/checkout?cancel=1`.

Backend no checkout/start:

1. Encontra ou cria **Customer** e **CustomerUser** (senha aleatória; fluxo de “esqueci senha” no portal).
2. Cria **Subscription** (inicialmente inativa) e **Invoice**.
3. **Bricks (cartão/Pix):** processa pagamento na hora; se aprovado, o backend dispara as mesmas ações pós-pagamento que o webhook: criação de projeto (para produto site), envio de e-mail com credenciais do portal e notificação in-app/e-mail. O front redireciona para `success_url` (portal).
4. **Checkout Pro (link MP):** retorna `payment_url`; usuário paga no gateway; o gateway chama o **webhook**; o webhook marca fatura paga e dispara criação de projeto, credenciais e notificação. O gateway redireciona para o mesmo `success_url` (portal).

Para que o **projeto** seja criado automaticamente após o pagamento (fluxo "Criar meu site"), o produto usado no checkout deve ter no workspace **provisioning_type = site_delivery** (ou nome contendo "site"). Caso contrário, a criação de projeto não ocorre.

Após pagamento aprovado, o usuário **sempre** cai no **Portal** (`NEXT_PUBLIC_PORTAL_URL`), nunca no workspace.

### 3.3 Portal (cliente)

- **App:** innexar-portal (portal.innexar.com.br).
- Todas as chamadas de dados do cliente vão para a **API do workspace**: `NEXT_PUBLIC_WORKSPACE_API_URL` (ex.: api.innexar.com.br).
- Autenticação: token de cliente em `localStorage` (`customer_token`); login via `POST /api/public/auth/customer/login`.

Fluxo ao chegar do checkout:

1. Usuário abre `https://portal.innexar.com.br/pt?checkout=success`.
2. Dashboard do portal (`PortalDashboardWorkspace`) lê `?checkout=success` e pode exibir mensagem de sucesso.
3. Se não tiver token, precisa fazer login (e-mail já existe pelo checkout).
4. No dashboard: link **“Preencher dados do site”** → `/[locale]/site-briefing`.
5. **Site briefing:** formulário + upload de arquivos; envio via `POST /api/portal/site-briefing` (workspace API). Projeto fica “aguardando briefing” até envio; depois pode ir para “briefing_recebido” / pipeline.
6. Outras telas: **Faturas** (`/api/portal/invoices`, pagamento via `POST /api/portal/invoices/{id}/pay`), **Projetos**, **Suporte**, **Perfil**, **Notificações**.

Nenhuma página do portal é servida pelo website; o website só redireciona para o portal.

### 3.4 Workspace (staff)

- **App:** innexar-workspace-app (app.innexar.com.br).
- Autenticação: token staff em `localStorage` (`staff_token`); login via `POST /api/workspace/auth/staff/login`.
- Uso: gestão de clientes, assinaturas, faturas, projetos, pipeline, Hestia, etc.
- **Não** há redirecionamento do checkout ou do portal para o workspace; acesso é direto (URL do workspace) para equipe interna.
- **Dados de acesso (MVP manual):** na página de detalhe do projeto, a seção "Dados de acesso / Entrega" permite preencher `panel_url`, `login` e `observações` após o provisionamento manual. Esses dados são persistidos em `Project.delivery_info` (JSON) via `PATCH /api/workspace/projects/{id}`.

### 3.5 Fluxo WaaS USA (MVP manual)

- **Website (innexar.app):** página `/launch` com planos (Starter, Business, Pro). Ao clicar no plano, o usuário é redirecionado para **`/[locale]/launch/checkout?plan=starter|business|pro`** (página dedicada de checkout).
- **Página de checkout:** exibe o plano selecionado, benefícios e formulário (e-mail obrigatório, nome e telefone opcionais). Ao enviar, o front chama `POST /api/waas/checkout` (proxy para a API do workspace) com `plan_slug`, `customer_email`, `customer_name`, `customer_phone`, `locale`. O backend cria Customer, Subscription, Invoice e retorna `payment_url` (Stripe). O front redireciona para o Stripe.
- **Após pagamento (Stripe):** webhook marca a fatura como paga; o backend cria **Project** (status `aguardando_briefing`), gera senha temporária para o **CustomerUser**, envia **e-mail com credenciais do portal** (assunto e corpo em EN/PT/ES conforme `locale` gravado no checkout) com links `{PORTAL_URL}/{locale}/login` e `{PORTAL_URL}/{locale}/site-briefing`. O cliente acessa o portal, faz login com o e-mail e a senha recebida por e-mail.
- **Portal:** o cliente preenche o **briefing completo** em `/[locale]/site-briefing` (formulário + campo "Briefing completo / detalhes adicionais" + upload de arquivos). O envio vai para `POST /api/portal/site-briefing` (campo `description` opcional). O projeto passa a "briefing_recebido".
- **Provisionamento MVP:** 100% manual. A equipe provisiona o site (por exemplo via Estia/Hestia para planos simples, ou manualmente para planos superiores) e preenche no workspace a seção **"Dados de acesso / Entrega"** do projeto (URL do painel, login, observações). Nenhuma automação de criação de site no MVP.

---

## 4. Resumo dos fluxos de pagamento

| Onde | Ação | API / Redirect |
|------|------|----------------|
| Website (criar-site/checkout) | Iniciar compra “Criar meu site” | `POST /api/public/checkout/start` → `payment_url` ou aprovação Brick → redirect para **Portal** com `?checkout=success` |
| Portal (billing) | Pagar fatura aberta | `POST /api/portal/invoices/{id}/pay` (body: `success_url`, `cancel_url`) → `payment_url` → gateway → redirect de volta para `success_url` (ex.: `/{locale}/billing?paid=1`) |

Em ambos os casos, o backend que gera o link de pagamento e processa webhooks é o **innexar-workspace** (api.innexar.com.br).

---

## 5. Configuração do backend (e-mails e links)

- **PORTAL_URL:** No backend, **PORTAL_URL** (quando definida) é usada no e-mail de credenciais pós-pagamento para montar `login_url` e `briefing_url` com o locale preferido do cliente (ex.: `{PORTAL_URL}/{locale}/login`). O locale é gravado no checkout (body `locale`) e persistido em `Invoice.line_items[].preferred_locale`; o serviço `send_portal_credentials_after_payment` lê esse valor e envia o e-mail no idioma correto (EN/PT/ES).
- **FRONTEND_URL:** No backend (innexar-workspace), a variável **FRONTEND_URL** deve ser a URL do **website** (ex.: `https://innexar.com.br`), não a do portal nem do workspace. Ela é usada nos e-mails de recuperação de senha para montar os links:
  - Cliente: `{FRONTEND_URL}/portal/reset-password?token=...`
  - Staff: `{FRONTEND_URL}/workspace/reset-password?token=...`
  O usuário clica no link no website; o redirect do `next.config.ts` envia para o portal ou workspace com o path preservado (ex.: `https://portal.innexar.com.br/pt/reset-password?token=...`). Verificar em produção que o redirect preserva a query string.

- **Feature flags:** O portal respeita as flags `billing.enabled` (ou `portal.invoices.enabled`), `portal.tickets.enabled` e `portal.projects.enabled`. O frontend usa `GET /api/portal/me/features` para exibir ou ocultar itens de menu (faturas, suporte, projetos).

- **Armazenamento de arquivos (MinIO):** Os arquivos de projeto (site-briefing e anexos) são armazenados no MinIO (bucket configurado em settings, ex.: `MINIO_BUCKET_PROJECTS`). O upload/download no portal e no workspace usam as rotas `/api/portal/projects/{id}/files` e `/api/workspace/projects/{id}/files`. O container/serviço MinIO deve estar ativo para que o envio de documentos funcione.

---

## 6. E-mail pós-pagamento (website)

O template em `innexar-websitebr` (`email-payment-confirmation.ts`) pode usar variável de ambiente para a URL do portal (ex.: `NEXT_PUBLIC_PORTAL_URL`). URLs fixas atuais do portal:

- Login: `https://portal.innexar.com.br/pt/login`
- Briefing: `https://portal.innexar.com.br/pt/site-briefing`

Se o portal tiver outro domínio ou locale padrão, esses valores devem ser alinhados (variáveis de ambiente ou config).

---

## 7. Checklist de integração

- [ ] **Website:** `NEXT_PUBLIC_PORTAL_URL` e `NEXT_PUBLIC_WORKSPACE_API_URL` definidos (build e runtime conforme stack).
- [ ] **Portal:** `NEXT_PUBLIC_USE_WORKSPACE_API=true` e `NEXT_PUBLIC_WORKSPACE_API_URL` apontando para a API do workspace.
- [ ] **Workspace (app):** mesma `NEXT_PUBLIC_WORKSPACE_API_URL` para consumo da API.
- [ ] **Checkout:** após pagamento aprovado, usuário é redirecionado para `{PORTAL_URL}/{locale}?checkout=success`.
- [ ] **Portal:** dashboard trata `checkout=success`; link “Preencher dados do site” leva a `/[locale]/site-briefing`.
- [ ] **API (workspace):** rotas públicas (`/api/public/checkout/start`, `/api/public/auth/customer/login`) e rotas portal (`/api/portal/*`) e workspace (`/api/workspace/*`) no mesmo backend.
- [ ] **Backend:** `FRONTEND_URL` definida como URL do website (para links de reset de senha nos e-mails).
- [ ] **Produto "Criar meu site":** produto cadastrado no workspace com `provisioning_type = site_delivery` (ou nome contendo "site") para criação automática de projeto após pagamento.
- [ ] **MinIO:** bucket de projetos configurado e acessível para upload/download de arquivos de projeto.
- [ ] **WaaS USA:** checkout envia `locale` no body; backend persiste em `line_items`; e-mail de credenciais usa PORTAL_URL e locale (EN/PT/ES). Portal e site-briefing com i18n completo. Workspace: após provisionamento manual, preencher "Dados de acesso" do projeto (delivery_info).

Este documento descreve o fluxo completo website → checkout → portal → workspace para referência e onboarding.
