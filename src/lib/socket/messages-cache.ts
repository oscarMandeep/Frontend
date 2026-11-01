import type { InfiniteData } from "@tanstack/react-query";
import type {
  MessageDto,
  PaginatedMessagesDto,
} from "@/lib/api/generated/model";

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
