import { describe, expect, it } from "vitest";
import { parsePriceCsv, PriceFileFormatError, splitCsvLine } from "./parse";
import { sortPoints } from "./sort";

// NOTE: values below are test fixtures only, not real market prices.
const HEADER = "date,hub,price_eur_mwh,source";

describe("parsePriceCsv", () => {
  it("parses valid rows and ignores comments/blank lines", () => {
    const csv = `# comment\n\n${HEADER}\n2026-01-02,TTF,10.5,Fixture\n2026-01-01,THE,11,Fixture\n`;
    const { points, issues } = parsePriceCsv(csv);
    expect(issues).toEqual([]);
    expect(points).toEqual([
      { date: "2026-01-01", hub: "THE", priceEurMwh: 11, source: "Fixture" },
      { date: "2026-01-02", hub: "TTF", priceEurMwh: 10.5, source: "Fixture" },
    ]);
  });

  it("returns no points for a header-only file (empty state)", () => {
    expect(parsePriceCsv(`${HEADER}\n`)).toEqual({ points: [], issues: [] });
  });

  it("accepts columns in any order, extra columns, CRLF and BOM", () => {
    const csv = `\uFEFFsource,note,price_eur_mwh,hub,date\r\nFixture,x,1.25,TTF,2026-02-01\r\n`;
    expect(parsePriceCsv(csv).points).toEqual([
      { date: "2026-02-01", hub: "TTF", priceEurMwh: 1.25, source: "Fixture" },
    ]);
  });

  it("handles quoted fields containing commas and quotes", () => {
    const csv = `${HEADER}\n2026-01-01,TTF,5,"Publisher, ""Dataset"""`;
    expect(parsePriceCsv(csv).points[0].source).toBe('Publisher, "Dataset"');
  });

  it("throws on empty file", () => {
    expect(() => parsePriceCsv("")).toThrow(PriceFileFormatError);
    expect(() => parsePriceCsv("# only comments\n")).toThrow(/header/);
  });

  it("throws when a required column is missing", () => {
    expect(() => parsePriceCsv("date,hub,source\n")).toThrow(/price_eur_mwh/);
  });

  it.each([
    ["2026-13-01,TTF,1,F", /Invalid date/],
    ["2026-02-30,TTF,1,F", /Invalid date/],
    ["01/02/2026,TTF,1,F", /Invalid date/],
    ["2026-01-01,,1,F", /Missing hub/],
    ["2026-01-01,TTF,abc,F", /Invalid price/],
    ["2026-01-01,TTF,1,234.5,F", /Expected 4 fields/],
    ["2026-01-01,TTF,1 234,F", /Invalid price/],
    ["2026-01-01,TTF,,F", /Invalid price/],
    ["2026-01-01,TTF,1,", /Missing source/],
    ['2026-01-01,TTF,1,"unterminated', /Unterminated/],
  ])("skips and reports invalid row %s", (row, msg) => {
    const { points, issues } = parsePriceCsv(`${HEADER}\n${row}\n2026-01-05,TTF,2,F`);
    expect(points).toHaveLength(1);
    expect(issues).toHaveLength(1);
    expect(issues[0].line).toBe(2);
    expect(issues[0].message).toMatch(msg);
  });

  it("reports duplicate hub/date entries (case-insensitive hub)", () => {
    const { points, issues } = parsePriceCsv(`${HEADER}\n2026-01-01,TTF,1,F\n2026-01-01,ttf,2,F`);
    expect(points).toHaveLength(1);
    expect(issues[0]).toEqual({ line: 3, message: "Duplicate entry for ttf on 2026-01-01" });
  });

  it("accepts negative prices (they can occur) ", () => {
    expect(parsePriceCsv(`${HEADER}\n2026-01-01,TTF,-0.5,F`).points[0].priceEurMwh).toBe(-0.5);
  });
});

describe("splitCsvLine", () => {
  it("trims fields", () => {
    expect(splitCsvLine(" a , b,c ")).toEqual(["a", "b", "c"]);
  });
});

describe("sortPoints", () => {
  const pts = [
    { date: "2026-01-02", hub: "B", priceEurMwh: 3, source: "F" },
    { date: "2026-01-01", hub: "A", priceEurMwh: 5, source: "F" },
  ];
  it("sorts by price desc and does not mutate input", () => {
    expect(sortPoints(pts, "priceEurMwh", "desc").map((p) => p.priceEurMwh)).toEqual([5, 3]);
    expect(pts[0].hub).toBe("B");
  });
  it("sorts by date asc", () => {
    expect(sortPoints(pts, "date", "asc")[0].date).toBe("2026-01-01");
  });
});
