import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app/AppShell";
import { SocketProvider } from "@/lib/socket/SocketProvider";
import { MatchModal } from "@/features/discover/MatchModal";

// Everything signed-in is private: never indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      <AppShell>
        {children}
        <MatchModal />
      </AppShell>
    </SocketProvider>
  );
}
