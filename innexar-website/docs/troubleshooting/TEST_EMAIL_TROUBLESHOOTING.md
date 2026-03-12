# 🔧 Troubleshooting - Teste de Email

## ❌ Erro: "Invalid login: Username and Password not accepted"

Este erro geralmente ocorre quando:

### 1. **Senha de App Incorreta**
- A senha de app deve ser usada **SEM espaços**
- Exemplo: `kqrm waaf yztk zpmw` → `kqrmwaafyztkzpmw`
- Verifique se copiou corretamente do Google

### 2. **Verificação em 2 Etapas Não Ativada**
- A senha de app só funciona se a verificação em 2 etapas estiver ativada
- Acesse: https://myaccount.google.com/security
- Ative "Verificação em duas etapas" se ainda não estiver ativada

### 3. **Senha de App Não Gerada Corretamente**
- Acesse: https://myaccount.google.com/apppasswords
- Selecione "Email" e "Outro (nome personalizado)"
- Digite: "Innexar Site"
- Copie a senha de 16 caracteres (sem espaços)

### 4. **Email Não É do Google Workspace**
- Se o email `comercial@innexar.app` não for um Google Workspace, pode precisar de configuração diferente
- Verifique se o domínio está configurado no Google Workspace

### 5. **Permissões de Acesso Menos Seguro**
- Em alguns casos, pode ser necessário permitir "Acesso a apps menos seguros"
- ⚠️ **Não recomendado** - Use senha de app em vez disso

## ✅ Como Testar Novamente

1. **Verifique a senha de app:**
   ```bash
   # No .env.local, a senha deve estar SEM espaços
   SMTP_PASSWORD=kqrmwaafyztkzpmw
   ```

2. **Execute o teste:**
   ```bash
   node test-email.js
   ```

3. **Se ainda não funcionar:**
   - Gere uma nova senha de app
   - Atualize o `.env.local`
   - Teste novamente

## 🔍 Verificação Rápida

Execute este comando para verificar se as variáveis estão carregadas:

```bash
node -e "require('dotenv').config({ path: '.env.local' }); console.log('User:', process.env.SMTP_USER); console.log('Password:', process.env.SMTP_PASSWORD ? '✅ Configurado' : '❌ Não configurado');"
```

## 📧 Teste Alternativo

Se o teste direto não funcionar, teste através da API do Next.js:

1. Inicie o servidor:
   ```bash
   npm run dev
   ```

2. Envie um POST para `/api/contact` com dados de teste

3. Verifique os logs do servidor para ver o erro específico

