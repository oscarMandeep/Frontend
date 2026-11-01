"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarPlus,
  Check,
  CheckCheck,
  Loader2,
  SendHorizontal,
} from "lucide-react";
import { UserAvatar } from "@/components/brand/UserAvatar";
import { useGetMe } from "@/lib/api/generated/me/me";
import { useGetMatch } from "@/lib/api/generated/matches/matches";
import { clock, dayLabel } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useChat, type ChatItem } from "./useChat";

function TypingDots() {
  return (
    <div
      className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-3"
      aria-label="Typing"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

function Bubble({
  item,
  mine,
  showSeen,
  onRetry,
}: {
  item: ChatItem;
  mine: boolean;
  showSeen: boolean;
  onRetry: () => void;
}) {
  return (
    <div className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug break-words whitespace-pre-wrap",
          mine
            ? "bg-brand-gradient rounded-br-md text-white"
            : "rounded-bl-md bg-surface text-foreground",
          item.pending && "opacity-70",
        )}
      >
        {item.body}
      </div>
      <div className="mt-0.5 flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
        {item.failed ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 font-semibold text-destructive"
          >
            <AlertCircle className="size-3" /> Not sent. Tap to retry
          </button>
        ) : (
          <>
            {clock(item.createdAt)}
            {mine && item.pending && (
              <Loader2 className="size-3 animate-spin" />
            )}
            {mine && !item.pending && showSeen && (
              <span className="inline-flex items-center gap-0.5 font-semibold text-like">
                <CheckCheck className="size-3" /> Seen
              </span>
            )}
            {mine && !item.pending && !showSeen && <Check className="size-3" />}
          </>
        )}
      </div>
    </div>
  );
}

export function ChatWindow({ matchId }: { matchId: string }) {
  const myId = useGetMe().data?.data.id;
  const matchQuery = useGetMatch(matchId);
  const match = matchQuery.data?.data;
  const other = match?.otherUser;
  const chat = useChat(matchId, myId, other?.id);

  const scroller = useRef<HTMLDivElement>(null);
  const topSentinel = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const prevHeight = useRef(0);
  const [draft, setDraft] = useState("");

  // Older messages: load when the top sentinel scrolls into view.
  const { hasMore, loadingMore, loadMore } = chat;
  useEffect(() => {
    const el = topSentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loadingMore) {
          prevHeight.current = scroller.current?.scrollHeight ?? 0;
          void loadMore();
        }
      },
      { root: scroller.current, rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  // Keep the reader's place when older pages are inserted above.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && prevHeight.current) {
      el.scrollTop += el.scrollHeight - prevHeight.current;
      prevHeight.current = 0;
    }
  }, [chat.pageCount]);

  // Follow new messages when already at the bottom, or when I just sent one.
  const count = chat.items.length;
  const lastKey = chat.items.at(-1)?.key;
  const lastMine = chat.items.at(-1)?.senderId === myId;
  useEffect(() => {
    const el = scroller.current;
    if (el && (stickToBottom.current || lastMine))
      el.scrollTo({ top: el.scrollHeight });
  }, [count, lastKey, lastMine, chat.otherTyping]);

  function onScroll() {
    const el = scroller.current;
    if (el)
      stickToBottom.current =
        el.scrollHeight - el.scrollTop - el.clientHeight < 140;
  }

  function submit() {
    if (!draft.trim()) return;
    chat.send(draft);
    setDraft("");
  }

  // My newest message that the other person has read.
  const lastSeenKey = [...chat.items]
    .reverse()
    .find((m) => m.senderId === myId && m.readAt)?.key;

  const closed = chat.joinError === "MATCH_CLOSED";
  const swap = match?.teachSkill
    ? `${match.teachSkill.name} ⇄ ${match.learnSkill.name}`
    : match
      ? `You learn ${match.learnSkill.name}`
      : "";

  return (
    <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col lg:border-x lg:border-border">
      <header className="flex items-center gap-3 border-b border-border bg-background px-3 py-2.5">
        <Link
          href="/matches"
          aria-label="Back to matches"
          className="grid size-10 place-items-center rounded-full hover:bg-muted"
        >
          <ArrowLeft className="size-5" />
        </Link>
        {other ? (
          <>
            <span className="relative">
              <UserAvatar
                id={other.id}
                name={other.name}
                src={other.avatarUrl}
                className="size-10"
                textClassName="text-sm"
              />
              {chat.otherOnline && (
                <span
                  aria-label="Online"
                  className="absolute right-0 bottom-0 size-2.5 rounded-full bg-like ring-2 ring-background"
                />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate leading-tight font-bold">{other.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {chat.otherTyping
                  ? "typing…"
                  : chat.otherOnline
                    ? "Online"
                    : swap}
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1" />
        )}
        <Link
          href={`/sessions?match=${matchId}`}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-bold hover:bg-muted"
        >
          <CalendarPlus className="size-4 text-brand" />
          <span className="hidden sm:inline">Schedule</span>
        </Link>
      </header>

      <div
        ref={scroller}
        onScroll={onScroll}
        className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-4"
      >
        <div ref={topSentinel} />
        {chat.loadingMore && (
          <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
        )}
        {!chat.hasMore && !chat.isLoading && other && (
          <div className="mb-4 flex flex-col items-center gap-1 py-6 text-center">
            <UserAvatar
              id={other.id}
              name={other.name}
              src={other.avatarUrl}
              className="size-20"
              textClassName="text-2xl"
            />
            <p className="mt-2 text-lg font-extrabold">
              You matched with {other.name.split(" ")[0]}
            </p>
            <p className="text-sm text-muted-foreground">{swap}</p>
          </div>
        )}
        {chat.isLoading && (
          <Loader2 className="mx-auto mt-10 size-6 animate-spin text-brand" />
        )}
        {chat.isError && (
          <p className="py-10 text-center text-muted-foreground">
            Could not load messages.
          </p>
        )}

        {chat.items.map((item, i) => {
          const prev = chat.items[i - 1];
          const newDay =
            !prev ||
            new Date(prev.createdAt).toDateString() !==
              new Date(item.createdAt).toDateString();
          const mine = item.senderId === myId;
          const gap = prev && prev.senderId !== item.senderId ? "mt-2" : "";
          return (
            <div key={item.key} className={gap}>
              {newDay && (
                <p className="my-3 text-center text-xs font-semibold text-muted-foreground">
                  {dayLabel(item.createdAt)}
                </p>
              )}
              <Bubble
                item={item}
                mine={mine}
                showSeen={item.key === lastSeenKey}
                onRetry={() => chat.retry(item.key)}
              />
            </div>
          );
        })}
        {chat.otherTyping && <TypingDots />}
      </div>

      {closed ? (
        <p className="border-t border-border px-4 py-4 text-center text-sm text-muted-foreground">
          This match was closed.
        </p>
      ) : (
        <form
          className="flex items-end gap-2 border-t border-border bg-background px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <textarea
            value={draft}
            rows={1}
            maxLength={2000}
            placeholder="Write a message"
            aria-label="Message"
            onChange={(e) => {
              setDraft(e.target.value);
              chat.typing();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-3xl border border-input bg-surface px-4 py-2.5 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!draft.trim()}
            className="bg-brand-gradient grid size-11 shrink-0 place-items-center rounded-full text-white shadow-md transition hover:brightness-105 disabled:opacity-40"
          >
            <SendHorizontal className="size-5" />
          </button>
        </form>
      )}
    </div>
  );
}
