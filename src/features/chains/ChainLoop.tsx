"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";
import { UserAvatar } from "@/components/brand/UserAvatar";
import type { ChainMemberDto } from "@/lib/api/generated/model";
import { cn } from "@/lib/utils";

const SIZE = 300;
const CENTER = SIZE / 2;
const RADIUS = 105;
const NODE_PCT = 18; // avatar size as % of the box

function point(i: number, n: number, radius = RADIUS) {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

/** Curved arrow from member i to member i+1, trimmed so it stops short of the avatars. */
function edge(i: number, n: number) {
  const trim = 0.3; // radians trimmed at both ends
  const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n + trim * 0.55;
  const a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n - trim * 0.55;
  const start = {
    x: CENTER + RADIUS * Math.cos(a0),
    y: CENTER + RADIUS * Math.sin(a0),
  };
  const end = {
    x: CENTER + RADIUS * Math.cos(a1),
    y: CENTER + RADIUS * Math.sin(a1),
  };
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x} ${end.y}`;
}

/**
 * A → B → C → A: avatars appear one by one, arrows draw themselves, and when the
 * loop is complete (everyone accepted) it glows.
 */
export function ChainLoop({
  members,
  complete,
}: {
  members: ChainMemberDto[];
  complete: boolean;
}) {
  const id = useId();
  const reduce = useReducedMotion();
  const n = members.length;
  const step = reduce ? 0 : 0.35;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px]">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 size-full"
        style={{
          filter: complete
            ? "drop-shadow(0 0 10px var(--brand-pink))"
            : undefined,
        }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${id}-g`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" style={{ stopColor: "var(--brand-pink)" }} />
            <stop offset="1" style={{ stopColor: "var(--brand-orange)" }} />
          </linearGradient>
          <marker
            id={`${id}-arrow`}
            viewBox="0 0 10 10"
            refX="7"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M 0 0 L 10 5 L 0 10 z"
              style={{ fill: "var(--brand-orange)" }}
            />
          </marker>
        </defs>
        {members.map((m, i) => (
          <motion.path
            key={m.position}
            d={edge(i, n)}
            fill="none"
            stroke={`url(#${id}-g)`}
            strokeWidth="4"
            strokeLinecap="round"
            markerEnd={`url(#${id}-arrow)`}
            initial={{ pathLength: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              delay: step * (i + 0.6),
              duration: reduce ? 0 : 0.6,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {members.map((m, i) => {
        const p = point(i, n);
        return (
          <motion.div
            key={m.position}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(p.x / SIZE) * 100}%`,
              top: `${(p.y / SIZE) * 100}%`,
              width: `${NODE_PCT}%`,
            }}
            initial={{ scale: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: step * i,
              type: "spring",
              stiffness: 260,
              damping: 16,
            }}
          >
            <div className="relative">
              <UserAvatar
                id={m.user.id}
                name={m.user.name}
                src={m.user.avatarUrl}
                className={cn(
                  "aspect-square size-full ring-4",
                  m.accepted === true
                    ? "ring-like"
                    : m.accepted === false
                      ? "ring-nope"
                      : "ring-border",
                )}
                textClassName="text-lg"
              />
              {m.accepted !== null && (
                <span
                  className={cn(
                    "absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full text-white",
                    m.accepted ? "bg-like" : "bg-nope",
                  )}
                >
                  {m.accepted ? (
                    <Check className="size-3" strokeWidth={4} />
                  ) : (
                    <X className="size-3" strokeWidth={4} />
                  )}
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-center text-xs font-bold">
              {m.user.name.split(" ")[0]}
            </p>
          </motion.div>
        );
      })}

      <div className="absolute inset-0 grid place-items-center">
        <span className="bg-brand-gradient grid size-14 place-items-center rounded-full text-xs font-extrabold text-white shadow-md">
          {n} way
        </span>
      </div>
    </div>
  );
}
