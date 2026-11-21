/* ── H-7 · Channel panel — Call back · WhatsApp · SMS · Visit ─────────────────
   Each channel is drawn in full: fields, validation, capability lists and a
   masked destination. Its final action resolves to the labeled "Ready —
   connects when the backend is wired" state.                               */

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, X } from "lucide-react";
import SimulatedReady from "../SimulatedReady";
import {
  CALL_TIMES, CHANNELS, MASKED_PHONE, OFFICE, PHONE_RE, ROUTES, SMS_STEPS, VEIL_FIELDS, VISIT_DAYS, WHATSAPP_CAN, WHATSAPP_NEVER,
  type ChannelId,
} from "../../../data/home/contact";
import { cn } from "../../../utils/cn";

function L({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-text-primary">{label}</label>
      {children}
    </div>
  );
}

function List({ title, items, alert }: { title: string; items: string[]; alert?: boolean }) {
  return (
    <div className="rounded-2xl border border-surface-3/70 bg-surface-0 p-4">
      <p className={cn("text-[11px] font-bold uppercase tracking-[0.16em]", alert ? "text-brand-danger" : "text-text-tertiary")}>{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-2 text-sm leading-relaxed text-text-secondary">
            <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-pill", alert ? "bg-brand-danger" : "bg-brand-success")} aria-hidden="true" />{t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Destination() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-brand-primary/15 bg-brand-primary-tint px-4 py-3">
      <Lock className="size-5 shrink-0 text-brand-primary" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-sm font-bold text-brand-primary">Family office line</p>
        <p className="ny-num text-sm text-text-secondary">{MASKED_PHONE}</p>
      </div>
      <span className="ny-sim-badge ml-auto shrink-0">Simulated</span>
    </div>
  );
}

function WhatsAppInfo() {
  return (
    <div className="space-y-4">
      <Destination />
      <div className="grid gap-3">
        <List title="Good for" items={WHATSAPP_CAN} />
        <List title="We never" items={[WHATSAPP_NEVER]} alert />
      </div>
      <SimulatedReady body="“Open WhatsApp →” starts a chat with the office line. In this build the link is not created and nothing is sent." />
    </div>
  );
}

function SmsInfo() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-brand-primary-deep p-4 text-center text-surface-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent">Text this word</p>
        <p className="ny-num mt-1 font-display text-2xl font-semibold tracking-[0.2em]">NALYANYA HELP</p>
      </div>
      <ol className="space-y-2">
        {SMS_STEPS.map((s, i) => (
          <li key={s} className="flex items-start gap-3 text-sm text-text-secondary">
            <span className="grid size-6 shrink-0 place-items-center rounded-pill bg-brand-primary text-[11px] font-bold text-brand-accent">{i + 1}</span>{s}
          </li>
        ))}
      </ol>
      <Destination />
      <SimulatedReady body="The office line and keyword are assigned when the SMS provider is wired in. Nothing is sent from this build." />
    </div>
  );
}

function CallbackForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState<string>(CALL_TIMES[0].id);
  const [topic, setTopic] = useState(ROUTES[0].id);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const when = CALL_TIMES.find((t) => t.id === time)?.label.toLowerCase() ?? "in the morning";
  const route = ROUTES.find((r) => r.id === topic) ?? ROUTES[0];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) { setError("Add your first name."); return; }
    if (!PHONE_RE.test(phone.trim())) { setError("Use a Kenyan number, like 0712 345 678."); return; }
    setError("");
    setReady(true);
  };

  if (ready) {
    return (
      <SimulatedReady onReset={() => setReady(false)} resetLabel="Change the request"
        body={`In the live app the office would call ${name.trim()} ${when} about ${route.handles.toLowerCase()}. In this build no call is queued and the number is not saved.`} />
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <p className="rounded-2xl border border-brand-accent/40 bg-brand-accent-soft/50 px-4 py-3 text-sm leading-relaxed text-[#7a5b14]">
        They call you. The office number is never printed on this page.
      </p>
      <L id="cb-name" label="Your first name">
        <input id="cb-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} autoComplete="given-name" placeholder="First name only" className="ny-ct-input" />
      </L>
      <L id="cb-phone" label="Your phone number">
        <input id="cb-phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678"
          className={cn("ny-ct-input", error && "is-invalid")} aria-invalid={!!error} />
      </L>
      <fieldset>
        <legend className="text-sm font-semibold text-text-primary">A good time to call</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {CALL_TIMES.map((t) => (
            <label key={t.id} className="ny-ct-choice">
              <input type="radio" name="cb-time" checked={time === t.id} onChange={() => setTime(t.id)} />
              <span>
                <span className="block text-sm font-bold text-text-primary">{t.label}</span>
                <span className="block text-xs text-text-secondary">{t.detail}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <L id="cb-topic" label="What is it about?">
        <select id="cb-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="ny-ct-input">
          {ROUTES.map((r) => <option key={r.id} value={r.id}>{r.role}</option>)}
        </select>
      </L>
      {error && <p role="alert" className="text-xs font-semibold text-brand-danger">{error}</p>}
      <button type="submit" className="ny-btn-gold w-full">Request the call</button>
    </form>
  );
}

function VisitForm() {
  const [day, setDay] = useState(VISIT_DAYS[0]);
  const [slot, setSlot] = useState("morning");
  const [topic, setTopic] = useState(ROUTES[0].id);
  const [people, setPeople] = useState("2");
  const [ready, setReady] = useState(false);

  const route = ROUTES.find((r) => r.id === topic) ?? ROUTES[0];
  const when = `${day} ${slot === "morning" ? "morning" : "afternoon"}`;

  const submit = (e: FormEvent) => { e.preventDefault(); setReady(true); };

  if (ready) {
    return (
      <SimulatedReady onReset={() => setReady(false)} resetLabel="Change the booking"
        body={`In the live app the office would confirm ${when} for ${people} ${people === "1" ? "person" : "people"}, then share the street and plot. In this build nothing is booked.`}>
        <div className="mt-4 grid grid-cols-2 gap-2 text-left">
          {VEIL_FIELDS.slice(0, 2).map((f) => (
            <div key={f.label} className="rounded-xl border border-surface-3/70 bg-surface-0 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-tertiary">{f.label}</p>
              <p className="ny-num text-sm font-semibold text-text-tertiary">{f.value}</p>
            </div>
          ))}
        </div>
      </SimulatedReady>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="rounded-2xl border border-brand-accent/40 bg-brand-accent-soft/50 px-4 py-3 text-sm leading-relaxed text-[#7a5b14]">
        {OFFICE.town}, {OFFICE.county}. The exact spot is shared only after the office confirms.
      </p>
      <fieldset>
        <legend className="text-sm font-semibold text-text-primary">Pick a day</legend>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {VISIT_DAYS.map((d) => (
            <button key={d} type="button" aria-pressed={day === d} onClick={() => setDay(d)}
              className="ny-ct-choice items-center justify-center py-2.5 text-sm font-bold text-text-primary"
              style={day === d ? { borderColor: "#B5532A", background: "#F6E6DD", boxShadow: "inset 0 0 0 1px #B5532A" } : undefined}>
              {d}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <L id="visit-slot" label="Time of day">
          <select id="visit-slot" value={slot} onChange={(e) => setSlot(e.target.value)} className="ny-ct-input">
            <option value="morning">Morning · 08:00 – 12:00</option>
            <option value="afternoon">Afternoon · 12:00 – 17:00</option>
          </select>
        </L>
        <L id="visit-people" label="How many of you">
          <select id="visit-people" value={people} onChange={(e) => setPeople(e.target.value)} className="ny-ct-input">
            {["1", "2", "3", "4", "5", "6"].map((n) => <option key={n} value={n}>{n} {n === "1" ? "person" : "people"}</option>)}
          </select>
        </L>
      </div>
      <L id="visit-topic" label="What is it about?">
        <select id="visit-topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="ny-ct-input">
          {ROUTES.map((r) => <option key={r.id} value={r.id}>{r.role}</option>)}
        </select>
      </L>
      <button type="submit" className="ny-btn-gold w-full">Ask for this visit</button>
      <p className="text-xs font-medium text-text-secondary">About: {route.handles.toLowerCase()}.</p>
    </form>
  );
}

export default function ChannelModal({ id, onClose, onUseForm }: { id: ChannelId | null; onClose: () => void; onUseForm: () => void }) {
  const channel = CHANNELS.find((c) => c.id === id);

  useEffect(() => {
    if (!id) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [id, onClose]);

  return (
    <AnimatePresence>
      {channel && (
        <motion.div key="backdrop" className="ny-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="channel-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="ny-card max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl p-5 shadow-panel sm:p-6"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="ny-icon-chip"><channel.icon className="size-5" aria-hidden="true" /></span>
                <div className="min-w-0">
                  <h2 id="channel-title" className="font-display text-2xl font-semibold leading-tight">{channel.title}</h2>
                  <p className="text-sm text-text-secondary">{channel.lead}</p>
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Close"
                className="ny-touch grid size-10 shrink-0 place-items-center rounded-pill border border-surface-3 text-text-secondary hover:bg-surface-2">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4">
              {id === "call" && <CallbackForm />}
              {id === "whatsapp" && <WhatsAppInfo />}
              {id === "sms" && <SmsInfo />}
              {id === "visit" && <VisitForm />}
            </div>

            <button type="button" onClick={onUseForm} className="ny-btn-ghost mt-4 w-full text-sm">Use the note form instead</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
