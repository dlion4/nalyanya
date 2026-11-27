"use client";

import { useId, useState } from "react";
import { kesShort } from "@/lib/format";
import type { Branch, Bucket, MonthRow, SyncState } from "@/data/dashboard/records";

const SEG = [
  "var(--color-brand-primary)",
  "var(--color-brand-accent)",
  "var(--color-purple)",
  "var(--color-brand-secondary)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-text-tertiary)",
];

/* ------------------------------------------------------------------ */
/* Cumulative net cash flow — the line draws on mount, points open a month */
/* ------------------------------------------------------------------ */
export function CashflowCurve({ months, onPick }: { months: MonthRow[]; onPick: (key: string) => void }) {
  const gid = useId();
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = 230;
  const P = 30;
  const n = months.length;
  const vals = [0, ...months.map((m) => m.cumulative)];
  const hi = Math.max(...vals);
  const lo = Math.min(...vals);
  const span = hi - lo || 1;
  const x = (i: number) => P + (i * (W - P * 2)) / Math.max(1, n - 1);
  const y = (v: number) => H - P - ((v - lo) / span) * (H - P * 2);
  const pts = months.map((m, i) => ({ x: x(i), y: y(m.cumulative) }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[n - 1].x.toFixed(1)} ${(H - P).toFixed(1)} L${pts[0].x.toFixed(1)} ${(H - P).toFixed(1)} Z`;

  return (
    <div>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Cumulative net cash flow by month">
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-primary)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--color-brand-primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1={P} x2={W - P} y1={y(0)} y2={y(0)} className="rc-axis" />
          <path d={area} fill={`url(#${gid})`} className="rc-area" />
          <path d={line} pathLength={1} className="rc-line" />
          {pts.map((p, i) => (
            <g key={months[i].key}>
              <circle cx={p.x} cy={p.y} r={hover === i ? 7 : 4.5} className="rc-dot" />
              <rect
                x={p.x - 30}
                y={P}
                width={60}
                height={H - P * 2}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onPick(months[i].key)}
              >
                <title>{`${months[i].label}: net ${kesShort(months[i].net)}`}</title>
              </rect>
            </g>
          ))}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-text-primary px-2 py-1 text-[0.7rem] font-semibold text-on-brand"
            style={{ left: `${(pts[hover].x / W) * 100}%`, top: `${(pts[hover].y / H) * 100}%` }}
          >
            {months[hover].label} · net {kesShort(months[hover].net)}
          </div>
        )}
      </div>
      <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {months.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => onPick(m.key)}
            className="ny-hud rounded py-1 text-center !text-[0.52rem] transition hover:text-text-primary"
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Money in vs out per month — bars grow on mount, columns open a month  */
/* ------------------------------------------------------------------ */
export function NetBars({ months, onPick }: { months: MonthRow[]; onPick: (key: string) => void }) {
  const W = 640;
  const H = 230;
  const P = 26;
  const max = Math.max(1, ...months.flatMap((m) => [m.inTotal, m.outTotal]));
  const band = (W - P * 2) / Math.max(1, months.length);
  const bw = Math.max(8, band * 0.3);
  const base = H - P;
  const scale = (v: number) => (v / max) * (H - P * 2 - 14);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Money in and out by month">
        <line x1={P} x2={W - P} y1={base} y2={base} className="rc-axis" />
        {months.map((m, i) => {
          const cx = P + i * band + band / 2;
          const hIn = scale(m.inTotal);
          const hOut = scale(m.outTotal);
          return (
            <g key={m.key} onClick={() => onPick(m.key)} style={{ cursor: "pointer" }}>
              <rect x={cx - bw - 3} y={base - hIn} width={bw} height={hIn} rx={3} className="rc-bar rc-bar--in">
                <title>{`${m.label} in: ${kesShort(m.inTotal)}`}</title>
              </rect>
              <rect x={cx + 3} y={base - hOut} width={bw} height={hOut} rx={3} className="rc-bar rc-bar--out">
                <title>{`${m.label} out: ${kesShort(m.outTotal)}`}</title>
              </rect>
              <text x={cx} y={H - 6} textAnchor="middle" className="rc-tick">
                {m.label}
              </text>
              <text x={cx} y={base - Math.max(hIn, hOut) - 6} textAnchor="middle" className="rc-val">
                {kesShort(m.net)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="ny-hud inline-flex items-center gap-1.5 !text-[0.55rem]">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-primary" aria-hidden /> Money in
        </span>
        <span className="ny-hud inline-flex items-center gap-1.5 !text-[0.55rem]">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-secondary" aria-hidden /> Money out
        </span>
        <span className="ny-hud ml-auto !text-[0.55rem]">Label = net for the month</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Donut — share of money by type; segments are buttons                  */
/* ------------------------------------------------------------------ */
export function Donut({ rows, onPick }: { rows: { bucket: Bucket; total: number }[]; onPick: (b: Bucket) => void }) {
  const total = Math.max(1, rows.reduce((s, r) => s + r.total, 0));
  const segs = rows.reduce<{ bucket: Bucket; total: number; frac: number; offset: number }[]>((acc, r) => {
    const last = acc[acc.length - 1];
    const offset = last ? last.offset + last.frac : 0;
    return [...acc, { bucket: r.bucket, total: r.total, frac: r.total / total, offset }];
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <svg viewBox="0 0 200 200" className="h-44 w-44 shrink-0 -rotate-90" role="img" aria-label="Share of money by type">
        <circle cx="100" cy="100" r="70" fill="none" strokeWidth="26" className="rc-donut-track" />
        {segs.map((s, i) => (
          <circle
            key={s.bucket}
            cx="100"
            cy="100"
            r="70"
            fill="none"
            strokeWidth="26"
            pathLength={1}
            strokeDasharray={`${Math.max(0.001, s.frac - 0.004)} 1`}
            strokeDashoffset={-s.offset}
            style={{ stroke: SEG[i % SEG.length], cursor: "pointer" }}
            className="rc-donut-seg"
            onClick={() => onPick(s.bucket)}
          >
            <title>{`${s.bucket}: ${kesShort(s.total)}`}</title>
          </circle>
        ))}
      </svg>
      <ul className="grid w-full grid-cols-[minmax(0,1fr)] gap-1">
        {segs.map((s, i) => (
          <li key={s.bucket}>
            <button
              type="button"
              onClick={() => onPick(s.bucket)}
              className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-surface-2"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: SEG[i % SEG.length] }} aria-hidden />
                <span className="truncate">{s.bucket}</span>
              </span>
              <span className="ny-num shrink-0 font-semibold">{Math.round(s.frac * 100)}%</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Branch heat table — colour intensity is the money moved that month     */
/* ------------------------------------------------------------------ */
export function HeatTable({
  branches,
  months,
  value,
  max,
  onPick,
}: {
  branches: Branch[];
  months: { key: string; label: string }[];
  value: (b: Branch, k: string) => number;
  max: number;
  onPick: (b: Branch, k: string) => void;
}) {
  return (
    <div className="ny-scroll overflow-x-auto">
      <table className="rc-heat">
        <thead>
          <tr>
            <th scope="col">Branch</th>
            {months.map((m) => (
              <th key={m.key} scope="col">
                {m.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {branches.map((b) => (
            <tr key={b}>
              <th scope="row" className="!text-text-primary">
                {b}
              </th>
              {months.map((m) => {
                const v = value(b, m.key);
                const a = v / Math.max(1, max);
                return (
                  <td key={m.key}>
                    <button
                      type="button"
                      className="rc-heat-cell"
                      aria-label={`${b} ${m.label}: ${kesShort(v)}`}
                      onClick={() => onPick(b, m.key)}
                      style={{
                        background: `color-mix(in srgb, var(--color-brand-primary) ${Math.round(Math.max(0.06, a) * 90)}%, var(--color-surface-1))`,
                        color: a > 0.5 ? "var(--color-on-brand)" : "var(--color-text-primary)",
                      }}
                    >
                      <span className="ny-num">{v ? kesShort(v) : "—"}</span>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Statement status card for one channel (3D tilt on hover)              */
/* ------------------------------------------------------------------ */
export function ChannelCard({
  label,
  detail,
  state,
  lastSync,
  openCount,
  sim,
  onOpen,
}: {
  label: string;
  detail: string;
  state: SyncState;
  lastSync: string;
  openCount: number;
  sim: boolean;
  onOpen: () => void;
}) {
  const tone = state === "SYNCED" ? "ny-chip-ok" : state === "DRIFT" ? "ny-chip-warn" : "ny-chip-danger";
  return (
    <button type="button" onClick={onOpen} className="rc-channel text-left">
      <span className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{label}</span>
          <span className="ny-hud mt-0.5 block !text-[0.52rem]">{detail}</span>
        </span>
        <span className={`ny-chip shrink-0 ${tone} ${state !== "SYNCED" ? "ny-pulse" : ""}`}>{state}</span>
      </span>
      <span className="mt-auto flex items-center justify-between gap-2 pt-3">
        <span className="ny-hud !text-[0.5rem]">Last sync · {lastSync}</span>
        {sim ? <span className="ny-chip ny-chip-sim">SIMULATED</span> : <span className="ny-chip ny-chip-ok">local</span>}
      </span>
      <span className="ny-hud mt-2 block !text-[0.5rem]">
        {openCount} open exception{openCount === 1 ? "" : "s"}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Progress bar — grows from 0 via a CSS variable                        */
/* ------------------------------------------------------------------ */
export function Bar({ value, max, gold = false }: { value: number; max: number; gold?: boolean }) {
  const p = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
  return (
    <div className="rc-meter" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(value)}>
      <span className={`rc-meter__bar ${gold ? "is-gold" : ""}`} style={{ ["--p" as string]: p }} />
    </div>
  );
}
