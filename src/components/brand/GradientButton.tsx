import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Primary call-to-action: brand gradient, pill shape (docs/05 §4). */
export function GradientButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn(
        "bg-brand-gradient h-12 rounded-full border-0 px-6 font-bold text-white shadow-md hover:brightness-105",
        className,
      )}
      {...props}
    />
  );
}
