/* ── H-7 S1 · Header — "Reach the family office." + pinhole shutter + postmark ── */

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, PenLine, ShieldCheck, Users } from "lucide-react";
import ApertureShutter from "../ApertureShutter";
import { CONTACT_HEADER, HEADER_SLIDES } from "../../../data/home/contact";
import { useEatClock } from "../../../lib/eat";

const CHIPS = [
  { icon: Users, label: "Answered by a person" },
  { icon: ShieldCheck, label: "No personal numbers published" },
  { icon: PenLine, label: "One note finds the right person" },
];

/* Postmark with the live East African Time in its centre */
function Postmark({ time }: { time: string }) {
  return (
    <svg viewBox="0 0 160 160" className="size-full" aria-hidden="true">
      <defs>
        <path id="ny-ct-arc" d="M80 22a58 58 0 1 1-.01 0" />
      </defs>
      <g className="ny-postmark-spin">
        <circle cx="80" cy="80" r="70" fill="rgba(250,246,238,0.94)" stroke="#1F4D3A" strokeWidth="2.5" strokeDasharray="3 6" />
        <text fill="#1F4D3A" fontSize="12.5" fontWeight="700" letterSpacing="3.1" fontFamily="Inter, system-ui, sans-serif">
          <textPath href="#ny-ct-arc">FAMILY OFFICE · BUNGOMA · EAT ·</textPath>
        </text>
      </g>
      <circle cx="80" cy="80" r="41" fill="none" stroke="#B5532A" strokeWidth="1.5" />
      <text x="80" y="77" textAnchor="middle" fill="#B5532A" fontSize="22" fontWeight="600" fontFamily="Fraunces, Georgia, serif">EAT</text>
      <text x="80" y="97" textAnchor="middle" fill="#5A6B57" fontSize="11" fontWeight="700" fontFamily="Inter, system-ui, sans-serif" style={{ fontVariantNumeric: "tabular-nums" }}>{time}</text>
    </svg>
  );
}

export default function ContactHeader() {
  const reduced = useReducedMotion();
  const now = useEatClock();
  const fade = (d: number) => (reduced ? {} : { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.75, delay: d, ease: [0.16, 1, 0.3, 1] as const } });
  const go = (target: string) => document.getElementById(target)?.scrollIntoView();

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32" aria-label="Contact header">
      <div className="ny-grid-paper pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="ny-ct-glow pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-6">
          <motion.span {...fade(0)} className="ny-eyebrow"><PenLine className="size-3.5" aria-hidden="true" />{CONTACT_HEADER.eyebrow}</motion.span>
          <motion.h1 {...fade(0.08)} className="ny-heading mt-6 text-5xl sm:text-6xl xl:text-7xl">
            {CONTACT_HEADER.title}
            <span className="block font-medium italic text-brand-secondary">{CONTACT_HEADER.titleAccent}</span>
          </motion.h1>
          <motion.p {...fade(0.16)} className="ny-prose mt-6 max-w-xl text-lg">{CONTACT_HEADER.sub}</motion.p>

          <motion.div {...fade(0.24)} className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => go("write")} className="ny-btn-gold"><PenLine className="size-4" aria-hidden="true" />Write to the office</button>
            <button type="button" onClick={() => go("channels")} className="ny-btn-ghost">Other ways to reach us <ArrowDown className="size-4" aria-hidden="true" /></button>
          </motion.div>

          <motion.ul {...fade(0.32)} className="mt-7 flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <li key={c.label} className="ny-chip"><c.icon className="size-3.5 text-brand-primary" aria-hidden="true" />{c.label}</li>
            ))}
          </motion.ul>
        </div>

        {/* pinhole camera: the picture collapses to a point of light, then floods back */}
        <motion.div {...fade(0.18)} className="ny-ct-stage lg:col-span-6">
          <div className="ny-ct-body relative mx-auto mb-10 max-w-xl">
            <div className="rounded-[2rem] bg-brand-primary-deep p-2.5 shadow-panel">
              <div className="mb-2 flex items-center justify-between px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-surface-2/70">
                <span className="flex items-center gap-2"><span className="size-2 rounded-pill bg-brand-accent" />Family office · inbox</span>
                <span>Pinhole · ƒ/167</span>
              </div>
              <ApertureShutter
                slides={HEADER_SLIDES}
                autoPlay={4800}
                variant="pinhole"
                label="The family office in pictures"
                exposure="ƒ/167 · pinhole"
                className="aspect-[4/3.3] rounded-[1.45rem]"
              />
            </div>
            <div className="ny-float-postmark absolute -bottom-12 -left-3 size-28 sm:-left-6 sm:size-36" aria-hidden="true">
              <Postmark time={now.clock} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
