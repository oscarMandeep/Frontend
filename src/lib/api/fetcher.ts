/**
 * Custom fetch used by every generated hook (orval `mutator`).
 * - Always goes through the Next.js rewrite: /api/v1/* (cookies stay first-party).
 * - On 401, tries one refresh and retries once; otherwise sends the user to /login.
 * - Failed responses throw the ApiError envelope from docs/04-api-contract.md.
 */
export interface ApiError {
  statusCode: number;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "statusCode" in value &&
    "error" in value
  );
}

// Generated URLs already start with /v1 (the API's global prefix).
const BASE = "/api";

export async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const doFetch = () =>
    fetch(`${BASE}${url}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init.headers },
    });

  let res = await doFetch();

  if (res.status === 401 && !url.startsWith("/v1/auth/")) {
    const refreshed = await fetch(`${BASE}/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshed.ok) {
      res = await doFetch();
    } else {
      // Full reload on purpose: drops all in-memory state of an expired session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
      throw new Error("UNAUTHENTICATED");
    }
  }

  const text = await res.text();
  const body: unknown = text ? JSON.parse(text) : undefined;

  if (!res.ok) throw body;

  // orval's fetch client expects { data, status, headers }
  return { data: body, status: res.status, headers: res.headers } as T;
}
