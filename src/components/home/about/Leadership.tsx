/* ── H-2 S9 · Leadership roll — role-first cards, shortened names, no contacts ── */

import { Link } from "react-router-dom";
import { Lock, MessageCircle } from "lucide-react";
import Reveal from "../Reveal";
import { LEADERS } from "../../../data/home/about";

export default function Leadership() {
  return (
    <section id="leadership" className="scroll-mt-24 border-y border-surface-3/60 bg-surface-2/50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8" aria-label="Family leadership">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="ny-section-label">Leadership roll</span>
              <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">The people who <em className="font-medium text-brand-secondary">hold the tree.</em></h2>
            </div>
            <span className="ny-chip self-start"><Lock className="size-3.5 text-brand-primary" aria-hidden="true" />Contacts hidden · reach them via the family office</span>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 [perspective:1400px] sm:grid-cols-2 lg:grid-cols-4">
          {LEADERS.map((l, i) => (
            <Reveal key={l.role} delay={i * 0.08}>
              <article className="ny-leader ny-card overflow-hidden rounded-[1.75rem]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={l.photo} alt={`${l.role} of the Nalyanya family`} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1610]/75 via-transparent to-transparent" />
                  <span className="ny-leader-chip absolute left-4 top-4 rounded-pill px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-surface-0 shadow-card" style={{ background: l.accent }}>{l.role}</span>
                  <div className="absolute inset-x-4 bottom-4 text-surface-0">
                    <p className="font-display text-2xl font-semibold">{l.name}</p>
                    <p className="text-xs font-semibold text-surface-2/85">{l.branch} · {l.since}</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm leading-relaxed text-text-secondary">{l.duty}</p>
                  <Link to="/contact" className="ny-touch mt-4 inline-flex items-center gap-2 rounded-pill border border-surface-3 px-4 py-2 text-xs font-bold text-brand-primary transition-colors hover:border-brand-primary/40 hover:bg-brand-primary-tint">
                    <MessageCircle className="size-4" aria-hidden="true" />Message via family office
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
