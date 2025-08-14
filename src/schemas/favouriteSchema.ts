import { z } from "zod";

export const favouriteSchema = z.object({
  name: z.string().min(2, "Location name is too short"),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export type FavouriteFormValues = z.infer<typeof favouriteSchema>;
