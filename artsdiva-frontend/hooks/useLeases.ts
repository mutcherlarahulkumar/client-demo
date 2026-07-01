import { useCallback, useState } from "react";
import {
  cancelLease as cancelLeaseRequest,
  completeLease as completeLeaseRequest,
  createLease as createLeaseRequest,
} from "@artsdiva/api/lease.api";
import { ApiError } from "@artsdiva/api/http";
import type { CreateLeaseDTO, Lease } from "@artsdiva/types/lease.types";

interface UseLeasesOptions {
  // Called after any successful mutation — lets the caller refresh the
  // Artwork/Client data this lease change affects.
  onMutate?: () => void | Promise<void>;
}

interface UseLeasesResult {
  isSubmitting: boolean;
  error: string | null;
  createLease: (payload: CreateLeaseDTO) => Promise<Lease | null>;
  completeLease: (id: string) => Promise<boolean>;
  cancelLease: (id: string) => Promise<boolean>;
}

export function useLeases(options?: UseLeasesOptions): UseLeasesResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runMutation = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await action();
        await options?.onMutate?.();
        return result;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Lease action failed");
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [options]
  );

  const createLease = useCallback(
    (payload: CreateLeaseDTO) => runMutation(() => createLeaseRequest(payload)),
    [runMutation]
  );

  const completeLease = useCallback(
    async (id: string): Promise<boolean> => (await runMutation(() => completeLeaseRequest(id))) !== null,
    [runMutation]
  );

  const cancelLease = useCallback(
    async (id: string): Promise<boolean> => (await runMutation(() => cancelLeaseRequest(id))) !== null,
    [runMutation]
  );

  return { isSubmitting, error, createLease, completeLease, cancelLease };
}
