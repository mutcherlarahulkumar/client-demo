import bcrypt from "bcryptjs";
import type { Role, User } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import type { AuthenticatedUser, CreateUserDTO, LoginDTO } from "../types/auth.types";

const SALT_ROUNDS = 10;

export class InvalidCredentialsError extends Error {}
export class EmailAlreadyExistsError extends Error {}
export class UserNotFoundError extends Error {}

// Strips passwordHash before a user is ever returned to a controller.
function toAuthenticatedUser(user: User): AuthenticatedUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function login(
  input: LoginDTO
): Promise<{ token: string; user: AuthenticatedUser }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
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
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new UserNotFoundError("User not found");
  }
  return toAuthenticatedUser(user);
}
