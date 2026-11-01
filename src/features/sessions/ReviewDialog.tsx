"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { GradientButton } from "@/components/brand/GradientButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isApiError } from "@/lib/api/fetcher";
import { createReview } from "@/lib/api/generated/reviews/reviews";
import { cn } from "@/lib/utils";

export function ReviewDialog({
  sessionId,
  personName,
  open,
  onOpenChange,
}: {
  sessionId: string;
  personName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await createReview({
        sessionId,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Thanks for your review!");
      void queryClient.invalidateQueries({ queryKey: ["/v1/sessions"] });
      onOpenChange(false);
    } catch (err) {
      toast.error(
        isApiError(err) ? err.error.message : "Could not save your review.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            How was your session?
          </DialogTitle>
          <DialogDescription>
            Your review helps others decide who to learn from.
          </DialogDescription>
        </DialogHeader>
        <div
          className="flex justify-center gap-1"
          role="radiogroup"
          aria-label="Rating"
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              className="rounded-full p-1 transition hover:scale-110"
            >
              <Star
                className={cn(
                  "size-10",
                  n <= rating
                    ? "fill-action-rewind text-action-rewind"
                    : "text-border",
                )}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder={`Say something about learning with ${personName.split(" ")[0]} (optional)`}
          aria-label="Comment"
          className="resize-none rounded-2xl border border-input bg-surface p-3 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
        />
        <GradientButton
          onClick={submit}
          disabled={rating === 0 || saving}
          className="w-full"
        >
          {saving ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            "Submit review"
          )}
        </GradientButton>
      </DialogContent>
    </Dialog>
  );
}
