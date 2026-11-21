/* ── S11 · Voices — family testimonials ──────────────────────────────────── */

import { Quote } from "lucide-react";
import Reveal from "./Reveal";
import { VOICES } from "../../data/home/landing";

export default function Voices() {
  return (
    <section aria-label="Family voices" className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="ny-section-label">Voices from the family</span>
          <h2 className="ny-heading mt-3 max-w-xl text-3xl sm:text-4xl lg:text-[2.7rem]">
            Old and young, <em className="font-display italic font-medium text-brand-secondary">same tree.</em>
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {VOICES.map((voice, i) => (
            <Reveal key={voice.name} delay={i * 0.1} className="h-full">
              <figure className="ny-voice-card ny-card flex h-full flex-col rounded-xl p-6">
                <Quote className="size-6 text-brand-accent" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 font-display text-[1.05rem] font-medium leading-relaxed text-text-primary">
                  “{voice.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-surface-3/60 pt-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-pill bg-brand-primary text-[13px] font-bold text-surface-0 ring-1 ring-brand-primary/20" aria-hidden="true">
                    {voice.initials}
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-text-primary">{voice.name}</span>
                    <span className="block text-xs font-semibold text-text-tertiary">
                      {voice.role} · {voice.branch}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
