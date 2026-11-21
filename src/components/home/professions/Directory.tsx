/* ── H-3 S6 · Full directory — search + trade filter, masked contacts ────── */

import { useMemo, useState } from "react";
import { BadgeCheck, MapPin, SearchX, ShieldCheck } from "lucide-react";
import AskModal from "./AskModal";
import { PROFESSIONALS, categoryOf, matches, type Professional } from "../../../data/home/professions";

export default function Directory({ query, category, onClear }: { query: string; category: string; onClear: () => void }) {
  const [ask, setAsk] = useState<Professional | null>(null);
  const list = useMemo(() => PROFESSIONALS.filter((p) => matches(p, query, category)), [query, category]);
  const cat = categoryOf(category);

  return (
    <section id="directory" className="scroll-mt-24 border-y border-surface-3/60 bg-surface-2/50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="Directory">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="ny-section-label">Directory</span>
            <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">
              {cat ? cat.label : "Everyone listed"}
              <span className="ny-num ml-3 font-display text-brand-accent">{list.length}</span>
            </h2>
            {query && <p className="mt-2 text-sm text-text-secondary">Matching “{query}”</p>}
          </div>
          {(query || category !== "all") && (
            <button type="button" onClick={onClear} className="ny-btn-ghost self-start text-sm">Clear filters</button>
          )}
        </div>

        {list.length === 0 ? (
          <div className="ny-card mt-8 rounded-3xl px-6 py-14 text-center">
            <SearchX className="mx-auto size-8 text-brand-secondary" aria-hidden="true" />
            <p className="mt-3 font-display text-2xl font-semibold">No one matches that.</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">Try a trade or a county — Bungoma, Kakamega, Nairobi, Trans-Nzoia.</p>
            <button type="button" onClick={onClear} className="ny-btn-primary mt-5">Show everyone</button>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <li key={p.id} className="ny-dir ny-card overflow-hidden rounded-2xl">
                <div className="relative h-40 overflow-hidden">
                  <img src={p.photo} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  <span className="absolute left-3 top-3 rounded-pill bg-surface-0/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-primary">{categoryOf(p.category)?.label}</span>
                  {!p.family && <span className="absolute right-3 top-3 rounded-pill bg-brand-violet px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-surface-0">Friend</span>}
                </div>
                <div className="p-4">
                  <p className="flex items-center gap-1.5 font-display text-xl font-semibold text-text-primary">
                    {p.name}
                    {p.verified ? <BadgeCheck className="size-4 text-brand-success" aria-label="Verified by family" /> : <span className="rounded-pill bg-surface-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-text-tertiary">Not yet verified</span>}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-text-secondary">
                    {p.trade} <span className="text-text-tertiary">·</span>
                    <MapPin className="size-3.5 text-brand-secondary" aria-hidden="true" />{p.county}
                    <span className="text-text-tertiary">· {p.years} yrs</span>
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">{p.blurb}</p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {p.helps.map((h) => <li key={h} className="rounded-pill bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-text-secondary">{h}</li>)}
                  </ul>
                  <button type="button" onClick={() => setAsk(p)} className="ny-btn-primary mt-4 w-full text-sm">Ask for help</button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs font-medium text-text-tertiary">
          <ShieldCheck className="size-3.5 text-brand-primary" aria-hidden="true" />
          Every “Ask” opens a note to the family office. No number is shown, and nothing is sent from this build.
        </p>
      </div>
      <AskModal person={ask} onClose={() => setAsk(null)} />
    </section>
  );
}
