/* ── H-3 S8 · How asking for help works — drawn 4-step strip ─────────────── */

import Reveal from "../Reveal";
import { HIRE_STEPS } from "../../../data/home/professions";
import { useInView } from "../../../lib/hooks";

export default function HireFlow() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  return (
    <section id="hire" className="scroll-mt-24 bg-brand-primary-deep px-4 py-16 text-surface-0 sm:px-6 sm:py-24 lg:px-8" aria-label="How asking for help works">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-accent">How asking for help works</span>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.05] sm:text-5xl">Browse. Note. Agree. <em className="font-medium text-brand-accent">Then rate.</em></h2>
        </Reveal>
        <div ref={ref} className="relative mt-12">
          <div className="absolute left-0 right-0 top-7 hidden h-[2px] bg-white/15 lg:block" aria-hidden="true">
            <div className="ny-hire-fill h-full origin-left bg-brand-accent" style={{ transform: `scaleX(${inView ? 1 : 0})` }} />
          </div>
          <ol className="grid gap-4 lg:grid-cols-4">
            {HIRE_STEPS.map((s, i) => (
              <li key={s.n} className="relative rounded-2xl border border-white/10 bg-white/5 p-5">
                <span className="relative z-10 grid size-14 place-items-center rounded-2xl bg-brand-accent font-display text-lg font-semibold text-brand-primary-deep">{s.n}</span>
                <h3 className="mt-4 font-display text-2xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-surface-2/80">{s.copy}</p>
                <span className="mt-4 block text-[10px] font-bold uppercase tracking-[0.16em] text-brand-accent/80">Step {i + 1} of {HIRE_STEPS.length}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
