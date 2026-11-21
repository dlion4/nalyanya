/* ── H-1 Landing · mock data (typed, frontend-only) ───────────────────────
   Privacy note: no personal data (phones, addresses, DOBs, bank details) is
   shown anywhere on this page. Family members are named with roles only.
   External services (M-Pesa, WhatsApp, Google Drive, SMS, OTP) are always
   surfaced as clearly-labeled SIMULATED states.                            */

import {
  TreePine, Wallet, Images, ShieldCheck, MessageSquare, Landmark,
  LandmarkIcon, KeyRound, GraduationCap, HeartPulse, Sparkles, Sun,
  Coins, HandCoins, Globe2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import reunionImg from "../../assets/images/reunion.jpg";
import graduationImg from "../../assets/images/graduation.jpg";
import weddingImg from "../../assets/images/wedding.jpg";
import schoolImg from "../../assets/images/school.jpg";
import elderImg from "../../assets/images/elder.jpg";
import savannaImg from "../../assets/images/savanna.jpg";
import familyTraditionalImg from "../../assets/images/family-traditional.jpg";
import traditionalGroupImg from "../../assets/images/traditional-group.jpg";
import grandmotherImg from "../../assets/images/grandmother.jpg";
import outdoorGraduationImg from "../../assets/images/outdoor-graduation.jpg";

/* ─── Kind of media ─── */

export const HERO_PHOTO = reunionImg;
export const HERITAGE_IMAGES = { primary: reunionImg, secondary: familyTraditionalImg, landscape: savannaImg };
export const ELDER_PHOTO = elderImg;
export const FOUNDATION_PHOTO = schoolImg;

/* ─── S2 · Feature cards ─── */

export interface FeatureCard {
  id: string;
  icon: LucideIcon;
  accent: string;
  eyebrow: string;
  title: string;
  copy: string;
  cta: string;
  target: string;
}

export const FEATURE_CARDS: FeatureCard[] = [
  {
    id: "lineage",
    icon: TreePine,
    accent: "#1F4D3A",
    eyebrow: "3D Lineage",
    title: "Walk every branch in 3D",
    copy: "Roots at Mzee Victor Nalyanya, spread across 12 branches and 5 generations. Spin the tree, find where you belong, and see who you are in one glance.",
    cta: "Explore the story",
    target: "#lineage",
  },
  {
    id: "finance",
    icon: Wallet,
    accent: "#B5532A",
    eyebrow: "Family Finance",
    title: "Chama · Sacco · Loans",
    copy: "One pool for the family — chama rotation, Sacco shares, and honest loans. Elder receive links bring money to people who were never online.",
    cta: "See the pool",
    target: "#finance",
  },
  {
    id: "memories",
    icon: Images,
    accent: "#6A4C93",
    eyebrow: "Memories",
    title: "Every moment, kept",
    copy: "Weddings, graduations, reunions and in-memoriam — a living gallery of the family's milestones, kept with who they belonged with.",
    cta: "Open the gallery",
    target: "#memories",
  },
];

/* ─── S3 · Trust badges ─── */

export interface TrustBadge { icon: LucideIcon; label: string }

export const TRUST_BADGES: TrustBadge[] = [
  { icon: ShieldCheck, label: "M-Pesa ready" },
  { icon: MessageSquare, label: "WhatsApp broadcasts" },
  { icon: Images, label: "Google Drive gallery" },
  { icon: KeyRound, label: "PIN-only receive for elders" },
  { icon: Landmark, label: "AES-256 vault (Phase 2)" },
  { icon: Globe2, label: "Family in 3 countries" },
];

/* ─── S4 · Count-up stats ─── */

export interface Stat { value: number; suffix: string; label: string; detail: string }

export const STATS: Stat[] = [
  { value: 240, suffix: "+", label: "Members", detail: "across every branch" },
  { value: 5, suffix: "", label: "Generations", detail: "root to newest grandchild" },
  { value: 12, suffix: "", label: "Branches", detail: "Bungoma · Kakamega · Nairobi · Trans-Nzoia" },
  { value: 4, suffix: "", label: "Counties", detail: "and 2 diaspora countries" },
  { value: 3, suffix: "", label: "Countries", detail: "KE · UG · US" },
];

/* ─── S6 · Heritage timeline ─── */

export interface HeritageNode { year: string; title: string; copy: string; }

export const HERITAGE_TIMELINE: HeritageNode[] = [
  { year: "1938", title: "Rooted in Bungoma", copy: "Mzee Victor Nalyanya plants the first stone — one household, one name, one promise." },
  { year: "1965", title: "First branches into Nairobi", copy: "The children follow work south. New branches take root without leaving home." },
  { year: "1990", title: "The diaspora weave", copy: "Kampala, Mombasa, London — the tree reaches the next country while the branches stay connected." },
  { year: "2025", title: "12 branches · 5 generations", copy: "One living tree: lineage, finance and memories in a single home." },
];

export const HERITAGE_CHIPS = [
  { gen: "1st", label: "Rooted hard" },
  { gen: "2nd", label: "First branches" },
  { gen: "3rd", label: "Diaspora" },
  { gen: "4th", label: "Growing stock" },
  { gen: "5th", label: "Newest leaves" },
];

export const HERITAGE_MOTTO = "Imarishi";
export const HERITAGE_MOTTO_COPY = "“We stand firm.”";

/* ─── S7 · Memories ─── */

export interface MemoryItem { id: string; src: string; caption: string; album: string; year: string }

export const MEMORIES: MemoryItem[] = [
  { id: "reunion", src: reunionImg, caption: "The 2024 reunion — friends, cousins and grand-cousins in one yard", album: "Reunions", year: "2024" },
  { id: "graduation", src: graduationImg, caption: "Faith’s graduation — 10th in her line of 4", album: "Graduations", year: "2023" },
  { id: "wedding", src: weddingImg, caption: "Sunday blessing — the Kakamega branch", album: "Weddings", year: "2022" },
  { id: "school", src: schoolImg, caption: "Nsenga Primary School — the class Nalyanya funds", album: "Foundation", year: "2024" },
  { id: "elder", src: elderImg, caption: "Mzee Suleiman’s milestone — his 90th year", album: "In Memoriam", year: "2024" },
  { id: "traditional", src: traditionalGroupImg, caption: "Ceremony at the Bungoma homestead", album: "Traditions", year: "2021" },
  { id: "outdoor", src: outdoorGraduationImg, caption: "Trans-Nzoia outdoor graduation", album: "Graduations", year: "2025" },
  { id: "grandmother", src: grandmotherImg, caption: "Grandmother Chambo — the keepers of the stories", album: "Family", year: "2023" },
];

/* ─── S9 · Family finance cards ─── */

export interface FinanceCard {
  id: string;
  icon: LucideIcon;
  accent: string;
  eyebrow: string;
  title: string;
  figure: string;
  detail: string;
  progress: number;
  progressLabel: string;
  footnote: string;
}

export const FINANCE_CARDS: FinanceCard[] = [
  {
    id: "chama",
    icon: Coins,
    accent: "#1F4D3A",
    eyebrow: "Chama · weekly round",
    title: "Family rotations",
    figure: "KES 480,000 pool",
    detail: "Next recipient — Kakamega branch, 2 this week",
    progress: 0.78,
    progressLabel: "78% of round raised",
    footnote: "Payouts simulated in this frontend build",
  },
  {
    id: "sacco",
    icon: LandmarkIcon,
    accent: "#B5532A",
    eyebrow: "Sacco · shares & loans",
    title: "Shared savings",
    figure: "KES 2.4M pool",
    detail: "182 shares issued to members",
    progress: 0.72,
    progressLabel: "72% dividend-payable",
    footnote: "Shares accrue on a simulated basis",
  },
  {
    id: "receive",
    icon: KeyRound,
    accent: "#6A4C93",
    eyebrow: "Elder receive",
    title: "4-digit PIN → no login",
    figure: "KES 25,000 max",
    detail: "Public link — opens on any phone, no app",
    progress: 1,
    progressLabel: "No login needed",
    footnote: "Ready — connects when the backend is wired",
  },
];

/* ─── S10 · Foundation ─── */

export interface FoundationImpact { value: number; suffix: string; prefix: string; label: string }

export const FOUNDATION_IMPACT: FoundationImpact[] = [
  { value: 128, suffix: "", prefix: "", label: "students sponsored" },
  { value: 2.1, suffix: "M", prefix: "KES ", label: "medical bills cleared" },
  { value: 46, suffix: "", prefix: "", label: "emergencies answered" },
];

export const FOUNDATION_CAUSE = {
  title: "Nsenga Primary School — books & notebooks",
  goal: 250_000,
  raised: 196_000,
  pct: 0.78,
  beneficiary: "Children in the third and fourth grade",
  org: "Nalyanya Foundation",
};

export const FOUNDATION_PHIL: { icon: LucideIcon; title: string; copy: string }[] = [
  { icon: GraduationCap, title: "Education", copy: "Books, uniforms and school fees for the next generation of Nalyanyas — and neighbours." },
  { icon: HeartPulse, title: "Medical", copy: "Hospital bills, drugs and diagnostics for members and their families." },
  { icon: Sparkles, title: "Emergencies", copy: "Fast, honest answers when life lands hard — no forms, no fine print." },
];

/* ─── S11 · Voices ─── */

export interface Voice { quote: string; name: string; role: string; initials: string; branch: string }

export const VOICES: Voice[] = [
  {
    quote: "I find my grandfather’s generation in the 3D tree in one glance — no one has to ask who their cousins are.",
    name: "Brian Otieno Nalyanya",
    role: "Branch chair",
    branch: "Kakamega",
    initials: "BN",
  },
  {
    quote: "The chama payout lands where it should. Everyone sees who got what — no one has to guess.",
    name: "Faith Chebet Nalyanya",
    role: "Family treasurer",
    branch: "Nairobi",
    initials: "FC",
  },
  {
    quote: "I sent my mother a receive link — 4 digits later, money lands. No app, no password, no fine print.",
    name: "Hamza Hassan Nalyanya",
    role: "Family member",
    branch: "Bungoma",
    initials: "HH",
  },
];

/* ─── S12 · Integrations ─── */

export interface Integration { icon: LucideIcon; name: string; capability: string }

export const INTEGRATIONS: Integration[] = [
  { icon: Landmark, name: "M-Pesa", capability: "B2C · STK Push · chama + Sacco payouts" },
  { icon: MessageSquare, name: "WhatsApp", capability: "Family broadcasts · receipts · RSVP reminders" },
  { icon: Sun, name: "Africa’s Talking SMS", capability: "Alerts · chama rotation · OTP delivery" },
  { icon: Images, name: "Google Drive", capability: "Gallery pull by folder ID · album sync" },
  { icon: HandCoins, name: "Bank EFT", capability: "Large payouts · foundation disbursements" },
  { icon: Coins, name: "OTP delivery", capability: "PIN receive links · 2FA before money moves" },
];

/* ─── S2 · Hero ─── */

export const HERO = {
  eyebrow: "Nalyanya · Family · Kenya",
  titleTop: "Our roots. Our people.",
  titleBottom: "One home.",
  sub: "From Mzee Victor Nalyanya to the newest grandchild — every branch, every memory, every shilling in one place. Built so grandma can use it too.",
  ctaPrimary: "Explore the family tree",
  ctaSecondary: "Join the family",
  microChips: ["Elder-first", "3D lineage", "PIN-only receive"],
};

/* ─── S13 · Footer ─── */

export const FOOTER = {
  tagline: "The family home for lineage, money and memories — old and young together.",
  motto: HERITAGE_MOTTO,
  mottoCopy: HERITAGE_MOTTO_COPY,
  email: "hello@nalyanya.app",
  locations: "Bungoma · Kakamega · Nairobi · Trans-Nzoia",
  privacy: "No personal data on this page. Members are named with roles only — phone numbers, addresses and bank details live behind a sign-in.",
};
