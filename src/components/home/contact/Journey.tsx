/* ── H-7 · A note's journey — stamp-framed iris shutter, driven by the steps ── */

import { useState } from "react";
import ApertureShutter from "../ApertureShutter";
import Reveal from "../Reveal";
import { JOURNEY_STEPS } from "../../../data/home/contact";
import { cn } from "../../../utils/cn";

export default function Journey() {
  const [step, setStep] = useState(0);
  const slides = JOURNEY_STEPS.map((s) => s.slide);

  return (
    <section id="journey" className="scroll-mt-24 bg-surface-0 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="What happens after you press Send">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <span className="ny-section-label">After you press Send</span>
            <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">A note's <em className="font-medium text-brand-secondary">journey.</em></h2>
            <p className="ny-prose mt-3 max-w-md">Four steps, and a person at each one. Tap a step to see it.</p>
          </Reveal>

          <ol className="mt-8 flex flex-col gap-2" aria-label="Steps of a note">
            {JOURNEY_STEPS.map((s, i) => (
              <li key={s.n}>
                <button type="button" onClick={() => setStep(i)} aria-current={i === step}
                  className={cn("ny-touch flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-300",
                    i === step ? "border-brand-accent/60 bg-surface-1 shadow-card" : "border-surface-3/70 bg-transparent hover:bg-surface-1")}>
                  <span className={cn("ny-num grid size-10 shrink-0 place-items-center rounded-xl font-display text-sm font-semibold transition-colors",
                    i === step ? "bg-brand-accent text-brand-primary-deep" : "bg-surface-2 text-text-secondary")}>{s.n}</span>
                  <span>
                    <span className="block font-display text-lg font-semibold text-text-primary">{s.title}</span>
                    <span className={cn("block text-sm leading-relaxed text-text-secondary", i === step ? "mt-1" : "mt-0.5 line-clamp-1")}>{s.copy}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <Reveal delay={0.1} className="lg:col-span-6">
          <figure className="mx-auto max-w-xl">
            <div className="ny-stamp">
              <ApertureShutter
                slides={slides}
                index={step}
                onIndexChange={setStep}
                label="A note's journey"
                exposure="ƒ/5.6 · 1/60s · archive"
                className="aspect-[4/3.2] rounded-lg"
              />
            </div>
            <figcaption className="mt-3 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-text-tertiary">
              Step {JOURNEY_STEPS[step].n} · {JOURNEY_STEPS[step].title}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
