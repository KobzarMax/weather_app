import { type Favourite } from "@/types/favourite";
import { NextRequest, NextResponse } from "next/server";

const DB_URL = process.env.DB_URL || "http://localhost:4000";

export async function GET() {
  const r = await fetch(`${DB_URL}/favourites`, { cache: "no-store" });
  const data = (await r.json()) as Favourite[];
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Favourite;
  const r = await fetch(`${DB_URL}/favourites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await r.json()) as Favourite;
  return NextResponse.json(data);
}
