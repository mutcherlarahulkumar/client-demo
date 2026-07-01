# ArtsDiva IMS — Backend

Node.js + TypeScript + Express + Prisma (MongoDB connector).

> **Status:** Phase 1 scaffold. Currently contains the **Prisma schema only**
> (data model under review). Routes / controllers / services / auth are not yet
> implemented — see [Planned structure](#planned-structure).

## Requirements

- Node.js 20+
- pnpm
- A MongoDB **replica set** (MongoDB Atlas works out of the box; local `mongod`
  must be started with `--replSet` — Prisma's Mongo connector requires it).

## Setup

```bash
pnpm install
cp .env.example .env   # then fill in DATABASE_URL + JWT_SECRET
pnpm prisma:generate   # generate the typed Prisma client
```

Once a real `DATABASE_URL` (replica set) is configured:

```bash
pnpm prisma:push       # sync schema/indexes to MongoDB
pnpm seed              # create the initial admin user (script TBD)
pnpm dev               # start the API (script targets src/server.ts — TBD)
```

## Scripts

| Script                  | Purpose                                             |
| ----------------------- | --------------------------------------------------- |
| `pnpm prisma:validate`  | Validate `prisma/schema.prisma`                     |
| `pnpm prisma:generate`  | Generate the typed Prisma client                    |
| `pnpm prisma:push`      | Push schema + indexes to MongoDB                    |
| `pnpm prisma:studio`    | Open Prisma Studio                                  |
| `pnpm seed`             | Seed the initial admin user (to be added)           |
| `pnpm dev`              | Run the dev server with reload (to be added)        |
| `pnpm build` / `start`  | Compile to `dist/` and run                          |

## Environment variables

See [.env.example](./.env.example). Key values: `DATABASE_URL`, `JWT_SECRET`,
`JWT_EXPIRES_IN`, `PORT`, `CLIENT_ORIGIN`.

## Planned structure

Layered pattern — `route → controller → service → prisma`. To be built once the
data model is approved (folder paths open to confirmation):

```
src/
  server.ts              # express bootstrap
  lib/prisma.ts          # PrismaClient singleton
  middleware/            # auth (JWT), role guard, error handler, validate
  routes/                # auth / artwork / artist / client / lease routes
  controllers/           # request/response handling per module
  services/              # business logic + prisma access per module
  validators/            # zod schemas per module
  types/                 # shared DTO / payload / response types
prisma/
  schema.prisma          # <-- data model (this scaffold)
  seed.ts                # initial admin user (to be added)
```
