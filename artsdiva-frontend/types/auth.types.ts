export type Role = "ADMIN" | "STAFF";

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
  token: string;
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
  createdAt: string;
}

export interface ListUsersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
