"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const isDev = process.env.NODE_ENV === "development";

export default function LoginPage() {
  const router = useRouter();

  // The API sleeps on free hosting: wake it while the user reads this page.
  useEffect(() => {
    fetch("/api/v1/health").catch(() => undefined);
  }, []);

  async function devLogin() {
    const res = await fetch("/api/v1/auth/dev-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "demo@skillswap.dev" }),
    });
    if (res.ok) router.push("/discover");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Log in to SkillSwap</h1>
      {/* A plain link on purpose: this is a redirect to Google, not a Next page. */}
      <a
        href="/api/v1/auth/google"
        className="rounded-lg border px-4 py-3 text-center font-medium"
      >
        Continue with Google
      </a>
      {isDev && (
        <button
          type="button"
          onClick={devLogin}
          className="rounded-lg border border-dashed px-4 py-3 text-sm"
        >
          Dev login as demo user (development only)
        </button>
      )}
    </main>
  );
}
