import { create } from "zustand";
import { User } from "../types/models";
import { getMe } from "../api/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  fetchMe: () => Promise<void>;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  isHydrating: !!localStorage.getItem("token"), // only hydrate if token exists

  fetchMe: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isHydrating: false });
      return;
    }
    try {
      const res = await getMe();
      set({ user: res.data, isAuthenticated: true, isHydrating: false });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, isAuthenticated: false, isHydrating: false });
    }
  },

  setAuth: (user, token) => {
    localStorage.setItem("token", token);
    set({ user, token, isAuthenticated: true, isHydrating: false });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false, isHydrating: false });
  },
}));
