"use client";

import { ArrowDownLeft, ArrowUpRight, Coins } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetWallet } from "@/lib/api/generated/wallet/wallet";
import { cn } from "@/lib/utils";

const REASON: Record<string, string> = {
  SIGNUP_BONUS: "Welcome bonus",
  TAUGHT_SESSION: "You taught a session",
  LEARNED_SESSION: "You learned in a session",
  REFUND: "Refund",
};

const reasonLabel = (r: string) =>
  REASON[r] ?? r.toLowerCase().replaceAll("_", " ");

export function WalletView() {
  const wallet = useGetWallet({ limit: 50 });
  const data = wallet.data?.data;

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-brand-gradient rounded-3xl p-6 text-white shadow-lg">
        <p className="flex items-center gap-2 text-sm font-semibold text-white/85">
          <Coins className="size-4" /> Time credits
        </p>
        {wallet.isLoading ? (
          <Skeleton className="mt-2 h-14 w-24 bg-white/30" />
        ) : (
          <p className="mt-1 text-6xl font-extrabold">{data?.balance ?? 0}</p>
        )}
        <p className="mt-3 max-w-sm text-sm text-white/90">
          Teach to earn credits, spend them to learn when there is no direct
          swap. One credit is one hour.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-extrabold">History</h2>
        {wallet.isLoading && <Skeleton className="h-16 rounded-2xl" />}
        {data && data.ledger.items.length === 0 && (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">
            No credit activity yet.
          </p>
        )}
        <ul className="flex flex-col gap-2">
          {data?.ledger.items.map((tx) => {
            const earned = tx.amount > 0;
            return (
              <li
                key={tx.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
              >
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-full",
                    earned
                      ? "bg-success/15 text-like"
                      : "bg-danger/10 text-nope",
                  )}
                >
                  {earned ? (
                    <ArrowDownLeft className="size-5" />
                  ) : (
                    <ArrowUpRight className="size-5" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold capitalize">
                    {reasonLabel(tx.reason)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(tx.createdAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </span>
                <span
                  className={cn(
                    "text-lg font-extrabold",
                    earned ? "text-like" : "text-nope",
                  )}
                >
                  {earned ? "+" : ""}
                  {tx.amount}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
