/* ── S5 · Feature cards — 3D tilt hover + layered depth ──────────────────── */

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { FEATURE_CARDS, type FeatureCard } from "../../data/home/landing";
import { usePrefersReducedMotion, useElderMode } from "../../lib/hooks";
import { clamp } from "../../lib/format";

function TiltCard({ card, index }: { card: FeatureCard; index: number }) {
  const reduced = usePrefersReducedMotion();
  const elder = useElderMode().mode;
  const disableTilt = reduced || elder;

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 150, damping: 16, mass: 0.55 });
  const rotateY = useSpring(ry, { stiffness: 150, damping: 16, mass: 0.55 });
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (disableTilt) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    ry.set(clamp(nx * 7, -7, 7));
    rx.set(clamp(-ny * 7, -7, 7));
  };

  const reset = () => { rx.set(0); ry.set(0); };

  const scrollTarget = () => document.getElementById(card.target.replace("#", ""))?.scrollIntoView({ behavior: disableTilt ? "auto" : "smooth" });

  return (
    <Reveal delay={index * 0.1} className="ny-tilt-wrap">
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX: disableTilt ? 0 : rotateX, rotateY: disableTilt ? 0 : rotateY, transformStyle: "preserve-3d" }}
        className="ny-tilt group relative flex h-full flex-col overflow-hidden rounded-xl border border-surface-3/70 bg-surface-1 p-6 shadow-card sm:p-7"
      >
        {/* soft accent aura */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-pill blur-2xl opacity-60 transition-opacity duration-300 group-hover:opacity-100"
          style={{ backgroundColor: `${card.accent}18` }}
          aria-hidden="true"
        />

        <div className="ny-tilt-layer-3">
          <span className="ny-icon-chip" style={{ color: card.accent, backgroundColor: `${card.accent}14`, boxShadow: `inset 0 0 0 1px ${card.accent}30` }}>
            <card.icon className="size-5" aria-hidden="true" />
          </span>
        </div>

        <span className="ny-tilt-layer-1 mt-5 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: card.accent }}>
          {card.eyebrow}
        </span>

        <h3 className="ny-tilt-layer-2 ny-heading mt-2 text-[1.55rem]">{card.title}</h3>

        <p className="ny-tilt-layer-2 ny-prose mt-3 text-sm leading-relaxed">{card.copy}</p>

        <button
          type="button"
          onClick={scrollTarget}
          className="ny-tilt-pin ny-touch mt-6 inline-flex items-center gap-2 self-start rounded-pill border border-surface-3 px-4 py-2.5 text-sm font-bold text-brand-primary transition-colors duration-150 hover:border-brand-primary/40 hover:bg-brand-primary-tint"
        >
          {card.cta}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </button>
      </motion.div>
    </Reveal>
  );
}

export default function Features() {
  return (
    <section aria-label="What Nalyanya is" className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="ny-section-label">One family · three pillars</span>
            <h2 className="ny-heading mt-3 max-w-xl text-3xl sm:text-4xl lg:text-[2.7rem]">
              Lineage, money and <em className="font-display italic font-medium text-brand-secondary">memories</em> — kept together.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-text-tertiary">Designed on a 3D lineage core — so every feature feels like one tree, not three apps.</p>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {FEATURE_CARDS.map((card, i) => (
          <TiltCard key={card.id} card={card} index={i} />
        ))}
      </div>
    </section>
  );
}
