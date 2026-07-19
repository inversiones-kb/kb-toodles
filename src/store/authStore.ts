import { createStore } from "zustand";
import { User } from "firebase/auth";
import { CurrentUser } from "@/types/auth.types";

// Interfaz estricta del estado y las acciones
export interface AuthState {
  user: CurrentUser | null;
  isLoading: boolean;
  setUser: (user: CurrentUser | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
}

// Función fábrica (factory function) para crear nuevas instancias de la store
export const createAuthStore = (
  initProps?: Partial<Pick<AuthState, "user" | "isLoading">>,
) => {
  return createStore<AuthState>((set) => ({
    user: null,
    isLoading: true,
    ...initProps, // Permite inyectar valores iniciales si fuese necesario

    setUser: (user) => set({ user }),
    setIsLoading: (isLoading) => set({ isLoading }),
    clearAuth: () => set({ user: null, isLoading: false }),
  }));
};

// Tipo técnico de la API de la store
export type AuthStoreApi = ReturnType<typeof createAuthStore>;
