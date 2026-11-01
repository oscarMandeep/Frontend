import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleButton } from "@/components/auth/GoogleButton";

export const metadata: Metadata = {
  title: "Create your account — SkillSwap",
  description:
    "Join SkillSwap free. Teach what you know, learn what you want, and start with 2 time credits.",
};

const PERKS = [
  "Free to join, no card needed",
  "2 time credits to start learning right away",
  "Your email is never shown to anyone",
];

export default function RegisterPage() {
  return (
    <AuthLayout>
      <h1 className="text-4xl font-extrabold tracking-tight">
        Create your account
      </h1>
      <p className="mt-2 text-muted-foreground">
        It takes about two minutes. Then you can start swiping.
      </p>

      <ul className="mt-6 flex flex-col gap-2.5">
        {PERKS.map((perk) => (
          <li
            key={perk}
            className="flex items-center gap-2.5 text-[15px] font-medium"
          >
            <span className="bg-brand-gradient grid size-5 shrink-0 place-items-center rounded-full text-white">
              <Check className="size-3" strokeWidth={4} />
            </span>
            {perk}
          </li>
        ))}
      </ul>

      <GoogleButton label="Sign up with Google" className="mt-8" />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
