// Auth token storage. localStorage instead of a cookie -- sidesteps
// third-party-cookie blocking on iOS Safari / Chrome Incognito, which
// silently drops cross-domain cookies regardless of SameSite/Secure. See
// docs/DEPLOYMENT.md for the trade-off (token is JS-readable, unlike an
// httpOnly cookie -- keep XSS surface minimal elsewhere in the app).
const TOKEN_KEY = "artsdiva_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}
