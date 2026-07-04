import { QueryCache, MutationCache, QueryClient } from "@tanstack/react-query";
import { ApiError } from "@artsdiva/api/http";

function redirectToLoginOn401(error: unknown): void {
  if (
    error instanceof ApiError &&
    error.status === 401 &&
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login")
  ) {
    window.location.replace("/login");
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: redirectToLoginOn401 }),
  mutationCache: new MutationCache({ onError: redirectToLoginOn401 }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Never retry auth failures — they won't fix themselves.
        if (error instanceof ApiError && error.status === 401) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default queryClient;
