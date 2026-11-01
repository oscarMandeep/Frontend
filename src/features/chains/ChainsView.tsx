"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Clock, Loader2, Repeat2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/api/fetcher";
import { useGetMe } from "@/lib/api/generated/me/me";
import { respondToChain } from "@/lib/api/generated/chains/chains";
import { useListChains } from "@/lib/api/generated/chains/chains";
import type { ChainDto } from "@/lib/api/generated/model";
import { cn } from "@/lib/utils";
import { ChainLoop } from "./ChainLoop";

const STATUS = {
  PROPOSED: "Waiting for everyone",
  ACCEPTED: "Everyone said yes",
  REJECTED: "Someone declined",
  EXPIRED: "Expired",
} as const;

function expiry(iso: string) {
  const hours = Math.round((new Date(iso).getTime() - Date.now()) / 36e5);
  if (hours <= 0) return "expires soon";
  return hours < 48
    ? `expires in ${hours}h`
    : `expires in ${Math.round(hours / 24)} days`;
}

function ChainCard({ chain, myId }: { chain: ChainDto; myId: string }) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<boolean | null>(null);
  const members = [...chain.members].sort((a, b) => a.position - b.position);
  const mine = members.find((m) => m.user.id === myId);
  const canRespond = chain.status === "PROPOSED" && mine?.accepted === null;

  async function respond(accept: boolean) {
    setBusy(accept);
    try {
      await respondToChain(chain.id, { accept });
      toast.success(
        accept ? "You are in! Waiting for the others." : "Declined.",
      );
      await queryClient.invalidateQueries({ queryKey: ["/v1/chains"] });
    } catch (err) {
      toast.error(
        isApiError(err) ? err.error.message : "Could not save your answer.",
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-full bg-accent px-3 py-1 text-sm font-bold text-brand">
          {chain.score}% fit
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-4" /> {STATUS[chain.status]}
          {chain.status === "PROPOSED" && ` · ${expiry(chain.expiresAt)}`}
        </span>
      </div>

      <ChainLoop members={members} complete={chain.status === "ACCEPTED"} />

      <ol className="mt-5 flex flex-col gap-2">
        {members.map((m, i) => {
          const next = members[(i + 1) % members.length];
          return (
            <li
              key={m.position}
              className="flex flex-wrap items-center gap-x-1.5 rounded-xl bg-surface px-3 py-2 text-sm"
            >
              <b>{m.user.id === myId ? "You" : m.user.name.split(" ")[0]}</b>{" "}
              teach{m.user.id === myId ? "" : "es"}{" "}
              <b className="text-brand">{m.teachSkill.name}</b>{" "}
              <ArrowRight className="size-3.5 text-muted-foreground" />{" "}
              <b>
                {next.user.id === myId ? "you" : next.user.name.split(" ")[0]}
              </b>
            </li>
          );
        })}
      </ol>

      {canRespond && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => respond(false)}
            className="h-12 rounded-full border border-border font-bold hover:bg-muted disabled:opacity-60"
          >
            {busy === false ? (
              <Loader2 className="mx-auto size-5 animate-spin" />
            ) : (
              "Decline"
            )}
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => respond(true)}
            className={cn(
              "bg-brand-gradient h-12 rounded-full font-bold text-white shadow-md hover:brightness-105 disabled:opacity-60",
            )}
          >
            {busy === true ? (
              <Loader2 className="mx-auto size-5 animate-spin" />
            ) : (
              "Accept"
            )}
          </button>
        </div>
      )}
      {chain.status === "ACCEPTED" && (
        <p className="mt-4 rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-[#14935a] dark:text-success">
          Everyone accepted. Open your matches to start chatting and scheduling.
        </p>
      )}
    </li>
  );
}

export function ChainsView() {
  const myId = useGetMe().data?.data.id;
  const chains = useListChains();
  const items = chains.data?.data ?? [];

  if (chains.isLoading) return <Skeleton className="h-96 rounded-3xl" />;
  if (chains.isError)
    return (
      <p className="py-10 text-center text-muted-foreground">
        Could not load your chains.
      </p>
    );

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border px-6 py-14 text-center">
        <span className="bg-brand-gradient grid size-14 place-items-center rounded-full text-white">
          <Repeat2 className="size-7" />
        </span>
        <h2 className="text-xl font-extrabold">No swap chains yet</h2>
        <p className="max-w-sm text-muted-foreground">
          When you teach what someone wants, they teach what a third person
          wants, and that person teaches you, we will show the loop here. We
          look every 30 minutes.
        </p>
        <Link href="/profile" className="mt-1 text-sm font-bold text-brand">
          Add more skills to find more loops
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-6">
      {myId && items.map((c) => <ChainCard key={c.id} chain={c} myId={myId} />)}
    </ul>
  );
}
