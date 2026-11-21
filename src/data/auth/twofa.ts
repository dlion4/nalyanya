/* ── A-8 2FA & receive PIN · page data (typed, frontend-only) ─────────────────
   Two locks, two keys: a TOTP secret for the account, a 4-digit PIN for
   receiving money without logging in. Secrets here are clearly-labeled
   simulated placeholders.                                                  */

import type { ShutterSlide } from "../../components/home/ApertureShutter";
import type { AuthVisual } from "../../components/auth/AuthShell";
import elderImg from "../../assets/images/elder.jpg";
import grandmotherImg from "../../assets/images/grandmother.jpg";
import contactPhoneImg from "../../assets/images/contact-phone.jpg";

export const TWOFA_VISUAL: AuthVisual = {
  src: elderImg,
  alt: "An elder smiling warmly in the sun",
  kicker: "Two locks, two keys",
  line: "Lock the account. Free the elder.",
  caption: "A code for you · a PIN for grandma — never the same number.",
};

export const TWOFA_SLIDES: ShutterSlide[] = [
  { src: elderImg, alt: "An elder smiling warmly in the sun", meta: "Key 1 · Receive PIN", caption: "Four digits. No app. No password." },
  { src: grandmotherImg, alt: "A grandmother with her granddaughters", meta: "The elder flow", caption: "Tap a link, enter the PIN, money lands." },
  { src: contactPhoneImg, alt: "A woman smiling at her phone", meta: "Key 2 · 2FA", caption: "A changing code guards the account." },
];

export const TOTP_STEPS = [
  "Open Google Authenticator, 1Password or any TOTP app.",
  "Scan the square — or type the secret by hand.",
  "Enter the 6-digit code the app shows right now.",
] as const;

export const SIMULATED_TOTP_SECRET = "NYLY J4K2 Q7MD P3XA";
export const SIMULATED_TOTP_CODE = "123456";

export const RECOVERY_CODES = [
  "imara-2418-kito",
  "zawadi-9031-moyo",
  "baraka-5572-nuru",
  "amani-1189-jabali",
  "neema-7740-tumaini",
  "upendo-3326-ibada",
] as const;

export const PIN_RULES = [
  "Four digits you'll actually remember.",
  "Not 1234, not 0000, not your birth year.",
  "Never your M-Pesa PIN — keep them different.",
] as const;

export const OTP_CHANNELS = [
  { id: "sms", label: "SMS", hint: "Works on kabambe too" },
  { id: "whatsapp", label: "WhatsApp", hint: "If the elder uses it" },
] as const;

export function pinIssue(pin: string): string | null {
  if (!/^\d{4}$/.test(pin)) return "Four digits, numbers only.";
  if (/^(\d)\1{3}$/.test(pin)) return "Not all the same digit — too easy to guess.";
  const seq = "0123456789";
  const rev = "9876543210";
  if (seq.includes(pin) || rev.includes(pin)) return "Not a sequence like 1234.";
  const year = new Date().getFullYear();
  if (Number(pin) >= 1900 && Number(pin) <= year) return "Not a year — too easy to guess.";
  return null;
}
