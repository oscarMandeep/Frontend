/**
 * Socket.io contract (docs/04-api-contract.md §5).
 * Identical copy of Backend/src/chat/socket.events.ts, with the payload types taken
 * from the generated API models. Change both together.
 */
import type {
  ChainDto,
  MatchType,
  MessageDto,
  SessionDto,
  SkillRefDto,
  UserCardDto,
} from "@/lib/api/generated/model";

export const ClientEvents = {
  MatchJoin: "match:join",
  MatchLeave: "match:leave",
  ChatSend: "chat:send",
  ChatTyping: "chat:typing",
  ChatRead: "chat:read",
} as const;

export const ServerEvents = {
  ChatMessage: "chat:message",
  ChatTyping: "chat:typing",
  ChatRead: "chat:read",
  MatchNew: "match:new",
  SessionUpdate: "session:update",
  ChainProposed: "chain:proposed",
  ChainUpdate: "chain:update",
  Presence: "presence",
  Error: "error",
} as const;

export interface MatchNewPayload {
  matchId: string;
  score: number;
  type: MatchType;
  otherUser: UserCardDto;
  learnSkill: SkillRefDto;
  teachSkill: SkillRefDto | null;
}

export interface ErrorPayload {
  code: string;
  message: string;
}

/** What every acknowledgement looks like: success with data, or a machine code. */
export type Ack<T extends object = object> = ({ ok: true } & T) | { ok: false; code: string };

export interface MatchRefPayload {
  matchId: string;
}
export interface ChatSendPayload {
  matchId: string;
  body: string; // 1..2000
  clientId: string; // lets the sender match its optimistic message to the saved one
}
export interface ChatTypingPayload {
  matchId: string;
  typing: boolean;
}
export interface ChatReadPayload {
  matchId: string;
  lastMessageId: string;
}

export type ChatMessagePayload = MessageDto & { clientId?: string };
export interface ChatTypingEvent {
  matchId: string;
  userId: string;
  typing: boolean;
}
export interface ChatReadEvent {
  matchId: string;
  userId: string;
  lastMessageId: string;
}
export interface PresenceEvent {
  userId: string;
  online: boolean;
}

/** server -> client */
export interface ServerToClientEvents {
  [ServerEvents.MatchNew]: (payload: MatchNewPayload) => void;
  [ServerEvents.ChatMessage]: (payload: ChatMessagePayload) => void;
  [ServerEvents.ChatTyping]: (payload: ChatTypingEvent) => void;
  [ServerEvents.ChatRead]: (payload: ChatReadEvent) => void;
  [ServerEvents.Presence]: (payload: PresenceEvent) => void;
  [ServerEvents.SessionUpdate]: (payload: SessionDto) => void;
  [ServerEvents.ChainProposed]: (payload: ChainDto) => void;
  [ServerEvents.ChainUpdate]: (payload: ChainDto) => void;
  [ServerEvents.Error]: (payload: ErrorPayload) => void;
}

/** client -> server */
export interface ClientToServerEvents {
  [ClientEvents.MatchJoin]: (payload: MatchRefPayload, ack: (r: Ack) => void) => void;
  [ClientEvents.MatchLeave]: (payload: MatchRefPayload, ack: (r: Ack) => void) => void;
  [ClientEvents.ChatSend]: (
    payload: ChatSendPayload,
    ack: (r: Ack<{ message: MessageDto }>) => void,
  ) => void;
  [ClientEvents.ChatTyping]: (payload: ChatTypingPayload) => void;
  [ClientEvents.ChatRead]: (payload: ChatReadPayload, ack: (r: Ack) => void) => void;
}
