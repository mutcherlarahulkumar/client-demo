import { useCallback, useEffect, useState } from "react";
import { deleteArtwork as deleteArtworkRequest, getArtworks } from "@artsdiva/api/artwork.api";
import { ApiError } from "@artsdiva/api/http";
import type { Artwork, ArtworkStatus } from "@artsdiva/types/artwork.types";

interface UseArtworksResult {
  artworks: Artwork[];
  total: number;
  page: number;
  limit: number;
  search: string;
  status: ArtworkStatus | "";
  artistId: string;
  isLoading: boolean;
  error: string | null;
  setSearch: (value: string) => void;
  setStatus: (value: ArtworkStatus | "") => void;
  setArtistId: (value: string) => void;
  setPage: (value: number) => void;
  refetch: () => Promise<void>;
  deleteArtwork: (id: string) => Promise<boolean>;
}

export function useArtworks(): UseArtworksResult {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ArtworkStatus | "">("");
  const [artistId, setArtistId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtworks = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getArtworks({
        search: search || undefined,
        status: status || undefined,
        artistId: artistId || undefined,
        page,
        limit,
      });
      setArtworks(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load artworks");
    } finally {
      setIsLoading(false);
    }
  }, [search, status, artistId, page, limit]);

  useEffect(() => {
    void fetchArtworks();
  }, [fetchArtworks]);

  const deleteArtwork = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteArtworkRequest(id);
        await fetchArtworks();
        return true;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to delete artwork");
        return false;
      }
    },
    [fetchArtworks]
  );

  return {
    artworks,
    total,
    page,
    limit,
    search,
    status,
    artistId,
    isLoading,
    error,
    setSearch,
    setStatus,
    setArtistId,
    setPage,
    refetch: fetchArtworks,
    deleteArtwork,
  };
}
