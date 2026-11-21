/* ── H-2 S1 · Header — "Our roots run deep." + camera-body shutter + gen chips ── */

import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ShieldCheck, TreePine } from "lucide-react";
import ApertureShutter from "../ApertureShutter";
import { Crest } from "../Logo";
import { ABOUT_HEADER, GEN_CHIPS, HEADER_SLIDES } from "../../../data/home/about";
import { useCountUp, useInView } from "../../../lib/hooks";

function GenChip({ gen, label, count, i }: { gen: string; label: string; count: number; i: number }) {
  const { ref, inView } = useInView<HTMLLIElement>(0.4);
  const n = useCountUp(count, { start: inView, duration: 1300 + i * 180 });
  return (
    <li ref={ref} className="ny-card flex min-w-[8.5rem] flex-1 items-center gap-3 rounded-xl px-3.5 py-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-brand-primary font-display text-sm font-semibold text-brand-accent">{gen}</span>
      <span className="leading-tight">
        <span className="ny-num block font-display text-xl font-semibold text-text-primary">{n}</span>
        <span className="block text-[11px] font-semibold text-text-tertiary">{label}</span>
      </span>
    </li>
  );
}

export default function AboutHeader() {
  const reduced = useReducedMotion();
  const fade = (d: number) => (reduced ? {} : { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: d, ease: [0.16, 1, 0.3, 1] as const } });

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32" aria-label="About header">
      <div className="ny-grid-paper pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="ny-about-glow pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="lg:col-span-6">
          <motion.span {...fade(0)} className="ny-eyebrow"><TreePine className="size-3.5" aria-hidden="true" />{ABOUT_HEADER.eyebrow}</motion.span>
          <motion.h1 {...fade(0.08)} className="ny-heading mt-6 text-5xl sm:text-6xl xl:text-7xl">
            {ABOUT_HEADER.title}
            <span className="block font-medium italic text-brand-secondary">{ABOUT_HEADER.titleAccent}</span>
          </motion.h1>
          <motion.p {...fade(0.16)} className="ny-prose mt-6 max-w-xl text-lg">{ABOUT_HEADER.sub}</motion.p>

          <motion.div {...fade(0.24)} className="mt-7 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-brand-accent/40 bg-surface-1 px-4 py-3 shadow-card">
              <Crest className="h-11 w-11" />
              <span className="leading-tight">
                <span className="block font-display text-xl font-semibold italic text-brand-primary">“{ABOUT_HEADER.motto}”</span>
                <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-text-tertiary">{ABOUT_HEADER.mottoMeaning}</span>
              </span>
            </div>
            <button type="button" onClick={() => document.getElementById("origin")?.scrollIntoView({ behavior: "smooth" })} className="ny-btn-ghost">Read our story <ArrowDown className="size-4" aria-hidden="true" /></button>
          </motion.div>

          <ul className="mt-9 flex flex-wrap gap-2.5" aria-label="Members per generation (approximate)">
            {GEN_CHIPS.map((c, i) => <GenChip key={c.gen} {...c} i={i} />)}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
            <ShieldCheck className="size-3.5 text-brand-primary" aria-hidden="true" />
            Approximate counts. Names and details stay behind <Link to="/signin" className="font-semibold text-brand-primary underline-offset-2 hover:underline">family sign-in</Link>.
          </p>
        </div>

        {/* camera body + shutter (Tailwind-style 3D via page CSS) */}
        <motion.div {...fade(0.2)} className="ny-cam-stage lg:col-span-6">
          <div className="ny-cam-body relative mx-auto max-w-xl">
            <div className="ny-cam-lens-ring" aria-hidden="true" />
            <div className="rounded-[2rem] bg-brand-primary-deep p-2.5 shadow-panel">
              <div className="mb-2 flex items-center justify-between px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-surface-2/70">
                <span className="flex items-center gap-2"><span className="size-2 rounded-pill bg-brand-accent" />Nalyanya · archive cam</span>
                <span>35mm · heritage</span>
              </div>
              <ApertureShutter slides={HEADER_SLIDES} autoPlay={4800} label="Family heritage photos" className="aspect-[4/3.4] rounded-[1.5rem]" />
            </div>
            <figure className="ny-polaroid ny-pz-1 absolute -bottom-8 -left-6 hidden w-32 sm:block" aria-hidden="true">
              <img src={HEADER_SLIDES[2].src} alt="" className="aspect-square w-full rounded-sm object-cover" />
            </figure>
            <figure className="ny-polaroid ny-pz-2 absolute -right-5 -top-7 hidden w-28 sm:block" aria-hidden="true">
              <img src={HEADER_SLIDES[1].src} alt="" className="aspect-square w-full rounded-sm object-cover" />
            </figure>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function MottoRibbon() {
  const words = ["Imarishi — we stand firm", "Faith", "Family", "Service", "Old and young together", "One tree, many branches", "Bungoma · Kakamega · Trans-Nzoia · Nairobi"];
  const loop = [...words, ...words];
  return (
    <div className="overflow-hidden border-y border-brand-primary/20 bg-brand-primary py-4 text-surface-0" aria-label="Family motto and values">
      <div className="ny-ribbon-track">
        {loop.map((w, i) => (
          <span key={i} className="flex shrink-0 items-center gap-3 font-display text-lg italic">
            {w}<span className="size-1.5 rounded-pill bg-brand-accent" aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
}
