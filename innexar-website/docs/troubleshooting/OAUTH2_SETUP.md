# 🔐 Configuração OAuth2 - Google Workspace

## ✅ Você já tem os tokens!

Baseado na resposta que você mostrou, você já tem:
- ✅ `access_token` (válido por 1 hora)
- ✅ `refresh_token` (válido por 7 dias, pode ser renovado)

Agora só precisa configurar no projeto!

---

## 📝 Passo 1: Configurar Variáveis de Ambiente

Atualize o arquivo `.env.local` com as credenciais OAuth2:

```env
# OAuth2 Configuration (Google Workspace)
GOOGLE_CLIENT_ID=407408718192.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret_do_arquivo_json
GOOGLE_REFRESH_TOKEN=seu_refresh_token_aqui
GOOGLE_FROM_EMAIL=comercial@innexar.app

# Email de destino para receber os contatos
CONTACT_RECIPIENT_EMAIL=comercial@innexar.app

# Habilitar resposta automática (true/false)
ENABLE_AUTO_REPLY=true
```

**⚠️ IMPORTANTE:**
- O `GOOGLE_CLIENT_SECRET` está no arquivo JSON que você baixou
- O `GOOGLE_REFRESH_TOKEN` é o que você obteve do OAuth Playground
- O `access_token` não precisa ser configurado (é renovado automaticamente)

---

## 🔍 Passo 2: Obter Client Secret

1. Abra o arquivo JSON que você baixou:
   `client_secret_737909403250-0u2km1n5vncq29e1ogdr3g1vf1u1q7he.apps.googleusercontent.com.json`

2. Procure por `"client_secret"` no arquivo

3. Copie o valor e cole no `.env.local`:
   ```env
   GOOGLE_CLIENT_SECRET=valor_do_client_secret
   ```

---

## ✅ Passo 3: Testar

1. Reinicie o servidor:
   ```bash
   npm run dev
   ```

2. Acesse: http://localhost:3000/pt/contact

3. Preencha o formulário e envie

4. Deve funcionar! 🎉

---

## 🔄 Como Funciona

O sistema agora usa **OAuth2** em vez de App Password:

1. **Refresh Token** é usado para obter novos **Access Tokens**
2. **Access Token** é usado para enviar emails via **Gmail API**
3. Quando o Access Token expira (1 hora), é renovado automaticamente
4. Refresh Token pode ser renovado indefinidamente

---

## 🆘 Se o Refresh Token Expirar

Se o refresh token expirar (após 7 dias de inatividade), você precisará gerar um novo:

1. Acesse: https://developers.google.com/oauthplayground
2. Configure:
   - **OAuth 2.0 Configuration**: ✅ Use your own OAuth credentials
   - **Client ID**: Seu client ID
   - **Client Secret**: Seu client secret
3. Selecione escopo: `https://mail.google.com/`
4. Clique em **Authorize APIs**
5. Faça login e autorize
6. Clique em **Exchange authorization code for tokens**
7. Copie o novo `refresh_token`

---

## 📊 Vantagens do OAuth2

- ✅ **Mais seguro** que App Password
- ✅ **Não expira** (refresh token pode ser renovado)
- ✅ **Funciona** mesmo com políticas restritivas do Admin
- ✅ **Não precisa** de verificação em 2 etapas para gerar

---

## ✅ Pronto!

Agora você tem um sistema de email funcionando com OAuth2! 🚀

O código já foi atualizado para usar OAuth2 automaticamente quando as variáveis estiverem configuradas.

