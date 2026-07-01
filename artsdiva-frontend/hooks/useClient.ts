import { useCallback, useEffect, useState } from "react";
import { deleteClient as deleteClientRequest, getClientById } from "@artsdiva/api/client.api";
import { ApiError } from "@artsdiva/api/http";
import type { ClientWithLeaseHistory } from "@artsdiva/types/client.types";

interface UseClientResult {
  client: ClientWithLeaseHistory | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  deleteClient: () => Promise<boolean>;
}

export function useClient(id: string | undefined): UseClientResult {
  const [client, setClient] = useState<ClientWithLeaseHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClient = useCallback(async (): Promise<void> => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await getClientById(id);
      setClient(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load client");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchClient();
  }, [fetchClient]);

  const deleteClient = useCallback(async (): Promise<boolean> => {
    if (!id) return false;
    try {
      await deleteClientRequest(id);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete client");
      return false;
    }
  }, [id]);

  return { client, isLoading, error, refetch: fetchClient, deleteClient };
}
