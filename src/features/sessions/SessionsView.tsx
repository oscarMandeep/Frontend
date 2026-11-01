"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMe } from "@/lib/api/generated/me/me";
import { useListSessions } from "@/lib/api/generated/sessions/sessions";
import { cn } from "@/lib/utils";
import { SessionCard } from "./SessionCard";

const TABS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
] as const;

export function SessionsView() {
  const [scope, setScope] =
    useState<(typeof TABS)[number]["value"]>("upcoming");
  const myId = useGetMe().data?.data.id;
  const sessions = useListSessions({ scope });
  const items = sessions.data?.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label="Sessions"
        className="grid grid-cols-2 gap-1 rounded-full bg-surface p-1"
      >
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={scope === t.value}
            onClick={() => setScope(t.value)}
            className={cn(
              "h-10 rounded-full text-sm font-bold transition",
              scope === t.value
                ? "bg-card text-brand shadow-sm"
                : "text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sessions.isLoading && (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-44 rounded-3xl" />
        </div>
      )}
      {sessions.isError && (
        <p className="py-10 text-center text-muted-foreground">
          Could not load your sessions.
        </p>
      )}

      {!sessions.isLoading && !sessions.isError && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border px-6 py-14 text-center">
          <span className="bg-brand-gradient grid size-14 place-items-center rounded-full text-white">
            <CalendarDays className="size-7" />
          </span>
          <h2 className="text-xl font-extrabold">
            {scope === "upcoming" ? "Nothing planned yet" : "No past sessions"}
          </h2>
          <p className="max-w-xs text-muted-foreground">
            Open a chat with one of your matches and tap Schedule to find a time
            you are both free.
          </p>
          <Link
            href="/matches"
            className="bg-brand-gradient inline-flex h-11 items-center rounded-full px-6 font-bold text-white"
          >
            Go to matches
          </Link>
        </div>
      )}

      {myId && (
        <ul className="flex flex-col gap-4">
          {items.map((s) => (
            <SessionCard key={s.id} session={s} myId={myId} />
          ))}
        </ul>
      )}
    </div>
  );
}
