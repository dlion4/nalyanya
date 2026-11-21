/* ── H-2 S7 · How we gather — list-driven aperture shutter carousel ───────── */

import { useState } from "react";
import { CalendarHeart } from "lucide-react";
import ApertureShutter from "../ApertureShutter";
import Reveal from "../Reveal";
import { GATHERINGS } from "../../../data/home/about";
import { cn } from "../../../utils/cn";

export default function Gatherings() {
  const [active, setActive] = useState(0);
  return (
    <section id="gatherings" className="scroll-mt-24 bg-brand-primary-deep px-4 py-20 text-surface-0 sm:px-6 sm:py-28 lg:px-8" aria-label="How we gather">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-accent">How we gather</span>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl">
            Traditions that <em className="font-medium text-brand-accent">bring us home.</em>
          </h2>
        </Reveal>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="rounded-[1.9rem] border border-white/10 bg-white/5 p-2.5">
              <ApertureShutter
                slides={GATHERINGS.map((g) => g.slide)}
                index={active}
                onIndexChange={setActive}
                autoPlay={5200}
                label="Family gatherings photos"
                exposure="ƒ/4 · 1/250s · ISO 400"
                className="aspect-[16/11] rounded-[1.5rem]"
              />
            </div>
          </Reveal>

          <ol className="flex flex-col gap-2 lg:col-span-5" aria-label="Gatherings">
            {GATHERINGS.map((g, i) => (
              <li key={g.id}>
                <button type="button" onClick={() => setActive(i)} aria-current={i === active}
                  className={cn("ny-touch group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-300",
                    i === active ? "border-brand-accent/60 bg-white/10" : "border-white/10 hover:border-white/25 hover:bg-white/5")}>
                  <span className={cn("ny-num grid size-10 shrink-0 place-items-center rounded-xl font-display text-sm font-semibold transition-colors",
                    i === active ? "bg-brand-accent text-brand-primary-deep" : "bg-white/10 text-surface-2")}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="block font-display text-lg font-semibold">{g.title}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-brand-accent"><CalendarHeart className="size-3.5" aria-hidden="true" />{g.when}</span>
                    {i === active && <span className="mt-1.5 block text-sm leading-relaxed text-surface-2/80">{g.copy}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
