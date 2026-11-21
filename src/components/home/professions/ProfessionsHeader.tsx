/* ── H-3 S1 · Header — search, trade chips, camera-body shutter ─────────── */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Search, ShieldCheck, Wrench, ArrowDown } from "lucide-react";
import ApertureShutter from "../ApertureShutter";
import { CATEGORIES, TRADE_SLIDES } from "../../../data/home/professions";
import { cn } from "../../../utils/cn";

interface Props {
  query: string;
  category: string;
  onQuery: (q: string) => void;
  onPick: (id: string) => void;
}

export default function ProfessionsHeader({ query, category, onQuery, onPick }: Props) {
  const reduced = useReducedMotion();
  const [draft, setDraft] = useState(query);
  const fade = (d: number) => (reduced ? {} : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.75, delay: d, ease: [0.16, 1, 0.3, 1] as const } });

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    onQuery(draft);
    document.getElementById("directory")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32" aria-label="Professions header">
      <div className="ny-grid-paper pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="ny-pro-glow pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-14 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-6">
          <motion.span {...fade(0)} className="ny-eyebrow"><Wrench className="size-3.5" aria-hidden="true" />Professions & expertise</motion.span>
          <motion.h1 {...fade(0.08)} className="ny-heading mt-5 text-5xl sm:text-6xl xl:text-7xl">
            Family helping
            <span className="block font-medium italic text-brand-secondary">family.</span>
          </motion.h1>
          <motion.p {...fade(0.16)} className="ny-prose mt-5 max-w-xl text-lg">
            Plumbers, nurses, fundi, teachers, caterers — relatives and trusted friends, in one directory. You see the trade and the county. The phone number stays hidden.
          </motion.p>

          <motion.form {...fade(0.22)} onSubmit={search} role="search" className="mt-7 flex flex-col gap-2 sm:flex-row">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search trades, counties or names</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Try nurse, Bungoma, roof…"
                className="ny-touch w-full rounded-pill border border-surface-3 bg-surface-1 py-3.5 pl-12 pr-4 text-base shadow-card outline-none focus:border-brand-primary" />
            </label>
            <button type="submit" className="ny-btn-primary">Search the directory</button>
          </motion.form>

          <motion.div {...fade(0.28)} className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by trade">
            <button type="button" onClick={() => onPick("all")} aria-pressed={category === "all"}
              className={cn("ny-chip ny-touch", category === "all" && "border-brand-primary bg-brand-primary text-surface-0")}>All trades</button>
            {CATEGORIES.slice(0, 6).map((c) => (
              <button key={c.id} type="button" onClick={() => onPick(c.id)} aria-pressed={category === c.id}
                className={cn("ny-chip ny-touch", category === c.id && "border-brand-primary bg-brand-primary text-surface-0")}>
                <c.icon className="size-3.5" aria-hidden="true" />{c.label}
              </button>
            ))}
          </motion.div>

          <motion.p {...fade(0.34)} className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-text-tertiary">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-brand-primary" aria-hidden="true" />No phone numbers on this page</span>
            <button type="button" onClick={() => document.getElementById("list-skill")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" })} className="inline-flex items-center gap-1 text-brand-primary underline-offset-2 hover:underline">
              List your skill <ArrowDown className="size-3.5" aria-hidden="true" />
            </button>
            <Link to="/signin" className="text-brand-primary underline-offset-2 hover:underline">Sign in to be listed</Link>
          </motion.p>
        </div>

        <motion.div {...fade(0.18)} className="ny-pro-stage lg:col-span-6">
          <div className="ny-pro-body mx-auto max-w-xl rounded-[2rem] bg-brand-primary-deep p-2.5 shadow-panel">
            <div className="mb-2 flex items-center justify-between px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-surface-2/70">
              <span className="flex items-center gap-2"><span className="size-2 rounded-pill bg-brand-accent" />Trade reel</span>
              <span>Family directory</span>
            </div>
            <ApertureShutter slides={TRADE_SLIDES} autoPlay={4600} label="Family trades photo reel" className="aspect-[4/3.2] rounded-[1.45rem]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
