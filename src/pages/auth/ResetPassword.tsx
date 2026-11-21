/* ── A-6 · Reset Password (`/auth/reset-password`) ────────────────────────────
   Stylesheet: src/styles/pages/auth-reset.css — new password + confirm with a
   live strength meter, optional sign-out-everywhere, then back to A-2 with a
   success toast. SIMULATED: nothing is stored or checked.                   */

import { useEffect, useId, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, KeyRound, Lightbulb, Loader2, ShieldCheck } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import Toast from "../../components/home/Toast";
import { RESET_SLIDES, RESET_TIPS, RESET_VISUAL } from "../../data/auth/reset";
import { passwordIssue } from "../../lib/validation";
import { usePageStyles } from "../../lib/usePageStyles";
import { usePrefersReducedMotion } from "../../lib/hooks";
import { cn } from "../../utils/cn";
import pageCss from "../../styles/pages/auth-reset.css?inline";

function score(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) s++;
  return s as 0 | 1 | 2 | 3 | 4;
}
const LABEL = ["Too short", "Easy to guess", "Getting there", "Strong", "Very strong"];

export default function ResetPassword() {
  usePageStyles("auth-reset", pageCss);
  const id = useId();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reduced = usePrefersReducedMotion();

  const verified = params.get("verified") === "1";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [logoutAll, setLogoutAll] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { document.title = "Choose a new password — Nalyanya"; }, []);
  useEffect(() => { if (!shake) return; const t = window.setTimeout(() => setShake(false), 450); return () => window.clearTimeout(t); }, [shake]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const next: Record<string, string> = {};
    const issue = passwordIssue(password);
    if (issue) next.password = issue;
    else if (confirm !== password) next.confirm = "Both passwords should match.";
    setErrors(next);
    if (Object.keys(next).length) { setShake(true); return; }

    const finish = () => {
      setToast("New password saved — SIMULATED. Sign in with it below.");
      navigate("/signin?reset=1");
    };
    if (reduced) finish();
    else { setSending(true); window.setTimeout(finish, 800); }
  };

  return (
    <AuthShell kicker="A-6 · New password" backTo="/signin" visual={RESET_VISUAL} slides={RESET_SLIDES}>
      <main className="page-auth-reset">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">Choose a new password</span>
          <span className="ny-sim-badge">Simulated</span>
        </div>
        <h1 className="ny-heading mt-2 text-3xl sm:text-4xl">Fresh words, <em className="font-medium italic text-brand-secondary">only you know.</em></h1>

        {!verified ? (
          <p className="mt-4 flex items-start gap-2.5 rounded-2xl border border-brand-warning/50 bg-brand-accent-soft/50 p-3.5 text-sm leading-relaxed text-[#7a5b14]">
            <KeyRound className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>No verified code on this visit yet — codes live 10 minutes. <Link to="/auth/forgot-password" className="font-bold underline">Request a fresh one →</Link></span>
          </p>
        ) : (
          <p className="mt-4 flex items-center gap-2 rounded-2xl border border-brand-success/30 bg-brand-success-tint p-3.5 text-sm font-semibold text-brand-primary">
            <CheckCircle2 className="size-5 shrink-0 text-brand-success" aria-hidden="true" /> Code accepted — this is the last step.
          </p>
        )}

        <motion.form initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={submit} noValidate className={cn("mt-5 space-y-5", shake && "auth-shake")}>
          <div>
            <label htmlFor={`${id}-pw`} className="block text-sm font-semibold text-text-primary">New password</label>
            <div className="relative">
              <input id={`${id}-pw`} type={show ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters" maxLength={72}
                className={cn("auth-input pr-12", errors.password && "is-invalid")} aria-invalid={!!errors.password} aria-describedby={errors.password ? `${id}-pw-err` : undefined} />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}
                className="ny-touch absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-pill text-text-tertiary hover:bg-surface-2 hover:text-brand-primary">
                {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
            <div className="auth-meter mt-2" data-score={score(password)} role="img" aria-label={`Password strength: ${LABEL[score(password)]}`}><span /><span /><span /><span /></div>
            {errors.password
              ? <p id={`${id}-pw-err`} role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.password}</p>
              : <p className="mt-1.5 text-xs text-text-tertiary">{password ? LABEL[score(password)] : "8+ characters, a letter and a number."}</p>}
          </div>

          <div>
            <label htmlFor={`${id}-confirm`} className="block text-sm font-semibold text-text-primary">Same password again</label>
            <input id={`${id}-confirm`} type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Type it once more" maxLength={72}
              className={cn("auth-input", errors.confirm && "is-invalid")} aria-invalid={!!errors.confirm} aria-describedby={errors.confirm ? `${id}-confirm-err` : undefined} />
            {errors.confirm && <p id={`${id}-confirm-err`} role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.confirm}</p>}
          </div>

          <div className="auth-consent items-center">
            <button type="button" role="switch" aria-checked={logoutAll} onClick={() => setLogoutAll((v) => !v)} aria-label="Sign out all other phones and computers"
              className={cn("ny-touch relative h-8 w-14 shrink-0 rounded-pill transition-colors duration-300", logoutAll ? "bg-brand-primary" : "bg-surface-3")}>
              <span aria-hidden="true" className={cn("absolute top-1 size-6 rounded-pill bg-surface-1 shadow transition-all duration-150", logoutAll ? "left-7" : "left-1")} />
            </button>
            <span className="text-sm font-semibold text-text-secondary">Sign out all other phones and computers<span className="block text-xs font-normal text-text-tertiary">Recommended if anyone else may know the old one.</span></span>
          </div>

          <ul className="space-y-1.5" aria-label="Password tips">
            {RESET_TIPS.map((t) => (
              <li key={t} className="auth-tip flex items-start gap-2.5 rounded-xl px-3 py-2 text-[13px] leading-relaxed text-text-secondary">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand-accent" aria-hidden="true" />{t}
              </li>
            ))}
          </ul>

          <button type="submit" disabled={sending} className="ny-btn-gold ny-touch w-full text-base disabled:cursor-wait disabled:opacity-80">
            {sending ? (<><Loader2 className="size-5 animate-spin" aria-hidden="true" />Saving…</>) : (<><ShieldCheck className="size-5" aria-hidden="true" />Save new password</>)}
          </button>
          <p className="border-t border-surface-3/60 pt-4 text-center text-sm text-text-secondary">
            Changed your mind? <Link to="/signin" className="font-bold text-brand-primary hover:underline">Back to sign in →</Link>
          </p>
        </motion.form>
      </main>
      <Toast message={toast} onClear={() => setToast("")} />
    </AuthShell>
  );
}
