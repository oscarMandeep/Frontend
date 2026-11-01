import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <h1 className="text-brand-gradient text-7xl font-extrabold">404</h1>
        <p className="text-lg text-muted-foreground">
          We could not find that page.
        </p>
        <Link
          href="/"
          className="bg-brand-gradient inline-flex h-12 items-center rounded-full px-7 font-bold text-white shadow-md"
        >
          Back to SkillSwap
        </Link>
      </div>
    </main>
  );
}
