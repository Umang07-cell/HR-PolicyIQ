import { create } from "zustand";

interface Notification { id: string; message: string; type: "success" | "error" | "info"; }
interface NotifState { notifications: Notification[]; add: (msg: string, type?: "success" | "error" | "info") => void; remove: (id: string) => void; }

export const useNotificationStore = create<NotifState>((set) => ({
  notifications: [],
  add: (message, type = "info") => {
    const id = Date.now().toString();
    set((s) => ({ notifications: [...s.notifications, { id, message, type }] }));
    setTimeout(() => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })), 4000);
  },
  remove: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
}));
