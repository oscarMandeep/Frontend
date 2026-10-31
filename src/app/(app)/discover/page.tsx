"use client";

import { useRouter } from "next/navigation";
import { useLogout } from "@/lib/api/generated/auth/auth";
import { useGetMe } from "@/lib/api/generated/me/me";

// Temporary Phase 3/4 page: proves login + the generated client work. Replaced in Phase 6.
export default function DiscoverPlaceholder() {
  const router = useRouter();
  const me = useGetMe();
  const logout = useLogout({
    mutation: { onSuccess: () => router.push("/login") },
  });

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-xl font-bold">
        useGetMe() →{" "}
        {me.isPending ? "loading…" : me.isError ? "error" : me.data.status}
      </h1>
      <pre className="bg-surface overflow-auto rounded p-3 text-xs">
        {JSON.stringify(me.data?.data ?? null, null, 2)}
      </pre>
      <button
        type="button"
        onClick={() => logout.mutate()}
        className="rounded border px-3 py-2"
      >
        Log out
      </button>
    </main>
  );
}
