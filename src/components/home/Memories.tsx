/* ── S7 · Memories — horizontal gallery scroller + lightbox ─────────────── */

import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X, Images } from "lucide-react";
import Reveal from "./Reveal";
import { MEMORIES, type MemoryItem } from "../../data/home/landing";

export default function Memories() {
  const [active, setActive] = useState<MemoryItem | null>(null);

  const close = useCallback(() => setActive(null), []);

  // escape to close + scroll lock
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active, close]);

  return (
    <section id="memories" className="scroll-mt-24 border-y border-surface-3/60 bg-surface-1" aria-label="Family memories">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <span className="ny-section-label">Memories</span>
              <h2 className="ny-heading mt-3 text-3xl sm:text-4xl lg:text-[2.7rem]">
                Moments, kept.
              </h2>
              <p className="ny-prose mt-3 max-w-xl">
                Weddings, graduations, homestead afternoons — every milestone, tagged with the album and the year it belonged to.
              </p>
            </div>
            <Link to="/gallery" className="ny-btn-ghost ny-touch inline-flex self-start sm:self-center">
              <Images className="size-4" aria-hidden="true" />
              View full gallery
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-9">
          <div className="ny-gallery-row" role="list" aria-label="Memory photos">
            {MEMORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="listitem"
                onClick={() => setActive(item)}
                className="ny-memory-card group relative block overflow-hidden rounded-xl border border-surface-3/60 bg-surface-2 text-left shadow-card"
                aria-label={`Open memory: ${item.caption}`}
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={item.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-3 top-3 rounded-pill bg-surface-0/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-primary backdrop-blur-sm">
                    {item.album}
                  </span>
                  <span className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-pill bg-brand-primary/90 text-surface-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100" aria-hidden="true">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
                <figcaption className="p-3.5">
                  <p className="line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-snug text-text-primary">{item.caption}</p>
                  <p className="mt-1.5 text-xs font-semibold text-text-tertiary">{item.year}</p>
                </figcaption>
              </button>
            ))}
          </div>
        </Reveal>

        <p className="mt-4 text-xs font-medium text-text-tertiary">Scroll sideways · tap a photo to enlarge it</p>
      </div>

      {/* lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="ny-lightbox-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label={`Memory: ${active.caption}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-surface-1 shadow-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img src={active.src} alt={active.caption} className="aspect-[16/10] w-full object-cover" />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close lightbox"
                  className="ny-touch absolute right-4 top-4 grid size-11 place-items-center rounded-pill bg-surface-0/90 text-brand-primary shadow-card backdrop-blur-md transition-transform hover:scale-105"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-md">
                  <p className="font-display text-lg font-semibold leading-snug text-text-primary">{active.caption}</p>
                  <p className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-text-tertiary">
                    <span className="rounded-pill bg-brand-violet-tint px-2.5 py-1 text-brand-violet">{active.album}</span>
                    {active.year}
                  </p>
                </div>
                <Link to="/gallery" className="ny-btn-ghost ny-touch inline-flex shrink-0" onClick={close}>
                  <Images className="size-4" aria-hidden="true" />
                  Open the full gallery
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
