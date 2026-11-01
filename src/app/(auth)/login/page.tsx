import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { GoogleButton } from "@/components/auth/GoogleButton";

export const metadata: Metadata = {
  title: "Log in — SkillSwap",
  description:
    "Log in to SkillSwap to see your matches, messages and sessions.",
};

export default function LoginPage() {
  return (
    <AuthLayout>
      <h1 className="text-4xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-muted-foreground">
        Log in to see your matches, messages and sessions.
      </p>

      <GoogleButton className="mt-8" />

      <p className="mt-8 text-center text-sm text-muted-foreground">
        New to SkillSwap?{" "}
        <Link href="/register" className="font-bold text-brand hover:underline">
          Create an account
        </Link>
      </p>
      {process.env.NODE_ENV === "development" && (
        <Link
          href="/dev-login"
          className="mt-6 text-center text-xs text-muted-foreground underline"
        >
          Developer login (test accounts)
        </Link>
      )}
    </AuthLayout>
  );
}
