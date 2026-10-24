import type { PricePoint } from "@/lib/prices/types";
import { hubsOf } from "@/lib/prices/sort";
import styles from "./prices.module.css";

const W = 720;
const H = 300;
const PAD = { top: 16, right: 16, bottom: 36, left: 52 };
const COLORS = ["#0f7c7a", "#1b3f73", "#c25e00", "#7a3fb0", "#2b8a3e", "#b42318"];

const dayMs = 86_400_000;
const toTime = (d: string) => Date.parse(`${d}T00:00:00Z`);

/** Simple dependency-free SVG line chart. The table is the accessible equivalent. */
export function PriceChart({ points }: { points: PricePoint[] }) {
  if (points.length === 0) return null;
  const hubs = hubsOf(points);
  const times = points.map((p) => toTime(p.date));
  const prices = points.map((p) => p.priceEurMwh);
  const tMin = Math.min(...times);
  const tMax = Math.max(...times);
  const tSpan = Math.max(tMax - tMin, dayMs);
  const pLo = Math.min(0, ...prices);
  const pHi = Math.max(...prices) * 1.1 || 1;

  const x = (t: number) => PAD.left + ((t - tMin) / tSpan) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - pLo) / (pHi - pLo)) * (H - PAD.top - PAD.bottom);
  const yTicks = Array.from({ length: 5 }, (_, i) => pLo + ((pHi - pLo) * i) / 4);
  const fmtDate = (t: number) => new Date(t).toISOString().slice(0, 10);

  return (
    <figure className={styles.chart}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="price-chart-title">
        <title id="price-chart-title">
          {`Line chart of gas prices in EUR/MWh from ${fmtDate(tMin)} to ${fmtDate(tMax)} for ${hubs.join(", ")}. The same data is in the table below.`}
        </title>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} stroke="#dbe2ea" />
            <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#4a5a6e">
              {v.toFixed(0)}
            </text>
          </g>
        ))}
        <text x={PAD.left} y={H - 8} fontSize="11" fill="#4a5a6e">{fmtDate(tMin)}</text>
        <text x={W - PAD.right} y={H - 8} fontSize="11" fill="#4a5a6e" textAnchor="end">{fmtDate(tMax)}</text>
        {hubs.map((hub, i) => {
          const series = points.filter((p) => p.hub === hub).sort((a, b) => a.date.localeCompare(b.date));
          const color = COLORS[i % COLORS.length];
          const d = series.map((p, j) => `${j ? "L" : "M"}${x(toTime(p.date)).toFixed(1)},${y(p.priceEurMwh).toFixed(1)}`).join(" ");
          return (
            <g key={hub}>
              <path d={d} fill="none" stroke={color} strokeWidth={2} />
              {series.map((p) => (
                <circle key={p.date} cx={x(toTime(p.date))} cy={y(p.priceEurMwh)} r={3} fill={color} />
              ))}
            </g>
          );
        })}
      </svg>
      <figcaption>
        <ul className={styles.legend}>
          {hubs.map((hub, i) => (
            <li key={hub}>
              <span className={styles.swatch} style={{ background: COLORS[i % COLORS.length] }} aria-hidden="true" />
              {hub}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
