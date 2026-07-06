# syntax=docker/dockerfile:1

# Debian slim (glibc), not Alpine (musl) -- Prisma's Rust query engine has a
# known TLS handshake incompatibility with MongoDB Atlas's connection proxy
# on musl libc, surfacing as "fatal alert: InternalError" / server selection
# timeouts against every shard member even with network access wide open.

# ---- build stage ---------------------------------------------------------
FROM node:20-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
# Prisma schema must exist before install — the postinstall hook runs
# `prisma generate` automatically, and needs prisma/schema.prisma present.
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- runtime stage -------------------------------------------------------
FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production

# All deps are copied (Prisma CLI is used by the entrypoint for `db push`).
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/package.json ./
COPY --from=build /app/tsconfig.json ./
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 4000
ENTRYPOINT ["./docker-entrypoint.sh"]
