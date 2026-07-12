import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, login as loginRequest, logout as logoutRequest } from "@artsdiva/api/auth.api";
import { ApiError, type FieldErrors } from "@artsdiva/api/http";
import { clearAuthToken, getAuthToken, setAuthToken } from "@artsdiva/utils/authToken";
import type { AuthenticatedUser, LoginDTO } from "@artsdiva/types/auth.types";

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  error: string | null;
  fieldErrors: FieldErrors | null;
  login: (payload: LoginDTO) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Single source of truth for auth state — fetches /me once for the whole
// app instead of once per page/component that needs the current user.
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors | null>(null);

  useEffect(() => {
    // No stored token means no session to restore -- skip the /me round
    // trip entirely (it would just 401).
    if (!getAuthToken()) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    getCurrentUser()
      .then((currentUser) => {
        if (!cancelled) setUser(currentUser);
      })
      .catch(() => {
        if (!cancelled) {
          clearAuthToken();
          setUser(null);
        }
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
    setFieldErrors(null);
    setIsLoading(true);
    try {
      const { user: loggedInUser, token } = await loginRequest(payload);
      setAuthToken(token);
      setUser(loggedInUser);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.fieldErrors ?? null);
      } else {
        setError("Login failed");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutRequest();
    } finally {
      clearAuthToken();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, fieldErrors, login, logout }}>{children}</AuthContext.Provider>
  );
}
