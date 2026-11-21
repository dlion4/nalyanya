/* ── H-3 · What this page will not show ──────────────────────────────────── */

import { Eye, EyeOff, Lock } from "lucide-react";
import Reveal from "../Reveal";
import { MASKED_PHONE } from "../../../data/home/professions";

const SHOWS = ["A trade and a shortened name", "A county, never a village", "Whether the council has verified them", "A note form that does not dial"];
const HIDES = ["Phone numbers and WhatsApp", "Home addresses and plots", "Personal prices and M-Pesa tills", "Children’s names and school"];

export default function ContactShield() {
  return (
    <section id="shield" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8" aria-label="What stays hidden">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-3">
        <Reveal>
          <div className="ny-card h-full rounded-[1.75rem] p-6">
            <p className="flex items-center gap-2 text-sm font-bold text-brand-success"><Eye className="size-4" aria-hidden="true" />This page shows</p>
            <ul className="mt-4 space-y-2.5 text-sm font-medium text-text-secondary">
              {SHOWS.map((s) => <li key={s} className="rounded-xl bg-brand-success-tint/70 px-3 py-2.5">{s}</li>)}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="ny-card h-full rounded-[1.75rem] p-6">
            <p className="flex items-center gap-2 text-sm font-bold text-brand-danger"><EyeOff className="size-4" aria-hidden="true" />Kept off this page</p>
            <ul className="mt-4 space-y-2.5 text-sm font-medium text-text-secondary">
              {HIDES.map((s) => <li key={s} className="rounded-xl bg-brand-danger-tint/70 px-3 py-2.5">{s}</li>)}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="flex h-full flex-col justify-between rounded-[1.75rem] bg-brand-primary-deep p-6 text-surface-0">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-accent"><Lock className="size-4" aria-hidden="true" />Every listing</p>
              <p className="mt-3 font-display text-3xl font-semibold">{MASKED_PHONE}</p>
              <p className="mt-2 text-sm leading-relaxed text-surface-2/80">The same mask for everyone. There is no real number hiding behind the dots on this page.</p>
            </div>
            <p className="mt-6 text-xs font-semibold text-surface-2/60">WhatsApp, SMS and the family-office note are drawn in full — and stop at “connects when the backend is wired”.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
