# Setup – Workspace API + Front (innexar.com.br)

## Chaves em produção (mesmo servidor)

Checklist para deploy com site e API no mesmo host (Traefik, innexar.com.br + api.innexar.com.br).

| Onde | Variável | Obrigatório | Notas |
|------|----------|-------------|-------|
| **Website** (build) | `NEXT_PUBLIC_USE_WORKSPACE_API=true` | Sim | Rebuild se alterar. |
| **Website** (build) | `NEXT_PUBLIC_WORKSPACE_API_URL=https://api.innexar.com.br` | Sim | Sem barra final. Rebuild se alterar. |
| **Website** (runtime) | `RESEND_API_KEY` ou SMTP_* | Sim (email) | Pelo menos um método de envio. |
| **Website** (runtime) | `CONTACT_RECIPIENT_EMAIL`, `RESEND_FROM_EMAIL` / `SMTP_*` | Recomendado | Ver .env.example do website. |
| **Workspace** | `POSTGRES_PASSWORD` | Sim | Senha forte; não usar default. |
| **Workspace** | `SECRET_KEY_STAFF` | Sim | Diferente do default em produção. |
| **Workspace** | `SECRET_KEY_CUSTOMER` | Sim | Diferente do default em produção. |
| **Workspace** | `CORS_ORIGINS` | Sim | Incluir `https://innexar.com.br`, `https://www.innexar.com.br`. |
| **Workspace** | `FRONTEND_URL` | Recomendado | Ex.: `https://innexar.com.br`. |
| **Workspace** | `SEED_TOKEN` | Opcional | Para rodar seed com usuários existentes e reset-admin-password. |

---

## Login 401 (Workspace staff)

Se o login em `https://innexar.com.br/pt/workspace/login` retornar **401** ou "Email ou senha incorretos":

| Causa | O que verificar |
|-------|------------------|
| **Seed não rodado** | Não existe usuário `admin@innexar.com`. Rode o seed (ver regras abaixo). |
| **Credenciais erradas** | Use exatamente `admin@innexar.com` / `change-me` (após o seed). Typo ou teclado (locale) podem causar 401. |
| **CORS** | No `.env` do backend, `CORS_ORIGINS` deve incluir a origem do site (ex.: `https://innexar.com.br`). Reinicie o backend após alterar. |
| **URL da API no frontend** | No build do website, `NEXT_PUBLIC_WORKSPACE_API_URL` deve ser a URL base da API (ex.: `https://api.innexar.com.br`), sem barra final. Rebuild do site se alterar. |

**Checklist de deploy:** Seed executado; CORS com origem do site; variáveis de build do frontend corretas; teste de login com `admin@innexar.com` / `change-me` após deploy.

**Recuperação de senha do admin (emergência):** Se `SEED_TOKEN` estiver definido no `.env` do workspace, é possível redefinir a senha do usuário `admin@innexar.com` sem acesso ao banco:

```bash
curl -X POST "https://api.innexar.com.br/api/workspace/system/reset-admin-password?token=SEU_SEED_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"new_password": "change-me"}'
```

Use apenas em emergência e com token forte. O body pode omitir `new_password` para resetar para `change-me`.

---

## Erro: `ERR_NAME_NOT_RESOLVED`

Significa que o navegador não consegue resolver o host da API (ex.: `api.innexar.com.br`). Ou o DNS não existe, ou não aponta para o servidor onde o backend está. O front chama `NEXT_PUBLIC_WORKSPACE_API_URL`; se for `https://api.innexar.com.br`, esse host precisa existir e responder.

---

## Erro 522 na integração Hestia

**O que é:** HTTP 522 = "Connection timed out" (tipicamente retornado por proxy/Cloudflare quando o servidor de origem não responde a tempo). O backend chama a URL do Hestia (ex.: `http://hosting.innexar.com.br:8080/api/`) ao testar a integração; se essa chamada falhar com 522, o teste exibe o erro.

**O que verificar:**

| Causa | Ação |
|-------|------|
| **Porta errada** | HestiaCP costuma usar **8083** para a API, não 8080. Na integração (Config → Integrações → Editar Hestia), use `base_url` como `http://hosting.innexar.com.br:8083` ou `https://hosting.innexar.com.br:8083`. |
| **Rede** | O servidor onde o **workspace backend** roda precisa alcançar o host do Hestia na porta usada (firewall, DNS). Teste do próprio servidor: `curl -v http://hosting.innexar.com.br:8083/api/`. |
| **Cloudflare** | Se o host estiver atrás do Cloudflare, 522 indica que a origem não respondeu a tempo. Verifique se o serviço Hestia está no ar e se o timeout no Cloudflare está adequado. |
| **HTTPS vs HTTP** | Se o Hestia exigir HTTPS, use `https://` no `base_url` do JSON de credenciais. |

A URL do Hestia deve ser acessível **a partir do backend** (não do navegador). Porta típica: **8083**.

**Erro 401 (Unauthorized):** o Hestia pode devolver `hestia-exit-code: 10` (E_FORBIDEN) ou `9` (E_PASSWORD). **Código 10** = chave sem permissão para o comando (ex.: v-list-users): crie a chave como **admin** com permissão total, no servidor (SSH): `v-add-access-key 'admin' '*' 'workspace' json` e use o ID + Chave Secreta na integração. **Código 9** = Access/Secret key incorretos. (1) **Whitelist de IP**: Hestia → Server → API — adicione o IP do backend ou `:allow-all`. (2) Teste manual: `python3 scripts/test_hestia_manual.py` (no container usa credenciais do banco; ou defina `HESTIA_BASE_URL`, `HESTIA_ACCESS_KEY`, `HESTIA_SECRET_KEY`).

---

## Hestia atrás do proxy Cloudflare

Se o domínio do Hestia (ex.: `hosting.innexar.com.br`) usa **proxy do Cloudflare** (nuvem laranja), o tráfego em **portas customizadas** (8080, 8083) **não é proxado**: o Cloudflare só faz proxy nas portas 80 (HTTP) e 443 (HTTPS). Por isso o backend pode receber **522** ao chamar `http://hosting.innexar.com.br:8080` ou `:8083`.

**Opções:**

| Opção | O que fazer | base_url na integração |
|-------|--------------|------------------------|
| **A) DNS only (recomendado para API)** | No Cloudflare, no registro do host do Hestia (ex.: `hosting.innexar.com.br`), desative o proxy (**nuvem cinza**). O backend passará a alcançar o servidor direto na porta desejada. | `https://hosting.innexar.com.br:8083` (ou `http://...:8083` conforme o Hestia). |
| **B) Subdomínio só para API** | Crie um subdomínio (ex.: `hestia-api.innexar.com.br`) com **DNS only** (nuvem cinza) apontando para o IP do servidor Hestia. Use esse host na integração. | `https://hestia-api.innexar.com.br:8083` |
| **C) Hestia na porta 443 na origem** | No servidor, exponha o painel Hestia na porta 443 (ex.: Nginx na frente). Aí o Cloudflare consegue fazer proxy em `https://hosting.innexar.com.br` (sem porta). | `https://hosting.innexar.com.br` (sem `:8083`) |

Recomendação: usar **A** ou **B** para a integração Workspace → Hestia, para o backend falar direto com a porta da API (8083) sem passar pelo proxy e evitar 522.

---

## Opção 1: Subdomínio `api.innexar.com.br` (recomendado)

### 1. DNS

- Crie um registro **A** (ou CNAME) para `api.innexar.com.br` apontando para o IP do servidor onde o backend sobe (mesmo do site ou outro).
- Aguarde a propagação (minutos a algumas horas).

### 2. Backend no mesmo servidor do site (Traefik)

Se o site (innexar-websitebr) já sobe com Traefik na rede `fixelo_fixelo-network`:

- No `innexar-workspace/docker-compose.yml` o backend está com labels Traefik. Se não tiver a rede `fixelo_fixelo-network`, remova essa rede e os `labels` do backend (API fica só na porta 8001).
- Crie o `.env` na raiz de `innexar-workspace` (veja “Variáveis” abaixo).
- Suba o stack e rode o seed:

```bash
cd /opt/innexar-workspace
cp backend/.env.example .env
# Edite .env: CORS_ORIGINS, POSTGRES_PASSWORD, SEED_TOKEN (opcional)
docker compose up -d --build
# Aguarde o backend ficar healthy, depois rode o seed (ver regras abaixo):
curl -X POST "https://api.innexar.com.br/api/workspace/system/seed"
# Sem DNS: curl -X POST "http://localhost:8001/api/workspace/system/seed"
```

**Regras do seed:**

- Se **não** houver usuários no banco: `POST /api/workspace/system/seed` (sem token).
- Se já houver usuários: defina `SEED_TOKEN` no `.env` do workspace e chame `POST /api/workspace/system/seed?token=SEU_SEED_TOKEN`.
- O seed cria o usuário **admin@innexar.com** com senha **change-me**. Confirme que o usuário existe (ex.: via Swagger ou banco) antes de tentar login.

### 3. Variáveis do backend (`.env` em `innexar-workspace`)

- `CORS_ORIGINS`: origens permitidas no CORS. Para o site em produção:
  - `https://innexar.com.br,https://www.innexar.com.br`
- `POSTGRES_PASSWORD`: senha forte para o Postgres.
- `SEED_TOKEN`: (opcional) token para proteger o endpoint de seed; se definir, use `?token=SEED_TOKEN` no `curl` do seed.
- `SECRET_KEY_STAFF` e `SECRET_KEY_CUSTOMER`: trocar por valores seguros em produção.

### 4. Front (websitebr)

- `.env` (ou build args) com:
  - `NEXT_PUBLIC_USE_WORKSPACE_API=true`
  - `NEXT_PUBLIC_WORKSPACE_API_URL=https://api.innexar.com.br`
- Rebuild da imagem do site para as `NEXT_PUBLIC_*` entrarem no bundle.

### 5. Login do Workspace

- URL: `https://innexar.com.br/pt/workspace/login`
- Usuário criado pelo seed: **admin@innexar.com**
- Senha: **change-me** (trocar depois).

---

## Integração Hestia no banco

Para o provisionamento automático (criar usuário, domínio, e-mail no HestiaCP), o sistema precisa de uma configuração **Hestia** salva no banco (tabela `integration_configs`), com valor criptografado.

**O que você precisa do HestiaCP:**

| Campo        | Onde obter |
|-------------|------------|
| **base_url** | URL do painel HestiaCP (ex.: `https://panel.seudominio.com:8083`), sem barra no final. |
| **access_key** | No HestiaCP: **User** (menu) → **API** → chave de acesso. |
| **secret_key** | No HestiaCP: **User** → **API** → chave secreta. |

**Inserir pelo script (recomendado):**

Na máquina onde o backend roda (ou com acesso ao mesmo banco e variáveis de ambiente do backend):

```bash
cd /opt/innexar-workspace/backend
export HESTIA_BASE_URL="https://seu-panel.seudominio.com:8083"
export HESTIA_ACCESS_KEY="sua_access_key"
export HESTIA_SECRET_KEY="sua_secret_key"
python -m scripts.seed_hestia_integration
```

- Se já existir configuração Hestia para o mesmo `org_id`/scope, o script **atualiza** o valor.
- Opcional: `HESTIA_MODE=test` ou `live`, `INTEGRATION_ORG_ID=innexar`.

**Inserir pela UI do Workspace:**

1. Faça login no Workspace (admin).
2. **Configurações** → **Integrações** → **Nova integração**.
3. Provider: **hestia**, Key: **api_credentials**.
4. No campo Value, cole um JSON (será criptografado ao salvar):
   `{"base_url":"https://panel.seudominio.com:8083","access_key":"...","secret_key":"..."}`

**Nota:** O loader do Hestia busca config com `scope` **tenant** ou **global**. O script usa `scope=tenant`; na UI, se o front enviar `scope=workspace`, o backend pode não encontrar (nesse caso use o script ou ajuste o scope no banco para `tenant`).

---

## Opção 2: Mesmo domínio (proxy em innexar.com.br)

Se não quiser usar `api.innexar.com.br`, dá para servir a API em `https://innexar.com.br` (ex.: path `/api` indo para o backend).

1. Configurar o proxy (Traefik/Nginx) para encaminhar algo como `https://innexar.com.br/api/*` para o container do backend (porta 8000).
2. No front, usar:
   - `NEXT_PUBLIC_WORKSPACE_API_URL=https://innexar.com.br`
   (sem path; o front já chama `/api/workspace/...`, `/api/portal/...`, etc.)
3. No backend, `CORS_ORIGINS` deve incluir `https://innexar.com.br`.
4. Rodar o seed em `https://innexar.com.br/api/workspace/system/seed` (ou no host:porta do backend, se acessível).

---

## Resumo do fluxo de setup

1. **DNS** (Opção 1): `api.innexar.com.br` → IP do servidor.
2. **Backend**: `cd innexar-workspace`, configurar `.env` (CORS, Postgres, secrets), `docker compose up -d --build`.
3. **Seed**: `POST https://api.innexar.com.br/api/workspace/system/seed` (ou com `?token=...` se `SEED_TOKEN` definido).
4. **Front**: `NEXT_PUBLIC_USE_WORKSPACE_API=true`, `NEXT_PUBLIC_WORKSPACE_API_URL=https://api.innexar.com.br`, rebuild e deploy.
5. **Login**: `https://innexar.com.br/pt/workspace/login` com `admin@innexar.com` / `change-me`.

Se algo falhar, verifique: DNS (`dig api.innexar.com.br`), health da API (`curl https://api.innexar.com.br/health`), CORS e logs do backend.
