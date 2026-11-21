/* ── H-2 S8 · What membership means — animated accordion ─────────────────── */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import Reveal from "../Reveal";
import { MEMBERSHIP } from "../../../data/home/about";
import { HERITAGE_IMAGES } from "../../../data/home/landing";
import { cn } from "../../../utils/cn";

export default function Membership() {
  const [open, setOpen] = useState<string | null>(MEMBERSHIP[0].id);
  return (
    <section id="membership" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8" aria-label="What membership means">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <span className="ny-section-label">What membership means</span>
          <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">More than a name <em className="font-medium text-brand-secondary">on a tree.</em></h2>
          <p className="ny-prose mt-4 max-w-md">Every member gets the same five things — whether they are 9 or 90, in Bungoma or in Boston.</p>
          <div className="relative mt-8 hidden overflow-hidden rounded-[1.75rem] shadow-lift lg:block">
            <img src={HERITAGE_IMAGES.secondary} alt="Family members in traditional dress" className="aspect-[4/3] w-full object-cover" loading="lazy" decoding="async" />
            <div className="ny-glass absolute bottom-4 left-4 right-4 rounded-xl px-4 py-3 text-sm font-semibold text-brand-primary">Membership is free for every Nalyanya — by birth, marriage or adoption.</div>
          </div>
        </Reveal>

        <div className="flex flex-col gap-3 lg:col-span-7">
          {MEMBERSHIP.map((m, i) => {
            const isOpen = open === m.id;
            return (
              <Reveal key={m.id} delay={i * 0.05}>
                <div className={cn("ny-card overflow-hidden rounded-2xl transition-shadow", isOpen && "shadow-lift")}>
                  <h3>
                    <button type="button" onClick={() => setOpen(isOpen ? null : m.id)} aria-expanded={isOpen} aria-controls={`mem-${m.id}`}
                      className="ny-touch flex w-full items-center gap-4 p-5 text-left">
                      <span className={cn("ny-icon-chip transition-colors", isOpen && "bg-brand-primary text-brand-accent")}><m.icon className="size-5" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold text-text-primary">{m.title}{m.simulated && <span className="ny-sim-badge">Simulated</span>}</span>
                        <span className="block text-sm text-text-secondary">{m.summary}</span>
                      </span>
                      <ChevronDown className={cn("size-5 shrink-0 text-text-tertiary transition-transform duration-300", isOpen && "rotate-180 text-brand-primary")} aria-hidden="true" />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div id={`mem-${m.id}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                        <ul className="grid gap-2 border-t border-surface-3/60 px-5 pb-5 pt-4 sm:grid-cols-3">
                          {m.points.map((p) => (
                            <li key={p} className="flex items-start gap-2 rounded-xl bg-surface-2/60 p-3 text-sm font-medium text-text-secondary">
                              <Check className="mt-0.5 size-4 shrink-0 text-brand-success" aria-hidden="true" />{p}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
