import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./lib/prisma";

// ---------------------------------------------------------------------------
// Phase 1 scaffold bootstrap.
// This is infrastructure only (health checks + middleware wiring). The real
// route -> controller -> service layers are added once the data model is
// approved. See README "Planned structure".
// ---------------------------------------------------------------------------

const app = express();
const PORT = Number(process.env.PORT ?? 4000);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Liveness — process is up.
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Readiness — database is reachable.
app.get("/health/db", async (_req: Request, res: Response) => {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    res.json({ status: "ok", db: "up" });
  } catch (err) {
    res
      .status(503)
      .json({ status: "error", db: "down", message: (err as Error).message });
  }
});

// TODO(Phase 1): mount /api/auth, /api/artworks, /api/artists,
// /api/clients, /api/leases here.

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`ArtsDiva API listening on http://localhost:${PORT}`);
});
