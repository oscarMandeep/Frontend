"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Circular match score. Stroke = brand gradient; 80%+ gets a soft glow. */
export function MatchRing({
  score,
  size = 72,
  className,
}: {
  score: number;
  size?: number;
  className?: string;
}) {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const stroke = Math.max(4, size / 12);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      role="img"
      aria-label={`${clamped}% match`}
      className={cn("relative inline-grid place-items-center", className)}
      style={{
        width: size,
        height: size,
        filter: clamped >= 80 ? "drop-shadow(0 0 8px var(--brand-pink))" : undefined,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" style={{ stopColor: "var(--brand-pink)" }} />
            <stop offset="1" style={{ stopColor: "var(--brand-orange)" }} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          style={{ stroke: "var(--border)" }}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduceMotion ? offset : circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduceMotion ? 0 : 0.9, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute font-extrabold" style={{ fontSize: size * 0.3 }}>
        {clamped}
        <span className="text-muted-foreground" style={{ fontSize: size * 0.18 }}>
          %
        </span>
      </span>
    </div>
  );
}
