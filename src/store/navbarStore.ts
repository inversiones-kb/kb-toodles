import { create } from "zustand";

export const useNavbarStore = create<{
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}>((set) => ({
  isCollapsed: false,
  setIsCollapsed: (isCollapsed) => set({ isCollapsed }),
}));
