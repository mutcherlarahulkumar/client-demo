#!/bin/sh
set -e

# Sync the Prisma schema (collections + indexes) to MongoDB. Idempotent, so it
# is safe to run on every start in this dev/compose setup. For production you
# would run this as a separate migration step rather than at container start.
echo "[entrypoint] Syncing Prisma schema to MongoDB..."
node_modules/.bin/prisma db push --skip-generate --accept-data-loss || \
  echo "[entrypoint] WARNING: prisma db push failed; starting server anyway."

echo "[entrypoint] Starting ArtsDiva API..."
exec node dist/server.js
