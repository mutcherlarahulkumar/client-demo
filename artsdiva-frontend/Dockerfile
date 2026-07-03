# syntax=docker/dockerfile:1

# ---- build stage ---------------------------------------------------------
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Public API base URL is inlined into the client bundle at build time.
ARG NEXT_PUBLIC_API_URL="http://localhost:4000"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm build

# ---- runtime stage -------------------------------------------------------
FROM node:20-alpine AS runner
RUN corepack enable
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Not using Next's "standalone" output here — that mode is meant for a
# self-hosted runtime, but this app is deployed to Vercel in production
# (which does its own build/serve and doesn't want "standalone" set).
# This Dockerfile is only for local `docker compose up`.
COPY --from=build /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./

EXPOSE 3000
CMD ["pnpm", "start"]
