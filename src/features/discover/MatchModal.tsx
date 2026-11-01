"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeftRight, Coins } from "lucide-react";
import { UserAvatar } from "@/components/brand/UserAvatar";
import { useGetMe } from "@/lib/api/generated/me/me";
import { useMatchModal } from "@/stores/match-modal";
import { Confetti } from "./Confetti";

/** Global "It's a match!" overlay. Opened by a swipe or by the match:new socket event. */
export function MatchModal() {
  const { match, close } = useMatchModal();
  const me = useGetMe().data?.data;
  if (!match || !me) return null;
  const other = match.otherUser;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="It's a match"
      className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-5 backdrop-blur-sm"
      onKeyDown={(e) => e.key === "Escape" && close()}
    >
      <Confetti />
      <div className="relative flex w-full max-w-sm flex-col items-center gap-6 text-center text-white">
        <motion.h2
          initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: -4 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
          className="text-brand-gradient text-6xl leading-none font-extrabold italic"
        >
          It&apos;s a match!
        </motion.h2>

        <div className="flex items-center justify-center">
          <motion.div initial={{ x: -140, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", damping: 16 }}>
            <span className="bg-brand-gradient block rounded-full p-1">
              <UserAvatar id={me.id} name={me.name} src={me.avatarUrl} className="size-28 border-4 border-black" textClassName="text-3xl" />
            </span>
          </motion.div>
          <motion.div initial={{ x: 140, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", damping: 16 }} className="-ml-4">
            <span className="bg-brand-gradient block rounded-full p-1">
              <UserAvatar id={other.id} name={other.name} src={other.avatarUrl} className="size-28 border-4 border-black" textClassName="text-3xl" />
            </span>
          </motion.div>
        </div>

        <div>
          <p className="text-lg font-bold">You and {other.name.split(" ")[0]} matched</p>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[15px] font-semibold">
            {match.teachSkill ? (
              <>
                {match.teachSkill.name} <ArrowLeftRight className="size-4" /> {match.learnSkill.name}
              </>
            ) : (
              <>
                <Coins className="size-4 text-action-rewind" /> You learn {match.learnSkill.name} with credits
              </>
            )}
          </p>
          <p className="mt-2 text-sm text-white/70">{match.score}% match</p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link
            href={`/chat/${match.matchId}`}
            onClick={close}
            className="bg-brand-gradient flex h-12 items-center justify-center rounded-full font-bold text-white shadow-md hover:brightness-105"
          >
            Send a message
          </Link>
          <button
            type="button"
            onClick={close}
            className="h-12 rounded-full font-semibold text-white/80 hover:bg-white/10"
          >
            Keep swiping
          </button>
        </div>
      </div>
    </div>
  );
}
