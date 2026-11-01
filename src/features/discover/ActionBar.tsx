"use client";

import { Heart, RotateCcw, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

function RoundButton({
  label,
  onClick,
  disabled,
  size,
  color,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  size: "sm" | "lg";
  color: "rewind" | "nope" | "super" | "like";
  children: React.ReactNode;
}) {
  // Full class names so Tailwind sees them: soft shadow, fills with its colour on hover.
  const colors = {
    rewind: "text-rewind hover:bg-rewind",
    nope: "text-nope hover:bg-nope",
    super: "text-super hover:bg-super",
    like: "text-like hover:bg-like",
  }[color];
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid place-items-center rounded-full border border-border bg-card shadow-lg transition hover:scale-110 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-40",
        size === "lg" ? "size-16" : "size-12",
        colors,
      )}
    >
      {children}
    </button>
  );
}

export function ActionBar({
  onRewind,
  onNope,
  onSuper,
  onLike,
  canRewind,
  disabled,
}: {
  onRewind: () => void;
  onNope: () => void;
  onSuper: () => void;
  onLike: () => void;
  canRewind: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-5">
      <RoundButton
        label="Undo last pass (Z)"
        size="sm"
        color="rewind"
        onClick={onRewind}
        disabled={!canRewind || disabled}
      >
        <RotateCcw className="size-5" strokeWidth={3} />
      </RoundButton>
      <RoundButton
        label="Pass (←)"
        size="lg"
        color="nope"
        onClick={onNope}
        disabled={disabled}
      >
        <X className="size-8" strokeWidth={3.5} />
      </RoundButton>
      <RoundButton
        label="Super swap (↑)"
        size="sm"
        color="super"
        onClick={onSuper}
        disabled={disabled}
      >
        <Star className="size-5" strokeWidth={3} />
      </RoundButton>
      <RoundButton
        label="Interested (→)"
        size="lg"
        color="like"
        onClick={onLike}
        disabled={disabled}
      >
        <Heart className="size-8" strokeWidth={3.5} />
      </RoundButton>
    </div>
  );
}
