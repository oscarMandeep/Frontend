import type { Metadata } from "next";
import { Logo } from "@/components/brand/Logo";
import { MatchRing } from "@/components/brand/MatchRing";
import { SkillChip } from "@/components/brand/SkillChip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StyleguideDemos } from "./StyleguideDemos";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const BRAND = ["--brand-pink", "--brand-orange", "--brand", "--brand-hover"];
const ACTIONS = [
  ["--action-rewind", "Rewind"],
  ["--action-nope", "Nope"],
  ["--action-super", "Super"],
  ["--action-like", "Like"],
  ["--action-boost", "Boost"],
];
const NEUTRALS = [
  "--background",
  "--surface",
  "--card",
  "--border",
  "--text",
  "--text-secondary",
  "--text-muted",
];
const STATUS = ["--success", "--warning", "--danger", "--info"];
const CATEGORIES = [
  "Programming",
  "Languages",
  "Music",
  "Business",
  "Creative",
  "Fitness",
  "Cooking",
  "Other",
];

function Swatch({ token, label }: { token: string; label?: string }) {
  return (
    <div className="space-y-1">
      <div
        className="h-14 rounded-lg border border-border"
        style={{ background: `var(${token})` }}
      />
      <p className="text-xs font-semibold">{label ?? token}</p>
      <p className="text-muted-foreground text-xs">{token}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <main className="mx-auto w-full max-w-5xl space-y-10 p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Logo />
        <ThemeToggle />
      </header>

      <Section title="Brand">
        <div className="bg-brand-gradient h-20 rounded-2xl" />
        <p className="text-brand-gradient text-4xl font-extrabold">
          It&apos;s a match!
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {BRAND.map((t) => (
            <Swatch key={t} token={t} />
          ))}
        </div>
      </Section>

      <Section title="Swipe actions">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {ACTIONS.map(([t, l]) => (
            <Swatch key={t} token={t} label={l} />
          ))}
        </div>
      </Section>

      <Section title="Neutrals">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
          {NEUTRALS.map((t) => (
            <Swatch key={t} token={t} />
          ))}
        </div>
      </Section>

      <Section title="Status">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATUS.map((t) => (
            <Swatch key={t} token={t} />
          ))}
        </div>
      </Section>

      <Section title="Skill chips">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <SkillChip key={c} category={c}>
              {c}
            </SkillChip>
          ))}
        </div>
      </Section>

      <Section title="Match ring">
        <div className="flex flex-wrap items-center gap-8">
          <MatchRing score={35} />
          <MatchRing score={68} />
          <MatchRing score={92} size={96} />
        </div>
      </Section>

      <Section title="Components">
        <StyleguideDemos />
      </Section>
    </main>
  );
}
