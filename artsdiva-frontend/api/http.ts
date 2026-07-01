// Shared fetch wrapper used by every api/*.api.ts file. Not itself an
// "api file" for a domain — those live alongside it (auth.api.ts, etc.).

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface ApiErrorBody {
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit = {}
): Promise<TResponse> {
  // FormData (file uploads) must NOT get a manual Content-Type — the
  // browser needs to set its own multipart boundary.
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: isFormData ? { ...options.headers } : { "Content-Type": "application/json", ...options.headers },
  });

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String((body as ApiErrorBody).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
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
