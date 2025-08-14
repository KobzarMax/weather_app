import { create } from "zustand";
import { Favourite } from "@/types/favourite";

interface DeleteFavouriteDialogState {
  isOpen: boolean;
  location: Favourite | null;
  open: (location: Favourite) => void;
  close: () => void;
}

export const useDeleteFavouriteDialog = create<DeleteFavouriteDialogState>(
  (set) => ({
    isOpen: false,
    location: null,
    open: (location) => set({ isOpen: true, location }),
    close: () => set({ isOpen: false, location: null }),
  })
);
