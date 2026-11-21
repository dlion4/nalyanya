/* ── A-2 Sign In · page data (typed, frontend-only) ──────────────────────────
   Privacy: no credentials, no phone numbers. Recent families are ids only,
   resolved against the public family list.                                 */

import type { ShutterSlide } from "../../components/home/ApertureShutter";
import type { AuthVisual } from "../../components/auth/AuthShell";
import elderImg from "../../assets/images/elder.jpg";
import reunionImg from "../../assets/images/reunion.jpg";
import savannaImg from "../../assets/images/savanna.jpg";

export const SIGNIN_VISUAL: AuthVisual = {
  src: elderImg,
  alt: "An elder smiling warmly in the sun",
  kicker: "Imarishi — we stand firm",
  line: "Welcome home. The tree kept your place.",
  caption: "Bungoma · Kakamega · Trans-Nzoia · Nairobi",
};

export const SIGNIN_SLIDES: ShutterSlide[] = [
  { src: elderImg, alt: "An elder smiling warmly in the sun", meta: "Karibu tena", caption: "The tree kept your place." },
  { src: reunionImg, alt: "A multigenerational family gathered outdoors", meta: "240+ members", caption: "Five generations, one home." },
  { src: savannaImg, alt: "Acacia trees on the savanna at golden hour", meta: "Bungoma · Kenya", caption: "Rooted at home, reachable from anywhere." },
];

export const SIGNIN_ELDER_STEPS = [
  "They open the link",
  "Enter their 4-digit PIN",
  "Enter the code that arrives by SMS",
] as const;

export const SIGNIN_SAMPLE_LINK = "nalyanya.app/r/NY-RCV-7K2Q";
