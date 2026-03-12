# 🚀 Guia de Deploy - Innexar Website

Este guia contém instruções completas para fazer deploy do site Innexar em um servidor Linux.

## 📋 Pré-requisitos

- **Node.js** 18 ou superior
- **npm** ou **yarn**
- **Git** (para clonar o repositório)
- **Docker** e **Docker Compose** (opcional, para deploy com Docker)
- **PM2** (opcional, para gerenciamento de processos)
- **Nginx** (opcional, para proxy reverso e SSL)

## 🎯 Métodos de Deploy

### Método 1: Deploy com Docker (Recomendado)

O Docker isola a aplicação e facilita o gerenciamento.

#### Passo 1: Clonar o repositório

```bash
git clone https://github.com/viniciussvasques/site-innexar.git
cd site-innexar/innexar-website
```

#### Passo 2: Configurar variáveis de ambiente (opcional)

```bash
cp .env.example .env.local
# Edite .env.local com suas configurações
```

#### Passo 3: Deploy com Docker Compose

```bash
# Build e iniciar o container
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Parar o container
docker-compose down
```

O site estará disponível em `http://localhost:3000`

#### Comandos úteis Docker

```bash
# Ver status
docker-compose ps

# Reiniciar
docker-compose restart

# Ver logs em tempo real
docker-compose logs -f innexar-website

# Parar e remover containers
docker-compose down

# Rebuild completo
docker-compose up -d --build --force-recreate
```

---

### Método 2: Deploy com Script Automatizado

O script `deploy.sh` automatiza todo o processo.

#### Passo 1: Dar permissão de execução

```bash
chmod +x deploy.sh
```

#### Passo 2: Executar o script

```bash
# Deploy com PM2 (padrão)
./deploy.sh pm2

# Deploy com Docker
./deploy.sh docker

# Deploy com systemd
./deploy.sh systemd
```

---

### Método 3: Deploy Manual com PM2

PM2 é um gerenciador de processos para Node.js que mantém a aplicação rodando.

#### Passo 1: Instalar dependências e build

```bash
# Instalar dependências
npm ci

# Build da aplicação
npm run build
```

#### Passo 2: Instalar PM2

```bash
npm install -g pm2
```

#### Passo 3: Iniciar aplicação com PM2

```bash
# Iniciar
pm2 start npm --name "innexar-website" -- start

# Salvar configuração para iniciar no boot
pm2 save
pm2 startup
```

#### Passo 4: Comandos úteis PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs innexar-website

# Reiniciar
pm2 restart innexar-website

# Parar
pm2 stop innexar-website

# Remover
pm2 delete innexar-website

# Monitoramento
pm2 monit
```

---

### Método 4: Deploy Manual com systemd

Criar um serviço systemd para gerenciar a aplicação.

#### Passo 1: Criar arquivo de serviço

```bash
sudo nano /etc/systemd/system/innexar-website.service
```

Cole o seguinte conteúdo (ajuste os caminhos):

```ini
[Unit]
Description=Innexar Website
After=network.target

[Service]
Type=simple
User=seu-usuario
WorkingDirectory=/caminho/para/innexar-website
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

#### Passo 2: Ativar e iniciar o serviço

```bash
# Recarregar systemd
sudo systemctl daemon-reload

# Habilitar para iniciar no boot
sudo systemctl enable innexar-website

# Iniciar serviço
sudo systemctl start innexar-website

# Ver status
sudo systemctl status innexar-website
```

#### Passo 3: Comandos úteis systemd

```bash
# Ver logs
sudo journalctl -u innexar-website -f

# Reiniciar
sudo systemctl restart innexar-website

# Parar
sudo systemctl stop innexar-website
```

---

## 🌐 Configuração de Domínio e Nginx

### Passo 1: Instalar Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx
```

### Passo 2: Configurar Nginx

```bash
# Copiar arquivo de exemplo
sudo cp nginx.conf.example /etc/nginx/sites-available/innexar

# Editar configuração
sudo nano /etc/nginx/sites-available/innexar
```

Ajuste o `server_name` para seu domínio.

### Passo 3: Habilitar site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/innexar /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Passo 4: Configurar SSL com Let's Encrypt (Opcional)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d innexar.com -d www.innexar.com

# Renovação automática (já configurado pelo certbot)
```

---

## 🔧 Configuração de Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Porta do servidor
PORT=3000

# Ambiente
NODE_ENV=production

# URL base do site
NEXT_PUBLIC_SITE_URL=https://www.innexar.com

# Desabilitar telemetria
NEXT_TELEMETRY_DISABLED=1
```

---

## 🔄 Atualização do Site

### Com Docker

```bash
# Atualizar código
git pull

# Rebuild e reiniciar
docker-compose up -d --build
```

### Com PM2

```bash
# Atualizar código
git pull

# Reinstalar dependências e rebuild
npm ci
npm run build

# Reiniciar
pm2 restart innexar-website
```

### Com systemd

```bash
# Atualizar código
git pull

# Reinstalar dependências e rebuild
npm ci
npm run build

# Reiniciar serviço
sudo systemctl restart innexar-website
```

---

## 🐛 Troubleshooting

### Porta 3000 já está em uso

```bash
# Verificar qual processo está usando a porta
sudo lsof -i :3000

# Ou usar outra porta
PORT=8080 npm start
```

### Erro de permissão

```bash
# Dar permissões corretas
sudo chown -R $USER:$USER /caminho/para/projeto
```

### Aplicação não inicia

```bash
# Verificar logs
pm2 logs innexar-website
# ou
sudo journalctl -u innexar-website -f
# ou
docker-compose logs -f
```

### Build falha

```bash
# Limpar cache e node_modules
rm -rf node_modules .next
npm ci
npm run build
```

---

## 📊 Monitoramento

### Verificar se o site está online

```bash
# Teste local
curl http://localhost:3000

# Teste externo
curl https://www.innexar.com
```

### Verificar uso de recursos

```bash
# Com PM2
pm2 monit

# Com Docker
docker stats

# Geral do sistema
htop
```

---

## 🔒 Segurança

### Firewall (UFW)

```bash
# Permitir apenas portas necessárias
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### Atualizações de segurança

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Atualizar Node.js (se necessário)
# Use nvm ou baixe da versão LTS oficial
```

---

## 📝 Checklist de Deploy

- [ ] Node.js 18+ instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm ci`)
- [ ] Build realizado (`npm run build`)
- [ ] Variáveis de ambiente configuradas (`.env.local`)
- [ ] Aplicação iniciada e rodando
- [ ] Nginx configurado (se usando domínio)
- [ ] SSL configurado (se usando HTTPS)
- [ ] Firewall configurado
- [ ] Monitoramento configurado
- [ ] Backup configurado (opcional)

---

## 🆘 Suporte

Para mais informações:
- [Documentação Next.js](https://nextjs.org/docs/deployment)
- [Documentação Docker](https://docs.docker.com/)
- [Documentação PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)

---

**Última atualização:** Janeiro 2025  
**Versão:** Next.js 16.0.1

