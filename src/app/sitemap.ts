import type { MetadataRoute } from "next";
import { publicFetch } from "@/lib/api/public";
import type { PublicSitemapDto } from "@/lib/api/generated/model";
import { citySlug, siteUrl } from "@/lib/seo";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/skills`, changeFrequency: "daily", priority: 0.9 },
  ];
  let data: PublicSitemapDto | null = null;
  try {
    data = await publicFetch<PublicSitemapDto>("/sitemap", {
      revalidate: 86400,
      tags: ["sitemap"],
    });
  } catch {
    return fixed; // API asleep: ship the static part, the next revalidation fills in the rest
  }
  if (!data) return fixed;
  return [
    ...fixed,
    ...data.skills.map((s) => ({
      url: `${siteUrl}/skills/${s.slug}`,
      lastModified: s.updatedAt,
      priority: 0.8,
    })),
    ...data.localPages.map((p) => ({
      url: `${siteUrl}/learn/${p.skill}/in/${citySlug(p.city)}`,
      priority: 0.6,
    })),
    ...data.users.map((u) => ({
      url: `${siteUrl}/u/${u.username}`,
      lastModified: u.updatedAt,
      priority: 0.5,
    })),
  ];
}
