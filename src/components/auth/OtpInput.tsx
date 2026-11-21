/* ── OtpInput — reusable split-code entry (OTP 6-digit, PIN 4-digit) ──────────
   Auto-advance, backspace-to-previous, full-code paste, numeric keypad.
   Digits are masked when `masked` (receive PIN). Never logs the value.    */

import { useEffect, useRef } from "react";
import { cn } from "../../utils/cn";

interface Props {
  length?: 4 | 6;
  value: string;
  onChange: (v: string) => void;
  onComplete?: (v: string) => void;
  masked?: boolean;
  error?: boolean;
  disabled?: boolean;
  label: string;
  autoFocus?: boolean;
}

export default function OtpInput({ length = 6, value, onChange, onComplete, masked = false, error = false, disabled = false, label, autoFocus = true }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");

  useEffect(() => {
    if (autoFocus && !disabled) {
      const t = window.setTimeout(() => refs.current[0]?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [autoFocus, disabled]);

  const set = (next: string) => {
    const clean = next.replace(/\D/g, "").slice(0, length);
    onChange(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  const focusBox = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, i))];
    el?.focus();
    el?.select();
  };

  return (
    <div role="group" aria-label={label} className="flex justify-between gap-1.5 sm:gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type={masked ? "password" : "text"}
          inputMode="numeric"
          autoComplete={length === 6 ? "one-time-code" : "off"}
          maxLength={1}
          value={d}
          disabled={disabled}
          aria-label={`${label} — digit ${i + 1} of ${length}`}
          onChange={(e) => {
            const ch = e.target.value.replace(/\D/g, "").slice(-1);
            if (!ch) { return; }
            const arr = value.split("");
            arr[i] = ch;
            set(arr.join(""));
            if (i < length - 1) focusBox(i + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              if (value[i]) {
                const arr = value.split("");
                arr.splice(i, 1);
                set(arr.join(""));
              } else if (i > 0) {
                const arr = value.split("");
                arr.splice(i - 1, 1);
                set(arr.join(""));
                focusBox(i - 1);
              }
            } else if (e.key === "ArrowLeft") { e.preventDefault(); focusBox(i - 1); }
            else if (e.key === "ArrowRight") { e.preventDefault(); focusBox(i + 1); }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData("text");
            if (!text) return;
            const arr = value.split("");
            const clean = text.replace(/\D/g, "").slice(0, length - i).split("");
            clean.forEach((ch, k) => { arr[i + k] = ch; });
            set(arr.join(""));
            focusBox(Math.min(length - 1, i + clean.length));
          }}
          onFocus={(e) => e.target.select()}
          className={cn("auth-code-box", d && "is-filled", error && "is-error")}
        />
      ))}
    </div>
  );
}
