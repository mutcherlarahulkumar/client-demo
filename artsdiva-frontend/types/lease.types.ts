// Minimal shape needed by other modules (e.g. an Artwork's active lease).
// Expanded with DTOs/query types when the Lease module is built.
export type LeaseStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Lease {
  id: string;
  artworkId: string;
  clientId: string;
  startDate: string;
  endDate?: string | null;
  terms?: string | null;
  status: LeaseStatus;
  createdAt: string;
  updatedAt: string;
}
