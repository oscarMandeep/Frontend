import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SignInPanel } from "@/components/auth/SignInPanel";
import { HeroCards } from "@/components/marketing/HeroCards";

export const metadata: Metadata = {
  title: "Log in — SkillSwap",
  description: "Log in or join SkillSwap with Google.",
};

export default function LoginPage() {
  return (
    <main className="bg-brand-gradient relative isolate flex min-h-screen items-center overflow-hidden text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 -z-10 size-[520px] rounded-full bg-white/20 blur-3xl"
      />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-10 lg:grid-cols-2">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <Link
            href="/"
            className="rounded-full bg-white px-4 py-1.5 shadow-md"
            aria-label="SkillSwap home"
          >
            <Logo />
          </Link>
          <h1 className="mt-8 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
            Welcome back.
            <br />
            Ready to swap?
          </h1>
          <p className="mt-4 max-w-md text-lg text-white/90">
            Log in to see your matches, messages and sessions, or join in one
            tap.
          </p>
          <SignInPanel className="mt-8" />
          <p className="mt-4 max-w-xs text-xs text-white/80">
            By continuing you agree to be kind. Report anyone who is not.
          </p>
        </div>
        <div className="hidden lg:block">
          <HeroCards />
        </div>
      </div>
    </main>
  );
}
