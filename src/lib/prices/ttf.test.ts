import { describe, expect, it } from "vitest";
import { parseDateCell, parsePriceCell, parseTtfCsv } from "./ttf";
import { PriceFileFormatError } from "./parse";

// NOTE: numbers below are test fixtures only, not real market prices.

describe("parseTtfCsv", () => {
  it("parses a simple ISO comma-separated file, sorted by date", () => {
    const r = parseTtfCsv("date,price\n2026-01-02,2.5\n2026-01-01,1.5\n");
    expect(r.points).toEqual([
      { date: "2026-01-01", price: 1.5 },
      { date: "2026-01-02", price: 2.5 },
    ]);
    expect(r.issues).toEqual([]);
    expect(r.unit).toBe("EUR/MWh");
    expect(r.source).toBeNull();
  });

  it("reads # source and # unit metadata comments", () => {
    const r = parseTtfCsv("# source: Fixture publisher\n# unit: EUR/MWh\nDate,Close\n2026-01-01,1\n");
    expect(r.source).toBe("Fixture publisher");
    expect(r.points).toHaveLength(1);
  });

  it("handles European exports: semicolon, DD/MM/YYYY, decimal comma, BOM, CRLF", () => {
    const r = parseTtfCsv("\uFEFFDatum;Open;Settlement\r\n31/01/2026;1,0;12,75\r\n01/02/2026;1,0;1.234,5\r\n");
    expect(r.points).toEqual([
      { date: "2026-01-31", price: 12.75 },
      { date: "2026-02-01", price: 1234.5 },
    ]);
  });

  it("detects US month/day order when unambiguous", () => {
    const r = parseTtfCsv("Date,Price\n01/31/2026,1\n02/01/2026,2\n");
    expect(r.points.map((p) => p.date)).toEqual(["2026-01-31", "2026-02-01"]);
  });

  it("accepts tab-separated files with extra columns and quoted values", () => {
    const r = parseTtfCsv('Trade Date\tVolume\tPrice\n"2026-03-01"\t100\t"3.25"\n');
    expect(r.points).toEqual([{ date: "2026-03-01", price: 3.25 }]);
  });

  it("accepts timestamps with a time part", () => {
    expect(parseTtfCsv("timestamp,value\n2026-03-01T00:00:00Z,4\n").points[0].date).toBe("2026-03-01");
  });

  it("falls back to [date, price] for two unrecognised columns", () => {
    expect(parseTtfCsv("Jour,Montant\n2026-01-01,5\n").points).toEqual([{ date: "2026-01-01", price: 5 }]);
  });

  it("skips and reports invalid rows and duplicate dates", () => {
    const r = parseTtfCsv("date,price\n2026-01-01,1\nnot-a-date,2\n2026-01-02,abc\n2026-01-01,3\n2026-02-30,1\n");
    expect(r.points).toEqual([{ date: "2026-01-01", price: 1 }]);
    expect(r.issues.map((i) => i.line)).toEqual([3, 4, 5, 6]);
    expect(r.issues[2].message).toMatch(/Duplicate/);
  });

  it("returns no points for a header-only file", () => {
    expect(parseTtfCsv("date,price\n").points).toEqual([]);
  });

  it("throws on empty file or unusable header", () => {
    expect(() => parseTtfCsv("")).toThrow(PriceFileFormatError);
    expect(() => parseTtfCsv("a,b,c\n1,2,3")).toThrow(/date column/);
  });
});

describe("cell parsers", () => {
  it.each([
    ["2026-01-05", "2026-01-05"],
    ["2026/1/5", "2026-01-05"],
    ["05.01.2026", "2026-01-05"],
    ["5-1-2026", "2026-01-05"],
    ["2026-13-01", null],
    ["yesterday", null],
  ])("parseDateCell(%s) = %s", (input, out) => {
    expect(parseDateCell(input)).toBe(out);
  });

  it.each([
    ["31.25", false, 31.25],
    ["1,234.5", false, 1234.5],
    ["€ 31.25", false, 31.25],
    ["31,25", true, 31.25],
    ["1 234,5", true, 1234.5],
    ["-0.5", false, -0.5],
    ["", false, null],
    ["n/a", false, null],
  ])("parsePriceCell(%s, comma=%s) = %s", (input, comma, out) => {
    expect(parsePriceCell(input as string, comma as boolean)).toBe(out);
  });
});
