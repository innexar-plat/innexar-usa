# 📧 Alternativas ao Google Workspace SMTP

Se o Google Workspace não está funcionando, aqui estão alternativas **mais fáceis** de configurar:

---

## 🚀 Opção 1: Resend (Recomendado - Mais Fácil)

### Por que Resend?
- ✅ **Gratuito** até 3.000 emails/mês
- ✅ **Configuração em 5 minutos**
- ✅ **API simples**
- ✅ **Templates HTML**
- ✅ **Melhor para produção**

### Como Configurar:

1. **Criar conta:**
   - Acesse: https://resend.com
   - Crie conta gratuita
   - Verifique seu email

2. **Obter API Key:**
   - No dashboard, vá em **"API Keys"**
   - Clique em **"Create API Key"**
   - Nome: `Innexar Site`
   - Copie a chave (começa com `re_`)

3. **Atualizar `.env.local`:**
   ```env
   # Resend Configuration
   RESEND_API_KEY=re_sua_chave_aqui
   RESEND_FROM_EMAIL=comercial@innexar.app
   CONTACT_RECIPIENT_EMAIL=comercial@innexar.app
   ENABLE_AUTO_REPLY=true
   ```

4. **Instalar pacote:**
   ```bash
   cd site-innexar
   npm install resend
   ```

5. **Atualizar código:**
   - Substituir Nodemailer por Resend
   - Código mais simples e confiável

---

## 🚀 Opção 2: SendGrid

### Por que SendGrid?
- ✅ **Gratuito** até 100 emails/dia
- ✅ **Muito popular**
- ✅ **Boa documentação**

### Como Configurar:

1. **Criar conta:**
   - Acesse: https://sendgrid.com
   - Crie conta gratuita
   - Verifique seu email

2. **Obter API Key:**
   - No dashboard, vá em **"Settings"** → **"API Keys"**
   - Clique em **"Create API Key"**
   - Permissões: **"Full Access"** ou **"Mail Send"**
   - Copie a chave

3. **Atualizar `.env.local`:**
   ```env
   # SendGrid Configuration
   SENDGRID_API_KEY=SG.sua_chave_aqui
   SENDGRID_FROM_EMAIL=comercial@innexar.app
   CONTACT_RECIPIENT_EMAIL=comercial@innexar.app
   ENABLE_AUTO_REPLY=true
   ```

4. **Instalar pacote:**
   ```bash
   cd site-innexar
   npm install @sendgrid/mail
   ```

---

## 🚀 Opção 3: Mailgun

### Por que Mailgun?
- ✅ **Gratuito** até 5.000 emails/mês
- ✅ **Muito confiável**
- ✅ **Boa para produção**

### Como Configurar:

1. **Criar conta:**
   - Acesse: https://www.mailgun.com
   - Crie conta gratuita
   - Verifique seu email

2. **Obter API Key:**
   - No dashboard, vá em **"Sending"** → **"API Keys"**
   - Copie a **"Private API Key"**

3. **Verificar domínio:**
   - Adicione `innexar.app` como domínio
   - Siga as instruções de DNS

4. **Atualizar `.env.local`:**
   ```env
   # Mailgun Configuration
   MAILGUN_API_KEY=sua_chave_aqui
   MAILGUN_DOMAIN=innexar.app
   MAILGUN_FROM_EMAIL=comercial@innexar.app
   CONTACT_RECIPIENT_EMAIL=comercial@innexar.app
   ENABLE_AUTO_REPLY=true
   ```

5. **Instalar pacote:**
   ```bash
   cd site-innexar
   npm install mailgun.js
   ```

---

## 🎯 Recomendação

**Use Resend** porque:
- ✅ Mais fácil de configurar
- ✅ Não precisa verificar domínio (inicialmente)
- ✅ API moderna e simples
- ✅ Melhor para começar rápido

---

## 🔄 Migração Rápida

Posso atualizar o código para usar Resend em **5 minutos**. Quer que eu faça?

Basta você:
1. Criar conta no Resend
2. Copiar a API Key
3. Eu atualizo todo o código

---

## 📊 Comparação

| Serviço | Gratuito | Facilidade | Recomendado |
|---------|----------|------------|-------------|
| **Resend** | 3.000/mês | ⭐⭐⭐⭐⭐ | ✅ Sim |
| **SendGrid** | 100/dia | ⭐⭐⭐⭐ | ✅ Sim |
| **Mailgun** | 5.000/mês | ⭐⭐⭐ | ⚠️ Médio |
| **Google SMTP** | Ilimitado | ⭐⭐ | ❌ Difícil |

---

## 🆘 Se Preferir Continuar com Google

Verifique:
1. **Admin Console:** https://admin.google.com
   - Vá em **Segurança** → **Configurações de API**
   - Verifique se App Passwords estão habilitados

2. **Verificação 2FA:**
   - Acesse: https://myaccount.google.com/security
   - Confirme que está **realmente ativada**

3. **Email é Workspace?**
   - Verifique se `comercial@innexar.app` é Google Workspace
   - Se for Gmail pessoal, pode não funcionar

---

## 💡 Minha Sugestão

**Mude para Resend agora** - é mais rápido e confiável do que continuar tentando com Google Workspace.

Quer que eu configure o Resend para você?

