"use client";

import { useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { ArrowLeftRight, Coins, Info, MapPin, Star, X } from "lucide-react";
import { MatchRing } from "@/components/brand/MatchRing";
import { SkillChip } from "@/components/brand/SkillChip";
import { avatarGradient, initials } from "@/components/brand/UserAvatar";
import type { DeckCardDto, MatchBreakdownDto } from "@/lib/api/generated/model";
import { cn } from "@/lib/utils";

export type SwipeDirection = "left" | "right" | "up";

const SWIPE_DISTANCE = 120;
const SWIPE_VELOCITY = 500;

const BREAKDOWN_LABELS: Record<keyof MatchBreakdownDto, string> = {
  skill: "Skills fit",
  reciprocity: "Both can teach",
  priority: "Your priorities",
  availability: "Free at the same time",
  mode: "Online / in person",
  language: "Shared language",
  trust: "Track record",
};

/** Exit animation per direction; the card keeps its drag position as the start. */
export const cardVariants = {
  enter: { opacity: 0, scale: 0.94, y: 12 },
  center: { opacity: 1, scale: 1, y: 0, x: 0, rotate: 0 },
  behind: { opacity: 1, scale: 0.95, y: 14 },
  exit: (dir: SwipeDirection) =>
    dir === "up"
      ? { y: -900, opacity: 0, transition: { duration: 0.35 } }
      : {
          x: dir === "right" ? 700 : -700,
          rotate: dir === "right" ? 18 : -18,
          opacity: 0,
          transition: { duration: 0.3 },
        },
};

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold">
      <Star className="size-4 fill-action-rewind text-action-rewind" />
      {value.toFixed(1)}
    </span>
  );
}

export function SwipeCard({
  card,
  isTop,
  custom,
  onSwipe,
}: {
  card: DeckCardDto;
  isTop: boolean;
  custom: SwipeDirection;
  onSwipe: (dir: SwipeDirection) => void;
}) {
  const reduce = useReducedMotion();
  const [details, setDetails] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(
    x,
    [-220, 0, 220],
    reduce ? [0, 0, 0] : [-14, 0, 14],
  );
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-120, -20], [1, 0]);
  const { user } = card;

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY)
      onSwipe("right");
    else if (
      info.offset.x < -SWIPE_DISTANCE ||
      info.velocity.x < -SWIPE_VELOCITY
    )
      onSwipe("left");
  }

  return (
    <motion.article
      aria-label={`${user.name}, ${card.score}% match`}
      custom={custom}
      variants={cardVariants}
      initial="enter"
      animate={isTop ? "center" : "behind"}
      exit="exit"
      style={{ x, rotate, zIndex: isTop ? 2 : 1 }}
      drag={isTop && !details ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      className={cn(
        "absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br shadow-xl ring-1 ring-black/5",
        avatarGradient(user.id),
        isTop
          ? "cursor-grab touch-pan-y active:cursor-grabbing"
          : "pointer-events-none",
      )}
    >
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={user.avatarUrl}
          alt=""
          draggable={false}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center text-[10rem] leading-none font-extrabold text-white/30 select-none"
        >
          {initials(user.name)}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

      {/* Stamps follow the drag distance. */}
      <motion.span
        style={{ opacity: likeOpacity }}
        className="absolute top-8 left-6 -rotate-12 rounded-lg border-4 border-like px-3 py-1 text-3xl font-extrabold tracking-wider text-like"
      >
        INTERESTED
      </motion.span>
      <motion.span
        style={{ opacity: nopeOpacity }}
        className="absolute top-8 right-6 rotate-12 rounded-lg border-4 border-nope px-3 py-1 text-3xl font-extrabold tracking-wider text-nope"
      >
        PASS
      </motion.span>

      <div className="absolute top-4 right-4 rounded-full bg-white/95 p-1 shadow-lg dark:bg-card/95">
        <MatchRing score={card.score} size={60} />
      </div>
      {card.type === "SWAP" ? (
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[13px] font-bold text-white backdrop-blur">
          <ArrowLeftRight className="size-4" /> Direct swap
        </span>
      ) : (
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[13px] font-bold text-white backdrop-blur">
          <Coins className="size-4" /> Credit session
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 text-white">
        <div>
          <div className="flex items-end justify-between gap-3">
            <h2 className="text-[28px] leading-tight font-extrabold [text-shadow:0_2px_8px_rgb(0_0_0/0.45)]">
              {user.name}
              {user.isNew && (
                <span className="ml-2 align-middle rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold backdrop-blur">
                  New
                </span>
              )}
            </h2>
            <button
              type="button"
              aria-label={`More about ${user.name}`}
              onPointerDownCapture={(e) => e.stopPropagation()}
              onClick={() => setDetails(true)}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur hover:bg-white/30"
            >
              <Info className="size-5" />
            </button>
          </div>
          <p className="mt-0.5 flex items-center gap-3 text-sm text-white/85">
            {user.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {user.city}
              </span>
            )}
            {user.ratingCount > 0 && <Stars value={user.ratingAvg} />}
            {user.sessionsDone > 0 && <span>{user.sessionsDone} sessions</span>}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 text-[13px] font-semibold">
          <span className="w-fit rounded-full bg-white/15 px-3 py-1 backdrop-blur">
            You learn <b>{card.learnSkill.name}</b>
          </span>
          {card.teachSkill ? (
            <span className="w-fit rounded-full bg-white/15 px-3 py-1 backdrop-blur">
              They learn <b>{card.teachSkill.name}</b> from you
            </span>
          ) : (
            <span className="w-fit rounded-full bg-white/15 px-3 py-1 backdrop-blur">
              Pay with 1 credit per hour
            </span>
          )}
        </div>
      </div>

      {details && (
        <div
          className="absolute inset-0 z-10 flex flex-col gap-4 overflow-y-auto bg-card p-5 text-foreground"
          onPointerDownCapture={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">
                @{user.username}
                {user.city ? ` · ${user.city}` : ""}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close details"
              onClick={() => setDetails(false)}
              className="grid size-9 place-items-center rounded-full bg-muted hover:bg-border"
            >
              <X className="size-5" />
            </button>
          </div>

          {user.bio && (
            <p className="text-[15px] text-secondary-foreground">{user.bio}</p>
          )}

          {card.reasons.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {card.reasons.map((r) => (
                <li
                  key={r}
                  className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground"
                >
                  {r}
                </li>
              ))}
            </ul>
          )}

          <section>
            <h3 className="mb-2 text-sm font-bold text-muted-foreground">
              Can teach
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.haves.map((h) => (
                <SkillChip key={h.skill.id} category={h.skill.category}>
                  {h.skill.name} · L{h.level}
                </SkillChip>
              ))}
            </div>
          </section>
          <section>
            <h3 className="mb-2 text-sm font-bold text-muted-foreground">
              Wants to learn
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.wants.map((w) => (
                <SkillChip key={w.skill.id} category={w.skill.category}>
                  {w.skill.name}
                </SkillChip>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-bold text-muted-foreground">
              Why {card.score}%
            </h3>
            <dl className="flex flex-col gap-2">
              {(
                Object.keys(BREAKDOWN_LABELS) as (keyof MatchBreakdownDto)[]
              ).map((k) => (
                <div key={k}>
                  <div className="flex justify-between text-xs font-semibold">
                    <dt>{BREAKDOWN_LABELS[k]}</dt>
                    <dd className="text-muted-foreground">
                      {Math.round(card.breakdown[k] * 100)}%
                    </dd>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className="bg-brand-gradient h-full"
                      style={{
                        width: `${Math.round(card.breakdown[k] * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </dl>
          </section>
          <p className="text-xs text-muted-foreground">
            Speaks {user.languages.join(", ")}
          </p>
        </div>
      )}
    </motion.article>
  );
}
