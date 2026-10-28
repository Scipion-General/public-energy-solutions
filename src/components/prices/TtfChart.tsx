"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { TtfResponse } from "@/lib/prices/types";
import styles from "./prices.module.css";

type Loaded = Extract<TtfResponse, { status: "ok" }>;
type State = { kind: "loading" } | { kind: "missing" } | { kind: "error"; message: string } | ({ kind: "ready" } & Loaded);

const RANGES = [
  { id: "1m", label: "1M", days: 31 },
  { id: "6m", label: "6M", days: 183 },
  { id: "1y", label: "1Y", days: 366 },
  { id: "all", label: "All", days: Infinity },
] as const;
type RangeId = (typeof RANGES)[number]["id"];

const W = 760;
const H = 320;
const PAD = { top: 16, right: 20, bottom: 40, left: 56 };
const DAY = 86_400_000;
const toTime = (d: string) => Date.parse(`${d}T00:00:00Z`);
const fmtPrice = new Intl.NumberFormat("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

/** TTF price vs date, read from the file set in src/content/prices.ts via /api/ttf. */
export function TtfChart() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [range, setRange] = useState<RangeId>("all");
  const [hover, setHover] = useState<number | null>(null);

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/ttf", { cache: "no-store" });
      const body = (await res.json()) as TtfResponse;
      if (body.status === "ok") setState({ kind: "ready", ...body });
      else if (body.status === "missing") setState({ kind: "missing" });
      else setState({ kind: "error", message: body.message });
    } catch {
      setState({ kind: "error", message: "The TTF data could not be loaded. Check your connection and try again." });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const visible = useMemo(() => {
    if (state.kind !== "ready" || state.points.length === 0) return [];
    const days = RANGES.find((r) => r.id === range)!.days;
    const last = toTime(state.points[state.points.length - 1].date);
    return state.points.filter((p) => last - toTime(p.date) <= days * DAY);
  }, [state, range]);

  const heading = (
    <h2 id="ttf-title" className={styles.sectionTitle}>
      TTF price history
    </h2>
  );

  if (state.kind === "loading")
    return (
      <section aria-labelledby="ttf-title">
        {heading}
        <div className={styles.state} role="status" aria-live="polite">
          <span className={styles.spinner} aria-hidden="true" /> Loading TTF data…
        </div>
      </section>
    );

  if (state.kind === "missing")
    return (
      <section aria-labelledby="ttf-title">
        {heading}
        <div className={styles.state} role="status">
          <p>No TTF data file has been published yet (expected at <code>src/app/gas-prices/ttf.csv</code>).</p>
        </div>
      </section>
    );

  if (state.kind === "error")
    return (
      <section aria-labelledby="ttf-title">
        {heading}
        <div className={`${styles.state} ${styles.error}`} role="alert">
          <p>{state.message}</p>
          <button type="button" className="button" onClick={load}>
            Try again
          </button>
        </div>
      </section>
    );

  const { unit, source, issues, illustrative } = state;
  const notice = illustrative ? (
    <p className={styles.illustrative} role="note">
      <strong>Illustrative data:</strong> the TTF figures below are mock values used to demonstrate the chart. They are
      not real market prices and must not be used for any decision.
    </p>
  ) : null;

  if (state.points.length === 0)
    return (
      <section aria-labelledby="ttf-title">
        {heading}
        {notice}
        <div className={styles.state} role="status">
          <p>The TTF data file contains no valid rows yet.</p>
        </div>
        <Issues issues={issues} />
      </section>
    );

  const times = visible.map((p) => toTime(p.date));
  const prices = visible.map((p) => p.price);
  const tMin = Math.min(...times);
  const tMax = Math.max(...times);
  const tSpan = Math.max(tMax - tMin, DAY);
  const rawLo = Math.min(...prices);
  const rawHi = Math.max(...prices);
  const margin = (rawHi - rawLo) * 0.08 || Math.abs(rawHi) * 0.1 || 1;
  const pLo = rawLo - margin;
  const pHi = rawHi + margin;
  const x = (t: number) => PAD.left + ((t - tMin) / tSpan) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - pLo) / (pHi - pLo)) * (H - PAD.top - PAD.bottom);
  const yTicks = Array.from({ length: 5 }, (_, i) => pLo + ((pHi - pLo) * i) / 4);
  const xTicks = Array.from({ length: 5 }, (_, i) => tMin + (tSpan * i) / 4);
  const path = visible.map((p, i) => `${i ? "L" : "M"}${x(times[i]).toFixed(1)},${y(p.price).toFixed(1)}`).join(" ");
  const area = `${path} L${x(tMax).toFixed(1)},${H - PAD.bottom} L${x(tMin).toFixed(1)},${H - PAD.bottom} Z`;

  const first = visible[0];
  const last = visible[visible.length - 1];
  const change = last.price - first.price;
  const hp = hover !== null ? visible[hover] : null;

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const t = tMin + (((e.clientX - rect.left) / rect.width) * W - PAD.left) / (W - PAD.left - PAD.right) * tSpan;
    let best = 0;
    for (let i = 1; i < times.length; i++) if (Math.abs(times[i] - t) < Math.abs(times[best] - t)) best = i;
    setHover(best);
  }

  return (
    <section aria-labelledby="ttf-title" className={styles.ttf}>
      {heading}
      {notice}
      <div className={styles.toolbar}>
        <div role="group" aria-label="Time range" className={styles.ranges}>
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              className={styles.rangeButton}
              aria-pressed={range === r.id}
              onClick={() => setRange(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
        <dl className={styles.stats}>
          <div>
            <dt>Latest ({last.date})</dt>
            <dd>
              {fmtPrice.format(last.price)} {unit}
            </dd>
          </div>
          <div>
            <dt>Change over period</dt>
            <dd>
              {change >= 0 ? "+" : ""}
              {fmtPrice.format(change)} ({first.price !== 0 ? `${((change / first.price) * 100).toFixed(1)}%` : "n/a"})
            </dd>
          </div>
          <div>
            <dt>Range</dt>
            <dd>
              {fmtPrice.format(rawLo)} – {fmtPrice.format(rawHi)}
            </dd>
          </div>
        </dl>
      </div>

      <figure className={styles.chart}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby="ttf-chart-desc"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <title id="ttf-chart-desc">
            {`${illustrative ? "Illustrative mock data, not real prices. " : ""}TTF gas price in ${unit} from ${first.date} to ${last.date}: ${visible.length} data points, from ${fmtPrice.format(first.price)} to ${fmtPrice.format(last.price)}, low ${fmtPrice.format(rawLo)}, high ${fmtPrice.format(rawHi)}.`}
          </title>
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="#dbe2ea" />
              <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#4a5a6e">
                {v.toFixed(v < 10 ? 1 : 0)}
              </text>
            </g>
          ))}
          {xTicks.map((t, i) => (
            <text
              key={t}
              x={x(t)}
              y={H - 14}
              fontSize="11"
              fill="#4a5a6e"
              textAnchor={i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}
            >
              {fmtDate(t)}
            </text>
          ))}
          <text x={12} y={PAD.top + 4} fontSize="11" fill="#4a5a6e" transform={`rotate(-90 12 ${PAD.top + 4})`} textAnchor="end">
            {unit}
          </text>
          <path d={area} fill="#12918e" opacity={0.12} />
          <path d={path} fill="none" stroke="#0f7c7a" strokeWidth={2} strokeLinejoin="round" />
          {visible.length <= 60 &&
            visible.map((p, i) => <circle key={p.date} cx={x(times[i])} cy={y(p.price)} r={2.5} fill="#0f7c7a" />)}
          {hp && hover !== null && (
            <g pointerEvents="none">
              <line x1={x(times[hover])} x2={x(times[hover])} y1={PAD.top} y2={H - PAD.bottom} stroke="#0b1f3a" strokeDasharray="3 3" />
              <circle cx={x(times[hover])} cy={y(hp.price)} r={4.5} fill="#0b1f3a" />
            </g>
          )}
        </svg>
        <figcaption className={styles.caption}>
          <span aria-live="polite">
            {hp ? `${hp.date}: ${fmtPrice.format(hp.price)} ${unit}` : "Hover over the chart to read a value."}
          </span>
          <span>
            Source: {illustrative ? "mock data (illustrative only)" : (source ?? "not specified in the data file")}
            {" · "}File updated {new Date(state.updatedAt).toLocaleDateString("en-GB")}
          </span>
        </figcaption>
      </figure>

      <details className={styles.dataDetails}>
        <summary>Show data table ({visible.length} rows)</summary>
        <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="TTF data table">
          <table className={styles.table}>
            <caption className="visually-hidden">TTF price by date</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col" className={styles.num}>
                  Price ({unit})
                </th>
              </tr>
            </thead>
            <tbody>
              {[...visible].reverse().map((p) => (
                <tr key={p.date}>
                  <td>
                    <time dateTime={p.date}>{p.date}</time>
                  </td>
                  <td className={styles.num}>{fmtPrice.format(p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <Issues issues={issues} />
    </section>
  );
}

function Issues({ issues }: { issues: { line: number; message: string }[] }) {
  if (issues.length === 0) return null;
  return (
    <details className={styles.warning}>
      <summary>
        {issues.length} {issues.length === 1 ? "row was" : "rows were"} skipped in ttf.csv because of invalid data
      </summary>
      <ul>
        {issues.slice(0, 50).map((i) => (
          <li key={i.line}>
            Line {i.line}: {i.message}
          </li>
        ))}
        {issues.length > 50 && <li>… and {issues.length - 50} more</li>}
      </ul>
    </details>
  );
}
