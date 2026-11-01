import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { SkillChip } from "@/components/brand/SkillChip";
import { publicFetch } from "@/lib/api/public";
import type { PublicSkillSummaryDto } from "@/lib/api/generated/model";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "Skills you can learn for free — SkillSwap",
  description:
    "Browse every skill people teach on SkillSwap and find someone to swap with.",
  path: "/skills",
});

async function getSkills() {
  try {
    return (
      (await publicFetch<PublicSkillSummaryDto[]>("/skills?limit=200", {
        revalidate: 3600,
        tags: ["skills"],
      })) ?? []
    );
  } catch {
    return [];
  }
}

export default async function SkillsPage() {
  const skills = await getSkills();
  const byCategory = Map.groupBy(skills, (s) => s.category);

  return (
    <MarketingShell>
      <div className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="text-4xl font-extrabold">
          Skills you can learn for free
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Pick a skill to see who teaches it. Share a skill you already have and
          swap.
        </p>
        {skills.length === 0 && (
          <p className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Skills are loading. Please check back in a moment.
          </p>
        )}
        {[...byCategory].map(([category, list]) => (
          <section key={category} className="mt-10">
            <h2 className="mb-3 text-xl font-bold">{category}</h2>
            <ul className="flex flex-wrap gap-2">
              {list.map((s) => (
                <li key={s.slug}>
                  <Link href={`/skills/${s.slug}`}>
                    <SkillChip
                      category={s.category}
                      className="px-4 py-2 text-sm hover:brightness-95"
                    >
                      {s.name} · {s.teacherCount}
                    </SkillChip>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </MarketingShell>
  );
}
