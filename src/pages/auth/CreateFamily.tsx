/* ── A-4 · Family / Lineage Creator (`/auth/create-family`) ───────────────────
   Stylesheet: src/styles/pages/auth-create-family.css — for families not yet on
   Nalyanya. Name the root ancestor, raise the first branch, sketch the origin
   story, appoint the heads. Create resolves SIMULATED, stores the seed locally,
   and hands off to A-3 onboarding.                                          */

import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Crown, ImagePlus, Loader2, MapPin, Search, Sprout } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import Toast from "../../components/home/Toast";
import { BRANCH_COLORS, CREATE_SLIDES, CREATE_STEPS, CREATE_VISUAL, CRESTS, CUSTOM_FAMILY_KEY, ORIGIN_COUNTIES, TIMELINE_SEEDS, type CrestOption } from "../../data/auth/create-family";
import { phoneOK } from "../../lib/validation";
import { usePageStyles } from "../../lib/usePageStyles";
import { usePrefersReducedMotion } from "../../lib/hooks";
import { cn } from "../../utils/cn";
import pageCss from "../../styles/pages/auth-create-family.css?inline";

function CrestGlyph({ glyph, fg }: { glyph: CrestOption["glyph"]; fg: string }) {
  const common = { fill: "none", stroke: fg, strokeWidth: 2.2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (glyph) {
    case "tree": return (<svg viewBox="0 0 32 32" className="auth-crest-draw size-9" aria-hidden="true"><path d="M16 26V14M16 14C10 14 8 10 8 7c4 0 6 1 8 3 2-2 4-3 8-3 0 3-2 7-8 7Z" {...common} /><path d="M16 18c-3 0-5-1-6-3M16 18c3 0 5-1 6-3M11 26h10" {...common} /></svg>);
    case "sun": return (<svg viewBox="0 0 32 32" className="auth-crest-draw size-9" aria-hidden="true"><circle cx="16" cy="17" r="6" {...common} /><path d="M16 4v4M6 8l3 3M26 8l-3 3M4 17h5M23 17h5M7 27c3-2 6-2 9 0 3-2 6-2 9 0" {...common} /></svg>);
    case "shield": return (<svg viewBox="0 0 32 32" className="auth-crest-draw size-9" aria-hidden="true"><path d="M16 4 25 8v8c0 6-4 10-9 12-5-2-9-6-9-12V8Z" {...common} /><path d="M16 10v12M11 14l10 6M21 14 11 20" {...common} /></svg>);
    case "river": return (<svg viewBox="0 0 32 32" className="auth-crest-draw size-9" aria-hidden="true"><path d="M6 8c4 3 8-1 10 2s4 6 10 4M6 16c4 3 8-1 10 2s4 6 10 4M6 24c4 3 8-1 10 2s4 6 10 4" {...common} /></svg>);
    case "drum": return (<svg viewBox="0 0 32 32" className="auth-crest-draw size-9" aria-hidden="true"><ellipse cx="16" cy="8" rx="9" ry="4" {...common} /><path d="M7 8v14c0 2 4 4 9 4s9-2 9-4V8M11 14c2 1 8 1 10 0" {...common} /></svg>);
    case "horn": return (<svg viewBox="0 0 32 32" className="auth-crest-draw size-9" aria-hidden="true"><path d="M8 24C8 14 14 8 24 7c1 0 1 2 0 2-8 1-13 6-13 15Z" {...common} /><path d="M8 24c-2 1-3 3-3 5M20 9l3-2" {...common} /></svg>);
    case "star": return (<svg viewBox="0 0 32 32" className="auth-crest-draw size-9" aria-hidden="true"><path d="M16 5l2.6 6.2 6.4.5-4.9 4.3 1.5 6.5L16 18.7l-5.6 3.8 1.5-6.5L7 11.7l6.4-.5Z" {...common} /><path d="M6 27h20" {...common} /></svg>);
    case "knot": return (<svg viewBox="0 0 32 32" className="auth-crest-draw size-9" aria-hidden="true"><rect x="7" y="7" width="18" height="18" rx="9" {...common} /><path d="M12 16h8M16 12v8" {...common} /></svg>);
  }
}

export default function CreateFamily() {
  usePageStyles("auth-create-family", pageCss);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reduced = usePrefersReducedMotion();
  const seed = (params.get("seed") ?? "").trim();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  // identity
  const [name, setName] = useState(seed);
  const [altSpellings, setAltSpellings] = useState("");
  const [motto, setMotto] = useState("");
  const [crest, setCrest] = useState("acacia");
  // root + branch
  const [rootName, setRootName] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [deceased, setDeceased] = useState(false);
  const [deathYear, setDeathYear] = useState("");
  const [originTown, setOriginTown] = useState("");
  const [originCounty, setOriginCounty] = useState("");
  const [spouses, setSpouses] = useState("");
  const [bio, setBio] = useState("");
  const [branchName, setBranchName] = useState("");
  const [founder, setFounder] = useState("");
  const [branchColor, setBranchColor] = useState<string>(BRANCH_COLORS[0]);
  // story + heads
  const [timeline, setTimeline] = useState<Record<string, string>>({});
  const [headName, setHeadName] = useState("");
  const [coAdmin, setCoAdmin] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shake, setShake] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { document.title = "Start your family — Nalyanya"; }, []);
  useEffect(() => { if (seed) setName(seed); }, [seed]);
  useEffect(() => { if (!shake) return; const t = window.setTimeout(() => setShake(false), 450); return () => window.clearTimeout(t); }, [shake]);

  const crestOpt = CRESTS.find((c) => c.id === crest) ?? CRESTS[0];
  const thisYear = new Date().getFullYear();

  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); setErrors({}); };

  const validate = (s: number): boolean => {
    const next: Record<string, string> = {};
    if (s === 0 && name.trim().length < 2) next.name = "Give the family its name.";
    if (s === 1) {
      if (rootName.trim().length < 3) next.rootName = "Name the root ancestor in full.";
      const by = Number(birthYear);
      if (!birthYear || !Number.isInteger(by) || by < 1850 || by > thisYear) next.birthYear = `A year between 1850 and ${thisYear}.`;
      if (deceased) {
        const dy = Number(deathYear);
        if (!deathYear || !Number.isInteger(dy) || dy < by || dy > thisYear) next.deathYear = "After the birth year, please.";
      }
      if (!originTown.trim()) next.originTown = "Which town or village?";
      if (!originCounty) next.originCounty = "Pick the county.";
      if (branchName.trim().length < 2) next.branchName = "Name the first branch.";
      if (founder.trim().length < 3) next.founder = "Who founded this branch?";
    }
    if (s === 2) {
      if (headName.trim().length < 3) next.headName = "Who leads as Family Head? (Usually you.)";
      if (coAdmin.trim() && !phoneOK(coAdmin)) next.coAdmin = "Use a Kenyan number, like 0712 345 678 — or leave it empty.";
    }
    setErrors(next);
    if (Object.keys(next).length) setShake(true);
    return Object.keys(next).length === 0;
  };

  const create = () => {
    if (!validate(2)) return;
    const finish = () => {
      try {
        localStorage.setItem(CUSTOM_FAMILY_KEY, JSON.stringify({
          name: name.trim(), motto: motto.trim(), crest, rootName: rootName.trim(), branchName: branchName.trim(), branchColor,
          createdAt: new Date().toISOString(),
        }));
      } catch { /* private mode */ }
      setToast(`${name.trim()} is planted — SIMULATED. Now place yourself in it.`);
      navigate("/auth/onboard?family=new");
    };
    if (reduced) finish();
    else { setCreating(true); window.setTimeout(finish, 900); }
  };

  return (
    <AuthShell kicker="A-4 · Create family" backTo="/auth/signup" visual={CREATE_VISUAL} slides={CREATE_SLIDES}>
      <main className="page-auth-create-family">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">Start your family · {step + 1} of 3</span>
          <span className="ny-sim-badge">Simulated</span>
        </div>
        <h1 className="ny-heading mt-2 text-3xl sm:text-4xl">Plant <em className="font-medium italic text-brand-secondary">{name.trim() || "your family"}</em> on Nalyanya.</h1>
        <p className="mt-2 flex items-start gap-2 rounded-2xl border border-surface-3 bg-surface-1 p-3 text-[13px] leading-relaxed text-text-secondary">
          <Search className="mt-0.5 size-4 shrink-0 text-brand-primary" aria-hidden="true" />
          <span>Only do this if your family isn't already listed. <Link to={`/auth/signup${name.trim() ? `?q=${encodeURIComponent(name.trim())}` : ""}`} className="font-bold text-brand-primary hover:underline">Search first →</Link></span>
        </p>

        <ol className="mt-4 flex items-start justify-between" aria-label="Creator steps">
          {CREATE_STEPS.map((label, i) => (
            <li key={label} className={cn("auth-step w-20", i < step && "is-done", i === step && "is-live")} aria-current={i === step ? "step" : undefined}>
              <span className="auth-step__dot" aria-hidden="true">{i < step ? <Check className="size-4" strokeWidth={3} /> : i + 1}</span>
              <span className="text-center text-[10px] font-bold uppercase tracking-[0.08em] text-text-tertiary">{label}</span>
            </li>
          ))}
        </ol>

        <div className={cn("mt-5", shake && "auth-shake")}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={step} initial={reduced ? {} : { opacity: 0, x: 40 * dir }} animate={{ opacity: 1, x: 0 }} exit={reduced ? {} : { opacity: 0, x: -28 * dir }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>

              {step === 0 && (
                <div className="space-y-4">
                  {/* live crest preview */}
                  <div className="flex items-center gap-4 rounded-2xl border border-surface-3 bg-surface-1 p-4">
                    <span className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl" style={{ background: crestOpt.bg }} aria-hidden="true">
                      <svg viewBox="0 0 80 80" className="auth-preview-ring absolute inset-0 size-full"><circle cx="40" cy="40" r="34" fill="none" stroke={crestOpt.fg} strokeWidth="1.5" strokeDasharray="3 6" opacity="0.7" /></svg>
                      <CrestGlyph glyph={crestOpt.glyph} fg={crestOpt.fg} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-display text-2xl font-semibold">{name.trim() || "Your family"}</span>
                      <span className="block truncate text-sm italic text-text-tertiary">{motto.trim() ? `“${motto.trim()}”` : "Add a motto — optional, beloved."}</span>
                      <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">Crest · {crestOpt.label}</span>
                    </span>
                  </div>

                  <div>
                    <label htmlFor="cf-name" className="block text-sm font-semibold text-text-primary">Family / lineage name</label>
                    <input id="cf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nalyanya" maxLength={48}
                      className={cn("auth-input", errors.name && "is-invalid")} aria-invalid={!!errors.name} />
                    {errors.name && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.name}</p>}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cf-alt" className="block text-sm font-semibold text-text-primary">Other spellings <span className="font-normal text-text-tertiary">(optional)</span></label>
                      <input id="cf-alt" value={altSpellings} onChange={(e) => setAltSpellings(e.target.value)} placeholder="e.g. Nalyaanya, Nalya" maxLength={80} className="auth-input" />
                    </div>
                    <div>
                      <label htmlFor="cf-motto" className="block text-sm font-semibold text-text-primary">Motto <span className="font-normal text-text-tertiary">(optional)</span></label>
                      <input id="cf-motto" value={motto} onChange={(e) => setMotto(e.target.value)} placeholder="e.g. Imarishi — we stand firm" maxLength={80} className="auth-input" />
                    </div>
                  </div>

                  <fieldset>
                    <legend className="text-sm font-semibold text-text-primary">Pick a crest</legend>
                    <div className="mt-2 grid grid-cols-4 gap-2" role="group" aria-label="Heritage crest">
                      {CRESTS.map((c) => (
                        <button key={c.id} type="button" aria-pressed={crest === c.id} onClick={() => setCrest(c.id)} aria-label={`Crest: ${c.label}`}
                          className="auth-crest ny-touch">
                          <span className="grid size-12 place-items-center rounded-xl" style={{ background: c.bg }}><CrestGlyph glyph={c.glyph} fg={c.fg} /></span>
                          <span className="text-[10px] font-bold text-text-secondary">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <button type="button" onClick={() => setToast("Uploads land in Phase 2 — the crest picker above is yours for now.")}
                    className="ny-touch inline-flex items-center gap-2 rounded-pill border border-dashed border-surface-3 px-4 py-2.5 text-xs font-bold text-text-tertiary hover:border-brand-primary/40 hover:text-brand-primary">
                    <ImagePlus className="size-4" aria-hidden="true" /> Upload your own (SIMULATED stub)
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-text-primary"><Crown className="size-4 text-brand-accent" aria-hidden="true" /> The root ancestor — generation 1</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="cf-root" className="block text-sm font-semibold text-text-primary">Full names</label>
                      <input id="cf-root" value={rootName} onChange={(e) => setRootName(e.target.value)} placeholder="e.g. Mzee Victor Nalyanya" maxLength={60}
                        className={cn("auth-input", errors.rootName && "is-invalid")} aria-invalid={!!errors.rootName} />
                      {errors.rootName && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.rootName}</p>}
                    </div>
                    <div>
                      <label htmlFor="cf-by" className="block text-sm font-semibold text-text-primary">Birth year</label>
                      <input id="cf-by" value={birthYear} onChange={(e) => setBirthYear(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="e.g. 1938"
                        className={cn("auth-input", errors.birthYear && "is-invalid")} aria-invalid={!!errors.birthYear} />
                      {errors.birthYear && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.birthYear}</p>}
                    </div>
                    <div>
                      <span id="cf-dec" className="block text-sm font-semibold text-text-primary">Deceased?</span>
                      <div className="mt-1.5 flex gap-2" role="group" aria-labelledby="cf-dec">
                        {([false, true] as const).map((v) => (
                          <button key={String(v)} type="button" aria-pressed={deceased === v} onClick={() => setDeceased(v)}
                            className={cn("auth-pick ny-chip ny-touch flex-1 justify-center", deceased === v && "")}>{v ? "Yes, rested" : "Living"}</button>
                        ))}
                      </div>
                    </div>
                    {deceased && (
                      <div>
                        <label htmlFor="cf-dy" className="block text-sm font-semibold text-text-primary">Rest year</label>
                        <input id="cf-dy" value={deathYear} onChange={(e) => setDeathYear(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="e.g. 2001"
                          className={cn("auth-input", errors.deathYear && "is-invalid")} aria-invalid={!!errors.deathYear} />
                        {errors.deathYear && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.deathYear}</p>}
                      </div>
                    )}
                    <div>
                      <label htmlFor="cf-town" className="block text-sm font-semibold text-text-primary">Origin town / village</label>
                      <input id="cf-town" value={originTown} onChange={(e) => setOriginTown(e.target.value)} placeholder="e.g. Misikhu" maxLength={48}
                        className={cn("auth-input", errors.originTown && "is-invalid")} aria-invalid={!!errors.originTown} />
                      {errors.originTown && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.originTown}</p>}
                    </div>
                    <div>
                      <label htmlFor="cf-county" className="block text-sm font-semibold text-text-primary">Origin county</label>
                      <select id="cf-county" value={originCounty} onChange={(e) => setOriginCounty(e.target.value)}
                        className={cn("auth-input", errors.originCounty && "is-invalid")} aria-invalid={!!errors.originCounty}>
                        <option value="">Choose…</option>
                        {ORIGIN_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.originCounty && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.originCounty}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="cf-spouse" className="block text-sm font-semibold text-text-primary">Spouse(s) <span className="font-normal text-text-tertiary">(optional)</span></label>
                      <input id="cf-spouse" value={spouses} onChange={(e) => setSpouses(e.target.value)} placeholder="Names, comma-separated" maxLength={120} className="auth-input" />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="cf-bio" className="block text-sm font-semibold text-text-primary">A line or two about them <span className="font-normal text-text-tertiary">(optional)</span></label>
                      <textarea id="cf-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={2} maxLength={400} placeholder="What should every grandchild know?"
                        className="auth-input resize-y" />
                    </div>
                  </div>

                  <fieldset className="rounded-2xl border border-surface-3 bg-surface-1 p-4">
                    <legend className="px-2 text-sm font-bold text-text-primary"><Sprout className="mr-1.5 inline size-4 text-brand-primary" aria-hidden="true" />Founding branch</legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="cf-branch" className="block text-sm font-semibold text-text-primary">Branch name</label>
                        <input id="cf-branch" value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="e.g. Bungoma branch" maxLength={48}
                          className={cn("auth-input", errors.branchName && "is-invalid")} aria-invalid={!!errors.branchName} />
                        {errors.branchName && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.branchName}</p>}
                      </div>
                      <div>
                        <label htmlFor="cf-founder" className="block text-sm font-semibold text-text-primary">Founded by <span className="font-normal text-text-tertiary">(a child of the root)</span></label>
                        <input id="cf-founder" value={founder} onChange={(e) => setFounder(e.target.value)} placeholder="e.g. Wafula Nalyanya" maxLength={60}
                          className={cn("auth-input", errors.founder && "is-invalid")} aria-invalid={!!errors.founder} />
                        {errors.founder && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.founder}</p>}
                      </div>
                    </div>
                    <fieldset className="mt-3">
                      <legend className="text-xs font-semibold text-text-secondary">Branch colour</legend>
                      <div className="mt-2 flex gap-2.5" role="group" aria-label="Branch colour">
                        {BRANCH_COLORS.map((c) => (
                          <button key={c} type="button" aria-pressed={branchColor === c} aria-label={`Branch colour ${c}`} onClick={() => setBranchColor(c)}
                            className="auth-swatch ny-touch size-9 rounded-full" style={{ background: c, color: c }} />
                        ))}
                      </div>
                    </fieldset>
                  </fieldset>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <fieldset>
                    <legend className="flex items-center gap-2 text-sm font-bold text-text-primary"><MapPin className="size-4 text-brand-secondary" aria-hidden="true" /> Origin story <span className="font-medium text-text-tertiary">(a line each — becomes your About page seed)</span></legend>
                    <div className="mt-2 space-y-2">
                      {TIMELINE_SEEDS.map((t) => (
                        <div key={t.id}>
                          <label htmlFor={`cf-tl-${t.id}`} className="sr-only">{t.label}</label>
                          <input id={`cf-tl-${t.id}`} value={timeline[t.id] ?? ""} onChange={(e) => setTimeline((s) => ({ ...s, [t.id]: e.target.value }))}
                            placeholder={`${t.label} — ${t.hint}`} maxLength={140} className="auth-input" />
                        </div>
                      ))}
                    </div>
                  </fieldset>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cf-head" className="block text-sm font-semibold text-text-primary">Family Head <span className="font-normal text-text-tertiary">(usually you)</span></label>
                      <input id="cf-head" value={headName} onChange={(e) => setHeadName(e.target.value)} placeholder="Your full name" maxLength={60}
                        className={cn("auth-input", errors.headName && "is-invalid")} aria-invalid={!!errors.headName} />
                      {errors.headName && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.headName}</p>}
                    </div>
                    <div>
                      <label htmlFor="cf-co" className="block text-sm font-semibold text-text-primary">Co-admin phone <span className="font-normal text-text-tertiary">(optional)</span></label>
                      <input id="cf-co" type="tel" inputMode="tel" value={coAdmin} onChange={(e) => setCoAdmin(e.target.value)} placeholder="0712 345 678"
                        className={cn("auth-input", errors.coAdmin && "is-invalid")} aria-invalid={!!errors.coAdmin} />
                      {errors.coAdmin && <p role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.coAdmin}</p>}
                    </div>
                  </div>
                  <p className="rounded-2xl bg-brand-primary-tint p-3.5 text-[13px] leading-relaxed text-text-secondary">
                    You enroll as <strong className="text-text-primary">Family Head</strong>. The council of elders can be added later in Settings — nothing here is final until your family confirms it.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center gap-2.5">
            {step > 0 && <button type="button" onClick={() => go(step - 1)} className="ny-btn-ghost ny-touch text-sm"><ArrowLeft className="size-4" /> Back</button>}
            {step < 2
              ? <button type="button" onClick={() => validate(step) && go(step + 1)} className="ny-btn-gold ny-touch flex-1 text-sm">Continue <ArrowRight className="size-4" /></button>
              : <button type="button" onClick={create} disabled={creating} className="ny-btn-gold ny-touch flex-1 text-sm disabled:cursor-wait disabled:opacity-80">
                  {creating ? (<><Loader2 className="size-4 animate-spin" /> Planting…</>) : (<><Sprout className="size-4" /> Create family</>)}
                </button>}
          </div>
          <p className="mt-3 text-center text-[11px] font-semibold text-text-tertiary">SIMULATED in this build — the seed is kept in this browser only.</p>
        </div>
      </main>
      <Toast message={toast} onClear={() => setToast("")} />
    </AuthShell>
  );
}
