"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart, X } from "lucide-react";
import { MatchRing } from "@/components/brand/MatchRing";
import { UserAvatar } from "@/components/brand/UserAvatar";

const PEOPLE = [
  { id: "a1", name: "Diya Nair", city: "Dehradun", score: 92, teaches: "Spanish", wants: "Guitar" },
  { id: "b2", name: "Aarav Sharma", city: "Haridwar", score: 81, teaches: "Guitar", wants: "Python" },
  { id: "c3", name: "Riya Verma", city: "Delhi", score: 74, teaches: "Photography", wants: "Excel" },
];

/** Decorative stack of three swipe cards for the hero. Pure presentation. */
export function HeroCards() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto h-[460px] w-[300px] sm:h-[520px] sm:w-[340px]" aria-hidden="true">
      {PEOPLE.map((p, i) => {
        const depth = PEOPLE.length - 1 - i; // 0 = top card
        return (
          <motion.div
            key={p.id}
            className="absolute inset-0 overflow-hidden rounded-3xl bg-card shadow-2xl ring-1 ring-black/5"
            style={{ zIndex: i === 0 ? 3 : i === 1 ? 2 : 1 }}
            initial={{ opacity: 0, y: 40, rotate: 0 }}
            animate={{
              opacity: 1,
              y: i * -14 * -1,
              rotate: i === 0 ? -3 : i === 1 ? 4 : -9,
              scale: 1 - i * 0.04,
              x: i === 0 ? 0 : i === 1 ? 26 : -26,
            }}
            transition={{ delay: reduce ? 0 : 0.15 * depth, type: "spring", stiffness: 120, damping: 16 }}
          >
            <motion.div
              className="flex h-full flex-col"
              animate={reduce ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative flex-1 overflow-hidden">
                <UserAvatar
                  id={p.id}
                  name={p.name}
                  className="size-full rounded-none"
                  textClassName="text-7xl opacity-90"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-4 right-4 rounded-full bg-white/95 p-1 shadow-lg">
                  <MatchRing score={p.score} size={56} />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-2xl font-extrabold [text-shadow:0_2px_8px_rgb(0_0_0/0.4)]">
                    {p.name.split(" ")[0]}
                  </p>
                  <p className="text-sm text-white/80">{p.city}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[13px] font-semibold">
                    <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                      Teaches {p.teaches}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 backdrop-blur">
                      Wants {p.wants}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 bg-card py-4">
                <span className="grid size-12 place-items-center rounded-full border border-border text-nope shadow-sm">
                  <X className="size-6" strokeWidth={3} />
                </span>
                <span className="grid size-12 place-items-center rounded-full border border-border text-like shadow-sm">
                  <Heart className="size-6" strokeWidth={3} />
                </span>
              </div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
