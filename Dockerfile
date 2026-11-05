# ==============================================================================
# ESTÁGIO 1: Build do Frontend (Vite + React)
# ==============================================================================
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ==============================================================================
# ESTÁGIO 2: Build das Dependências Nativas do Backend (better-sqlite3)
# ==============================================================================
FROM node:20-alpine AS server-deps
WORKDIR /app/server

# Ferramentas nativas de compilação C++ necessárias para compilar o better-sqlite3 em Alpine
RUN apk add --no-cache python3 make g++

COPY server/package*.json ./
RUN npm ci --omit=dev

# ==============================================================================
# ESTÁGIO 3: Imagem Final de Execução (Runtime Seguro e Ultraleve)
# ==============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5173
ENV DB_PATH=/app/data/shark_tank.db

# Diretório para o volume persistente do SQLite
RUN mkdir -p /app/data && chown -R node:node /app

COPY --from=server-deps /app/server/node_modules /app/server/node_modules
COPY server/ /app/server/
COPY --from=client-builder /app/client/dist /app/client/dist

# Execução com usuário sem privilégios de root por segurança
USER node
EXPOSE 5173

VOLUME ["/app/data"]

WORKDIR /app/server
CMD ["node", "src/index.js"]
