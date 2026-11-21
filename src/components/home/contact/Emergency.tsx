/* ── H-7 S7 · Emergency contacts — SIMULATED placeholders, hidden until asked for ──
   The live lines exist only after sign-in. Nothing here is a dialable link.  */

import { useState } from "react";
import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import Reveal from "../Reveal";
import { EMERGENCIES, MASKED_PHONE } from "../../../data/home/contact";
import { cn } from "../../../utils/cn";

function Card({ item, index }: { item: (typeof EMERGENCIES)[number]; index: number }) {
  const [shown, setShown] = useState(false);
  return (
    <li className="h-full">
      <Reveal delay={index * 0.08} className="h-full">
        <article className="ny-card flex h-full flex-col rounded-2xl p-5">
          <div className="flex items-start justify-between gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-danger-tint text-brand-danger"><item.icon className="size-5" aria-hidden="true" /></span>
            <span className="rounded-pill bg-brand-danger-tint px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-danger">Simulated</span>
          </div>
          <h3 className="mt-4 font-display text-2xl font-semibold">{item.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">{item.who}</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-text-tertiary">{item.hours}</p>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-surface-3 bg-surface-0 px-4 py-3">
            <span className="ny-num text-lg font-bold tracking-[0.08em] text-text-primary">{shown ? item.placeholder : MASKED_PHONE}</span>
            <button type="button" onClick={() => setShown((s) => !s)} aria-pressed={shown}
              className="ny-touch inline-flex items-center gap-1.5 rounded-pill border border-surface-3 px-3 py-2 text-xs font-bold text-brand-primary transition-colors hover:border-brand-primary/40 hover:bg-brand-primary-tint">
              {shown ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              {shown ? "Hide" : "Show placeholder"}
            </button>
          </div>
          <p className={cn("mt-2 text-xs font-semibold leading-relaxed", shown ? "text-brand-danger" : "text-text-tertiary")}>
            {shown
              ? "SIMULATED placeholder — not a real line. It cannot be dialled from this page."
              : "Hidden on the public page. Sign-in shows the live line."}
          </p>
        </article>
      </Reveal>
    </li>
  );
}

export default function Emergency() {
  return (
    <section id="emergency" className="scroll-mt-24 bg-brand-primary-deep px-4 py-16 text-surface-0 sm:px-6 sm:py-24 lg:px-8" aria-label="Emergency contacts">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-accent">When it can't wait</span>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl">
            Three lines, <em className="font-medium text-brand-accent">held until you sign in.</em>
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-surface-2/85">
            For anything life-threatening, go to the nearest hospital first and tell the family after. Then let the office know so the right people are woken.
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-4 text-text-primary md:grid-cols-3">
          {EMERGENCIES.map((item, i) => <Card key={item.id} item={item} index={i} />)}
        </ul>

        <Reveal delay={0.1}>
          <p className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-surface-2">
            <ShieldAlert className="size-5 shrink-0 text-brand-accent" aria-hidden="true" />
            Even on these lines, nobody will ask for your M-Pesa PIN, an OTP or your password.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
