import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { HeroCards } from "@/components/marketing/HeroCards";
import { ThemeToggle } from "@/components/ThemeToggle";

/** Form on one side, brand panel on the other (desktop). On a phone the form comes first. */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col bg-background">
        <header className="flex items-center justify-between px-6 py-5">
          <Link href="/" aria-label="SkillSwap home">
            <Logo />
          </Link>
          <ThemeToggle />
        </header>
        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 pb-16">
          {children}
        </main>
        <footer className="px-6 pb-6 text-center text-xs text-muted-foreground">
          By continuing you agree to be kind to everyone you swap with.
        </footer>
      </div>

      <aside
        aria-hidden="true"
        className="bg-brand-gradient relative isolate hidden items-center justify-center overflow-hidden lg:flex"
      >
        <div className="pointer-events-none absolute -top-32 -left-32 -z-10 size-[480px] rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-32 -z-10 size-[420px] rounded-full bg-[#ffb199]/40 blur-3xl" />
        <div className="flex flex-col items-center gap-10 px-10 text-center text-white">
          <HeroCards />
          <p className="max-w-xs text-2xl font-extrabold">
            Teach what you know. Learn what you want.
          </p>
        </div>
      </aside>
    </div>
  );
}
