import { AddFavoriteButton } from "@/components/AddFavoriteButton";
import LocationCard from "@/components/LocationCard";
import { type Favourite } from "@/types/favourite";

export default async function Home() {
  const res = await fetch(`${process.env.DB_URL!}/favourites`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch favourites");
  }
  const favourites: Favourite[] = await res.json();

  return (
    <main className="container px-5 py-20 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">My Favorite Locations</h1>
          <p className="text-gray-600 text-sm">
            Monitor wind conditions at your favorite locations
          </p>
        </div>
        <AddFavoriteButton />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favourites.map((fav) => (
          <LocationCard key={fav.id} location={fav} />
        ))}
        {favourites.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            No favourites added yet. Start by adding a location!
          </div>
        )}
      </div>
    </main>
  );
}
