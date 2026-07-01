# syntax=docker/dockerfile:1

# ---- build stage ---------------------------------------------------------
FROM node:20-alpine AS build
# Prisma needs openssl on Alpine.
RUN apk add --no-cache openssl
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma generate && pnpm build

# ---- runtime stage -------------------------------------------------------
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production

# All deps are copied (Prisma CLI is used by the entrypoint for `db push`).
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package.json ./
COPY --from=build /app/tsconfig.json ./
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
