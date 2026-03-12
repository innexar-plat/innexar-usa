# 🔍 Verificação Completa - Google Workspace

## ❌ Problema Atual

Mesmo com senha de app correta (16 caracteres, sem espaços), o erro persiste:
```
Invalid login: Username and Password not accepted
```

Isso indica que o problema **NÃO é a senha**, mas sim a **configuração do Google Workspace**.

---

## ✅ Checklist de Verificação

### 1. Verificar se o Email é Realmente Google Workspace

**Teste 1: Login no Gmail**
1. Acesse: https://mail.google.com
2. Tente fazer login com: `comercial@innexar.app`
3. Se **NÃO conseguir**, o email pode não ser Google Workspace

**Teste 2: Admin Console**
1. Acesse: https://admin.google.com
2. Se **NÃO conseguir acessar**, você não é admin do Google Workspace
3. Se conseguir, verifique se o domínio `innexar.app` está configurado

**Teste 3: Verificar Domínio**
1. Acesse: https://admin.google.com
2. Vá em **Aplicativos** → **Google Workspace** → **Gmail**
3. Verifique se o domínio está ativo

---

### 2. Verificar Verificação em 2 Etapas

**Passo a Passo:**
1. Acesse: https://myaccount.google.com/security
2. Procure por **"Verificação em duas etapas"**
3. Deve mostrar: **"Ativada"** (não apenas "Configurada")
4. Se mostrar "Desativada" ou "Não configurada":
   - Clique em **"Ativar"**
   - Siga o processo completo
   - Aguarde **5-10 minutos** após ativar
   - Gere nova App Password

---

### 3. Verificar Permissões no Admin Console

**Se você é administrador:**

1. Acesse: https://admin.google.com
2. Vá em **Segurança** → **Configurações de API**
3. Verifique:
   - ✅ **"App Passwords"** está habilitado
   - ✅ **"Acesso a apps menos seguros"** (se necessário)
   - ✅ Nenhuma política bloqueando seu usuário

4. Vá em **Usuários** → Selecione `comercial@innexar.app`
5. Verifique:
   - ✅ Conta está ativa
   - ✅ Não há restrições de acesso
   - ✅ Permissões de email estão habilitadas

---

### 4. Verificar se o Email Está Configurado Corretamente

**Teste de Envio Manual:**
1. Acesse: https://mail.google.com
2. Faça login com `comercial@innexar.app`
3. Tente enviar um email de teste
4. Se **NÃO conseguir**, o email pode não estar configurado

---

## 🔄 Alternativas se Não Funcionar

### Opção 1: Usar Gmail Pessoal (Temporário)

Se `comercial@innexar.app` não for Google Workspace, você pode usar um Gmail pessoal temporariamente:

1. Use seu Gmail pessoal
2. Gere App Password para esse Gmail
3. Configure no `.env.local`:
   ```env
   SMTP_USER=seuemail@gmail.com
   SMTP_PASSWORD=senha_app_do_gmail
   ```

### Opção 2: Configurar Google Workspace Corretamente

Se você tem acesso ao Admin Console:

1. Verifique se o domínio está configurado
2. Crie o usuário `comercial@innexar.app` se não existir
3. Configure as permissões necessárias
4. Aguarde algumas horas para propagação

### Opção 3: Usar Resend (Recomendado)

Se o Google Workspace continuar dando problema:

1. Use Resend (já está instalado)
2. Crie conta: https://resend.com
3. Configure:
   ```env
   RESEND_API_KEY=re_sua_chave
   RESEND_FROM_EMAIL=comercial@innexar.app
   ```

---

## 🎯 Próximo Passo

**Execute estes testes e me diga o resultado:**

1. **Consegue fazer login em:** https://mail.google.com com `comercial@innexar.app`?
   - [ ] Sim
   - [ ] Não

2. **Consegue acessar:** https://admin.google.com?
   - [ ] Sim
   - [ ] Não

3. **Verificação em 2 etapas está:** https://myaccount.google.com/security
   - [ ] Ativada
   - [ ] Desativada
   - [ ] Não configurada

4. **O email `comercial@innexar.app` é:**
   - [ ] Google Workspace
   - [ ] Gmail pessoal
   - [ ] Não sei

Com essas respostas, posso te ajudar a resolver o problema específico! 🚀

