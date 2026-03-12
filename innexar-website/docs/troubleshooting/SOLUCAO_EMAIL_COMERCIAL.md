# 📧 Solução: Receber Emails em comercial@innexar.app

## ⚠️ Situação Atual

Os emails estão sendo enviados para `vasques@innexar.app` porque o Resend em modo de teste só permite enviar para o email da conta.

## ✅ Solução: Verificar Domínio no Resend

Para receber emails em `comercial@innexar.app`, você precisa verificar o domínio `innexar.app` no Resend.

---

## 🚀 Passo a Passo Rápido

### 1. Acessar o Resend

1. Acesse: **https://resend.com**
2. Faça login
3. Vá em **"Domains"** (menu lateral)

### 2. Adicionar Domínio

1. Clique em **"Add Domain"**
2. Digite: `innexar.app`
3. Clique em **"Add"**

### 3. Copiar Registros DNS

O Resend vai mostrar 2-3 registros TXT que você precisa adicionar no Cloudflare:

- **SPF Record** (TXT no root `@`)
- **DKIM Record** (TXT com nome específico, ex: `resend._domainkey`)
- **DMARC Record** (TXT `_dmarc`) - Opcional

### 4. Adicionar no Cloudflare

1. Acesse: **https://dash.cloudflare.com**
2. Selecione o domínio `innexar.app`
3. Vá em **DNS** → **Records**
4. Clique em **"Add record"**
5. Adicione cada registro TXT que o Resend forneceu:
   - **Type:** TXT
   - **Name:** (o que o Resend indicar)
   - **Content:** (o valor que o Resend forneceu)
   - **TTL:** Auto

### 5. Aguardar Verificação

- O Resend verifica automaticamente
- Pode levar de 5 minutos a 24 horas
- Você receberá um email quando estiver verificado

### 6. Atualizar Configuração

Depois que o domínio estiver verificado (status verde ✅ no Resend):

1. Edite o arquivo `.env`:
```bash
cd /projetos/site-innexar
nano .env
```

2. Atualize para:
```env
RESEND_FROM_EMAIL=comercial@innexar.app
CONTACT_RECIPIENT_EMAIL=comercial@innexar.app
```

3. Reinicie o container:
```bash
docker compose restart
```

---

## ⏱️ Solução Temporária (Enquanto Verifica)

Se você precisa receber os emails agora em `comercial@innexar.app`:

### Opção 1: Redirecionamento de Email

Configure no seu provedor de email (Google Workspace, etc.) para redirecionar emails de `vasques@innexar.app` para `comercial@innexar.app`.

### Opção 2: Verificar Email em vasques@innexar.app

Os emails estão chegando em `vasques@innexar.app`. Você pode verificar essa caixa de entrada temporariamente.

---

## ✅ Depois de Verificar o Domínio

Após verificar o domínio, você poderá:
- ✅ Enviar de `comercial@innexar.app`
- ✅ Enviar para qualquer email
- ✅ Usar qualquer endereço @innexar.app
- ✅ Melhor deliverability (menos chance de ir para spam)

---

## 🆘 Precisa de Ajuda?

Se tiver dúvidas sobre os registros DNS, consulte:
- `VERIFICAR_DOMINIO_RESEND.md` - Guia detalhado
- Dashboard do Resend mostra os registros exatos que você precisa

