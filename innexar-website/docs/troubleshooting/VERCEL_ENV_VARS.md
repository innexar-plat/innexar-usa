# ⚙️ Configurar Variáveis de Ambiente no Vercel

## 🚨 Erro Atual

Se você está vendo este erro:

```
Erro de configuração de email. Verifique as credenciais SMTP no Vercel.
```

Isso significa que as **variáveis de ambiente não estão configuradas** no Vercel.

---

## ✅ Passo a Passo para Configurar

### 1. Acessar Configurações

1. Acesse: **https://vercel.com/dashboard**
2. Selecione o projeto **site-innexar** (ou o nome do seu projeto)
3. Vá em **Settings** (Configurações)
4. Clique em **Environment Variables** (Variáveis de Ambiente)

### 2. Adicionar Variáveis SMTP

Adicione **cada variável** abaixo, uma por uma:

#### Variável 1: SMTP_HOST

- **Key:** `SMTP_HOST`
- **Value:** `smtp.gmail.com`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Clique em **Save**

#### Variável 2: SMTP_PORT

- **Key:** `SMTP_PORT`
- **Value:** `587`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Clique em **Save**

#### Variável 3: SMTP_SECURE

- **Key:** `SMTP_SECURE`
- **Value:** `false`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Clique em **Save**

#### Variável 4: SMTP_USER

- **Key:** `SMTP_USER`
- **Value:** `comercial@innexar.app` (ou seu email do Google Workspace)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Clique em **Save**

#### Variável 5: SMTP_PASSWORD

- **Key:** `SMTP_PASSWORD`
- **Value:** `kqrmwaafyztkzpmw` (sua senha de app SEM espaços)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Clique em **Save**

#### Variável 6: SMTP_FROM_EMAIL

- **Key:** `SMTP_FROM_EMAIL`
- **Value:** `comercial@innexar.app`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Clique em **Save**

#### Variável 7: CONTACT_RECIPIENT_EMAIL

- **Key:** `CONTACT_RECIPIENT_EMAIL`
- **Value:** `comercial@innexar.app`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Clique em **Save**

#### Variável 8: ENABLE_AUTO_REPLY

- **Key:** `ENABLE_AUTO_REPLY`
- **Value:** `true`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Clique em **Save**

#### Variável 9: NEXT_PUBLIC_SITE_URL

- **Key:** `NEXT_PUBLIC_SITE_URL`
- **Value:** `https://innexar.app` (ou seu domínio)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Clique em **Save**

#### Variável 10: NEXT_PUBLIC_GA_MEASUREMENT_ID

- **Key:** `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- **Value:** `G-23YD60MCM4`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Clique em **Save**

---

## ⚠️ IMPORTANTE

### ✅ Marcar para Todos os Ambientes

Ao adicionar cada variável, **marque todas as opções**:

- ✅ Production
- ✅ Preview
- ✅ Development

### ✅ Senha de App SEM Espaços

A `SMTP_PASSWORD` deve ser a senha de app **SEM espaços**:

- ❌ `kqrm waaf yztk zpmw` (com espaços - ERRADO)
- ✅ `kqrmwaafyztkzpmw` (sem espaços - CORRETO)

### ✅ Redeploy Obrigatório

Após adicionar/alterar variáveis:

1. Vá em **Deployments**
2. Clique nos **3 pontos** do último deploy
3. Selecione **Redeploy**
4. Aguarde o build completar

**As variáveis só são aplicadas após um novo deploy!**

---

## 📋 Checklist Rápido

- [ ] `SMTP_HOST` = `smtp.gmail.com`
- [ ] `SMTP_PORT` = `587`
- [ ] `SMTP_SECURE` = `false`
- [ ] `SMTP_USER` = `comercial@innexar.app`
- [ ] `SMTP_PASSWORD` = `kqrmwaafyztkzpmw` (sem espaços)
- [ ] `SMTP_FROM_EMAIL` = `comercial@innexar.app`
- [ ] `CONTACT_RECIPIENT_EMAIL` = `comercial@innexar.app`
- [ ] `ENABLE_AUTO_REPLY` = `true`
- [ ] `NEXT_PUBLIC_SITE_URL` = `https://innexar.app`
- [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-23YD60MCM4`
- [ ] Todas marcadas para Production, Preview e Development
- [ ] Redeploy feito após configurar

---

## 🧪 Como Verificar se Está Funcionando

1. Configure todas as variáveis
2. Faça um **Redeploy**
3. Aguarde o build completar
4. Teste o formulário de contato
5. Verifique os logs em **Functions → Logs** se ainda houver erro

---

## 🆘 Problemas Comuns

### ❌ "Variáveis não encontradas" mesmo após configurar

**Solução:** Faça um **Redeploy** após configurar as variáveis.

### ❌ "EAUTH" ou erro de autenticação

**Solução:**

- Verifique se `SMTP_PASSWORD` está correto (sem espaços)
- Confirme que é a **App Password** (não a senha normal)
- Verifique se `SMTP_USER` está correto

### ❌ Variáveis não aparecem no deploy

**Solução:**

- Certifique-se de marcar para **Production**
- Faça um novo deploy (não apenas redeploy)
- Verifique se não há espaços extras nos valores

---

## ✅ Pronto!

Após configurar todas as variáveis e fazer o redeploy, o formulário deve funcionar! 🎉
