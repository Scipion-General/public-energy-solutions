import { NextResponse } from "next/server";
import { loadPrices } from "@/lib/prices/load";

export async function GET() {
  const result = await loadPrices();
  return NextResponse.json(result, {
    status: result.status === "ok" ? 200 : 500,
    headers: { "Cache-Control": "no-store" },
  });
}
