import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import { MulterError } from "multer";
import { prisma } from "./lib/prisma";
import authRoutes from "./routes/auth.routes";
import artistRoutes from "./routes/artist.routes";
import artworkRoutes from "./routes/artwork.routes";
import clientRoutes from "./routes/client.routes";
import leaseRoutes from "./routes/lease.routes";
import searchRoutes from "./routes/search.routes";
import documentRoutes from "./routes/document.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

// ---------------------------------------------------------------------------
// Request logger — logs every request with method, path, status, and timing.
// Runs before routes so all responses are captured.
// ---------------------------------------------------------------------------
app.use((req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, url } = req;

  res.on("finish", () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? "ERROR" : res.statusCode >= 400 ? "WARN" : "INFO";
    // eslint-disable-next-line no-console
    console.log(
      `[${new Date().toISOString()}] ${level} ${method} ${url} → ${res.statusCode} (${ms}ms)`
    );
  });

  next();
});

// ---------------------------------------------------------------------------
// CORS — open to any origin. Auth is a Bearer token (see auth.middleware.ts),
// not a cookie, so there's no credentialed-cookie/CORS interaction to lock
// down here the way there would be with cookie auth.
// ---------------------------------------------------------------------------
app.use(cors({ origin: "*" }));
app.use(express.json());

// ---------------------------------------------------------------------------
// Health endpoints
// ---------------------------------------------------------------------------
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.get("/health/db", async (_req: Request, res: Response) => {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    res.json({ status: "ok", db: "up" });
  } catch (err) {
    res.status(503).json({ status: "error", db: "down", message: (err as Error).message });
  }
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/artworks", artworkRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ---------------------------------------------------------------------------
// Central error handler
// ---------------------------------------------------------------------------
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large"
        : err.code === "LIMIT_UNEXPECTED_FILE"
          ? "Unsupported file type"
          : "Upload failed";
    res.status(400).json({ message });
    return;
  }

  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;

  // eslint-disable-next-line no-console
  console.error(
    `[${new Date().toISOString()}] UNCAUGHT ${req.method} ${req.url}\n` +
    `  Error: ${message}\n` +
    (stack ? `  Stack: ${stack}` : "")
  );

  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] ArtsDiva API listening on port ${PORT}`);
});
