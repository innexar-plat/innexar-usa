# 🔧 Configuração Completa do Google Workspace para SMTP

## 📋 Pré-requisitos

1. **Conta Google Workspace** ativa
2. **Acesso ao Admin Console** (se necessário)
3. **Verificação em 2 Etapas** ativada (OBRIGATÓRIO)

---

## 🚀 Método 1: App Password (Recomendado - Mais Simples)

### Passo 1: Ativar Verificação em 2 Etapas

1. Acesse: https://myaccount.google.com/security
2. Procure por **"Verificação em duas etapas"**
3. Clique em **"Ativar"** e siga o processo
4. ⚠️ **IMPORTANTE**: Sem 2FA, não é possível gerar App Passwords

### Passo 2: Gerar App Password

1. Acesse: https://myaccount.google.com/apppasswords
   - Se não aparecer, verifique se a 2FA está realmente ativada
2. Selecione:
   - **App**: `Email`
   - **Device**: `Outro (nome personalizado)`
   - Digite: `Innexar Site`
3. Clique em **"Gerar"**
4. Copie a senha de **16 caracteres** (aparece como 4 grupos de 4)
   - Exemplo: `ttba tsxd qrhf mvdb`
5. Use **SEM espaços** no `.env.local`:
   ```env
   SMTP_PASSWORD=ttbatsxdqrhfmvdb
   ```

### Passo 3: Verificar Configuração no Admin (Google Workspace)

Se você é administrador do Google Workspace:

1. Acesse: https://admin.google.com
2. Vá em **Segurança** → **Configurações de API**
3. Verifique se **"Permitir acesso menos seguro"** está desabilitado (recomendado)
4. Verifique se **"App Passwords"** estão habilitados

---

## 🔐 Método 2: OAuth2 (Alternativa - Mais Complexo)

Se App Password não funcionar, use OAuth2:

### Passo 1: Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com
2. Clique em **"Criar Projeto"** ou selecione um existente
3. Nome do projeto: `Innexar Email Service`

### Passo 2: Habilitar Gmail API

1. No projeto, vá em **"APIs e Serviços"** → **"Biblioteca"**
2. Procure por **"Gmail API"**
3. Clique em **"Habilitar"**

### Passo 3: Criar Credenciais OAuth2

1. Vá em **"APIs e Serviços"** → **"Credenciais"**
2. Clique em **"Criar Credenciais"** → **"ID do cliente OAuth"**
3. Tipo de aplicativo: **"Aplicativo da Web"**
4. Nome: `Innexar Email Client`
5. **URIs de redirecionamento autorizados**:
   ```
   http://localhost:3000/api/auth/callback
   https://innexar.app/api/auth/callback
   ```
6. Clique em **"Criar"**
7. Copie o **Client ID** e **Client Secret**

### Passo 4: Configurar no Código

Atualize o `.env.local`:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REFRESH_TOKEN=token_gerado_apos_autenticacao
```

⚠️ **Nota**: OAuth2 requer implementação adicional no código. Se App Password funcionar, não é necessário.

---

## ✅ Verificação Rápida

### Teste 1: Verificar 2FA

```bash
# Acesse manualmente:
https://myaccount.google.com/security
```

### Teste 2: Verificar App Passwords

```bash
# Acesse manualmente:
https://myaccount.google.com/apppasswords
```

Se não aparecer a opção, a 2FA não está ativada corretamente.

### Teste 3: Testar Configuração

```bash
cd site-innexar
node test-email.js
```

---

## 🆘 Problemas Comuns

### ❌ "App Passwords não disponível"

**Causa**: Verificação em 2 Etapas não está ativada

**Solução**:

1. Ative a 2FA: https://myaccount.google.com/security
2. Aguarde alguns minutos
3. Tente gerar App Password novamente

### ❌ "Invalid login: Username and Password not accepted"

**Causa 1**: Senha de app com espaços

**Solução**: Remova todos os espaços:

```env
# ❌ ERRADO
SMTP_PASSWORD=ttba tsxd qrhf mvdb

# ✅ CORRETO
SMTP_PASSWORD=ttbatsxdqrhfmvdb
```

**Causa 2**: Email não é do Google Workspace

**Solução**: Verifique se `comercial@innexar.app` é um email do Google Workspace. Se for Gmail pessoal, pode precisar de configuração diferente.

**Causa 3**: App Password gerado para app errado

**Solução**: Gere uma nova senha especificando:

- App: `Email`
- Device: `Outro (nome personalizado)` → `Innexar Site`

### ❌ "Acesso negado pelo administrador"

**Causa**: Políticas do Google Workspace bloqueando App Passwords

**Solução**:

1. Acesse o Admin Console: https://admin.google.com
2. Vá em **Segurança** → **Configurações de API**
3. Habilite **"App Passwords"** para usuários

---

## 📝 Checklist Final

Antes de testar, verifique:

- [ ] Verificação em 2 Etapas está **ATIVADA**
- [ ] App Password foi gerado para **"Email"**
- [ ] Senha no `.env.local` está **SEM espaços**
- [ ] Email `comercial@innexar.app` é do **Google Workspace**
- [ ] Admin permitiu App Passwords (se aplicável)

---

## 🎯 Próximos Passos

1. **Siga o Método 1** (App Password) primeiro
2. **Teste** com `node test-email.js`
3. Se não funcionar, verifique o **checklist** acima
4. Se ainda não funcionar, considere **Método 2** (OAuth2) ou serviços alternativos

---

## 📚 Recursos Úteis

- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [Google Workspace Admin](https://admin.google.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
