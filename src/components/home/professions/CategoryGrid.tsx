/* ── H-3 S3 · 12 trade categories — photo tiles, 3D hover, filters directory ── */

import Reveal from "../Reveal";
import { CATEGORIES, countIn } from "../../../data/home/professions";
import { cn } from "../../../utils/cn";

export default function CategoryGrid({ active, onPick }: { active: string; onPick: (id: string) => void }) {
  return (
    <section id="trades" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8" aria-label="Trade categories">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="ny-section-label">Twelve trades</span>
          <h2 className="ny-heading mt-3 max-w-2xl text-4xl sm:text-5xl">Pick a trade. <em className="font-medium text-brand-secondary">See who can help.</em></h2>
          <p className="ny-prose mt-3 max-w-xl">Ranges are typical for the trade — never one person’s price. Tap a tile to filter the directory.</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.id} delay={(i % 4) * 0.05} className="ny-cat-wrap">
              <button type="button" onClick={() => onPick(c.id)} aria-pressed={active === c.id}
                className={cn("ny-cat group relative block h-52 w-full overflow-hidden rounded-2xl text-left shadow-card sm:h-60", active === c.id && "is-on")}>
                <img src={c.image} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
                <span className="absolute inset-0 bg-gradient-to-t from-[#0b1610]/90 via-[#0b1610]/25 to-transparent" />
                <span className="absolute left-3 top-3 grid size-10 place-items-center rounded-xl text-surface-0 shadow-card" style={{ background: c.color }}>
                  <c.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="absolute right-3 top-3 rounded-pill bg-surface-0/90 px-2.5 py-1 text-[11px] font-bold text-brand-primary">{countIn(c.id)}</span>
                <span className="absolute inset-x-3 bottom-3 text-surface-0">
                  <span className="block font-display text-xl font-semibold">{c.label}</span>
                  <span className="mt-0.5 block text-[11px] font-semibold text-brand-accent">{c.range}</span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
