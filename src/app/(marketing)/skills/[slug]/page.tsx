import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { TeacherCard } from "@/components/marketing/TeacherCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { publicFetch } from "@/lib/api/public";
import type {
  PublicSkillDto,
  PublicSkillSummaryDto,
} from "@/lib/api/generated/model";
import { buildMetadata, siteUrl } from "@/lib/seo";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const top = await publicFetch<PublicSkillSummaryDto[]>("/skills?limit=50", {
      revalidate: 3600,
      tags: ["skills"],
    });
    return (top ?? []).map((s) => ({ slug: s.slug }));
  } catch {
    return []; // API asleep during the build: render on the first visit instead
  }
}

const getSkill = (slug: string) =>
  publicFetch<PublicSkillDto>(`/skills/${slug}`, {
    revalidate: 3600,
    tags: ["skills", `skill:${slug}`],
  });

export async function generateMetadata({
  params,
}: PageProps<"/skills/[slug]">) {
  const { slug } = await params;
  const skill = await getSkill(slug);
  if (!skill) return {};
  return buildMetadata({
    title: `Learn ${skill.name} for free — swap skills on SkillSwap`,
    description: `${skill.teacherCount} people teach ${skill.name}. Learn it by sharing a skill you already have.`,
    path: `/skills/${slug}`,
  });
}

export default async function SkillPage({
  params,
}: PageProps<"/skills/[slug]">) {
  const { slug } = await params;
  const skill = await getSkill(slug);
  if (!skill) notFound();

  return (
    <MarketingShell>
      <section className="bg-brand-gradient text-white">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <p className="text-sm font-bold text-white/85">{skill.category}</p>
          <h1 className="mt-1 text-4xl font-extrabold sm:text-5xl">
            Learn {skill.name} <ArrowLeftRight className="mx-1 inline size-9" />{" "}
            teach what you know
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/90">
            {skill.teacherCount}{" "}
            {skill.teacherCount === 1 ? "person teaches" : "people teach"}{" "}
            {skill.name} and {skill.learnerCount} want to learn it.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-12 items-center rounded-full bg-white px-7 font-bold text-[#21262e] shadow-lg"
          >
            Start swapping
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-5 py-12">
        {skill.description && (
          <p className="mb-10 max-w-2xl text-lg text-secondary-foreground">
            {skill.description}
          </p>
        )}

        {skill.popularSwaps.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-bold">Popular swaps</h2>
            <ul className="flex flex-wrap gap-3">
              {skill.popularSwaps.map((s) => (
                <li key={s.skill.slug}>
                  <Link
                    href={`/skills/${s.skill.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 font-semibold hover:bg-muted"
                  >
                    {skill.name}{" "}
                    <ArrowLeftRight className="size-4 text-brand" />{" "}
                    {s.skill.name}
                    <span className="text-sm text-muted-foreground">
                      {s.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-2xl font-bold">
            People who teach {skill.name}
          </h2>
          {skill.teachers.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
              Nobody teaches {skill.name} yet. Be the first!
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {skill.teachers.map((t) => (
                <TeacherCard key={t.username} teacher={t} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${skill.name} teachers`,
          itemListElement: skill.teachers.map((t, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${siteUrl}/u/${t.username}`,
          })),
        }}
      />
    </MarketingShell>
  );
}
