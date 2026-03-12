# 🔧 Troubleshooting Completo - Google Workspace

## 🎯 Diagnóstico Passo a Passo

### Passo 1: Executar Teste Detalhado

Execute o script de teste que tenta múltiplas configurações:

```bash
cd site-innexar
node test-google-workspace.js
```

Este script vai:
- ✅ Verificar variáveis de ambiente
- ✅ Validar formato da senha
- ✅ Testar 3 configurações diferentes (TLS 587, SSL 465, TLS com timeout)
- ✅ Mostrar qual configuração funcionou

---

## 🔍 Problemas Comuns e Soluções

### ❌ Erro: "Invalid login: Username and Password not accepted"

#### Causa 1: Senha com Espaços
**Sintoma:** Senha copiada com espaços do Google

**Solução:**
```env
# ❌ ERRADO
SMTP_PASSWORD=ttba tsxd qrhf mvdb

# ✅ CORRETO
SMTP_PASSWORD=ttbatsxdqrhfmvdb
```

#### Causa 2: Verificação em 2 Etapas Não Ativada
**Sintoma:** Não consegue gerar App Password

**Solução:**
1. Acesse: https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"
3. Aguarde alguns minutos
4. Gere nova App Password: https://myaccount.google.com/apppasswords

#### Causa 3: Email Não é Google Workspace
**Sintoma:** Email é Gmail pessoal ou outro provedor

**Solução:**
- Verifique se `comercial@innexar.app` é realmente Google Workspace
- Se for Gmail pessoal, pode precisar de configuração diferente
- Acesse: https://admin.google.com para verificar

#### Causa 4: App Password Gerada Incorretamente
**Sintoma:** Senha não funciona mesmo estando correta

**Solução:**
1. Delete todas as senhas de app antigas
2. Acesse: https://myaccount.google.com/apppasswords
3. Gere uma NOVA senha:
   - App: `Email`
   - Device: `Outro (nome personalizado)` → `Innexar Site`
4. Copie a senha IMEDIATAMENTE (só aparece uma vez)
5. Use no `.env.local` SEM espaços

---

### ❌ Erro: "Connection timeout" ou "ECONNECTION"

#### Causa: Firewall ou Porta Bloqueada

**Solução:**
1. Teste porta 465 (SSL) em vez de 587 (TLS):
   ```env
   SMTP_PORT=465
   SMTP_SECURE=true
   ```

2. Ou teste porta 587 com timeout aumentado (já configurado no código)

---

### ❌ Erro: "Acesso negado pelo administrador"

#### Causa: Políticas do Google Workspace

**Solução:**
1. Acesse: https://admin.google.com
2. Vá em **Segurança** → **Configurações de API**
3. Verifique se **"App Passwords"** estão habilitados
4. Se não estiver, habilite para todos os usuários ou para seu usuário específico

---

## ✅ Checklist Completo

Antes de testar, verifique TUDO:

- [ ] **Verificação em 2 Etapas está ATIVADA**
  - Link: https://myaccount.google.com/security

- [ ] **App Password foi gerada corretamente**
  - Link: https://myaccount.google.com/apppasswords
  - App: `Email`
  - Device: `Outro` → `Innexar Site`
  - Senha tem 16 caracteres

- [ ] **Senha no `.env.local` está SEM espaços**
  ```env
  SMTP_PASSWORD=ttbatsxdqrhfmvdb  # ✅ Sem espaços
  ```

- [ ] **Email é do Google Workspace**
  - Verifique: https://admin.google.com
  - Ou tente fazer login no Gmail com `comercial@innexar.app`

- [ ] **Variáveis estão corretas no `.env.local`**
  ```env
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=comercial@innexar.app
  SMTP_PASSWORD=senha_sem_espacos
  SMTP_FROM_EMAIL=comercial@innexar.app
  ```

- [ ] **Servidor foi reiniciado após mudanças**
  ```bash
  # Pare o servidor (Ctrl+C)
  # Inicie novamente
  npm run dev
  ```

---

## 🧪 Teste Rápido

### 1. Verificar Variáveis

```bash
cd site-innexar
node -e "require('dotenv').config({ path: '.env.local' }); console.log('User:', process.env.SMTP_USER); console.log('Password length:', process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.replace(/\s/g, '').length : 0);"
```

Deve mostrar:
- User: `comercial@innexar.app`
- Password length: `16`

### 2. Teste Detalhado

```bash
node test-google-workspace.js
```

Este script vai testar automaticamente e mostrar qual configuração funciona.

### 3. Teste Via API

```bash
# Terminal 1
npm run dev

# Terminal 2
node test-email-api.js
```

---

## 🔄 Se Nada Funcionar

### Opção 1: Verificar no Admin Console

1. Acesse: https://admin.google.com
2. Vá em **Segurança** → **Configurações de API**
3. Verifique:
   - ✅ "App Passwords" habilitado
   - ✅ "Acesso a apps menos seguros" (se necessário)
   - ✅ Nenhuma política bloqueando

### Opção 2: Tentar Porta 465 (SSL)

Atualize `.env.local`:
```env
SMTP_PORT=465
SMTP_SECURE=true
```

### Opção 3: Contatar Suporte Google Workspace

Se você é administrador e nada funciona, pode ser uma política específica do seu domínio.

---

## 📝 Logs Detalhados

O código agora mostra logs mais detalhados. Verifique o console do servidor quando testar:

```bash
npm run dev
```

E envie um formulário de teste. Os logs vão mostrar exatamente onde está falhando.

---

## ✅ Próximo Passo

**Execute agora:**
```bash
cd site-innexar
node test-google-workspace.js
```

E me mostre o resultado! 🚀

