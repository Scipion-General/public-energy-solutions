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

---

# TTF price history (`data/ttf.csv`)

The **TTF price history** chart on the Gas Prices page reads **`data/ttf.csv`**
(override with `TTF_DATA_FILE`). If the file does not exist, the page says so; nothing is invented.

## Accepted format

The reader accepts the usual exports so you can drop a file in as-is:

- **Delimiter:** comma, semicolon or tab (detected from the header).
- **Header:** must contain a date column and a price column. Recognised names (case-insensitive):
  - date: `date`, `day`, `trade date`, `trading date`, `delivery date`, `timestamp`, `time`, `datum`
  - price: `price`, `price_eur_mwh`, `price (eur/mwh)`, `eur/mwh`, `close`, `close price`,
    `settlement`, `settlement price`, `settle`, `last`, `value`, `ttf`, `prix`, `preis`
  - A file with exactly two columns of other names is read as `date, price`.
  - Other columns (open, high, volume...) are ignored.
- **Dates:** `YYYY-MM-DD` (time part allowed), `YYYY/MM/DD`, or `DD/MM/YYYY`, `DD.MM.YYYY`, `DD-MM-YYYY`.
  US `MM/DD/YYYY` is detected automatically when unambiguous (e.g. `01/31/2026`).
- **Prices:** `31.25`, `1,234.5`; with `;` or tab delimiters a decimal comma (`31,25`, `1.234,5`) is
  recognised. A `€` sign is ignored.
- **Optional metadata comments** (shown on the page):
  ```
  # source: Name of the publisher / dataset
  # unit: EUR/MWh
  ```

Invalid rows and duplicate dates are skipped and listed under the chart with their line numbers.

## Minimal example (structure only - not real prices)

```
# source: <publisher, dataset name>
date,price
2026-01-02,<price>
2026-01-05,<price>
```

Check that you are licensed to republish the figures (exchange data such as ICE Endex TTF
settlement prices is usually commercially licensed).
