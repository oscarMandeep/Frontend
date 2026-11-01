"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const COLORS = [
  "var(--brand-pink)",
  "var(--brand-orange)",
  "#ffffff",
  "var(--action-rewind)",
];

/** Brand-coloured confetti burst. Skipped for people who prefer reduced motion. */
export function Confetti({ count = 40 }: { count?: number }) {
  const reduce = useReducedMotion();
  // Random values are generated once per mount, not on every render.
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 520,
      y: -(80 + Math.random() * 280),
      rotate: Math.random() * 720 - 360,
      delay: Math.random() * 0.15,
      size: 6 + Math.random() * 6,
      color: COLORS[i % COLORS.length],
    })),
  );
  if (reduce) return null;
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center"
      aria-hidden="true"
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-[2px]"
          style={{
            width: p.size,
            height: p.size * 0.5,
            backgroundColor: p.color,
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.x,
            y: [0, p.y, p.y + 420],
            opacity: [1, 1, 0],
            rotate: p.rotate,
          }}
          transition={{ duration: 1.8, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
