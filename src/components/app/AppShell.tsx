"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Coins,
  Compass,
  Heart,
  Repeat2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { UserAvatar } from "@/components/brand/UserAvatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useGetMe } from "@/lib/api/generated/me/me";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/matches", label: "Matches", icon: Heart },
  { href: "/sessions", label: "Sessions", icon: CalendarDays },
  { href: "/chains", label: "Chains", icon: Repeat2 },
  { href: "/profile", label: "Profile", icon: UserRound },
];

const isActive = (path: string, href: string) => path === href || path.startsWith(`${href}/`);

function CreditsPill({ credits }: { credits?: number }) {
  return (
    <Link
      href="/wallet"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-bold shadow-sm hover:bg-muted"
      aria-label={`${credits ?? 0} time credits. Open wallet`}
    >
      <Coins className="size-4 text-action-rewind" />
      {credits ?? "–"}
    </Link>
  );
}

/** Sidebar on desktop, bottom bar on mobile. Chat gets the whole width on small screens. */
export function AppShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const me = useGetMe();
  const profile = me.data?.data;

  // Onboarding is a focused flow with its own header.
  if (path.startsWith("/onboarding")) return <>{children}</>;

  const inChat = path.startsWith("/chat/");

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card p-4 lg:flex">
        <Link href="/discover" className="px-2 py-3">
          <Logo />
        </Link>
        <nav className="mt-4 flex flex-col gap-1" aria-label="Main">
          {NAV.map((item) => {
            const active = isActive(path, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition-colors",
                  active ? "bg-accent text-brand" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
          {profile && (
            <Link href="/profile" className="flex min-w-0 items-center gap-2">
              <UserAvatar id={profile.id} name={profile.name} src={profile.avatarUrl} className="size-9" textClassName="text-xs" />
              <span className="truncate text-sm font-semibold">{profile.name}</span>
            </Link>
          )}
          <div className="flex items-center gap-1">
            <CreditsPill credits={profile?.credits} />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {!inChat && (
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-2.5 backdrop-blur lg:hidden">
            <Link href="/discover">
              <Logo />
            </Link>
            <div className="flex items-center gap-1">
              <CreditsPill credits={profile?.credits} />
              <ThemeToggle />
            </div>
          </header>
        )}
        <main className={cn("flex-1", !inChat && "pb-20 lg:pb-0")}>{children}</main>
      </div>

      {!inChat && (
        <nav
          aria-label="Main"
          className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        >
          {NAV.map((item) => {
            const active = isActive(path, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold",
                  active ? "text-brand" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-6" strokeWidth={active ? 2.6 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
