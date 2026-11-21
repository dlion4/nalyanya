/* ── A-5 Forgot password · page data (typed, frontend-only) ────────────────── */

import type { ShutterSlide } from "../../components/home/ApertureShutter";
import type { AuthVisual } from "../../components/auth/AuthShell";
import contactPhoneImg from "../../assets/images/contact-phone.jpg";
import contactOfficeImg from "../../assets/images/contact-office.jpg";
import reunionImg from "../../assets/images/reunion.jpg";

export const FORGOT_VISUAL: AuthVisual = {
  src: contactPhoneImg,
  alt: "A woman smiling at her phone",
  kicker: "Locked out? Pole.",
  line: "A code brings you home.",
  caption: "Thirty seconds now — a new password right after.",
};

export const FORGOT_SLIDES: ShutterSlide[] = [
  { src: contactPhoneImg, alt: "A woman smiling at her phone", meta: "Step 1 · You", caption: "Tell us the phone or email you signed up with." },
  { src: contactOfficeImg, alt: "A call coming in at the office desk", meta: "Step 2 · The code", caption: "A 6-digit code — SIMULATED in this build." },
  { src: reunionImg, alt: "A multigenerational family gathered outdoors", meta: "Step 3 · Home", caption: "New password, straight back in." },
];

export const FORGOT_CHANNELS = [
  { id: "sms", label: "SMS", hint: "Any phone · fastest", eta: "seconds" },
  { id: "whatsapp", label: "WhatsApp", hint: "If you already use it", eta: "seconds" },
  { id: "email", label: "Email", hint: "Check spam too", eta: "a minute" },
] as const;
