/* ── Ask for help — contact form that never reveals a number ───────────────
   The phone stays masked. Submit resolves to a labeled SIMULATED state.
   Nothing is sent.                                                        */

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Lock, RotateCcw, X } from "lucide-react";
import { CHANNELS, MASKED_PHONE, categoryOf, type Professional } from "../../../data/home/professions";

export default function AskModal({ person, onClose }: { person: Professional | null; onClose: () => void }) {
  const [name, setName] = useState("");
  const [need, setNeed] = useState("");
  const [channel, setChannel] = useState<string>(CHANNELS[0].id);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!person) return;
    setName(""); setNeed(""); setChannel(CHANNELS[0].id); setError(""); setReady(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [person, onClose]);

  if (!person) return null;
  const cat = categoryOf(person.category);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) { setError("Add your first name so they know who asked."); return; }
    if (need.trim().length < 8) { setError("Say what you need — a sentence is enough."); return; }
    setError("");
    setReady(true);
  };

  return (
    <AnimatePresence>
      <motion.div className="ny-ask-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          role="dialog" aria-modal="true" aria-labelledby="ask-title"
          initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="ny-card max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl p-5 shadow-panel sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={person.photo} alt="" className="size-14 rounded-2xl object-cover" />
              <div>
                <p id="ask-title" className="font-display text-xl font-semibold text-text-primary">Ask {person.name}</p>
                <p className="text-sm text-text-secondary">{person.trade} · {person.county}{cat ? ` · ${cat.label}` : ""}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="ny-touch grid size-10 place-items-center rounded-pill border border-surface-3 text-text-secondary hover:bg-surface-2">
              <X className="size-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-brand-primary/15 bg-brand-primary-tint px-4 py-3">
            <Lock className="size-5 shrink-0 text-brand-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-brand-primary">Number stays hidden</p>
              <p className="ny-num text-sm text-text-secondary">{MASKED_PHONE} · the family office forwards your note</p>
            </div>
            <span className="ny-sim-badge ml-auto shrink-0">Simulated</span>
          </div>

          {ready ? (
            <div className="mt-4 rounded-2xl border border-brand-success/30 bg-brand-success-tint p-5 text-center">
              <CheckCircle2 className="mx-auto size-8 text-brand-success" aria-hidden="true" />
              <p className="mt-2 font-display text-lg font-semibold text-brand-primary">Ready — connects when the backend is wired.</p>
              <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                No WhatsApp, no SMS and no call left this page. In the live app the family office would pass your note to {person.name}.
              </p>
              <button type="button" onClick={() => setReady(false)} className="ny-btn-ghost mt-4 text-sm">
                <RotateCcw className="size-4" aria-hidden="true" /> Write another note
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
              <label className="block text-sm font-semibold text-text-primary">
                Your first name
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" maxLength={40}
                  className="mt-1.5 w-full rounded-xl border border-surface-3 bg-surface-0 px-3.5 py-3 text-base font-medium outline-none focus:border-brand-primary" placeholder="First name only" />
              </label>
              <label className="block text-sm font-semibold text-text-primary">
                What do you need?
                <textarea value={need} onChange={(e) => setNeed(e.target.value)} rows={3} maxLength={400}
                  className="mt-1.5 w-full resize-none rounded-xl border border-surface-3 bg-surface-0 px-3.5 py-3 text-base font-medium outline-none focus:border-brand-primary" placeholder="A roof patch before the rains, this month." />
              </label>
              <fieldset>
                <legend className="text-sm font-semibold text-text-primary">How should the office pass it on?</legend>
                <div className="mt-2 grid gap-2">
                  {CHANNELS.map((c) => (
                    <label key={c.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${channel === c.id ? "border-brand-primary bg-brand-primary-tint" : "border-surface-3"}`}>
                      <input type="radio" name="channel" value={c.id} checked={channel === c.id} onChange={() => setChannel(c.id)} className="mt-1 accent-brand-primary" />
                      <span><span className="block font-semibold text-text-primary">{c.label}</span><span className="text-text-secondary">{c.detail}</span></span>
                    </label>
                  ))}
                </div>
              </fieldset>
              {error && <p role="alert" className="text-sm font-semibold text-brand-danger">{error}</p>}
              <button type="submit" className="ny-btn-primary w-full">Send the note</button>
              <p className="text-center text-[11px] font-medium text-text-tertiary">Frontend-only. This button does not contact anyone.</p>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
