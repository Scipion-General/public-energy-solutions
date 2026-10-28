/**
 * Settings for the TTF price-history chart on the Gas Prices page.
 */
export const ttfData = {
  /** CSV read by /api/ttf, relative to the project root. Override with TTF_DATA_FILE. */
  file: "src/app/gas-prices/ttf.csv",
  /**
   * The current file is a MOCK dataset (not real market prices). While true, the
   * page shows a prominent "illustrative data" notice. Set to false only once the
   * file contains real, sourced prices (and add a "# source: ..." line to it).
   */
  illustrative: true,
} as const;
