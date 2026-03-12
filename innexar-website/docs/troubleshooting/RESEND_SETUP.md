# 🚀 Configuração Resend - Guia Rápido

## ✅ Por que Resend?

- ✅ **Gratuito** até 3.000 emails/mês
- ✅ **Configuração em 2 minutos**
- ✅ **Sem problemas de autenticação**
- ✅ **API moderna e simples**
- ✅ **Melhor para produção**

---

## 📝 Passo a Passo

### 1. Criar Conta no Resend

1. Acesse: **https://resend.com**
2. Clique em **"Sign Up"** (canto superior direito)
3. Crie conta com:
   - Email
   - Senha
   - Confirme o email (verifique sua caixa de entrada)

### 2. Obter API Key

1. Após fazer login, você verá o **Dashboard**
2. No menu lateral, clique em **"API Keys"**
3. Clique em **"Create API Key"**
4. Preencha:
   - **Name:** `Innexar Site`
   - **Permission:** `Sending access` (ou `Full access`)
5. Clique em **"Add"**
6. **COPIE A CHAVE** (começa com `re_`)
   - ⚠️ **Você só verá uma vez!**

### 3. Configurar no Projeto

Atualize o arquivo `.env.local`:

```env
# Resend Configuration
RESEND_API_KEY=re_sua_chave_aqui
RESEND_FROM_EMAIL=comercial@innexar.app

# Email de destino para receber os contatos
CONTACT_RECIPIENT_EMAIL=comercial@innexar.app

# Habilitar resposta automática (true/false)
ENABLE_AUTO_REPLY=true
```

### 4. Testar

```bash
cd site-innexar
npm run dev
```

Acesse: http://localhost:3000/pt/contact

Preencha o formulário e envie. Deve funcionar! 🎉

---

## 🔄 Migração Automática

O código já foi atualizado para:
- ✅ **Usar Resend** se `RESEND_API_KEY` estiver configurado
- ✅ **Usar SMTP** se `SMTP_USER` e `SMTP_PASSWORD` estiverem configurados
- ✅ **Priorizar Resend** se ambos estiverem configurados

---

## 📊 Comparação

| Recurso | Resend | Google SMTP |
|---------|--------|-------------|
| **Configuração** | ⭐⭐⭐⭐⭐ 2 min | ⭐⭐ 30+ min |
| **Confiabilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Facilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Gratuito** | 3.000/mês | Ilimitado* |
| **Problemas** | Nenhum | Muitos |

*Google SMTP requer configuração complexa

---

## ✅ Pronto!

Agora você tem um sistema de email **muito mais simples e confiável**!

**Próximo passo:** Configure no Vercel também (mesmas variáveis).

