import type { Artist } from "./artist.types";
import type { Client } from "./client.types";
import type { Lease } from "./lease.types";

export type ArtworkStatus = "IN_COLLECTION" | "ON_LEASE" | "SOLD";

export interface Artwork {
  id: string;
  title: string;
  artistId: string;
  medium: string;
  dimensions: string;
  year: number;
  acquisitionDate: string;
  status: ArtworkStatus;
  images: string[];
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArtworkWithRelations extends Artwork {
  artist: Artist;
  activeLease: (Lease & { client: Client }) | null;
}

export interface CreateArtworkDTO {
  title: string;
  artistId: string;
  medium: string;
  dimensions: string;
  year: number;
  acquisitionDate: string;
  status: ArtworkStatus;
  images?: string[];
  notes?: string;
}

export type UpdateArtworkDTO = Partial<CreateArtworkDTO>;

export interface ListArtworksParams {
  search?: string;
  status?: ArtworkStatus;
  artistId?: string;
  page?: number;
  limit?: number;
}
