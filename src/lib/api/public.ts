import "server-only";

const API = process.env.API_URL ?? "http://localhost:4000";

export class ApiDownError extends Error {}

/**
 * Server-side fetch for the public (ISR) pages. 404 -> null; any other failure
 * throws so Next keeps serving the last good page instead of caching an error.
 */
export async function publicFetch<T>(
  path: string,
  opts: { revalidate: number; tags: string[] },
): Promise<T | null> {
  const res = await fetch(`${API}/v1/public${path}`, {
    next: { revalidate: opts.revalidate, tags: opts.tags },
    signal: AbortSignal.timeout(90_000), // a sleeping free-tier API can take ~1 minute
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiDownError(String(res.status));
  return (await res.json()) as T;
}
