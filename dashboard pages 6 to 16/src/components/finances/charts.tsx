"use client";

import { useEffect, useId, useState, type MouseEvent } from "react";
import { clock, fmt } from "@/lib/format";
import type { Person } from "@/data/dashboard/finances";

/* ---------- Share curve: os-draw line + month points that open detail ---------- */
export function ShareCurve({
  values,
  labels,
  onPick,
  height = 220,
}: {
  values: number[];
  labels: string[];
  onPick?: (i: number) => void;
  height?: number;
}) {
  const gid = useId();
  const [hover, setHover] = useState<number | null>(null);
  const W = 640;
  const H = height;
  const P = 28;
  const hi = Math.max(...values) * 1.08;
  const lo = Math.min(...values) * 0.92;
  const span = hi - lo || 1;
  const x = (i: number) => P + (i * (W - P * 2)) / Math.max(1, values.length - 1);
  const y = (v: number) => H - P - ((v - lo) / span) * (H - P * 2);
  const line = values.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(values.length - 1).toFixed(1)} ${H - P} L${x(0).toFixed(1)} ${H - P} Z`;

  return (
    <div className="fin-curve">
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Your shares over time">
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-accent)" stopOpacity="0.42" />
              <stop offset="100%" stopColor="var(--color-brand-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1={P} x2={W - P} y1={P + g * (H - P * 2)} y2={P + g * (H - P * 2)} className="fin-curve__grid" />
          ))}
          <path d={area} fill={`url(#${gid})`} className="fin-curve__area" />
          <path d={line} pathLength={1} className="fin-curve__line" />
          {values.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r={hover === i ? 7 : 4.5} className="fin-curve__dot" />
          ))}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md bg-text-primary px-2 py-1 text-[0.7rem] font-semibold text-on-brand shadow-[var(--shadow-raise)]"
            style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(values[hover]) / H) * 100}%`, marginTop: -10 }}
          >
            {labels[hover]} · {fmt(values[hover])} shares
          </div>
        )}
      </div>
      <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))` }}>
        {values.map((v, i) => (
          <button
            key={`${labels[i]}-${i}`}
            type="button"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onClick={() => onPick?.(i)}
            aria-label={`${labels[i]}: ${v} shares — open month detail`}
            className="ny-hud rounded py-1 text-center !text-[0.5rem] transition hover:text-text-primary sm:!text-[0.56rem]"
          >
            {labels[i]}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- Sparkline (os-draw) ---------- */
export function Spark({ values, className = "" }: { values: number[]; className?: string }) {
  const W = 120;
  const H = 36;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const d = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${((i * W) / (values.length - 1)).toFixed(1)} ${(H - 4 - ((v - min) / span) * (H - 8)).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`h-9 w-28 ${className}`} aria-hidden>
      <path d={d} pathLength={1} fill="none" stroke="var(--color-brand-accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="fin-curve__line" />
    </svg>
  );
}

/* ---------- Merry-go-round in 3D: seats on a ring, the recipient turns to the front ---------- */
export function MgrRing3D({
  people,
  currentIdx,
  paidIds,
  radius = 132,
}: {
  people: Person[];
  currentIdx: number;
  paidIds: string[];
  radius?: number;
}) {
  const n = Math.max(1, people.length);
  const step = 360 / n;
  return (
    <div className="fin-ring-stage" aria-label="Merry-go-round seats in 3D">
      <div className="fin-hub">
        <div>
          <p className="ny-hud !text-[0.52rem]">Round pot</p>
          <p className="ny-display text-base leading-tight">{people[currentIdx]?.name.split(" ")[0] ?? "—"}</p>
          <p className="ny-hud !text-[0.5rem]">takes the pot</p>
        </div>
      </div>
      <div className="fin-ring transform-3d" style={{ transform: `rotateY(${-currentIdx * step}deg)` }}>
        {people.map((p, i) => {
          const a = (i - currentIdx) * step * (Math.PI / 180);
          const front = (Math.cos(a) + 1) / 2;
          const isCurrent = i === currentIdx;
          const done = i < currentIdx;
          return (
            <div
              key={`${p.id}-${i}`}
              className={`fin-seat ${isCurrent ? "is-current ny-pulse" : ""} ${done ? "is-done" : ""}`}
              style={{ transform: `rotateY(${i * step}deg) translateZ(${radius}px)`, opacity: 0.28 + 0.72 * front }}
            >
              <span className="fin-seat__init">{p.initials}</span>
              <span className="ny-hud !text-[0.5rem] leading-tight">{p.name.split(" ")[0]}</span>
              <span className="ny-hud !text-[0.46rem]">{paidIds.includes(p.id) ? "paid" : "due"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Share certificate with pointer-driven 3D tilt ---------- */
export function ShareCertificate3D({
  holder,
  shares,
  value,
  contributed,
  reference,
}: {
  holder: string;
  shares: number;
  value: number;
  contributed: number;
  reference: string;
}) {
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.firstElementChild as HTMLElement | null;
    if (!card) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty("--rx", `${(-py * 12).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${(px * 16).toFixed(2)}deg`);
  };
  const reset = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.firstElementChild as HTMLElement | null;
    card?.style.setProperty("--rx", "0deg");
    card?.style.setProperty("--ry", "0deg");
  };
  return (
    <div className="perspective-[1200px]" onMouseMove={move} onMouseLeave={reset}>
      <div className="fin-cert">
        <div className="fin-cert__foil" aria-hidden />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="ny-hud !text-[0.56rem]">Share certificate · Nalyanya Family Sacco</p>
            <p className="ny-display mt-1 truncate text-lg leading-tight">{holder}</p>
            <p className="ny-hud mt-1 !text-[0.56rem]">{reference}</p>
          </div>
          <span className="fin-cert__seal" aria-hidden />
        </div>
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          <div>
            <p className="ny-hud !text-[0.52rem]">Shares</p>
            <p className="ny-num ny-display text-2xl leading-none">{fmt(shares)}</p>
          </div>
          <div>
            <p className="ny-hud !text-[0.52rem]">Value now</p>
            <p className="ny-num ny-display text-base leading-none">KES {fmt(value)}</p>
          </div>
          <div>
            <p className="ny-hud !text-[0.52rem]">Paid in</p>
            <p className="ny-num ny-display text-base leading-none">KES {fmt(contributed)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Live countdown (client-only ticking; SSR-stable initial value) ---------- */
export function Countdown({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const id = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="ny-num">{clock(left)}</span>;
}

/* ---------- Progress meter (grows from 0 via CSS var) ---------- */
export function Meter({ value, max, gold = false, className = "" }: { value: number; max: number; gold?: boolean; className?: string }) {
  const p = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
  return (
    <div className={`fin-meter ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.round(value)}>
      <span className={`fin-meter__bar ${gold ? "is-gold" : ""}`} style={{ ["--p" as string]: p }} />
    </div>
  );
}
