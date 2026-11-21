/* ── H-2 S10 · Privacy promise — what this page shows vs what stays private,
   plus a "privacy veil" member card that never reveals real values.       */

import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Lock, ShieldCheck, Check } from "lucide-react";
import Reveal from "../Reveal";
import { PRIVATE_KEEPS, PUBLIC_SHOWS, VEIL_FIELDS } from "../../../data/home/about";
import { cn } from "../../../utils/cn";

export default function PrivacyPromise() {
  const [peek, setPeek] = useState(false);
  return (
    <section id="privacy" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8" aria-label="Our privacy promise">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="ny-section-label">Our privacy promise</span>
          <h2 className="ny-heading mt-3 max-w-3xl text-4xl sm:text-5xl">Proud to share our story. <em className="font-medium text-brand-secondary">Careful with our people.</em></h2>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <Reveal>
            <div className="ny-card h-full rounded-[1.75rem] p-6">
              <p className="flex items-center gap-2 text-sm font-bold text-brand-success"><Eye className="size-4" aria-hidden="true" />This public page shows</p>
              <ul className="mt-4 space-y-3">
                {PUBLIC_SHOWS.map((r) => (
                  <li key={r.label} className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                    <span className="grid size-9 place-items-center rounded-xl bg-brand-success-tint text-brand-success"><r.icon className="size-4" aria-hidden="true" /></span>{r.label}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="ny-card h-full rounded-[1.75rem] p-6">
              <p className="flex items-center gap-2 text-sm font-bold text-brand-danger"><EyeOff className="size-4" aria-hidden="true" />Never shown publicly</p>
              <ul className="mt-4 grid gap-3">
                {PRIVATE_KEEPS.map((r) => (
                  <li key={r.label} className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                    <span className="grid size-9 place-items-center rounded-xl bg-brand-danger-tint text-brand-danger"><r.icon className="size-4" aria-hidden="true" /></span>{r.label}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className={cn("ny-veil relative h-full overflow-hidden rounded-[1.75rem] bg-brand-primary-deep p-6 text-surface-0 shadow-panel", peek && "is-peek")}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-accent">Member card · preview</p>
                <span className="ny-sim-badge">Simulated</span>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-pill bg-brand-accent font-display text-lg font-semibold text-brand-primary-deep">BN</span>
                <span><span className="block font-display text-lg font-semibold">Brian O. N.</span><span className="text-xs text-surface-2/75">House of Barasa · 4th generation</span></span>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3">
                {VEIL_FIELDS.map((f) => (
                  <div key={f.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-surface-2/60">{f.label}</dt>
                    <dd className="ny-veil-value mt-1 text-sm font-semibold" aria-label="Hidden">{f.value}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" onClick={() => setPeek((p) => !p)} aria-pressed={peek} className="ny-btn-gold mt-5 w-full text-sm">
                <Lock className="size-4" aria-hidden="true" />{peek ? "Hide notice" : "Try to reveal details"}
              </button>
              <AnimatePresence>
                {peek && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    className="mt-3 rounded-xl border border-brand-accent/40 bg-brand-accent/10 p-3 text-xs leading-relaxed text-surface-2">
                    <p className="flex items-center gap-1.5 font-bold text-brand-accent"><ShieldCheck className="size-4" aria-hidden="true" />Family sign-in required</p>
                    Real details are never sent to this public page — they unlock only for signed-in relatives, and this build stores none. <Link to="/signin" className="font-bold text-brand-accent underline">Sign in →</Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs font-medium text-text-tertiary">
          <Check className="size-3.5 text-brand-success" aria-hidden="true" />Aligned with Kenya's Data Protection Act 2019 — consent first, minimum data, member-controlled.
        </p>
      </div>
    </section>
  );
}
