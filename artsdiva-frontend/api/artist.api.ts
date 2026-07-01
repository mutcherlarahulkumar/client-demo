import { apiRequest, buildQueryString } from "@artsdiva/api/http";
import type { PaginatedResponse } from "@artsdiva/types/common.types";
import type {
  Artist,
  ArtistWithArtworks,
  CreateArtistDTO,
  ListArtistsParams,
  UpdateArtistDTO,
} from "@artsdiva/types/artist.types";

export function getArtists(params?: ListArtistsParams): Promise<PaginatedResponse<Artist>> {
  return apiRequest<PaginatedResponse<Artist>>(`/api/artists${buildQueryString(params)}`);
}

export async function getArtistById(id: string): Promise<ArtistWithArtworks> {
  const { artist } = await apiRequest<{ artist: ArtistWithArtworks }>(`/api/artists/${id}`);
  return artist;
}

export async function createArtist(payload: CreateArtistDTO): Promise<Artist> {
  const { artist } = await apiRequest<{ artist: Artist }>("/api/artists", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return artist;
}

export async function updateArtist(id: string, payload: UpdateArtistDTO): Promise<Artist> {
  const { artist } = await apiRequest<{ artist: Artist }>(`/api/artists/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return artist;
}

export async function deleteArtist(id: string): Promise<void> {
  await apiRequest<void>(`/api/artists/${id}`, { method: "DELETE" });
}
