import { create } from "zustand";

interface AddFavoriteDialogState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useAddFavoriteDialog = create<AddFavoriteDialogState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
