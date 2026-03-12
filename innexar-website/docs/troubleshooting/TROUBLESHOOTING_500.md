# 🔧 Troubleshooting - Erro 500 no Formulário de Contato

## ✅ Correções Aplicadas

1. ✅ Validação de variáveis de ambiente SMTP
2. ✅ Tratamento de erros melhorado com logs detalhados
3. ✅ Fallback para traduções em caso de erro
4. ✅ Timeouts aumentados para conexão SMTP
5. ✅ Cor do texto corrigida no formulário

---

## 🔍 Como Verificar o Problema

### 1. Verificar Logs no Vercel

1. Acesse: **https://vercel.com/dashboard**
2. Selecione o projeto **site-innexar**
3. Vá em **Functions** → **Logs**
4. Procure por erros recentes (últimos minutos)
5. Veja a mensagem de erro completa

**Erros comuns que você pode ver:**

#### ❌ "SMTP credentials not configured"
**Causa:** Variáveis de ambiente não configuradas no Vercel
**Solução:** Veja passo 2 abaixo

#### ❌ "EAUTH" ou "ECONNECTION"
**Causa:** Credenciais SMTP incorretas
**Solução:** Verifique se `SMTP_PASSWORD` está correto (sem espaços)

#### ❌ "ETIMEDOUT"
**Causa:** Timeout na conexão SMTP
**Solução:** Já corrigido com timeouts aumentados

---

### 2. Verificar Variáveis de Ambiente no Vercel

1. Acesse: **https://vercel.com/dashboard**
2. Selecione o projeto **site-innexar**
3. Vá em **Settings** → **Environment Variables**
4. Verifique se TODAS estas variáveis estão configuradas:

```
✅ SMTP_HOST = smtp.gmail.com
✅ SMTP_PORT = 587
✅ SMTP_SECURE = false
✅ SMTP_USER = comercial@innexar.app
✅ SMTP_PASSWORD = kqrmwaafyztkzpmw (SEM ESPAÇOS)
✅ SMTP_FROM_EMAIL = comercial@innexar.app
✅ CONTACT_RECIPIENT_EMAIL = comercial@innexar.app
✅ ENABLE_AUTO_REPLY = true
```

**⚠️ IMPORTANTE:**
- Todas devem estar marcadas para **Production**, **Preview** e **Development**
- `SMTP_PASSWORD` deve ser a senha de app SEM espaços
- Após adicionar/alterar variáveis, faça um **Redeploy**

---

### 3. Fazer Redeploy

Após configurar as variáveis:

1. Vá em **Deployments**
2. Clique nos **3 pontos** do último deploy
3. Selecione **Redeploy**
4. Aguarde o build completar
5. Teste novamente o formulário

---

## 🧪 Testar Localmente Primeiro

Para garantir que funciona antes de fazer deploy:

```bash
cd site-innexar

# Verificar se .env.local existe e está configurado
cat .env.local

# Iniciar servidor
npm run dev

# Testar formulário em http://localhost:3000/pt/contact
```

Se funcionar localmente mas não no Vercel, o problema é nas variáveis de ambiente.

---

## 📋 Checklist de Verificação

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] `SMTP_PASSWORD` está correto (sem espaços)
- [ ] Variáveis marcadas para Production, Preview e Development
- [ ] Redeploy feito após configurar variáveis
- [ ] Logs do Vercel verificados
- [ ] Testado localmente (funciona?)

---

## 🆘 Se Ainda Não Funcionar

1. **Copie o erro completo dos logs do Vercel**
2. **Verifique se todas as variáveis estão configuradas**
3. **Confirme que a senha de app está correta**
4. **Teste localmente para isolar o problema**

---

## 💡 Dicas

- Os logs do Vercel mostram exatamente qual variável está faltando
- Sempre faça redeploy após alterar variáveis de ambiente
- Teste localmente primeiro para garantir que o código funciona
- A senha de app deve ter 16 caracteres SEM espaços

