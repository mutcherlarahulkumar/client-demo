import { useCallback, useEffect, useState } from "react";
import {
  deleteArtwork as deleteArtworkRequest,
  getArtworkById,
  updateArtworkStatus as updateArtworkStatusRequest,
  uploadArtworkImages as uploadArtworkImagesRequest,
} from "@artsdiva/api/artwork.api";
import { ApiError } from "@artsdiva/api/http";
import type { ArtworkStatus, ArtworkWithRelations } from "@artsdiva/types/artwork.types";

interface UseArtworkResult {
  artwork: ArtworkWithRelations | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteArtwork: () => Promise<boolean>;
  updateStatus: (status: ArtworkStatus) => Promise<boolean>;
  uploadImages: (files: File[]) => Promise<boolean>;
}

export function useArtwork(id: string | undefined): UseArtworkResult {
  const [artwork, setArtwork] = useState<ArtworkWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtwork = useCallback(async (): Promise<void> => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await getArtworkById(id);
      setArtwork(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load artwork");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchArtwork();
  }, [fetchArtwork]);

  const deleteArtwork = useCallback(async (): Promise<boolean> => {
    if (!id) return false;
    try {
      await deleteArtworkRequest(id);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete artwork");
      return false;
    }
  }, [id]);

  const updateStatus = useCallback(
    async (status: ArtworkStatus): Promise<boolean> => {
      if (!id) return false;
      try {
        await updateArtworkStatusRequest(id, status);
        await fetchArtwork();
        return true;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to update status");
        return false;
      }
    },
    [id, fetchArtwork]
  );

  const uploadImages = useCallback(
    async (files: File[]): Promise<boolean> => {
      if (!id) return false;
      try {
        await uploadArtworkImagesRequest(id, files);
        await fetchArtwork();
        return true;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to upload images");
        return false;
      }
    },
    [id, fetchArtwork]
  );

  return { artwork, isLoading, error, refetch: fetchArtwork, deleteArtwork, updateStatus, uploadImages };
}
