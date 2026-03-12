# 📧 Configuração do EmailJS com Google Workspace

Este guia vai te ajudar a configurar o EmailJS para enviar emails através da sua conta Google Workspace.

---

## 📋 Pré-requisitos

- Conta Google Workspace ativa
- Acesso ao painel administrativo do Google Workspace
- Conta no EmailJS (gratuita - https://www.emailjs.com/)

---

## 🚀 Passo 1: Criar Conta no EmailJS

1. Acesse: **https://www.emailjs.com/**
2. Clique em **"Sign Up"** (canto superior direito)
3. Crie sua conta com:
   - Email (pode ser seu email pessoal ou do Google Workspace)
   - Senha
   - Confirme o email (verifique sua caixa de entrada)

---

## ⚙️ Passo 2: Configurar Email Service no EmailJS

### 2.1. Adicionar Serviço de Email

1. Após fazer login no EmailJS, você verá o **Dashboard**
2. No menu lateral, clique em **"Email Services"**
3. Clique no botão **"+ Add New Service"**

### 2.2. Escolher Gmail

1. Você verá várias opções de provedores
2. Clique em **"Gmail"**
3. Clique em **"Connect Account"**

### 2.3. Conectar Conta Google Workspace

1. Uma janela popup do Google aparecerá
2. **IMPORTANTE:** Selecione a conta do **Google Workspace** (não a conta pessoal)
3. Você verá uma tela de permissões do Google
4. Clique em **"Permitir"** ou **"Allow"** para autorizar o EmailJS

**⚠️ Permissões necessárias:**
- Enviar emails em seu nome
- Gerenciar mensagens de email

### 2.4. Finalizar Configuração

1. Após autorizar, você voltará ao EmailJS
2. Dê um nome ao serviço (ex: "Innexar Workspace" ou "Google Workspace")
3. Clique em **"Create Service"**

**✅ Você verá algo como:**
```
Service ID: service_abc123xyz
```

**⚠️ ANOTE ESSE SERVICE ID!** Você vai precisar dele depois.

---

## 📧 Passo 3: Criar Email Template

### 3.1. Criar Novo Template

1. No menu lateral do EmailJS, clique em **"Email Templates"**
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
   (ou o email que você preferir - deve ser um email do seu Google Workspace)

2. No campo **"From Name"**, coloque:
   ```
   Site Innexar
   ```

3. No campo **"Reply To"**, coloque:
   ```
   {{from_email}}
   ```
   (Isso permite responder diretamente ao cliente)

4. Clique em **"Save"**

**✅ Você verá algo como:**
```
Template ID: template_xyz789abc
```

**⚠️ ANOTE ESSE TEMPLATE ID!** Você vai precisar dele depois.

---

## 🔑 Passo 4: Obter Public Key

1. No menu lateral do EmailJS, clique em **"Account"** → **"General"**
2. Role a página até encontrar **"API Keys"**
3. Você verá sua **Public Key** (algo como: `abcdefghijklmnop`)

**⚠️ ANOTE ESSA PUBLIC KEY!** Você vai precisar dela depois.

---

## 💻 Passo 5: Configurar no Projeto

### 5.1. Criar Arquivo .env.local

1. Na raiz do projeto `site-innexar`, crie um arquivo chamado `.env.local`
2. Adicione as seguintes linhas (substitua pelos valores que você anotou):

```env
# EmailJS Configuration
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

## ✅ Passo 6: Testar

1. Acesse a página de contato do site
2. Preencha o formulário com dados de teste
3. Clique em "Enviar Mensagem"
4. Verifique se o email chegou na caixa de entrada configurada

---

## 🔒 Segurança e Permissões do Google Workspace

### Se você tiver problemas de permissão:

1. **Verificar App Passwords (se necessário):**
   - Acesse: https://myaccount.google.com/apppasswords
   - Gere uma senha de app específica
   - Use essa senha no EmailJS (se solicitado)

2. **Verificar Configurações de Segurança:**
   - Acesse o painel do Google Workspace
   - Vá em **Segurança** → **Configurações de API**
   - Certifique-se de que "Acesso a API menos seguro" está habilitado (se necessário)

3. **Verificar OAuth:**
   - O EmailJS usa OAuth 2.0
   - Certifique-se de que OAuth está habilitado no Google Workspace

---

## 📊 Resumo das Variáveis

Você precisa de **3 valores** do EmailJS:

| Variável | Onde Encontrar | Exemplo |
|----------|----------------|---------|
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Email Services → Service ID | `service_gmail123` |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Email Templates → Template ID | `template_contact456` |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Account → General → API Keys | `user_abc123xyz789` |

---

## 🆘 Problemas Comuns

### ❌ "Serviço de email não configurado"
- Verifique se o arquivo `.env.local` existe
- Confirme que as variáveis começam com `NEXT_PUBLIC_`
- Reinicie o servidor após adicionar as variáveis

### ❌ "Erro ao conectar com Gmail"
- Certifique-se de estar usando a conta do Google Workspace
- Verifique se OAuth está habilitado
- Tente desconectar e reconectar o serviço

### ❌ Email não chega
- Verifique a caixa de spam
- Confirme que o "To Email" está correto no template
- Verifique os logs no dashboard do EmailJS
- Confirme que o email de destino existe no Google Workspace

### ❌ "Permissão negada"
- Verifique as configurações de segurança do Google Workspace
- Certifique-se de que a conta tem permissão para enviar emails
- Tente usar uma conta de administrador do Google Workspace

---

## 💡 Dicas

1. **Use um email específico** para receber contatos (ex: `contato@innexar.app`)
2. **Configure filtros** no Gmail para organizar os emails
3. **Monitore o uso** no dashboard do EmailJS (200 emails/mês grátis)
4. **Teste sempre** após fazer mudanças no template
5. **Use Reply To** para facilitar respostas aos clientes

---

## 📞 Suporte

- **Documentação EmailJS:** https://www.emailjs.com/docs/
- **Dashboard EmailJS:** https://dashboard.emailjs.com/
- **Google Workspace Admin:** https://admin.google.com/

---

## ✅ Checklist

- [ ] Conta criada no EmailJS
- [ ] Serviço Gmail conectado com Google Workspace
- [ ] Service ID anotado
- [ ] Template criado e configurado
- [ ] Template ID anotado
- [ ] Public Key copiada
- [ ] Arquivo `.env.local` criado com as 3 variáveis
- [ ] Servidor reiniciado
- [ ] Teste realizado com sucesso
- [ ] Email recebido na caixa de entrada

---

**Pronto!** Seu formulário de contato agora está configurado para enviar emails através do Google Workspace! 🎉

