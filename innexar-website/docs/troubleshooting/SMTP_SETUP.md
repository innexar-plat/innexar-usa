# 📧 Configuração SMTP - Backend Interno do Site

## 🎯 O que foi criado

Um **backend interno no Next.js** que:
- ✅ Recebe formulários de contato
- ✅ Envia emails via SMTP (Google Workspace)
- ✅ Envia resposta automática para o cliente
- ✅ Templates HTML profissionais
- ✅ Tudo dentro do próprio site (sem serviços externos)

---

## 🚀 Passo 1: Gerar App Password no Google Workspace

### 1.1. Acessar Configurações

1. Acesse: **https://myaccount.google.com/apppasswords**
2. Faça login com sua conta do **Google Workspace**
3. Se não aparecer a opção, ative a verificação em 2 etapas primeiro

### 1.2. Gerar Senha de App

1. Em **"Selecione o app"**, escolha **"Email"**
2. Em **"Selecione o dispositivo"**, escolha **"Outro (nome personalizado)"**
3. Digite: `Innexar Site`
4. Clique em **"Gerar"**

### 1.3. Copiar a Senha

Você verá uma senha de 16 caracteres (ex: `abcd efgh ijkl mnop`)

**⚠️ IMPORTANTE:** Copie essa senha! Você não conseguirá vê-la novamente.

**✅ Use essa senha no `SMTP_PASSWORD`** (sem espaços)

---

## ⚙️ Passo 2: Configurar Variáveis de Ambiente

### 2.1. Criar Arquivo .env.local

Na raiz do projeto `site-innexar`, crie o arquivo `.env.local`:

```env
# SMTP Configuration (Google Workspace)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@innexar.app
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM_EMAIL=comercial@innexar.app

# Email de destino para receber os contatos
CONTACT_RECIPIENT_EMAIL=comercial@innexar.app

# Habilitar resposta automática (true/false)
ENABLE_AUTO_REPLY=true
```

### 2.2. Exemplo Real

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=comercial@innexar.app
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM_EMAIL=comercial@innexar.app
CONTACT_RECIPIENT_EMAIL=comercial@innexar.app
ENABLE_AUTO_REPLY=true
```

**⚠️ IMPORTANTE:**
- Use a **App Password** (não sua senha normal)
- Remova os espaços da senha (ex: `abcdefghijklmnop`)
- O arquivo `.env.local` não deve ser commitado no Git

---

## ✅ Passo 3: Testar

1. Reinicie o servidor:
   ```bash
   npm run dev
   ```

2. Acesse a página de contato do site
3. Preencha o formulário
4. Envie a mensagem
5. Verifique:
   - ✅ Email chegou na sua caixa de entrada
   - ✅ Cliente recebeu resposta automática

---

## 📧 Templates de Email

### Email Principal (para você)

- **Assunto:** `Novo contato do site - [Nome]`
- **Formato:** HTML profissional
- **Conteúdo:** Todas as informações do formulário
- **Reply To:** Email do cliente (permite responder diretamente)

### Resposta Automática (para o cliente)

- **Assunto:** `Recebemos sua mensagem - Innexar`
- **Formato:** HTML profissional
- **Conteúdo:** Mensagem de confirmação
- **Enviado para:** Email do cliente

---

## 🔧 Personalizar Templates

Os templates estão em `src/lib/email.ts`:

- `getContactEmailTemplate()` - Email principal
- `getAutoReplyTemplate()` - Resposta automática

Você pode editar os templates HTML diretamente no código.

---

## 🆘 Problemas Comuns

### ❌ "Erro de autenticação"

**Solução:**
- Verifique se está usando **App Password** (não senha normal)
- Confirme que a verificação em 2 etapas está ativada
- Remova espaços da senha

### ❌ "Erro de conexão"

**Solução:**
- Verifique se `SMTP_HOST` está correto (`smtp.gmail.com`)
- Confirme a porta (`587` para TLS, `465` para SSL)
- Se usar porta 465, mude `SMTP_SECURE=true`

### ❌ Email não chega

**Solução:**
- Verifique a caixa de spam
- Confirme que `CONTACT_RECIPIENT_EMAIL` está correto
- Verifique os logs do servidor (console)

### ❌ Resposta automática não funciona

**Solução:**
- Verifique se `ENABLE_AUTO_REPLY=true`
- Confirme que o email do cliente está correto
- Verifique os logs para erros

---

## 📊 Variáveis de Ambiente

| Variável | Descrição | Exemplo | Obrigatório |
|----------|-----------|---------|-------------|
| `SMTP_HOST` | Servidor SMTP | `smtp.gmail.com` | ✅ Sim |
| `SMTP_PORT` | Porta SMTP | `587` (TLS) ou `465` (SSL) | ✅ Sim |
| `SMTP_SECURE` | Usar SSL | `false` (TLS) ou `true` (SSL) | ✅ Sim |
| `SMTP_USER` | Email do Google Workspace | `comercial@innexar.app` | ✅ Sim |
| `SMTP_PASSWORD` | App Password (16 caracteres) | `abcdefghijklmnop` | ✅ Sim |
| `SMTP_FROM_EMAIL` | Email remetente | `comercial@innexar.app` | ✅ Sim |
| `CONTACT_RECIPIENT_EMAIL` | Email para receber contatos | `comercial@innexar.app` | ✅ Sim |
| `ENABLE_AUTO_REPLY` | Habilitar resposta automática | `true` ou `false` | ❌ Opcional |

---

## 🔒 Segurança

- ✅ App Password é mais seguro que senha normal
- ✅ Credenciais ficam no servidor (`.env.local` não vai pro Git)
- ✅ Templates são processados no servidor
- ✅ Validação de dados antes de enviar

---

## 💡 Dicas

1. **Teste sempre** após mudar configurações
2. **Monitore os logs** do servidor para debug
3. **Personalize os templates** conforme sua marca
4. **Use filtros no Gmail** para organizar os contatos
5. **Desabilite auto-reply** se não quiser usar (`ENABLE_AUTO_REPLY=false`)

---

## ✅ Checklist

- [ ] Verificação em 2 etapas ativada no Google Workspace
- [ ] App Password gerada
- [ ] Arquivo `.env.local` criado
- [ ] Todas as variáveis configuradas
- [ ] Servidor reiniciado
- [ ] Teste realizado com sucesso
- [ ] Email recebido na caixa de entrada
- [ ] Resposta automática funcionando

---

**Pronto!** Seu backend de email está configurado e funcionando! 🎉

