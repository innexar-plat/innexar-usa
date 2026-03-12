# 📧 Configuração de Email - Guia Rápido

## ✅ Recomendação: Use Resend (2 minutos)

**Por que Resend?**
- ✅ Gratuito até 3.000 emails/mês
- ✅ Configuração em 2 minutos
- ✅ Sem problemas de autenticação
- ✅ Melhor deliverability (emails não vão para spam)
- ✅ API moderna e simples

---

## 🚀 Passo a Passo - Resend

### 1. Criar Conta no Resend

1. Acesse: **https://resend.com**
2. Clique em **"Sign Up"** (canto superior direito)
3. Crie conta com seu email
4. Confirme o email (verifique sua caixa de entrada)

### 2. Obter API Key

1. Após fazer login, vá em **"API Keys"** (menu lateral)
2. Clique em **"Create API Key"**
3. Preencha:
   - **Name:** `Innexar Site`
   - **Permission:** `Sending access`
4. Clique em **"Add"**
5. **COPIE A CHAVE** (começa com `re_`)
   - ⚠️ **Você só verá uma vez!**

### 3. Configurar no Servidor

#### Opção A: Arquivo .env (Recomendado)

Crie o arquivo `.env` na pasta `/projetos/site-innexar/`:

```bash
cd /projetos/site-innexar
nano .env
```

Cole o seguinte conteúdo:

```env
RESEND_API_KEY=re_sua_chave_aqui
RESEND_FROM_EMAIL=comercial@innexar.app
CONTACT_RECIPIENT_EMAIL=comercial@innexar.app
ENABLE_AUTO_REPLY=true
```

**Substitua `re_sua_chave_aqui` pela chave que você copiou!**

Salve o arquivo (Ctrl+X, depois Y, depois Enter).

#### Opção B: Variáveis de Ambiente no Docker Compose

Você também pode definir diretamente no `docker-compose.yml` ou usar variáveis de ambiente do sistema.

### 4. Reiniciar o Container

```bash
cd /projetos/site-innexar
docker compose down
docker compose up -d
```

### 5. Testar

1. Acesse: **https://innexar.app/pt/contact**
2. Preencha o formulário de contato
3. Envie e verifique:
   - Você recebe o email em `comercial@innexar.app`
   - O cliente recebe resposta automática

---

## 🔍 Verificar se Está Funcionando

### Ver logs do container:

```bash
docker logs innexar-website --tail 50
```

### Testar via API:

```bash
curl -X POST https://innexar.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@exemplo.com",
    "message": "Teste de envio"
  }'
```

---

## ❌ Alternativa: SMTP (Não Recomendado)

Se por algum motivo não quiser usar Resend, você pode usar SMTP tradicional:

### Configuração SMTP (Google Workspace)

1. Gere uma **App Password** no Google:
   - Acesse: https://myaccount.google.com/apppasswords
   - Selecione "Email" e "Outro (nome personalizado)"
   - Digite: `Innexar Site`
   - Copie a senha gerada

2. Configure no `.env`:

```env
# Descomente e configure:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=comercial@innexar.app
SMTP_PASSWORD=sua-app-password-aqui
SMTP_FROM_EMAIL=comercial@innexar.app
CONTACT_RECIPIENT_EMAIL=comercial@innexar.app
ENABLE_AUTO_REPLY=true
```

**⚠️ Importante:** Não configure `RESEND_API_KEY` se for usar SMTP, ou o sistema priorizará o Resend.

---

## 📊 Comparação

| Recurso | Resend | SMTP |
|---------|--------|------|
| **Configuração** | ⭐⭐⭐⭐⭐ 2 min | ⭐⭐ 30+ min |
| **Confiabilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Facilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| **Gratuito** | 3.000/mês | Depende do provedor |
| **Problemas** | Nenhum | Muitos (autenticação, spam) |

---

## ✅ Pronto!

Agora seus formulários de contato estão configurados e funcionando!

**Próximos passos:**
- Teste enviando um formulário
- Verifique se os emails chegam corretamente
- Configure o domínio no Resend (opcional, para melhor deliverability)

---

## 🆘 Problemas?

### Email não está sendo enviado?

1. Verifique se a API Key está correta:
```bash
docker exec innexar-website printenv | grep RESEND
```

2. Verifique os logs:
```bash
docker logs innexar-website --tail 100 | grep -i email
```

3. Teste a API diretamente:
```bash
curl -X POST https://innexar.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@teste.com","message":"Teste"}'
```

### Ainda com problemas?

- Verifique se o domínio está verificado no Resend (opcional)
- Confirme que `RESEND_FROM_EMAIL` usa um domínio válido
- Verifique os logs do container para erros específicos

