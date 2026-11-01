"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock,
  Clock,
  ExternalLink,
  Loader2,
  MapPin,
  MessageCircle,
  Video,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { SkillChip } from "@/components/brand/SkillChip";
import { UserAvatar } from "@/components/brand/UserAvatar";
import { isApiError } from "@/lib/api/fetcher";
import type { SessionDto, SessionStatus } from "@/lib/api/generated/model";
import {
  cancelSession,
  completeSession,
  confirmSession,
  reportNoShow,
} from "@/lib/api/generated/sessions/sessions";
import { useNow } from "@/hooks/use-now";
import { cn } from "@/lib/utils";
import { ReviewDialog } from "./ReviewDialog";

const STATUS_STYLE: Record<
  SessionStatus,
  { label: string; className: string }
> = {
  PROPOSED: {
    label: "Waiting for confirmation",
    className: "bg-warning/15 text-[#b7791f] dark:text-warning",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-info/15 text-[#1b6fd1] dark:text-info",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-success/15 text-[#14935a] dark:text-success",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground",
  },
  NO_SHOW: { label: "No-show", className: "bg-danger/15 text-danger" },
};

const when = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export function SessionCard({
  session,
  myId,
}: {
  session: SessionDto;
  myId: string;
}) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const iTeach = session.teacher.id === myId;
  const other = iTeach ? session.learner : session.teacher;
  const now = useNow();
  const started = new Date(session.startsAt).getTime() <= now;
  const status = STATUS_STYLE[session.status];

  async function run(
    name: string,
    fn: () => Promise<unknown>,
    success: string,
  ) {
    setBusy(name);
    try {
      await fn();
      toast.success(success);
      await queryClient.invalidateQueries({ queryKey: ["/v1/sessions"] });
      void queryClient.invalidateQueries({ queryKey: ["/v1/wallet"] });
      void queryClient.invalidateQueries({ queryKey: ["/v1/me"] });
    } catch (err) {
      toast.error(
        isApiError(err)
          ? err.error.code === "INSUFFICIENT_CREDITS"
            ? "The learner does not have enough credits for this session."
            : err.error.message
          : "Something went wrong. Try again.",
      );
    } finally {
      setBusy(null);
    }
  }

  const needsMyConfirm =
    session.status === "PROPOSED" && session.proposedById !== myId;
  const btn =
    "inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-bold disabled:opacity-60";

  return (
    <li className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <UserAvatar
          id={other.id}
          name={other.name}
          src={other.avatarUrl}
          className="size-12"
          textClassName="text-base"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">
            {iTeach ? "You teach" : "You learn from"} {other.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <SkillChip category={session.skill.category}>
              {session.skill.name}
            </SkillChip>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-bold",
                status.className,
              )}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <dl className="mt-4 grid gap-1.5 text-sm text-secondary-foreground">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-4 text-muted-foreground" />
          <dd>{when(session.startsAt)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          <dd>{session.durationMin} minutes</dd>
        </div>
        <div className="flex items-center gap-2">
          {session.mode === "ONLINE" ? (
            <Video className="size-4 text-muted-foreground" />
          ) : (
            <MapPin className="size-4 text-muted-foreground" />
          )}
          <dd>
            {session.mode === "ONLINE"
              ? "Online"
              : (session.location ?? "In person")}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {needsMyConfirm && (
          <>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() =>
                run(
                  "confirm",
                  () => confirmSession(session.id),
                  "Session confirmed",
                )
              }
              className={cn(btn, "bg-brand-gradient text-white")}
            >
              {busy === "confirm" && (
                <Loader2 className="size-4 animate-spin" />
              )}{" "}
              Confirm
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() =>
                run("cancel", () => cancelSession(session.id, {}), "Declined")
              }
              className={cn(btn, "border border-border hover:bg-muted")}
            >
              Decline
            </button>
          </>
        )}
        {session.status === "PROPOSED" && !needsMyConfirm && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() =>
              run(
                "cancel",
                () => cancelSession(session.id, {}),
                "Proposal withdrawn",
              )
            }
            className={cn(btn, "border border-border hover:bg-muted")}
          >
            Withdraw
          </button>
        )}
        {session.status === "CONFIRMED" && session.meetingUrl && (
          <a
            href={session.meetingUrl}
            target="_blank"
            rel="noreferrer"
            className={cn(btn, "bg-brand-gradient text-white")}
          >
            <ExternalLink className="size-4" /> Join call
          </a>
        )}
        {session.status === "CONFIRMED" && started && (
          <>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() =>
                run(
                  "complete",
                  () => completeSession(session.id),
                  "Session completed. Credits updated.",
                )
              }
              className={cn(btn, "bg-like text-white")}
            >
              {busy === "complete" && (
                <Loader2 className="size-4 animate-spin" />
              )}{" "}
              Mark complete
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() =>
                run(
                  "noshow",
                  () => reportNoShow(session.id),
                  "No-show reported",
                )
              }
              className={cn(btn, "border border-border hover:bg-muted")}
            >
              They did not show up
            </button>
          </>
        )}
        {session.status === "CONFIRMED" && !started && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() =>
              run(
                "cancel",
                () => cancelSession(session.id, {}),
                "Session cancelled",
              )
            }
            className={cn(btn, "border border-border hover:bg-muted")}
          >
            Cancel
          </button>
        )}
        {session.status === "COMPLETED" && !session.myReview && (
          <button
            type="button"
            onClick={() => setReviewing(true)}
            className={cn(btn, "bg-brand-gradient text-white")}
          >
            Leave a review
          </button>
        )}
        {session.matchId && (
          <Link
            href={`/chat/${session.matchId}`}
            className={cn(btn, "border border-border hover:bg-muted")}
          >
            <MessageCircle className="size-4" /> Chat
          </Link>
        )}
      </div>
      {session.myReview && (
        <p className="mt-3 text-sm text-muted-foreground">
          You rated this {session.myReview.rating} / 5.
        </p>
      )}

      <ReviewDialog
        sessionId={session.id}
        personName={other.name}
        open={reviewing}
        onOpenChange={setReviewing}
      />
    </li>
  );
}
