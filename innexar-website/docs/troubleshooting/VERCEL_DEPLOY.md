# 🚀 Deploy no Vercel - Guia Completo

## 📋 Pré-requisitos

1. ✅ Conta no Vercel (https://vercel.com)
2. ✅ Projeto conectado ao Git (GitHub, GitLab ou Bitbucket)
3. ✅ Variáveis de ambiente configuradas

---

## 🔧 Passo 1: Configurar Variáveis de Ambiente no Vercel

### 1.1. Acessar Configurações do Projeto

1. Acesse: **https://vercel.com/dashboard**
2. Selecione seu projeto **site-innexar**
3. Vá em **Settings** → **Environment Variables**

### 1.2. Adicionar Variáveis

Adicione todas as variáveis do seu `.env.local`:

#### **SMTP Configuration**

```
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
SMTP_USER = comercial@innexar.app
SMTP_PASSWORD = kqrmwaafyztkzpmw
SMTP_FROM_EMAIL = comercial@innexar.app
```

#### **Email Configuration**

```
CONTACT_RECIPIENT_EMAIL = comercial@innexar.app
ENABLE_AUTO_REPLY = true
```

#### **Site Configuration**

```
NEXT_PUBLIC_SITE_URL = https://innexar.app
NEXT_PUBLIC_GA_MEASUREMENT_ID = G-23YD60MCM4
```

**⚠️ IMPORTANTE:**

- Configure para **Production**, **Preview** e **Development**
- Clique em **Save** após adicionar cada variável

---

## 📤 Passo 2: Fazer Commit e Push

### 2.1. Verificar Mudanças

```bash
cd site-innexar
git status
```

### 2.2. Adicionar Arquivos (SEM o .env.local)

```bash
# Adicionar todas as mudanças (exceto .env.local que já está no .gitignore)
git add .

# Verificar o que será commitado
git status
```

### 2.3. Fazer Commit

```bash
git commit -m "feat: adiciona backend SMTP com templates profissionais multi-idioma"
```

### 2.4. Push para o Repositório

```bash
git push origin main
# ou
git push origin master
```

---

## 🚀 Passo 3: Deploy Automático no Vercel

### 3.1. Deploy Automático

Se o projeto já está conectado ao Vercel:

- ✅ O Vercel detecta o push automaticamente
- ✅ Inicia o build automaticamente
- ✅ Faz deploy da nova versão

### 3.2. Verificar Deploy

1. Acesse: **https://vercel.com/dashboard**
2. Vá em **Deployments**
3. Veja o status do deploy mais recente
4. Aguarde o build completar (geralmente 2-5 minutos)

---

## 🔄 Passo 4: Deploy Manual (Opcional)

Se quiser fazer deploy manual:

### 4.1. Via CLI do Vercel

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Fazer login
vercel login

# Deploy
cd site-innexar
vercel --prod
```

### 4.2. Via Dashboard

1. Acesse: **https://vercel.com/dashboard**
2. Selecione o projeto
3. Clique em **Deployments**
4. Clique em **Redeploy** no último deploy

---

## ✅ Passo 5: Verificar se Está Funcionando

### 5.1. Testar o Site

1. Acesse seu domínio no Vercel (ex: `https://innexar-app.vercel.app`)
2. Navegue pelas páginas
3. Verifique se tudo está carregando corretamente

### 5.2. Testar Formulário de Contato

1. Acesse a página de contato
2. Preencha o formulário
3. Envie a mensagem
4. Verifique:
   - ✅ Você recebeu o email em `comercial@innexar.app`
   - ✅ O cliente recebeu a resposta automática

---

## 🐛 Troubleshooting

### ❌ Erro: "Environment variable not found"

**Solução:**

- Verifique se todas as variáveis estão configuradas no Vercel
- Certifique-se de que estão marcadas para **Production**

### ❌ Erro: "SMTP authentication failed"

**Solução:**

- Verifique se `SMTP_PASSWORD` está correto (sem espaços)
- Confirme que a App Password foi gerada corretamente
- Verifique se `SMTP_USER` está correto

### ❌ Erro: "Build failed"

**Solução:**

- Verifique os logs do build no Vercel
- Confirme que todas as dependências estão no `package.json`
- Verifique se não há erros de TypeScript

### ❌ Email não está sendo enviado

**Solução:**

- Verifique os logs do Vercel (Function Logs)
- Confirme que as variáveis de ambiente estão configuradas
- Teste localmente primeiro para garantir que funciona

---

## 📊 Monitoramento

### Ver Logs no Vercel

1. Acesse: **https://vercel.com/dashboard**
2. Selecione o projeto
3. Vá em **Functions** → **Logs**
4. Veja os logs das API routes

### Verificar Deployments

1. Vá em **Deployments**
2. Veja o histórico de deploys
3. Clique em um deploy para ver detalhes

---

## 🔐 Segurança

### ✅ Boas Práticas

- ✅ **NUNCA** commite o `.env.local` no Git
- ✅ Use variáveis de ambiente no Vercel
- ✅ Configure diferentes valores para Production/Preview/Development se necessário
- ✅ Revise as variáveis antes de fazer deploy

### ⚠️ Importante

- O arquivo `.env.local` está no `.gitignore` e **não será** commitado
- Todas as variáveis devem ser configuradas manualmente no Vercel
- A senha de app (`SMTP_PASSWORD`) é sensível - mantenha segura

---

## 📝 Checklist de Deploy

Antes de fazer deploy, confirme:

- [ ] Todas as variáveis de ambiente estão no Vercel
- [ ] `.env.local` está no `.gitignore` (não será commitado)
- [ ] Código foi testado localmente
- [ ] Formulário de contato funciona localmente
- [ ] Commit e push foram feitos
- [ ] Deploy foi iniciado no Vercel
- [ ] Build completou com sucesso
- [ ] Site está funcionando em produção
- [ ] Formulário de contato está enviando emails

---

## 🎉 Pronto!

Seu site está no ar com o novo sistema de emails! 🚀

Para futuros deploys, basta fazer `git push` e o Vercel fará o deploy automaticamente.
