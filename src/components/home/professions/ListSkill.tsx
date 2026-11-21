/* ── H-3 S11–S12 · List your skill (simulated) + how verification works ──── */

import { useState } from "react";
import { CheckCircle2, ClipboardCheck, RotateCcw } from "lucide-react";
import Reveal from "../Reveal";
import { CATEGORIES, COUNTIES, VERIFY_STEPS } from "../../../data/home/professions";

export default function ListSkill() {
  const [first, setFirst] = useState("");
  const [trade, setTrade] = useState(CATEGORIES[0].id);
  const [county, setCounty] = useState<string>(COUNTIES[0]);
  const [note, setNote] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (first.trim().length < 2) { setError("A first name is enough — not a full legal name."); return; }
    if (note.trim().length < 12) { setError("Say what you can help with, in a sentence."); return; }
    if (!agree) { setError("Tick the box: your phone is collected only after sign-in."); return; }
    setError("");
    setReady(true);
  };

  return (
    <section id="list-skill" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="List your skill">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <span className="ny-section-label">Verification</span>
          <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">A skill is welcome. <em className="font-medium text-brand-secondary">A check takes two voices.</em></h2>
          <ol className="mt-8 space-y-4">
            {VERIFY_STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-brand-primary font-display text-sm font-semibold text-brand-accent">{i + 1}</span>
                <span>
                  <span className="block font-display text-lg font-semibold text-text-primary">{s.title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-text-secondary">{s.copy}</span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-7">
          <form onSubmit={submit} noValidate className="ny-card rounded-[1.75rem] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl font-semibold">List your skill</h3>
              <span className="ny-sim-badge">Simulated</span>
            </div>
            <p className="mt-1 text-sm text-text-secondary">This form does not ask for a phone. That comes after you sign in.</p>

            {ready ? (
              <div className="mt-6 rounded-2xl border border-brand-success/30 bg-brand-success-tint p-6 text-center">
                <CheckCircle2 className="mx-auto size-8 text-brand-success" aria-hidden="true" />
                <p className="mt-2 font-display text-xl font-semibold text-brand-primary">Ready — connects when the backend is wired.</p>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">Nothing was saved and no admin was notified. The live app would queue this for the family council.</p>
                <button type="button" onClick={() => setReady(false)} className="ny-btn-ghost mt-4 text-sm"><RotateCcw className="size-4" aria-hidden="true" /> Edit the note</button>
              </div>
            ) : (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold text-text-primary sm:col-span-2">
                  First name
                  <input value={first} onChange={(e) => setFirst(e.target.value)} maxLength={40} autoComplete="given-name" placeholder="First name only"
                    className="mt-1.5 w-full rounded-xl border border-surface-3 bg-surface-0 px-3.5 py-3 font-medium outline-none focus:border-brand-primary" />
                </label>
                <label className="text-sm font-semibold text-text-primary">
                  Trade
                  <select value={trade} onChange={(e) => setTrade(e.target.value)} className="mt-1.5 w-full rounded-xl border border-surface-3 bg-surface-0 px-3.5 py-3 font-medium outline-none focus:border-brand-primary">
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </label>
                <label className="text-sm font-semibold text-text-primary">
                  County
                  <select value={county} onChange={(e) => setCounty(e.target.value)} className="mt-1.5 w-full rounded-xl border border-surface-3 bg-surface-0 px-3.5 py-3 font-medium outline-none focus:border-brand-primary">
                    {COUNTIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="text-sm font-semibold text-text-primary sm:col-span-2">
                  What can you help with?
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={400} placeholder="Roof repairs in Kakamega, weekends."
                    className="mt-1.5 w-full resize-none rounded-xl border border-surface-3 bg-surface-0 px-3.5 py-3 font-medium outline-none focus:border-brand-primary" />
                </label>
                <label className="flex items-start gap-3 text-sm text-text-secondary sm:col-span-2">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 size-4 accent-brand-primary" />
                  I understand my phone number is collected only after sign-in, and is never printed on this public page.
                </label>
                {error && <p role="alert" className="text-sm font-semibold text-brand-danger sm:col-span-2">{error}</p>}
                <button type="submit" className="ny-btn-gold sm:col-span-2"><ClipboardCheck className="size-4" aria-hidden="true" /> Submit for the council</button>
              </div>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  );
}
