import { io, type Socket } from "socket.io-client";
import { getSocketToken } from "@/lib/api/generated/auth/auth";
import type { ClientToServerEvents, ServerToClientEvents } from "./events";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

/**
 * One socket per tab. The browser connects straight to the API (the only call that
 * skips the Next.js rewrite), authenticated with a 60-second token that is fetched
 * again on every (re)connect.
 */
export function getSocket(): AppSocket {
  socket ??= io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000", {
    transports: ["websocket"],
    autoConnect: false,
    reconnectionDelayMax: 8000,
    auth: (cb) => {
      getSocketToken()
        .then((res) => cb({ token: res.data.token }))
        .catch(() => cb({}));
    },
  });
  return socket;
}

export function closeSocket() {
  socket?.disconnect();
  socket = null;
}
