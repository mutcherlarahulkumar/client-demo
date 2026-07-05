import type { Role } from "@prisma/client";

export interface LoginDTO {
  email: string;
  password: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  user: AuthenticatedUser;
}

export interface CreateUserResponse {
  user: AuthenticatedUser;
}

export interface MeResponse {
  user: AuthenticatedUser;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}
