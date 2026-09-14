# ==============================================================================
# Multi-stage Dockerfile for @angelitosystems/nest-auth
# ==============================================================================

# --- Stage 1: Base & Dependencies ---
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
COPY packages/core/package*.json ./packages/core/
COPY packages/cli/package*.json ./packages/cli/
COPY packages/prisma/package*.json ./packages/prisma/
COPY packages/typeorm/package*.json ./packages/typeorm/
COPY packages/sequelize/package*.json ./packages/sequelize/
COPY packages/mongoose/package*.json ./packages/mongoose/
COPY docs-web/package*.json ./docs-web/
RUN npm install --ignore-scripts

# --- Stage 2: Builder ---
FROM base AS builder
WORKDIR /app
COPY . .
RUN npx prisma generate --schema=./packages/prisma/prisma/schema.prisma
RUN npm run build

# --- Stage 3: Runner ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["node", "packages/cli/bin/nest-auth-kit.js", "info"]
