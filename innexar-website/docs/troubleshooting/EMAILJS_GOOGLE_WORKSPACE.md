# 📧 Configuração EmailJS com Google Workspace - Passo a Passo

## 🎯 Objetivo

Configurar o formulário do site para enviar emails diretamente para seu email do Google Workspace, **sem usar backend**, e configurar resposta automática.

---

## 📝 PASSO 1: Criar Conta no EmailJS

1. Acesse: **https://www.emailjs.com/**
2. Clique em **"Sign Up"** (canto superior direito)
3. Crie sua conta (pode usar qualquer email)
4. Confirme o email

---

## ⚙️ PASSO 2: Conectar Google Workspace

### 2.1. Adicionar Serviço

1. No dashboard do EmailJS, clique em **"Email Services"**
2. Clique em **"+ Add New Service"**
3. Escolha **"Gmail"**
4. Clique em **"Connect Account"**

### 2.2. Conectar sua Conta Google Workspace

1. **IMPORTANTE:** Selecione a conta do **Google Workspace** (não a pessoal)
2. Autorize as permissões
3. Dê um nome (ex: "Innexar Workspace")
4. Clique em **"Create Service"**

**✅ Anote o Service ID** (ex: `service_abc123`)

---

## 📧 PASSO 3: Criar Template de Email

### 3.1. Template Principal (para você receber)

1. Vá em **"Email Templates"**
2. Clique em **"+ Create New Template"**
3. Configure:

**Nome:** `Contato do Site`

**Assunto:**
```
Novo contato do site - {{from_name}}
```

**To Email:** `comercial@innexar.app` (seu email do Google Workspace)

**From Name:** `Site Innexar`

**Reply To:** `{{from_email}}` (permite responder ao cliente)

**Corpo:**
```
Olá,

Você recebeu uma nova mensagem através do formulário de contato do site Innexar:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 INFORMAÇÕES DO CONTATO

Nome: {{from_name}}
Email: {{from_email}}
Telefone: {{phone}}
Empresa: {{company}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💼 DETALHES DO PROJETO

Tipo de Projeto: {{project_type}}
Orçamento: {{budget}}
Prazo: {{timeline}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 MENSAGEM

{{message}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este email foi enviado automaticamente através do formulário de contato do site.
```

4. Clique em **"Save"**

**✅ Anote o Template ID** (ex: `template_xyz789`)

---

## 🔄 PASSO 4: Configurar Resposta Automática (Opcional)

### 4.1. Criar Template de Resposta Automática

1. Vá em **"Email Templates"**
2. Clique em **"+ Create New Template"**
3. Configure:

**Nome:** `Resposta Automática`

**Assunto:**
```
Recebemos sua mensagem - Innexar
```

**To Email:** `{{from_email}}` (email do cliente)

**From Name:** `Innexar`

**Corpo:**
```
Olá {{from_name}},

Obrigado por entrar em contato com a Innexar!

Recebemos sua mensagem e nossa equipe entrará em contato em breve.

Atenciosamente,
Equipe Innexar
```

4. Clique em **"Save"**

**✅ Anote o Template ID da Resposta** (ex: `template_auto123`)

**✅ JÁ ESTÁ CONFIGURADO NO CÓDIGO!** O formulário já envia a resposta automática automaticamente.

---

## 🔑 PASSO 5: Obter Public Key

1. No EmailJS, vá em **"Account"** → **"General"**
2. Role até **"API Keys"**
3. Copie sua **Public Key**

**✅ Anote a Public Key** (ex: `user_abc123xyz`)

---

## 💻 PASSO 6: Configurar no Projeto

1. Crie o arquivo `.env.local` na raiz de `site-innexar`
2. Adicione:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xyz789
NEXT_PUBLIC_EMAILJS_AUTO_REPLY_TEMPLATE_ID=template_auto123
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=user_abc123xyz
```

**Nota:** A resposta automática é opcional. Se não quiser usar, deixe `NEXT_PUBLIC_EMAILJS_AUTO_REPLY_TEMPLATE_ID` vazio.

3. Reinicie o servidor: `npm run dev`

---

## ✅ Pronto!

Agora o formulário:
- ✅ Envia emails para seu Google Workspace
- ✅ Permite responder diretamente ao cliente (Reply To)
- ✅ Não precisa de backend
- ✅ Funciona direto do frontend

---

## 📊 Resumo das Variáveis

| Variável | Onde Encontrar | Exemplo | Obrigatório |
|----------|----------------|---------|-------------|
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Email Services → Service ID | `service_gmail123` | ✅ Sim |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Email Templates → Template ID | `template_contact456` | ✅ Sim |
| `NEXT_PUBLIC_EMAILJS_AUTO_REPLY_TEMPLATE_ID` | Email Templates → Template ID (resposta) | `template_auto123` | ❌ Opcional |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Account → General → API Keys | `user_abc123xyz789` | ✅ Sim |

---

## 🆘 Problemas?

- **Email não chega?** Verifique spam e confirme o "To Email" no template
- **Erro de permissão?** Reconecte o Google Workspace no EmailJS
- **Não funciona?** Verifique se as variáveis estão no `.env.local` e reinicie o servidor

---

**Pronto!** Agora é só configurar e testar! 🎉

