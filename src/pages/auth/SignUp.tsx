/* ── A-1 · Sign Up (`/auth/signup`) ──────────────────────────────────────────
   Stylesheet: src/styles/pages/auth-signup.css — one job only: register a
   new member, family first, verification last. Frontend-only: the submit
   resolves to a clearly-labeled SIMULATED state with a ticket reference and
   hands off to A-7 (/auth/verify-otp) carrying the typed contact.           */

import { useEffect, useId, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle2, Eye, EyeOff, Loader2, Search, ShieldCheck, Users, X } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import FamilyChooser from "../../components/auth/FamilyChooser";
import Toast from "../../components/home/Toast";
import { Crest } from "../../components/home/Logo";
import {
  CONSENTS, RELATIVES, RELATIONSHIP_PICKS, SIMULATED_CODE, type Family,
} from "../../data/auth/families";
import { emailOK, makeRef, passwordIssue, phoneOK } from "../../lib/validation";
import { usePageStyles } from "../../lib/usePageStyles";
import { usePrefersReducedMotion } from "../../lib/hooks";
import { cn } from "../../utils/cn";
import pageCss from "../../styles/pages/auth-signup.css?inline";
import { SIGNUP_SLIDES, SIGNUP_VISUAL } from "../../data/auth/signup";

const STEPS = ["Family", "You", "Verify"];

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex w-full items-start justify-between" aria-label="Sign-up steps">
      {STEPS.map((label, i) => (
        <li key={label} className={cn("auth-step w-16 sm:w-20", i + 1 < current && "is-done", i + 1 === current && "is-live")} aria-current={i + 1 === current ? "step" : undefined}>
          <span className="auth-step__dot" aria-hidden="true">{i + 1 < current ? <Check className="size-4" strokeWidth={3} /> : i + 1}</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-text-tertiary sm:text-xs">{label}</span>
        </li>
      ))}
    </ol>
  );
}

function Field({ id, label, error, hint, className = "", children }: {
  id: string; label: string; error?: string; hint?: string; className?: string; children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-text-primary">{label}</label>
      {children}
      {error ? <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{error}</p>
        : hint ? <p className="mt-1.5 text-xs text-text-tertiary">{hint}</p> : null}
    </div>
  );
}

function passwordScore(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return score as 0 | 1 | 2 | 3 | 4;
}

const SCORE_LABEL = ["Too short", "Easy to guess", "Getting there", "Strong", "Very strong"];

export default function SignUp() {
  usePageStyles("auth-signup", pageCss);
  const id = useId();
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();

  const [family, setFamily] = useState<Family | null>(null);
  const [branch, setBranch] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [relationship, setRelationship] = useState<string | null>(null);
  const [relQuery, setRelQuery] = useState("");
  const [linked, setLinked] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [reference, setReference] = useState("");
  const [toast, setToast] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => { document.title = "Sign up — Nalyanya · Choose your family"; }, []);

  const score = passwordScore(password);
  const relMatches = useMemo(() => {
    const q = relQuery.trim().toLowerCase();
    if (!q) return RELATIVES.slice(0, 4);
    return RELATIVES.filter((r) => [r.label, r.role, r.house, r.county].join(" ").toLowerCase().includes(q)).slice(0, 4);
  }, [relQuery]);

  useEffect(() => { if (!shake) return; const t = window.setTimeout(() => setShake(false), 450); return () => window.clearTimeout(t); }, [shake]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    const next: Record<string, string> = {};
    if (!family) next.family = "Choose your family first — or create it.";
    if (fullName.trim().length < 3) next.fullName = "Add your full name.";
    if (!phoneOK(phone)) next.phone = "Use a Kenyan number, like 0712 345 678.";
    if (!emailOK(email)) next.email = "That email doesn't look complete.";
    const pwIssue = passwordIssue(password);
    if (pwIssue) next.password = pwIssue;
    else if (confirm !== password) next.confirm = "Both passwords should match.";
    CONSENTS.forEach((c) => { if (!checks[c.id]) next[`check-${c.id}`] = "We need your yes on this one."; });

    setErrors(next);
    if (Object.keys(next).length) { setShake(true); return; }

    const finish = () => {
      const ref = makeRef("NY-ACCT");
      setReference(ref);
      setState("done");
      setToast(`Check your phone — SIMULATED code ${SIMULATED_CODE}.`);
      window.setTimeout(() => {
        const sendTo = encodeURIComponent(phone.trim());
        navigate(`/auth/verify-otp?context=signup&to=${sendTo}&ref=${encodeURIComponent(ref)}`);
      }, 2000);
    };
    if (reduced) finish();
    else { setState("sending"); window.setTimeout(finish, 800); }
  };

  return (
    <AuthShell
      kicker="New here? Let's place you"
      backTo="/"
      visual={SIGNUP_VISUAL}
      slides={SIGNUP_SLIDES}
    >
      <main className="page-auth-signup">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">Create account · 1 of 2</span>
          <span className="ny-sim-badge">Simulated</span>
        </div>
        <h1 className="ny-heading mt-2 text-3xl sm:text-4xl">Choose your family. <span className="auth-title-accent">Then tell us who you are.</span></h1>
        <p className="ny-prose mt-2 text-sm leading-relaxed">Two minutes now, verification after. Everything else lands in onboarding.</p>

        <div className="mt-5"><Stepper current={state === "done" ? 3 : 2} /></div>

        <AnimatePresence mode="wait" initial={false}>
          {state === "done" ? (
            <motion.div key="done" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="auth-success mt-6 p-6 text-center">
              <CheckCircle2 className="mx-auto size-9 text-brand-success" aria-hidden="true" />
              <p className="mt-2 font-display text-2xl font-semibold text-brand-primary">Karibu — welcome aboard.</p>
              <p className="ny-num mt-2 text-sm font-bold tracking-[0.12em] text-brand-primary">{reference}</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
                In this frontend-only phase nothing was created and nothing was sent. The verification screen shows a SIMULATED code <span className="ny-num font-bold">{SIMULATED_CODE}</span>.
              </p>
              <p className="mt-3 text-xs font-semibold text-text-tertiary">Taking you to verification…</p>
              <Link to={`/auth/verify-otp?context=signup&to=${encodeURIComponent(phone.trim())}&ref=${encodeURIComponent(reference)}`} className="ny-btn-primary mt-4 inline-flex">Continue → verification</Link>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} noValidate className={cn("mt-5 space-y-5", shake && "auth-shake")}>
              <FamilyChooser chosen={family} branch={branch} onFamily={(f) => { setFamily(f); setErrors((e) => ({ ...e, family: "" })); }} onBranch={setBranch} autoFocus />
              {errors.family && <p role="alert" className="-mt-3 text-xs font-semibold text-brand-danger">{errors.family}</p>}

              {/* details appear once a family is chosen */}
              {family && (
                <fieldset className="space-y-4 border-t border-surface-3/70 pt-5">
                  <legend className="sr-only">Your details for {family.name}</legend>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Crest className="h-7 w-7" />
                    <p className="text-sm font-bold text-text-primary">{family.name} <span className="font-medium text-text-tertiary">· you join the{branch ? ` ${family.branches.find((b) => b.id === branch)?.name ?? ""} branch` : ""}</span></p>
                  </div>

                  <Field id={`${id}-name`} label="Your full name" error={errors.fullName}>
                    <input id={`${id}-name`} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" placeholder="e.g. Faith Chebet Nalyanya" maxLength={60}
                      className={cn("auth-input", errors.fullName && "is-invalid")} aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? `${id}-name-err` : undefined} />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id={`${id}-phone`} label="Phone (M-Pesa lives here)" error={errors.phone} hint="Only visible to the family office.">
                      <input id={`${id}-phone`} type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678"
                        className={cn("auth-input", errors.phone && "is-invalid")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? `${id}-phone-err` : undefined} />
                    </Field>
                    <Field id={`${id}-email`} label="Email" error={errors.email}>
                      <input id={`${id}-email`} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                        className={cn("auth-input", errors.email && "is-invalid")} aria-invalid={!!errors.email} aria-describedby={errors.email ? `${id}-email-err` : undefined} />
                    </Field>
                  </div>

                  <Field id={`${id}-password`} label="Choose a password" error={errors.password} hint={!errors.password && password ? SCORE_LABEL[score] : "8+ characters, a letter and a number."}>
                    <div className="relative">
                      <input id={`${id}-password`} type={showPw ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters"
                        className={cn("auth-input pr-12", errors.password && "is-invalid")} aria-invalid={!!errors.password} aria-describedby={errors.password ? `${id}-password-err` : undefined} />
                      <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"} aria-pressed={showPw}
                        className="ny-touch absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-pill text-text-tertiary hover:bg-surface-2 hover:text-brand-primary">
                        {showPw ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                      </button>
                    </div>
                    <div className="auth-meter mt-2" data-score={score} role="img" aria-label={`Password strength: ${SCORE_LABEL[score]}`}><span /><span /><span /><span /></div>
                  </Field>

                  <Field id={`${id}-confirm`} label="Same password again" error={errors.confirm}>
                    <input id={`${id}-confirm`} type={showPw ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Type it once more"
                      className={cn("auth-input", errors.confirm && "is-invalid")} aria-invalid={!!errors.confirm} aria-describedby={errors.confirm ? `${id}-confirm-err` : undefined} />
                  </Field>

                  {/* relationship seed */}
                  <fieldset>
                    <legend className="text-sm font-semibold text-text-primary">Who are you in this family? <span className="font-normal text-text-tertiary">(optional)</span></legend>
                    <div className="auth-rel-grid mt-2" role="group" aria-label="Your relationship to the family">
                      {RELATIONSHIP_PICKS.map((r) => (
                        <button key={r} type="button" aria-pressed={relationship === r} onClick={() => setRelationship(relationship === r ? null : r)}
                          className="auth-pick ny-chip ny-touch justify-center border-surface-3 bg-surface-1 hover:border-brand-primary/40">
                          {r}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {/* optional link to a seeded relative */}
                  <div>
                    <label htmlFor={`${id}-link`} className="block text-sm font-semibold text-text-primary">Link me to a member <span className="font-normal text-text-tertiary">(optional)</span></label>
                    {linked ? (
                      <p className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-brand-primary/25 bg-brand-primary-tint px-4 py-3 text-sm">
                        <span className="font-semibold text-brand-primary">Linked to {linked} <span className="block text-[11px] font-medium text-text-secondary">You can adjust this in onboarding.</span></span>
                        <button type="button" onClick={() => setLinked(null)} aria-label="Remove link" className="ny-touch grid size-9 place-items-center rounded-pill text-brand-primary hover:bg-brand-primary/10"><X className="size-5" /></button>
                      </p>
                    ) : (
                      <div className="relative mt-1.5">
                        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                        <input id={`${id}-link`} value={relQuery} onChange={(e) => setRelQuery(e.target.value)} placeholder="Search a shortened name or role…" maxLength={40}
                          className="auth-input auth-input--flush pl-11" autoComplete="off" role="combobox" aria-expanded="false" aria-controls={`${id}-rel`} aria-autocomplete="list" />
                        <ul id={`${id}-rel`} className="mt-1.5 space-y-1" aria-label="Matching relatives">
                          {relMatches.map((r) => (
                            <li key={r.id}>
                              <button type="button" onClick={() => { setLinked(r.label); setRelQuery(""); }}
                                className="auth-family bg-surface-1 py-2 text-left hover:translate-y-0">
                                <span className="min-w-0"><span className="block text-sm font-semibold text-text-primary">{r.label}</span>
                                  <span className="block truncate text-[11px] text-text-tertiary">{r.role} · {r.house} · {r.county}</span></span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* consents */}
                  <div className="space-y-2" role="group" aria-label="Consents">
                    {CONSENTS.map((c) => (
                      <label key={c.id} className="auth-consent">
                        <input type="checkbox" checked={!!checks[c.id]} onChange={(e) => setChecks((s) => ({ ...s, [c.id]: e.target.checked }))}
                          className="mt-0.5 size-5 shrink-0 accent-brand-primary" aria-describedby={errors[`check-${c.id}`] ? `c-${c.id}-err` : undefined} />
                        <span>
                          <span className="block text-sm font-bold text-text-primary">{c.title}</span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-text-secondary">{c.copy}</span>
                          {errors[`check-${c.id}`] && <span id={`c-${c.id}-err`} role="alert" className="mt-1 block text-xs font-semibold text-brand-danger">{errors[`check-${c.id}`]}</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <button type="submit" disabled={state === "sending"}
                className="ny-btn-gold ny-touch w-full text-base disabled:cursor-wait disabled:opacity-80">
                {state === "sending"
                  ? (<><Loader2 className="size-5 animate-spin" aria-hidden="true" />Creating your place…</>)
                  : (<><Users className="size-5" aria-hidden="true" />Create my account</>)}
              </button>
              <p className="flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-text-tertiary"><ShieldCheck className="size-4 text-brand-primary" aria-hidden="true" />Nothing submits in this build — the checkmark and reference are SIMULATED.</p>

              <p className="border-t border-surface-3/60 pt-4 text-center text-sm text-text-secondary">
                Already have an account?{" "}
                <Link to="/signin" className="font-bold text-brand-primary hover:underline">Sign in →</Link>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </main>
      <Toast message={toast} onClear={() => setToast("")} />
    </AuthShell>
  );
}
