import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DevLoginPanel } from "@/components/auth/DevLoginPanel";

export const metadata: Metadata = {
  title: "Developer login",
  robots: { index: false, follow: false },
};

/** Test accounts for local development. In production this route does not exist. */
export default function DevLoginPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6">
      <h1 className="text-3xl font-extrabold">Developer login</h1>
      <p className="text-muted-foreground">
        Seeded test accounts. No password. Development only.
      </p>
      <DevLoginPanel />
    </main>
  );
}
