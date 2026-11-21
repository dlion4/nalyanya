/* ── A-5 · Forgot Password (`/auth/forgot-password`) ──────────────────────────
   Stylesheet: src/styles/pages/auth-forgot.css — family + identifier + channel,
   then hands the typed contact to A-7. SIMULATED throughout: nothing is sent. */

import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, Loader2, Mail, MessageCircle, MessageSquare, Send } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import FamilyChooser from "../../components/auth/FamilyChooser";
import Toast from "../../components/home/Toast";
import { IDENTIFIER_RE, SIMULATED_CODE, type Family } from "../../data/auth/families";
import { FORGOT_CHANNELS, FORGOT_SLIDES, FORGOT_VISUAL } from "../../data/auth/forgot";
import { usePageStyles } from "../../lib/usePageStyles";
import { usePrefersReducedMotion } from "../../lib/hooks";
import { cn } from "../../utils/cn";
import pageCss from "../../styles/pages/auth-forgot.css?inline";

const CHANNEL_ICONS = { sms: MessageSquare, whatsapp: MessageCircle, email: Mail } as const;

export default function ForgotPassword() {
  usePageStyles("auth-forgot", pageCss);
  const navigate = useNavigate();
  const reduced = usePrefersReducedMotion();

  const [family, setFamily] = useState<Family | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [channel, setChannel] = useState<string>("sms");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => { document.title = "Reset your password — Nalyanya"; }, []);
  useEffect(() => { if (!shake) return; const t = window.setTimeout(() => setShake(false), 450); return () => window.clearTimeout(t); }, [shake]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (sending) return;
    const next: Record<string, string> = {};
    if (!family) next.family = "Choose your family first.";
    if (!IDENTIFIER_RE.test(identifier.trim())) next.identifier = "Use the phone or email you signed up with.";
    setErrors(next);
    if (Object.keys(next).length) { setShake(true); return; }

    const finish = () => {
      setToast(`Code sent — SIMULATED ${SIMULATED_CODE}. Nothing left this browser.`);
      navigate(`/auth/verify-otp?context=forgot&to=${encodeURIComponent(identifier.trim())}&channel=${channel}`);
    };
    if (reduced) finish();
    else { setSending(true); window.setTimeout(finish, 800); }
  };

  return (
    <AuthShell kicker="A-5 · Forgot password" backTo="/signin" visual={FORGOT_VISUAL} slides={FORGOT_SLIDES}>
      <main className="page-auth-forgot">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">Reset your password</span>
          <span className="ny-sim-badge">Simulated</span>
        </div>
        <h1 className="ny-heading mt-2 text-3xl sm:text-4xl">Locked out? <em className="font-medium italic text-brand-secondary">Pole — let's fix it.</em></h1>
        <p className="ny-prose mt-2 text-sm leading-relaxed">One code to your phone or email, then a fresh password. The old one stops working the moment the code is used.</p>

        <motion.form initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={submit} noValidate className={cn("mt-5 space-y-5", shake && "auth-shake")}>
          <FamilyChooser chosen={family} branch={null} onFamily={(f) => { setFamily(f); setErrors((e) => ({ ...e, family: "" })); }} onBranch={() => {}} autoFocus />
          {errors.family && <p role="alert" className="-mt-3 text-xs font-semibold text-brand-danger">{errors.family}</p>}

          <div>
            <label htmlFor="forgot-id" className="block text-sm font-semibold text-text-primary">Phone or email you signed up with</label>
            <input id="forgot-id" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" inputMode="email"
              placeholder="0712 345 678 or you@example.com" maxLength={80}
              className={cn("auth-input", errors.identifier && "is-invalid")} aria-invalid={!!errors.identifier} aria-describedby={errors.identifier ? "forgot-id-err" : undefined} />
            {errors.identifier
              ? <p id="forgot-id-err" role="alert" className="mt-1.5 text-xs font-semibold text-brand-danger">{errors.identifier}</p>
              : <p className="mt-1.5 text-xs text-text-tertiary">We only ever send codes to the contact already on your account.</p>}
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-text-primary">Send the code by</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-3" role="group" aria-label="Channel for the code">
              {FORGOT_CHANNELS.map((c) => {
                const Icon = CHANNEL_ICONS[c.id];
                const on = channel === c.id;
                return (
                  <button key={c.id} type="button" aria-pressed={on} onClick={() => setChannel(c.id)}
                    className={cn("auth-channel ny-touch flex flex-col items-start gap-1 rounded-2xl border border-surface-3 bg-surface-1 p-3.5 text-left", on && "")}>
                    <Icon className="size-5 text-brand-primary" aria-hidden="true" />
                    <span className="text-sm font-bold text-text-primary">{c.label}</span>
                    <span className="text-[11px] text-text-tertiary">{c.hint} · {c.eta}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button type="submit" disabled={sending} className="ny-btn-gold ny-touch w-full text-base disabled:cursor-wait disabled:opacity-80">
            {sending ? (<><Loader2 className="size-5 animate-spin" aria-hidden="true" />Sending the code…</>) : (<><Send className="size-5" aria-hidden="true" />Send the code</>)}
          </button>

          <p className="border-t border-surface-3/60 pt-4 text-center text-sm text-text-secondary">
            Remember it after all? <Link to="/signin" className="font-bold text-brand-primary hover:underline">Sign in →</Link>
          </p>
          <p className="flex items-center justify-center gap-2 text-center text-[11px] font-semibold text-text-tertiary">
            <KeyRound className="size-4 text-brand-primary" aria-hidden="true" /> Three tries per code — then a 15-minute rest. Nobody here can see your code.
          </p>
        </motion.form>
      </main>
      <Toast message={toast} onClear={() => setToast("")} />
    </AuthShell>
  );
}
