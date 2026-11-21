/* ── S6 · Heritage — origin story with os-draw timeline + image montage ──── */

import { useId } from "react";
import Reveal from "./Reveal";
import { HERITAGE_TIMELINE, HERITAGE_CHIPS, HERITAGE_MOTTO, HERITAGE_MOTTO_COPY, HERITAGE_IMAGES } from "../../data/home/landing";
import { useInView } from "../../lib/hooks";

export default function Heritage() {
  const { ref, inView } = useInView<HTMLDivElement>(0.18);
  const gradId = useId();

  return (
    <section id="lineage" className="relative scroll-mt-24 overflow-hidden border-y border-surface-3/60 bg-surface-2/50" aria-label="Family heritage">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* ── images (right column on desktop) ── */}
          <Reveal className="lg:order-2">
            <figure className="relative">
              {/* primary reunion image */}
              <div className="relative overflow-hidden rounded-2xl shadow-lift ring-1 ring-surface-3/70">
                <img src={HERITAGE_IMAGES.primary} alt="A multigenerational Nalyanya family gathered outdoors" className="aspect-[4/3] w-full object-cover" loading="lazy" decoding="async" />
                <figcaption className="ny-glass absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-xs font-semibold text-brand-primary">
                  <span className="inline-flex items-center gap-2"><span className="size-2 rounded-pill bg-brand-accent" aria-hidden="true" />Bungoma homestead · 2024 reunion</span>
                  <button type="button" onClick={() => document.getElementById("memories")?.scrollIntoView({ behavior: "smooth" })} className="hidden items-center gap-1 text-brand-primary underline-offset-4 hover:underline sm:inline-flex">Tap the gallery →</button>
                </figcaption>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="overflow-hidden rounded-xl shadow-card ring-1 ring-surface-3/60">
                  <img src={HERITAGE_IMAGES.secondary} alt="Family in traditional attire" className="aspect-[3/2] w-full object-cover" loading="lazy" decoding="async" />
                </div>
                <div className="overflow-hidden rounded-xl shadow-card ring-1 ring-surface-3/60">
                  <img src={HERITAGE_IMAGES.landscape} alt="Western Kenya savanna at sunset" className="aspect-[3/2] w-full object-cover" loading="lazy" decoding="async" />
                </div>
              </div>

              {/* crest chip */}
              <div className="ny-float-slow absolute -right-3 -top-6 grid size-20 place-items-center rounded-2xl border border-brand-accent/50 bg-surface-1 shadow-lift">
                <span className="text-center leading-tight">
                  <span className="block font-display text-2xl font-semibold text-brand-primary">5</span>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-text-tertiary">generations</span>
                </span>
              </div>
            </figure>
          </Reveal>

          {/* ── copy + os-draw timeline ── */}
          <div className="lg:order-1">
            <Reveal>
              <span className="ny-eyebrow">{HERITAGE_MOTTO} — {HERITAGE_MOTTO_COPY}</span>
              <h2 className="ny-heading mt-5 text-3xl sm:text-4xl lg:text-[2.7rem]">
                Eighty-some years.
                <br />
                <em className="font-display italic font-medium text-brand-secondary">Five generations.</em>
              </h2>
              <p className="ny-prose mt-4 max-w-lg">
                Nalyanya started in Bungoma, spread south to Nairobi and out to the diaspora — and stayed one tree.
                The lineage, the money pool and the memories all start from the same gold root.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {HERITAGE_CHIPS.map((chip) => (
                  <span key={chip.gen} className="ny-chip">
                    <span className="font-display text-[0.9rem] font-semibold text-brand-secondary">{chip.gen}</span>
                    {chip.label}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* os-draw timeline */}
            <div ref={ref} className="relative mt-10 pl-12">
              <svg
                viewBox="0 0 40 430"
                preserveAspectRatio="none"
                className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-10 overflow-visible"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4A437" />
                    <stop offset="45%" stopColor="#1F4D3A" />
                    <stop offset="100%" stopColor="#6A4C93" />
                  </linearGradient>
                </defs>
                <path
                  className={`ny-draw-line ${inView ? "is-in" : ""}`}
                  d="M20 4 C 4 110, 36 250, 20 424"
                  stroke={`url(#${gradId})`}
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  pathLength="1"
                />
              </svg>

              <ol className="relative flex flex-col gap-8">
                {HERITAGE_TIMELINE.map((node, i) => (
                  <li key={node.year} className="relative">
                    <span
                      className={`ny-draw-dot ${inView ? "is-in" : ""} ny-draw-d${i + 1} absolute -left-12 top-1.5 grid size-6 place-items-center`}
                      aria-hidden="true"
                    >
                      <span className="absolute size-6 rounded-pill border-2 border-brand-primary bg-surface-0" />
                      <span className="size-2.5 rounded-pill bg-brand-accent" />
                    </span>
                    <div className="flex items-baseline gap-3">
                      <span className="ny-num font-display text-lg font-semibold text-brand-secondary">{node.year}</span>
                      <h3 className="font-display text-base font-semibold text-text-primary sm:text-lg">{node.title}</h3>
                    </div>
                    <p className="mt-1.5 max-w-md text-sm leading-relaxed text-text-secondary">{node.copy}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
