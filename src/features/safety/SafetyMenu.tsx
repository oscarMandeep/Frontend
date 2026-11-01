"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Archive, Ban, Flag, Loader2, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isApiError } from "@/lib/api/fetcher";
import { archiveMatch } from "@/lib/api/generated/matches/matches";
import { blockUser, reportUser } from "@/lib/api/generated/safety/safety";
import type { UserCardDto } from "@/lib/api/generated/model";

type View = "menu" | "report" | "block" | null;

/** Report, block or archive, from a chat. Blocking also closes the match for both people. */
export function SafetyMenu({
  matchId,
  person,
}: {
  matchId: string;
  person: UserCardDto;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const first = person.name.split(" ")[0];

  async function run(
    fn: () => Promise<unknown>,
    success: string,
    leave: boolean,
  ) {
    setBusy(true);
    try {
      await fn();
      toast.success(success);
      await queryClient.invalidateQueries({ queryKey: ["/v1/matches"] });
      setView(null);
      if (leave) router.push("/matches");
    } catch (err) {
      toast.error(
        isApiError(err)
          ? err.error.message
          : "Something went wrong. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  const row =
    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-semibold hover:bg-muted";

  return (
    <>
      <button
        type="button"
        aria-label="More options"
        onClick={() => setView("menu")}
        className="grid size-10 place-items-center rounded-full hover:bg-muted"
      >
        <MoreVertical className="size-5" />
      </button>

      <Dialog
        open={view !== null}
        onOpenChange={(open) => !open && setView(null)}
      >
        <DialogContent className="gap-4">
          {view === "menu" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-extrabold">
                  {person.name}
                </DialogTitle>
                <DialogDescription>@{person.username}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col">
                <button
                  type="button"
                  className={row}
                  onClick={() => setView("report")}
                >
                  <Flag className="size-5 text-warning" /> Report {first}
                </button>
                <button
                  type="button"
                  className={row}
                  onClick={() => setView("block")}
                >
                  <Ban className="size-5 text-nope" /> Block {first}
                </button>
                <button
                  type="button"
                  className={row}
                  onClick={() =>
                    run(() => archiveMatch(matchId), "Match archived", true)
                  }
                >
                  <Archive className="size-5 text-muted-foreground" /> Archive
                  this match
                </button>
              </div>
            </>
          )}

          {view === "report" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-extrabold">
                  Report {first}
                </DialogTitle>
                <DialogDescription>
                  Tell us what happened. Only our team sees this.
                </DialogDescription>
              </DialogHeader>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                maxLength={500}
                aria-label="What happened"
                placeholder="e.g. Rude messages, fake profile, asked for money"
                className="resize-none rounded-2xl border border-input bg-surface p-3 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
              />
              <button
                type="button"
                disabled={busy || reason.trim().length < 3}
                onClick={() =>
                  run(
                    () =>
                      reportUser({ userId: person.id, reason: reason.trim() }),
                    "Report sent. Thank you.",
                    false,
                  )
                }
                className="bg-brand-gradient inline-flex h-12 items-center justify-center rounded-full font-bold text-white disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  "Send report"
                )}
              </button>
            </>
          )}

          {view === "block" && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-extrabold">
                  Block {first}?
                </DialogTitle>
                <DialogDescription>
                  You will not see each other any more, and this chat closes for
                  both of you.
                </DialogDescription>
              </DialogHeader>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  run(
                    () => blockUser({ userId: person.id }),
                    `${first} is blocked`,
                    true,
                  )
                }
                className="inline-flex h-12 items-center justify-center rounded-full bg-nope font-bold text-white disabled:opacity-50"
              >
                {busy ? <Loader2 className="size-5 animate-spin" /> : "Block"}
              </button>
              <button
                type="button"
                onClick={() => setView("menu")}
                className="h-11 rounded-full font-semibold hover:bg-muted"
              >
                Cancel
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
