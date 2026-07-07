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

## Production deploy (Vercel + Render)

Frontend on **Vercel**, backend on **Render**, database on **MongoDB Atlas**,
images on **Vercel Blob**. All three platforms auto-deploy on every push to
`main` natively — no GitHub Actions needed. Examples below use
`artsdiva.com` as a placeholder domain; swap in your real one.

Both frontend and backend sit under the **same apex domain**
(`app.artsdiva.com` / `api.artsdiva.com`), which is why no code changes were
needed: the auth cookie is same-site (`sameSite: "lax"`) as long as they
share a registrable domain, so it just works across the two subdomains.

### 1. Database — MongoDB Atlas

- Create a free account → free **M0** cluster.
- Database Access → create a DB user (username/password).
- Network Access → allow `0.0.0.0/0` (Render's IPs aren't static on free/starter plans).
- Copy the `mongodb+srv://...` connection string — that's `DATABASE_URL`.

### 2. Backend — Render

- New → **Web Service** → connect this repo → set **Root Directory** to
  `artsdiva-backend`.
- Runtime: **Docker** (it'll pick up `artsdiva-backend/Dockerfile` — the
  same image used locally, entrypoint runs `prisma db push` + the idempotent
  seed on every deploy, no separate migration step).
- Health check path: `/health`.
- Environment variables (Render → Environment):

  | Key | Value |
  | --- | --- |
  | `DATABASE_URL` | Atlas connection string |
  | `JWT_SECRET` | long random string |
  | `JWT_EXPIRES_IN` | `7d` |
  | `NODE_ENV` | `production` |
  | `PORT` | `4000` |
  | `AZURE_STORAGE_CONNECTION_STRING` | from Azure Storage account (step 4) |
  | `AZURE_STORAGE_CONTAINER_NAME` | `images` |
  | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | your first admin login |

- Once it's deployed, Render gives you a `*.onrender.com` URL first — add
  your **custom domain** `api.artsdiva.com` in Render's settings, then point
  a CNAME at the hostname Render gives you.
- CORS is currently wide open (any origin, reflected per-request since
  `credentials: true` rules out a literal `*`) — no `CLIENT_ORIGIN` env var
  needed. Trade-off accepted for this internal tool; tighten to an
  allowlist in `src/server.ts` if this ever becomes public-facing.

### 3. Frontend — Vercel

- New Project → import this repo → set **Root Directory** to
  `artsdiva-frontend` (Vercel auto-detects Next.js, ignores the Dockerfile).
- Environment variable:

  | Key | Value |
  | --- | --- |
  | `NEXT_PUBLIC_API_URL` | `https://api.artsdiva.com` |

- Add your **custom domain** `app.artsdiva.com` in Vercel's project settings,
  then point a CNAME at the hostname Vercel gives you.

### 4. Image storage — Azure Blob Storage

- In the Azure Portal: create a **Storage account**, then a container named
  `images` inside it (the backend also creates it automatically on first
  upload if missing, with anonymous **blob-level** read access — individual
  files are reachable by their direct URL, but the container can't be
  listed/browsed).
- Copy the account's **connection string** (Storage account → Access keys)
  into Render's env vars as `AZURE_STORAGE_CONNECTION_STRING` (step 2) — the
  backend uploads directly to Azure Blob Storage over HTTPS, so this works
  regardless of where the backend itself is hosted. The connection string
  contains the account key — treat it as a secret, never commit it or paste
  it anywhere outside Render's env var UI, and rotate the key in Azure
  (Access keys → Regenerate) if it's ever exposed.

### 5. Verify

- `https://api.artsdiva.com/health` and `/health/db` → `{"status":"ok"}`.
- `https://app.artsdiva.com` → login page, sign in with the seeded admin.

From here, every push to `main` rebuilds and redeploys both services
automatically — no manual step required.
