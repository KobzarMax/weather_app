import { type Favourite } from "@/types/favourite";
import Image from "next/image";
import { ThreeDotsMenu } from "./ThreeDotsMenu";
import { type OpenWeatherCurrent } from "@/types/openWeatherCurrent";
import { type OpenWeatherForecast } from "@/types/openWeatherForecast";
import {
  degreesToCardinal,
  formatLocalTime,
  getWeatherGradient,
} from "@/utils";

interface LocationCardProps {
  location: Favourite;
}

export default async function LocationCard({ location }: LocationCardProps) {
  const [currentRes, forecastRes] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/weather/current?lat=${location.lat}&lon=${location.lon}`,
      { cache: "no-store" }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/weather/forecast?lat=${location.lat}&lon=${location.lon}`,
      { cache: "no-store" }
    ),
  ]);

  if (!currentRes.ok || !forecastRes.ok) {
    return (
      <div className="p-4 border rounded shadow">
        <h3 className="font-semibold">{location.name}</h3>
        <p className="text-red-500">Failed to load weather data</p>
      </div>
    );
  }

  const current: OpenWeatherCurrent = await currentRes.json();
  const forecast: OpenWeatherForecast = await forecastRes.json();

  const gradient = getWeatherGradient(current.weather[0].description);

  const next3h = forecast.list[0];

  return (
    <div
      className={`p-4 border rounded shadow bg-gradient-to-br ${gradient} text-white relative`}
    >
      <div className="absolute top-2 right-2">
        <ThreeDotsMenu location={location} />
      </div>

      <h3 className="font-semibold mb-2">{location.name}</h3>

      <div className="flex items-center gap-2">
        <Image
          width={50}
          height={50}
          src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
          alt={current.weather[0].description}
        />
        <div>
          <p className="text-sm capitalize">{current.weather[0].description}</p>
          <p className="text-lg font-bold">{Math.round(current.main.temp)}°C</p>
        </div>
      </div>

      <div className="mt-2 text-xs">
        💨 Current: {current.wind.speed} m/s{" "}
        {degreesToCardinal(current.wind.deg)}
      </div>
      {next3h && (
        <div className="mt-1 text-xs opacity-80">
          Next 3h: {next3h.wind.speed} m/s {degreesToCardinal(next3h.wind.deg)}
        </div>
      )}

      <div className="mt-1 text-xs">
        🕒 Local time: {formatLocalTime(current.dt, current.timezone)}
      </div>
      <div className="text-xs opacity-80">
        Last updated: {new Date(current.dt * 1000).toLocaleTimeString()}
      </div>
    </div>
  );
}
