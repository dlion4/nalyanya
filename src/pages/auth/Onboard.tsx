/* ── A-3 · Onboarding Wizard (`/auth/onboard`) ─────────────────────────────────
   Stylesheet: src/styles/pages/auth-onboard.css — 6 steps that place the new
   member into the family graph. The draft persists in this browser (refresh-
   safe); "Save & exit" keeps it for later. Finish resolves SIMULATED with a
   member reference and a mini-tree preview of where they now sit.          */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, KeyRound, Loader2, Plus, Save, Search, Trash2, Users } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import Toast from "../../components/home/Toast";
import { FAMILIES, RELATIVES } from "../../data/auth/families";
import {
  BIRTH_BANDS, COMMS_CHANNELS, COUNTIES, CURRENCIES, GENDERS, LINK_ROLES,
  ONBOARD_SLIDES, ONBOARD_STEPS, ONBOARD_VISUAL, PAYOUT_CHANNELS, clearDraft, readDraft, saveDraft, type OnboardDraft,
} from "../../data/auth/onboard";
import { makeRef } from "../../lib/validation";
import { usePageStyles } from "../../lib/usePageStyles";
import { useElderMode, usePrefersReducedMotion } from "../../lib/hooks";
import { cn } from "../../utils/cn";
import pageCss from "../../styles/pages/auth-onboard.css?inline";

/* mini-tree: root → branch → you, branches draw themselves in */
function MiniTree({ familyName, branchName, you }: { familyName: string; branchName: string; you: string }) {
  return (
    <svg viewBox="0 0 300 190" className="w-full" role="img" aria-label={`You, ${you}, placed in ${branchName} of the ${familyName} family`}>
      <path className="auth-tree-branch" d="M150 34 C 150 60, 90 62, 78 96" fill="none" stroke="#D4A437" strokeWidth="3" strokeLinecap="round" pathLength={1} />
      <path className="auth-tree-branch d2" d="M150 34 C 150 60, 210 62, 222 96" fill="none" stroke="#1F4D3A" strokeWidth="3" strokeLinecap="round" pathLength={1} />
      <path className="auth-tree-branch d3" d="M78 118 C 74 134, 110 138, 130 152" fill="none" stroke="#B5532A" strokeWidth="2.5" strokeLinecap="round" pathLength={1} />
      <circle cx="150" cy="24" r="15" fill="#D4A437" />
      <text x="150" y="28.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="#143527">1st</text>
      <text x="150" y="52" textAnchor="middle" fontSize="9" fontWeight="600" fill="#5A6B57">{familyName.slice(0, 18)}</text>
      <circle cx="78" cy="107" r="11" fill="#1F4D3A" />
      <text x="78" y="111" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">B</text>
      <text x="78" y="128" textAnchor="middle" fontSize="8.5" fontWeight="600" fill="#5A6B57">{branchName.slice(0, 16)}</text>
      <circle cx="222" cy="107" r="11" fill="#E8E0CC" stroke="#1F4D3A" strokeWidth="1.5" />
      <text x="222" y="111" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1F4D3A">B</text>
      <g className="auth-tree-you">
        <circle cx="142" cy="160" r="14" fill="#B5532A" stroke="#fff" strokeWidth="2.5" />
        <text x="142" y="165" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">You</text>
        <text x="168" y="164" fontSize="9.5" fontWeight="700" fill="#1A2618">{you.slice(0, 14) || "You"}</text>
      </g>
    </svg>
  );
}

export default function Onboard() {
  usePageStyles("auth-onboard", pageCss);
  const reduced = usePrefersReducedMotion();
  const { mode: elder, setMode: setElder } = useElderMode();

  const [draft, setDraft] = useState<OnboardDraft>(() => readDraft());
  const [step, setStep] = useState(() => Math.min(5, Math.max(0, readDraft().step)));
  const [dir, setDir] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [reference, setReference] = useState("");
  const [relQuery, setRelQuery] = useState("");
  const [relRole, setRelRole] = useState<string>("Parent");

  useEffect(() => { document.title = "Placing you in the tree — Nalyanya"; }, []);
  useEffect(() => { saveDraft({ ...draft, step }); }, [draft, step]);
  useEffect(() => { if (!shake) return; const t = window.setTimeout(() => setShake(false), 450); return () => window.clearTimeout(t); }, [shake]);

  const family = useMemo(() => FAMILIES.find((f) => f.id === draft.familyId) ?? FAMILIES[0], [draft.familyId]);
  const branchName = useMemo(() => family.branches.find((b) => b.id === draft.primaryBranch)?.name ?? "—", [family, draft.primaryBranch]);
  const relMatches = useMemo(() => {
    const q = relQuery.trim().toLowerCase();
    const pool = RELATIVES.filter((r) => !draft.links.some((l) => l.relativeId === r.id));
    if (!q) return pool.slice(0, 3);
    return pool.filter((r) => [r.label, r.role, r.house, r.county].join(" ").toLowerCase().includes(q)).slice(0, 3);
  }, [relQuery, draft.links]);

  const set = <K extends keyof OnboardDraft>(k: K, v: OnboardDraft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(Math.min(5, Math.max(0, next)));
    setErrors({});
  };

  const validate = (s: number): boolean => {
    const next: Record<string, string> = {};
    if (s === 0) {
      if (draft.preferredName.trim().length < 2) next.preferredName = "What should we call you?";
      if (!draft.birthBand) next.birthBand = "Pick the band you were born in.";
      if (!draft.gender) next.gender = "Pick one — or prefer not to say.";
      if (!draft.homeCounty) next.homeCounty = "Where is home?";
    }
    if (s === 1 && !draft.primaryBranch) next.primaryBranch = "Pick your primary branch — you can join more below.";
    if (s === 3 && draft.channels.length === 0) next.channels = "Pick at least one way to reach you.";
    setErrors(next);
    if (Object.keys(next).length) setShake(true);
    return Object.keys(next).length === 0;
  };

  const next = () => { if (validate(step)) go(step + 1); };
  const saveExit = () => {
    saveDraft({ ...draft, step });
    setToast("Saved in this browser — come back any time to finish.");
  };

  const finish = () => {
    const done = () => {
      setReference(makeRef("NY-MBR"));
      clearDraft();
      setToast("Karibu to the tree — SIMULATED placement, nothing was stored on a server.");
    };
    if (reduced) done();
    else { setFinishing(true); window.setTimeout(done, 900); }
  };

  const toggleExtra = (id: string) =>
    set((draft.extraBranches.includes(id) ? "extraBranches" : "extraBranches"),
      draft.extraBranches.includes(id) ? draft.extraBranches.filter((b) => b !== id) : [...draft.extraBranches, id]);

  const addLink = (relativeId: string) => {
    setDraft((d) => ({ ...d, links: [...d.links, { relativeId, role: relRole }] }));
    setRelQuery("");
  };

  const progress = ((step + 1) / 6) * 100;

  return (
    <AuthShell kicker="A-3 · Onboarding · step by step" backTo="/" visual={ONBOARD_VISUAL} slides={ONBOARD_SLIDES}>
      <main className="page-auth-onboard">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">Placing you in the tree · {step + 1} of 6</span>
          <span className="ny-sim-badge">Simulated</span>
        </div>
        <h1 className="ny-heading mt-2 text-3xl sm:text-4xl">{ONBOARD_STEPS[step]}<span className="text-text-tertiary">.</span></h1>

        {/* stepper */}
        <div className="auth-wizard-track mt-5" aria-hidden="true">
          <div className="auth-wizard-fill" style={{ width: `${progress}%` }} />
        </div>
        <ol className="mt-2 flex items-start justify-between" aria-label="Onboarding steps">
          {ONBOARD_STEPS.map((label, i) => (
            <li key={label} className={cn("auth-step w-10", i < step && "is-done", i === step && "is-live")} aria-current={i === step ? "step" : undefined}>
              <span className="auth-step__dot !h-8 !w-8 text-[11px]">{i < step ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}</span>
              <span className="hidden text-[9px] font-bold uppercase tracking-[0.08em] text-text-tertiary sm:block">{label}</span>
            </li>
          ))}
        </ol>

        {reference ? (
          <motion.div role="status" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-[1.75rem] border border-brand-success/30 bg-brand-success-tint p-6 text-center">
            <CheckCircle2 className="mx-auto size-10 text-brand-success" aria-hidden="true" />
            <p className="mt-2 font-display text-2xl font-semibold text-brand-primary">You're in the tree{draft.preferredName ? `, ${draft.preferredName.split(" ")[0]}` : ""}.</p>
            <p className="ny-num mt-1 text-sm font-bold tracking-[0.12em] text-brand-primary">{reference}</p>
            <div className="mx-auto mt-4 max-w-sm rounded-2xl bg-surface-1 p-3 shadow-card">
              <MiniTree familyName={family.name} branchName={branchName} you={draft.preferredName} />
            </div>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">SIMULATED placement — the draft was cleared from this browser and nothing was sent anywhere.</p>
            <div className="mt-4 flex flex-col justify-center gap-2.5 sm:flex-row">
              <Link to="/auth/2fa?from=onboard" className="ny-btn-gold text-sm"><KeyRound className="size-4" /> Set up 2FA & PIN →</Link>
              <Link to="/" className="ny-btn-ghost text-sm">Explore the family</Link>
            </div>
          </motion.div>
        ) : (
          <div className={cn("mt-5", shake && "auth-shake")}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step}
                initial={reduced ? {} : { opacity: 0, x: 44 * dir }} animate={{ opacity: 1, x: 0 }} exit={reduced ? {} : { opacity: 0, x: -32 * dir }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}>

                {/* STEP 1 — profile */}
                {step === 0 && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="ob-name" className="block text-sm font-semibold text-text-primary">Preferred name</label>
                      <input id="ob-name" value={draft.preferredName} onChange={(e) => set("preferredName", e.target.value)} placeholder="What should the family call you?" maxLength={40}
                        className={cn("auth-input", errors.preferredName && "is-invalid")} aria-invalid={!!errors.preferredName} />
                      {errors.preferredName && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.preferredName}</p>}
                    </div>
                    <fieldset>
                      <legend className="text-sm font-semibold text-text-primary">Born in</legend>
                      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Birth band">
                        {BIRTH_BANDS.map((b) => (
                          <button key={b} type="button" aria-pressed={draft.birthBand === b} onClick={() => set("birthBand", b)}
                            className={cn("auth-pick ny-chip ny-touch", draft.birthBand === b && "")}>{b}</button>
                        ))}
                      </div>
                      {errors.birthBand && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.birthBand}</p>}
                      <p className="mt-1.5 text-xs text-text-tertiary">A band, not a birthday — enough to place your generation.</p>
                    </fieldset>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <fieldset>
                        <legend className="text-sm font-semibold text-text-primary">Gender</legend>
                        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Gender">
                          {GENDERS.map((g) => (
                            <button key={g} type="button" aria-pressed={draft.gender === g} onClick={() => set("gender", g)}
                              className={cn("auth-pick ny-chip ny-touch text-xs", draft.gender === g && "")}>{g}</button>
                          ))}
                        </div>
                        {errors.gender && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.gender}</p>}
                      </fieldset>
                      <div>
                        <label htmlFor="ob-county" className="block text-sm font-semibold text-text-primary">Home county</label>
                        <select id="ob-county" value={draft.homeCounty} onChange={(e) => set("homeCounty", e.target.value)}
                          className={cn("auth-input", errors.homeCounty && "is-invalid")} aria-invalid={!!errors.homeCounty}>
                          <option value="">Choose…</option>
                          {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {errors.homeCounty && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.homeCounty}</p>}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="ob-town" className="block text-sm font-semibold text-text-primary">Current town <span className="font-normal text-text-tertiary">(optional)</span></label>
                      <input id="ob-town" value={draft.currentTown} onChange={(e) => set("currentTown", e.target.value)} placeholder="Where do you live now?" maxLength={40} className="auth-input" />
                    </div>
                  </div>
                )}

                {/* STEP 2 — family & branches */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="ob-family" className="block text-sm font-semibold text-text-primary">Family</label>
                      <select id="ob-family" value={draft.familyId} onChange={(e) => setDraft((d) => ({ ...d, familyId: e.target.value, primaryBranch: null, extraBranches: [] }))} className="auth-input">
                        {FAMILIES.map((f) => <option key={f.id} value={f.id}>{f.name} · {f.tagline}</option>)}
                      </select>
                    </div>
                    <fieldset>
                      <legend className="text-sm font-semibold text-text-primary">Primary branch</legend>
                      <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Primary branch">
                        {family.branches.map((b) => (
                          <button key={b.id} type="button" role="radio" aria-checked={draft.primaryBranch === b.id}
                            onClick={() => set("primaryBranch", draft.primaryBranch === b.id ? null : b.id)}
                            className={cn("auth-pick ny-chip ny-touch", draft.primaryBranch === b.id && "")}>{b.name}</button>
                        ))}
                      </div>
                      {errors.primaryBranch && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.primaryBranch}</p>}
                    </fieldset>
                    <fieldset>
                      <legend className="text-sm font-semibold text-text-primary">Other branches you belong to <span className="font-normal text-text-tertiary">(you can be in more than one)</span></legend>
                      <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Secondary branches">
                        {family.branches.filter((b) => b.id !== draft.primaryBranch).map((b) => (
                          <button key={b.id} type="button" aria-pressed={draft.extraBranches.includes(b.id)} onClick={() => toggleExtra(b.id)}
                            className={cn("auth-pick ny-chip ny-touch text-xs", draft.extraBranches.includes(b.id) && "")}>
                            {draft.extraBranches.includes(b.id) && <Check className="size-3.5" />}{b.name}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                )}

                {/* STEP 3 — relationships */}
                {step === 2 && (
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-text-secondary">Link the people closest to you — each link becomes an edge in the family graph. Skip freely; an elder can help later.</p>
                    {draft.links.length > 0 && (
                      <ul className="space-y-1.5" aria-label="Your links">
                        {draft.links.map((l, i) => {
                          const r = RELATIVES.find((x) => x.id === l.relativeId);
                          return (
                            <li key={`${l.relativeId}-${i}`} className="flex items-center justify-between gap-2 rounded-xl border border-brand-primary/25 bg-brand-primary-tint px-3.5 py-2.5 text-sm">
                              <span><strong className="font-semibold text-text-primary">{r?.label}</strong> <span className="text-text-tertiary">· {l.role}</span></span>
                              <button type="button" onClick={() => setDraft((d) => ({ ...d, links: d.links.filter((_, k) => k !== i) }))} aria-label={`Remove link to ${r?.label}`}
                                className="ny-touch grid size-8 place-items-center rounded-pill text-brand-danger hover:bg-brand-danger/10"><Trash2 className="size-4" /></button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Relationship role">
                      {LINK_ROLES.map((r) => (
                        <button key={r} type="button" aria-pressed={relRole === r} onClick={() => setRelRole(r)}
                          className={cn("auth-pick ny-chip ny-touch text-xs", relRole === r && "")}>{r}</button>
                      ))}
                    </div>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                      <input value={relQuery} onChange={(e) => setRelQuery(e.target.value)} placeholder="Search shortened name or role…" maxLength={40}
                        aria-label="Search members to link" className="auth-input auth-input--flush pl-11" autoComplete="off" />
                      <ul className="mt-1.5 space-y-1" aria-label="Matching members">
                        {relMatches.map((r) => (
                          <li key={r.id}>
                            <button type="button" onClick={() => addLink(r.id)} className="auth-family bg-surface-1 py-2 text-left hover:translate-y-0">
                              <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{r.label}</span>
                                <span className="block truncate text-[11px] text-text-tertiary">{r.role} · {r.house}</span></span>
                              <Plus className="size-4 shrink-0 text-brand-primary" aria-hidden="true" />
                            </button>
                          </li>
                        ))}
                        {relMatches.length === 0 && <li className="rounded-xl border border-dashed border-surface-3 p-3 text-center text-xs text-text-tertiary">Everyone matching is already linked.</li>}
                      </ul>
                    </div>
                  </div>
                )}

                {/* STEP 4 — comfort */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="auth-consent items-center">
                      <button type="button" role="switch" aria-checked={draft.elderMode} aria-label="Elder Mode — larger text and bigger buttons"
                        onClick={() => { const v = !draft.elderMode; set("elderMode", v); setElder(v); }}
                        className={cn("ny-touch relative h-8 w-14 shrink-0 rounded-pill transition-colors duration-300", draft.elderMode ? "bg-brand-primary" : "bg-surface-3")}>
                        <span aria-hidden="true" className={cn("absolute top-1 size-6 rounded-pill bg-surface-1 shadow transition-all duration-150", draft.elderMode ? "left-7" : "left-1")} />
                      </button>
                      <span className="text-sm font-semibold text-text-secondary">Elder Mode<span className="block text-xs font-normal text-text-tertiary">Larger text, bigger targets, calmer motion. Try it — it applies right now{elder ? " (on)" : ""}.</span></span>
                    </div>
                    <fieldset>
                      <legend className="text-sm font-semibold text-text-primary">Show money in</legend>
                      <div className="mt-2 grid gap-2 sm:grid-cols-3" role="group" aria-label="Display currency">
                        {CURRENCIES.map((c) => (
                          <button key={c.id} type="button" aria-pressed={draft.currency === c.id} onClick={() => set("currency", c.id)}
                            className={cn("auth-pick ny-touch rounded-xl border px-3 py-2.5 text-sm font-bold", draft.currency === c.id ? "border-brand-primary bg-brand-primary text-surface-0" : "border-surface-3 bg-surface-1")}>
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend className="text-sm font-semibold text-text-primary">Reach me by</legend>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2" role="group" aria-label="Communication channels">
                        {COMMS_CHANNELS.map((c) => {
                          const on = draft.channels.includes(c.id);
                          return (
                            <button key={c.id} type="button" aria-pressed={on}
                              onClick={() => set("channels", on ? draft.channels.filter((x) => x !== c.id) : [...draft.channels, c.id])}
                              className={cn("ny-touch rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition-colors", on ? "border-brand-primary bg-brand-primary-tint text-brand-primary" : "border-surface-3 text-text-secondary")}>
                              {on ? <Check className="mr-1.5 inline size-4" /> : null}{c.label}
                              <span className="block text-[11px] font-medium text-text-tertiary">{c.hint}</span>
                            </button>
                          );
                        })}
                      </div>
                      {errors.channels && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.channels}</p>}
                    </fieldset>
                  </div>
                )}

                {/* STEP 5 — money */}
                {step === 4 && (
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-text-secondary">Opt into the shared pots. Payout details stay masked, and changing them later needs an admin.</p>
                    {([["joinSacco", "Join the family Sacco?", "Save together, borrow fairly — shares from KES 200."],
                      ["joinChama", "Join the chama round?", "A merry-go-round with your branch, weekly or monthly."]] as const).map(([key, title, hint]) => (
                      <div key={key} className="auth-consent items-center">
                        <button type="button" role="switch" aria-checked={draft[key]} aria-label={title}
                          onClick={() => set(key, !draft[key])}
                          className={cn("ny-touch relative h-8 w-14 shrink-0 rounded-pill transition-colors duration-300", draft[key] ? "bg-brand-primary" : "bg-surface-3")}>
                          <span aria-hidden="true" className={cn("absolute top-1 size-6 rounded-pill bg-surface-1 shadow transition-all duration-150", draft[key] ? "left-7" : "left-1")} />
                        </button>
                        <span className="text-sm font-semibold text-text-secondary">{title}<span className="block text-xs font-normal text-text-tertiary">{hint}</span></span>
                      </div>
                    ))}
                    <fieldset>
                      <legend className="text-sm font-semibold text-text-primary">If money comes to me, put it in</legend>
                      <div className="mt-2 grid gap-2" role="group" aria-label="Default payout channel">
                        {PAYOUT_CHANNELS.map((c) => (
                          <button key={c.id} type="button" aria-pressed={draft.payout === c.id} onClick={() => set("payout", c.id)}
                            className={cn("ny-touch rounded-xl border px-3.5 py-3 text-left text-sm font-bold transition-colors", draft.payout === c.id ? "border-brand-primary bg-brand-primary-tint text-brand-primary" : "border-surface-3 text-text-secondary")}>
                            {c.label}<span className="block text-xs font-medium text-text-tertiary">{c.hint}</span>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <Link to="/auth/2fa?from=onboard" className="flex items-center gap-2.5 rounded-2xl border border-brand-accent/50 bg-brand-accent-soft/50 p-3.5 text-sm font-semibold text-[#7a5b14] hover:underline">
                      <KeyRound className="size-5 shrink-0" aria-hidden="true" /> Set your receive PIN next → so money can find you without a login.
                    </Link>
                  </div>
                )}

                {/* STEP 6 — review */}
                {step === 5 && (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-surface-1 p-3 shadow-card ring-1 ring-surface-3/60">
                      <MiniTree familyName={family.name} branchName={branchName} you={draft.preferredName} />
                      <p className="pb-1 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">Where you sit · SIMULATED preview</p>
                    </div>
                    <dl className="rounded-2xl border border-surface-3 bg-surface-1 px-4 py-2 text-sm">
                      <div className="auth-review-row"><dt className="text-text-tertiary">Name</dt><dd className="text-right font-semibold">{draft.preferredName || "—"}</dd></div>
                      <div className="auth-review-row"><dt className="text-text-tertiary">Family</dt><dd className="text-right font-semibold">{family.name} · {branchName}{draft.extraBranches.length ? ` +${draft.extraBranches.length}` : ""}</dd></div>
                      <div className="auth-review-row"><dt className="text-text-tertiary">Home</dt><dd className="text-right font-semibold">{draft.homeCounty || "—"}{draft.currentTown ? ` · now ${draft.currentTown}` : ""}</dd></div>
                      <div className="auth-review-row"><dt className="text-text-tertiary">Links</dt><dd className="text-right font-semibold">{draft.links.length ? `${draft.links.length} ${draft.links.length === 1 ? "person" : "people"}` : "None yet"}</dd></div>
                      <div className="auth-review-row"><dt className="text-text-tertiary">Comfort</dt><dd className="text-right font-semibold">{draft.currency.toUpperCase()} · {draft.elderMode ? "Elder Mode on" : "Standard"} · {draft.channels.length} channels</dd></div>
                      <div className="auth-review-row"><dt className="text-text-tertiary">Money</dt><dd className="text-right font-semibold">{draft.joinSacco ? "Sacco ✓" : "No Sacco"} · {draft.joinChama ? "Chama ✓" : "No chama"} · {draft.payout}</dd></div>
                    </dl>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* nav */}
            <div className="mt-6 flex items-center gap-2.5">
              {step > 0 && (
                <button type="button" onClick={() => go(step - 1)} className="ny-btn-ghost ny-touch text-sm"><ArrowLeft className="size-4" /> Back</button>
              )}
              {step < 5 ? (
                <button type="button" onClick={next} className="ny-btn-gold ny-touch flex-1 text-sm">Continue <ArrowRight className="size-4" /></button>
              ) : (
                <button type="button" onClick={finish} disabled={finishing} className="ny-btn-gold ny-touch flex-1 text-sm disabled:cursor-wait disabled:opacity-80">
                  {finishing ? (<><Loader2 className="size-4 animate-spin" /> Planting you…</>) : (<><Users className="size-4" /> Finish — join the tree</>)}
                </button>
              )}
            </div>
            <button type="button" onClick={saveExit} className="ny-touch mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-pill px-4 py-2.5 text-xs font-bold text-text-tertiary hover:text-brand-primary">
              <Save className="size-4" aria-hidden="true" /> Save & continue later
            </button>
          </div>
        )}
      </main>
      <Toast message={toast} onClear={() => setToast("")} />
    </AuthShell>
  );
}
