/* ── A-7 Verify OTP · page data (typed, frontend-only) ───────────────────────
   One screen serves four flows. `context` decides where success goes:
   signup → onboard · signin → dashboard (simulated) · forgot → reset ·
   receive → release (simulated).                                           */

import type { ShutterSlide } from "../../components/home/ApertureShutter";
import type { AuthVisual } from "../../components/auth/AuthShell";
import contactPhoneImg from "../../assets/images/contact-phone.jpg";
import elderImg from "../../assets/images/elder.jpg";
import reunionImg from "../../assets/images/reunion.jpg";

export const VERIFY_VISUAL: AuthVisual = {
  src: contactPhoneImg,
  alt: "A woman smiling at her phone",
  kicker: "One code, one phone",
  line: "The code proves it's you.",
  caption: "Six digits. Three tries. Then a short rest.",
};

export const VERIFY_SLIDES: ShutterSlide[] = [
  { src: contactPhoneImg, alt: "A woman smiling at her phone", meta: "The code", caption: "Six digits, straight to your phone." },
  { src: elderImg, alt: "An elder smiling warmly in the sun", meta: "No rush", caption: "It waits 10 minutes. So do we." },
  { src: reunionImg, alt: "A multigenerational family gathered outdoors", meta: "Then home", caption: "Verified once — welcomed everywhere." },
];

export type VerifyContext = "signup" | "signin" | "forgot" | "receive";

export const VERIFY_CONTEXTS: Record<VerifyContext, { title: string; next: string; nextLabel: string; copy: string }> = {
  signup: { title: "Almost in.", next: "/auth/onboard", nextLabel: "Continue → place yourself in the tree", copy: "One code stands between you and your branch." },
  signin: { title: "One more check.", next: "/signin?verified=1", nextLabel: "Continue → the family", copy: "Money moves on this account, so we double-check it's you." },
  forgot: { title: "Prove it's you.", next: "/auth/reset-password", nextLabel: "Continue → choose a new password", copy: "Then the old password stops working for good." },
  receive: { title: "Release the money.", next: "/contact", nextLabel: "Done → back to the family office", copy: "This code releases funds to your M-Pesa line." },
};

export const RESEND_SECONDS = 30;
export const MAX_ATTEMPTS = 3;

export function maskDestination(to: string): string {
  const v = to.trim();
  if (!v) return "your phone";
  if (v.includes("@")) {
    const [user, domain] = v.split("@");
    return `${user.slice(0, 1)}•••@${domain}`;
  }
  const digits = v.replace(/\D/g, "");
  if (digits.length >= 4) return `•••• ${digits.slice(-4)}`;
  return "your phone";
}
