"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Temporary Phase 3 page: proves the login works. Replaced in Phase 6.
export default function DiscoverPlaceholder() {
  const router = useRouter();
  const [me, setMe] = useState<unknown>(null);
  const [status, setStatus] = useState("loading…");

  useEffect(() => {
    fetch("/api/v1/me")
      .then(async (res) => {
        setStatus(String(res.status));
        setMe(res.ok ? await res.json() : null);
      })
      .catch(() => setStatus("network error"));
  }, []);

  async function logout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <h1 className="text-xl font-bold">Logged in (GET /api/v1/me → {status})</h1>
      <pre className="overflow-auto rounded bg-black/5 p-3 text-xs">
        {JSON.stringify(me, null, 2)}
      </pre>
      <button type="button" onClick={logout} className="rounded border px-3 py-2">
        Log out
      </button>
    </main>
  );
}
