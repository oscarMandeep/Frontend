/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

// Soft brand-adjacent gradients so people without a photo still look distinct.
const GRADIENTS = [
  "from-[#fd267a] to-[#ff6036]",
  "from-[#3ca4ff] to-[#a962f5]",
  "from-[#21d07c] to-[#3ca4ff]",
  "from-[#f5b748] to-[#fd267a]",
  "from-[#a962f5] to-[#fd267a]",
  "from-[#ff6036] to-[#f5b748]",
];

function hash(text: string) {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();
}

/** Photo when there is one, otherwise initials on a gradient picked from the id. */
export function UserAvatar({
  id,
  name,
  src,
  className,
  textClassName,
}: {
  id: string;
  name: string;
  src?: string | null;
  className?: string;
  textClassName?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("size-12 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        "inline-grid size-12 place-items-center rounded-full bg-gradient-to-br font-extrabold text-white",
        GRADIENTS[hash(id) % GRADIENTS.length],
        className,
      )}
    >
      <span className={textClassName}>{initials(name)}</span>
    </span>
  );
}

/** Same gradient, as a class, for full-bleed card backgrounds. */
export function avatarGradient(id: string) {
  return GRADIENTS[hash(id) % GRADIENTS.length];
}
