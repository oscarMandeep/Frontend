import type { Metadata } from "next";
import type { ReactNode } from "react";

// Everything signed-in is private: never indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AppLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
