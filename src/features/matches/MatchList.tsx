"use client";

import Link from "next/link";
import { ArrowLeftRight, Coins, Heart, Repeat2 } from "lucide-react";
import { UserAvatar } from "@/components/brand/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMe } from "@/lib/api/generated/me/me";
import { useListMatches } from "@/lib/api/generated/matches/matches";
import type { MatchSummaryDto } from "@/lib/api/generated/model";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";

const TYPE_ICON = {
  SWAP: ArrowLeftRight,
  CREDIT: Coins,
  CHAIN: Repeat2,
} as const;

function MatchRow({ match, myId }: { match: MatchSummaryDto; myId?: string }) {
  const { otherUser: u, lastMessage: last, unreadCount } = match;
  const Icon = TYPE_ICON[match.type];
  const preview = last
    ? `${last.senderId === myId ? "You: " : ""}${last.body}`
    : "Say hi and plan your first session";
  return (
    <li>
      <Link
        href={`/chat/${match.id}`}
        className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-muted"
      >
        <span className="relative">
          <UserAvatar
            id={u.id}
            name={u.name}
            src={u.avatarUrl}
            className="size-14"
            textClassName="text-lg"
          />
          <span className="absolute -right-1 -bottom-1 grid size-6 place-items-center rounded-full bg-card ring-2 ring-background">
            <Icon className="size-3.5 text-brand" />
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span
              className={cn(
                "truncate",
                unreadCount > 0 ? "font-extrabold" : "font-bold",
              )}
            >
              {u.name}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {timeAgo(last?.createdAt ?? match.createdAt)}
            </span>
          </span>
          <span className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "truncate text-sm",
                unreadCount > 0
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {preview}
            </span>
            {unreadCount > 0 ? (
              <span className="bg-brand-gradient grid h-5 min-w-5 shrink-0 place-items-center rounded-full px-1.5 text-xs font-bold text-white">
                {unreadCount}
              </span>
            ) : (
              <span className="shrink-0 text-xs font-bold text-brand">
                {match.score}%
              </span>
            )}
          </span>
        </span>
      </Link>
    </li>
  );
}

export function MatchList() {
  const matches = useListMatches({ limit: 50 });
  const myId = useGetMe().data?.data.id;
  const items = matches.data?.data.items ?? [];

  if (matches.isLoading) {
    return (
      <div
        className="flex flex-col gap-3"
        aria-busy="true"
        aria-label="Loading matches"
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3">
            <Skeleton className="size-14 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (matches.isError) {
    return (
      <p className="py-10 text-center text-muted-foreground">
        Could not load your matches.
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border px-6 py-14 text-center">
        <span className="bg-brand-gradient grid size-14 place-items-center rounded-full text-white">
          <Heart className="size-7" />
        </span>
        <h2 className="text-xl font-extrabold">No matches yet</h2>
        <p className="max-w-xs text-muted-foreground">
          Swipe right on people you want to learn from. When they swipe right
          too, you will see them here.
        </p>
        <Link
          href="/discover"
          className="bg-brand-gradient mt-2 inline-flex h-11 items-center rounded-full px-6 font-bold text-white"
        >
          Start swiping
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {items.map((m) => (
        <MatchRow key={m.id} match={m} myId={myId} />
      ))}
    </ul>
  );
}
