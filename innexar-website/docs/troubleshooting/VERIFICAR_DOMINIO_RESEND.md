# 🔐 Verificar Domínio no Resend

## ⚠️ Problema Atual

O Resend está rejeitando emails porque o domínio `innexar.app` não está verificado.

**Solução temporária:** Estamos usando `onboarding@resend.dev` que funciona imediatamente.

**Solução definitiva:** Verifique o domínio `innexar.app` no Resend.

---

## 🚀 Como Verificar o Domínio

### 1. Acessar o Resend

1. Faça login em: **https://resend.com**
2. Vá em **"Domains"** (menu lateral)

### 2. Adicionar Domínio

1. Clique em **"Add Domain"**
2. Digite: `innexar.app`
3. Clique em **"Add"**

### 3. Configurar DNS

O Resend vai mostrar os registros DNS que você precisa adicionar:

#### Registros necessários:

1. **SPF Record** (TXT)
   ```
   v=spf1 include:resend.com ~all
   ```

2. **DKIM Record** (TXT)
   ```
   (o Resend fornecerá uma chave única)
   ```

3. **DMARC Record** (TXT) - Opcional mas recomendado
   ```
   v=DMARC1; p=none; rua=mailto:comercial@innexar.app
   ```

### 4. Adicionar no Cloudflare

1. Acesse: **https://dash.cloudflare.com**
2. Selecione o domínio `innexar.app`
3. Vá em **DNS** → **Records**
4. Adicione os registros TXT fornecidos pelo Resend

### 5. Aguardar Verificação

- O Resend verifica automaticamente
- Pode levar de 5 minutos a 24 horas
- Você receberá um email quando estiver verificado

### 6. Atualizar Configuração

Depois de verificado, atualize o `.env`:

```env
RESEND_FROM_EMAIL=comercial@innexar.app
```

E reinicie o container:

```bash
cd /projetos/site-innexar
docker compose restart
```

---

## ✅ Verificação Rápida

Para verificar se o domínio está pronto:

1. Acesse: **https://resend.com/domains**
2. Veja o status do domínio `innexar.app`
3. Se estiver verde ✅, está pronto!

---

## 📝 Exemplo de Registros DNS

No Cloudflare, você adicionará algo como:

| Type | Name | Content | TTL |
|------|------|---------|-----|
| TXT | @ | `v=spf1 include:resend.com ~all` | Auto |
| TXT | resend._domainkey | `p=chave_dkim_aqui` | Auto |
| TXT | _dmarc | `v=DMARC1; p=none; rua=mailto:comercial@innexar.app` | Auto |

**⚠️ Importante:** Os valores exatos serão fornecidos pelo Resend quando você adicionar o domínio.

---

## 🆘 Problemas?

### Domínio não verifica?

1. Verifique se os registros DNS estão corretos
2. Aguarde até 24 horas (propagação DNS)
3. Verifique se não há registros conflitantes (SPF duplicado, etc)

### Ainda com erro?

Use temporariamente `onboarding@resend.dev` que funciona sem verificação.

