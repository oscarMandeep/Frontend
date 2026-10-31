import { useId } from "react";
import { cn } from "@/lib/utils";

/** SkillSwap mark: two arrows forming a loop (⇄) in the brand gradient. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-8", className)}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="32" x2="32" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--brand-pink)" }} />
          <stop offset="1" style={{ stopColor: "var(--brand-orange)" }} />
        </linearGradient>
      </defs>
      <g stroke={`url(#${id})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 11h19" />
        <path d="M19 5l6 6-6 6" />
        <path d="M27 21H8" />
        <path d="M13 15l-6 6 6 6" />
      </g>
    </svg>
  );
}

export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      {showWordmark && (
        <span className="text-brand-gradient text-xl font-extrabold tracking-tight">
          SkillSwap
        </span>
      )}
    </span>
  );
}
