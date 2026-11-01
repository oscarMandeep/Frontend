"use client";

import { useEffect, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { listMessages } from "@/lib/api/generated/matches/matches";
import type {
  MessageDto,
  PaginatedMessagesDto,
} from "@/lib/api/generated/model";
import { appendMessage, messagesKey } from "@/lib/socket/messages-cache";
import { useSocket } from "@/lib/socket/SocketProvider";
import { ClientEvents, ServerEvents } from "@/lib/socket/events";

export interface ChatItem {
  /** Server id, or the clientId while the message is still being sent. */
  key: string;
  body: string;
  senderId: string;
  createdAt: string;
  readAt: string | null;
  pending?: boolean;
  failed?: boolean;
}

interface Pending {
  clientId: string;
  body: string;
  createdAt: string;
  failed: boolean;
}

const SEND_TIMEOUT_MS = 8000;
const TYPING_IDLE_MS = 1500;
const TYPING_SHOW_MS = 4000;

/** Everything one chat screen needs: history, live updates, optimistic send, presence. */
export function useChat(
  matchId: string,
  myId: string | undefined,
  otherId: string | undefined,
) {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<Pending[]>([]);
  const [otherOnline, setOtherOnline] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const typingOff = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const iAmTyping = useRef(false);

  const history = useInfiniteQuery({
    queryKey: messagesKey(matchId),
    queryFn: async ({ pageParam }) =>
      (await listMessages(matchId, { cursor: pageParam, limit: 30 })).data,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: PaginatedMessagesDto) =>
      last.nextCursor ?? undefined,
    refetchOnMount: "always",
  });

  // Join the match room (and again after every reconnect, when we may have missed messages).
  useEffect(() => {
    if (!socket) return;
    const join = () =>
      socket.emit(ClientEvents.MatchJoin, { matchId }, (ack) => {
        setJoinError(ack.ok ? null : ack.code);
      });
    const onConnect = () => {
      join();
      void queryClient.invalidateQueries({ queryKey: messagesKey(matchId) });
    };
    if (socket.connected) join();
    socket.on("connect", onConnect);
    return () => {
      socket.off("connect", onConnect);
      if (socket.connected)
        socket.emit(ClientEvents.MatchLeave, { matchId }, () => undefined);
    };
  }, [socket, matchId, queryClient]);

  // Presence and typing of the other person.
  useEffect(() => {
    if (!socket || !otherId) return;
    const onPresence = (e: { userId: string; online: boolean }) => {
      if (e.userId !== otherId) return;
      setOtherOnline(e.online);
      if (!e.online) setOtherTyping(false);
    };
    const onTyping = (e: {
      matchId: string;
      userId: string;
      typing: boolean;
    }) => {
      if (e.matchId !== matchId || e.userId !== otherId) return;
      setOtherTyping(e.typing);
      clearTimeout(typingTimer.current);
      if (e.typing)
        typingTimer.current = setTimeout(
          () => setOtherTyping(false),
          TYPING_SHOW_MS,
        );
    };
    socket.on(ServerEvents.Presence, onPresence);
    socket.on(ServerEvents.ChatTyping, onTyping);
    return () => {
      socket.off(ServerEvents.Presence, onPresence);
      socket.off(ServerEvents.ChatTyping, onTyping);
      clearTimeout(typingTimer.current);
    };
  }, [socket, matchId, otherId]);

  const saved: MessageDto[] = (history.data?.pages ?? [])
    .flatMap((p) => p.items)
    .toReversed();

  // Tell the server (and so the sender) what we have read.
  const lastFromOther = [...saved].reverse().find((m) => m.senderId !== myId);
  const unreadFromOther =
    lastFromOther && lastFromOther.readAt === null ? lastFromOther.id : null;
  useEffect(() => {
    if (!socket || !unreadFromOther) return;
    const markRead = () => {
      if (document.visibilityState !== "visible" || !socket.connected) return;
      socket.emit(
        ClientEvents.ChatRead,
        { matchId, lastMessageId: unreadFromOther },
        (ack) => {
          if (ack.ok)
            void queryClient.invalidateQueries({ queryKey: ["/v1/matches"] });
        },
      );
    };
    markRead();
    document.addEventListener("visibilitychange", markRead);
    return () => document.removeEventListener("visibilitychange", markRead);
  }, [socket, matchId, unreadFromOther, queryClient]);

  function transmit(item: Pending) {
    if (!socket) return;
    socket
      .timeout(SEND_TIMEOUT_MS)
      .emit(
        ClientEvents.ChatSend,
        { matchId, body: item.body, clientId: item.clientId },
        (err, ack) => {
          if (!err && ack.ok) {
            queryClient.setQueryData<InfiniteData<PaginatedMessagesDto>>(
              messagesKey(matchId),
              (d) => appendMessage(d, ack.message),
            );
            setPending((p) => p.filter((x) => x.clientId !== item.clientId));
            void queryClient.invalidateQueries({ queryKey: ["/v1/matches"] });
          } else {
            setPending((p) =>
              p.map((x) =>
                x.clientId === item.clientId ? { ...x, failed: true } : x,
              ),
            );
          }
        },
      );
  }

  function send(body: string) {
    const text = body.trim();
    if (!text) return;
    const item: Pending = {
      clientId: crypto.randomUUID(),
      body: text,
      createdAt: new Date().toISOString(),
      failed: false,
    };
    setPending((p) => [...p, item]);
    stopTyping();
    transmit(item);
  }

  function retry(clientId: string) {
    const item = pending.find((p) => p.clientId === clientId);
    if (!item) return;
    setPending((p) =>
      p.map((x) => (x.clientId === clientId ? { ...x, failed: false } : x)),
    );
    transmit(item);
  }

  function stopTyping() {
    clearTimeout(typingOff.current);
    if (iAmTyping.current) {
      iAmTyping.current = false;
      socket?.emit(ClientEvents.ChatTyping, { matchId, typing: false });
    }
  }

  /** Call on every keystroke: sends "typing" once, then "stopped" after a pause. */
  function typing() {
    if (!iAmTyping.current) {
      iAmTyping.current = true;
      socket?.emit(ClientEvents.ChatTyping, { matchId, typing: true });
    }
    clearTimeout(typingOff.current);
    typingOff.current = setTimeout(stopTyping, TYPING_IDLE_MS);
  }

  const items: ChatItem[] = [
    ...saved.map((m) => ({
      key: m.id,
      body: m.body,
      senderId: m.senderId,
      createdAt: m.createdAt,
      readAt: m.readAt,
    })),
    ...pending.map((p) => ({
      key: p.clientId,
      body: p.body,
      senderId: myId ?? "me",
      createdAt: p.createdAt,
      readAt: null,
      pending: !p.failed,
      failed: p.failed,
    })),
  ];

  return {
    items,
    isLoading: history.isLoading,
    isError: history.isError,
    hasMore: history.hasNextPage,
    loadingMore: history.isFetchingNextPage,
    loadMore: () => history.fetchNextPage(),
    pageCount: history.data?.pages.length ?? 0,
    send,
    retry,
    typing,
    otherOnline,
    otherTyping,
    joinError,
  };
}
