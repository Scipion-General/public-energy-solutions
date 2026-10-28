/** One observation of a gas price, as read from the price data file. */
export interface PricePoint {
  /** ISO calendar date, YYYY-MM-DD. */
  date: string;
  /** Trading hub or market identifier, e.g. "TTF". */
  hub: string;
  /** Price in EUR per MWh. */
  priceEurMwh: number;
  /** Where the figure comes from (publisher / dataset name). */
  source: string;
}

export interface ParseIssue {
  /** 1-based line number in the source file. */
  line: number;
  message: string;
}

export interface ParseResult {
  points: PricePoint[];
  /** Lines that were skipped because they were invalid. */
  issues: ParseIssue[];
}

/** Shape returned by GET /api/prices. */
export type PricesResponse =
  | { status: "ok"; points: PricePoint[]; issues: ParseIssue[]; updatedAt: string | null }
  | { status: "error"; message: string };

/** Shape returned by GET /api/ttf. */
export type TtfResponse =
  | {
      status: "ok";
      points: { date: string; price: number }[];
      issues: ParseIssue[];
      source: string | null;
      unit: string;
      updatedAt: string;
    }
  | { status: "missing" }
  | { status: "error"; message: string };
