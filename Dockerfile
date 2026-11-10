# ==============================================================================
# ESTÁGIO 1: Build do Frontend (Vite + React + TypeScript)
# ==============================================================================
FROM node:22-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ==============================================================================
# ESTÁGIO 2: Build das Dependências Nativas de Produção do Backend (better-sqlite3)
# ==============================================================================
FROM node:22-alpine AS server-deps
WORKDIR /app/server

RUN apk add --no-cache python3 make g++

COPY server/package*.json ./
RUN npm ci --omit=dev

# ==============================================================================
# ESTÁGIO 3: Compilação TypeScript do Backend
# ==============================================================================
FROM node:22-alpine AS server-builder
WORKDIR /app/server

RUN apk add --no-cache python3 make g++

COPY server/package*.json ./
RUN npm ci

COPY server/ ./
RUN npm run build

# ==============================================================================
# ESTÁGIO 4: Imagem Final de Execução (Runtime Ultraleve e Seguro)
# ==============================================================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5173
ENV ALT_PORT=5000
ENV DB_PATH=/app/data/shark_tank.db

# Diretório para persistência do banco de dados SQLite
RUN mkdir -p /app/data && chown -R node:node /app

COPY --from=server-deps /app/server/node_modules /app/server/node_modules
COPY --from=server-builder /app/server/dist /app/server/dist
COPY server/package*.json /app/server/
COPY --from=client-builder /app/client/dist /app/client/dist

USER node
EXPOSE 5173 5000

VOLUME ["/app/data"]

WORKDIR /app/server
CMD ["node", "dist/server.js"]
