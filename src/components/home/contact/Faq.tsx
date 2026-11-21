/* ── H-7 S6 · FAQ — accordion: lineage · PIN receive · contributions · data · Elder Mode ── */

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Reveal from "../Reveal";
import { FAQ } from "../../../data/home/contact";
import { cn } from "../../../utils/cn";

export default function Faq() {
  const [open, setOpen] = useState<string | null>(FAQ[3]?.title ?? null);
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="Questions people ask">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <span className="ny-section-label">Before you write</span>
          <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">Questions <em className="font-medium text-brand-secondary">people ask.</em></h2>
          <p className="ny-prose mt-3 max-w-sm">Five answers in plain language. If yours isn't here, the note form is two steps up.</p>
        </Reveal>

        <div id="faq-list" className="flex flex-col gap-3 lg:col-span-8">
          {FAQ.map((item, i) => {
            const isOpen = open === item.title;
            return (
              <Reveal key={item.title} delay={i * 0.05}>
                <div className={cn("ny-card overflow-hidden rounded-2xl transition-shadow", isOpen && "shadow-lift")}>
                  <h3>
                    <button type="button" onClick={() => setOpen(isOpen ? null : item.title)} aria-expanded={isOpen} aria-controls={`faq-${i}`}
                      className="ny-touch flex w-full items-center gap-4 p-5 text-left">
                      <span className={cn("ny-icon-chip transition-colors", isOpen && "bg-brand-primary text-brand-accent")}><item.icon className="size-5" aria-hidden="true" /></span>
                      <span className="min-w-0 flex-1 font-display text-lg font-semibold text-text-primary">{item.title}</span>
                      <ChevronDown className={cn("size-5 shrink-0 text-text-tertiary transition-transform duration-300", isOpen && "rotate-180 text-brand-primary")} aria-hidden="true" />
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div id={`faq-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                        <p className="border-t border-surface-3/60 px-5 pb-5 pt-4 leading-relaxed text-text-secondary">{item.copy}</p>
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
