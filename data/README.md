# Price data

The Gas Prices page reads **`data/gas-prices.csv`** (override with the `PRICE_DATA_FILE`
environment variable). The site never generates or estimates prices: it only displays
what is in this file.

## Format

UTF-8 CSV. Lines starting with `#` and blank lines are ignored. The first other line is
the header; these columns are required (any order, extra columns are ignored):

| Column          | Format                                      | Example                 |
|-----------------|---------------------------------------------|-------------------------|
| `date`          | `YYYY-MM-DD`                                | `2026-10-01`            |
| `hub`           | Hub/market code                             | `TTF`                   |
| `price_eur_mwh` | Number, `.` decimal, no thousands separator | `31.25`                 |
| `source`        | Publisher / dataset of the figure           | `"Publisher, dataset"`  |

Fields containing commas must be wrapped in double quotes (`""` escapes a quote).

## Validation

- Missing header or required column → the page shows an **error** state.
- Invalid rows (bad date, non-numeric price, empty hub/source, wrong field count,
  duplicate hub+date) are **skipped** and listed on the page as warnings with their line numbers.
- Header present but no valid rows → **empty** state.

## Updating

1. Obtain figures from a source you are licensed to republish (many exchange
   price feeds are commercially licensed — check terms before publishing).
2. Append rows, keeping the `source` column accurate.
3. Commit and redeploy (or replace the file on the server: it is read on each request).
