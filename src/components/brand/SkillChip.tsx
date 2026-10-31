import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChipKey =
  | "tech"
  | "language"
  | "music"
  | "business"
  | "creative"
  | "fitness"
  | "cooking"
  | "other";

// Full class names so Tailwind can see them.
const CHIP_CLASSES: Record<ChipKey, string> = {
  tech: "bg-chip-tech-bg text-chip-tech-fg",
  language: "bg-chip-language-bg text-chip-language-fg",
  music: "bg-chip-music-bg text-chip-music-fg",
  business: "bg-chip-business-bg text-chip-business-fg",
  creative: "bg-chip-creative-bg text-chip-creative-fg",
  fitness: "bg-chip-fitness-bg text-chip-fitness-fg",
  cooking: "bg-chip-cooking-bg text-chip-cooking-fg",
  other: "bg-chip-other-bg text-chip-other-fg",
};

/** Maps the API's skill categories onto the 8 chip colours of the design system. */
export function chipKey(category: string): ChipKey {
  switch (category.toLowerCase()) {
    case "programming":
    case "data":
    case "tech":
      return "tech";
    case "languages":
    case "language":
      return "language";
    case "music":
      return "music";
    case "business":
      return "business";
    case "design":
    case "creative":
    case "art":
      return "creative";
    case "fitness":
    case "wellness":
      return "fitness";
    case "cooking":
      return "cooking";
    default:
      return "other";
  }
}

export function SkillChip({
  category,
  children,
  className,
}: {
  category: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[13px] font-semibold",
        CHIP_CLASSES[chipKey(category)],
        className,
      )}
    >
      {children}
    </span>
  );
}
