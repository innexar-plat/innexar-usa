# 📧 Configuração SMTP com Mailcow

## 🎯 Configuração do Site para Usar Mailcow

Após o Mailcow estar rodando e você ter criado uma conta de email, configure as seguintes variáveis:

### Variáveis de Ambiente no Docker Compose

Edite o arquivo `docker-compose.yml` e adicione/atualize as variáveis de ambiente:

```yaml
environment:
  # ... outras variáveis ...
  
  # SMTP Mailcow Configuration
  SMTP_HOST=mail.innexar.app
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=comercial@innexar.app
  SMTP_PASSWORD=sua_senha_do_mailcow
  SMTP_FROM_EMAIL=comercial@innexar.app
  CONTACT_RECIPIENT_EMAIL=comercial@innexar.app
  
  # Desabilitar Resend (usar apenas SMTP)
  RESEND_API_KEY=
```

### Configuração do Mailcow

1. **Iniciar o Mailcow:**
```bash
cd /projetos/mailcow
docker compose pull
docker compose up -d
```

2. **Aguardar inicialização** (pode levar alguns minutos):
```bash
docker compose logs -f
```

3. **Acessar o painel:**
- URL: `https://mail.innexar.app`
- Usuário: `admin`
- Senha: `moohoo` (altere no primeiro acesso)

4. **Configurar domínio:**
   - Vá em **Configuration** → **Mail Setup**
   - Adicione o domínio `innexar.app`
   - Configure os registros DNS conforme mostrado no painel

5. **Criar conta de email:**
   - Vá em **Configuration** → **Mailboxes**
   - Clique em **Add mailbox**
   - Crie: `comercial@innexar.app`
   - Defina uma senha forte
   - **Use essa senha** no `SMTP_PASSWORD`

### Configuração DNS (Importante!)

Antes de usar o Mailcow, configure os seguintes registros DNS:

#### Registros A/AAAA
```
mail.innexar.app          → IP do servidor
autodiscover.innexar.app  → IP do servidor
autoconfig.innexar.app    → IP do servidor
```

#### Registro MX
```
innexar.app  MX  10  mail.innexar.app
```

#### Registros TXT (SPF)
```
innexar.app  TXT  "v=spf1 mx a:mail.innexar.app ~all"
```

#### Registros CNAME (opcional)
```
smtp.innexar.app  →  mail.innexar.app
imap.innexar.app  →  mail.innexar.app
```

### Testar Configuração

Após configurar tudo:

1. **Reconstruir o container do site:**
```bash
cd /projetos/site-innexar
docker compose down
docker compose build
docker compose up -d
```

2. **Testar envio de email:**
   - Acesse o formulário de contato
   - Envie uma mensagem de teste
   - Verifique os logs: `docker logs innexar-website --tail 50`

3. **Verificar no Mailcow:**
   - Acesse o painel do Mailcow
   - Vá em **Queue Manager** para ver emails na fila
   - Verifique a caixa de entrada de `comercial@innexar.app`

### Troubleshooting

#### Erro: "Connection refused"
- Verifique se o Mailcow está rodando: `docker compose ps`
- Verifique se a porta 587 está acessível
- Verifique se o DNS está configurado corretamente

#### Erro: "Authentication failed"
- Verifique se a senha está correta
- Verifique se a conta de email foi criada no Mailcow
- Verifique se o usuário está no formato correto: `comercial@innexar.app`

#### Emails não chegam
- Verifique os logs do Mailcow: `docker compose logs -f`
- Verifique a fila de emails no painel do Mailcow
- Verifique se os registros DNS estão corretos
- Verifique se o domínio está configurado no Mailcow

