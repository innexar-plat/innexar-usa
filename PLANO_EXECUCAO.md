# Plano de execução — WaaS EUA

Ordem concreta de tarefas para executar o [PLANO_WAAS_USA.md](PLANO_WAAS_USA.md). Cada item é uma tarefa acionável; dependências estão indicadas.

---

## Infra e containers (Traefik, domínios, sem conflito)

Executar antes de subir as aplicações. Ver seção **Containers, Traefik e deploy** no [PLANO_WAAS_USA.md](PLANO_WAAS_USA.md).

| # | Tarefa | Onde | Depende de |
|---|--------|------|------------|
| D1 | **Rede Traefik**: garantir que a rede `fixelo_fixelo-network` existe (`docker network create fixelo_fixelo-network` se não existir). Traefik em `/opt/traefik` usa essa rede. | Host / opt/traefik | — |
| D2 | **Parar website atual**: se innexar.app já estiver no ar, parar e remover o container do website atual (`docker stop innexar-website; docker rm innexar-website` ou `docker compose down` no projeto que o subiu) para liberar o host para o novo stack. | Onde o website atual estiver rodando | — |
| D3 | **innexar-workspace (API)**: no docker-compose, (1) usar labels Traefik para **api3.innexar.app** (router ex.: usa-api); (2) adicionar rede `fixelo_fixelo-network`; (3) manter volumes de dev (./backend/app, scripts, tests, alembic). Variáveis CORS_ORIGINS e FRONTEND_URL/PORTAL_URL com innexar.app e panel.innexar.app. | innexar-workspace/docker-compose.yml, .env.example | D1 |
| D4 | **innexar-website**: no docker-compose, (1) garantir Host(`innexar.app`) e Host(`www.innexar.app`) com router único (ex.: usa-website); (2) rede fixelo_fixelo-network; (3) para dev: opcional docker-compose.override.yml com volume montando código e `next dev`. | innexar-website/docker-compose.yml | D1 |
| D5 | **innexar-portal**: no docker-compose, (1) labels Traefik para **panel.innexar.app** (router ex.: usa-portal); (2) rede fixelo_fixelo-network; (3) build args e env NEXT_PUBLIC_WORKSPACE_API_URL=https://api3.innexar.app. (4) Para dev: override com volume e next dev. | innexar-portal/docker-compose.yml | D1 |
| D6 | **innexar-workspace-app**: no docker-compose, (1) labels Traefik para **workspace.innexar.app** (router ex.: usa-workspace-app); (2) rede fixelo_fixelo-network; (3) NEXT_PUBLIC_WORKSPACE_API_URL=https://api3.innexar.app. (4) Para dev: override com volume e next dev. | innexar-workspace-app/docker-compose.yml | D1 |
| D7 | **Ordem de subida**: (1) innexar-workspace: `docker compose up -d` (postgres, minio, backend); (2) innexar-website: `docker compose up -d --build`; (3) innexar-portal: `docker compose up -d --build`; (4) innexar-workspace-app: `docker compose up -d --build`. Verificar logs e health. | Cada pasta do projeto | D2, D3–D6 |
| D8 | **DNS**: apontar innexar.app, api3.innexar.app, panel.innexar.app, workspace.innexar.app para o IP do host onde o Traefik está rodando (se ainda não estiverem). | DNS (Cloudflare ou provedor) | — |

**Conflitos a evitar**: não subir dois containers com o mesmo Host (ex.: innexar.app) ao mesmo tempo; usar nomes de router Traefik diferentes do stack Brasil (usa-*) se ambos puderem rodar no mesmo servidor.

---

## Pré-requisitos (fazer primeiro)

| # | Tarefa | Repo/Pasta | Depende de |
|---|--------|------------|------------|
| P1 | Criar **GLOBAL_RULES.md** na raiz com: arquitetura (FastAPI, Next.js, PostgreSQL, Stripe, plan_slug), segurança (sem secrets, SQL com binding), código (lint, testes, type safety, sem any), deploy (build/lint/testes obrigatórios) | innexar-usa/ | — |
| P2 | Garantir que API (innexar-workspace) tenha CORS configurável; adicionar origins innexar.app e panel.innexar.app no .env.example e na aplicação | innexar-workspace | — |

---

## Fase 1 — Website (innexar-website)

Executar na ordem abaixo. Backend da Fase 2 pode ser feito em paralelo após P2 (para checkout o website chama a API; até lá usar mock ou fallback estático).

| # | Tarefa | Arquivos / Ação | Depende de |
|---|--------|------------------|------------|
| 1.1 | **SEO local**: meta tags, títulos e descrições por locale (en, es, pt); structured data (Organization, WebSite); sitemap já existente verificado | layout, metadata, lib/seo, sitemap | — |
| 1.2 | **Página launch = WaaS**: garantir que /[locale]/launch seja a página de planos; adicionar seção Hero com título "Professional Website for Your Business — Without Paying Thousands Upfront", subtítulo "From $129/month", CTAs "Start My Website" e "View Examples" | app/[locale]/launch, LaunchPageClient ou equivalente | — |
| 1.3 | **Seção Benefícios**: blocos "No large upfront cost", "Hosting and maintenance included", "Mobile optimized", "Built to generate leads" | componente na página launch | 1.2 |
| 1.4 | **Seção Planos**: cards Starter ($129), Business ($199), Pro ($299) com lista de features por plano; dados virão de GET /api/public/products/waas (com fallback estático até API existir) | componente planos, chamada API ou fallback | 1.2 |
| 1.5 | **Seção Garantia**: "30 Day Satisfaction Guarantee" | componente | 1.2 |
| 1.6 | **Seção FAQ**: perguntas frequentes sobre planos, pagamento, suporte | componente | 1.2 |
| 1.7 | **CTA final**: "Get Your Professional Website Today", "Start from $129/month", botão "Start My Website" | componente | 1.2 |
| 1.8 | **Checkout (frontend)**: ao clicar "Start My Website" por plano, abrir modal ou página para coletar email (e nome/telefone); chamar POST /api/public/checkout/start com plan_slug (starter|business|pro), customer_email, customer_name, customer_phone, success_url, cancel_url; usar API route Next.js (server-side) que chama api3.innexar.app para evitar CORS | API route (ex.: app/api/waas/checkout/route.ts), componente modal/form | 1.4, Fase 2 (ou mock) |
| 1.9 | **Redirect após checkout**: success_url = https://panel.innexar.app/{locale}?checkout=success; cancel_url = https://innexar.app/{locale}/launch | config na chamada checkout | 1.8 |
| 1.10 | **i18n**: adicionar chaves para hero, planos, benefícios, garantia, FAQ e CTAs em messages/en.json, messages/es.json, messages/pt.json (namespace ex.: waas ou launch) | messages/*.json | 1.2–1.7 |
| 1.11 | **Remover ou descontinuar** /api/launch/checkout (Stripe one-time $399); redirecionar fluxo de planos para a API workspace (checkout com plan_slug) | app/api/launch/checkout, documentar descontinuação | 1.8 |

**Entrega Fase 1**: Página launch completa (SEO, seções, planos, checkout via API com plan_slug), i18n, sem checkout one-time no website.

---

## Fase 2 — Backend (innexar-workspace)

Pode iniciar em paralelo à Fase 1; o website dependerá do GET /products/waas e do POST checkout/start para o fluxo real.

| # | Tarefa | Arquivos / Ação | Depende de |
|---|--------|------------------|------------|
| 2.1 | **Seed produtos USD**: script seed_products_usa_waas.py (ou equivalente) que insere 3 produtos (Starter $129, Business $199, Pro $299) com currency USD, interval month, slug identificável (nome ou campo/metadata); provisioning_type site_delivery | scripts/, ou migration/seed | — |
| 2.2 | **GET /api/public/products/waas**: endpoint que retorna array com slug, name, price, currency, features para cada plano (starter, business, pro); resolver IDs internamente a partir do slug no banco | app/modules/products/router_public.py (ou novo) | 2.1 |
| 2.3 | **POST /api/public/checkout/start com plan_slug**: aceitar plan_slug (starter|business|pro) no body; resolver product_id e price_plan_id no backend; manter compatibilidade com product_id/price_plan_id se necessário para outros clientes; criar Customer, Subscription, Invoice e chamar create_payment_attempt (USD → Stripe); retornar payment_url | app/modules/checkout/schemas.py, router_public.py, service se necessário | 2.1 |
| 2.4 | **success_url / cancel_url**: garantir que checkout use success_url e cancel_url enviados pelo cliente (website/portal); documentar uso panel.innexar.app e innexar.app/launch | checkout flow | 2.3 |
| 2.5 | **Webhook Stripe**: garantir que após checkout.session.completed se execute: Create subscription (ativo), Create project, Send onboarding email; CORS já configurado para innexar.app e panel.innexar.app | app/modules/billing/router_public.py, post_payment, notifications | P2 |
| 2.6 | **CORS**: configurar origins innexar.app e panel.innexar.app; variáveis de ambiente documentadas em .env.example | main.py ou middleware | P2 |

**Entrega Fase 2**: API com GET /products/waas, POST checkout/start (plan_slug), seed USD, webhook completo, CORS.

---

## Fase 3 — Portal (innexar-portal)

Depende de o cliente já poder chegar ao portal após checkout (Fase 2 webhook). Dashboard pode ser evoluído incrementalmente.

| # | Tarefa | Arquivos / Ação | Depende de |
|---|--------|------------------|------------|
| 3.1 | **Redirect pós-checkout**: garantir que ?checkout=success mostre CTA claro "Preencha os dados do seu site" (briefing); traduzir para EN/ES no dashboard | dashboard, messages | — |
| 3.2 | **Briefing**: revisar página site-briefing; garantir que todos os labels usem useTranslations; completar messages en.json e es.json para site-briefing e dashboard | app/[locale]/site-briefing, messages | — |
| 3.3 | **Dashboard — Site ativo**: bloco que mostra status do site (em construção, publicado), URL quando existir, link para visualizar | dashboard component | — |
| 3.4 | **Dashboard — Faturas**: listagem de faturas, status (pago/pendente), botão pagar (Stripe/MP conforme moeda); integrar com API existente de billing | billing page, API | — |
| 3.5 | **Dashboard — Solicitar alteração**: fluxo para o cliente pedir alterações (form ou link); exibir "X de Y alterações usadas este mês" quando backend tiver quota (Fase 5/Processos) | novo componente ou página | 3.3 |
| 3.6 | **Dashboard — Domínio**: exibir domínio configurado; instruções ou link para configurar domínio próprio | dashboard | — |
| 3.7 | **Dashboard — Notificações**: central de avisos (já pode existir); garantir que pagamento e projeto apareçam | notifications | — |
| 3.8 | **Dashboard — Suporte**: acesso a tickets/mensagens (se já existir módulo) | support | — |
| 3.9 | **Dashboard — Perfil/Conta**: alterar senha, dados de contato | profile | — |
| 3.10 | **Env**: documentar NEXT_PUBLIC_WORKSPACE_API_URL=https://api3.innexar.app para deploy em panel.innexar.app | .env.example, docs | — |

**Entrega Fase 3**: Dashboard completo (site, faturas, alterações, briefing, domínio, notificações, suporte, perfil), briefing e redirect traduzidos (EN/ES).

---

## Fase 4 — Framework e templates

Depende de ter definição clara de “como” os sites serão gerados (framework vs templates estáticos). Pode começar pela documentação e estrutura de pastas.

| # | Tarefa | Arquivos / Ação | Depende de |
|---|--------|------------------|------------|
| 4.1 | **Documentar innexar-framework**: README ou doc em innexar-framework com dependências (Node, pnpm/npm, Astro), scripts de build, estrutura themes/apps/modules | innexar-framework/README ou docs/ | — |
| 4.2 | **Mapear temas → nichos USA**: theme-advocacia → lawyer, theme-medico → dentist, theme-contador → consultant; listar nichos faltantes (plumber, roofing, cleaning, real-estate, restaurant) | doc em templates/ ou PLANO | 4.1 |
| 4.3 | **Criar pasta templates/ na raiz**: templates/README.md (objetivo WaaS, uso do framework), templates/usa/ com subpastas lawyer, dentist, plumber, roofing, cleaning, real-estate, consultant, restaurant | templates/README.md, templates/usa/*/ | — |
| 4.4 | **Estrutura por template**: em cada nicho, criar template.json (name, pages, theme), pastas sections/, styles/, content/; preencher um template piloto (ex.: lawyer) a partir do theme-advocacia | templates/usa/lawyer/ etc. | 4.2, 4.3 |
| 4.5 | **Compatibilidade**: decidir se geração usará Astro (framework) ou export estático/Next; documentar decisão e passo a passo para "briefing → template → build" | docs | 4.1, 4.4 |

**Entrega Fase 4**: Framework documentado, templates/usa com estrutura (template.json, sections, styles, content) e pelo menos um nicho piloto alinhado ao framework.

---

## Fase 5 — IA, job queue e versionamento

Requer Redis (e opcionalmente Celery/RQ) no ambiente. Backend deve expor “enfileirar geração” sem executar a geração na request.

| # | Tarefa | Arquivos / Ação | Depende de |
|---|--------|------------------|------------|
| 5.1 | **Redis**: adicionar Redis ao docker-compose ou à infra; documentar variável de conexão | innexar-workspace ou infra | — |
| 5.2 | **Celery ou RQ**: configurar worker que consome fila (ex.: Redis); worker pode viver no mesmo repo da API ou em repo separado | backend ou workers repo | 5.1 |
| 5.3 | **Modelo de versionamento**: tabela ou estrutura sites/draft, sites/published, sites/history; campo version ou equivalente no projeto/site do cliente | migrations, models | — |
| 5.4 | **GenerateContentJob**: job que recebe briefing (ou project_id); chama IA (API interna ou integração) para gerar textos por seção (+ layout se aplicável); persiste resultado como draft (ex.: project_site_version com status draft) | worker, IA client, DB | 5.2, 5.3 |
| 5.5 | **Tela de revisão manual**: no portal ou workspace-app, tela para staff/cliente ver e editar draft (textos/layout); botão "Aprovar" que marca draft como aprovado e enfileira GenerateSiteJob | portal ou workspace-app | 5.4 |
| 5.6 | **GenerateSiteJob**: job que lê draft aprovado, aplica template (innexar-framework ou templates/usa), gera artefato estático; salva em sites/draft ou equivalente; atualiza status do projeto | worker, template engine | 5.2, 4.4 |
| 5.7 | **DeploySiteJob**: job que publica artefato (Cloudflare Pages ou Vercel); move para sites/published; incrementa version; notifica cliente | worker, deploy client | 5.2, 5.3 |
| 5.8 | **API “iniciar geração”**: endpoint (ex.: POST /api/portal/me/projects/{id}/generate ou workspace) que apenas enfileira GenerateContentJob e retorna 202; não executa geração na request | router portal ou workspace | 5.2, 5.4 |
| 5.9 | **Controle de alterações**: adicionar monthly_update_quota e monthly_update_used (por subscription ou customer); job agendado (Celery beat ou cron) que reseta monthly_update_used no início do ciclo; regras Starter 1, Business 3, Pro (priority) | models, migration, worker, portal/workspace | 2.1 |

**Entrega Fase 5**: Fila (Redis + Celery/RQ), três jobs (GenerateContent, GenerateSite, Deploy), versionamento draft/published/history, revisão manual, quota mensal de alterações.

---

## Fase 6 — Qualidade e CI

Pode ser introduzida desde o início (lint, build) e reforçada com testes e Sonar à medida que as fases 1–3 forem fechadas.

| # | Tarefa | Repo / Ação | Depende de |
|---|--------|-------------|------------|
| 6.1 | **Lint**: ESLint (TS/JS) e Ruff (Python) configurados; CI falha se lint falhar | innexar-website, innexar-portal, innexar-workspace-app, innexar-workspace | — |
| 6.2 | **Build**: Next.js build (website, portal, workspace-app); build/run da API; CI falha se build falhar | idem | — |
| 6.3 | **Testes backend**: pytest para billing (invoices, subscriptions, price plans), checkout/start com plan_slug, webhook Stripe (processamento e idempotência); cobertura mínima 80% | innexar-workspace | 2.2, 2.3, 2.5 |
| 6.4 | **Testes frontend**: pelo menos checkout flow (redirect Stripe, success/cancel), dashboard load (portal), briefing submit; cobertura mínima 60% | innexar-website, innexar-portal | 1.8, 3.1–3.4 |
| 6.5 | **Sonar**: integração no pipeline (GitHub Actions, GitLab CI, etc.); definir qualidade mínima (sem blockers; cobertura dentro do mínimo); gate opcional antes de merge | todos | 6.1–6.4 |
| 6.6 | **CI completo**: em todo push/PR: lint → test → build → (Sonar); branch protection com CI verde para merge | .github/workflows ou .gitlab-ci.yml | 6.1–6.5 |

**Entrega Fase 6**: Lint, build, testes obrigatórios (backend e frontend), cobertura 80%/60%, Sonar, CI definido em todos os repositórios.

---

## Ordem sugerida de execução (timeline)

- **Semana 1 (base)**  
  P1 (GLOBAL_RULES), P2 (CORS), 2.1 (seed), 2.2 (GET waas), 2.3 (checkout plan_slug), 2.5–2.6 (webhook, CORS), 6.1–6.2 (lint, build).

- **Semana 2 (website + portal mínimo)**  
  1.1–1.7 (SEO e seções launch), 1.10 (i18n), 1.8–1.9 (checkout com API), 1.11 (remover checkout one-time), 3.1–3.2 (redirect e briefing traduzido).

- **Semana 3 (portal completo)**  
  3.3–3.10 (dashboard: site, faturas, alterações, domínio, notificações, suporte, perfil, env).

- **Semana 4 (framework + qualidade)**  
  4.1–4.5 (framework doc, templates/usa, piloto), 6.3–6.4 (testes backend e frontend), 6.5–6.6 (Sonar, CI).

- **Semana 5+ (IA e jobs)**  
  5.1–5.9 (Redis, workers, jobs, versionamento, quota, API enfileirar).

---

## Dependências entre fases

```
P1, P2
  → Fase 2 (backend) ─────────────────────────────────────────┐
  → Fase 1 (website: 1.1–1.7, 1.10; depois 1.8–1.11 com API)   │
  → Fase 3 (portal) ──────────────────────────────────────────┼→ Fase 4 (templates)
  → Fase 6 (lint/build desde cedo; testes após 2 e 3)          │
                                                              ↓
  → Fase 5 (jobs, IA, versionamento, quota) após 4 e 2 estável
```

---

## Checklist de execução (marcar ao concluir)

- [ ] D1 Rede fixelo_fixelo-network
- [ ] D2 Parar website atual (liberar innexar.app)
- [ ] D3–D6 docker-compose USA (api3, panel, workspace, website; routers usa-*; volumes dev)
- [ ] D7 Subir stacks na ordem (workspace → website → portal → workspace-app)
- [ ] D8 DNS (innexar.app, api3, panel, workspace)
- [ ] P1 GLOBAL_RULES.md
- [ ] P2 CORS
- [ ] 2.1 Seed USD
- [ ] 2.2 GET /products/waas
- [ ] 2.3 POST checkout/start plan_slug
- [ ] 2.4–2.6 Webhook, URLs, CORS
- [ ] 1.1–1.11 Fase 1 Website
- [ ] 3.1–3.10 Fase 3 Portal
- [ ] 4.1–4.5 Fase 4 Framework/templates
- [ ] 6.1–6.6 Fase 6 Qualidade/CI
- [ ] 5.1–5.9 Fase 5 Jobs/IA/versionamento/quota

Atualizar este documento conforme as tarefas forem concluídas.
