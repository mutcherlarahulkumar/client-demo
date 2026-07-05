import type { ContactInfo } from "./common.types";
import type { Artwork } from "./artwork.types";

export type MouStatus = "SIGNED" | "PENDING" | "NOT_REQUIRED";

export interface Artist {
  id: string;
  name: string;
  bio?: string | null;
  contactInfo?: ContactInfo | null;
  commissionPercent?: number | null;
  commissionTerms: string;
  mouStatus: MouStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ArtistWithArtworks extends Artist {
  artworks: Artwork[];
}

export interface CreateArtistDTO {
  name: string;
  bio?: string;
  contactInfo?: ContactInfo;
  commissionPercent: number;
  commissionTerms: string;
  mouStatus: MouStatus;
}

export type UpdateArtistDTO = Partial<CreateArtistDTO>;

export type ArtistSortField = "name" | "commissionPercent" | "mouStatus" | "createdAt";

export interface ListArtistsParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: ArtistSortField;
  sortOrder?: "asc" | "desc";
}
