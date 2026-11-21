/* ── H-3 S5 · Featured profiles — shutter follows the selected person ────── */

import { useState } from "react";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import ApertureShutter from "../ApertureShutter";
import AskModal from "./AskModal";
import Reveal from "../Reveal";
import { FEATURED, type Professional } from "../../../data/home/professions";
import { cn } from "../../../utils/cn";

export default function FeaturedProfiles() {
  const [index, setIndex] = useState(0);
  const [ask, setAsk] = useState<Professional | null>(null);
  const slides = FEATURED.map((p) => ({ src: p.photo, alt: `${p.trade} — ${p.county}`, meta: `${p.trade} · ${p.county}`, caption: p.blurb }));

  return (
    <section id="featured" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="Featured profiles">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="ny-section-label">Featured</span>
          <h2 className="ny-heading mt-3 max-w-2xl text-4xl sm:text-5xl">Six people. <em className="font-medium text-brand-secondary">No phone numbers.</em></h2>
          <p className="ny-prose mt-3 max-w-xl">Shortened names, county only. “Ask for help” opens a note — it does not reveal a contact.</p>
        </Reveal>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-6">
            <div className="rounded-[1.8rem] bg-brand-primary-deep p-2 shadow-panel">
              <ApertureShutter slides={slides} index={index} onIndexChange={setIndex} label="Featured family trades" className="aspect-[4/4.4] rounded-[1.4rem] sm:aspect-[4/3.4]" />
            </div>
          </Reveal>
          <ol className="flex flex-col gap-2 lg:col-span-6">
            {FEATURED.map((p, i) => (
              <li key={p.id}>
                <div className={cn("flex items-center gap-3 rounded-2xl border p-3 transition-colors", i === index ? "border-brand-accent/60 bg-brand-accent-soft/40" : "border-surface-3 bg-surface-1")}>
                  <button type="button" onClick={() => setIndex(i)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-current={i === index}>
                    <img src={p.photo} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 font-display text-lg font-semibold text-text-primary">
                        {p.name}
                        {p.verified && <BadgeCheck className="size-4 text-brand-success" aria-label="Verified by family" />}
                      </span>
                      <span className="flex items-center gap-2 text-xs font-semibold text-text-tertiary">
                        {p.trade}
                        <span className="inline-flex items-center gap-1"><MapPin className="size-3" aria-hidden="true" />{p.county}</span>
                        {!p.family && <span className="rounded-pill bg-brand-violet-tint px-2 py-0.5 text-brand-violet">Friend</span>}
                      </span>
                    </span>
                  </button>
                  <button type="button" onClick={() => setAsk(p)} className="ny-btn-primary shrink-0 px-4 py-2.5 text-sm">Ask</button>
                </div>
              </li>
            ))}
            <li className="flex items-center gap-2 px-1 pt-1 text-xs font-medium text-text-tertiary">
              <Star className="size-3.5 text-brand-accent" aria-hidden="true" />
              Years in the trade are approximate. Ratings are not published here.
            </li>
          </ol>
        </div>
      </div>
      <AskModal person={ask} onClose={() => setAsk(null)} />
    </section>
  );
}
