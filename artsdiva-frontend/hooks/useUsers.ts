import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changePassword, createUser, deactivateUser, getUsers } from "@artsdiva/api/auth.api";
import type { ChangePasswordDTO, CreateUserDTO, ListUsersParams } from "@artsdiva/types/auth.types";

export const USERS_KEY = "users";

export function useUsers(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: [USERS_KEY, "list", params],
    queryFn: () => getUsers(params),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserDTO) => createUser(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: [USERS_KEY] }); },
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateUser(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: [USERS_KEY] }); },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordDTO) => changePassword(data),
  });
}
