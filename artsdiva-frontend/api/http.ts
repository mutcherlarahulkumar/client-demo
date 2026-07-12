// Shared fetch wrapper used by every api/*.api.ts file. Not itself an
// "api file" for a domain — those live alongside it (auth.api.ts, etc.).

import { getAuthToken } from "@artsdiva/utils/authToken";

// NEXT_PUBLIC_API_URL is inlined at BUILD TIME, not read at runtime — if a
// deployment's env var wasn't set when it was built, this is `undefined` no
// matter what you set afterward until the next build. Only the local dev
// fallback is silent; a production build missing this var fails loudly
// instead of quietly calling localhost:4000 from every visitor's browser.
const CONFIGURED_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const DEV_FALLBACK_API_BASE_URL = "http://localhost:4000";

// Matches the shape returned by validate()/validateQuery() middleware:
// zod's `.flatten().fieldErrors`.
export type FieldErrors = Record<string, string[] | undefined>;

interface ApiErrorBody {
  message?: string;
  errors?: FieldErrors;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors?: FieldErrors
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit = {}
): Promise<TResponse> {
  if (!CONFIGURED_API_BASE_URL && process.env.NODE_ENV === "production") {
    throw new ApiError(
      "This deployment is missing NEXT_PUBLIC_API_URL — the frontend doesn't know where the API is. Set it in the hosting platform's environment variables and redeploy (it's baked in at build time, so just adding it isn't enough).",
      0
    );
  }

  const API_BASE_URL = CONFIGURED_API_BASE_URL ?? DEV_FALLBACK_API_BASE_URL;

  // FormData (file uploads) must NOT get a manual Content-Type — the
  // browser needs to set its own multipart boundary.
  const isFormData = options.body instanceof FormData;

  const token = getAuthToken();
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: isFormData
      ? { ...authHeaders, ...options.headers }
      : { "Content-Type": "application/json", ...authHeaders, ...options.headers },
  });

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const errorBody = body && typeof body === "object" ? (body as ApiErrorBody) : null;
    const message = errorBody?.message ? String(errorBody.message) : `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, errorBody?.errors);
  }

  return body as TResponse;
}

// Shared by every list/search endpoint that takes optional filter params.
export function buildQueryString(params?: object): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
