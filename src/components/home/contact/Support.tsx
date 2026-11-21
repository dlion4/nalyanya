/* ── H-7 S5 · Request support — four starting points + the PIN-receive explainer ──
   "I can't log in" → forgot password · "receive money sent to me" → the
   explainer below · "change my bank/M-Pesa" → sign in · "join the family" →
   sign up. The phone walkthrough is a SIMULATED preview of the /r/:token flow. */

import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import Reveal from "../Reveal";
import { RECEIVE_STEPS, SUPPORT_LINKS } from "../../../data/home/contact";
import { cn } from "../../../utils/cn";

function Btn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className="ny-btn-primary mt-auto w-full text-sm">{children}</button>;
}

/* a small phone walking the four screens of a receive link */
function Phone({ step, onNext }: { step: number; onNext: () => void }) {
  return (
    <div className="mx-auto w-full max-w-[16.5rem] rounded-[2.2rem] border-[6px] border-brand-primary-deep bg-surface-0 shadow-panel">
      <div className="rounded-[1.8rem] p-4">
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-pill bg-surface-3" aria-hidden="true" />
        <div className="flex min-h-[16.5rem] flex-col">
          {step === 0 && (
            <>
              <div className="rounded-2xl rounded-tl-sm bg-surface-2 p-3 text-sm leading-relaxed text-text-primary">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-tertiary">Message · now</p>
                <p className="mt-1.5">Nalyanya: Brian sent you <strong>KES 5,000</strong>. Tap to receive.</p>
                <p className="mt-1.5 break-all text-xs font-semibold text-brand-primary">nalyanya.app/r/NY-RCV-7K2Q</p>
              </div>
              <Btn onClick={onNext}>Open your link</Btn>
            </>
          )}
          {step === 1 && (
            <>
              <p className="text-center font-display text-lg font-semibold leading-snug text-text-primary">You've been sent <span className="text-brand-secondary">KES 5,000</span> from Brian.</p>
              <p className="mt-1.5 text-center text-xs text-text-secondary">Enter your own 4-digit PIN.</p>
              <div className="mt-5 flex justify-center gap-3" role="img" aria-label="Four digits entered">
                {[0, 1, 2, 3].map((i) => <span key={i} className="size-3.5 rounded-pill bg-brand-primary" />)}
              </div>
              <Btn onClick={onNext}>Continue</Btn>
            </>
          )}
          {step === 2 && (
            <>
              <p className="text-center font-display text-lg font-semibold leading-snug text-text-primary">We sent a code to •••• 7890.</p>
              <p className="mt-1.5 text-center text-xs text-text-secondary">Enter the 6 digits from the SMS.</p>
              <div className="mt-5 flex justify-center gap-2" role="img" aria-label="Six digits entered">
                {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className="size-3 rounded-pill bg-brand-secondary" />)}
              </div>
              <Btn onClick={onNext}>Receive</Btn>
            </>
          )}
          {step === 3 && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <CheckCircle2 className="size-10 text-brand-success" aria-hidden="true" />
              <p className="mt-3 font-display text-xl font-semibold text-text-primary">KES 5,000 is on its way</p>
              <p className="mt-1 text-sm text-text-secondary">to your M-Pesa •••• 7890.</p>
              <p className="ny-num mt-3 rounded-pill bg-surface-2 px-3 py-1.5 text-xs font-bold tracking-[0.08em] text-text-secondary">Ref NY-RCV-7K2Q</p>
              <span className="ny-sim-badge mt-3">Simulated</span>
              <Btn onClick={onNext}>Play again</Btn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Support() {
  const [step, setStep] = useState(0);
  const next = () => setStep((s) => (s + 1) % RECEIVE_STEPS.length);

  const seeHow = () => {
    setStep(0);
    document.getElementById("receive")?.scrollIntoView({ block: "center" });
  };

  return (
    <section id="support" className="scroll-mt-24 border-y border-surface-3/60 bg-surface-2/50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="Request support">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="ny-section-label">Request support</span>
          <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">What do you <em className="font-medium text-brand-secondary">need?</em></h2>
        </Reveal>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {SUPPORT_LINKS.map((s, i) => (
            <li key={s.title} className="h-full">
              <Reveal delay={i * 0.06} className="h-full">
                <article className="ny-card ny-ct-channel flex h-full flex-col rounded-2xl p-5">
                  <span className="ny-icon-chip"><s.icon className="size-5" aria-hidden="true" /></span>
                  <h3 className="mt-4 font-display text-xl font-semibold leading-snug text-text-primary">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{s.copy}</p>
                  <div className="mt-auto pt-4">
                    {s.to ? (
                      <Link to={s.to} className="ny-btn-primary inline-flex text-sm">{s.cta}<ArrowUpRight className="size-4" aria-hidden="true" /></Link>
                    ) : (
                      <button type="button" onClick={seeHow} className="ny-btn-primary text-sm">{s.cta}</button>
                    )}
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        {/* PIN receive link explainer */}
        <Reveal delay={0.1}>
          <div id="receive" className="ny-card mt-8 grid scroll-mt-28 items-center gap-8 rounded-[1.75rem] p-5 sm:p-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Phone step={step} onNext={next} />
            </div>
            <div className="lg:col-span-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-tertiary">Receiving money sent to you</p>
              <h3 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">No app. No login. <em className="font-medium text-brand-secondary">Just your PIN.</em></h3>
              <ol className="mt-5 flex flex-col gap-2" aria-label="Steps of a receive link">
                {RECEIVE_STEPS.map((s, i) => (
                  <li key={s.title}>
                    <button type="button" onClick={() => setStep(i)} aria-current={i === step}
                      className={cn("ny-touch flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors duration-300",
                        i === step ? "border-brand-accent/60 bg-brand-accent-soft/40" : "border-surface-3/70 hover:bg-surface-0")}>
                      <span className={cn("ny-num grid size-8 shrink-0 place-items-center rounded-pill font-display text-sm font-semibold", i === step ? "bg-brand-accent text-brand-primary-deep" : "bg-surface-2 text-text-secondary")}>{i + 1}</span>
                      <span>
                        <span className="block font-display text-base font-semibold text-text-primary">{s.title}</span>
                        <span className="block text-sm leading-relaxed text-text-secondary">{s.copy}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-text-tertiary">
                <span className="ny-sim-badge">Simulated walkthrough</span>
                A relative creates the link after sign-in.
                <Link to="/signin" className="font-bold text-brand-primary underline-offset-2 hover:underline">Sign in →</Link>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
