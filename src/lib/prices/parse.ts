import type { ParseIssue, ParseResult, PricePoint } from "./types";

/**
 * Required CSV columns, in any order. See data/README.md for the full format.
 */
export const REQUIRED_COLUMNS = ["date", "hub", "price_eur_mwh", "source"] as const;

export class PriceFileFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PriceFileFormatError";
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** Split one CSV line, supporting double-quoted fields with "" escapes. */
export function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  if (inQuotes) throw new PriceFileFormatError("Unterminated quoted field");
  out.push(cur);
  return out.map((s) => s.trim());
}

/**
 * Parse the gas price CSV.
 *
 * - Blank lines and lines starting with `#` are ignored (use them for notes).
 * - The first remaining line must be a header containing REQUIRED_COLUMNS.
 * - Invalid data rows are skipped and reported in `issues`; they never get
 *   "fixed up" or filled with guessed values.
 * - Throws PriceFileFormatError if the header is missing or incomplete.
 */
export function parsePriceCsv(text: string): ParseResult {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const points: PricePoint[] = [];
  const issues: ParseIssue[] = [];
  let header: string[] | null = null;
  const seen = new Set<string>();

  lines.forEach((raw, idx) => {
    const lineNo = idx + 1;
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) return;

    let cells: string[];
    try {
      cells = splitCsvLine(line);
    } catch (e) {
      if (!header) throw e;
      issues.push({ line: lineNo, message: (e as Error).message });
      return;
    }

    if (!header) {
      header = cells.map((c) => c.toLowerCase());
      const missing = REQUIRED_COLUMNS.filter((c) => !header!.includes(c));
      if (missing.length) {
        throw new PriceFileFormatError(`Missing required column(s): ${missing.join(", ")}`);
      }
      return;
    }

    if (cells.length !== header.length) {
      issues.push({
        line: lineNo,
        message: `Expected ${header.length} fields, found ${cells.length}`,
      });
      return;
    }

    const get = (col: string) => cells[header!.indexOf(col)];
    const date = get("date");
    const hub = get("hub");
    const priceRaw = get("price_eur_mwh");
    const source = get("source");

    if (!isValidIsoDate(date)) {
      issues.push({ line: lineNo, message: `Invalid date "${date}" (expected YYYY-MM-DD)` });
      return;
    }
    if (!hub) {
      issues.push({ line: lineNo, message: "Missing hub" });
      return;
    }
    // Strict number: digits with optional decimal point, no thousands separators.
    if (!/^-?\d+(\.\d+)?$/.test(priceRaw)) {
      issues.push({ line: lineNo, message: `Invalid price "${priceRaw}"` });
      return;
    }
    if (!source) {
      issues.push({ line: lineNo, message: "Missing source" });
      return;
    }
    const key = `${date}|${hub.toUpperCase()}`;
    if (seen.has(key)) {
      issues.push({ line: lineNo, message: `Duplicate entry for ${hub} on ${date}` });
      return;
    }
    seen.add(key);
    points.push({ date, hub, priceEurMwh: Number(priceRaw), source });
  });

  if (!header) throw new PriceFileFormatError("File is empty: header row is missing");

  points.sort((a, b) => a.date.localeCompare(b.date) || a.hub.localeCompare(b.hub));
  return { points, issues };
}
