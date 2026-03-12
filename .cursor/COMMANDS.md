# Comandos — Subagentes e Skills

Referência rápida para invocar subagentes e skills no Cursor.

---

## Como chamar subagentes

Use no chat, por exemplo:

```
Use the [nome-do-subagent] subagent to [tarefa].
```

Ou em português:

```
Use o subagente [nome] para [tarefa].
```

O Cursor escolhe o subagente pelo **name** do frontmatter (ex: `system-designer`).

---

## Subagentes (`.cursor/agents/`)

| Comando (exemplo) | Quando usar |
|-------------------|-------------|
| `Use the software-architect subagent to design the new X module.` | Arquitetar antes de codar; definir módulos, estrutura, modelos, API. |
| `Use the system-designer subagent to design microservices for Y.` | Desenhar sistemas escaláveis; microservices, APIs, comunicação entre serviços. |
| `Use the backend-engineer subagent to add the checkout API.` | Implementar endpoints, serviços, integração com DB. |
| `Use the api-engineer subagent to design versioning for the API.` | REST, GraphQL, rate limit, auth, versionamento de API. |
| `Use the frontend-engineer subagent to build the settings page.` | UI, componentes, integração com API, estado. |
| `Use the ui-designer subagent to improve the design system.` | Design system, UX, componentes reutilizáveis, responsividade. |
| `Use the dashboard-engineer subagent to add the analytics dashboard.` | Tabelas, filtros, gráficos, métricas, analytics (SaaS). |
| `Use the database-engineer subagent to add the orders table.` | Schema, relacionamentos, migrations, índices. |
| `Use the query-optimizer subagent to fix slow list endpoint.` | Otimizar queries, índices, evitar N+1, joins. |
| `Use the security-reviewer subagent to review the upload flow.` | Revisar auth, APIs, arquivos, integrações. |
| `Use the auth-specialist subagent to implement JWT refresh.` | Login, JWT, OAuth, RBAC, auth multi-tenant. |
| `Use the devops-engineer subagent to add the Docker health check.` | Docker, CI/CD, deploy, monitoramento. |
| `Use the cloud-architect subagent to plan AWS deployment.` | AWS, GCP, infra escalável, storage, CDN. |
| `Use the ai-engineer subagent to integrate the LLM for summaries.` | LLM, agentes, embeddings, RAG, automações. |
| `Use the integration-engineer subagent to add Stripe webhooks.` | Stripe, Google APIs, webhooks, OAuth. |
| `Use the saas-architect subagent to design the plan limits.` | Multi-tenant, billing, planos, permissões. |
| `Use the saas-product-engineer subagent to implement tenant billing.` | Isolamento tenant, Stripe, ciclo de assinatura, admin. |
| `Use the growth-engineer subagent to add conversion tracking.` | Analytics, tracking, conversão, ferramentas de marketing. |
| `Use the prompt-engineer subagent to optimize the summary prompt.` | Otimizar prompts, pipelines de IA, custo de tokens. |
| `Use the refactor-specialist subagent to clean up the orders module.` | Remover duplicação, modularizar, legibilidade. |

---

## Como usar skills

- **Anexar no chat:** use `@` e selecione o arquivo da skill (ex: `@.cursor/skills/analyze-codebase/SKILL.md`).
- **Mencionar no prompt:** descreva a tarefa de forma que encaixe na *description* da skill (ex: “analise o projeto antes de implementar”).

O Cursor aplica a skill quando o contexto combina com a descrição.

---

## Skills do projeto (`.cursor/skills/`)

| Skill | Quando usar |
|-------|-------------|
| **analyze-codebase** | Antes de gerar código; analisar arquitetura, pastas, padrões. |
| **create-api-endpoint** | Criar nova rota REST; schemas, controller, service, repository. |
| **create-database-model** | Nova entidade/tabela; naming, índices, relacionamentos, migrations. |
| **create-module** | Novo módulo completo: model, API, service, UI, CRUD. |
| **create-ui-component** | Novo componente React/Next; design system, Tailwind. |
| **generate-tests** | Testes para lógica nova ou existente; edge cases e erros. |
| **generate-docs** | Documentação de funções, APIs, parâmetros, exemplos. |
| **optimize-performance** | Lentidão; loops, cache, otimização de queries. |
| **refactor-code** | Refatorar sem mudar comportamento; duplicação, nomes, estrutura. |
| **security-review** | Revisar PR ou release; SQL injection, XSS, secrets, auth. |

**Exemplo de prompt:** “Use a skill analyze-codebase e depois crie o endpoint de cancelamento com create-api-endpoint.”

---

## Skills globais (Cursor / usuário)

Disponíveis em outros projetos (ex: `~/.cursor/skills-cursor/` ou referência do Cursor):

| Skill | Quando usar |
|-------|-------------|
| **create-rule** | Criar regra em `.cursor/rules/`; padrões, convenções. |
| **create-skill** | Criar nova skill; estrutura SKILL.md, boas práticas. |
| **create-subagent** | Criar novo subagente em `.cursor/agents/`. |
| **update-cursor-settings** | Alterar settings.json (tema, font, format on save, etc.). |
| **migrate-to-skills** | Migrar regras .mdc ou comandos para skills. |

---

## Resumo rápido

- **Subagente:** `Use the [nome] subagent to [tarefa].`
- **Skill:** anexar `@.cursor/skills/[nome]/SKILL.md` ou descrever a tarefa alinhada à skill.
- Subagentes ficam em `.cursor/agents/*.md`; skills do projeto em `.cursor/skills/*/SKILL.md`.
