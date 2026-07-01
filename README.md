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

## Production deploy (GitHub Actions → self-hosted Docker VM)

[`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) builds both
images, pushes them to GHCR (`ghcr.io/<you>/artsdiva-backend` /
`-frontend`), then SSHes into your Docker host and runs
[`docker-compose.prod.yml`](./docker-compose.prod.yml) (pulls the new images,
no build on the server). Prisma schema changes apply automatically — the
backend's entrypoint runs `prisma db push` on every restart.

This targets a plain SSH-reachable Docker host — e.g. an Oracle Cloud
Always-Free **Ampere A1** VM (per [this
approach](https://gist.github.com), 4 OCPU / 24GB is the free shape that can
actually run backend + frontend together) — plus a **MongoDB Atlas** free
tier cluster for the database. I can't provision either of these for you
(they require your own cloud accounts), but here's exactly what to set up:

### 1. Provision the Docker host

- Create an Oracle Cloud account and provision an Always-Free **Ampere A1**
  compute instance (Ubuntu image), following Oracle's console or a Terraform
  script such as the one in the article you shared. (Any other SSH-reachable
  Linux box works too — Oracle isn't required.)
- Install Docker Engine + the Compose plugin on it:

  ```bash
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER   # log out/in after this
  ```

- Open inbound ports **3000** (frontend), **4000** (backend), and **22**
  (SSH) in both the OCI security list/NSG *and* the VM's local firewall
  (`ufw allow 3000,4000,22/tcp` or equivalent).
- Make sure an SSH keypair can log into that VM — either reuse the one
  Terraform generated, or add your own public key to
  `~/.ssh/authorized_keys` for the deploy user.

### 2. Provision the database

- Create a free MongoDB Atlas account → free **M0** cluster.
- Create a database user (username/password).
- Network Access → allow `0.0.0.0/0` (or just the VM's static IP, tighter).
- Copy the `mongodb+srv://...` connection string — that's your
  `DATABASE_URL`.

### 3. Add these GitHub repo secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret               | Value                                                        |
| -------------------- | ------------------------------------------------------------ |
| `SSH_HOST`           | Public IP/hostname of the Docker host                        |
| `SSH_USER`           | SSH username on that host (e.g. `ubuntu`)                     |
| `SSH_PORT`           | Only if not `22`                                              |
| `SSH_PRIVATE_KEY`    | Private key matching an `authorized_keys` entry on the host   |
| `DATABASE_URL`       | Atlas `mongodb+srv://...` connection string                   |
| `JWT_SECRET` | Long random string for signing JWTs |
| `JWT_EXPIRES_IN` | Optional, e.g. `7d` |
| `CLIENT_ORIGIN` | Public frontend URL, e.g. `http://<VM_IP>:3000` (CORS) |
| `PUBLIC_API_URL` | Public backend URL, e.g. `http://<VM_IP>:4000` (baked into the frontend build as `NEXT_PUBLIC_API_URL`) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` | Optional — auto-creates the initial admin on first deploy (skipped if it already exists) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token — needed for Artwork image uploads (`POST /api/artworks/:id/images`) |

No registry secret is needed — the workflow pushes to GHCR using the
built-in `GITHUB_TOKEN`, and the images are public so the VM can `docker pull`
with no login.

### 4. One-time: make the GHCR packages public

`GITHUB_TOKEN` can publish packages but can't change their visibility. After
the **first** successful workflow run:
GitHub profile → **Packages** → `artsdiva-backend` / `artsdiva-frontend` →
Package settings → change visibility to **Public**.

After that, every push to `main` builds, pushes, and redeploys both
services automatically.
