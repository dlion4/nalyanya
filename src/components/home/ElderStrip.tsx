/* ── S8 · Elder Mode strip — old & young together, PIN-only receive ──────── */

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Accessibility, Delete, CheckCircle2, KeyRound, RotateCcw } from "lucide-react";
import Reveal from "./Reveal";
import { ELDER_PHOTO } from "../../data/home/landing";
import { useElderMode } from "../../lib/hooks";
import { cn } from "../../utils/cn";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

/* ── mini PIN receive demo — clearly labeled SIMULATED, no money moves ── */
function PinDemo() {
  const [pin, setPin] = useState("");
  const [phase, setPhase] = useState<"entry" | "ready">("entry");
  const [attempts, setAttempts] = useState(0);

  const complete = pin.length === 4;

  const press = (k: string) => {
    if (phase !== "entry") return;
    if (k === "back") { setPin((p) => p.slice(0, -1)); return; }
    if (k === "") return;
    setPin((p) => (p.length >= 4 ? p : p + k));
  };

  const submit = () => {
    if (!complete) return;
    setPhase("ready");
    setAttempts((a) => a + 1);
  };

  const reset = () => { setPin(""); setPhase("entry"); };

  const ready = useMemo(() => phase === "ready", [phase]);

  return (
    <div className="ny-card flex flex-col rounded-xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="ny-section-label">Demo · PIN receive</span>
        <span className="ny-sim-badge">SIMULATED</span>
      </div>
      <p className="mt-2 text-[13px] font-semibold leading-snug text-text-secondary">
        Enter the 4-digit PIN — this is all a grandmother needs to receive money.
      </p>

      <div className="ny-pin-dots my-5" aria-label={`PIN entry: ${pin.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("ny-pin-dot", pin.length > i && "is-filled")} aria-hidden="true" />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!ready ? (
          <motion.div
            key="pad"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
          >
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="PIN pad">
              {KEYS.map((k, i) =>
                k === "" ? (
                  <span key={`empty-${i}`} aria-hidden="true" />
                ) : k === "back" ? (
                  <button
                    key="back"
                    type="button"
                    onClick={() => press("back")}
                    aria-label="Delete digit"
                    className="ny-key grid place-items-center text-brand-secondary"
                  >
                    <Delete className="size-5" aria-hidden="true" />
                  </button>
                ) : (
                  <button key={`key-${k}`} type="button" onClick={() => press(k)} className="ny-key" aria-label={`Digit ${k}`}>
                    {k}
                  </button>
                )
              )}
            </div>
            <button
              type="button"
              onClick={submit}
              disabled={!complete}
              className="ny-btn-primary ny-touch mt-3 w-full text-sm disabled:cursor-not-allowed disabled:opacity-45"
            >
              <KeyRound className="size-4" aria-hidden="true" />
              Open PIN receive link
            </button>
            <p className="mt-2 text-center text-[11px] font-medium text-text-tertiary">
              {attempts > 0 ? `Attempts used: ${attempts} · ≤3 before a 15-minute lock` : "No login needed · max 3 attempts"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="flex flex-col items-center rounded-xl border border-brand-success/30 bg-brand-success-tint px-4 py-5 text-center"
          >
            <CheckCircle2 className="size-7 text-brand-success" aria-hidden="true" />
            <p className="mt-2 font-display text-lg font-semibold text-brand-primary">Ready — connects when the backend is wired.</p>
            <p className="mt-1.5 max-w-xs text-[13px] leading-relaxed text-text-secondary">
              This is a designed demo state, not a sent message: no OTP is delivered and no money moves in this frontend-only build.
            </p>
            <button type="button" onClick={reset} className="ny-btn-ghost ny-touch mt-4 inline-flex text-[13px]">
              <RotateCcw className="size-4" aria-hidden="true" />
              Try again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ElderStrip() {
  const { mode, setMode } = useElderMode();

  return (
    <section id="elder" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="Elder Mode — old and young together">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-brand-primary-deep shadow-panel">
        {/* atmosphere */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_20%_10%,rgba(212,164,55,0.16),transparent_60%),radial-gradient(60%_50%_at_90%_90%,rgba(106,76,147,0.22),transparent_70%)]" aria-hidden="true" />
        <div className="ny-stripe pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

        <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-12 lg:gap-8 lg:p-12">
          {/* photo */}
          <Reveal className="lg:col-span-3">
            <figure className="overflow-hidden rounded-2xl ring-1 ring-white/20">
              <img src={ELDER_PHOTO} alt="A smiling elderly African man in warm light" className="aspect-[3/4] w-full object-cover" loading="lazy" decoding="async" />
              <figcaption className="bg-surface-0/95 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-text-secondary">
                Mzee V. & friends · Bungoma
              </figcaption>
            </figure>
          </Reveal>

          {/* copy */}
          <Reveal delay={0.08} className="lg:col-span-4">
            <span className="ny-eyebrow border-white/25! bg-white/10! text-brand-accent!">
              <Accessibility className="size-3.5" aria-hidden="true" />
              Old and young together
            </span>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-surface-0 sm:text-4xl">
              Built for grandma
              <br />
              and grandchild alike.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-surface-2/90">
              Elder Mode enlarges the text, gives everyone bigger touch targets, drops the motion, and turns money into a 4-digit PIN.
              One button — on and off — keeps everyone in the family at the same speed.
            </p>
            <div className="ny-toggle-track mt-6 max-w-sm" role="group" aria-label="Elder Mode toggle">
              <button type="button" aria-pressed={!mode} onClick={() => setMode(false)} className="ny-toggle-btn">
                Standard
              </button>
              <button type="button" aria-pressed={mode} onClick={() => setMode(true)} className="ny-toggle-btn">
                Elder Mode {mode && "· on"}
              </button>
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-surface-2/60">
              Applies to this page · saved on this device
            </p>
          </Reveal>

          {/* PIN demo */}
          <Reveal delay={0.14} className="lg:col-span-5">
            <PinDemo />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
