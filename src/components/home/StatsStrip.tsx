/* ── S4 · Stats strip — count-up on scroll ──────────────────────────────── */

import Reveal from "./Reveal";
import { STATS } from "../../data/home/landing";
import { useCountUp, useInView } from "../../lib/hooks";

function Stat({ value, suffix, label, detail }: { value: number; suffix: string; label: string; detail: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const display = useCountUp(value, { start: inView, duration: 1650 });
  return (
    <div ref={ref} className="text-center">
      <div className="ny-num font-display text-[2.6rem] font-semibold leading-none text-brand-primary sm:text-5xl">
        {display}
        <span className="text-brand-accent">{suffix}</span>
      </div>
      <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">{label}</div>
      <div className="mt-1 text-xs text-text-tertiary">{detail}</div>
    </div>
  );
}

export default function StatsStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8" aria-label="Family numbers">
      <Reveal>
        <div className="grid grid-cols-2 gap-y-10 gap-x-4 sm:grid-cols-3 lg:grid-cols-5">
          {STATS.map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
