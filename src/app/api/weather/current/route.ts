import { NextResponse } from "next/server";
import { getCached, setCached } from "@/lib/cache/memoryCache";
import { OpenWeatherCurrent } from "@/types/openWeatherCurrent";

const API_KEY = process.env.OPENWEATHER_API_KEY!;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const TTL = 5 * 60 * 1000;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  const cacheKey = `current:${lat},${lon}`;
  const cached = getCached<OpenWeatherCurrent>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const res = await fetch(
    `${BASE_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );
  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch current weather" },
      { status: res.status }
    );
  }

  const data: OpenWeatherCurrent = await res.json();
  setCached(cacheKey, data, TTL);

  return NextResponse.json(data);
}
