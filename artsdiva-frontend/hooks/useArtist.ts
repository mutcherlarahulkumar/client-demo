import { useCallback, useEffect, useState } from "react";
import { deleteArtist as deleteArtistRequest, getArtistById } from "@artsdiva/api/artist.api";
import { ApiError } from "@artsdiva/api/http";
import type { ArtistWithArtworks } from "@artsdiva/types/artist.types";

interface UseArtistResult {
  artist: ArtistWithArtworks | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteArtist: () => Promise<boolean>;
}

export function useArtist(id: string | undefined): UseArtistResult {
  const [artist, setArtist] = useState<ArtistWithArtworks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtist = useCallback(async (): Promise<void> => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await getArtistById(id);
      setArtist(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load artist");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchArtist();
  }, [fetchArtist]);

  const deleteArtist = useCallback(async (): Promise<boolean> => {
    if (!id) return false;
    try {
      await deleteArtistRequest(id);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete artist");
      return false;
    }
  }, [id]);

  return { artist, isLoading, error, refetch: fetchArtist, deleteArtist };
}
