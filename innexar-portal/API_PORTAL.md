# API Portal – Referência para a equipe de frontend

**Documentação das APIs do portal do cliente.** Pode ser usada **agora**; não depende do fim da padronização do backend.

- **Documentação interativa (sempre atualizada):** com o backend rodando, acesse **GET /docs** (Swagger UI) ou **GET /redoc** (ReDoc). Lá estão todos os endpoints, schemas de request/response e a possibilidade de testar.
- **Contrato e comportamentos especiais:** [API.md](API.md) (health, feature flags, integrações, etc.).

**Base URL do portal:** `https://<host>/api/portal`  
**Autenticação:** Bearer JWT obtido em `POST /api/public/auth/customer/login`. Todas as rotas abaixo (exceto as de login/recuperação) exigem o header `Authorization: Bearer <token>`.

---

## Autenticação (público – sem token)

| Método | URL | Descrição |
|--------|-----|------------|
| POST | `/api/public/auth/customer/login` | Body: `{ "email", "password" }`. Retorna JWT para usar em `/api/portal/*`. |
| POST | `/api/public/auth/customer/forgot-password` | Body: `{ "email" }`. Envia e-mail com link de redefinição. Resposta sempre 200. |
| POST | `/api/public/auth/customer/reset-password` | Body: `{ "token", "new_password" }`. Redefine senha com o token do e-mail. |

---

## Me (perfil e configurações) – requer Bearer (cliente)

| Método | URL | Descrição |
|--------|-----|------------|
| GET | `/api/portal/me` | Perfil do cliente logado (id, email, customer_id, email_verified). |
| PATCH | `/api/portal/me/password` | Altera senha. Body: `{ "current_password", "new_password" }`. |
| POST | `/api/portal/me/set-password` | Define senha (ex.: primeiro acesso). Body: `{ "token", "new_password" }`. |
| GET | `/api/portal/me/profile` | Dados do perfil (customer). |
| PATCH | `/api/portal/me/profile` | Atualiza perfil. Body: conforme schema `ProfileUpdate`. |

---

## Me – Features e dashboard – requer Bearer (cliente)

Dependem de feature flags. Se a flag estiver desligada, a rota pode retornar 404.

| Método | URL | Descrição |
|--------|-----|------------|
| GET | `/api/portal/me/features` | Flags disponíveis para o cliente (ex.: billing, tickets, projects). Usar para exibir/ocultar itens do menu. |
| GET | `/api/portal/me/project-aguardando-briefing` | Lista de projetos com status "aguardando_briefing" (para destacar briefing pendente). |
| GET | `/api/portal/me/dashboard` | Dashboard: plan, site, invoice, support (tickets abertos), messages (não lidas), etc. Ver [API.md](API.md#portal-do-cliente-dashboard). |

---

## Projetos – requer Bearer (cliente) + flag `portal.projects.enabled`

| Método | URL | Descrição |
|--------|-----|------------|
| GET | `/api/portal/projects` | Lista projetos do cliente (id, name, status, created_at, has_files, files_count). |
| GET | `/api/portal/projects/{project_id}` | Detalhe de um projeto (somente se for do cliente). |
| POST | `/api/portal/projects/{project_id}/files` | Upload de arquivo no projeto. Body: multipart com `file`. Limite 50 MB (api/portal) ou 25 MB (router files). |
| GET | `/api/portal/projects/{project_id}/files` | Lista arquivos do projeto. |
| GET | `/api/portal/projects/{project_id}/files/{file_id}/download` | Download de um arquivo. |
| DELETE | `/api/portal/projects/{project_id}/files/{file_id}` | Remove arquivo (somente se for do cliente). |

---

## Projeto – Mensagens e solicitações de modificação – requer Bearer (cliente)

| Método | URL | Descrição |
|--------|-----|------------|
| GET | `/api/portal/projects/{project_id}/messages` | Lista mensagens do projeto. |
| POST | `/api/portal/projects/{project_id}/messages` | Envia mensagem. Body: `{ "body" }`. |
| POST | `/api/portal/projects/{project_id}/messages/upload` | Envia mensagem com anexo (multipart). |
| GET | `/api/portal/projects/{project_id}/modification-requests` | Lista solicitações de modificação do projeto. |
| POST | `/api/portal/projects/{project_id}/modification-requests` | Cria solicitação de modificação. Body: conforme schema (ex.: description, attachments). |

---

## Solicitações de novo projeto / briefing – requer Bearer (cliente)

| Método | URL | Descrição |
|--------|-----|------------|
| POST | `/api/portal/new-project` | Cria solicitação de novo projeto. Body: `{ "project_name", "project_type", "description?", "budget?", "timeline?" }`. Retorna `{ "id", "message" }`. |
| POST | `/api/portal/site-briefing` | Envia briefing do site. Body: campos do briefing (project_id, project_name, project_type, description, meta, etc.). |
| POST | `/api/portal/site-briefing/upload` | Upload de arquivo para o briefing (multipart). |

---

## Faturas (billing) – requer Bearer (cliente) + billing habilitado

Quando billing não está habilitado (feature flag), as rotas retornam 404.

| Método | URL | Descrição |
|--------|-----|------------|
| GET | `/api/portal/invoices` | Lista faturas do cliente. |
| GET | `/api/portal/invoices/{invoice_id}` | Detalhe de uma fatura. |
| POST | `/api/portal/invoices/{invoice_id}/pay` | Gera link de pagamento. Body (opcional): `{ "success_url", "cancel_url", "payment_method_id" }`. Retorna `payment_url` (e em fluxo Bricks, dados para o front). |
| GET | `/api/portal/invoices/{invoice_id}/download` | HTML para impressão da fatura (Salvar como PDF no navegador). |

---

## Tickets (suporte) – requer Bearer (cliente) + flag `portal.tickets.enabled`

| Método | URL | Descrição |
|--------|-----|------------|
| GET | `/api/portal/tickets` | Lista tickets do cliente. |
| POST | `/api/portal/tickets` | Abre ticket. Body: `{ "subject", "category?", "project_id?" }`. |
| GET | `/api/portal/tickets/{ticket_id}` | Detalhe do ticket. |
| GET | `/api/portal/tickets/{ticket_id}/messages` | Lista mensagens do ticket. |
| POST | `/api/portal/tickets/{ticket_id}/messages` | Envia mensagem no ticket. Body: `{ "body" }`. |

---

## Notificações – requer Bearer (cliente)

| Método | URL | Descrição |
|--------|-----|------------|
| GET | `/api/portal/notifications` | Lista notificações do cliente (mais recentes primeiro, limite 100). |
| PATCH | `/api/portal/notifications/{notification_id}/read` | Marca notificação como lida. Resposta 204. |

---

## Respostas comuns

- **401 Unauthorized:** token ausente, inválido ou expirado. Redirecionar para login.
- **404 Not Found:** recurso não existe ou não pertence ao cliente; ou feature desabilitada (ex.: billing, tickets, projects).
- **422 Unprocessable Entity:** body ou query inválidos (validación Pydantic). Ver detalhe no corpo da resposta.

Schemas exatos de request/response estão em **/docs** ou **/redoc** (OpenAPI).
