import type { PricePoint } from "./types";

export type SortKey = "date" | "hub" | "priceEurMwh";
export type SortDir = "asc" | "desc";

export function sortPoints(points: PricePoint[], key: SortKey, dir: SortDir): PricePoint[] {
  const sign = dir === "asc" ? 1 : -1;
  return [...points].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    const c = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
    return c * sign || a.date.localeCompare(b.date);
  });
}

export function hubsOf(points: PricePoint[]): string[] {
  return [...new Set(points.map((p) => p.hub))].sort();
}
