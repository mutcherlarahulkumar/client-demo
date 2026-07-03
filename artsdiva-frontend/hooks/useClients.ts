import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClients, getClientById, createClient, updateClient, deleteClient } from "@artsdiva/api/client.api";
import type { CreateClientDTO, ListClientsParams, UpdateClientDTO } from "@artsdiva/types/client.types";

export const CLIENTS_KEY = "clients";

export function useClients(params: ListClientsParams = {}) {
  return useQuery({
    queryKey: [CLIENTS_KEY, "list", params],
    queryFn: () => getClients(params),
  });
}

export function useClient(id?: string) {
  return useQuery({
    queryKey: [CLIENTS_KEY, "detail", id],
    queryFn: () => getClientById(id!),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientDTO) => createClient(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: [CLIENTS_KEY] }); },
  });
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateClientDTO) => updateClient(id, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: [CLIENTS_KEY] }); },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: [CLIENTS_KEY] }); },
  });
}
