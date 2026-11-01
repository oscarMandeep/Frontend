import { create } from "zustand";
import type { MatchNewPayload } from "@/lib/socket/events";

/** The "It's a match!" modal is global: a swipe or a socket push can open it. */
interface MatchModalState {
  match: MatchNewPayload | null;
  show: (match: MatchNewPayload) => void;
  close: () => void;
}

export const useMatchModal = create<MatchModalState>((set) => ({
  match: null,
  show: (match) => set({ match }),
  close: () => set({ match: null }),
}));
