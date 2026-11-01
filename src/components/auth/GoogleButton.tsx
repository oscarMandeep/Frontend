"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export function GoogleMark() {
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
/**
 * "Continue with Google". A plain link on purpose: it is a redirect to Google, not a
 * Next page. Google decides new vs returning, the API sends new people to onboarding.
 */
export function GoogleButton({
  label = "Continue with Google",
  className,
}: {
  label?: string;
  className?: string;
}) {
  // The API sleeps on free hosting: wake it while the visitor reads the page.
  useEffect(() => {
    fetch("/api/v1/health").catch(() => undefined);
  }, []);

  return (
    <a
      href="/api/v1/auth/google"
      className={cn(
        "flex h-14 w-full items-center justify-center gap-3 rounded-full border border-border bg-white text-[15px] font-bold text-[#21262e] shadow-sm transition hover:shadow-md active:scale-[0.99]",
        className,
      )}
    >
      <GoogleMark />
      {label}
    </a>
  );
}
