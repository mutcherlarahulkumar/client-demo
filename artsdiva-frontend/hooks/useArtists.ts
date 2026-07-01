import { useCallback, useEffect, useState } from "react";
import { deleteArtist as deleteArtistRequest, getArtists } from "@artsdiva/api/artist.api";
import { ApiError } from "@artsdiva/api/http";
import type { Artist } from "@artsdiva/types/artist.types";

interface UseArtistsResult {
  artists: Artist[];
  total: number;
  page: number;
  limit: number;
  search: string;
  isLoading: boolean;
  error: string | null;
  setSearch: (value: string) => void;
  setPage: (value: number) => void;
  refetch: () => Promise<void>;
  deleteArtist: (id: string) => Promise<boolean>;
}

export function useArtists(): UseArtistsResult {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtists = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getArtists({ search: search || undefined, page, limit });
      setArtists(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load artists");
    } finally {
      setIsLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    void fetchArtists();
  }, [fetchArtists]);

  const deleteArtist = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteArtistRequest(id);
        await fetchArtists();
        return true;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to delete artist");
        return false;
      }
    },
    [fetchArtists]
  );

  return {
    artists,
    total,
    page,
    limit,
    search,
    isLoading,
    error,
    setSearch,
    setPage,
    refetch: fetchArtists,
    deleteArtist,
  };
}
