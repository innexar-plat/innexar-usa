# Regras globais — WaaS Innexar USA

Arquivo de referência para desenvolvimento e para uso por IA: arquitetura, segurança, código e deploy devem seguir estas regras para manter consistência.

---

## Regras de arquitetura

1. **Backend** é FastAPI (innexar-workspace).
2. **Frontend** principal é Next.js (innexar-website, innexar-portal, innexar-workspace-app).
3. **Banco de dados** é PostgreSQL.
4. **Billing** sempre via Stripe API para USD; Mercado Pago apenas para BRL quando aplicável.
5. **Nunca** usar `product_id` nem `price_plan_id` no frontend para checkout WaaS; usar **`plan_slug`** sempre (starter, business, pro).
6. **API pública de planos**: frontend consome apenas `GET /api/public/products/waas` (retorna slug, name, price, features); IDs são resolvidos no backend.

---

## Regras de segurança

1. **Nunca** expor Stripe secret key (usar variável de ambiente no backend).
2. **Nunca** expor credenciais de banco (DATABASE_URL apenas no servidor).
3. **Nunca** escrever SQL com concatenação de strings; usar **parameter binding** (SQLAlchemy, text com :param).
4. Tokens e secrets apenas em variáveis de ambiente ou armazenamento seguro; nunca em código versionado.

---

## Regras de código

1. **Todo código** deve passar em **lint** (ESLint para TS/JS, Ruff para Python).
2. **Todo endpoint** público ou crítico deve ter **teste** (pytest no backend; Jest/Playwright no frontend quando aplicável).
3. **Toda feature** deve ter **type safety**: TypeScript com `strict: true`; Python com type hints; sem `any` em TypeScript (exceto justificado e documentado).
4. **Não usar `any`** em TypeScript; preferir `unknown` e type guards.
5. FastAPI: retornar sempre modelos Pydantic (nunca `dict` bruto quando existir schema).
6. Tratamento de erro padronizado: HTTPException com payload consistente; logging estruturado (sem print).

---

## Regras de deploy

1. **Build obrigatório** antes de push/deploy: Next.js build e FastAPI devem compilar/rodar sem erro.
2. **Lint obrigatório**: CI falha se lint falhar.
3. **Testes obrigatórios**: CI falha se testes falharem; cobertura mínima backend 80%, frontend 60% (conforme plano).
4. Nenhum merge sem CI verde (lint → test → build; Sonar quando configurado).

---

## Referência rápida

- Plano geral: [PLANO_WAAS_USA.md](PLANO_WAAS_USA.md)
- Execução: [PLANO_EXECUCAO.md](PLANO_EXECUCAO.md)
