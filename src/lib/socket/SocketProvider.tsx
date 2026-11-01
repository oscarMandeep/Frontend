"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type {
  MessageDto,
  PaginatedMessagesDto,
} from "@/lib/api/generated/model";
import { useMatchModal } from "@/stores/match-modal";
import { getSocket, type AppSocket } from "./client";
import { ServerEvents } from "./events";

export type SocketStatus = "connecting" | "connected" | "waking";

interface SocketContextValue {
  socket: AppSocket | null;
  status: SocketStatus;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  status: "connecting",
});
export const useSocket = () => useContext(SocketContext);

export const messagesKey = (matchId: string) => ["messages", matchId] as const;

/** Adds a message to the cached history unless it is already there (by id). */
export function appendMessage(
  data: InfiniteData<PaginatedMessagesDto> | undefined,
  message: MessageDto,
): InfiniteData<PaginatedMessagesDto> | undefined {
  if (!data) return data;
  const exists = data.pages.some((p) =>
    p.items.some((m) => m.id === message.id),
  );
  if (exists) return data;
  const [first, ...rest] = data.pages;
  return {
    ...data,
    pages: [{ ...first, items: [message, ...first.items] }, ...rest],
  };
}

/**
 * Turns server pushes into cache updates (docs/03 §3), so every screen stays in sync
 * without polling. Mounted once for the whole signed-in area.
 */
export function SocketProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const showMatch = useMatchModal((s) => s.show);
  const router = useRouter();
  // Created once per tab; it only connects inside the effect below.
  const [socket] = useState<AppSocket | null>(() =>
    typeof window === "undefined" ? null : getSocket(),
  );
  const [status, setStatus] = useState<SocketStatus>("connecting");

  useEffect(() => {
    if (!socket) return;
    const s = socket;

    const onConnect = () => setStatus("connected");
    const onConnectError = () => setStatus("waking");
    const invalidate = (key: string) =>
      queryClient.invalidateQueries({ queryKey: [key] });

    s.on("connect", onConnect);
    s.on("connect_error", onConnectError);
    s.on(ServerEvents.MatchNew, (payload) => {
      showMatch(payload);
      void invalidate("/v1/matches");
    });
    s.on(ServerEvents.ChatMessage, (message) => {
      queryClient.setQueryData<InfiniteData<PaginatedMessagesDto>>(
        messagesKey(message.matchId),
        (d) => appendMessage(d, message),
      );
      void invalidate("/v1/matches"); // order and unread counts
    });
    s.on(ServerEvents.ChatRead, (e) => {
      queryClient.setQueryData<InfiniteData<PaginatedMessagesDto>>(
        messagesKey(e.matchId),
        (d) => {
          if (!d) return d;
          const now = new Date().toISOString();
          return {
            ...d,
            pages: d.pages.map((p) => ({
              ...p,
              items: p.items.map((m) =>
                m.senderId !== e.userId && m.readAt === null
                  ? { ...m, readAt: now }
                  : m,
              ),
            })),
          };
        },
      );
    });
    s.on(ServerEvents.SessionUpdate, () => {
      void invalidate("/v1/sessions");
      void invalidate("/v1/wallet");
      void invalidate("/v1/me");
    });
    s.on(ServerEvents.ChainProposed, (chain) => {
      void invalidate("/v1/chains");
      toast("A swap chain was found for you", {
        description: `${chain.members.length} people could all learn something. Take a look.`,
        action: { label: "View", onClick: () => router.push("/chains") },
      });
    });
    s.on(ServerEvents.ChainUpdate, () => void invalidate("/v1/chains"));

    s.connect();
    return () => {
      s.removeAllListeners();
      s.disconnect();
    };
  }, [socket, queryClient, showMatch, router]);

  return (
    <SocketContext.Provider value={{ socket, status }}>
      {status === "waking" && (
        <div
          role="status"
          className="fixed inset-x-0 top-0 z-[90] bg-brand-gradient py-1.5 text-center text-sm font-bold text-white"
        >
          Waking the server up… live updates will resume in a moment.
        </div>
      )}
      {children}
    </SocketContext.Provider>
  );
}
