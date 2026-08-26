import { NextResponse } from "next/server";

export function GET() {
  // Demo oracle — returns a deterministic ETH price payload the workshop jq path ".price" can extract.
  // Replace with a live feed for a real demo; keep shape stable so jsonPath ".price" stays valid.
  const price = 4050 + Math.floor(Math.random() * 200) - 100; // ~3950-4150 wobble so YES/NO both observable
  return NextResponse.json({ price, symbol: "ETH/USD", ts: Date.now() });
}
