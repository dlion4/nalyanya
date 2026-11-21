/* ── A-2 · Sign In (`/signin`, spec: /auth/signin) ───────────────────────────
   Stylesheet: src/styles/pages/auth-signin.css — family first, then
   credentials, elder shortcut in reach. Submit resolves to a clearly-labeled
   SIMULATED success; no password is checked in this build.                  */

import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, LogIn, X } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import FamilyChooser from "../../components/auth/FamilyChooser";
import SampleQR from "../../components/auth/SampleQR";
import Toast from "../../components/home/Toast";
import { FAMILIES, SIMULATED_CODE, type Family } from "../../data/auth/families";
import { SIGNIN_ELDER_STEPS, SIGNIN_SAMPLE_LINK, SIGNIN_SLIDES, SIGNIN_VISUAL } from "../../data/auth/signin";
import { usePageStyles } from "../../lib/usePageStyles";
import { useElderMode, usePrefersReducedMotion } from "../../lib/hooks";
import { cn } from "../../utils/cn";
import pageCss from "../../styles/pages/auth-signin.css?inline";

const LAST_KEY = "ny-last-family";
const RECENT_KEY = "ny-recent-families";

function readLast(): { id: string; branch: string | null } | null {
  try { const raw = localStorage.getItem(LAST_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function readRecent(): string[] {
  try { const raw = localStorage.getItem(RECENT_KEY); const list = raw ? (JSON.parse(raw) as string[]) : []; return Array.isArray(list) ? list.slice(0, 3) : []; } catch { return []; }
}
function persistFamily(id: string) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ id, branch: null }));
    const recent = [id, ...readRecent().filter((x) => x !== id)];
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch { /* private mode */ }
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-text-primary">{label}</label>
      {children}
      {error ? <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{error}</p>
        : hint ? <p className="mt-1.5 text-xs text-text-tertiary">{hint}</p> : null}
    </div>
  );
}

/* the elder shortcut — an explainer modal, never a real link */
function ElderLinkModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="ny-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal="true" aria-labelledby="elder-title"
            initial={{ opacity: 0, y: 22, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.26 }}
            className="ny-card w-full max-w-md rounded-3xl p-6 shadow-panel" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h2 id="elder-title" className="font-display text-2xl font-semibold leading-tight">Logging in for an elder?</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="ny-touch grid size-10 shrink-0 place-items-center rounded-pill border border-surface-3 text-text-secondary hover:bg-surface-2"><X className="size-5" /></button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">They don't need a password, an account or even this app. A relative sends one link; the elder taps it and enters their own 4-digit PIN.</p>
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
              <SampleQR seed="NY-RCV-7K2Q" size={148} />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-tertiary">Sample receive link</p>
                <p className="ny-num mt-1 break-all rounded-xl bg-surface-2 px-3 py-2 text-sm font-bold text-brand-primary">{SIGNIN_SAMPLE_LINK}</p>
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-text-secondary">
                  {SIGNIN_ELDER_STEPS.map((s) => <li key={s}>{s}</li>)}
                </ol>
              </div>
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-text-tertiary"><span className="ny-sim-badge">Simulated sample</span> No link exists in this build.</p>
            <button type="button" onClick={onClose} className="ny-btn-ghost mt-4 w-full text-sm">Got it</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SignIn() {
  usePageStyles("auth-signin", pageCss);
  const id = useId();
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();
  const { mode: elder } = useElderMode();

  const [family, setFamily] = useState<Family | null>(null);
  const [branch, setBranch] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [remember, setRemember] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState("");
  const [elderOpen, setElderOpen] = useState(false);

  const [params] = useSearchParams();
  useEffect(() => { document.title = "Sign in — Nalyanya · Welcome back to the family"; }, []);
  useEffect(() => {
    const last = readLast();
    setRecent(readRecent());
    if (last) {
      const found = FAMILIES.find((f) => f.id === last.id);
      if (found) { setFamily(found); setBranch(last.branch); }
    }
    if (params.get("reset") === "1") setToast("New password saved — SIMULATED. Sign in with it below.");
    else if (params.get("verified") === "1") setToast("Verified — welcome back to the family.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (!shake) return; const t = window.setTimeout(() => setShake(false), 450); return () => window.clearTimeout(t); }, [shake]);

  const chooseRecent = (idToSet: string) => {
    const found = FAMILIES.find((f) => f.id === idToSet);
    if (found) { setFamily(found); setBranch(null); }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;
    const next: Record<string, string> = {};
    if (!family) next.family = "Choose your family first.";
    if (!/^((\+?254|0)[\s-]?[17]\d{2}[\s-]?\d{3}[\s-]?\d{3}|[^\s@]+@[^\s@]+\.[^\s@]{2,})$/.test(identifier.trim())) {
      next.identifier = "Use the phone or email you signed up with.";
    }
    if (password.length < 8) next.password = "Your password is at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) { setShake(true); return; }
    if (remember && family) persistFamily(family.id);

    const finish = () => {
      setState("done");
      setToast(`Welcome back — SIMULATED sign-in. 2FA code ${SIMULATED_CODE}.`);
      window.setTimeout(() => {
        navigate(`/auth/verify-otp?context=signin&to=${encodeURIComponent(identifier.trim())}`);
      }, 2200);
    };
    if (reduced) finish();
    else { setState("sending"); window.setTimeout(finish, 800); }
  };

  return (
    <AuthShell
      kicker="Karibu tena"
      backTo="/"
      visual={SIGNIN_VISUAL}
      slides={SIGNIN_SLIDES}
    >
      <main className="page-auth-signin">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">Sign in</p>
        <h1 className="ny-heading auth-title mt-2 text-3xl sm:text-4xl">Welcome back <em>to the family.</em></h1>
        <p className="ny-prose mt-2 text-sm leading-relaxed">Choose your family first — we keep you there.</p>

        {/* elder shortcut — above the form, in reach */}
        <div className="mt-4 flex flex-col gap-2 rounded-2xl border border-brand-accent/50 bg-brand-accent-soft/50 p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold leading-snug text-[#7a5b14]">Logging in for an elder?<span className="block text-xs font-medium text-[#7a5b14]/85">They don't need this password — they need one PIN link.</span></p>
          <button type="button" onClick={() => setElderOpen(true)} className="ny-btn shrink-0 bg-brand-accent px-4 py-2.5 text-sm text-brand-primary-deep hover:brightness-105"><KeyRound className="size-4" aria-hidden="true" />See how</button>
        </div>

        {state === "done" ? (
          <motion.div role="status" initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-6 rounded-[1.75rem] border border-brand-primary/25 bg-brand-primary-tint p-6 text-center">
            <CheckCircle2 className="mx-auto size-10 text-brand-primary" aria-hidden="true" />
            <p className="mt-2 font-display text-2xl font-semibold text-brand-primary">Karibu tena,{family ? ` ${family.name}.` : "."}</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">Password accepted — SIMULATED, nothing was checked. Money moves on this account, so one 2FA code stands between you and the family.</p>
            <p className="ny-num mt-2 text-sm font-bold tracking-[0.2em] text-brand-primary" aria-label={`Simulated code ${SIMULATED_CODE}`}>{SIMULATED_CODE}</p>
            <p className="mt-2 text-xs font-semibold text-text-tertiary">Taking you to verification…</p>
            <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => navigate(`/auth/verify-otp?context=signin&to=${encodeURIComponent(identifier.trim())}`)} className="ny-btn-primary">Continue → enter code</button>
              <button type="button" onClick={() => navigate("/")} className="ny-btn-ghost">Explore first</button>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={submit} noValidate className={cn("mt-5 space-y-5", shake && "auth-shake")}>
            <FamilyChooser chosen={family} branch={branch} onFamily={(f) => { setFamily(f); setErrors({}); }} onBranch={setBranch} autoFocus={false} />
            {errors.family && <p role="alert" className="-mt-3 text-xs font-semibold text-brand-danger">{errors.family}</p>}

            {recent.length > 0 && !family && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-text-tertiary">Recent</span>
                {recent.map((rid) => { const f = FAMILIES.find((x) => x.id === rid); if (!f) return null;
                  return <button key={rid} type="button" onClick={() => chooseRecent(rid)} className="auth-recent ny-chip ny-touch border-surface-3 bg-surface-1">{f.name}</button>; })}
              </div>
            )}

            <Field id={`${id}-identifier`} label="Phone or email" error={errors.identifier}>
              <input id={`${id}-identifier`} value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" inputMode="email" placeholder="0712 345 678 or you@example.com"
                className={cn("auth-input", errors.identifier && "is-invalid")} aria-invalid={!!errors.identifier} aria-describedby={errors.identifier ? `${id}-identifier-err` : undefined} />
            </Field>

            <Field id={`${id}-password`} label="Password" error={errors.password}>
              <div className="relative">
                <input id={`${id}-password`} type={showPw ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters"
                  className={cn("auth-input pr-12", errors.password && "is-invalid")} aria-invalid={!!errors.password} aria-describedby={errors.password ? `${id}-password-err` : undefined} />
                <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide password" : "Show password"} aria-pressed={showPw}
                  className="ny-touch absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-pill text-text-tertiary hover:bg-surface-2 hover:text-brand-primary">
                  {showPw ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
              <Link to="/auth/forgot-password" className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-brand-secondary hover:underline"><KeyRound className="size-3.5" aria-hidden="true" />Forgot password? →</Link>
            </Field>

            <div className="auth-consent items-center">
              <button type="button" role="switch" aria-checked={remember} onClick={() => setRemember((v) => !v)} aria-label="Remember this family on this device"
                className={cn("ny-touch relative h-8 w-14 shrink-0 rounded-pill transition-colors duration-300", remember ? "bg-brand-primary" : "bg-surface-3")}>
                <span aria-hidden="true" className={cn("absolute top-1 size-6 rounded-pill bg-surface-1 shadow transition-all duration-150", remember ? "left-7" : "left-1")} />
              </button>
              <span className="text-sm font-semibold text-text-secondary">Remember this family on this device{elder ? <span className="block text-xs font-normal text-text-tertiary">Elder Mode keeps this on.</span> : null}</span>
            </div>

            <button type="submit" disabled={state === "sending"} className="ny-btn-gold ny-touch w-full text-base disabled:cursor-wait disabled:opacity-80">
              {state === "sending"
                ? (<><Loader2 className="size-5 animate-spin" aria-hidden="true" />Signing you in…</>)
                : (<><LogIn className="size-5" aria-hidden="true" />Sign in</>)}
            </button>

            <p className="border-t border-surface-3/60 pt-4 text-center text-sm text-text-secondary">
              New to the family?{" "}
              <Link to="/auth/signup" className="font-bold text-brand-primary hover:underline">Sign up →</Link>
            </p>
            <p className="text-center text-[11px] font-medium leading-relaxed text-text-tertiary">2FA is on for money moves. After sign-in, you'll be asked for a code — SIMULATED in this build.</p>
          </form>
        )}
      </main>
      <ElderLinkModal open={elderOpen} onClose={() => setElderOpen(false)} />
      <Toast message={toast} onClear={() => setToast("")} />
    </AuthShell>
  );
}
