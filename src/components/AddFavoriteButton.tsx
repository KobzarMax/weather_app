"use client";

import { useAddFavoriteDialog } from "@/store/useAddFavoriteDialog";

export const AddFavoriteButton = () => {
  const open = useAddFavoriteDialog((s) => s.open);

  return (
    <button
      onClick={open}
      className="px-4 py-2 bg-blue-500 text-white rounded transition-all duration-300 hover:bg-blue-600"
    >
      Add Favorite Location
    </button>
  );
};
