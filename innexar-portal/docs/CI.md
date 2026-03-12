# CI e qualidade de código

## Pipeline (GitHub Actions)

O workflow em `.github/workflows/ci.yml` roda em todo push/PR para `main` e `develop`:

| Step           | Comando            | Descrição                          |
|----------------|--------------------|------------------------------------|
| Lint           | `npm run lint`     | Regras ESLint (Next.js)            |
| Format check   | `npm run format:check` | Prettier em `src/**`           |
| Typecheck      | `npm run typecheck`   | `tsc --noEmit` (best-effort, ver abaixo) |
| Test           | `npm test`         | Jest (unit + tipos + componentes)  |
| Build          | `npm run build`    | Next.js produção                   |

## Type-check

- **Script:** `npm run typecheck` → `tsc --noEmit`
- **Nota:** Com Next 16, um bug em `node_modules/next/dist/compiled/@next/font/...` (`.d.ts` truncado) pode fazer `tsc --noEmit` falhar com `TS1005: '}' expected`. O build do Next usa `typescript.ignoreBuildErrors: true` apenas por causa desse arquivo de tipos; o código do projeto segue strict TypeScript.
- **CI:** O step de typecheck roda em “best-effort” (`continue-on-error: true`) até correção no upstream. Quando o bug for corrigido, remova o `continue-on-error` no workflow.

## Lint local

- **Comando:** `npm run lint` (`next lint`)
- Em alguns ambientes (ex.: Next 16 local), o `next lint` pode falhar com erro de diretório inválido. Se isso ocorrer, o CI pode ainda passar; considere rodar o pipeline ou usar o ESLint integrado do editor.

## Pré-PR recomendado

```bash
npm run format:check
npm test
npm run build
# opcional: npm run typecheck (pode falhar por bug do Next 16)
```

## Variáveis de ambiente no CI (Build)

O job de build define variáveis mínimas para o Next:

- `NEXT_PUBLIC_USE_WORKSPACE_API=true`
- `NEXT_PUBLIC_WORKSPACE_API_URL=https://api.example.com`
- `NEXT_PUBLIC_SITE_URL=https://example.com`

Para testes que dependem de outras envs, configure em `env` no workflow ou em secrets.

## Testes

- **Comando:** `npm test` (Jest)
- Cobertura atual: tipos (dashboard, profile, billing, support, projects-list), lib (api-paths, workspace-api, project-status, project-constants), componentes (BillingStats, PaymentBrickResultView).
- Novos módulos devem incluir testes conforme as regras do projeto.

## Container (Docker)

- **Build:** `docker build --target runner -t innexar-portal .` (com os `--build-arg` necessários para `NEXT_PUBLIC_*`).
- O Dockerfile usa `npm ci || npm install` no stage builder: se o lock estiver dessincronizado (ex.: dependência transitória nova), o build ainda conclui. Mantenha o `package-lock.json` em sync com `npm install` e commit quando alterar dependências.
- **Validação:** após `docker run`, verificar logs e resposta HTTP (ex.: `curl -sL http://localhost:PORT/` deve retornar 200).
