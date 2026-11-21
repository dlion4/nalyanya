/* ── S10 · Foundation — impact count-ups + active cause + give path ──────── */

import { useState } from "react";
import { GraduationCap, HeartHandshake, Coins } from "lucide-react";
import Reveal from "./Reveal";
import { FOUNDATION_IMPACT, FOUNDATION_CAUSE, FOUNDATION_PHIL, FOUNDATION_PHOTO } from "../../data/home/landing";
import { useCountUp, useInView } from "../../lib/hooks";
import { kes } from "../../lib/format";

function Impact({ value, suffix, prefix, label }: { value: number; suffix: string; prefix: string; label: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const display = useCountUp(value, { start: inView, duration: 1600, decimals: value < 10 ? 1 : 0 });
  return (
    <div ref={ref} className="rounded-xl border border-surface-3/70 bg-surface-1 p-5 text-center">
      <div className="ny-num font-display text-3xl font-semibold text-brand-primary sm:text-4xl">
        {prefix}{display}{suffix}
      </div>
      <div className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-text-tertiary">{label}</div>
    </div>
  );
}

export default function Foundation() {
  const [status, setStatus] = useState<"idle" | "ready">("idle");
  const pct = Math.round(FOUNDATION_CAUSE.pct * 100);
  const { ref: ringRef, inView: ringInView } = useInView<HTMLDivElement>(0.35);

  return (
    <section id="foundation" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="Nalyanya Foundation">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="ny-eyebrow">Nalyanya Foundation</span>
          <h2 className="ny-heading mt-4 max-w-3xl text-3xl sm:text-4xl lg:text-[2.7rem]">
            Lifting the next one up.
          </h2>
          <p className="ny-prose mt-3 max-w-2xl">
            The family’s charity arm funds education, medical bills and emergencies for members — and for the neighbourhoods they come from.
          </p>
        </Reveal>

        <div className="mt-10 grid items-center gap-8 lg:grid-cols-12">
          {/* left — impact numbers */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {FOUNDATION_IMPACT.map((item) => (
                <Impact key={item.label} {...item} />
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {FOUNDATION_PHIL.map((pillar) => (
                <Reveal key={pillar.title} delay={0.1}>
                  <div className="h-full rounded-xl border border-surface-3/70 bg-surface-2/60 p-4">
                    <pillar.icon className="size-5 text-brand-violet" aria-hidden="true" />
                    <h3 className="mt-2.5 font-display text-base font-semibold text-text-primary">{pillar.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{pillar.copy}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* right — active cause card with photo */}
          <Reveal delay={0.1} className="lg:col-span-5">
            <div ref={ringRef} className="ny-card relative overflow-hidden rounded-2xl">
              <div className="relative">
                <img src={FOUNDATION_PHOTO} alt="Children learning at a village school" className="aspect-[16/10] w-full object-cover" loading="lazy" decoding="async" />
                <span className="absolute bottom-3 left-3 rounded-pill bg-surface-0/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-violet backdrop-blur-sm">
                  Active cause · 2025
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-semibold leading-snug text-text-primary">{FOUNDATION_CAUSE.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{FOUNDATION_CAUSE.beneficiary}</p>

                {/* progress ring */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative size-[74px] shrink-0">
                    <svg width="74" height="74" viewBox="0 0 74 74" className="-rotate-90" aria-hidden="true">
                      <circle cx="37" cy="37" r="30" fill="none" stroke="var(--color-surface-3)" strokeWidth="7" />
                      <circle
                        className="ny-ring-circle"
                        cx="37" cy="37" r="30" fill="none"
                        stroke="#6A4C93" strokeWidth="7" strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 30}
                        strokeDashoffset={ringInView ? 2 * Math.PI * 30 * (1 - FOUNDATION_CAUSE.pct) : 2 * Math.PI * 30}
                      />
                    </svg>
                    <span className="absolute inset-0 grid place-items-center font-display text-sm font-bold text-brand-violet">{pct}%</span>
                  </div>
                  <div>
                    <span className="ny-num font-display text-lg font-semibold text-text-primary">{kes(FOUNDATION_CAUSE.raised)}</span>
                    <span className="block text-xs font-semibold text-text-tertiary">raised of {kes(FOUNDATION_CAUSE.goal)}</span>
                    <span className="mt-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-text-tertiary">{FOUNDATION_CAUSE.org}</span>
                  </div>
                </div>

                {status === "idle" ? (
                  <button type="button" onClick={() => setStatus("ready")} className="ny-btn-gold ny-touch mt-5 w-full text-sm">
                    <Coins className="size-4" aria-hidden="true" />
                    Contribute — M-Pesa · Bank · In-app
                  </button>
                ) : (
                  <div className="ny-card mt-5 flex items-start gap-3 rounded-xl border border-brand-accent/50 bg-brand-accent-soft p-4">
                    <GraduationCap className="mt-0.5 size-5 shrink-0 text-[#7a5b14]" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-bold text-[#7a5b14]">Ready — connects when the backend is wired.</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#7a5b14]/80">
                        A real contribute flow (STK Push or bank EFT) lands here in Phase 2. In this build the button stays a designed demo — no money moves.
                      </p>
                      <button type="button" onClick={() => setStatus("idle")} className="mt-2 text-xs font-bold underline decoration-[#7a5b14]/50 underline-offset-2">
                        Reset demo
                      </button>
                    </div>
                  </div>
                )}
                <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-[11px] font-semibold text-text-tertiary">
                  <HeartHandshake className="size-3.5" aria-hidden="true" />
                  Transparency: every disbursement is auditable and attributed
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
