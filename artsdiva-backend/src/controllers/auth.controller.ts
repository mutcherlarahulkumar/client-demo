import type { Request, Response } from "express";
import { AUTH_COOKIE_NAME } from "../lib/jwt";
import * as authService from "../services/auth.service";
import type { CreateUserDTO, LoginDTO } from "../types/auth.types";

const isProduction = process.env.NODE_ENV === "production";
// Mirrors JWT_EXPIRES_IN's default so the cookie doesn't outlive the token.
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as LoginDTO;

  try {
    const { token, user } = await authService.login(input);

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE_MS,
    });

    res.status(200).json({ user });
  } catch (err) {
    if (err instanceof authService.InvalidCredentialsError) {
      res.status(401).json({ message: err.message });
      return;
    }
    throw err;
  }
}

export async function createUserHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as CreateUserDTO;

  try {
    const user = await authService.createUser(input);
    res.status(201).json({ user });
  } catch (err) {
    if (err instanceof authService.EmailAlreadyExistsError) {
      res.status(409).json({ message: err.message });
      return;
    }
    throw err;
  }
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  // authenticate middleware guarantees req.user is set before this runs.
  const { id } = req.user as NonNullable<Request["user"]>;

  try {
    const user = await authService.getUserById(id);
    res.status(200).json({ user });
  } catch (err) {
    if (err instanceof authService.UserNotFoundError) {
      res.status(404).json({ message: err.message });
      return;
    }
    throw err;
  }
}

export function logoutHandler(_req: Request, res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.status(200).json({ message: "Logged out" });
}
