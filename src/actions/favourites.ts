"use server";

import { FavouriteFormValues } from "@/schemas/favouriteSchema";
import { v4 as uuidv4 } from "uuid";

export async function addFavourite(values: FavouriteFormValues) {
  const id = uuidv4();

  const res = await fetch(`${process.env.DB_URL}/favourites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...values, id }),
  });

  if (!res.ok) {
    throw new Error("Failed to add favourite");
  }

  return res.json();
}

export async function deleteFavourite(id: string) {
  const res = await fetch(`${process.env.DB_URL}/favourites/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete favourite");
  }

  return { success: true };
}
