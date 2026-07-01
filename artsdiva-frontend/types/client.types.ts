import type { ContactInfo } from "./common.types";
import type { Artwork } from "./artwork.types";
import type { Lease } from "./lease.types";

export interface Client {
  id: string;
  name: string;
  contactInfo?: ContactInfo | null;
  preferences?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientWithLeaseHistory extends Client {
  leases: Array<Lease & { artwork: Pick<Artwork, "id" | "title" | "images" | "status"> }>;
}

export interface CreateClientDTO {
  name: string;
  contactInfo?: ContactInfo;
  preferences?: string;
  notes?: string;
}

export type UpdateClientDTO = Partial<CreateClientDTO>;

export interface ListClientsParams {
  search?: string;
  page?: number;
  limit?: number;
}
