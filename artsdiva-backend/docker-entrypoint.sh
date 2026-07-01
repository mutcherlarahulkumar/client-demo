#!/bin/sh
set -e

# Sync the Prisma schema (collections + indexes) to MongoDB. Idempotent, so it
# is safe to run on every start in this dev/compose setup. For production you
# would run this as a separate migration step rather than at container start.
echo "[entrypoint] Syncing Prisma schema to MongoDB..."
node_modules/.bin/prisma db push --skip-generate --accept-data-loss || \
  echo "[entrypoint] WARNING: prisma db push failed; starting server anyway."

# Idempotent — the seed script itself skips creation if the admin email
# already exists. Only runs when both vars are actually provided.
if [ -n "$SEED_ADMIN_EMAIL" ] && [ -n "$SEED_ADMIN_PASSWORD" ]; then
  echo "[entrypoint] Running admin seed..."
  node_modules/.bin/ts-node prisma/seed.ts || \
    echo "[entrypoint] WARNING: seed script failed; starting server anyway."
fi

echo "[entrypoint] Starting ArtsDiva API..."
exec node dist/server.js
