import { apiRequest, buildQueryString } from "@artsdiva/api/http";
import type { PaginatedResponse } from "@artsdiva/types/common.types";
import type {
  AuthenticatedUser,
  ChangePasswordDTO,
  CreateUserDTO,
  ListUsersParams,
  LoginDTO,
  LoginResponse,
  MeResponse,
  UserSummary,
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

export function getUsers(params?: ListUsersParams): Promise<PaginatedResponse<UserSummary>> {
  return apiRequest<PaginatedResponse<UserSummary>>(`/api/auth/users${buildQueryString(params)}`);
}

export async function changePassword(payload: ChangePasswordDTO): Promise<void> {
  await apiRequest<{ message: string }>("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deactivateUser(id: string): Promise<void> {
  await apiRequest<{ message: string }>(`/api/auth/users/${id}/deactivate`, { method: "PATCH" });
}
