"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { PricesResponse } from "@/lib/prices/types";
import { hubsOf } from "@/lib/prices/sort";
import { PriceTable } from "./PriceTable";
import { PriceChart } from "./PriceChart";
import styles from "./prices.module.css";

type Loaded = Extract<PricesResponse, { status: "ok" }>;
type State = { kind: "loading" } | { kind: "error"; message: string } | ({ kind: "ready" } & Loaded);

const NO_POINTS: Loaded["points"] = [];

export function PriceExplorer() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [hub, setHub] = useState<string>("all");

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/prices", { cache: "no-store" });
      const body = (await res.json()) as PricesResponse;
      if (body.status === "ok") setState({ kind: "ready", ...body });
      else setState({ kind: "error", message: body.message });
    } catch {
      setState({ kind: "error", message: "The price data could not be loaded. Check your connection and try again." });
    }
  }, []);

  useEffect(() => {
    // Initial data fetch on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const points = state.kind === "ready" ? state.points : NO_POINTS;
  const hubs = useMemo(() => hubsOf(points), [points]);
  const visible = useMemo(() => (hub === "all" ? points : points.filter((p) => p.hub === hub)), [points, hub]);

  if (state.kind === "loading") {
    return (
      <div className={styles.state} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" /> Loading price data…
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className={`${styles.state} ${styles.error}`} role="alert">
        <h2>Prices unavailable</h2>
        <p>{state.message}</p>
        <button type="button" className="button" onClick={load}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.explorer}>
      {state.issues.length > 0 && (
        <details className={styles.warning}>
          <summary>
            {state.issues.length} {state.issues.length === 1 ? "row was" : "rows were"} skipped because of invalid data
          </summary>
          <ul>
            {state.issues.map((i) => (
              <li key={i.line}>
                Line {i.line}: {i.message}
              </li>
            ))}
          </ul>
        </details>
      )}

      {points.length === 0 ? (
        <div className={styles.state} role="status">
          <h2>No price data published yet</h2>
          <p>The price data file currently contains no entries. Prices will appear here once sourced figures have been added.</p>
        </div>
      ) : (
        <>
          <div className={styles.toolbar}>
            <label htmlFor="hub-filter">Hub</label>
            <select id="hub-filter" value={hub} onChange={(e) => setHub(e.target.value)}>
              <option value="all">All hubs</option>
              {hubs.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            {state.updatedAt && (
              <span className={styles.meta}>
                Data file updated <time dateTime={state.updatedAt}>{new Date(state.updatedAt).toLocaleDateString("en-GB")}</time>
              </span>
            )}
          </div>
          <PriceChart points={visible} />
          <PriceTable points={visible} />
        </>
      )}
    </div>
  );
}
