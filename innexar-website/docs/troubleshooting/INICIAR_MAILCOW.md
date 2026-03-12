# 🚀 Iniciar Mailcow e Configurar Email

## Passo 1: Iniciar o Mailcow

```bash
cd /projetos/mailcow
docker compose pull
docker compose up -d
```

Aguarde alguns minutos para o Mailcow inicializar completamente. Você pode acompanhar os logs:

```bash
docker compose logs -f
```

## Passo 2: Acessar o Painel do Mailcow

Após alguns minutos, acesse:
- **URL**: `https://mail.innexar.app`
- **Usuário**: `admin`
- **Senha**: `moohoo`

⚠️ **IMPORTANTE**: Altere a senha do admin no primeiro acesso!

## Passo 3: Configurar Domínio

1. No painel do Mailcow, vá em **Configuration** → **Mail Setup**
2. Clique em **Add domain**
3. Adicione: `innexar.app`
4. O Mailcow irá mostrar os registros DNS necessários

## Passo 4: Configurar DNS

Configure os seguintes registros DNS no seu provedor de domínio:

### Registros A/AAAA
```
mail.innexar.app          → IP do servidor
autodiscover.innexar.app  → IP do servidor
autoconfig.innexar.app    → IP do servidor
```

### Registro MX
```
innexar.app  MX  10  mail.innexar.app
```

### Registro TXT (SPF)
```
innexar.app  TXT  "v=spf1 mx a:mail.innexar.app ~all"
```

⚠️ **Aguarde a propagação DNS** (pode levar até 24h, mas geralmente é mais rápido)

## Passo 5: Criar Conta de Email

1. No painel do Mailcow, vá em **Configuration** → **Mailboxes**
2. Clique em **Add mailbox**
3. Preencha:
   - **Local part**: `comercial`
   - **Domain**: `innexar.app`
   - **Full name**: `Comercial Innexar`
   - **Password**: (defina uma senha forte)
   - **Quota**: (deixe em branco para ilimitado)
4. Clique em **Add**

⚠️ **ANOTE A SENHA** - você precisará dela para configurar o site!

## Passo 6: Configurar o Site

Após criar a conta de email, configure o site:

### Opção A: Usar arquivo .env (recomendado)

Crie o arquivo `/projetos/site-innexar/.env`:

```env
SMTP_HOST=mail.innexar.app
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=comercial@innexar.app
SMTP_PASSWORD=sua_senha_criada_no_mailcow
SMTP_FROM_EMAIL=comercial@innexar.app
CONTACT_RECIPIENT_EMAIL=comercial@innexar.app
```

### Opção B: Variáveis de ambiente no docker-compose

Edite o arquivo `docker-compose.yml` e adicione as variáveis diretamente (menos seguro).

## Passo 7: Reiniciar o Site

```bash
cd /projetos/site-innexar
docker compose down
docker compose up -d
```

## Passo 8: Testar

1. Acesse o formulário de contato no site
2. Envie uma mensagem de teste
3. Verifique os logs: `docker logs innexar-website --tail 50`
4. Verifique a caixa de entrada de `comercial@innexar.app` no Mailcow

## Troubleshooting

### Mailcow não inicia
```bash
cd /projetos/mailcow
docker compose logs -f
```

### Erro de autenticação SMTP
- Verifique se a senha está correta
- Verifique se a conta foi criada no Mailcow
- Verifique se o formato do usuário está correto: `comercial@innexar.app`

### Emails não chegam
- Verifique os logs do Mailcow: `docker compose logs -f`
- Verifique a fila de emails no painel do Mailcow
- Verifique se os registros DNS estão corretos
- Verifique se o domínio está configurado no Mailcow

### Verificar status do Mailcow
```bash
cd /projetos/mailcow
docker compose ps
```

