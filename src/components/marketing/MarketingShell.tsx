import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Public navbar and footer for the indexable pages. No cookies, no auth calls: stays static. */
export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Link href="/" aria-label="SkillSwap home">
            <Logo />
          </Link>
          <nav className="flex items-center gap-1 text-sm font-semibold">
            <Link
              href="/skills"
              className="rounded-full px-4 py-2 hover:bg-muted"
            >
              Skills
            </Link>
            <ThemeToggle />
            <Link
              href="/login"
              className="bg-brand-gradient rounded-full px-5 py-2 font-bold text-white shadow-sm"
            >
              Join free
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border px-5 py-8 text-center text-sm text-muted-foreground">
        <Logo className="mb-2" />
        <p>Teach what you know. Learn what you want.</p>
      </footer>
    </div>
  );
}
