# Dockerfile para Innexar Website
# Build multi-stage para otimizar tamanho da imagem

# Stage dev: desenvolvimento com volume e next dev
FROM node:20-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 3000
ENV HOSTNAME=0.0.0.0
CMD ["npm", "run", "dev"]

# Stage 1: Build (usa cache de dependências e .next para rebuilds mais rápidos)
FROM node:20-alpine AS builder

WORKDIR /app

# Dependências primeiro (cache layer)
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit

# Código e build (Next 16 usa Turbopack por padrão = build mais rápido)
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# Cria usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia arquivos necessários do builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["node", "server.js"]

