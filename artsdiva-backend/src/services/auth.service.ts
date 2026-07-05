import bcrypt from "bcryptjs";
import type { Role, User } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import type {
  AuthenticatedUser,
  ChangePasswordDTO,
  CreateUserDTO,
  LoginDTO,
  UserSummary,
} from "../types/auth.types";
import type { ListUsersQuery } from "../validators/auth.validator";
import type { PaginatedResponse } from "../types/common.types";

const SALT_ROUNDS = 10;
const active = { isDeleted: false };

export class InvalidCredentialsError extends Error {}
export class EmailAlreadyExistsError extends Error {}
export class UserNotFoundError extends Error {}
export class CannotDeactivateSelfError extends Error {}
export class LastAdminError extends Error {}

// Strips passwordHash before a user is ever returned to a controller.
function toAuthenticatedUser(user: User): AuthenticatedUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function login(
  input: LoginDTO
): Promise<{ token: string; user: AuthenticatedUser }> {
  const user = await prisma.user.findFirst({ where: { email: input.email, ...active } });
  if (!user) {
    throw new InvalidCredentialsError("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new InvalidCredentialsError("Invalid email or password");
  }

  const authUser = toAuthenticatedUser(user);
  const token = signToken({ id: authUser.id, email: authUser.email, role: authUser.role });

  return { token, user: authUser };
}

export async function createUser(input: CreateUserDTO): Promise<AuthenticatedUser> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new EmailAlreadyExistsError("A user with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role as Role,
    },
  });

  return toAuthenticatedUser(user);
}

export async function getUserById(id: string): Promise<AuthenticatedUser> {
  const user = await prisma.user.findFirst({ where: { id, ...active } });
  if (!user) {
    throw new UserNotFoundError("User not found");
  }
  return toAuthenticatedUser(user);
}

export async function listUsers(query: ListUsersQuery): Promise<PaginatedResponse<UserSummary>> {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;

  const where = {
    ...active,
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { email: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function changePassword(userId: string, input: ChangePasswordDTO): Promise<void> {
  const user = await prisma.user.findFirst({ where: { id: userId, ...active } });
  if (!user) {
    throw new UserNotFoundError("User not found");
  }

  const passwordMatches = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!passwordMatches) {
    throw new InvalidCredentialsError("Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, SALT_ROUNDS);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

export async function deactivateUser(id: string, requestingUserId: string): Promise<void> {
  const user = await prisma.user.findFirst({ where: { id, ...active } });
  if (!user) {
    throw new UserNotFoundError("User not found");
  }

  if (user.id === requestingUserId) {
    throw new CannotDeactivateSelfError("You cannot deactivate your own account");
  }

  if (user.role === "ADMIN") {
    const activeAdminCount = await prisma.user.count({ where: { role: "ADMIN", ...active } });
    if (activeAdminCount <= 1) {
      throw new LastAdminError("Cannot deactivate the last remaining admin");
    }
  }

  await prisma.user.update({ where: { id }, data: { isDeleted: true } });
}
