import type { Artist, Artwork, ArtworkStatus, Client, Lease } from "@prisma/client";

export interface CreateArtworkDTO {
  title: string;
  artistId: string;
  medium: string;
  dimensions: string;
  year: number;
  acquisitionDate: Date;
  status: ArtworkStatus;
  images?: string[];
  notes?: string;
}

export type UpdateArtworkDTO = Partial<CreateArtworkDTO>;

export type ArtworkResponse = Artwork;

export interface ArtworkWithRelations extends Artwork {
  artist: Artist;
  activeLease: (Lease & { client: Client }) | null;
}

export interface ListArtworksQuery {
  search?: string;
  status?: ArtworkStatus;
  artistId?: string;
  page?: number;
  limit?: number;
}

export type ArtworkStatusEnum = ArtworkStatus;
