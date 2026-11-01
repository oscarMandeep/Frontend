import { notFound } from "next/navigation";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { TeacherCard } from "@/components/marketing/TeacherCard";
import { publicFetch } from "@/lib/api/public";
import type { PublicSkillCityDto } from "@/lib/api/generated/model";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 21600;
export const dynamicParams = true;

// Nothing prebuilt: pages are generated on the first visit, then cached (ISR).
export function generateStaticParams() {
  return [];
}

/** Fewer than this and the page is thin content: it stays out of search results. */
const MIN_TEACHERS_TO_INDEX = 3;

const getPage = (skill: string, city: string) =>
  publicFetch<PublicSkillCityDto>(`/skills/${skill}/cities/${city}`, {
    revalidate: 21600,
    tags: [`skill:${skill}`, `city:${city}`],
  });

export async function generateMetadata({
  params,
}: PageProps<"/learn/[skill]/in/[city]">) {
  const { skill, city } = await params;
  const page = await getPage(skill, city);
  if (!page) return {};
  return buildMetadata({
    title: `Learn ${page.skill.name} in ${page.city} — free skill swaps`,
    description: `${page.teacherCount} people in ${page.city} teach ${page.skill.name}. Swap a skill you have and learn it for free.`,
    path: `/learn/${skill}/in/${city}`,
    noindex: page.teacherCount < MIN_TEACHERS_TO_INDEX,
  });
}

export default async function LocalSkillPage({
  params,
}: PageProps<"/learn/[skill]/in/[city]">) {
  const { skill, city } = await params;
  const page = await getPage(skill, city);
  if (!page) notFound();

  return (
    <MarketingShell>
      <div className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="text-4xl font-extrabold">
          Learn {page.skill.name} in {page.city}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {page.teacherCount} {page.teacherCount === 1 ? "person" : "people"} in{" "}
          {page.city} teach {page.skill.name}.
        </p>
        {page.teachers.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            Nobody in {page.city} teaches this yet.{" "}
            <Link
              href={`/skills/${page.skill.slug}`}
              className="font-bold text-brand"
            >
              See everyone who teaches {page.skill.name}
            </Link>
          </p>
        ) : (
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {page.teachers.map((t) => (
              <TeacherCard key={t.username} teacher={t} />
            ))}
          </ul>
        )}
        <Link
          href="/login"
          className="bg-brand-gradient mt-10 inline-flex h-12 items-center rounded-full px-7 font-bold text-white shadow-md"
        >
          Start swapping
        </Link>
      </div>
    </MarketingShell>
  );
}
