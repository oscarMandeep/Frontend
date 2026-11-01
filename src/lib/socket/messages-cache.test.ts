import { describe, expect, it } from "vitest";
import type { InfiniteData } from "@tanstack/react-query";
import type {
  MessageDto,
  PaginatedMessagesDto,
} from "@/lib/api/generated/model";
import { appendMessage } from "./messages-cache";

const msg = (id: string): MessageDto => ({
  id,
  matchId: "m1",
  senderId: "u1",
  body: id,
  readAt: null,
  createdAt: "2026-06-10T12:00:00Z",
});

const history = (
  ...pages: MessageDto[][]
): InfiniteData<PaginatedMessagesDto> => ({
  pageParams: pages.map(() => undefined),
  pages: pages.map((items) => ({ items, nextCursor: null })),
});

describe("appendMessage", () => {
  it("puts a new message first on the newest page (history is newest first)", () => {
    const next = appendMessage(history([msg("b"), msg("a")]), msg("c"));
    expect(next?.pages[0].items.map((m) => m.id)).toEqual(["c", "b", "a"]);
  });
  it("ignores a message that is already there, on any page", () => {
    const data = history([msg("b")], [msg("a")]);
    expect(appendMessage(data, msg("a"))).toBe(data);
  });
  it("leaves an empty cache alone: the history query loads it itself", () => {
    expect(appendMessage(undefined, msg("a"))).toBeUndefined();
  });
});
