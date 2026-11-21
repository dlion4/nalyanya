/* ── H-3 S4 · Trades in 3D — canvas + glass HUD. Static ring if no WebGL. ── */

import { Suspense, lazy, useEffect, useState } from "react";
import { Crosshair, Layers3 } from "lucide-react";
import { CATEGORIES, categoryOf } from "../../../data/home/professions";
import { useElderMode, useInView, usePrefersReducedMotion } from "../../../lib/hooks";
import { cn } from "../../../utils/cn";

const TradesScene = lazy(() => import("./TradesScene"));

function hasWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

export default function Trades3D({ active, onPick }: { active: string; onPick: (id: string) => void }) {
  const reduced = usePrefersReducedMotion();
  const { mode: elder } = useElderMode();
  const { ref, inView } = useInView<HTMLDivElement>(0.08);
  const [webgl, setWebgl] = useState(true);
  useEffect(() => setWebgl(hasWebGL()), []);
  const use3D = webgl && !reduced && !elder;
  const index = CATEGORIES.findIndex((c) => c.id === active);
  const current = categoryOf(active);

  const selectIndex = (i: number) => onPick(i < 0 ? "all" : CATEGORIES[i].id);

  return (
    <section id="constellation" className="scroll-mt-24 px-4 py-6 sm:px-6 lg:px-8" aria-label="Trades in 3D">
      <div ref={ref} className="ny-trades-stage relative mx-auto h-[78vh] min-h-[540px] max-w-7xl overflow-hidden rounded-[2rem] shadow-panel">
        {use3D && inView ? (
          <Suspense fallback={<RingFallback active={active} onPick={onPick} />}>
            <TradesScene activeIndex={index} onSelectIndex={selectIndex} reduced={reduced} />
          </Suspense>
        ) : (
          <RingFallback active={active} onPick={onPick} />
        )}

        <div className="ny-glass-dark pointer-events-none absolute left-4 right-4 top-4 rounded-2xl p-4 text-surface-0 sm:right-auto sm:max-w-sm sm:p-5">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent"><Layers3 className="size-3.5" aria-hidden="true" />The directory · in 3D</p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">Twelve trades, <em className="font-medium text-brand-accent">one family.</em></h2>
          <p className="mt-2 hidden text-sm leading-relaxed text-surface-2/80 sm:block">Tap an orb. The camera flies to that trade, and the directory below filters with it.</p>
        </div>

        <div className="ny-glass-dark absolute right-4 top-4 hidden items-center gap-2 rounded-pill px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-surface-2 md:flex">
          <span className={cn("size-2 rounded-pill", use3D ? "bg-brand-success" : "bg-brand-accent")} />
          {use3D ? "WebGL · live" : elder ? "Static · Elder Mode" : "Static view"}
        </div>

        {current && (
          <div className="ny-glass-dark absolute bottom-24 left-4 right-4 rounded-2xl p-4 text-surface-0 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-xs">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent">{current.label}</p>
            <p className="mt-1 font-display text-lg font-semibold">{current.blurb}</p>
            <p className="mt-1 text-xs text-surface-2/75">{current.range}</p>
            <button type="button" onClick={() => onPick("all")} className="mt-2 text-xs font-bold text-brand-accent underline">Show every trade</button>
          </div>
        )}

        <div className="absolute inset-x-3 bottom-3 flex gap-1.5 overflow-x-auto pb-1 sm:hidden" role="group" aria-label="Choose a trade">
          {CATEGORIES.map((c) => (
            <button key={c.id} type="button" aria-pressed={active === c.id} onClick={() => onPick(active === c.id ? "all" : c.id)}
              className="ny-trade-pill ny-touch shrink-0 rounded-pill border border-white/15 px-3 py-1.5 text-xs font-bold text-surface-2">
              {c.label}
            </button>
          ))}
        </div>

        <p className="pointer-events-none absolute bottom-5 right-6 hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-surface-2/55 lg:flex">
          <Crosshair className="size-3.5" aria-hidden="true" /> Move the pointer to look around
        </p>
      </div>
    </section>
  );
}

function RingFallback({ active, onPick }: { active: string; onPick: (id: string) => void }) {
  return (
    <div className="grid h-full place-items-center p-8">
      <div className="grid max-w-lg grid-cols-3 gap-2 sm:grid-cols-4">
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" onClick={() => onPick(c.id)} aria-pressed={active === c.id}
            className={cn("ny-touch rounded-2xl border px-2 py-3 text-xs font-bold", active === c.id ? "border-brand-accent bg-brand-accent text-brand-primary-deep" : "border-white/15 text-surface-2 hover:bg-white/10")}>
            <c.icon className="mx-auto mb-1 size-4" aria-hidden="true" />{c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
