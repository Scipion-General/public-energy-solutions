import { PriceFileFormatError, splitCsvLine } from "./parse";
import type { ParseIssue } from "./types";

export interface TtfPoint {
  date: string; // YYYY-MM-DD
  price: number;
}

export interface TtfParseResult {
  points: TtfPoint[];
  issues: ParseIssue[];
  /** From a "# source: ..." comment line, if present. */
  source: string | null;
  /** From a "# unit: ..." comment line, if present (default EUR/MWh). */
  unit: string;
}

const DATE_HEADERS = ["date", "day", "trade date", "trading date", "delivery date", "timestamp", "time", "datum"];
const PRICE_HEADERS = [
  "price", "price_eur_mwh", "price (eur/mwh)", "eur/mwh", "close", "close price", "settlement",
  "settlement price", "settle", "last", "value", "ttf", "prix", "preis",
];

const norm = (h: string) => h.toLowerCase().replace(/^\uFEFF/, "").replace(/\s+/g, " ").trim();

function detectDelimiter(headerLine: string): string {
  const counts = [",", ";", "\t"].map((d) => [d, headerLine.split(d).length - 1] as const);
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ",";
}

function splitLine(line: string, delim: string): string[] {
  if (delim === ",") return splitCsvLine(line);
  // Replace the delimiter by commas outside quotes, then reuse the CSV splitter.
  let out = "";
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    if (!inQ && ch === delim) out += "\u0000";
    else out += ch;
  }
  return out.split("\u0000").map((c) => c.trim().replace(/^"([\s\S]*)"$/, "$1").replace(/""/g, '"'));
}

function pad(n: string) {
  return n.padStart(2, "0");
}

function validYmd(y: string, m: string, d: string): string | null {
  const iso = `${y}-${pad(m)}-${pad(d)}`;
  const t = new Date(`${iso}T00:00:00Z`);
  return !Number.isNaN(t.getTime()) && t.toISOString().slice(0, 10) === iso ? iso : null;
}

/**
 * Parse a date cell. Accepts YYYY-MM-DD (optionally with time), YYYY/MM/DD,
 * and DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY (European order) — or MM/DD/YYYY
 * when `usOrder` is true.
 */
export function parseDateCell(raw: string, usOrder = false): string | null {
  const v = raw.trim();
  let m = v.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T ].*)?$/);
  if (m) return validYmd(m[1], m[2], m[3]);
  m = v.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?:[T ].*)?$/);
  if (m) return usOrder ? validYmd(m[3], m[1], m[2]) : validYmd(m[3], m[2], m[1]);
  return null;
}

/** Parse a price cell; accepts "31.25", "31,25" (when decimalComma), "1,234.5", "1 234,5", "€31.25". */
export function parsePriceCell(raw: string, decimalComma: boolean): number | null {
  let v = raw.trim().replace(/[€\s\u00A0]/g, "").replace(/EUR$/i, "");
  if (!v) return null;
  if (decimalComma) v = v.replace(/\./g, "").replace(",", ".");
  else v = v.replace(/,/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(v)) return null;
  return Number(v);
}

/**
 * Parse a TTF price-history CSV (price vs date). See data/README.md.
 * Throws PriceFileFormatError when no usable header is found.
 */
export function parseTtfCsv(text: string): TtfParseResult {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  let source: string | null = null;
  let unit = "EUR/MWh";
  let header: string[] | null = null;
  let delim = ",";
  let dateIdx = -1;
  let priceIdx = -1;
  const rows: { line: number; cells: string[] }[] = [];

  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    if (line.startsWith("#")) {
      const meta = line.match(/^#\s*(source|unit)\s*:\s*(.+)$/i);
      if (meta) {
        if (meta[1].toLowerCase() === "source") source = meta[2].trim();
        else unit = meta[2].trim();
      }
      return;
    }
    if (!header) {
      delim = detectDelimiter(line);
      header = splitLine(line, delim).map(norm);
      dateIdx = header.findIndex((h) => DATE_HEADERS.includes(h));
      priceIdx = header.findIndex((h) => PRICE_HEADERS.includes(h));
      // Two-column file with unrecognised names: assume [date, price].
      if ((dateIdx < 0 || priceIdx < 0) && header.length === 2 && !parseDateCell(header[0])) {
        dateIdx = 0;
        priceIdx = 1;
      }
      if (dateIdx < 0 || priceIdx < 0) {
        throw new PriceFileFormatError(
          `Could not find a date column and a price column in the header (found: ${header.join(", ")})`,
        );
      }
      return;
    }
    rows.push({ line: i + 1, cells: splitLine(line, delim) });
  });

  if (!header) throw new PriceFileFormatError("File is empty: header row is missing");

  // With ";" or tab delimiters, a comma is the decimal separator (European exports).
  const decimalComma = delim !== "," &&
    rows.some((r) => /^-?[\d.\s]*\d,\d+$/.test((r.cells[priceIdx] ?? "").replace(/[€\s]/g, "")));
  // Day/month order: US order only if some "first" field exceeds 12 while no "second" does.
  const slashDates = rows
    .map((r) => (r.cells[dateIdx] ?? "").match(/^(\d{1,2})[/.-](\d{1,2})[/.-]\d{4}/))
    .filter((m): m is RegExpMatchArray => !!m);
  const usOrder = slashDates.some((m) => Number(m[2]) > 12) && !slashDates.some((m) => Number(m[1]) > 12);

  const issues: ParseIssue[] = [];
  const byDate = new Map<string, TtfPoint>();
  for (const { line, cells } of rows) {
    const dateRaw = cells[dateIdx] ?? "";
    const priceRaw = cells[priceIdx] ?? "";
    const date = parseDateCell(dateRaw, usOrder);
    if (!date) {
      issues.push({ line, message: `Invalid date "${dateRaw}"` });
      continue;
    }
    const price = parsePriceCell(priceRaw, decimalComma);
    if (price === null) {
      issues.push({ line, message: `Invalid price "${priceRaw}"` });
      continue;
    }
    if (byDate.has(date)) {
      issues.push({ line, message: `Duplicate date ${date}` });
      continue;
    }
    byDate.set(date, { date, price });
  }

  const points = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  return { points, issues, source, unit };
}
