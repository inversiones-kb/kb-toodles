// store/useCheckoutStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActiveShift {
  shift_id: string; // El ID del documento en la colección "turnos"
  checkout_number: number; // El número de la caja (ej. 1, 2)
}

interface CheckoutState {
  currentShift: ActiveShift | null;
  setCurrentShift: (shift: ActiveShift) => void;
  clearCurrentShift: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      currentShift: null,
      setCurrentShift: (shift) => set({ currentShift: shift }),
      clearCurrentShift: () => set({ currentShift: null }),
    }),
    { name: "pos-active-shift" },
  ),
);
