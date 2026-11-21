/* ── S9 · Family Finance — chama · Sacco · elder receive ──────────────────── */

import { useEffect, useState } from "react";
import { KeyRound, Coins } from "lucide-react";
import Reveal from "./Reveal";
import { FINANCE_CARDS, type FinanceCard } from "../../data/home/landing";
import { useInView } from "../../lib/hooks";

function Ring({ pct, size = 62, stroke = 6, accent }: { pct: number; size?: number; stroke?: number; accent: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [offset, setOffset] = useState(c);
  const { ref, inView } = useInView<SVGSVGElement>(0.35);
  useEffect(() => { if (inView) setOffset(c * (1 - pct)); }, [inView, pct, c]);
  return (
    <svg ref={ref} width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-3)" strokeWidth={stroke} />
      <circle
        className="ny-ring-circle"
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={accent} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
      />
    </svg>
  );
}

function FinanceCardView({ card }: { card: FinanceCard }) {
  const isReceive = card.id === "receive";
  return (
    <Reveal className="h-full">
      <article className="ny-card group flex h-full flex-col rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="ny-icon-chip" style={{ color: card.accent, backgroundColor: `${card.accent}14` }}>
            <card.icon className="size-5" aria-hidden="true" />
          </span>
          <span className="ny-sim-badge">SIMULATED</span>
        </div>

        <span className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-text-tertiary">{card.eyebrow}</span>
        <h3 className="ny-heading mt-1.5 text-[1.45rem]">{card.title}</h3>

        <div className="ny-num mt-4 flex items-end gap-3">
          <span className="font-display text-2xl font-semibold text-brand-primary sm:text-[1.7rem]">{card.figure}</span>
        </div>
        <p className="mt-1.5 text-sm text-text-secondary">{card.detail}</p>

        <div className="mt-5 flex items-center gap-4">
          {!isReceive ? (
            <>
              <Ring pct={card.progress} accent={card.accent} />
              <div>
                <span className="ny-num block font-display text-lg font-semibold text-text-primary">{Math.round(card.progress * 100)}%</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">{card.progressLabel}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="grid size-[62px] place-items-center rounded-full border border-dashed border-brand-violet/40 bg-brand-violet-tint text-brand-violet">
                <KeyRound className="size-6" aria-hidden="true" />
              </span>
              <div>
                <span className="block font-display text-lg font-semibold text-text-primary">No login</span>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">PIN → receive</span>
              </div>
            </div>
          )}
        </div>

        <p className="mt-auto border-t border-surface-3/60 pt-3 text-[11px] font-semibold text-text-tertiary">
          {card.footnote}
        </p>
      </article>
    </Reveal>
  );
}

export default function Finance() {
  return (
    <section id="finance" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="Family finance">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <span className="ny-section-label">Family finance</span>
              <h2 className="ny-heading mt-3 text-3xl sm:text-4xl lg:text-[2.7rem]">
                Chama, Sacco, loans <em className="font-display italic font-medium text-brand-secondary">and receive links.</em>
              </h2>
              <p className="ny-prose mt-3">
                Money stays with the family: one pool, simple rounds, and a 4-digit PIN that lets a grandmother receive without ever opening the app.
              </p>
            </div>
            <span className="ny-chip self-start sm:self-center">
              <Coins className="size-4 text-brand-secondary" aria-hidden="true" />
              KES-valued · EAT · family-scoped
            </span>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {FINANCE_CARDS.map((card) => (
            <FinanceCardView key={card.id} card={card} />
          ))}
        </div>

        <p className="mt-5 text-center text-xs font-medium text-text-tertiary">
          Every payout in this band is shown fully — with status, rotation and progress — but simulated. Nothing moves without the backend.
        </p>
      </div>
    </section>
  );
}
