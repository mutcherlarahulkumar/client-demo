import type { Request, Response } from "express";
import { AUTH_COOKIE_NAME } from "../lib/jwt";
import * as authService from "../services/auth.service";
import type { ChangePasswordDTO, CreateUserDTO, LoginDTO } from "../types/auth.types";
import type { ListUsersQuery } from "../validators/auth.validator";

const isProduction = process.env.NODE_ENV === "production";
// Mirrors JWT_EXPIRES_IN's default so the cookie doesn't outlive the token.
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// COOKIE_DOMAIN should be the shared apex/parent domain of the frontend and
// backend (e.g. ".bharatbytetech.com" if the frontend is
// artsdiva.bharatbytetech.com and the backend is api.bharatbytetech.com).
// When set, the cookie is first-party from the browser's perspective, so
// SameSite=Lax works everywhere -- including iOS Safari and Chrome
// Incognito, both of which block SameSite=None third-party cookies. Without
// it (e.g. frontend/backend on totally unrelated domains, or local dev),
// we fall back to SameSite=None so cross-site auth still functions, but
// this fallback is best-effort only -- see docs/DEPLOYMENT.md.
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
const COOKIE_SAME_SITE = !isProduction ? "lax" : COOKIE_DOMAIN ? "lax" : "none";

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as LoginDTO;

  try {
    const { token, user } = await authService.login(input);

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: COOKIE_SAME_SITE,
      maxAge: COOKIE_MAX_AGE_MS,
      domain: COOKIE_DOMAIN,
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

export async function listUsersHandler(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListUsersQuery;
  const result = await authService.listUsers(query);
  res.status(200).json(result);
}

export async function changePasswordHandler(req: Request, res: Response): Promise<void> {
  const { id } = req.user as NonNullable<Request["user"]>;
  const input = req.body as ChangePasswordDTO;

  try {
    await authService.changePassword(id, input);
    res.status(200).json({ message: "Password changed" });
  } catch (err) {
    if (err instanceof authService.InvalidCredentialsError) {
      res.status(401).json({ message: err.message });
      return;
    }
    if (err instanceof authService.UserNotFoundError) {
      res.status(404).json({ message: err.message });
      return;
    }
    throw err;
  }
}

export async function deactivateUserHandler(req: Request, res: Response): Promise<void> {
  const { id: requestingUserId } = req.user as NonNullable<Request["user"]>;

  try {
    await authService.deactivateUser(req.params.id as string, requestingUserId);
    res.status(200).json({ message: "User deactivated" });
  } catch (err) {
    if (err instanceof authService.UserNotFoundError) {
      res.status(404).json({ message: err.message });
      return;
    }
    if (
      err instanceof authService.CannotDeactivateSelfError ||
      err instanceof authService.LastAdminError
    ) {
      res.status(400).json({ message: err.message });
      return;
    }
    throw err;
  }
}

export function logoutHandler(_req: Request, res: Response): void {
  // Must match the attributes the cookie was set with, or some browsers
  // won't recognize it as the same cookie to clear.
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: COOKIE_SAME_SITE,
    domain: COOKIE_DOMAIN,
  });
  res.status(200).json({ message: "Logged out" });
}
