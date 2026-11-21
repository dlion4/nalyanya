/* ── H-3 S9 · Endorsements — quotes drive the shutter ────────────────────── */

import { useState } from "react";
import { Quote } from "lucide-react";
import ApertureShutter from "../ApertureShutter";
import Reveal from "../Reveal";
import { ENDORSEMENTS, ENDORSEMENT_SLIDES } from "../../../data/home/professions";
import { cn } from "../../../utils/cn";

export default function Endorsements() {
  const [index, setIndex] = useState(0);
  return (
    <section id="voices" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="Endorsements">
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <span className="ny-section-label">Endorsements</span>
          <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">What relatives <em className="font-medium text-brand-secondary">actually say.</em></h2>
          <p className="ny-prose mt-3">Signed by a house or a role — not by a phone number.</p>
          <div className="mt-6 rounded-[1.7rem] bg-brand-primary-deep p-2 shadow-panel">
            <ApertureShutter
              slides={ENDORSEMENT_SLIDES}
              index={ENDORSEMENTS[index].frame}
              label="Endorsement photos"
              controls={false}
              className="aspect-[16/11] rounded-[1.35rem]"
            />
          </div>
        </Reveal>
        <ul className="flex flex-col gap-3 lg:col-span-7">
          {ENDORSEMENTS.map((e, i) => (
            <li key={e.quote}>
              <button type="button" onClick={() => setIndex(i)} aria-current={i === index}
                className={cn("ny-touch w-full rounded-2xl border p-5 text-left transition-all duration-300", i === index ? "border-brand-accent/50 bg-surface-1 shadow-lift" : "border-surface-3 bg-surface-2/40 hover:bg-surface-1")}>
                <Quote className="size-5 text-brand-accent" aria-hidden="true" />
                <p className="mt-2 font-display text-lg font-medium leading-relaxed text-text-primary">“{e.quote}”</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-text-tertiary">{e.name} · {e.role}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
