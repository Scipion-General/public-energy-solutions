"use client";

import { useState } from "react";
import type { PricePoint } from "@/lib/prices/types";
import { sortPoints, type SortDir, type SortKey } from "@/lib/prices/sort";
import styles from "./prices.module.css";

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "date", label: "Date" },
  { key: "hub", label: "Hub" },
  { key: "priceEurMwh", label: "Price (EUR/MWh)", numeric: true },
];

const priceFmt = new Intl.NumberFormat("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 3 });

export function PriceTable({ points }: { points: PricePoint[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [dir, setDir] = useState<SortDir>("desc");
  const rows = sortPoints(points, sortKey, dir);

  function toggle(key: SortKey) {
    if (key === sortKey) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setDir(key === "date" ? "desc" : "asc");
    }
  }

  return (
    <div className={styles.tableWrap} tabIndex={0} role="region" aria-labelledby="price-table-caption">
      <table className={styles.table}>
        <caption id="price-table-caption">
          Gas prices ({rows.length} {rows.length === 1 ? "entry" : "entries"}). Select a column heading to sort.
        </caption>
        <thead>
          <tr>
            {COLUMNS.map((c) => {
              const active = c.key === sortKey;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}
                  className={c.numeric ? styles.num : undefined}
                >
                  <button type="button" className={styles.sortButton} onClick={() => toggle(c.key)}>
                    {c.label}
                    <span aria-hidden="true">{active ? (dir === "asc" ? " ▲" : " ▼") : " ↕"}</span>
                  </button>
                </th>
              );
            })}
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={`${p.date}-${p.hub}`}>
              <td>
                <time dateTime={p.date}>{p.date}</time>
              </td>
              <td>{p.hub}</td>
              <td className={styles.num}>{priceFmt.format(p.priceEurMwh)}</td>
              <td>{p.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
