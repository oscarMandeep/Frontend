import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { SkillChip } from "@/components/brand/SkillChip";
import { UserAvatar } from "@/components/brand/UserAvatar";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { publicFetch } from "@/lib/api/public";
import type { PublicProfileDto } from "@/lib/api/generated/model";
import { buildMetadata, siteUrl } from "@/lib/seo";

export const revalidate = 600;
export const dynamicParams = true;

const getProfile = (username: string) =>
  publicFetch<PublicProfileDto>(`/users/${username}`, {
    revalidate: 600,
    tags: [`user:${username}`],
  });

export async function generateMetadata({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) return {};
  const teaches = profile.haves
    .map((h) => h.skill.name)
    .slice(0, 3)
    .join(", ");
  return buildMetadata({
    title: `${profile.name} on SkillSwap${teaches ? ` — teaches ${teaches}` : ""}`,
    description: profile.bio ?? `${profile.name} swaps skills on SkillSwap.`,
    path: `/u/${username}`,
  });
}

export default async function PublicProfilePage({
  params,
}: PageProps<"/u/[username]">) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) notFound();

  return (
    <MarketingShell>
      <div className="mx-auto max-w-2xl px-5 py-12">
        <div className="flex items-center gap-5">
          <UserAvatar
            id={profile.username}
            name={profile.name}
            src={profile.avatarUrl}
            className="size-24"
            textClassName="text-3xl"
          />
          <div>
            <h1 className="text-3xl font-extrabold">{profile.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 text-muted-foreground">
              {profile.city && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-4" /> {profile.city}
                </span>
              )}
              {profile.ratingAvg > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-action-rewind text-action-rewind" />{" "}
                  {profile.ratingAvg.toFixed(1)}
                </span>
              )}
              <span>{profile.sessionsDone} sessions</span>
            </p>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-6 text-lg text-secondary-foreground">
            {profile.bio}
          </p>
        )}

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Can teach</h2>
          <ul className="flex flex-wrap gap-2">
            {profile.haves.map((h) => (
              <li key={h.skill.slug}>
                <Link href={`/skills/${h.skill.slug}`}>
                  <SkillChip category={h.skill.category}>
                    {h.skill.name}
                  </SkillChip>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-bold">Wants to learn</h2>
          <ul className="flex flex-wrap gap-2">
            {profile.wants.map((w) => (
              <li key={w.skill.slug}>
                <Link href={`/skills/${w.skill.slug}`}>
                  <SkillChip category={w.skill.category}>
                    {w.skill.name}
                  </SkillChip>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <Link
          href="/login"
          className="bg-brand-gradient mt-10 inline-flex h-12 items-center rounded-full px-7 font-bold text-white shadow-md"
        >
          Swap skills with {profile.name.split(" ")[0]}
        </Link>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: profile.name,
          url: `${siteUrl}/u/${profile.username}`,
          description: profile.bio ?? undefined,
          knowsAbout: profile.haves.map((h) => h.skill.name),
        }}
      />
    </MarketingShell>
  );
}
