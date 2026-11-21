/* ── A-1 Sign Up · page data (typed, frontend-only) ────────────────────────── */

import type { ShutterSlide } from "../../components/home/ApertureShutter";
import type { AuthVisual } from "../../components/auth/AuthShell";
import reunionImg from "../../assets/images/reunion.jpg";
import familyTraditionalImg from "../../assets/images/family-traditional.jpg";
import savannaImg from "../../assets/images/savanna.jpg";

export const SIGNUP_VISUAL: AuthVisual = {
  src: reunionImg,
  alt: "A multigenerational family gathered outdoors",
  kicker: "Imarishi — we stand firm",
  line: "Every branch remembers who it came from.",
  caption: "Bungoma · Kakamega · Trans-Nzoia · Nairobi",
};

export const SIGNUP_SLIDES: ShutterSlide[] = [
  { src: reunionImg, alt: "A multigenerational family gathered outdoors", meta: "Step 1 · Family", caption: "Choose your family first — we keep you there." },
  { src: familyTraditionalImg, alt: "A family in traditional attire", meta: "Step 2 · You", caption: "A name, a phone, a password. Two minutes." },
  { src: savannaImg, alt: "Acacia trees on the savanna at golden hour", meta: "Step 3 · Verify", caption: "One code, and the tree has a new leaf." },
];
