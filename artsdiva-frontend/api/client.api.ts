import { apiRequest, buildQueryString } from "@artsdiva/api/http";
import type { PaginatedResponse } from "@artsdiva/types/common.types";
import type {
  Client,
  ClientWithLeaseHistory,
  CreateClientDTO,
  ListClientsParams,
  UpdateClientDTO,
} from "@artsdiva/types/client.types";

export function getClients(params?: ListClientsParams): Promise<PaginatedResponse<Client>> {
  return apiRequest<PaginatedResponse<Client>>(`/api/clients${buildQueryString(params)}`);
}

export async function getClientById(id: string): Promise<ClientWithLeaseHistory> {
  const { client } = await apiRequest<{ client: ClientWithLeaseHistory }>(`/api/clients/${id}`);
  return client;
}

export async function createClient(payload: CreateClientDTO): Promise<Client> {
  const { client } = await apiRequest<{ client: Client }>("/api/clients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return client;
}

export async function updateClient(id: string, payload: UpdateClientDTO): Promise<Client> {
  const { client } = await apiRequest<{ client: Client }>(`/api/clients/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return client;
}

export async function deleteClient(id: string): Promise<void> {
  await apiRequest<void>(`/api/clients/${id}`, { method: "DELETE" });
}
