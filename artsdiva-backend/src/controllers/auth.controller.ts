import type { Request, Response } from "express";
import * as authService from "../services/auth.service";
import type { ChangePasswordDTO, CreateUserDTO, LoginDTO } from "../types/auth.types";
import type { ListUsersQuery } from "../validators/auth.validator";

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const input = req.body as LoginDTO;

  try {
    const { token, user } = await authService.login(input);

    // Token goes in the response body, not a cookie -- the client stores it
    // (localStorage) and sends it back as `Authorization: Bearer <token>`.
    // See docs/DEPLOYMENT.md for why: cross-domain cookies get silently
    // dropped by iOS Safari and Chrome Incognito's third-party-cookie
    // blocking, regardless of SameSite/Secure settings.
    res.status(200).json({ user, token });
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
  // Nothing to clear server-side -- the token lives in the client's
  // localStorage; the frontend deletes it on logout.
  res.status(200).json({ message: "Logged out" });
}
