import LocationDetails from "@/components/LocationDetails";
import { Favourite } from "@/types/favourite";

export default async function LocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch the location details from the database
  const res = await fetch(
    `${process.env.DB_URL}/favourites/${encodeURIComponent(id)}`,
    {
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) {
    return <div>Error loading location</div>;
  }

  const location: Favourite = await res.json();

  return (
    <div className="p-4">
      <LocationDetails location={location} />
    </div>
  );
}
