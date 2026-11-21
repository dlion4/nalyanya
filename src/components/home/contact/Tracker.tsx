/* ── H-7 · Follow a note — ticket timeline ──────────────────────────────────
   A SIMULATED preview of live tracking: the four stages play through once a
   reference is known. Nothing is looked up and nothing is stored.           */

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, GitBranch, Inbox, MessageCircle, RotateCcw } from "lucide-react";
import Reveal from "../Reveal";
import { usePrefersReducedMotion } from "../../../lib/hooks";
import { cn } from "../../../utils/cn";

const STAGES = [
  { icon: Inbox, title: "Received", copy: "The office has your note and its reference." },
  { icon: GitBranch, title: "Routed", copy: "Sent to the person responsible for your branch." },
  { icon: CheckCircle2, title: "Read", copy: "Read by that one person — nobody else." },
  { icon: MessageCircle, title: "Replied", copy: "You hear back on the channel you chose." },
];
const TICKET_RE = /^NY-CTC-\d{4}-\d{5}$/;
export const SAMPLE_TICKET = "NY-CTC-2025-00123";
const TIMINGS = [1100, 2400, 3900];

export default function Tracker({ ticket }: { ticket: string }) {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(ticket);
  const [active, setActive] = useState<string | null>(ticket || null);
  const [run, setRun] = useState(0);
  const [stage, setStage] = useState(ticket ? STAGES.length : 0);
  const [error, setError] = useState("");

  // a fresh reference from the form lands here
  useEffect(() => {
    if (!ticket) return;
    setValue(ticket);
    setActive(ticket);
    setError("");
  }, [ticket]);

  // play the four stages
  useEffect(() => {
    if (!active) { setStage(0); return; }
    if (reduced) { setStage(STAGES.length); return; }
    setStage(1);
    const timers = TIMINGS.map((ms, i) => window.setTimeout(() => setStage(i + 2), ms));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active, reduced, run]);

  const track = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim().toUpperCase();
    if (!TICKET_RE.test(v)) { setError("Use the reference from your confirmation, like NY-CTC-2025-00123."); return; }
    setError("");
    setValue(v);
    if (v === active) setRun((r) => r + 1);
    else setActive(v);
  };

  const trySample = () => { setValue(SAMPLE_TICKET); setActive(SAMPLE_TICKET); setError(""); };
  const clear = () => { setActive(null); setValue(""); };

  return (
    <section id="follow" className="scroll-mt-24 border-y border-surface-3/60 bg-surface-2/50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="Follow a note">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <span className="ny-section-label">Follow a note</span>
          <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">Know it <em className="font-medium text-brand-secondary">arrived.</em></h2>
          <p className="ny-prose mt-3 max-w-md">Every note gets a ticket reference. Keep it, and see which step it has reached.</p>

          <form onSubmit={track} noValidate className="mt-6 flex flex-col gap-2 sm:flex-row">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Ticket reference</span>
              <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={SAMPLE_TICKET} spellCheck={false} autoComplete="off"
                className={cn("ny-ct-input ny-num tracking-[0.08em]", error && "is-invalid")}
                aria-invalid={!!error} aria-describedby={error ? "follow-err" : undefined} />
            </label>
            <button type="submit" className="ny-btn-primary shrink-0">Track</button>
          </form>
          {error
            ? <p id="follow-err" role="alert" className="mt-2 text-xs font-semibold text-brand-danger">{error}</p>
            : <p className="mt-2 text-xs text-text-tertiary">Lost it? Send the note again — you get a fresh reference.</p>}
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="ny-card rounded-[1.75rem] p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="ny-num text-sm font-bold tracking-[0.1em] text-brand-primary">{active ?? "No reference yet"}</p>
              <span className="ny-sim-badge">Simulated</span>
            </div>

            {active ? (
              <>
                <ol className="mt-5">
                  {STAGES.map((s, i) => {
                    const done = stage > i;
                    const current = stage === i + 1 && stage < STAGES.length;
                    return (
                      <li key={s.title} className="relative flex gap-4 pb-6 last:pb-0">
                        {i < STAGES.length - 1 && (
                          <span className={cn("absolute bottom-0 left-[19px] top-11 w-0.5", i + 1 < stage ? "bg-brand-success" : "bg-surface-3")} aria-hidden="true" />
                        )}
                        <span aria-hidden="true" className={cn(
                          "relative grid size-10 shrink-0 place-items-center rounded-full border-2",
                          done ? "border-brand-success bg-brand-success text-surface-0"
                            : current ? "ny-ct-live border-brand-accent bg-brand-accent-soft text-[#7a5b14]"
                              : "border-surface-3 bg-surface-0 text-text-tertiary"
                        )}>
                          <s.icon className="size-5" />
                        </span>
                        <div className="pt-1.5">
                          <p className={cn("font-display text-lg font-semibold", done || current ? "text-text-primary" : "text-text-tertiary")}>{s.title}</p>
                          <p className={cn("text-sm", done || current ? "text-text-secondary" : "text-text-tertiary")}>{s.copy}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                {stage >= STAGES.length && (
                  <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-xl border border-brand-success/30 bg-brand-success-tint px-4 py-3 sm:flex-row sm:items-center">
                    <p className="text-sm font-semibold text-brand-primary">Replied — check the channel you chose.</p>
                    <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline">
                      <RotateCcw className="size-3.5" aria-hidden="true" />Track another
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-surface-3 px-5 py-9 text-center">
                <Inbox className="mx-auto size-7 text-text-tertiary" aria-hidden="true" />
                <p className="mt-3 font-display text-xl font-semibold">No reference yet.</p>
                <p className="mx-auto mt-1.5 max-w-xs text-sm text-text-secondary">Send a note above, or try the sample reference to see how tracking looks.</p>
                <button type="button" onClick={trySample} className="ny-btn-ghost mt-4 text-sm">Try the sample</button>
              </div>
            )}

            <p className="mt-4 text-xs text-text-tertiary">A preview of live tracking. This build looks nothing up and stores nothing.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
