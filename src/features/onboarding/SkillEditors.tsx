"use client";

import { X } from "lucide-react";
import { SkillChip } from "@/components/brand/SkillChip";
import type { SkillRefDto } from "@/lib/api/generated/model";
import { cn } from "@/lib/utils";
import { LevelPicker } from "./LevelPicker";
import { PRIORITIES, type OnboardingValues } from "./schema";
import { SkillPicker } from "./SkillPicker";

type Have = OnboardingValues["haves"][number];
type Want = OnboardingValues["wants"][number];

export const PRIORITY_LABEL = {
  HIGH: "Really want it",
  MEDIUM: "Would like it",
  LOW: "Just curious",
} as const;

function RemoveButton({
  name,
  onClick,
}: {
  name: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Remove ${name}`}
      onClick={onClick}
      className="rounded-full p-1 text-muted-foreground hover:bg-muted"
    >
      <X className="size-4" />
    </button>
  );
}

/** Skills I can teach, each with my level. Used by onboarding and the profile page. */
export function HavesEditor({
  haves,
  wants,
  onChange,
}: {
  haves: Have[];
  wants: Want[];
  onChange: (haves: Have[]) => void;
}) {
  const add = (s: SkillRefDto) =>
    onChange([
      ...haves,
      { skillId: s.id, name: s.name, category: s.category, level: 3 },
    ]);
  return (
    <>
      <SkillPicker
        onPick={add}
        excludeIds={[
          ...haves.map((h) => h.skillId),
          ...wants.map((w) => w.skillId),
        ]}
      />
      <ul className="flex flex-col gap-3">
        {haves.map((h, i) => (
          <li
            key={h.skillId}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <SkillChip category={h.category}>{h.name}</SkillChip>
              <RemoveButton
                name={h.name}
                onClick={() =>
                  onChange(haves.filter((x) => x.skillId !== h.skillId))
                }
              />
            </div>
            <LevelPicker
              label="your level"
              value={h.level}
              onChange={(level) =>
                onChange(haves.map((x, j) => (j === i ? { ...x, level } : x)))
              }
            />
          </li>
        ))}
      </ul>
    </>
  );
}

/** Skills I want to learn: where I am, where I want to get, and how much I want it. */
export function WantsEditor({
  haves,
  wants,
  onChange,
}: {
  haves: Have[];
  wants: Want[];
  onChange: (wants: Want[]) => void;
}) {
  const add = (s: SkillRefDto) =>
    onChange([
      ...wants,
      {
        skillId: s.id,
        name: s.name,
        category: s.category,
        currentLevel: 1,
        goalLevel: 3,
        priority: "MEDIUM",
      },
    ]);
  const patch = (i: number, change: Partial<Want>) =>
    onChange(wants.map((x, j) => (j === i ? { ...x, ...change } : x)));

  return (
    <>
      <SkillPicker
        onPick={add}
        excludeIds={[
          ...haves.map((h) => h.skillId),
          ...wants.map((w) => w.skillId),
        ]}
      />
      <ul className="flex flex-col gap-3">
        {wants.map((w, i) => (
          <li
            key={w.skillId}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <SkillChip category={w.category}>{w.name}</SkillChip>
              <RemoveButton
                name={w.name}
                onClick={() =>
                  onChange(wants.filter((x) => x.skillId !== w.skillId))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <LevelPicker
                label="where you are now"
                value={w.currentLevel}
                onChange={(currentLevel) =>
                  patch(i, {
                    currentLevel,
                    goalLevel: Math.max(w.goalLevel, currentLevel),
                  })
                }
              />
              <LevelPicker
                label="your goal"
                value={w.goalLevel}
                onChange={(goalLevel) =>
                  patch(i, {
                    goalLevel,
                    currentLevel: Math.min(w.currentLevel, goalLevel),
                  })
                }
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={w.priority === p}
                  onClick={() => patch(i, { priority: p })}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[13px] font-semibold transition-colors",
                    w.priority === p
                      ? "bg-brand-gradient border-transparent text-white"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
