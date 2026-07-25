FROM node:20-alpine AS builder
WORKDIR /app

# OpenSSL requis par Prisma sur Alpine
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# OpenSSL requis par Prisma au runtime
RUN apk add --no-cache openssl

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Donner les permissions sur node_modules ET uploads à appuser
RUN chown -R appuser:appgroup /app/node_modules && \
    mkdir -p uploads && \
    chown appuser:appgroup uploads

USER appuser
EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]