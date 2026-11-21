/* ── H-2 S4 · Values & traditions — 3D flip cards (Faith · Family · Service) ── */

import { useState } from "react";
import { Check, RotateCw } from "lucide-react";
import Reveal from "../Reveal";
import { VALUES } from "../../../data/home/about";
import { cn } from "../../../utils/cn";

export default function ValuesFlip() {
  const [flipped, setFlipped] = useState<string | null>(null);

  return (
    <section id="values" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8" aria-label="Values and traditions">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="ny-section-label">Values & traditions</span>
              <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">Faith. Family. <em className="font-medium text-brand-secondary">Service.</em></h2>
            </div>
            <p className="max-w-sm text-sm text-text-tertiary">Hover or tap a card to turn it over and see how each value shows up in family life.</p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {VALUES.map((v, i) => {
            const isFlipped = flipped === v.id;
            return (
              <Reveal key={v.id} delay={i * 0.1}>
                <div className={cn("ny-flip h-[27rem]", isFlipped && "is-flipped")}>
                  <button type="button" onClick={() => setFlipped(isFlipped ? null : v.id)} aria-pressed={isFlipped}
                    aria-label={`${v.title} — ${isFlipped ? "show photo" : "show how it shows up"}`} className="ny-flip-inner block w-full text-left">
                    {/* front */}
                    <div className="ny-flip-face shadow-lift">
                      <img src={v.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1610]/90 via-[#0b1610]/30 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-6 text-surface-0">
                        <span className="grid size-12 place-items-center rounded-2xl" style={{ background: v.accent }}><v.icon className="size-6 text-surface-0" aria-hidden="true" /></span>
                        <h3 className="mt-4 font-display text-4xl font-semibold">{v.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm text-surface-2/85">{v.copy}</p>
                        <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-accent"><RotateCw className="size-3.5" aria-hidden="true" />Turn over</span>
                      </div>
                    </div>
                    {/* back */}
                    <div className="ny-flip-face ny-flip-back border border-surface-3 bg-surface-1 p-7 shadow-lift">
                      <div className="absolute -right-12 -top-12 size-40 rounded-pill opacity-15 blur-2xl" style={{ background: v.accent }} aria-hidden="true" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: v.accent }}>{v.title} in practice</span>
                      <p className="mt-3 font-display text-lg leading-relaxed text-text-primary">{v.copy}</p>
                      <ul className="mt-5 space-y-3">
                        {v.shows.map((s) => (
                          <li key={s} className="flex items-start gap-3 text-sm font-medium text-text-secondary">
                            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-pill" style={{ background: `${v.accent}22`, color: v.accent }}><Check className="size-3" /></span>{s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
