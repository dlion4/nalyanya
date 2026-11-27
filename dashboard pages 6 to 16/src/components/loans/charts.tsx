"use client";

import { useId, useState, type MouseEvent } from "react";
import { Ring } from "@/components/ui/primitives";
import { kes, fmt } from "@/lib/format";
import {
  AS_OF,
  fmtDate,
  products,
  productOf,
  schedule,
  statusMeta,
  totalOf,
  type Channel,
  type LoanView,
  type ProductId,
  type Row,
} from "@/data/dashboard/loans";

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export const channelMeta: Record<Channel, { label: string; sim: boolean; eta: string }> = {
  mpesa: { label: "M-Pesa Daraja", sim: true, eta: "seconds" },
  bank: { label: "Bank EFT / RTGS", sim: true, eta: "same day" },
  internal: { label: "Internal wallet", sim: false, eta: "instantly" },
};

/* ------------------------------------------------------------------ */
/* Amortization chart — principal + interest per instalment, balance line */
/* ------------------------------------------------------------------ */
export function AmortChart({
  rows,
  amount,
  height = 190,
  active = null,
  onPick,
}: {
  rows: Row[];
  amount: number;
  height?: number;
  active?: number | null;
  onPick?: (i: number) => void;
}) {
  const gid = useId();
  const W = 640;
  const H = height;
  const P = 20;
  const n = Math.max(1, rows.length);
  const maxI = Math.max(1, ...rows.map((r) => r.instalment));
  const bw = (W - P * 2) / n;
  const barW = Math.max(2, bw * 0.66);
  const yI = (v: number) => H - P - (v / maxI) * (H - P * 2);
  const balances = [amount, ...rows.map((r) => r.balance)];
  const yB = (v: number) => H - P - (v / Math.max(1, amount)) * (H - P * 2);
  const line = balances.map((v, i) => `${i === 0 ? "M" : "L"}${(P + i * bw).toFixed(1)} ${yB(v).toFixed(1)}`).join(" ");

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Instalments split into principal and interest, with the balance line">
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-brand-accent)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="var(--color-brand-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={P} x2={W - P} y1={H - P} y2={H - P} className="ln-chart__axis" />
        {rows.map((r, i) => {
          const x = P + i * bw + (bw - barW) / 2;
          const yPrin = yI(r.principal);
          const yTop = yI(r.principal + r.interest);
          const isActive = active === i;
          return (
            <g key={r.no} opacity={active === null || isActive ? 1 : 0.45}>
              <rect x={x} y={yPrin} width={barW} height={H - P - yPrin} rx={2} className="ln-chart__bar-p" />
              <rect x={x} y={yTop} width={barW} height={Math.max(0, yPrin - yTop)} rx={2} className="ln-chart__bar-i" />
            </g>
          );
        })}
        <path d={`${line} L${(P + (balances.length - 1) * bw).toFixed(1)} ${H - P} L${P} ${H - P} Z`} fill={`url(#${gid})`} />
        <path d={line} pathLength={1} className="ln-chart__balance" />
        {active !== null && rows[active] && (
          <line x1={P + active * bw + bw / 2} x2={P + active * bw + bw / 2} y1={P} y2={H - P} className="ln-chart__cursor" />
        )}
        {onPick &&
          rows.map((r, i) => (
            <rect
              key={`hit-${r.no}`}
              x={P + i * bw}
              y={P}
              width={bw}
              height={H - P * 2}
              className="ln-chart__col"
              onClick={() => onPick(i)}
            >
              <title>{`Instalment ${r.no} · ${fmtDate(r.due)} · ${kes(r.instalment)}`}</title>
            </rect>
          ))}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="ny-hud inline-flex items-center gap-1.5 !text-[0.55rem]">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-primary" aria-hidden /> Principal
        </span>
        <span className="ny-hud inline-flex items-center gap-1.5 !text-[0.55rem]">
          <span className="h-2.5 w-2.5 rounded-sm bg-brand-accent" aria-hidden /> Interest
        </span>
        <span className="ny-hud inline-flex items-center gap-1.5 !text-[0.55rem]">
          <span className="h-0.5 w-4 bg-text-primary" aria-hidden /> Balance left
        </span>
        <span className="ny-hud ml-auto !text-[0.55rem]">{rows.length} instalments</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Passbook ticket — a loan as a 3D card that tilts with the pointer     */
/* ------------------------------------------------------------------ */
export function LoanTicket({ view, who, onOpen }: { view: LoanView; who: string; onOpen: () => void }) {
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.firstElementChild as HTMLElement | null;
    if (!card) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty("--rx", `${(-py * 10).toFixed(2)}deg`);
    card.style.setProperty("--ry", `${(px * 14).toFixed(2)}deg`);
  };
  const reset = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget.firstElementChild as HTMLElement | null;
    card?.style.setProperty("--rx", "0deg");
    card?.style.setProperty("--ry", "0deg");
  };
  const p = productOf(view.loan.product);
  const meta = statusMeta[view.status];
  const alert = view.status === "overdue";
  return (
    <div className="perspective-[1100px] h-full" onMouseMove={move} onMouseLeave={reset}>
      <button type="button" onClick={onOpen} className={`ln-ticket ${alert ? "is-alert" : ""}`} aria-label={`Open ${p.name} ${view.loan.ref}`}>
        <span className="ln-ticket__foil" aria-hidden />
        <span className="relative flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span className="ny-hud block !text-[0.55rem]">{view.loan.ref}</span>
            <span className="ny-display mt-1 block truncate text-base leading-tight">{p.name}</span>
            <span className="mt-0.5 block truncate text-xs text-text-secondary">{who}</span>
          </span>
          <Ring pct={view.pct} size={56} stroke={6} gold={view.pct >= 100} />
        </span>
        <span className="relative mt-4 grid grid-cols-2 gap-2">
          <span>
            <span className="ny-hud block !text-[0.5rem]">Left to repay</span>
            <span className="ny-num block font-semibold">{kes(view.outstanding)}</span>
          </span>
          <span>
            <span className="ny-hud block !text-[0.5rem]">{view.next ? "Next due" : "Closed"}</span>
            <span className="ny-num block font-semibold">{view.next ? fmtDate(view.next.due) : "—"}</span>
          </span>
        </span>
        <span className="relative mt-3 flex items-center justify-between gap-2">
          <span className={`ny-chip ${meta.tone}`}>{meta.label}</span>
          <span className="ny-hud !text-[0.55rem]">open →</span>
        </span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Calculator — pick a monthly product, slide amount and term, see the schedule */
/* ------------------------------------------------------------------ */
export function Calculator({
  start,
  onApply,
  compact = false,
}: {
  start: ProductId;
  onApply?: (p: ProductId, amount: number, term: number) => void;
  compact?: boolean;
}) {
  const monthly = products.filter((x) => x.freq === "monthly");
  const [pid, setPid] = useState<ProductId>(start);
  const [amt, setAmt] = useState(150000);
  const [term, setTerm] = useState(12);
  const p = productOf(pid);
  const a = clamp(amt, p.min, p.max);
  const t = clamp(term, p.termMin, p.termMax);
  const rows = schedule({ amount: a, rate: p.rate, method: p.method, freq: "monthly", termMonths: t, start: AS_OF });
  const total = totalOf(rows);

  return (
    <div className="ln-calc p-4 sm:p-5">
      <div className="flex flex-wrap gap-1.5">
        {monthly.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setPid(m.id)}
            className={`ny-chip ny-touch transition ${pid === m.id ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"}`}
          >
            {m.chip}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="ny-label" htmlFor={`calc-amt-${compact ? "c" : "f"}`}>
            Amount · {kes(a)}
          </label>
          <input
            id={`calc-amt-${compact ? "c" : "f"}`}
            type="range"
            min={p.min}
            max={p.max}
            step={5000}
            value={a}
            onChange={(e) => setAmt(Number(e.target.value))}
            className="w-full accent-[var(--color-brand-primary)]"
          />
          <p className="ny-hud mt-1 !text-[0.52rem]">
            {kes(p.min)} – {kes(p.max)}
          </p>
        </div>
        <div>
          <label className="ny-label" htmlFor={`calc-term-${compact ? "c" : "f"}`}>
            Term · {t} months
          </label>
          <input
            id={`calc-term-${compact ? "c" : "f"}`}
            type="range"
            min={p.termMin}
            max={p.termMax}
            step={1}
            value={t}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="w-full accent-[var(--color-brand-primary)]"
          />
          <p className="ny-hud mt-1 !text-[0.52rem]">
            {p.rate}% a year · {p.method === "flat" ? "flat interest" : "reducing balance"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="ny-inset px-3 py-2.5">
          <p className="ny-hud !text-[0.5rem]">Each month</p>
          <p className="ny-num font-semibold">{kes(rows[0]?.instalment ?? 0)}</p>
        </div>
        <div className="ny-inset px-3 py-2.5">
          <p className="ny-hud !text-[0.5rem]">Interest</p>
          <p className="ny-num font-semibold">{kes(total - a)}</p>
        </div>
        <div className="ny-inset px-3 py-2.5">
          <p className="ny-hud !text-[0.5rem]">Total back</p>
          <p className="ny-num font-semibold">{kes(total)}</p>
        </div>
      </div>

      <div className="mt-4">
        <AmortChart rows={rows} amount={a} height={compact ? 150 : 190} />
      </div>

      {onApply && (
        <button type="button" className="ny-btn ny-btn-accent mt-4 w-full" onClick={() => onApply(pid, a, t)}>
          Apply with these terms
        </button>
      )}
      <p className="ny-hud mt-2 text-center !text-[0.52rem]">
        Illustration only · {fmt(rows.length)} instalments starting {fmtDate(rows[0]?.due ?? AS_OF)}
      </p>
    </div>
  );
}
