"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GradientButton } from "@/components/brand/GradientButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { isApiError } from "@/lib/api/fetcher";
import { useGetMatchSlots } from "@/lib/api/generated/sessions/sessions";
import { createSession } from "@/lib/api/generated/sessions/sessions";
import type { MatchDetailDto } from "@/lib/api/generated/model";
import { cn } from "@/lib/utils";

const DURATIONS = [30, 60, 90] as const;

const dayKey = (iso: string) => new Date(iso).toDateString();
const dayTitle = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
const time = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

/** Pick a time that works for both people (computed by the API from both availabilities). */
export function SlotPicker({
  match,
  myId,
  open,
  onOpenChange,
  onBooked,
}: {
  match: MatchDetailDto;
  myId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBooked?: () => void;
}) {
  const queryClient = useQueryClient();
  const [duration, setDuration] = useState<number>(60);
  // "learn" = I learn from them; "teach" = I teach them (only for direct swaps).
  const [direction, setDirection] = useState<"learn" | "teach">("learn");
  const [mode, setMode] = useState<"ONLINE" | "IN_PERSON">("ONLINE");
  const [location, setLocation] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const slots = useGetMatchSlots(
    match.id,
    { days: 14, durationMin: duration },
    { query: { enabled: open } },
  );
  const list = slots.data?.data ?? [];
  const byDay = Map.groupBy(list, (s) => dayKey(s.startsAt));

  const skill =
    direction === "learn"
      ? match.learnSkill
      : (match.teachSkill ?? match.learnSkill);
  const teacherId = direction === "learn" ? match.otherUser.id : myId;

  async function book() {
    if (!picked) return;
    setSaving(true);
    try {
      await createSession({
        matchId: match.id,
        skillId: skill.id,
        teacherId,
        startsAt: picked,
        durationMin: duration,
        mode,
        location:
          mode === "IN_PERSON" ? location.trim() || undefined : undefined,
      });
      toast.success(
        `Proposed to ${match.otherUser.name.split(" ")[0]}. They need to confirm.`,
      );
      void queryClient.invalidateQueries({ queryKey: ["/v1/sessions"] });
      onBooked?.();
      onOpenChange(false);
      setPicked(null);
    } catch (err) {
      toast.error(
        isApiError(err) ? err.error.message : "Could not book that time.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-5 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            Schedule a session
          </DialogTitle>
          <DialogDescription>
            Times below are free for both of you, shown in your local time.
          </DialogDescription>
        </DialogHeader>

        {match.teachSkill && (
          <div
            className="grid grid-cols-2 gap-2"
            role="radiogroup"
            aria-label="Who teaches"
          >
            {(
              [
                ["learn", `I learn ${match.learnSkill.name}`],
                ["teach", `I teach ${match.teachSkill.name}`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={direction === value}
                onClick={() => setDirection(value)}
                className={cn(
                  "rounded-2xl border px-3 py-2.5 text-sm font-bold transition",
                  direction === value
                    ? "border-brand bg-accent text-brand"
                    : "border-border hover:bg-muted",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={duration === d}
              onClick={() => {
                setDuration(d);
                setPicked(null);
              }}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold",
                duration === d
                  ? "bg-brand-gradient border-transparent text-white"
                  : "border-border hover:bg-muted",
              )}
            >
              {d} min
            </button>
          ))}
          <span className="mx-1 h-5 w-px bg-border" />
          {(["ONLINE", "IN_PERSON"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-semibold",
                mode === m
                  ? "bg-brand-gradient border-transparent text-white"
                  : "border-border hover:bg-muted",
              )}
            >
              {m === "ONLINE" ? "Online" : "In person"}
            </button>
          ))}
        </div>

        {mode === "IN_PERSON" && (
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where? e.g. Cafe near the station"
            aria-label="Location"
            maxLength={200}
            className="h-11 rounded-full px-4"
          />
        )}

        <div className="flex max-h-72 flex-col gap-4 overflow-y-auto pr-1">
          {slots.isLoading && (
            <Loader2 className="mx-auto size-6 animate-spin text-brand" />
          )}
          {!slots.isLoading && list.length === 0 && (
            <p className="rounded-2xl bg-surface p-4 text-center text-sm text-muted-foreground">
              No shared free time in the next 14 days. Try a shorter session, or
              update your availability in your profile.
            </p>
          )}
          {[...byDay].map(([key, daySlots]) => (
            <section key={key}>
              <h3 className="mb-2 text-sm font-bold text-muted-foreground">
                {dayTitle(daySlots[0].startsAt)}
              </h3>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((s) => (
                  <button
                    key={s.startsAt}
                    type="button"
                    aria-pressed={picked === s.startsAt}
                    onClick={() => setPicked(s.startsAt)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
                      picked === s.startsAt
                        ? "bg-brand-gradient border-transparent text-white"
                        : "border-border hover:border-brand",
                    )}
                  >
                    {time(s.startsAt)}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <GradientButton
          onClick={book}
          disabled={!picked || saving}
          className="w-full"
        >
          {saving ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            "Propose this time"
          )}
        </GradientButton>
      </DialogContent>
    </Dialog>
  );
}
