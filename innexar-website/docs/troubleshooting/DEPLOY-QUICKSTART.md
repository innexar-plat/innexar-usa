# ⚡ Deploy Rápido - Innexar Website

## 🐳 Método Docker (Mais Fácil)

```bash
# 1. Clonar repositório
git clone https://github.com/viniciussvasques/site-innexar.git
cd site-innexar/innexar-website

# 2. Deploy
docker-compose up -d --build

# 3. Verificar
curl http://localhost:3000
```

## 🚀 Método Script Automatizado

```bash
# 1. Clonar repositório
git clone https://github.com/viniciussvasques/site-innexar.git
cd site-innexar/innexar-website

# 2. Dar permissão e executar
chmod +x deploy.sh
./deploy.sh pm2  # ou: docker, systemd
```

## 📋 Pré-requisitos Mínimos

- Node.js 18+
- Docker (para método Docker)
- Git

## 🔗 Links Úteis

- **Guia Completo:** [DEPLOY.md](./DEPLOY.md)
- **Repositório:** https://github.com/viniciussvasques/site-innexar

---

Para mais detalhes, consulte o [guia completo de deploy](./DEPLOY.md).

