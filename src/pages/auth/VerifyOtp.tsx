/* ── A-7 · Verify OTP (`/auth/verify-otp`) ────────────────────────────────────
   Stylesheet: src/styles/pages/auth-verify.css — the one 6-digit screen used by
   signup, sign-in 2FA, forgot-password and receive-link release. Context in the
   URL decides where success goes. SIMULATED code 123456, always labeled.    */

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, LifeBuoy, Loader2, Lock, RotateCcw } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import OtpInput from "../../components/auth/OtpInput";
import Toast from "../../components/home/Toast";
import { SIMULATED_CODE } from "../../data/auth/families";
import { MAX_ATTEMPTS, RESEND_SECONDS, VERIFY_CONTEXTS, VERIFY_SLIDES, VERIFY_VISUAL, maskDestination, type VerifyContext } from "../../data/auth/verify";
import { usePageStyles } from "../../lib/usePageStyles";
import { usePrefersReducedMotion } from "../../lib/hooks";
import { cn } from "../../utils/cn";
import pageCss from "../../styles/pages/auth-verify.css?inline";

const R = 15;
const CIRC = 2 * Math.PI * R;

function contextOf(raw: string | null): VerifyContext {
  return raw === "signin" || raw === "forgot" || raw === "receive" ? raw : "signup";
}

export default function VerifyOtp() {
  usePageStyles("auth-verify", pageCss);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const reduced = usePrefersReducedMotion();

  const context = contextOf(params.get("context"));
  const to = params.get("to") ?? "";
  const ref = params.get("ref") ?? "";
  const channel = (params.get("channel") ?? "SMS").toUpperCase();
  const meta = VERIFY_CONTEXTS[context];
  const masked = useMemo(() => maskDestination(to), [to]);

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [locked, setLocked] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [sendCount, setSendCount] = useState(1);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { document.title = "Enter the code — Nalyanya"; }, []);
  useEffect(() => { if (!shake) return; const t = window.setTimeout(() => setShake(false), 450); return () => window.clearTimeout(t); }, [shake]);
  useEffect(() => {
    if (seconds <= 0) return;
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [seconds]);

  const verify = (value: string = code) => {
    if (verifying || locked || done) return;
    if (!/^\d{6}$/.test(value)) { setError("Enter all 6 digits."); setShake(true); return; }
    const finish = () => {
      if (value !== SIMULATED_CODE) {
        const left = attemptsLeft - 1;
        setAttemptsLeft(left);
        if (left <= 0) {
          setLocked(true);
          setError("");
        } else {
          setError(`That code doesn't match — ${left} ${left === 1 ? "try" : "tries"} left.`);
          setShake(true);
          setCode("");
        }
        setVerifying(false);
        return;
      }
      setError("");
      setDone(true);
      setToast("Verified — SIMULATED. Nothing was checked against a server.");
      window.setTimeout(() => {
        if (context === "forgot") navigate(`/auth/reset-password?to=${encodeURIComponent(to)}&verified=1`);
        else if (context === "signup") navigate("/auth/onboard");
        // signin + receive stay: simulated success panels below (dashboard ships later)
      }, 1800);
    };
    if (reduced) finish();
    else { setVerifying(true); window.setTimeout(finish, 800); }
  };

  const resend = () => {
    if (seconds > 0) return;
    setSendCount((c) => c + 1);
    setSeconds(RESEND_SECONDS);
    setCode("");
    setError("");
    setToast(`Code re-sent — SIMULATED ${SIMULATED_CODE}.`);
  };

  const resetLock = () => {
    setLocked(false);
    setAttemptsLeft(MAX_ATTEMPTS);
    setCode("");
    setError("");
    setToast("Lock cleared — SIMULATED. In the live app this takes 15 minutes.");
  };

  return (
    <AuthShell kicker={`A-7 · Verify · ${context}`} backTo={context === "forgot" ? "/auth/forgot-password" : context === "signup" ? "/auth/signup" : "/signin"}
      visual={VERIFY_VISUAL} slides={VERIFY_SLIDES}>
      <main className="page-auth-verify">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">Enter the code we sent</span>
          <span className="ny-sim-badge">Simulated</span>
        </div>
        <h1 className="ny-heading mt-2 text-3xl sm:text-4xl">{meta.title} <em className="font-medium italic text-brand-secondary">Six digits.</em></h1>
        <p className="ny-prose mt-2 text-sm leading-relaxed">
          {meta.copy} Sent to <span className="ny-num font-bold text-text-primary">{masked}</span> via {channel}.
          {ref && <> Keep <span className="ny-num font-semibold">{ref}</span>.</>}
        </p>

        {done ? (
          <motion.div role="status" initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-6 rounded-[1.75rem] border border-brand-success/30 bg-brand-success-tint p-6 text-center">
            <CheckCircle2 className="mx-auto size-10 text-brand-success" aria-hidden="true" />
            <p className="mt-2 font-display text-2xl font-semibold text-brand-primary">
              {context === "receive" ? "Money released (SIMULATED)." : context === "signin" ? "Karibu — you're in (SIMULATED)." : "Verified."}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
              {context === "receive"
                ? "In the live app the funds would move to the registered M-Pesa line now, with an SMS receipt."
                : context === "signin"
                  ? "Nothing was authenticated in this build. The dashboard opens the moment the backend is wired — meanwhile, set up your second lock."
                  : "Taking you onward…"}
            </p>
            <div className="mt-5 flex flex-col justify-center gap-2.5 sm:flex-row">
              {context === "signup" && <Link to="/auth/onboard" className="ny-btn-primary text-sm">{meta.nextLabel}</Link>}
              {context === "forgot" && <Link to={`/auth/reset-password?to=${encodeURIComponent(to)}&verified=1`} className="ny-btn-primary text-sm">{meta.nextLabel}</Link>}
              {context === "signin" && (<>
                <Link to="/auth/2fa?from=signin" className="ny-btn-gold text-sm">Set up 2FA & PIN →</Link>
                <Link to="/" className="ny-btn-ghost text-sm">Explore the family</Link>
              </>)}
              {context === "receive" && <Link to="/contact" className="ny-btn-primary text-sm">{meta.nextLabel}</Link>}
            </div>
          </motion.div>
        ) : locked ? (
          <motion.div role="alert" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-[1.75rem] border border-brand-danger/30 bg-brand-danger-tint/40 p-6 text-center">
            <Lock className="mx-auto size-10 text-brand-danger" aria-hidden="true" />
            <p className="mt-2 font-display text-2xl font-semibold text-text-primary">Three tries used — resting 15 minutes.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">This protects you if someone else finds your phone. In this SIMULATED build you can clear the lock instantly.</p>
            <div className="mt-5 flex flex-col justify-center gap-2.5 sm:flex-row">
              <button type="button" onClick={resetLock} className="ny-btn-gold text-sm"><RotateCcw className="size-4" aria-hidden="true" />Clear lock (SIMULATED)</button>
              <Link to="/contact" className="ny-btn-ghost text-sm">Contact the family office</Link>
            </div>
          </motion.div>
        ) : (
          <motion.form initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={(e) => { e.preventDefault(); verify(); }} className={cn("mt-6 space-y-5", shake && "auth-shake")}>
            <OtpInput length={6} value={code} onChange={(v) => { setCode(v); setError(""); }} onComplete={(v) => verify(v)} error={!!error} disabled={verifying} label="6-digit verification code" />

            {error ? <p role="alert" className="text-center text-sm font-semibold text-brand-danger">{error}</p>
              : <p className="text-center text-xs text-text-tertiary">{attemptsLeft} of {MAX_ATTEMPTS} tries · the code lives 10 minutes</p>}

            {/* simulated code panel — honest by design */}
            <div className="auth-code-glow rounded-2xl border border-brand-accent/50 bg-brand-accent-soft/60 p-4 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7a5b14]">Simulated code — this phase</p>
              <p className="ny-num mt-1 font-display text-3xl font-semibold tracking-[0.3em] text-brand-primary-deep" aria-label={`Simulated code ${SIMULATED_CODE}`}>{SIMULATED_CODE}</p>
              <p className="mt-1.5 text-xs font-semibold text-[#7a5b14]/90">Nothing was texted. It arrives by SMS in the live app{sendCount > 1 ? ` · sent ${sendCount}×` : ""}.</p>
            </div>

            <button type="submit" disabled={verifying || code.length !== 6} className="ny-btn-gold ny-touch w-full text-base disabled:cursor-wait disabled:opacity-70">
              {verifying ? (<><Loader2 className="size-5 animate-spin" aria-hidden="true" />Checking…</>) : (<>Verify <ArrowRight className="size-5" aria-hidden="true" /></>)}
            </button>

            <div className="flex items-center justify-center gap-3">
              <svg viewBox="0 0 36 36" width="30" height="30" className="auth-resend-ring" aria-hidden="true">
                <circle cx="18" cy="18" r={R} fill="none" stroke="var(--color-surface-3)" strokeWidth="4" />
                <circle cx="18" cy="18" r={R} fill="none" stroke="var(--color-brand-accent)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - seconds / RESEND_SECONDS)} />
              </svg>
              <button type="button" onClick={resend} disabled={seconds > 0}
                className="text-sm font-bold text-brand-primary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-text-tertiary disabled:no-underline">
                {seconds > 0 ? `Resend in ${seconds}s` : "Resend the code"}
              </button>
            </div>

            <p className="flex items-center justify-center gap-2 border-t border-surface-3/60 pt-4 text-center text-sm text-text-secondary">
              <LifeBuoy className="size-4 text-brand-primary" aria-hidden="true" />
              Didn't get it? <Link to="/contact" className="font-bold text-brand-primary hover:underline">Try WhatsApp / contact admin →</Link>
            </p>
          </motion.form>
        )}
      </main>
      <Toast message={toast} onClear={() => setToast("")} />
    </AuthShell>
  );
}
