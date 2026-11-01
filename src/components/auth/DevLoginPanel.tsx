"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Seeded people, so one developer can sign in as two users in two browsers.
// Demo and Aarav can match each other (Python <-> Guitar). Demo and Diya already
// have a match with messages, so the chat has something in it.
const DEV_USERS = [
  { email: "demo@skillswap.dev", label: "Demo", hint: "teaches Python" },
  { email: "aarav@skillswap.dev", label: "Aarav", hint: "teaches Guitar" },
  { email: "diya@skillswap.dev", label: "Diya", hint: "teaches Spanish" },
];

export function DevLoginPanel() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function devLogin(email: string) {
    setBusy(email);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("login failed");
      const me = (await (
        await fetch("/api/v1/me", { credentials: "include" })
      ).json()) as { onboarded?: boolean };
      router.push(me.onboarded ? "/discover" : "/onboarding");
    } catch {
      setError("Could not log in. Is the API running on port 4000?");
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {DEV_USERS.map((u) => (
        <button
          key={u.email}
          type="button"
          disabled={busy !== null}
          onClick={() => devLogin(u.email)}
          className="flex h-14 items-center justify-between rounded-2xl border border-border bg-card px-5 text-left font-bold transition hover:bg-muted disabled:opacity-60"
        >
          <span>
            {u.label}
            <span className="block text-xs font-medium text-muted-foreground">
              {u.hint}
            </span>
          </span>
          {busy === u.email && <Loader2 className="size-5 animate-spin" />}
        </button>
      ))}
      <p className="text-sm text-muted-foreground">
        Test a match: log in as Demo and swipe right on Aarav. In a private
        window log in as Aarav and swipe right on Demo. Demo and Diya already
        have a match with messages.
      </p>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
