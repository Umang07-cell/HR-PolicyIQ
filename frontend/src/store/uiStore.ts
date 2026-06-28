import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Default: open on desktop, collapsed on mobile
  sidebarOpen: typeof window !== "undefined" ? window.innerWidth >= 768 : true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (v) => set({ sidebarOpen: v }),
}));
