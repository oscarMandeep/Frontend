import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftRight, Coins, MessageCircle, Repeat2, Sparkles, Users } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { SignInPanel } from "@/components/auth/SignInPanel";
import { HeroCards } from "@/components/marketing/HeroCards";
import { ThemeToggle } from "@/components/ThemeToggle";
import { publicFetch } from "@/lib/api/public";
import type { PublicStatsDto } from "@/lib/api/generated/model";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "SkillSwap — teach what you know, learn what you want",
  description:
    "Swipe to find people who teach what you want to learn and want what you can teach. Match, chat and swap skills for free.",
};

async function getStats(): Promise<PublicStatsDto | null> {
  try {
    return await publicFetch<PublicStatsDto>("/stats", { revalidate: 3600, tags: ["stats"] });
  } catch {
    return null; // API asleep or down: the page still renders
  }
}

const STEPS = [
  {
    icon: Sparkles,
    title: "Tell us your skills",
    text: "List what you can teach and what you want to learn, and when you are free.",
  },
  {
    icon: Users,
    title: "Swipe on a ranked deck",
    text: "People are ranked by match %. Interested in someone? Swipe right. Both swipe right and it is a match.",
  },
  {
    icon: MessageCircle,
    title: "Chat and book a session",
    text: "Talk in real time, pick a time that works for both of you, and learn over video or in person.",
  },
];

const PERKS = [
  {
    icon: ArrowLeftRight,
    title: "Direct swaps",
    text: "You teach Python, they teach Spanish. Everyone learns, nobody pays.",
  },
  {
    icon: Coins,
    title: "Time credits",
    text: "No perfect swap? Pay with credits you earned by teaching someone else.",
  },
  {
    icon: Repeat2,
    title: "Swap chains",
    text: "A teaches B, B teaches C, C teaches A. We find the loops no one could see alone.",
  },
];

export default async function LandingPage() {
  const stats = await getStats();
  const numbers = stats
    ? [
        { value: stats.users, label: "people" },
        { value: stats.skills, label: "skills" },
        { value: stats.sessions, label: "sessions" },
      ]
    : [];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero: fills the first screen, gradient background, sign in right here. */}
      <section className="bg-brand-gradient relative isolate flex min-h-screen flex-col overflow-hidden text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-40 -z-10 size-[520px] rounded-full bg-white/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -bottom-40 -z-10 size-[480px] rounded-full bg-[#ffb199]/40 blur-3xl"
        />

        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
          <span className="rounded-full bg-white px-4 py-1.5 shadow-md">
            <Logo />
          </span>
          <nav className="flex items-center gap-2 text-sm font-semibold">
            <Link href="/skills" className="hidden rounded-full px-4 py-2 hover:bg-white/15 sm:block">
              Browse skills
            </Link>
            <Link href="/login" className="rounded-full bg-white/20 px-4 py-2 backdrop-blur hover:bg-white/30">
              Log in
            </Link>
            <ThemeToggle />
          </nav>
        </header>

        <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 pb-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="text-5xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
              Swap what you
              <br />
              know for what
              <br />
              you want.
            </h1>
            <p className="mt-5 max-w-md text-lg text-white/90">
              SkillSwap matches you with people who teach what you want to learn, and want what you can
              teach. Swipe, match, chat, learn.
            </p>
            <SignInPanel className="mt-8" />
            <p className="mt-4 text-sm text-white/80">Free to join. Your email is never shown to anyone.</p>
          </div>
          <HeroCards />
        </div>
      </section>

      <main className="bg-background">
        {numbers.length > 0 && (
          <section className="border-b border-border">
            <dl className="mx-auto grid max-w-3xl grid-cols-3 gap-4 px-5 py-8 text-center">
              {numbers.map((n) => (
                <div key={n.label}>
                  <dd className="text-brand-gradient text-4xl font-extrabold">{n.value.toLocaleString()}</dd>
                  <dt className="text-sm text-muted-foreground">{n.label}</dt>
                </div>
              ))}
            </dl>
          </section>
        )}

        <section className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-center text-3xl font-extrabold sm:text-4xl">How it works</h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-3xl border border-border bg-card p-7 shadow-sm">
                <span className="bg-brand-gradient grid size-12 place-items-center rounded-2xl text-white shadow-md">
                  <s.icon className="size-6" />
                </span>
                <p className="mt-5 text-sm font-bold text-muted-foreground">Step {i + 1}</p>
                <h3 className="mt-1 text-xl font-bold">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="text-center text-3xl font-extrabold sm:text-4xl">More ways to learn for free</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {PERKS.map((p) => (
                <div key={p.title} className="rounded-3xl bg-card p-7 shadow-sm">
                  <p.icon className="size-8 text-brand" />
                  <h3 className="mt-4 text-xl font-bold">{p.title}</h3>
                  <p className="mt-2 text-muted-foreground">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {stats && stats.topSwaps.length > 0 && (
          <section className="mx-auto max-w-4xl px-5 py-20">
            <h2 className="text-center text-3xl font-extrabold sm:text-4xl">Popular swaps</h2>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {stats.topSwaps.map((s) => (
                <li
                  key={`${s.from.slug}-${s.to.slug}`}
                  className="flex items-center justify-between rounded-2xl border border-border bg-card px-5 py-4"
                >
                  <span className="font-bold">
                    {s.from.name} <ArrowLeftRight className="mx-1 inline size-4 text-brand" /> {s.to.name}
                  </span>
                  <span className="text-sm text-muted-foreground">{s.count} people</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="bg-brand-gradient text-white">
          <div className="mx-auto flex max-w-3xl flex-col items-center px-5 py-20 text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Your next skill is one swipe away.</h2>
            <SignInPanel className="mt-8" />
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background px-5 py-8 text-center text-sm text-muted-foreground">
        <Logo className="mb-2" />
        <p>Teach what you know. Learn what you want.</p>
      </footer>
    </div>
  );
}
