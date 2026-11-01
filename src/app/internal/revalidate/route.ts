import { revalidateTag } from "next/cache";

/**
 * Webhook from the API: "these pages changed". Not under /api, because /api/* is
 * rewritten to the NestJS backend. Guarded by a shared secret.
 */
export async function POST(req: Request) {
  if (
    req.headers.get("x-revalidate-secret") !== process.env.REVALIDATE_SECRET
  ) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    tags?: unknown;
  } | null;
  const tags = Array.isArray(body?.tags)
    ? body.tags.filter((t): t is string => typeof t === "string")
    : [];
  for (const tag of tags) revalidateTag(tag, "max"); // Next 16: second argument is required
  return Response.json({ ok: true, revalidated: tags });
}
