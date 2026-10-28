import { NextResponse } from "next/server";
import { loadTtf } from "@/lib/prices/load";

export async function GET() {
  const result = await loadTtf();
  return NextResponse.json(result, {
    status: result.status === "error" ? 500 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
