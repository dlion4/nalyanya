"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, Delete, Lock, MessageSquare, ShieldCheck, Smartphone, Wifi } from "lucide-react";
import { kes } from "@/lib/format";
import { otpChannelLabel, type OtpChannel } from "@/data/dashboard/finance-access";

/* --------------------------------------------------------------------- */
/* PseudoQr — deterministic module grid with real finder patterns.        */
/* Decorative preview of a SIMULATED link; labelled as such in the UI.     */
/* --------------------------------------------------------------------- */
export function PseudoQr({ value, size = 132 }: { value: string; size?: number }) {
  const N = 25;
  const cells = useMemo(() => {
    let h = 2166136261;
    for (let i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    const out: boolean[] = [];
    for (let i = 0; i < N * N; i++) {
      h = (Math.imul(h, 1103515245) + 12345) >>> 0;
      out.push(((h >>> 17) & 1) === 1);
    }
    return out;
  }, [value]);

  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8);

  const finder = (x: number, y: number) => (
    <g key={`f-${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="none" stroke="var(--color-text-primary)" strokeWidth={1} />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="var(--color-text-primary)" />
    </g>
  );

  return (
    <svg viewBox={`0 0 ${N} ${N}`} className="fa-qr" width={size} height={size} role="img" aria-label={`QR preview for ${value}`}>
      <rect width={N} height={N} fill="var(--color-surface-1)" />
      {cells.map((on, i) => {
        const x = i % N;
        const y = Math.floor(i / N);
        if (!on || inFinder(x, y)) return null;
        return <rect key={i} x={x} y={y} width={1} height={1} fill="var(--color-text-primary)" />;
      })}
      {finder(0, 0)}
      {finder(N - 7, 0)}
      {finder(0, N - 7)}
    </svg>
  );
}

/* --------------------------------------------------------------------- */
/* ElderPhonePreview — the live /r/:token flow, screen by screen.         */
/* Every screen opens through a pinhole (iris) like a camera shutter.      */
/* --------------------------------------------------------------------- */

export type PhoneStep = "invite" | "pin" | "otp" | "receiving" | "success" | "locked";
export type PhoneState = {
  step: PhoneStep;
  pinTries: number;
  otpTries: number;
};

export const DEMO_PIN = "4812";
export const DEMO_OTP = "481920";

export function ElderPhonePreview({
  amount,
  sender,
  phone,
  token,
  pinRequired,
  otpChannel,
  onState,
  forceStep,
}: {
  amount: number;
  sender: string;
  phone: string;
  token: string;
  pinRequired: boolean;
  otpChannel: OtpChannel;
  onState?: (s: PhoneState) => void;
  forceStep?: PhoneStep | null;
}) {
  const [step, setStep] = useState<PhoneStep>("invite");
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [pinTries, setPinTries] = useState(0);
  const [otpTries, setOtpTries] = useState(0);
  const [lockLeft, setLockLeft] = useState(0);
  const [shake, setShake] = useState(0);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    onState?.({ step, pinTries, otpTries });
  }, [step, pinTries, otpTries, onState]);

  useEffect(() => {
    if (!forceStep) return;
    const t = window.setTimeout(() => setStep(forceStep), 0);
    return () => window.clearTimeout(t);
  }, [forceStep]);

  /* receiving → success */
  useEffect(() => {
    if (step !== "receiving") return;
    const t = window.setTimeout(() => setStep("success"), 1500);
    return () => window.clearTimeout(t);
  }, [step]);

  /* 15-minute lock countdown (SIMULATED locally) */
  useEffect(() => {
    if (lockLeft <= 0) return;
    const id = window.setInterval(() => setLockLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [lockLeft]);

  const reset = () => {
    setStep("invite");
    setPin("");
    setOtp(["", "", "", "", "", ""]);
    setPinTries(0);
    setOtpTries(0);
    setLockLeft(0);
  };

  const pressPin = (d: string) => {
    if (step !== "pin" || lockLeft > 0) return;
    if (d === "del") {
      setPin((p) => p.slice(0, -1));
      return;
    }
    if (d === "ok") {
      checkPin(pin);
      return;
    }
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) window.setTimeout(() => checkPin(next), 220);
  };

  const checkPin = (value: string) => {
    if (value === DEMO_PIN) {
      setPin("");
      if (pinRequired) setStep("otp");
      else setStep("receiving");
      return;
    }
    const tries = pinTries + 1;
    setPinTries(tries);
    setPin("");
    setShake((s) => s + 1);
    if (tries >= 3) {
      setStep("locked");
      setLockLeft(15 * 60);
    }
  };

  const setOtpAt = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const verifyOtp = () => {
    const code = otp.join("");
    if (code === DEMO_OTP) {
      setOtp(["", "", "", "", "", ""]);
      setStep("receiving");
      return;
    }
    const tries = otpTries + 1;
    setOtpTries(tries);
    setOtp(["", "", "", "", "", ""]);
    setShake((s) => s + 1);
    if (tries >= 3) {
      setStep("locked");
      setLockLeft(15 * 60);
    }
  };

  const mm = String(Math.floor(lockLeft / 60)).padStart(2, "0");
  const ss = String(lockLeft % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="fa-phone">
        <div className="fa-phone__notch" aria-hidden />
        <div className="fa-phone__screen">
          <div className="fa-phone__status">
            <span>Safaricom</span>
            <span className="flex items-center gap-1">
              <Wifi className="h-3 w-3" /> 09:14
            </span>
          </div>

          {step === "invite" && (
            <div key="invite" className="fa-screen">
              <p className="ny-hud !text-[0.58rem]">nalyanya.app/r/{token.replace("NY-RCV-", "").toLowerCase()}</p>
              <div className="mt-6 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[rgba(212,164,55,0.18)]">
                  <Smartphone className="h-5 w-5 text-[#7a5b12]" />
                </span>
                <p className="ny-hud mt-3 !text-[0.56rem]">You&apos;ve been sent</p>
                <p className="ny-num ny-display mt-1 text-[2.1rem] leading-none">{kes(amount)}</p>
                <p className="mt-2 text-sm text-text-secondary">
                  from <strong className="text-text-primary">{sender}</strong>
                </p>
              </div>
              <div className="ny-inset mt-5 px-3.5 py-3 text-center">
                <p className="text-sm text-text-secondary">
                  The money goes to your M-Pesa <span className="ny-num font-semibold text-text-primary">{phone}</span>
                </p>
              </div>
              <button type="button" className="ny-btn ny-btn-primary mt-auto w-full" onClick={() => setStep(pinRequired ? "pin" : "receiving")}>
                {pinRequired ? "Enter your PIN" : "Receive the money"}
              </button>
              <p className="ny-hud mt-2 text-center !text-[0.52rem]">No app · no login · takes 30 seconds</p>
            </div>
          )}

          {step === "pin" && (
            <div key="pin" className="fa-screen">
              <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !-ml-2 self-start !px-2" onClick={() => setStep("invite")}>
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <div className="text-center">
                <p className="ny-display text-lg">Enter your PIN</p>
                <p className="mt-1 text-sm text-text-secondary">Four digits. Three tries, then 15 minutes.</p>
              </div>
              <div className={`fa-pin-dots ${shake ? "fa-shake" : ""}`} key={`dots-${shake}`}>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className={`fa-pin-dot ${i < pin.length ? "is-on" : ""}`} />
                ))}
              </div>
              {pinTries > 0 && (
                <p className="ny-chip ny-chip-danger mx-auto">
                  {pinTries} of 3 tries · {3 - pinTries} left
                </p>
              )}
              <div className="fa-keypad">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                  <button key={d} type="button" className="fa-key" onClick={() => pressPin(d)}>
                    {d}
                  </button>
                ))}
                <button type="button" className="fa-key is-quiet" onClick={() => setPin("")} aria-label="Clear">
                  C
                </button>
                <button type="button" className="fa-key" onClick={() => pressPin("0")}>
                  0
                </button>
                <button type="button" className="fa-key is-quiet" onClick={() => pressPin("del")} aria-label="Delete">
                  <Delete className="mx-auto h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div key="otp" className="fa-screen">
              <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !-ml-2 self-start !px-2" onClick={() => setStep("pin")}>
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <div className="text-center">
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[rgba(31,77,58,0.12)]">
                  <MessageSquare className="h-5 w-5 text-brand-primary" />
                </span>
                <p className="ny-display mt-3 text-lg">We sent a code</p>
                <p className="mt-1.5 text-sm text-text-secondary">
                  to <span className="ny-num">{phone}</span> via {otpChannelLabel[otpChannel]}
                </p>
              </div>
              <div className={`fa-otp ${shake ? "fa-shake" : ""}`} key={`otp-${shake}`}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`Digit ${i + 1}`}
                    value={d}
                    onChange={(e) => setOtpAt(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
                    }}
                  />
                ))}
              </div>
              {otpTries > 0 && (
                <p className="ny-chip ny-chip-danger mx-auto">
                  {otpTries} of 3 tries · {3 - otpTries} left
                </p>
              )}
              <button type="button" className="ny-btn ny-btn-primary mt-auto w-full" disabled={otp.join("").length < 6} onClick={verifyOtp}>
                <ShieldCheck className="h-4 w-4" /> Verify code
              </button>
              <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm mt-2 w-full">
                Send the code again (SIMULATED)
              </button>
            </div>
          )}

          {step === "receiving" && (
            <div key="receiving" className="fa-screen items-center justify-center text-center">
              <span className="fa-done-ring !bg-[rgba(212,164,55,0.16)] !text-[#7a5b12]">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-[rgba(212,164,55,0.35)] border-t-[#7a5b12]" />
              </span>
              <p className="ny-display mt-5 text-lg">Receiving {kes(amount)}</p>
              <p className="mt-1.5 text-sm text-text-secondary">to your M-Pesa {phone}</p>
              <p className="ny-hud mt-6 !text-[0.55rem]">Hold on — a few seconds</p>
            </div>
          )}

          {step === "success" && (
            <div key="success" className="fa-screen items-center justify-center text-center">
              <span className="fa-done-ring">
                <Check className="h-8 w-8" />
              </span>
              <p className="ny-hud mt-4 !text-[0.58rem]">Received</p>
              <p className="ny-num ny-display mt-1 text-[2.1rem] leading-none">{kes(amount)}</p>
              <p className="mt-2 text-sm text-text-secondary">
                from <strong className="text-text-primary">{sender}</strong>
              </p>
              <div className="ny-inset mt-5 w-full px-3.5 py-3">
                <p className="ny-hud !text-[0.52rem]">Reference</p>
                <p className="ny-num mt-1 text-sm font-semibold">{token}</p>
              </div>
              <button type="button" className="ny-btn ny-btn-accent mt-auto w-full" onClick={reset}>
                Done
              </button>
              <p className="ny-hud mt-2 text-center !text-[0.52rem]">Confirmation also goes to {sender.split(" ")[0]}</p>
            </div>
          )}

          {step === "locked" && (
            <div key="locked" className="fa-screen items-center justify-center text-center">
              <span className="fa-done-ring !bg-[rgba(198,40,40,0.12)] !text-danger">
                <Lock className="h-7 w-7" />
              </span>
              <p className="ny-display mt-5 text-lg">Locked for {mm}:{ss}</p>
              <p className="mt-2 text-sm text-text-secondary">
                Three wrong tries. Nobody can guess your PIN — the money stays safe in the family account meanwhile.
              </p>
              <button type="button" className="ny-btn ny-btn-outline mt-auto w-full" onClick={reset}>
                Try again later
              </button>
              <p className="ny-hud mt-2 text-center !text-[0.52rem]">Ask the family admin to reissue the link</p>
            </div>
          )}
        </div>
      </div>

      <div className="ny-chip ny-chip-sim">
        SIMULATED demo · PIN {DEMO_PIN} · code {DEMO_OTP}
      </div>
    </div>
  );
}
