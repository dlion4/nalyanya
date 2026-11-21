/* ── A-3 Onboarding wizard · page data (typed, frontend-only) ─────────────────
   Privacy: the draft lives only in this browser (localStorage). Year of birth
   is a coarse band, never a full date. Payout details stay masked.         */

import type { ShutterSlide } from "../../components/home/ApertureShutter";
import type { AuthVisual } from "../../components/auth/AuthShell";
import familyTraditional from "../../assets/images/family-traditional.jpg";
import schoolImg from "../../assets/images/school.jpg";
import graduationImg from "../../assets/images/graduation.jpg";
import reunionImg from "../../assets/images/reunion.jpg";

export const ONBOARD_VISUAL: AuthVisual = {
  src: familyTraditional,
  alt: "A Nalyanya family in traditional attire",
  kicker: "Karibu — let's place you",
  line: "Six small steps into your branch.",
  caption: "Your draft is saved in this browser — leave any time, come back later.",
};

export const ONBOARD_SLIDES: ShutterSlide[] = [
  { src: familyTraditional, alt: "A family in traditional attire", meta: "Step 1–2 · You", caption: "Names, branch, belonging." },
  { src: schoolImg, alt: "Children learning outdoors", meta: "Step 3 · People", caption: "Link the people closest to you." },
  { src: graduationImg, alt: "Graduates celebrating", meta: "Step 4–5 · Yours", caption: "Language, money, comfort." },
  { src: reunionImg, alt: "A multigenerational family gathered outdoors", meta: "Step 6 · Home", caption: "See where you sit in the tree." },
];

export const ONBOARD_STEPS = ["Profile", "Family", "People", "Comfort", "Money", "Review"] as const;

export const BIRTH_BANDS = ["Before 1960", "1960 – 1979", "1980 – 1999", "2000 – 2012", "After 2012"] as const;
export const GENDERS = ["Female", "Male", "Prefer not to say"] as const;
export const COUNTIES = ["Bungoma", "Kakamega", "Trans-Nzoia", "Nairobi", "Other county", "Diaspora"] as const;
export const CURRENCIES = [
  { id: "kes", label: "KES · Kenyan shilling" },
  { id: "usd", label: "USD · US dollar" },
  { id: "ugx", label: "UGX · Ugandan shilling" },
] as const;

export const COMMS_CHANNELS = [
  { id: "sms", label: "SMS", hint: "Works on any phone" },
  { id: "whatsapp", label: "WhatsApp", hint: "Rich messages + receipts" },
  { id: "email", label: "Email", hint: "Long letters + statements" },
  { id: "inapp", label: "In-app", hint: "Quiet bell inside Nalyanya" },
] as const;

export const PAYOUT_CHANNELS = [
  { id: "mpesa", label: "M-Pesa", hint: "To the phone you signed up with" },
  { id: "bank", label: "Bank", hint: "Added later, admin-approved" },
  { id: "wallet", label: "Family wallet", hint: "Keep it inside Nalyanya" },
] as const;

export const LINK_ROLES = ["Parent", "Spouse", "Child", "Sibling", "Ward"] as const;

export interface OnboardDraft {
  preferredName: string;
  birthBand: string;
  gender: string;
  homeCounty: string;
  currentTown: string;
  familyId: string;
  primaryBranch: string | null;
  extraBranches: string[];
  links: { relativeId: string; role: string }[];
  elderMode: boolean;
  currency: string;
  channels: string[];
  joinSacco: boolean;
  joinChama: boolean;
  payout: string;
  step: number;
}

export const ONBOARD_DRAFT_KEY = "ny-onboard-draft";

export const EMPTY_DRAFT: OnboardDraft = {
  preferredName: "",
  birthBand: "",
  gender: "",
  homeCounty: "",
  currentTown: "",
  familyId: "nalyanya",
  primaryBranch: null,
  extraBranches: [],
  links: [],
  elderMode: false,
  currency: "kes",
  channels: ["sms", "inapp"],
  joinSacco: true,
  joinChama: false,
  payout: "mpesa",
  step: 0,
};

export function readDraft(): OnboardDraft {
  try {
    const raw = localStorage.getItem(ONBOARD_DRAFT_KEY);
    if (!raw) return EMPTY_DRAFT;
    return { ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<OnboardDraft>) };
  } catch {
    return EMPTY_DRAFT;
  }
}

export function saveDraft(d: OnboardDraft) {
  try { localStorage.setItem(ONBOARD_DRAFT_KEY, JSON.stringify(d)); } catch { /* private mode */ }
}

export function clearDraft() {
  try { localStorage.removeItem(ONBOARD_DRAFT_KEY); } catch { /* noop */ }
}
