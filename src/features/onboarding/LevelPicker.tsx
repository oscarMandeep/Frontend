"use client";

import { cn } from "@/lib/utils";
import { LEVEL_LABELS } from "./schema";

/** Five tappable steps, 1 (Beginner) to 5 (Expert). */
export function LevelPicker({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (level: number) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        {LEVEL_LABELS.map((name, i) => {
          const level = i + 1;
          const active = level <= value;
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={level === value}
              aria-label={`${name} (${level})`}
              onClick={() => onChange(level)}
              className={cn(
                "h-2.5 flex-1 rounded-full transition-colors",
                active ? "bg-brand-gradient" : "bg-border hover:bg-muted-foreground/40",
              )}
            />
          );
        })}
      </div>
      <p className="text-xs font-semibold text-muted-foreground">
        {LEVEL_LABELS[value - 1]} <span className="font-normal">· {label}</span>
      </p>
    </div>
  );
}
