import type { Artist, Artwork, MouStatus } from "@prisma/client";
import type { ContactInfoDTO } from "./common.types";

export interface CreateArtistDTO {
  name: string;
  bio?: string;
  contactInfo?: ContactInfoDTO;
  commissionTerms: string;
  mouStatus: MouStatus;
}

export type UpdateArtistDTO = Partial<CreateArtistDTO>;

export type ArtistResponse = Artist;

export interface ArtistWithArtworks extends Artist {
  artworks: Artwork[];
}

export interface ListArtistsQuery {
  search?: string;
  page?: number;
  limit?: number;
}
