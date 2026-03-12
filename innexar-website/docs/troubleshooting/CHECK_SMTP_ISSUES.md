# 🔍 Verificação de Problemas SMTP

## ❌ Erro: "Invalid login: Username and Password not accepted"

### ✅ Checklist de Verificação

#### 1. **Verificação em 2 Etapas Ativada?**
- Acesse: https://myaccount.google.com/security
- Verifique se "Verificação em duas etapas" está **ATIVADA**
- ⚠️ **Obrigatório**: Senhas de app só funcionam com 2FA ativado

#### 2. **Email é do Google Workspace?**
- Verifique se `comercial@innexar.app` é um email do Google Workspace
- Se for Gmail pessoal, pode precisar de configuração diferente
- Acesse: https://admin.google.com (se tiver acesso)

#### 3. **Senha de App Gerada Corretamente?**
- Acesse: https://myaccount.google.com/apppasswords
- Selecione:
  - **App**: Email
  - **Device**: Outro (nome personalizado) → "Innexar Site"
- Copie a senha de **16 caracteres** (4 grupos de 4)
- Use **SEM espaços** no `.env.local`

#### 4. **Permissões do Email**
- Verifique se o email tem permissão para enviar emails
- Em Google Workspace, pode precisar de permissão do administrador

### 🔧 Teste Alternativo: OAuth2

Se a senha de app não funcionar, pode ser necessário usar OAuth2:

1. Criar credenciais OAuth2 no Google Cloud Console
2. Configurar redirect URIs
3. Usar token de acesso em vez de senha

### 📧 Teste Via API (Recomendado)

Teste através da API do Next.js para ver logs mais detalhados:

```bash
# Terminal 1: Inicie o servidor
npm run dev

# Terminal 2: Teste a API
node test-email-api.js
```

Ou teste pelo formulário do site:
1. Acesse: http://localhost:3000/pt/contact
2. Preencha e envie
3. Verifique os logs no terminal do servidor

### 🆘 Se Nada Funcionar

Considere usar um serviço de email terceirizado:
- **SendGrid** (gratuito até 100 emails/dia)
- **Mailgun** (gratuito até 5.000 emails/mês)
- **Resend** (gratuito até 3.000 emails/mês)

Todos têm integração fácil com Nodemailer.

