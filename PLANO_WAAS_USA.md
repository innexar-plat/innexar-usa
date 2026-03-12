# Plano completo: Website as a Service (EUA) — sem gaps

Documento único de referência: ordem de execução, **camada de jobs** (Redis + Celery/RQ), **GLOBAL_RULES.md**, versionamento de sites (draft/published/history), controle de quota de alterações, qualidade (testes obrigatórios, cobertura 80%/60%, lint, build, Sonar), dashboard do cliente, melhorias estratégicas e arquitetura final (Website → API → Redis Queue → Workers → Cloudflare Pages).

---

## Por onde começar: ordem das fases

A implementação segue esta ordem para minimizar dependências e entregar valor incremental.

| Fase | Foco | Entregas principais |
|------|------|---------------------|
| **1** | **Website (innexar.app)** | SEO local, seções (hero, planos, benefícios, garantia, FAQ), checkout WaaS (plan_slug), launch = página de planos, i18n EN/ES/PT |
| **2** | **Backend (api3)** | GET /api/public/products/waas, POST checkout/start com plan_slug, seed produtos USD, webhook Stripe, CORS |
| **3** | **Portal (panel)** | Dashboard completo do cliente, briefing traduzido, redirect pós-checkout, env api3/panel |
| **4** | **Framework + templates** | Revisão e adaptação do innexar-framework, pasta templates/usa por nicho, template.json/sections/styles/content |
| **5** | **Geração com IA + jobs + revisão** | Job queue (Redis/Celery); briefing → GenerateContentJob → draft → revisão manual → GenerateSiteJob → DeploySiteJob → versionamento (draft/published/history) |
| **6** | **Automação e qualidade** | Testes automatizados, lint, build, commit/push, Sonar; CI definido para todos os repositórios |

Nenhuma fase pula a outra: 1 → 2 → 3 → 4 → 5 → 6. Detalhes de cada fase abaixo.

---

## Fase 1: Website (começar por aqui)

- **SEO local**: meta tags, structured data, títulos e descrições por locale (en, es, pt); URLs amigáveis; sitemap.
- **Seções da página WaaS (launch)**:
  - Hero: "Professional Website for Your Business — Without Paying Thousands Upfront", "From $129/month", CTAs "Start My Website" / "View Examples".
  - Benefícios: No large upfront cost, Hosting and maintenance included, Mobile optimized, Built to generate leads.
  - Planos: cards Starter ($129), Business ($199), Pro ($299) com features (páginas, updates/mês, suporte).
  - Garantia: 30 Day Satisfaction Guarantee.
  - FAQ, CTA final.
- **Checkout**: dados via GET /api/public/products/waas; ao clicar "Start My Website", coletar email/nome; chamar POST /api/public/checkout/start com **plan_slug** (não product_id/price_plan_id); redirect para payment_url (Stripe). success_url = panel.innexar.app?checkout=success; cancel_url = innexar.app/launch.
- **Remover/descontinuar**: `/api/launch/checkout` (Stripe one-time); um único fluxo = WaaS via API.
- **i18n**: chaves para hero, planos, benefícios, garantia, FAQ e CTAs em messages (en, es, pt).

---

## Fase 2: Backend (API workspace)

- **GET /api/public/products/waas**: retorna array com `slug`, `name`, `price`, `currency`, `features` (starter, business, pro). Frontend nunca usa product_id/price_plan_id.
- **POST /api/public/checkout/start**: aceita **plan_slug**; backend resolve product_id e price_plan_id; cria Customer, Subscription, Invoice; retorna payment_url (Stripe para USD).
- **Seed**: produtos USD (Starter $129, Business $199, Pro $299) com slug fixo; currency USD; provisioning_type site_delivery.
- **Webhook Stripe**: Create subscription → Create project → Send onboarding email; CORS para innexar.app e panel.innexar.app.

---

## Fase 3: Portal — dashboard completo do cliente

O dashboard do cliente (panel.innexar.app) deve cobrir tudo que o cliente precisa, sem gaps:

- **Site ativo**: status do site (em construção, publicado, URL); link para visualizar.
- **Faturas**: listagem, status (pago/pendente), botão pagar (Stripe/MP conforme moeda).
- **Solicitar alteração**: fluxo para pedir alterações (dentro do limite do plano: 1/3/priority); histórico ou status.
- **Briefing do site**: formulário completo (nome empresa, serviços, cidade, telefone, domínio, logo, cores, fotos); já existe em site-briefing; garantir tradução EN/ES.
- **Domínio**: exibir domínio configurado; se aplicável, instruções ou link para configurar.
- **Analytics**: resumo ou link para relatório (ex.: Google Analytics); pode ser fase 2 pós-MVP.
- **Notificações**: central de avisos (pagamento, projeto, suporte).
- **Suporte**: acesso a tickets/mensagens.
- **Perfil/Conta**: alterar senha, dados de contato.

Redirect pós-checkout: ?checkout=success → CTA claro "Preencha os dados do seu site" (briefing); traduzir para EN/ES.

---

## Fase 4: Revisão e adaptação do innexar-framework

- **Localização**: o framework está em **innexar-usa/innexar-framework** (cópia do /opt/innexar-framework).
- **Estrutura atual**: `themes/` (theme-contador, theme-medico, theme-advocacia), `apps/` (admin, site Astro, api), `modules/` (media, leads, pages, settings, scheduling, blog).
- **Revisão**:
  - Documentar dependências (Node, pnpm/npm, Astro, etc.) e scripts de build.
  - Avaliar compatibilidade com stack do projeto (Next.js no website vs Astro no framework); definir se templates serão consumidos como está (Astro) ou adaptados para Next/HTML estático.
  - Listar temas existentes e mapear para nichos USA: theme-advocacia → lawyer; theme-medico → dentist; theme-contador → consultant; criar/adaptar para plumber, roofing, cleaning, real-estate, restaurant.
- **Adaptação**:
  - Alinhar `themes/` à estrutura da pasta **templates/usa/** (template.json, sections/, styles/, content/).
  - Garantir que o pipeline "briefing → template → deploy" possa usar o framework (via CLI, API ou build estático).
- **Documentação**: README em templates/ e em innexar-framework explicando uso para WaaS (geração de sites a partir do briefing).

---

## Fase 5: Criação de sites com IA e revisão manual

- **Objetivo**: gerar textos e layout dos sites com IA, com **revisão manual** antes de publicar.
- **Escopo da IA** (mínimo):
  - **Textos**: hero, descrição de serviços, about, CTAs; baseado em briefing (nome, serviços, cidade, nicho).
  - **Layout**: sugestão de seções e ordem (hero, services, about, contact); pode usar template fixo por nicho e IA só para conteúdo.
- **Fluxo**:
  1. Cliente preenche briefing (portal).
  2. Sistema envia briefing (ou resumo) para serviço de IA (API interna ou integração).
  3. IA retorna: textos por seção + opcionalmente sugestão de layout.
  4. **Revisão manual**: staff ou cliente aprova/edita textos e layout (tela no portal ou workspace-app).
  5. Após aprovação: Template Engine gera site (usando innexar-framework ou templates/usa) e deploy (Vercel/Cloudflare).
- **Sem gaps**: definir onde a "revisão manual" acontece (portal do cliente vs workspace para staff); persistir versões (rascunho vs aprovado).

---

## Fase 6: Qualidade e CI — testes, lint, build, commit, push, Sonar

Garantir pipeline de qualidade em todos os projetos envolvidos (innexar-website, innexar-workspace, innexar-portal, innexar-workspace-app; opcionalmente innexar-framework).

- **Testes automatizados**:
  - Backend (innexar-workspace): pytest (unit + integration); cobrir billing, checkout/start com plan_slug, webhooks.
  - Frontend (website, portal, workspace-app): testes de componente ou E2E conforme stack (Jest, React Testing Library, Playwright); pelo menos smoke dos fluxos críticos (login, planos, checkout redirect).
- **Lint**: ESLint (TS/JS), Ruff (Python); configs no repositório; falha no CI se lint falhar.
- **Build**: Next.js build (website, portal, workspace-app); FastAPI/uvicorn não quebrar; build do innexar-framework se for usado no pipeline.
- **Commit e push**: padrão de commits (ex.: conventional commits); branch protection; push só após CI verde (opcional).
- **Sonar (ou similar)**: análise estática de código (bugs, vulnerabilidades, code smells, duplicação); integração no pipeline (GitHub Actions, GitLab CI, etc.); definir qualidade mínima (ex.: sem blockers, cobertura mínima).
- **Sem gaps**: cada repositório ou monorepo deve ter pelo menos: lint → test → build; Sonar como passo adicional antes de merge.

---

## Camada de jobs (obrigatória para escala 500+)

O fluxo de geração de site **não pode travar a API**. Para escala real:

```
briefing
  ↓
job queue (Redis + Celery ou RQ)
  ↓
AI generation
  ↓
draft version
  ↓
review (manual)
  ↓
publish
```

- **Stack sugerida**: Redis (broker) + Celery ou RQ (workers).
- **Jobs separados** (evitar um único job gigante; permite retry e monitoramento):
  - **GenerateContentJob**: briefing → IA (textos, layout) → salva draft.
  - **GenerateSiteJob**: draft aprovado → Template Engine → artefato estático (draft).
  - **DeploySiteJob**: artefato aprovado → deploy (Cloudflare Pages/Vercel) → notificar cliente.
- A API apenas enfileira o job e retorna; o worker processa de forma assíncrona. Assim, 100 clientes no mesmo dia não derrubam a API.

---

## Regras globais para IA — GLOBAL_RULES.md

Criar **GLOBAL_RULES.md** na raiz do projeto para que qualquer IA desenvolva com consistência e sem quebrar a arquitetura.

Conteúdo mínimo sugerido:

- **Regras de arquitetura**: Backend é FastAPI; Frontend é Next.js; Banco é PostgreSQL; Billing sempre via Stripe API; Nunca usar product_id no frontend; Usar plan_slug sempre.
- **Regras de segurança**: Nunca expor Stripe secret; Nunca expor credenciais de banco; Nunca escrever SQL sem parameter binding.
- **Regras de código**: Todo código deve ter lint; Todo endpoint deve ter teste; Toda feature deve ter type safety; Não usar `any` em TypeScript.
- **Regras de deploy**: build obrigatório antes de push; lint obrigatório; testes obrigatórios.

Arquivo a ser criado: **innexar-usa/GLOBAL_RULES.md** (ou na raiz de cada repo, conforme convenção).

---

## Processos automáticos obrigatórios

### Processo 1 — Versionamento de sites

Não fazer: site gerado → deploy direto.  
Fazer: **draft → version → publish**.

- **Estrutura sugerida**:
  - `sites/draft/` — versões em revisão.
  - `sites/published/` — versão atual em produção.
  - `sites/history/` — versões anteriores (rollback se necessário).
- Cada publicação gera uma **version** (ex.: v1, v2). Evita quebrar sites de clientes ao atualizar.

### Processo 2 — Controle de alterações (quota mensal)

Planos têm limite de alterações: Starter 1/mês, Business 3/mês, Pro (priority).

- **Campos no backend** (por subscription ou customer):
  - `monthly_update_quota` (1, 3 ou ilimitado/priority).
  - `monthly_update_used` (contador do mês).
- **Reset mensal**: job agendado (ex.: Celery beat ou cron) que zera `monthly_update_used` no início de cada ciclo de faturamento.
- Portal e workspace-app devem exibir "X de Y alterações usadas este mês" e bloquear nova solicitação quando esgotado.

### Processo 3 — Fila de geração de site

Quando escalar (ex.: 100 clientes no mesmo dia), não gerar tudo na API de forma síncrona.

- Pipeline com **jobs** (ver seção "Camada de jobs"):
  - **GenerateContentJob**: IA gera conteúdo a partir do briefing.
  - **GenerateSiteJob**: monta o site (template + conteúdo) e gera artefato (draft).
  - **DeploySiteJob**: publica no Cloudflare Pages (ou Vercel) e atualiza status no banco.
- Filas Redis + Celery/RQ; workers dedicados para não travar a API.

---

## Qualidade — cobertura e testes obrigatórios

Além de lint, build e Sonar:

- **Cobertura mínima**:
  - Backend: **80%**.
  - Frontend: **60%**.
- **Testes obrigatórios** (CI falha se faltar):
  - **Backend**: billing (invoices, subscriptions, price plans), checkout/start (plan_slug), webhook Stripe (processamento e idempotência).
  - **Frontend**: checkout flow (redirect para Stripe, success/cancel), dashboard load (portal), briefing submit (envio e feedback).
- Sonar: definir qualidade mínima (ex.: sem blockers; cobertura dentro do mínimo acima).

---

## Domínios e ambiente

| Serviço       | Domínio                   | Variáveis principais |
|---------------|---------------------------|-----------------------|
| API           | api3.innexar.app          | FRONTEND_URL, STRIPE_WEBHOOK_SECRET, CORS |
| Website       | innexar.app               | NEXT_PUBLIC_WORKSPACE_API_URL, NEXT_PUBLIC_PORTAL_URL |
| Portal        | panel.innexar.app         | NEXT_PUBLIC_WORKSPACE_API_URL |
| Workspace app | workspace.innexar.app     | NEXT_PUBLIC_WORKSPACE_API_URL |

---

## Containers, Traefik e deploy (evitar conflitos)

Tudo sobe em **containers**; Traefik faz o roteamento por domínio. Cuidado para **não conflitar** com outros projetos (ex.: Innexar-Brasil, outros stacks no mesmo host).

**Rede e Traefik**
- Traefik (em `/opt/traefik`) usa a rede externa **fixelo_fixelo-network**; serviços expostos pelo Traefik devem estar nessa rede.
- **Routers Traefik** com nomes únicos para o stack USA (ex.: usa-website, usa-api, usa-portal, usa-workspace-app) para não colidir com Brasil.
- Certificado TLS: certresolver=cloudflare (ou letsencrypt) para innexar.app.

**Website no ar — troca pelo novo**
- Para subir o **novo** website (WaaS): (1) **Parar e remover** o container do website atual que serve innexar.app (`docker stop innexar-website && docker rm innexar-website` ou `docker compose down` no projeto que o subiu). (2) Só então subir o stack USA. Não ter dois containers com o mesmo Host(innexar.app) ao mesmo tempo.

**Ordem de subida**
1. Garantir rede `fixelo_fixelo-network` existe.
2. **Workspace**: postgres, minio, backend (labels Traefik para **api3.innexar.app**).
3. **Website, portal, workspace-app**: labels para **innexar.app**, **panel.innexar.app**, **workspace.innexar.app**.
4. DNS: innexar.app, api3.innexar.app, panel.innexar.app, workspace.innexar.app → IP do host do Traefik.

**Volumes para desenvolvimento**
- Backend já usa volumes (app, scripts, tests, alembic) para live-reload.
- Website/portal/workspace-app: para dev com hot-reload, usar volumes que montem o código (ex.: docker-compose.override.yml ou docker-compose.dev.yml com `next dev`).
- Dados: postgres_data e minio_data persistentes; não remover em `down` se quiser preservar.

**Domínios no Traefik (stack USA)**

| Host | Serviço | Router (sugestão) | Container |
|------|---------|-------------------|-----------|
| innexar.app | Website | usa-website | innexar-website |
| api3.innexar.app | API | usa-api | innexar-workspace-backend |
| panel.innexar.app | Portal | usa-portal | innexar-portal |
| workspace.innexar.app | Workspace app | usa-workspace-app | innexar-workspace-app |

Cada docker-compose do USA deve usar esses Host e routers únicos para não conflitar com o stack Brasil no mesmo servidor.

---

## Templates e estrutura na raiz

- **templates/** na raiz do projeto (innexar-usa):
  - **templates/README.md**: objetivo WaaS, uso do innexar-framework, mapeamento nichos.
  - **templates/usa/**: lawyer, dentist, plumber, roofing, cleaning, real-estate, consultant, restaurant.
  - Por template: **template.json** (name, pages, theme), **sections/**, **styles/**, **content/**.
- **innexar-framework**: em innexar-usa/innexar-framework; usar themes e apps para gerar sites; revisão e adaptação na Fase 4.

---

## Melhorias estratégicas (valor do produto)

- **Domínio automático**: ao pagar, criar subdomínio **client.innexar.app**; depois o cliente pode conectar domínio próprio.
- **Demo automática**: Prospector encontra empresa → IA gera demo → email "I created a demo website for your business." — conversão muito maior; já previsto no plano, priorizar.
- **AI SEO generator**: IA gera para a cidade do cliente: title, meta description, keywords, schema (LocalBusiness, etc.). Essencial para SEO local.
- **AI blog automático** (upsell $79/mês): IA gera posts mensais; cliente recebe conteúdo sem esforço.
- **Analytics no portal**: dashboard com visitors, calls, form leads; cliente enxerga o valor do site.

---

## Arquitetura ideal final

```
Website (Next.js)
  ↓
API Gateway
  ↓
FastAPI
  ↓
PostgreSQL
  ↓
Redis Queue
  ↓
Workers (AI + deploy)
  ↓
Cloudflare Pages (sites dos clientes)
```

- **API** não executa geração nem deploy; apenas enfileira jobs no Redis.
- **Workers** (Celery/RQ): GenerateContentJob, GenerateSiteJob, DeploySiteJob; leem da fila e escrevem em PostgreSQL (status, versionamento).
- **Sites estáticos** dos clientes: Cloudflare Pages (ou Vercel); deploy feito pelos workers após aprovação.

---

## Outros itens (já no plano anterior)

- **Demo site**: companyname.innexar.app; integração ProspectorAI.
- **Provisionamento**: webhook → Create subscription → Create project → onboarding email.
- **Infra escala**: Cloudflare Pages, FastAPI, PostgreSQL, Redis+Celery, S3.
- **Upsells (pós-MVP)**: SEO Local $99, Google Ads $299, Blog AI $79, Booking $49.
- **Meta crescimento**: 50 clientes ≈ $6,5k MRR; 200 ≈ $26k; 500 ≈ $65k; com upsells $100k+.

---

## Diagrama do fluxo (resumo)

**Fluxo principal (venda e onboarding):**
```
Website (launch) → plan_slug + email → API checkout/start → Stripe Checkout
→ Webhook Stripe → Create subscription → Create project → Onboarding email
→ Portal (?checkout=success) → Dashboard → Briefing
```

**Fluxo de geração (com job queue; não bloqueia API):**
```
Briefing → Job Queue (Redis) → GenerateContentJob (IA) → draft
→ Revisão manual → Aprovação → GenerateSiteJob → DeploySiteJob
→ sites/draft → version → sites/published → Cloudflare Pages → notificar cliente
```

---

## Checklist de implementação (ordem)

- [ ] **Fase 1** Website: SEO local, seções launch, checkout com plan_slug, i18n, remover checkout one-time.
- [ ] **Fase 2** Backend: GET /products/waas, POST checkout/start (plan_slug), seed USD, webhook, CORS.
- [ ] **Fase 3** Portal: dashboard completo (site, faturas, alterações, briefing, domínio, notificações, suporte, perfil); traduções EN/ES.
- [ ] **Fase 4** Framework: revisão e adaptação innexar-framework; templates/usa alinhados; doc.
- [ ] **Fase 5** IA + jobs: job queue (Redis + Celery/RQ); GenerateContentJob, GenerateSiteJob, DeploySiteJob; draft → review → publish; versionamento (draft/published/history).
- [ ] **Fase 6** Qualidade: testes obrigatórios (billing, checkout, webhook; checkout flow, dashboard, briefing); cobertura backend 80%, frontend 60%; lint, build, Sonar; CI em todos os projetos.
- [ ] **Processos** Controle de alterações: monthly_update_quota / monthly_update_used; reset mensal.
- [ ] **Regras** Criar **GLOBAL_RULES.md** (arquitetura, segurança, código, deploy) para desenvolvimento com IA consistente.
- [ ] **Melhorias** Domínio automático (subdomínio); demo automática; AI SEO generator; analytics no portal; AI blog (upsell).

---

## Próximos passos opcionais (após MVP estável)

- **GLOBAL_RULES.md**: criar o arquivo completo na raiz com todas as regras (arquitetura, segurança, código, deploy) para a IA desenvolver 100% do sistema sem quebrar padrões.
- **Arquitetura para 10.000 sites**: documentar e desenhar escala (multi-tenant, CDN, filas dedicadas, workers horizontais).
- **Site em 60 segundos**: pipeline empresa → IA → site pronto em ~60s (demo ou primeiro draft); modelo usado por várias empresas WaaS nos EUA.

---

Este arquivo é a referência do plano na raiz do projeto. Atualizar conforme avanço.

**Execução**: ver **[PLANO_EXECUCAO.md](PLANO_EXECUCAO.md)** para tarefas ordenadas, dependências e cronograma sugerido (semanas 1–5+).
