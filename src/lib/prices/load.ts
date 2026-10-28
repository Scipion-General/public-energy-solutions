import "server-only";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { parsePriceCsv } from "./parse";
import { parseTtfCsv } from "./ttf";
import { ttfData } from "@/content/prices";
import type { PricesResponse, TtfResponse } from "./types";

/** Path to the price file; override with PRICE_DATA_FILE (relative to project root). */
export function priceFilePath(): string {
  // data/ is included explicitly via outputFileTracingIncludes in next.config.ts.
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.PRICE_DATA_FILE ?? "data/gas-prices.csv");
}

export async function loadPrices(): Promise<PricesResponse> {
  const file = priceFilePath();
  try {
    const [text, info] = await Promise.all([readFile(file, "utf8"), stat(file)]);
    const { points, issues } = parsePriceCsv(text);
    return { status: "ok", points, issues, updatedAt: info.mtime.toISOString() };
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    console.error("[prices] failed to load", file, err);
    const message =
      err.code === "ENOENT"
        ? "The price data file could not be found."
        : err.name === "PriceFileFormatError"
          ? `The price data file is not in the expected format: ${err.message}`
          : "The price data could not be read.";
    return { status: "error", message };
  }
}

/** Path to the TTF history file (see src/content/prices.ts); override with TTF_DATA_FILE. */
export function ttfFilePath(): string {
  return path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.TTF_DATA_FILE || ttfData.file);
}

export async function loadTtf(): Promise<TtfResponse> {
  const file = ttfFilePath();
  try {
    const [text, info] = await Promise.all([readFile(file, "utf8"), stat(file)]);
    const parsed = parseTtfCsv(text);
    return { status: "ok", ...parsed, illustrative: ttfData.illustrative, updatedAt: info.mtime.toISOString() };
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err.code === "ENOENT") return { status: "missing" };
    console.error("[ttf] failed to load", file, err);
    const message =
      err.name === "PriceFileFormatError"
        ? `The TTF data file is not in the expected format: ${err.message}`
        : "The TTF data could not be read.";
    return { status: "error", message };
  }
}
