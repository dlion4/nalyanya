/* ── A-6 Reset password · page data (typed, frontend-only) ─────────────────── */

import type { ShutterSlide } from "../../components/home/ApertureShutter";
import type { AuthVisual } from "../../components/auth/AuthShell";
import contactWritingImg from "../../assets/images/contact-writing.jpg";
import savannaImg from "../../assets/images/savanna.jpg";
import familyTraditionalImg from "../../assets/images/family-traditional.jpg";

export const RESET_VISUAL: AuthVisual = {
  src: contactWritingImg,
  alt: "A hand writing in a notebook",
  kicker: "Fresh start",
  line: "Choose words only you know.",
  caption: "Eight characters or more — then straight back to sign-in.",
};

export const RESET_SLIDES: ShutterSlide[] = [
  { src: contactWritingImg, alt: "A hand writing in a notebook", meta: "New password", caption: "Write it down somewhere safe — not here." },
  { src: savannaImg, alt: "Acacia trees on the savanna at golden hour", meta: "One key", caption: "This password opens the account only." },
  { src: familyTraditionalImg, alt: "A family in traditional attire", meta: "Money stays separate", caption: "Your receive PIN never changes with it." },
];

export const RESET_TIPS = [
  "Use a phrase you can picture — three random words beat one clever one.",
  "Never reuse the M-Pesa PIN or the receive PIN as this password.",
  "On a shared phone, don't save it in the browser.",
] as const;
