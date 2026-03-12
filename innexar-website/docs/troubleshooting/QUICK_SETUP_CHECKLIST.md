# ✅ Checklist Rápido - Configuração de Email

## 🎯 O que você PRECISA fazer:

### 1. ✅ Ativar Verificação em 2 Etapas (OBRIGATÓRIO)

**Link direto:** https://myaccount.google.com/security

1. Acesse o link acima
2. Procure por **"Verificação em duas etapas"**
3. Clique em **"Ativar"**
4. Siga o processo (pode pedir número de telefone)
5. ⚠️ **SEM ISSO, NÃO FUNCIONA!**

---

### 2. ✅ Gerar App Password

**Link direto:** https://myaccount.google.com/apppasswords

1. Acesse o link acima
2. Se não aparecer, volte ao passo 1 (2FA não está ativado)
3. Selecione:
   - **App:** `Email`
   - **Device:** `Outro (nome personalizado)`
   - Digite: `Innexar Site`
4. Clique em **"Gerar"**
5. Copie a senha de 16 caracteres
6. Cole no `.env.local` **SEM espaços**

---

### 3. ✅ Atualizar .env.local

O arquivo já está criado, só precisa atualizar a senha:

```env
SMTP_PASSWORD=ttbatsxdqrhfmvdb
```

**Substitua** `ttbatsxdqrhfmvdb` pela nova senha que você gerou.

---

## ❌ O que você NÃO precisa fazer:

- ❌ **NÃO precisa criar app no Google Cloud** (só se App Password não funcionar)
- ❌ **NÃO precisa configurar OAuth2** (só se App Password não funcionar)
- ❌ **NÃO precisa configurar nada no Admin Console** (a menos que seja bloqueado)

---

## 🧪 Testar

Depois de fazer os 3 passos acima:

```bash
cd site-innexar
node test-email.js
```

Se funcionar, você verá:
```
✅ Conexão SMTP verificada com sucesso!
✅ Email enviado com sucesso!
```

---

## 🆘 Se ainda não funcionar:

### Opção A: Verificar se 2FA está realmente ativado

1. Acesse: https://myaccount.google.com/security
2. Verifique se mostra **"Verificação em duas etapas: Ativada"**
3. Se não estiver, ative agora

### Opção B: Gerar nova App Password

1. Acesse: https://myaccount.google.com/apppasswords
2. Delete a senha antiga (se houver)
3. Gere uma nova
4. Atualize o `.env.local`

### Opção C: Verificar no Admin Console (se for admin)

1. Acesse: https://admin.google.com
2. Vá em **Segurança** → **Configurações de API**
3. Verifique se **"App Passwords"** estão habilitados

---

## 📝 Resumo

**Você só precisa:**
1. ✅ Ativar 2FA
2. ✅ Gerar App Password
3. ✅ Atualizar `.env.local`
4. ✅ Testar

**Não precisa:**
- ❌ Criar app no Google Cloud
- ❌ Configurar OAuth2
- ❌ Configurar Admin Console (a menos que seja necessário)

---

## 🎯 Próximo Passo

**Acesse agora:** https://myaccount.google.com/security

E ative a verificação em 2 etapas! 🚀

