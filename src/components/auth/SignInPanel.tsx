"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const isDev = process.env.NODE_ENV === "development";

// Seeded people, so one developer can sign in as two users in two browsers.
const DEV_USERS = [
  { email: "demo@skillswap.dev", label: "Demo" },
  { email: "aarav@skillswap.dev", label: "Aarav" },
  { email: "diya@skillswap.dev", label: "Diya" },
];

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h5.9a5.04 5.04 0 0 1-2.19 3.31v2.75h3.55c2.08-1.91 3.24-4.74 3.24-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.75c-.98.66-2.24 1.05-3.73 1.05-2.87 0-5.3-1.94-6.17-4.55H2.17v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.83 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.17a11 11 0 0 0 0 9.86l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.17 7.07l3.66 2.84C6.7 7.32 9.13 5.38 12 5.38Z"
      />
    </svg>
  );
}

/** Google button plus (development only) quick logins for the seeded users. */
export function SignInPanel({ className }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The API sleeps on free hosting: wake it while the visitor reads the page.
  useEffect(() => {
    fetch("/api/v1/health").catch(() => undefined);
  }, []);

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
      ).json()) as {
        onboarded?: boolean;
      };
      router.push(me.onboarded ? "/discover" : "/onboarding");
    } catch {
      setError("Could not log in. Is the API running on port 4000?");
      setBusy(null);
    }
  }

  return (
    <div className={cn("flex w-full max-w-sm flex-col gap-3", className)}>
      {/* A plain link on purpose: this is a redirect to Google, not a Next page. */}
      <a
        href="/api/v1/auth/google"
        className="flex h-14 items-center justify-center gap-3 rounded-full bg-white text-[15px] font-bold text-[#21262e] shadow-lg transition hover:scale-[1.02] hover:shadow-xl active:scale-[0.99]"
      >
        <GoogleMark />
        Continue with Google
      </a>

      {isDev && (
        <div className="rounded-2xl border border-dashed border-white/50 bg-white/10 p-3 backdrop-blur">
          <p className="mb-2 text-center text-xs font-semibold tracking-wide text-white/90 uppercase">
            Dev login · development only
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEV_USERS.map((u) => (
              <button
                key={u.email}
                type="button"
                disabled={busy !== null}
                onClick={() => devLogin(u.email)}
                className="flex h-10 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white transition hover:bg-white/30 disabled:opacity-60"
              >
                {busy === u.email ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  u.label
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-black/30 px-3 py-2 text-center text-sm text-white"
        >
          {error}
        </p>
      )}
    </div>
  );
}
