# 📧 Configuração do EmailJS - Guia Passo a Passo

## 🎯 Visão Geral

O formulário de contato usa **EmailJS** para enviar emails diretamente do frontend, **sem necessidade de backend**. É gratuito até 200 emails/mês.

---

## 📝 PASSO 1: Criar Conta no EmailJS

1. Acesse: **https://www.emailjs.com/**
2. Clique em **"Sign Up"** (canto superior direito)
3. Crie sua conta com:
   - Email
   - Senha
   - Confirme o email (verifique sua caixa de entrada)

---

## ⚙️ PASSO 2: Configurar Email Service

### 2.1. Adicionar Serviço de Email

1. Após fazer login, você verá o **Dashboard**
2. No menu lateral, clique em **"Email Services"**
3. Clique no botão **"+ Add New Service"**

### 2.2. Escolher Provedor

Você verá opções como:
- **Gmail** (recomendado - mais fácil)
- **Outlook**
- **Yahoo**
- **Custom SMTP**

**Para Gmail (mais fácil):**
1. Clique em **"Gmail"**
2. Clique em **"Connect Account"**
3. Faça login com sua conta Gmail
4. Autorize o EmailJS a enviar emails
5. Dê um nome ao serviço (ex: "Innexar Contact Form")
6. Clique em **"Create Service"**

**Você verá algo como:**
```
Service ID: service_abc123xyz
```

**⚠️ ANOTE ESSE SERVICE ID!** Você vai precisar dele depois.

---

## 📧 PASSO 3: Criar Email Template

### 3.1. Criar Novo Template

1. No menu lateral, clique em **"Email Templates"**
2. Clique em **"+ Create New Template"**

### 3.2. Configurar Template

**Nome do Template:**
```
Contato do Site Innexar
```

**Assunto do Email (Subject):**
```
Novo contato do site - {{from_name}}
```

**Corpo do Email (Content):**
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

### 3.3. Configurar Destinatário

1. No campo **"To Email"**, coloque o email que vai receber os contatos:
   ```
   comercial@innexar.app
   ```
   (ou o email que você preferir)

2. No campo **"From Name"**, coloque:
   ```
   Site Innexar
   ```

3. Clique em **"Save"**

**Você verá algo como:**
```
Template ID: template_xyz789abc
```

**⚠️ ANOTE ESSE TEMPLATE ID!** Você vai precisar dele depois.

---

## 🔑 PASSO 4: Obter Public Key

1. No menu lateral, clique em **"Account"** → **"General"**
2. Role a página até encontrar **"API Keys"**
3. Você verá sua **Public Key** (algo como: `abcdefghijklmnop`)

**⚠️ ANOTE ESSA PUBLIC KEY!** Você vai precisar dela depois.

---

## 💻 PASSO 5: Configurar no Projeto

### 5.1. Criar Arquivo .env.local

1. Na raiz do projeto `site-innexar`, crie um arquivo chamado `.env.local`
2. Adicione as seguintes linhas (substitua pelos valores que você anotou):

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_abc123xyz
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xyz789abc
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=abcdefghijklmnop
```

**Exemplo real:**
```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_gmail123
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_contact456
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=user_abc123xyz789
```

### 5.2. Reiniciar o Servidor

1. Pare o servidor (Ctrl+C no terminal)
2. Inicie novamente:
   ```bash
   npm run dev
   ```

---

## ✅ PASSO 6: Testar

1. Acesse a página de contato do site
2. Preencha o formulário com dados de teste
3. Clique em "Enviar Mensagem"
4. Verifique se o email chegou na caixa de entrada configurada

---

## 📊 Resumo das Variáveis

Você precisa de **3 valores** do EmailJS:

| Variável | Onde Encontrar | Exemplo |
|----------|----------------|---------|
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Email Services → Service ID | `service_gmail123` |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Email Templates → Template ID | `template_contact456` |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Account → General → API Keys | `user_abc123xyz789` |

---

## 🎨 Template HTML (Opcional - Mais Bonito)

Se quiser um email mais formatado, use este template HTML:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
    .section { margin-bottom: 25px; }
    .label { font-weight: bold; color: #1e40af; }
    .message-box { background: white; padding: 20px; border-left: 4px solid #3b82f6; margin-top: 15px; }
    .footer { background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>📧 Novo Contato do Site Innexar</h2>
    </div>
    <div class="content">
      <div class="section">
        <h3>👤 Informações do Contato</h3>
        <p><span class="label">Nome:</span> {{from_name}}</p>
        <p><span class="label">Email:</span> {{from_email}}</p>
        <p><span class="label">Telefone:</span> {{phone}}</p>
        <p><span class="label">Empresa:</span> {{company}}</p>
      </div>
      
      <div class="section">
        <h3>💼 Detalhes do Projeto</h3>
        <p><span class="label">Tipo:</span> {{project_type}}</p>
        <p><span class="label">Orçamento:</span> {{budget}}</p>
        <p><span class="label">Prazo:</span> {{timeline}}</p>
      </div>
      
      <div class="section">
        <h3>💬 Mensagem</h3>
        <div class="message-box">
          {{message}}
        </div>
      </div>
    </div>
    <div class="footer">
      Este email foi enviado automaticamente através do formulário de contato do site Innexar.
    </div>
  </div>
</body>
</html>
```

---

## 🆘 Problemas Comuns

### ❌ "Serviço de email não configurado"
- Verifique se o arquivo `.env.local` existe
- Confirme que as variáveis começam com `NEXT_PUBLIC_`
- Reinicie o servidor após adicionar as variáveis

### ❌ Email não chega
- Verifique a caixa de spam
- Confirme que o "To Email" está correto no template
- Verifique os logs no dashboard do EmailJS

### ❌ Erro no console do navegador
- Abra o DevTools (F12)
- Vá na aba "Console"
- Veja a mensagem de erro específica
- Verifique se todas as variáveis estão corretas

---

## 📞 Suporte

- **Documentação EmailJS:** https://www.emailjs.com/docs/
- **Dashboard:** https://dashboard.emailjs.com/

---

## 💡 Dicas

1. **Use um email específico** para receber contatos (ex: `contato@innexar.app`)
2. **Configure filtros** no Gmail para organizar os emails
3. **Monitore o uso** no dashboard (200 emails/mês grátis)
4. **Teste sempre** após fazer mudanças no template
