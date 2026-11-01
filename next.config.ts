import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a production build run beside a running `next dev` (which owns .next).
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Browser -> /api/v1/* -> NestJS. Keeps auth cookies first-party.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL ?? "http://localhost:4000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
