import { useCallback, useEffect, useState } from "react";
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from "@artsdiva/api/auth.api";
import { ApiError } from "@artsdiva/api/http";
import type { AuthenticatedUser, LoginDTO } from "@artsdiva/types/auth.types";

interface UseAuthResult {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginDTO) => Promise<boolean>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginDTO): Promise<boolean> => {
    setError(null);
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await loginRequest(payload);
      setUser(loggedInUser);
      return true;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await logoutRequest();
    setUser(null);
  }, []);

  return { user, isLoading, error, login, logout };
}
