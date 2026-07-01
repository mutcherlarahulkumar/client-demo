import { apiRequest } from "@artsdiva/api/http";
import type {
  AuthenticatedUser,
  CreateUserDTO,
  LoginDTO,
  LoginResponse,
  MeResponse,
} from "@artsdiva/types/auth.types";

export function login(payload: LoginDTO): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  const { user } = await apiRequest<MeResponse>("/api/auth/me", { method: "GET" });
  return user;
}

export async function createUser(payload: CreateUserDTO): Promise<AuthenticatedUser> {
  const { user } = await apiRequest<{ user: AuthenticatedUser }>("/api/auth/create-user", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return user;
}

export async function logout(): Promise<void> {
  await apiRequest<{ message: string }>("/api/auth/logout", { method: "POST" });
}
