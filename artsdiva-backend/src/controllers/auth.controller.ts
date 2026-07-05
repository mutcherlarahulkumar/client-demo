import type { Request, Response } from "express";
import { AUTH_COOKIE_NAME } from "../lib/jwt";
import * as authService from "../services/auth.service";
import type { ChangePasswordDTO, CreateUserDTO, LoginDTO } from "../types/auth.types";
import type { ListUsersQuery } from "../validators/auth.validator";

const isProduction = process.env.NODE_ENV === "production";
// Mirrors JWT_EXPIRES_IN's default so the cookie doesn't outlive the token.
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// Frontend and backend are on different domains in production (Vercel /
// Render, or any two hosts without a shared apex domain) -- SameSite=None
// is required for the browser to send the cookie on cross-site fetch()
// calls, which in turn requires Secure. Locally, frontend/backend are both
// "localhost" (same-site regardless of port), so Lax + non-Secure is fine
// over plain http. If frontend and backend ever share an apex domain
// (app.example.com / api.example.com), Lax works there too and is the
// safer default -- swap this back if/when that's set up.
const COOKIE_SAME_SITE = isProduction ? "none" : "lax";

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as LoginDTO;

  try {
    const { token, user } = await authService.login(input);

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: COOKIE_SAME_SITE,
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
  });
  res.status(200).json({ message: "Logged out" });
}
