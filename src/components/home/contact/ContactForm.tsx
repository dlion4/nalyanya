/* ── H-7 S2 · Contact form — name · phone/email · branch · subject · message ──
   "Send" spins briefly, then returns a ticket reference and ONE toast. It is
   SIMULATED: nothing leaves the browser.                                     */

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { ArrowDown, Send, ShieldAlert } from "lucide-react";
import SimulatedReady from "../SimulatedReady";
import Reveal from "../Reveal";
import {
  BRANCH_OPTIONS, EMAIL_RE, MAX_MESSAGE, MAX_SUBJECT, NEXT_STEPS, NOT_TO_SEND, PHONE_RE,
  REPLY_BY, ROUTES, SENSITIVE_RE, URGENT_LEVELS, routeById, type Route,
} from "../../../data/home/contact";
import { usePrefersReducedMotion } from "../../../lib/hooks";
import { cn } from "../../../utils/cn";

export interface FormPreset { topic: string; urgent: string; key: number }
export interface Ticket { ref: string; route: Route; urgent: string; name: string; subject: string }

const SEND_MS = 800;

export function makeTicketRef(): string {
  const buf = new Uint32Array(1);
  const c = globalThis.crypto;
  if (c && typeof c.getRandomValues === "function") c.getRandomValues(buf);
  else buf[0] = Math.floor(Math.random() * 2 ** 32);
  const serial = String(10000 + (buf[0] % 90000));
  return `NY-CTC-${new Date().getFullYear()}-${serial}`;
}

function Field({ id, label, error, hint, className = "", children }: {
  id: string; label: string; error?: string; hint?: string; className?: string; children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-text-primary">{label}</label>
      {children}
      {error
        ? <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{error}</p>
        : hint ? <p className="mt-1.5 text-xs text-text-tertiary">{hint}</p> : null}
    </div>
  );
}

export default function ContactForm({ topic, onTopic, preset, onSent, onToast }: {
  topic: string;
  onTopic: (id: string) => void;
  preset: FormPreset | null;
  onSent: (ref: string) => void;
  onToast: (message: string) => void;
}) {
  const id = useId();
  const route = routeById(topic);
  const reduced = usePrefersReducedMotion();
  const timer = useRef<number | undefined>(undefined);

  const [name, setName] = useState("");
  const [replyBy, setReplyBy] = useState<"phone" | "email">("phone");
  const [dest, setDest] = useState("");
  const [branch, setBranch] = useState("");
  const [subject, setSubject] = useState("");
  const [urgent, setUrgent] = useState("normal");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "ready">("idle");
  const [ticket, setTicket] = useState<Ticket | null>(null);

  // a preset (from "write about this" / urgent cards) pre-fills the note
  useEffect(() => {
    if (!preset) return;
    onTopic(preset.topic);
    setUrgent(preset.urgent);
    setState("idle");
    setTicket(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset?.key]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Add your first name.";
    if (replyBy === "email" ? !EMAIL_RE.test(dest.trim()) : !PHONE_RE.test(dest.trim())) {
      next.dest = replyBy === "email" ? "That email doesn't look complete." : "Use a Kenyan number, like 0712 345 678 or +254 712 345 678.";
    }
    if (subject.trim().length < 4) next.subject = "Give your note a short subject.";
    if (message.trim().length < 12) next.message = "Say a little more — a sentence is enough.";
    if (!consent) next.consent = "Please tick the box so the office may keep your note until it is answered.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const finish = () => {
      const t: Ticket = { ref: makeTicketRef(), route, urgent, name: name.trim(), subject: subject.trim() };
      setTicket(t);
      setState("ready");
      onSent(t.ref);
      onToast(`${t.ref} is ready for the ${route.role} — SIMULATED, nothing was sent.`);
    };
    if (reduced) { finish(); return; }
    setState("sending");
    timer.current = window.setTimeout(finish, SEND_MS);
  };

  const reset = () => { setTicket(null); setState("idle"); };

  const sensitive = SENSITIVE_RE.test(message);
  const destError = (k: string) => (errors[k] ? `${id}-${k}-err` : undefined);
  const sending = state === "sending";

  return (
    <section id="write" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="Write to the family office">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-12">

        {/* ── left: where it goes + guidance ── */}
        <Reveal className="lg:col-span-5">
          <div className="flex flex-col gap-4 lg:sticky lg:top-24">
            <div>
              <span className="ny-section-label">Write to us</span>
              <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">One note. <em className="font-medium text-brand-secondary">The right person.</em></h2>
              <p className="ny-prose mt-3 max-w-md">Tell us your first name, how to reply, and what you need. A person at the office does the rest.</p>
            </div>

            <div className="rounded-[1.75rem] bg-brand-primary-deep p-5 text-surface-0 shadow-panel">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent">Where it goes</p>
              <p className="mt-2 font-display text-2xl font-semibold">{route.role}</p>
              <p className="text-sm text-surface-2/80">{route.person} · first reply within {route.replyIn}</p>
              <p className="mt-3 text-sm leading-relaxed text-surface-2/85">Reads notes about {route.handles.toLowerCase()}.</p>
              <div className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em]">
                <span className="rounded-pill border border-white/25 px-2.5 py-1.5">You</span>
                <span className="h-px min-w-2 flex-1 bg-gradient-to-r from-white/40 to-brand-accent" aria-hidden="true" />
                <span className="rounded-pill border border-white/25 px-2.5 py-1.5">Office</span>
                <span className="h-px min-w-2 flex-1 bg-brand-accent" aria-hidden="true" />
                <span className="whitespace-nowrap rounded-pill bg-brand-accent px-2.5 py-1.5 text-brand-primary-deep">{route.role}</span>
              </div>
            </div>

            <div className="ny-card rounded-[1.75rem] p-5">
              <p className="text-sm font-bold text-brand-danger">Keep these out of the note</p>
              <ul className="mt-3 grid gap-2">
                {NOT_TO_SEND.map((n) => (
                  <li key={n.label} className="flex items-center gap-2.5 text-sm font-medium text-text-secondary">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-danger-tint text-brand-danger"><n.icon className="size-4" aria-hidden="true" /></span>
                    {n.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="ny-card rounded-[1.75rem] p-5">
              <p className="text-sm font-bold text-brand-primary">What happens next</p>
              <ol className="mt-3 space-y-2.5">
                {NEXT_STEPS.map((s, i) => (
                  <li key={s} className="flex items-start gap-3 text-sm text-text-secondary">
                    <span className="grid size-6 shrink-0 place-items-center rounded-pill bg-brand-primary text-[11px] font-bold text-brand-accent">{i + 1}</span>{s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>

        {/* ── right: the note ── */}
        <Reveal delay={0.08} className="lg:col-span-7">
          <form onSubmit={submit} noValidate className="ny-card relative overflow-hidden rounded-[1.75rem] p-5 shadow-card sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-2xl font-semibold sm:text-3xl">Write to the family office</h3>
              <span className="ny-sim-badge">Simulated</span>
            </div>

            {state === "ready" && ticket ? (
              <div className="relative mt-6">
                <span className="ny-ct-stamp absolute -top-5 right-2 z-10 rounded-lg border-[3px] border-brand-secondary bg-surface-1 px-3 py-1.5 font-display text-sm font-bold uppercase tracking-[0.2em] text-brand-secondary">Received</span>
                <SimulatedReady
                  reference={ticket.ref}
                  body={`Goes to ${ticket.route.role} (${ticket.route.person}). First reply within ${ticket.route.replyIn}. Nothing was sent, and nothing is stored by this build.`}
                >
                  <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                    <button type="button" onClick={() => document.getElementById("follow")?.scrollIntoView()} className="ny-btn-primary text-sm">
                      Follow this note <ArrowDown className="size-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={reset} className="ny-btn-ghost text-sm">Write another</button>
                  </div>
                </SimulatedReady>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field id={`${id}-name`} label="Your first name" error={errors.name} hint="First name only — not a full legal name.">
                  <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" maxLength={40} placeholder="e.g. Brian"
                    className={cn("ny-ct-input", errors.name && "is-invalid")} aria-invalid={!!errors.name} aria-describedby={destError("name")} />
                </Field>

                <Field id={`${id}-branch`} label="Your branch or house (optional)" hint="Free text — pick a house or type your own.">
                  <input id={`${id}-branch`} value={branch} onChange={(e) => setBranch(e.target.value)} maxLength={60} placeholder="e.g. House of Wafula"
                    className="ny-ct-input" />
                </Field>

                <div className="-mt-2 flex gap-1.5 overflow-x-auto pb-1 sm:col-span-2" role="group" aria-label="Suggested houses">
                  {BRANCH_OPTIONS.map((b) => (
                    <button key={b} type="button" onClick={() => setBranch(b)} aria-pressed={branch === b}
                      className={cn("ny-chip ny-touch shrink-0 transition-colors", branch === b ? "border-brand-primary bg-brand-primary text-surface-0" : "hover:border-brand-primary/40")}>
                      {b.replace("House of ", "")}
                    </button>
                  ))}
                </div>

                <fieldset className="sm:col-span-2">
                  <legend className="text-sm font-semibold text-text-primary">Reply by</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {REPLY_BY.map((o) => (
                      <label key={o.id} className="ny-ct-choice">
                        <input type="radio" name={`${id}-reply`} value={o.id} checked={replyBy === o.id} onChange={() => { setReplyBy(o.id); setDest(""); }} />
                        <span>
                          <span className="block text-sm font-bold text-text-primary">{o.label}</span>
                          <span className="block text-xs text-text-secondary">{o.detail}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <Field id={`${id}-dest`} className="sm:col-span-2" error={errors.dest} hint="Used once to reply. It is never shown on this site."
                  label={replyBy === "phone" ? "Your phone number" : "Your email address"}>
                  <input
                    id={`${id}-dest`}
                    type={replyBy === "phone" ? "tel" : "email"}
                    inputMode={replyBy === "phone" ? "tel" : "email"}
                    autoComplete={replyBy === "phone" ? "tel" : "email"}
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                    placeholder={replyBy === "phone" ? "0712 345 678 or +254 712 345 678" : "you@example.com"}
                    className={cn("ny-ct-input", errors.dest && "is-invalid")}
                    aria-invalid={!!errors.dest}
                    aria-describedby={destError("dest")}
                  />
                </Field>

                <fieldset className="sm:col-span-2">
                  <legend className="text-sm font-semibold text-text-primary">What is it about?</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ROUTES.map((r) => (
                      <button key={r.id} type="button" aria-pressed={r.id === topic} onClick={() => onTopic(r.id)}
                        className={cn("ny-chip ny-touch transition-colors", r.id === topic ? "border-brand-primary bg-brand-primary text-surface-0" : "hover:border-brand-primary/40")}>
                        <span className="size-2 rounded-pill" style={{ background: r.id === topic ? "#D4A437" : r.color }} aria-hidden="true" />
                        {r.role}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <Field id={`${id}-subject`} className="sm:col-span-2" label="Subject" error={errors.subject}>
                  <input id={`${id}-subject`} value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={MAX_SUBJECT} placeholder="One line — e.g. Roof before the rains"
                    className={cn("ny-ct-input", errors.subject && "is-invalid")} aria-invalid={!!errors.subject} aria-describedby={destError("subject")} />
                </Field>

                <fieldset className="sm:col-span-2">
                  <legend className="text-sm font-semibold text-text-primary">How urgent is it?</legend>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {URGENT_LEVELS.map((u) => (
                      <button key={u.id} type="button" aria-pressed={urgent === u.id} onClick={() => setUrgent(u.id)}
                        className="ny-ct-choice items-center"
                        style={urgent === u.id ? { borderColor: "#B5532A", background: "#F6E6DD", boxShadow: "inset 0 0 0 1px #B5532A" } : undefined}>
                        <span>
                          <span className="block text-sm font-bold text-text-primary">{u.label}</span>
                          <span className="block text-xs text-text-secondary">{u.detail}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <Field id={`${id}-message`} className="sm:col-span-2" label="Your note" error={errors.message}
                  hint={`${message.trim().length.toLocaleString("en-KE")} / ${MAX_MESSAGE.toLocaleString("en-KE")} characters`}>
                  <textarea id={`${id}-message`} rows={5} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={MAX_MESSAGE}
                    placeholder="Write it in your own words. A sentence is enough."
                    className={cn("ny-ct-input resize-y leading-relaxed", errors.message && "is-invalid")} aria-invalid={!!errors.message} aria-describedby={destError("message")} />
                </Field>

                {sensitive && (
                  <p role="note" className="flex items-start gap-2 rounded-xl border border-brand-warning/50 bg-brand-accent-soft/60 px-3.5 py-2.5 text-xs font-semibold text-[#7a5b14] sm:col-span-2">
                    <ShieldAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    Please don't write a PIN, OTP or password here. The office never needs them to help you.
                  </p>
                )}

                <div className="sm:col-span-2">
                  <label className="ny-ct-choice">
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} aria-describedby={destError("consent")} />
                    <span className={cn("text-sm", errors.consent ? "font-semibold text-brand-danger" : "text-text-secondary")}>
                      {errors.consent ?? "The office may keep this note until it is answered, then file only the reference."}
                    </span>
                  </label>
                </div>

                <button type="submit" disabled={sending}
                  className="ny-btn-gold w-full text-base disabled:cursor-wait disabled:opacity-80 sm:col-span-2">
                  {sending
                    ? (<><span className="size-4 animate-spin rounded-full border-2 border-brand-primary-deep/30 border-t-brand-primary-deep" aria-hidden="true" />Sending…</>)
                    : (<><Send className="size-4" aria-hidden="true" />Send</>)}
                </button>
                <p className="text-center text-[11px] font-medium text-text-tertiary sm:col-span-2">Frontend-only build: this button runs the full flow and stops at a ticket reference. Nothing is sent.</p>
              </div>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
