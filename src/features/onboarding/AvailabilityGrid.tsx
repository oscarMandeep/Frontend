"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { cellKey } from "./availability";

// 0 = Sunday on the API. Shown Monday first.
const DAYS = [
  { day: 1, label: "Mon" },
  { day: 2, label: "Tue" },
  { day: 3, label: "Wed" },
  { day: 4, label: "Thu" },
  { day: 5, label: "Fri" },
  { day: 6, label: "Sat" },
  { day: 0, label: "Sun" },
];
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 .. 22:00

const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;

/** Press and drag to paint free hours; start on a filled cell to erase. */
export function AvailabilityGrid({
  cells,
  onChange,
}: {
  cells: readonly string[];
  onChange: (cells: string[]) => void;
}) {
  const selected = new Set(cells);
  const painting = useRef<"add" | "remove" | null>(null);
  // The latest set while dragging, because several cells can be entered between renders.
  const draft = useRef(new Set(cells));

  useEffect(() => {
    draft.current = new Set(cells);
  }, [cells]);

  useEffect(() => {
    const stop = () => (painting.current = null);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, []);

  function apply(key: string) {
    if (!painting.current) return;
    const next = new Set(draft.current);
    if (painting.current === "add") next.add(key);
    else next.delete(key);
    draft.current = next;
    onChange([...next]);
  }

  function start(key: string) {
    painting.current = selected.has(key) ? "remove" : "add";
    apply(key);
  }

  function toggleDay(day: number) {
    const keys = HOURS.map((h) => cellKey(day, h));
    const full = keys.every((k) => selected.has(k));
    const next = new Set(selected);
    for (const k of keys) {
      if (full) next.delete(k);
      else next.add(k);
    }
    onChange([...next]);
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card p-3">
      <div
        className="grid min-w-[420px] touch-none select-none gap-1"
        style={{ gridTemplateColumns: "3rem repeat(7, minmax(0, 1fr))" }}
        role="grid"
        aria-label="Weekly availability"
      >
        <div />
        {DAYS.map((d) => (
          <button
            key={d.day}
            type="button"
            onClick={() => toggleDay(d.day)}
            className="rounded-lg py-1 text-xs font-bold text-muted-foreground hover:bg-muted"
            title={`Toggle all of ${d.label}`}
          >
            {d.label}
          </button>
        ))}
        {HOURS.map((h) => (
          <div key={h} className="contents">
            <div className="pr-1 text-right text-[11px] leading-7 text-muted-foreground">{hourLabel(h)}</div>
            {DAYS.map((d) => {
              const key = cellKey(d.day, h);
              const on = selected.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  role="gridcell"
                  aria-selected={on}
                  aria-label={`${d.label} ${hourLabel(h)}`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    start(key);
                  }}
                  onPointerEnter={() => apply(key)}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      const next = new Set(selected);
                      if (on) next.delete(key);
                      else next.add(key);
                      onChange([...next]);
                    }
                  }}
                  className={cn(
                    "h-7 rounded-md border transition-colors",
                    on
                      ? "bg-brand-gradient border-transparent"
                      : "border-border bg-surface hover:border-brand/50",
                  )}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
