import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
import { verifyToken } from "../lib/jwt";

// Auth is a bearer token in the Authorization header (client stores it in
// localStorage), not a cookie -- avoids third-party-cookie blocking on iOS
// Safari / Chrome Incognito entirely, since it's not a cookie at all. See
// docs/DEPLOYMENT.md for the trade-off (token is JS-readable, unlike an
// httpOnly cookie).
function extractToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length);
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired session" });
  }
}

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden: insufficient role" });
      return;
    }

    next();
  };
}
