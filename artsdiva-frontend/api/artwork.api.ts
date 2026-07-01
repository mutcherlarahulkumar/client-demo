import { apiRequest, buildQueryString } from "@artsdiva/api/http";
import type { PaginatedResponse } from "@artsdiva/types/common.types";
import type {
  Artwork,
  ArtworkStatus,
  ArtworkWithRelations,
  CreateArtworkDTO,
  ListArtworksParams,
  UpdateArtworkDTO,
} from "@artsdiva/types/artwork.types";

export function getArtworks(params?: ListArtworksParams): Promise<PaginatedResponse<Artwork>> {
  return apiRequest<PaginatedResponse<Artwork>>(`/api/artworks${buildQueryString(params)}`);
}

export async function getArtworkById(id: string): Promise<ArtworkWithRelations> {
  const { artwork } = await apiRequest<{ artwork: ArtworkWithRelations }>(`/api/artworks/${id}`);
  return artwork;
}

export async function createArtwork(payload: CreateArtworkDTO): Promise<Artwork> {
  const { artwork } = await apiRequest<{ artwork: Artwork }>("/api/artworks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return artwork;
}

export async function updateArtwork(id: string, payload: UpdateArtworkDTO): Promise<Artwork> {
  const { artwork } = await apiRequest<{ artwork: Artwork }>(`/api/artworks/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return artwork;
}

export async function updateArtworkStatus(id: string, status: ArtworkStatus): Promise<Artwork> {
  const { artwork } = await apiRequest<{ artwork: Artwork }>(`/api/artworks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return artwork;
}

export async function deleteArtwork(id: string): Promise<void> {
  await apiRequest<void>(`/api/artworks/${id}`, { method: "DELETE" });
}

export async function uploadArtworkImages(id: string, files: File[]): Promise<Artwork> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const { artwork } = await apiRequest<{ artwork: Artwork }>(`/api/artworks/${id}/images`, {
    method: "POST",
    body: formData,
  });
  return artwork;
}
