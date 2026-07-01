import { apiRequest, buildQueryString } from "@artsdiva/api/http";
import type { PaginatedResponse } from "@artsdiva/types/common.types";
import type { CreateLeaseDTO, Lease, ListLeasesParams } from "@artsdiva/types/lease.types";

export function getLeases(params?: ListLeasesParams): Promise<PaginatedResponse<Lease>> {
  return apiRequest<PaginatedResponse<Lease>>(`/api/leases${buildQueryString(params)}`);
}

export async function getLeaseById(id: string): Promise<Lease> {
  const { lease } = await apiRequest<{ lease: Lease }>(`/api/leases/${id}`);
  return lease;
}

export async function createLease(payload: CreateLeaseDTO): Promise<Lease> {
  const { lease } = await apiRequest<{ lease: Lease }>("/api/leases", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return lease;
}

export async function completeLease(id: string): Promise<Lease> {
  const { lease } = await apiRequest<{ lease: Lease }>(`/api/leases/${id}/complete`, { method: "PUT" });
  return lease;
}

export async function cancelLease(id: string): Promise<Lease> {
  const { lease } = await apiRequest<{ lease: Lease }>(`/api/leases/${id}/cancel`, { method: "PUT" });
  return lease;
}
