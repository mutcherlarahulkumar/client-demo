import { useCallback, useEffect, useState } from "react";
import { deleteClient as deleteClientRequest, getClients } from "@artsdiva/api/client.api";
import { ApiError } from "@artsdiva/api/http";
import type { Client } from "@artsdiva/types/client.types";

interface UseClientsResult {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
  search: string;
  isLoading: boolean;
  error: string | null;
  setSearch: (value: string) => void;
  setPage: (value: number) => void;
  refetch: () => Promise<void>;
  deleteClient: (id: string) => Promise<boolean>;
}

export function useClients(): UseClientsResult {
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getClients({ search: search || undefined, page, limit });
      setClients(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  }, [search, page, limit]);

  useEffect(() => {
    void fetchClients();
  }, [fetchClients]);

  const deleteClient = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteClientRequest(id);
        await fetchClients();
        return true;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to delete client");
        return false;
      }
    },
    [fetchClients]
  );

  return {
    clients,
    total,
    page,
    limit,
    search,
    isLoading,
    error,
    setSearch,
    setPage,
    refetch: fetchClients,
    deleteClient,
  };
}
