"use client";

import { useId, useState, type MouseEvent } from "react";
import { Ring } from "@/components/ui/primitives";
import { kes, kesShort } from "@/lib/format";
import { fmtDate, type Grant, type Pillar, pillarLabel } from "@/data/dashboard/foundation";

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const channelMeta = {
  mpesa: { label: "M-Pesa B2C", eta: "seconds", sim: true },
  bank: { label: "Bank EFT / paybill", eta: "same day", sim: true },
  internal: { label: "Internal ledger", eta: "instant", sim: false },
} as const;

/* ------------------------------------------------------------------ */
/* Disbursement timeline — cumulative released funds, os-draw on mount   */
/* ------------------------------------------------------------------ */
export function DisbursementTimeline({
  grants,
  height = 230,
}: {
  grants: Grant[];
  height?: number;
}) {
  const gid = useId();
  const points = grants
    .flatMap((g) => g.schedule.map((s) => ({ date: s.date, amount: s.amount, paid: s.paid, ref: g.ref, title: g.title })))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const W = 640;
  const H = height;
  const P = 26;
  if (points.length === 0) return null;

  type Step = (typeof points)[number] & { cumulative: number };
  const steps: Step[] = points.reduce<Step[]>((acc, p) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
    return [...acc, { ...p, cumulative: prev + (p.paid ? p.amount : 0) }];
  }, []);
  const total = Math.max(1, steps[steps.length - 1].cumulative);
  const x = (i: number) => P + (i * (W - P * 2)) / Math.max(1, steps.length - 1);
  const y = (v: number) => H - P - (v / total) * (H - P * 2);

  const line = steps.map((s, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(s.cumulative).toFixed(1)}`).join(" ");
  const area = `${line} L${x(steps.length - 1).toFixed(1)} ${H - P} L${P} ${H - P} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Cumulative funds released over time">
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-purple)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-purple)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={P} x2={W - P} y1={P + g * (H - P * 2)} y2={P + g * (H - P * 2)} className="fd-timeline__grid" />
        ))}
        <path d={area} fill={`url(#${gid})`} className="fd-timeline__area" />
        <path d={line} pathLength={1} className="fd-timeline__line" />
        {steps.map((s, i) => (
          <circle
            key={`${s.ref}-${s.date}`}
            cx={x(i)}
            cy={y(s.cumulative)}
            r={s.paid ? 5 : 3.5}
            className="fd-timeline__dot"
            fill={s.paid ? "var(--color-purple)" : "var(--color-surface-3)"}
          >
            <title>{`${fmtDate(s.date)} · ${s.paid ? "released" : "scheduled"} ${kes(s.amount)} · ${s.title}`}</title>
          </circle>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
        <span className="ny-hud !text-[0.55rem]">{fmtDate(steps[0].date)}</span>
        <span className="ny-hud inline-flex items-center gap-1.5 !text-[0.55rem]">
          <span className="h-2.5 w-2.5 rounded-full bg-purple" aria-hidden /> cumulative released
        </span>
        <span className="ny-hud !text-[0.55rem]">{fmtDate(steps[steps.length - 1].date)}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sparkline (os-draw)                                                  */
/* ------------------------------------------------------------------ */
export function Spark({ values, color = "var(--color-purple)" }: { values: number[]; color?: string }) {
  const W = 120;
  const H = 36;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const d = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${((i * W) / (values.length - 1)).toFixed(1)} ${(H - 4 - ((v - min) / span) * (H - 8)).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-9 w-28" aria-hidden>
      <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="fd-timeline__line" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Pillar meter — committed vs released                                 */
/* ------------------------------------------------------------------ */
export function PillarMeter({ released, committed, gold = false }: { released: number; committed: number; gold?: boolean }) {
  const p = committed <= 0 ? 0 : clamp(released / committed, 0, 1);
  return (
    <div>
      <div className="fd-meter" role="progressbar" aria-valuemin={0} aria-valuemax={committed} aria-valuenow={released}>
        <span className={`fd-meter__bar ${gold ? "is-gold" : ""}`} style={{ ["--p" as string]: p }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="ny-num font-semibold text-text-primary">{kes(released)}</span>
        <span className="text-text-tertiary">of {kesShort(committed)} committed</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Grant card with pointer-driven 3D tilt                               */
/* ------------------------------------------------------------------ */
export function GrantCard({
  grant,
  onOpen,
  flash,
}: {
  grant: Grant;
  onOpen: () => void;
  flash?: boolean;
}) {
  const p = Math.round((grant.disbursed / Math.max(1, grant.amount)) * 100);
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.firstElementChild as HTMLElement | null;
    if (!card) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty("--rx", `${(-py * 8).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${(px * 11).toFixed(2)}deg`);
  };
  const reset = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.firstElementChild as HTMLElement | null;
    card?.style.setProperty("--rx", "0deg");
    card?.style.setProperty("--ry", "0deg");
  };
  return (
    <div className="perspective-[1050px] h-full" onMouseMove={move} onMouseLeave={reset}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${grant.title}`}
        className={`fd-grant w-full text-left ${grant.status === "completed" ? "is-paid" : grant.status === "pending" ? "is-pending" : ""} ${flash ? "fd-flash-posted" : ""}`}
        style={{ transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" }}
      >
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="ny-hud block !text-[0.55rem]">{grant.ref}</span>
            <span className="ny-display mt-1 block text-[1.02rem] leading-tight">{grant.title}</span>
          </span>
          <Ring pct={p} size={54} stroke={6} gold={p >= 100} />
        </span>

        <span className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={`ny-chip ${grant.pillar === "education" ? "ny-chip-info" : grant.pillar === "medical" ? "ny-chip-danger" : "ny-chip-warn"}`}>
            {pillarLabel[grant.pillar]}
          </span>
          {grant.minor && <span className="ny-chip ny-chip-neutral">minor · anonymised</span>}
        </span>

        <span className="mt-2.5 block text-sm text-text-secondary">{grant.beneficiary}</span>

        <span className="mt-3 block">
          <PillarMeter released={grant.disbursed} committed={grant.amount} />
        </span>

        <span className="mt-3 flex items-center justify-between gap-2">
          <span className="ny-hud !text-[0.55rem]">
            {fmtDate(grant.starts)} → {fmtDate(grant.ends)}
          </span>
          <span className="ny-chip ny-chip-brand">open →</span>
        </span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Total-raised arc (big ring for the governance panel)                 */
/* ------------------------------------------------------------------ */
export function BigRing({ released, committed, label }: { released: number; committed: number; label: string }) {
  const p = committed <= 0 ? 0 : clamp(released / committed, 0, 1);
  return (
    <div className="flex items-center gap-4">
      <Ring pct={Math.round(p * 100)} size={96} stroke={9} gold={p >= 1} />
      <div className="min-w-0">
        <p className="ny-hud">{label}</p>
        <p className="ny-num ny-display text-2xl leading-none">{kes(released)}</p>
        <p className="mt-1 text-sm text-text-secondary">of {kes(committed)} committed</p>
      </div>
    </div>
  );
}

export function PillarTone({ p }: { p: Pillar }) {
  return <span className={`ny-chip ${p === "education" ? "ny-chip-info" : p === "medical" ? "ny-chip-danger" : "ny-chip-warn"}`}>{pillarLabel[p]}</span>;
}
