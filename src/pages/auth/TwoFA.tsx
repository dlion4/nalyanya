/* ── A-8 · 2FA & Receive-PIN Setup (`/auth/2fa`) ──────────────────────────────
   Stylesheet: src/styles/pages/auth-2fa.css — two locks, two keys. (a) TOTP 2FA
   for login & money moves, verified against a SIMULATED code; recovery codes
   as honest stubs. (b) A 4-digit RECEIVE PIN — the cornerstone of the no-login
   elder flow. Nothing here is real yet; every secret says SIMULATED.        */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle2, Copy, Download, KeyRound, Loader2, RotateCcw, ShieldCheck, Smartphone, X } from "lucide-react";
import AuthShell from "../../components/auth/AuthShell";
import OtpInput from "../../components/auth/OtpInput";
import SampleQR from "../../components/auth/SampleQR";
import Toast from "../../components/home/Toast";
import { SIMULATED_CODE } from "../../data/auth/families";
import { OTP_CHANNELS, PIN_RULES, RECOVERY_CODES, SIMULATED_TOTP_CODE, SIMULATED_TOTP_SECRET, TOTP_STEPS, TWOFA_SLIDES, TWOFA_VISUAL, pinIssue } from "../../data/auth/twofa";
import { makeRef } from "../../lib/validation";
import { usePageStyles } from "../../lib/usePageStyles";
import { usePrefersReducedMotion } from "../../lib/hooks";
import { cn } from "../../utils/cn";
import pageCss from "../../styles/pages/auth-2fa.css?inline";

function makeToken(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const buf = new Uint32Array(4);
  const c = globalThis.crypto;
  if (c && typeof c.getRandomValues === "function") c.getRandomValues(buf);
  else buf.set(Array.from({ length: 4 }, () => Math.floor(Math.random() * 2 ** 32)));
  return Array.from(buf, (n) => chars[n % chars.length]).join("");
}

/* sample receive link preview — the elder flow, simulated */
function ReceivePreview({ token, channel, onClose }: { token: string; channel: string; onClose: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div className="ny-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div role="dialog" aria-modal="true" aria-labelledby="recv-title"
        initial={{ opacity: 0, y: 22, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
        className="ny-card w-full max-w-sm rounded-3xl p-5 shadow-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-tertiary">Elder preview · {channel}</p>
          <button type="button" onClick={onClose} aria-label="Close preview" className="ny-touch grid size-9 place-items-center rounded-pill border border-surface-3"><X className="size-4" /></button>
        </div>
        <h2 id="recv-title" className="sr-only">Sample receive link preview</h2>
        <div className="auth-phone mx-auto mt-3 max-w-[240px] bg-surface-0 p-4 text-center">
          <p className="ny-num break-all text-xs font-bold text-brand-primary">nalyanya.app/r/{token}</p>
          {step === 0 && (<>
            <p className="mt-3 font-display text-lg font-semibold leading-snug">You've been sent <span className="text-brand-secondary">KES 5,000</span>.</p>
            <p className="mt-1 text-xs text-text-secondary">Enter your 4-digit PIN.</p>
            <div className="mt-3 flex justify-center gap-2" aria-hidden="true">{[0, 1, 2, 3].map((i) => <span key={i} className="size-3 rounded-full bg-brand-primary" />)}</div>
            <button type="button" onClick={() => setStep(1)} className="ny-btn-primary mt-4 w-full text-sm">Continue</button>
          </>)}
          {step === 1 && (<>
            <p className="mt-3 font-display text-lg font-semibold leading-snug">Code sent by {channel}.</p>
            <p className="mt-1 text-xs text-text-secondary">Enter the 6 digits. SIMULATED {SIMULATED_CODE}.</p>
            <button type="button" onClick={() => setStep(2)} className="ny-btn-primary mt-4 w-full text-sm">Receive</button>
          </>)}
          {step === 2 && (<>
            <CheckCircle2 className="mx-auto mt-3 size-9 text-brand-success" aria-hidden="true" />
            <p className="mt-2 font-display text-lg font-semibold">KES 5,000 on its way</p>
            <p className="mt-1 text-xs text-text-secondary">That's the whole elder flow — no login, ever.</p>
            <span className="ny-sim-badge mt-3">Simulated</span>
            <button type="button" onClick={onClose} className="ny-btn-ghost mt-3 w-full text-sm">Close preview</button>
          </>)}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TwoFA() {
  usePageStyles("auth-2fa", pageCss);
  const reduced = usePrefersReducedMotion();

  const [totp, setTotp] = useState("");
  const [totpError, setTotpError] = useState("");
  const [totpDone, setTotpDone] = useState(false);
  const [totpBusy, setTotpBusy] = useState(false);
  const [savedCodes, setSavedCodes] = useState(false);
  const [copied, setCopied] = useState<"secret" | "codes" | null>(null);

  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinDone, setPinDone] = useState(false);
  const [channel, setChannel] = useState("sms");

  const [preview, setPreview] = useState<string | null>(null);
  const [reference, setReference] = useState("");
  const [toast, setToast] = useState("");
  const [shakeTotp, setShakeTotp] = useState(false);
  const [shakePin, setShakePin] = useState(false);

  useEffect(() => { document.title = "Two locks, two keys — Nalyanya"; }, []);
  useEffect(() => { if (!shakeTotp) return; const t = window.setTimeout(() => setShakeTotp(false), 450); return () => window.clearTimeout(t); }, [shakeTotp]);
  useEffect(() => { if (!shakePin) return; const t = window.setTimeout(() => setShakePin(false), 450); return () => window.clearTimeout(t); }, [shakePin]);

  const channelLabel = useMemo(() => (channel === "whatsapp" ? "WhatsApp" : "SMS"), [channel]);

  const copyText = async (text: string, which: "secret" | "codes") => {
    try { await navigator.clipboard.writeText(text); setCopied(which); }
    catch { setCopied(null); setToast("Copy didn't work — write it down by hand."); return; }
    window.setTimeout(() => setCopied(null), 2200);
  };

  const downloadCodes = () => {
    try {
      const blob = new Blob([`Nalyanya recovery codes (SIMULATED SAMPLE — not real)\n\n${RECOVERY_CODES.join("\n")}\n`], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "nalyanya-recovery-codes-simulated.txt";
      document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 800);
      setToast("Sample codes downloaded — SIMULATED, for the feel of it.");
    } catch { setToast("Download didn't work in this browser."); }
  };

  const verifyTotp = (v: string = totp) => {
    if (totpBusy || totpDone) return;
    if (!/^\d{6}$/.test(v)) { setTotpError("Enter all 6 digits from the app."); setShakeTotp(true); return; }
    const finish = () => {
      if (v !== SIMULATED_TOTP_CODE && v !== SIMULATED_CODE) {
        setTotpError(`No match — in this build the app would show ${SIMULATED_TOTP_CODE}.`);
        setShakeTotp(true); setTotpBusy(false); return;
      }
      setTotpError(""); setTotpDone(true);
      setReference((r) => r || makeRef("NY-SEC"));
      setToast("2FA switched on — SIMULATED. Recovery codes below are samples.");
    };
    if (reduced) finish();
    else { setTotpBusy(true); window.setTimeout(finish, 800); }
  };

  const savePin = () => {
    if (pinDone) return;
    const issue = pinIssue(pin);
    if (issue) { setPinError(issue); setShakePin(true); return; }
    if (confirm !== pin) { setPinError("Both entries should match."); setShakePin(true); return; }
    setPinError("");
    setPinDone(true);
    setReference((r) => r || makeRef("NY-SEC"));
    setToast("Receive PIN set — SIMULATED. Remember it; the office can't see it.");
  };

  const finished = totpDone && pinDone;

  return (
    <AuthShell kicker="A-8 · Two locks, two keys" backTo="/signin" visual={TWOFA_VISUAL} slides={TWOFA_SLIDES}>
      <main className="page-auth-2fa">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-secondary">Protect account + money</span>
          <span className="ny-sim-badge">Simulated</span>
        </div>
        <h1 className="ny-heading mt-2 text-3xl sm:text-4xl">Two locks, <em className="font-medium italic text-brand-secondary">two keys.</em></h1>
        <p className="ny-prose mt-2 text-sm leading-relaxed">A changing code guards <em>your</em> account. A 4-digit PIN lets an elder receive money <em>without</em> logging in. Never the same number.</p>

        {finished && (
          <motion.div role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-[1.75rem] border border-brand-success/30 bg-brand-success-tint p-5 text-center">
            <CheckCircle2 className="mx-auto size-9 text-brand-success" aria-hidden="true" />
            <p className="mt-2 font-display text-2xl font-semibold text-brand-primary">Both locks are on (SIMULATED).</p>
            <p className="ny-num mt-1 text-sm font-bold tracking-[0.12em] text-brand-primary">{reference}</p>
            <div className="mt-4 flex flex-col justify-center gap-2.5 sm:flex-row">
              <Link to="/" className="ny-btn-primary text-sm">Explore the family →</Link>
              <button type="button" onClick={() => setPreview(makeToken())} className="ny-btn-ghost text-sm">Try a receive link</button>
            </div>
          </motion.div>
        )}

        <div className="mt-5 space-y-4">
          {/* ── Key 1: TOTP ── */}
          <section aria-labelledby="totp-h" className={cn("auth-key-card ny-card rounded-[1.5rem] p-5", shakeTotp && "auth-shake")}>
            <div className="flex items-center justify-between gap-3">
              <h2 id="totp-h" className="flex items-center gap-2 font-display text-xl font-semibold"><Smartphone className="size-5 text-brand-primary" aria-hidden="true" /> Key 1 · App code (2FA)</h2>
              {totpDone
                ? <span className="inline-flex items-center gap-1 rounded-pill bg-brand-success-tint px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-success"><Check className="size-3.5" /> On</span>
                : <span className="rounded-pill bg-surface-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-text-tertiary">Step 1 of 2</span>}
            </div>

            {!totpDone ? (
              <div className="mt-4 space-y-4">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <SampleQR seed={SIMULATED_TOTP_SECRET} size={132} caption="Sample · scans to nothing" />
                  <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-text-secondary">
                    {TOTP_STEPS.map((s) => <li key={s}>{s}</li>)}
                  </ol>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-tertiary">Or type the secret by hand</p>
                  <div className="auth-secret mt-1.5 flex items-center justify-between gap-2 rounded-xl border border-surface-3 px-3 py-2.5">
                    <span className="text-sm font-bold text-text-primary" aria-label="Simulated secret">{SIMULATED_TOTP_SECRET}</span>
                    <button type="button" onClick={() => copyText(SIMULATED_TOTP_SECRET, "secret")} aria-label="Copy simulated secret"
                      className="ny-touch grid size-9 shrink-0 place-items-center rounded-pill hover:bg-surface-2">
                      {copied === "secret" ? <Check className="size-4 text-brand-success" /> : <Copy className="size-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Code the app shows right now</p>
                  <div className="mt-2"><OtpInput length={6} value={totp} onChange={(v) => { setTotp(v); setTotpError(""); }} onComplete={(v) => verifyTotp(v)} error={!!totpError} disabled={totpBusy} label="Authenticator code" autoFocus={false} /></div>
                  {totpError ? <p role="alert" className="mt-2 text-xs font-semibold text-brand-danger">{totpError}</p>
                    : <p className="mt-2 text-xs text-text-tertiary">In this build any app would show <span className="ny-num font-bold">{SIMULATED_TOTP_CODE}</span>.</p>}
                </div>
                <button type="button" onClick={() => verifyTotp()} disabled={totpBusy || totp.length !== 6} className="ny-btn-gold ny-touch w-full text-sm disabled:cursor-wait disabled:opacity-70">
                  {totpBusy ? (<><Loader2 className="size-4 animate-spin" />Checking…</>) : (<><ShieldCheck className="size-4" />Switch on 2FA</>)}
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm font-semibold text-text-primary">Recovery codes <span className="font-normal text-text-tertiary">(samples — write the pattern down)</span></p>
                <ul className="mt-2 grid grid-cols-2 gap-1.5">
                  {RECOVERY_CODES.map((c) => <li key={c} className="auth-code-chip ny-num rounded-lg bg-surface-2 px-2.5 py-2 text-center text-xs font-bold text-text-primary">{c}</li>)}
                </ul>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => copyText(RECOVERY_CODES.join("\n"), "codes")} className="ny-btn-ghost flex-1 text-xs">
                    {copied === "codes" ? <Check className="size-4" /> : <Copy className="size-4" />} {copied === "codes" ? "Copied" : "Copy"}
                  </button>
                  <button type="button" onClick={downloadCodes} className="ny-btn-ghost flex-1 text-xs"><Download className="size-4" /> Download</button>
                </div>
                <label className="auth-consent mt-3">
                  <input type="checkbox" checked={savedCodes} onChange={(e) => setSavedCodes(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-brand-primary" />
                  <span className="text-sm font-semibold text-text-secondary">I've saved these somewhere safe (not on this phone's notes).</span>
                </label>
              </div>
            )}
          </section>

          {/* ── Key 2: receive PIN ── */}
          <section aria-labelledby="pin-h" className={cn("auth-key-card ny-card rounded-[1.5rem] p-5", shakePin && "auth-shake")}>
            <div className="flex items-center justify-between gap-3">
              <h2 id="pin-h" className="flex items-center gap-2 font-display text-xl font-semibold"><KeyRound className="size-5 text-brand-secondary" aria-hidden="true" /> Key 2 · Receive PIN</h2>
              {pinDone
                ? <span className="inline-flex items-center gap-1 rounded-pill bg-brand-success-tint px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-success"><Check className="size-3.5" /> Set</span>
                : <span className="rounded-pill bg-surface-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-text-tertiary">Step 2 of 2</span>}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">This 4-digit PIN lets <em>you</em> receive money sent to you <em>without logging in</em> — open the link, enter the PIN and an OTP. Perfect for grandparents.</p>

            {!pinDone ? (
              <div className="mt-4 space-y-4">
                <ul className="space-y-1.5" aria-label="PIN rules">
                  {PIN_RULES.map((r) => <li key={r} className="flex items-start gap-2 text-[13px] text-text-secondary"><span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-accent" aria-hidden="true" />{r}</li>)}
                </ul>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Choose the PIN</p>
                  <div className="mx-auto mt-2 max-w-[16rem]"><OtpInput length={4} value={pin} onChange={(v) => { setPin(v); setPinError(""); }} masked error={!!pinError} label="New 4-digit receive PIN" autoFocus={false} /></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Same PIN again</p>
                  <div className="mx-auto mt-2 max-w-[16rem]"><OtpInput length={4} value={confirm} onChange={(v) => { setConfirm(v); setPinError(""); }} masked error={!!pinError} label="Confirm receive PIN" autoFocus={false} /></div>
                  {pinError && <p role="alert" className="mt-2 text-center text-xs font-semibold text-brand-danger">{pinError}</p>}
                </div>
                <fieldset>
                  <legend className="text-sm font-semibold text-text-primary">Where should the one-time code go?</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Channel for receive-link codes">
                    {OTP_CHANNELS.map((c) => (
                      <button key={c.id} type="button" aria-pressed={channel === c.id} onClick={() => setChannel(c.id)}
                        className={cn("ny-touch rounded-xl border px-3 py-2.5 text-left text-sm font-bold transition-colors", channel === c.id ? "border-brand-primary bg-brand-primary-tint text-brand-primary" : "border-surface-3 text-text-secondary")}>
                        {c.label}<span className="block text-[11px] font-medium text-text-tertiary">{c.hint}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <button type="button" onClick={savePin} disabled={pin.length !== 4 || confirm.length !== 4} className="ny-btn-gold ny-touch w-full text-sm disabled:cursor-not-allowed disabled:opacity-60">
                  <KeyRound className="size-4" /> Set receive PIN
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="rounded-2xl bg-brand-primary-tint px-4 py-3 text-sm font-semibold text-brand-primary">Remember this — you'll need it every time you receive. Codes go by {channelLabel}.</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button type="button" onClick={() => setPreview(makeToken())} className="ny-btn-primary flex-1 text-sm">Try a receive link</button>
                  <button type="button" onClick={() => { setPin(""); setConfirm(""); setPinDone(false); }} className="ny-btn-ghost flex-1 text-sm"><RotateCcw className="size-4" /> Choose again</button>
                </div>
                <p className="text-xs leading-relaxed text-text-tertiary">Forgot the PIN later? An admin resets it with you — OTP on your line plus their co-sign, all logged. <Link to="/contact" className="font-bold text-brand-primary hover:underline">Contact the family office →</Link></p>
              </div>
            )}
          </section>
        </div>
      </main>
      <AnimatePresence>{preview && <ReceivePreview token={preview} channel={channelLabel} onClose={() => setPreview(null)} />}</AnimatePresence>
      <Toast message={toast} onClear={() => setToast("")} />
    </AuthShell>
  );
}
