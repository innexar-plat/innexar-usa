#!/bin/bash

# Script de deploy para servidor Linux
# Uso: ./deploy.sh [opção]
# Opções: docker, pm2, systemd

set -e

echo "🚀 Innexar Website - Script de Deploy"
echo "======================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar Node.js
if ! command_exists node; then
    echo -e "${RED}❌ Node.js não encontrado. Instale Node.js 18+ primeiro.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js versão 18+ é necessária. Versão atual: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) encontrado${NC}"

# Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
npm ci --production=false

# Build da aplicação
echo -e "${YELLOW}🔨 Construindo aplicação...${NC}"
npm run build

# Escolher método de deploy
DEPLOY_METHOD=${1:-pm2}

case $DEPLOY_METHOD in
    docker)
        echo -e "${YELLOW}🐳 Deploy com Docker...${NC}"
        if ! command_exists docker; then
            echo -e "${RED}❌ Docker não encontrado. Instale Docker primeiro.${NC}"
            exit 1
        fi
        
        docker-compose down 2>/dev/null || true
        docker-compose up -d --build
        echo -e "${GREEN}✅ Deploy com Docker concluído!${NC}"
        echo -e "${GREEN}🌐 Site disponível em: http://localhost:3000${NC}"
        ;;
    
    pm2)
        echo -e "${YELLOW}⚙️  Deploy com PM2...${NC}"
        if ! command_exists pm2; then
            echo -e "${YELLOW}📦 Instalando PM2...${NC}"
            npm install -g pm2
        fi
        
        pm2 stop innexar-website 2>/dev/null || true
        pm2 delete innexar-website 2>/dev/null || true
        pm2 start npm --name "innexar-website" -- start
        pm2 save
        
        echo -e "${GREEN}✅ Deploy com PM2 concluído!${NC}"
        echo -e "${GREEN}🌐 Site disponível em: http://localhost:3000${NC}"
        echo -e "${YELLOW}💡 Comandos úteis:${NC}"
        echo -e "   pm2 status          - Ver status"
        echo -e "   pm2 logs            - Ver logs"
        echo -e "   pm2 restart innexar-website - Reiniciar"
        ;;
    
    systemd)
        echo -e "${YELLOW}⚙️  Deploy com systemd...${NC}"
        echo -e "${YELLOW}📝 Criando serviço systemd...${NC}"
        
        SERVICE_FILE="/etc/systemd/system/innexar-website.service"
        CURRENT_DIR=$(pwd)
        USER=$(whoami)
        
        sudo tee $SERVICE_FILE > /dev/null <<EOF
[Unit]
Description=Innexar Website
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$CURRENT_DIR
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF
        
        sudo systemctl daemon-reload
        sudo systemctl enable innexar-website
        sudo systemctl restart innexar-website
        
        echo -e "${GREEN}✅ Deploy com systemd concluído!${NC}"
        echo -e "${GREEN}🌐 Site disponível em: http://localhost:3000${NC}"
        echo -e "${YELLOW}💡 Comandos úteis:${NC}"
        echo -e "   sudo systemctl status innexar-website - Ver status"
        echo -e "   sudo systemctl logs -f innexar-website - Ver logs"
        echo -e "   sudo systemctl restart innexar-website - Reiniciar"
        ;;
    
    *)
        echo -e "${RED}❌ Método de deploy inválido: $DEPLOY_METHOD${NC}"
        echo -e "${YELLOW}Uso: ./deploy.sh [docker|pm2|systemd]${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"

