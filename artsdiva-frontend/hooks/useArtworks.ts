import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getArtworks, getArtworkById, createArtwork, updateArtwork,
  updateArtworkStatus, deleteArtwork, uploadArtworkImages,
} from "@artsdiva/api/artwork.api";
import type { ArtworkStatus, CreateArtworkDTO, ListArtworksParams, UpdateArtworkDTO } from "@artsdiva/types/artwork.types";

export const ARTWORKS_KEY = "artworks";

export function useArtworks(params: ListArtworksParams = {}) {
  return useQuery({
    queryKey: [ARTWORKS_KEY, "list", params],
    queryFn: () => getArtworks(params),
  });
}

export function useArtwork(id?: string) {
  return useQuery({
    queryKey: [ARTWORKS_KEY, "detail", id],
    queryFn: () => getArtworkById(id!),
    enabled: !!id,
  });
}

export function useCreateArtwork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateArtworkDTO) => createArtwork(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: [ARTWORKS_KEY] }); },
  });
}

export function useUpdateArtwork(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateArtworkDTO) => updateArtwork(id, data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: [ARTWORKS_KEY] }); },
  });
}

export function useUpdateArtworkStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: ArtworkStatus) => updateArtworkStatus(id, status),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: [ARTWORKS_KEY] }); },
  });
}

export function useDeleteArtwork() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteArtwork(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: [ARTWORKS_KEY] }); },
  });
}

export function useUploadArtworkImages(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => uploadArtworkImages(id, files),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: [ARTWORKS_KEY, "detail", id] }); },
  });
}
