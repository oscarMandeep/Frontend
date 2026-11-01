import { ImageResponse } from "next/og";
import { publicFetch } from "@/lib/api/public";
import type { PublicSkillDto } from "@/lib/api/generated/model";

export const alt = "Learn a skill on SkillSwap";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let name = "a new skill";
  try {
    name =
      (
        await publicFetch<PublicSkillDto>(`/skills/${slug}`, {
          revalidate: 3600,
          tags: ["skills", `skill:${slug}`],
        })
      )?.name ?? name;
  } catch {
    // API down: fall back to the generic card
  }
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        color: "white",
        background: "linear-gradient(45deg, #FD267A 0%, #FF6036 100%)",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ fontSize: 40, fontWeight: 700, opacity: 0.9 }}>
        SkillSwap
      </div>
      <div
        style={{
          fontSize: 96,
          fontWeight: 800,
          marginTop: 24,
          lineHeight: 1.05,
        }}
      >
        Learn {name}
      </div>
      <div
        style={{ fontSize: 56, fontWeight: 700, marginTop: 16, opacity: 0.95 }}
      >
        ⇄ Teach what you know
      </div>
    </div>,
    size,
  );
}
