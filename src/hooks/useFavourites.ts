"use client";
import { useState, useEffect } from "react";

export function useFavourites() {
  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("favourites");
    if (saved) setFavourites(JSON.parse(saved));
  }, []);

  function addFavourite(id: string) {
    const updated = [...favourites, id];
    setFavourites(updated);
    localStorage.setItem("favourites", JSON.stringify(updated));
  }

  function removeFavourite(id: string) {
    const updated = favourites.filter((f) => f !== id);
    setFavourites(updated);
    localStorage.setItem("favourites", JSON.stringify(updated));
  }

  return { favourites, addFavourite, removeFavourite };
}
