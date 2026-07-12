import jwt from "jsonwebtoken";
import type { JwtPayload } from "../types/auth.types";

const JWT_SECRET_ENV = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

if (!JWT_SECRET_ENV) {
  throw new Error("JWT_SECRET environment variable is not set");
}

// Re-bound to a definite string so callers below don't carry `| undefined`.
const JWT_SECRET: string = JWT_SECRET_ENV;

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
}
