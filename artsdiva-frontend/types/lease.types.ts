export type LeaseStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Lease {
  id: string;
  artworkId: string;
  clientId: string;
  startDate: string;
  endDate?: string | null;
  rateAmount?: number | null;
  terms?: string | null;
  status: LeaseStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeaseDTO {
  artworkId: string;
  clientId: string;
  startDate: string;
  endDate?: string;
  rateAmount: number;
  terms?: string;
}

export interface ListLeasesParams {
  artworkId?: string;
  clientId?: string;
  page?: number;
  limit?: number;
}
