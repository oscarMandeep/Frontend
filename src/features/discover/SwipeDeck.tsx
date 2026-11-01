"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { isApiError } from "@/lib/api/fetcher";
import {
  getGetDiscoverQueryKey,
  useGetDiscover,
} from "@/lib/api/generated/discover/discover";
import { createSwipe, undoLastSwipe } from "@/lib/api/generated/swipes/swipes";
import type { DeckCardDto, SwipeAction } from "@/lib/api/generated/model";
import { useMatchModal } from "@/stores/match-modal";
import { ActionBar } from "./ActionBar";
import { SwipeCard, type SwipeDirection } from "./SwipeCard";

const ACTION_FOR: Record<SwipeDirection, SwipeAction> = {
  left: "PASS",
  right: "LIKE",
  up: "SUPER",
};

function DeckSkeleton() {
  return (
    <div
      className="aspect-[3/4.4] w-full animate-pulse rounded-3xl bg-surface"
      aria-busy="true"
      aria-label="Loading your deck"
    />
  );
}

export function SwipeDeck() {
  const queryClient = useQueryClient();
  const deck = useGetDiscover({ limit: 20 });
  const showMatch = useMatchModal((s) => s.show);

  // Cards already swiped in this session stay hidden even before the server catches up.
  const [removed, setRemoved] = useState<string[]>([]);
  const [exitDir, setExitDir] = useState<SwipeDirection>("right");
  const [lastPass, setLastPass] = useState<DeckCardDto | null>(null);
  const busy = useRef(false);

  const cards = deck.data?.data ?? [];
  const visible = cards.filter((c) => !removed.includes(c.user.id));
  const top = visible[0];

  async function swipe(dir: SwipeDirection) {
    if (!top || busy.current) return;
    busy.current = true;
    const card = top;
    setExitDir(dir);
    setRemoved((r) => [...r, card.user.id]);
    setLastPass(dir === "left" ? card : null);
    try {
      const res = await createSwipe({
        targetId: card.user.id,
        action: ACTION_FOR[dir],
      });
      if (res.data.matched && res.data.matchId) {
        showMatch({
          matchId: res.data.matchId,
          score: card.score,
          type: card.type,
          otherUser: card.user,
          learnSkill: card.learnSkill,
          teachSkill: card.teachSkill,
        });
        void queryClient.invalidateQueries({ queryKey: ["/v1/matches"] });
      }
    } catch (err) {
      // Put the card back so nothing is lost silently.
      setRemoved((r) => r.filter((id) => id !== card.user.id));
      toast.error(
        isApiError(err)
          ? err.error.message
          : "Could not save that swipe. Try again.",
      );
    } finally {
      busy.current = false;
    }
  }

  async function rewind() {
    if (!lastPass || busy.current) return;
    busy.current = true;
    try {
      await undoLastSwipe();
      setRemoved((r) => r.filter((id) => id !== lastPass.user.id));
      setExitDir("left");
      setLastPass(null);
    } catch {
      toast.error("Only your most recent pass can be undone.");
      setLastPass(null);
    } finally {
      busy.current = false;
    }
  }

  // The key listener is attached once and always calls the latest handlers.
  const handlers = useRef({ swipe, rewind });
  useEffect(() => {
    handlers.current = { swipe, rewind };
  });

  // Keyboard: ← pass, → like, ↑ super, Z undo.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;
      const { swipe, rewind } = handlers.current;
      if (e.key === "ArrowLeft") void swipe("left");
      else if (e.key === "ArrowRight") void swipe("right");
      else if (e.key === "ArrowUp") {
        e.preventDefault();
        void swipe("up");
      } else if (e.key.toLowerCase() === "z") void rewind();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function refill() {
    setRemoved([]);
    await queryClient.invalidateQueries({
      queryKey: getGetDiscoverQueryKey({ limit: 20 }),
    });
  }

  if (deck.isLoading) return <DeckSkeleton />;

  if (deck.isError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-8 text-center">
        <p className="font-semibold">We could not load your deck.</p>
        <button
          type="button"
          onClick={() => deck.refetch()}
          className="bg-brand-gradient inline-flex h-11 items-center gap-2 rounded-full px-5 font-bold text-white"
        >
          <RefreshCw className="size-4" /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="relative aspect-[3/4.4] w-full">
        {visible.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
            <span className="bg-brand-gradient grid size-16 place-items-center rounded-full text-white">
              <Sparkles className="size-8" />
            </span>
            <h2 className="text-2xl font-extrabold">You are all caught up</h2>
            <p className="max-w-xs text-muted-foreground">
              No more people to show right now. Add more skills you want to
              learn to widen your deck, or check back soon.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={refill}
                disabled={deck.isFetching}
                className="bg-brand-gradient inline-flex h-11 items-center gap-2 rounded-full px-5 font-bold text-white disabled:opacity-60"
              >
                {deck.isFetching ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Refresh
              </button>
              <Link
                href="/profile"
                className="inline-flex h-11 items-center rounded-full border border-border px-5 font-semibold hover:bg-muted"
              >
                Edit my skills
              </Link>
            </div>
          </div>
        ) : (
          <AnimatePresence custom={exitDir}>
            {visible
              .slice(0, 2)
              .reverse()
              .map((card) => (
                <SwipeCard
                  key={card.user.id}
                  card={card}
                  isTop={card === top}
                  custom={exitDir}
                  onSwipe={(d) => void swipe(d)}
                />
              ))}
          </AnimatePresence>
        )}
      </div>

      <ActionBar
        disabled={!top}
        canRewind={lastPass !== null}
        onRewind={() => void rewind()}
        onNope={() => void swipe("left")}
        onSuper={() => void swipe("up")}
        onLike={() => void swipe("right")}
      />
      <p className="hidden text-center text-xs text-muted-foreground sm:block">
        Keyboard: ← pass · → interested · ↑ super swap · Z undo
      </p>
    </div>
  );
}
