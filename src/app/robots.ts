import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/discover",
        "/matches",
        "/chat",
        "/sessions",
        "/chains",
        "/wallet",
        "/profile",
        "/onboarding",
        "/api",
        "/internal",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
