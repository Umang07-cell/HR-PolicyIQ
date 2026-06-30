import { create } from "zustand";
import { ChatMessage } from "../types/models";

interface UpdatePayload {
  content?: string;
  appendContent?: string;
  citations?: ChatMessage["citations"];
  confidence?: number;
  confidence_label?: string;
  streaming?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  stage: string | null;
  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (payload: UpdatePayload) => void;
  setLoading: (v: boolean) => void;
  setStage: (s: string | null) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  stage: null,

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  updateLastMessage: (payload) =>
    set((s) => {
      if (!s.messages.length) return s;
      const messages = [...s.messages];
      const last = { ...messages[messages.length - 1] };

      if (payload.appendContent !== undefined) {
        last.content = (last.content ?? "") + payload.appendContent;
      }
      if (payload.content !== undefined) last.content = payload.content;
      if (payload.citations !== undefined) last.citations = payload.citations;
      if (payload.confidence !== undefined) last.confidence = payload.confidence;
      if (payload.confidence_label !== undefined) last.confidence_label = payload.confidence_label;
      if (payload.streaming !== undefined) last.streaming = payload.streaming;

      messages[messages.length - 1] = last;
      return { messages };
    }),

  setLoading: (v) => set({ isLoading: v }),
  setStage: (s) => set({ stage: s }),
  clear: () => set({ messages: [], stage: null }),
}));