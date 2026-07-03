import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getArtists, getArtistById, createArtist, updateArtist, deleteArtist } from "@artsdiva/api/artist.api";
import type { CreateArtistDTO, ListArtistsParams, UpdateArtistDTO } from "@artsdiva/types/artist.types";

export const ARTISTS_KEY = "artists";

export function useArtists(params: ListArtistsParams = {}) {
  return useQuery({
    queryKey: [ARTISTS_KEY, "list", params],
    queryFn: () => getArtists(params),
  });
}

export function useArtist(id?: string) {
  return useQuery({
    queryKey: [ARTISTS_KEY, "detail", id],
    queryFn: () => getArtistById(id!),
    enabled: !!id,
  });
}

export function useCreateArtist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateArtistDTO) => createArtist(data),
    onSuccess: (artist) => {
      // Seed the detail cache immediately so the detail page renders on arrival
      qc.setQueryData([ARTISTS_KEY, "detail", artist.id], artist);
      void qc.invalidateQueries({ queryKey: [ARTISTS_KEY, "list"] });
    },
  });
}

export function useUpdateArtist(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateArtistDTO) => updateArtist(id, data),
    onSuccess: (artist) => {
      qc.setQueryData([ARTISTS_KEY, "detail", id], artist);
      void qc.invalidateQueries({ queryKey: [ARTISTS_KEY, "list"] });
    },
  });
}

export function useDeleteArtist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteArtist(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: [ARTISTS_KEY] }); },
  });
}
