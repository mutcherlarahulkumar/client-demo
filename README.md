# ArtsDiva IMS

Inventory & Relationship Management System — internal app for ArtsDiva staff.

- **`artsdiva-backend/`** — Node.js + TypeScript + Express + Prisma (MongoDB).
- **`artsdiva-frontend/`** — Next.js (Pages Router) + Tailwind.
- **`docker-compose.yml`** — full local stack (Mongo replica set + backend + frontend).

> **Status:** Phase 1 scaffold. The Prisma data model is in place and the stack
> boots (health checks only). CRUD / auth modules are the next step.

## Run the whole stack with Docker

```bash
cp .env.example .env        # set JWT_SECRET
docker compose up --build
```

Then:

- Frontend → http://localhost:3000
- Backend  → http://localhost:4000/health and http://localhost:4000/health/db
- MongoDB  → localhost:27017 (replica set `rs0`)

Startup order is handled automatically: `mongo` → `mongo-init` (initiates the
replica set) → `backend` (runs `prisma db push`, then the API) → `frontend`.

Tear down (and wipe the database volume):

```bash
docker compose down -v
```

## Why a replica set?

Prisma's MongoDB connector requires a replica set (it uses transactions).
`mongo-init` initialises a single-node replica set `rs0` on first boot; the
`mongo_data` named volume persists it across restarts.

## Run without Docker

See [`artsdiva-backend/README.md`](./artsdiva-backend/README.md) and
[`artsdiva-frontend/README.md`](./artsdiva-frontend/README.md). You still need a
MongoDB replica set — either the compose `mongo` service or MongoDB Atlas —
pointed at by `DATABASE_URL`.
