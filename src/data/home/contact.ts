/* ── H-7 Contact · mock data (typed, frontend-only) ─────────────────────────
   PRIVACY: the office appears at town/county level only; every phone is the
   same undialable mask; people are a role plus a shortened name; emergency
   lines are SIMULATED placeholders, hidden until asked for and never dialable
   from this page. Channels (Call · WhatsApp · SMS · Visit) are built in full
   and resolve to "Ready — connects when the backend is wired".            */

import type { LucideIcon } from "lucide-react";
import {
  Accessibility, CalendarCheck, Crown, Flower2, GraduationCap, HandCoins, HeartPulse,
  KeyRound, Landmark, LifeBuoy, LockKeyhole, Mail, MessageCircle, MessageSquare,
  MessageSquareWarning, PhoneCall, ShieldCheck, TreePine, Users, Wallet,
} from "lucide-react";
import type { ShutterSlide } from "../../components/home/ApertureShutter";
import type { OfficeWindow } from "../../lib/eat";
import { BRANCHES } from "./about";

import writingImg from "../../assets/images/contact-writing.jpg";
import phoneImg from "../../assets/images/contact-phone.jpg";
import officeImg from "../../assets/images/contact-office.jpg";
import headImg from "../../assets/images/leader-head.jpg";
import matriarchImg from "../../assets/images/leader-matriarch.jpg";
import financeImg from "../../assets/images/leader-finance.jpg";
import foundationImg from "../../assets/images/leader-foundation.jpg";
import reunionImg from "../../assets/images/reunion.jpg";
import teaImg from "../../assets/images/tea-hills.jpg";

export const MASKED_PHONE = "+254 7•• ••• •••";
export const OFFICE_EMAIL = "hello@nalyanya.app";
export const PHONE_RE = /^(\+?254|0)[\s-]?(7|1)\d{2}[\s-]?\d{3}[\s-]?\d{3}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const SENSITIVE_RE = /\b(pin|otp|password|passcode|security code)\b/i;

export const OFFICE = {
  town: "Bungoma Town",
  county: "Bungoma County",
  country: "Kenya",
  zone: "East African Time (EAT)",
  note: "About twenty minutes from the family homestead. The street and plot are shared once a visit is booked.",
};

/* ─── S1 · Header ─── */
export const CONTACT_HEADER = {
  eyebrow: "Contact us",
  title: "Reach the",
  titleAccent: "family office.",
  sub: "One message finds the right person — the family head, the council of elders, the finance officer or the Foundation chair. You never need a personal number, and we never publish one.",
};

export const HEADER_SLIDES: ShutterSlide[] = [
  { src: writingImg, alt: "A hand writing in a notebook", meta: "You write", caption: "A sentence in your own words is enough." },
  { src: officeImg, alt: "A call coming in at the family office desk", meta: "The office", caption: "One inbox. A person sorts every note by branch." },
  { src: headImg, alt: "An elder of the family in a warm suit", meta: "The right person", caption: "Money to the finance officer. Blessings to the elders." },
  { src: phoneImg, alt: "A woman smiling at her phone", meta: "You hear back", caption: "By call, WhatsApp, SMS or email — you choose." },
  { src: teaImg, alt: "Green hills in western Kenya", meta: "Bungoma · Kenya", caption: "Rooted at home. Reachable from anywhere." },
];

/* ─── Who a note goes to ─── */
export interface Route { id: string; role: string; person: string; color: string; icon: LucideIcon; handles: string; replyIn: string }

export const ROUTES: Route[] = [
  { id: "family-head", role: "Family Head", person: "Joseph W. N.", color: "#D4A437", icon: Crown, handles: "Blessings, big family decisions, the reunion", replyIn: "2 working days" },
  { id: "elders", role: "Council of Elders", person: "Mama Agnes N.", color: "#5FAE86", icon: Flower2, handles: "Traditions, bereavement, mediation", replyIn: "1 working day" },
  { id: "finance", role: "Finance Officer", person: "Faith C. N.", color: "#E07A4F", icon: Landmark, handles: "Chama, Sacco, loans, receive links", replyIn: "1 working day" },
  { id: "foundation", role: "Foundation Chair", person: "Dr. Grace N. N.", color: "#A98CDD", icon: GraduationCap, handles: "School fees, medical bills, emergency grants", replyIn: "3 working days" },
  { id: "events", role: "Reunion Committee", person: "Kevin N. N. & team", color: "#7CC47F", icon: CalendarCheck, handles: "Reunions, weddings, RSVPs, harambees", replyIn: "2 working days" },
  { id: "helpdesk", role: "Family Help Desk", person: "A grandchild on duty", color: "#EFE6CF", icon: LifeBuoy, handles: "Sign-in, Elder Mode, receive links that fail", replyIn: "1 working day" },
];

export function routeById(id: string): Route {
  return ROUTES.find((r) => r.id === id) ?? ROUTES[0];
}

export const ROUTE_PHOTOS: Record<string, string> = {
  "family-head": headImg,
  elders: matriarchImg,
  finance: financeImg,
  foundation: foundationImg,
  events: reunionImg,
};

/* ─── S2 · Contact form ─── */
export const BRANCH_OPTIONS = BRANCHES.map((b) => b.name);
export const MAX_MESSAGE = 800;
export const MAX_SUBJECT = 80;

export const REPLY_BY = [
  { id: "phone", label: "Phone", detail: "Call, WhatsApp or SMS" },
  { id: "email", label: "Email", detail: "For longer replies" },
] as const;

export const URGENT_LEVELS = [
  { id: "normal", label: "Any time", detail: "Answered in the usual queue" },
  { id: "week", label: "This week", detail: "Answered before Saturday" },
  { id: "urgent", label: "Urgent", detail: "The council is told first" },
] as const;

export const NOT_TO_SEND: { icon: LucideIcon; label: string }[] = [
  { icon: KeyRound, label: "Your M-Pesa or Airtel Money PIN" },
  { icon: LockKeyhole, label: "An OTP or security code" },
  { icon: MessageSquareWarning, label: "Your sign-in password" },
  { icon: Mail, label: "Bank or M-Pesa details in a first note" },
];

export const NEXT_STEPS = [
  "A person at the office reads it the same working day.",
  "It goes to the one person responsible for your branch.",
  "You hear back on the channel you chose.",
];

/* ─── A note's journey ─── */
export interface JourneyStep { n: string; title: string; copy: string; slide: ShutterSlide }
export const JOURNEY_STEPS: JourneyStep[] = [
  { n: "01", title: "You write", copy: "Press Send. The page gives you a ticket reference straight away.", slide: { src: writingImg, alt: "A hand writing in a notebook", meta: "Step 01 · You", caption: "One note, one reference." } },
  { n: "02", title: "The office sorts it", copy: "A person reads it the same working day and picks the branch and the role.", slide: { src: officeImg, alt: "A call coming in at the office desk", meta: "Step 02 · Family office", caption: "Read by a person, not a bot." } },
  { n: "03", title: "The right one reads it", copy: "Only the person responsible sees your words.", slide: { src: matriarchImg, alt: "An elder of the council", meta: "Step 03 · The right person", caption: "Urgent notes go to the council first." } },
  { n: "04", title: "You hear back", copy: "On the channel you chose, within the time shown on the form.", slide: { src: phoneImg, alt: "A woman smiling at her phone", meta: "Step 04 · Reply", caption: "Never asked for a PIN or a code." } },
];

/* ─── S3 · Channels ─── */
export type ChannelId = "call" | "whatsapp" | "sms" | "email" | "visit";
export interface Channel { id: ChannelId; icon: LucideIcon; title: string; lead: string; detail: string; action: string }

export const CHANNELS: Channel[] = [
  { id: "call", icon: PhoneCall, title: "Call back", lead: "They call you. You never need our number.", detail: "Mon–Fri 08:00–17:00 EAT", action: "Request a call" },
  { id: "whatsapp", icon: MessageCircle, title: "WhatsApp", lead: "Quick questions, reminders and receipts.", detail: MASKED_PHONE, action: "Open WhatsApp →" },
  { id: "sms", icon: MessageSquare, title: "SMS", lead: "For any phone, smart or not.", detail: "Text the word NALYANYA", action: "See how →" },
  { id: "email", icon: Mail, title: "Email", lead: "For longer notes and documents.", detail: OFFICE_EMAIL, action: "Write an email →" },
  { id: "visit", icon: CalendarCheck, title: "Visit", lead: "Come and sit down in Bungoma.", detail: "By appointment only", action: "Book a visit →" },
];

export const WHATSAPP_CAN = ["Send a note to the family office", "Get reunion reminders and RSVP by reply", "Receive a receipt when a contribution lands (Phase 2)"];
export const WHATSAPP_NEVER = "Message you first to ask for a PIN, an OTP or a password.";
export const SMS_STEPS = ["Text NALYANYA HELP to the office line.", "The office texts back within working hours.", "Standard rates from your network apply."];

export const CALL_TIMES = [
  { id: "morning", label: "Morning", detail: "08:00 – 12:00" },
  { id: "afternoon", label: "Afternoon", detail: "12:00 – 17:00" },
  { id: "saturday", label: "Saturday morning", detail: "09:00 – 13:00" },
] as const;
export const VISIT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ─── S4 · Family office address & hours ─── */
export const OFFICE_HOURS: (OfficeWindow | null)[] = [
  null,
  { open: 8 * 60, close: 17 * 60, label: "08:00 – 17:00", note: "Notes, calls and visits" },
  { open: 8 * 60, close: 17 * 60, label: "08:00 – 17:00", note: "Notes, calls and visits" },
  { open: 8 * 60, close: 17 * 60, label: "08:00 – 17:00", note: "Elder call-backs in the morning" },
  { open: 8 * 60, close: 17 * 60, label: "08:00 – 17:00", note: "Notes, calls and visits" },
  { open: 8 * 60, close: 16 * 60, label: "08:00 – 16:00", note: "Finance officer at the desk" },
  { open: 9 * 60, close: 13 * 60, label: "09:00 – 13:00", note: "Elder call-backs only" },
];
export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const SUNDAY_NOTE = "Closed. For emergencies, tell your branch head.";

export const ELDER_SCRIPT =
  "You can reach the Nalyanya family office by writing a note on this page, or by asking a grandchild to send it for you. The office is in Bungoma Town. It is open Monday to Friday, from eight in the morning to five in the evening, East African Time. Nobody from the family office will ever ask you for your M-Pesa P I N, or for a code sent to your phone.";

export const VEIL_FIELDS = [
  { label: "Street & plot", value: "••••••• •••••, Bungoma Town" },
  { label: "P.O. Box", value: "Box ••• – 5•2••, Bungoma" },
  { label: "Office line", value: MASKED_PHONE },
  { label: "Email", value: OFFICE_EMAIL },
];

export const KENYA_PATH = "M7 26 L71 13 L75 18 L146 46 L194 51 L238 33 L275 35 L245 73 L245 195 L264 220 L218 248 L204 274 L197 297 L184 319 L133 281 L129 264 L7 198 L7 158 L27 129 L37 83 L20 43 Z";
export const OFFICE_PIN = { x: 26, y: 146 };
export const BRANCH_TOWNS = [
  { name: "Kakamega", x: 33, y: 158, dy: 3 },
  { name: "Trans-Nzoia", x: 41, y: 129, dy: -6 },
  { name: "Nairobi", x: 103, y: 208, dy: 3 },
];

/* ─── S5 · Request support ─── */
export interface SupportLink { icon: LucideIcon; title: string; copy: string; cta: string; to?: string; scroll?: string }
export const SUPPORT_LINKS: SupportLink[] = [
  { icon: KeyRound, title: "I can't log in", copy: "Reset it with a code sent to your phone or email.", cta: "Reset password →", to: "/auth/forgot-password" },
  { icon: Wallet, title: "I want to receive money sent to me", copy: "Open your link and enter your own 4-digit PIN.", cta: "See how it works ↓", scroll: "receive" },
  { icon: Landmark, title: "I want to change my bank or M-Pesa", copy: "An admin approves it first, so money cannot be redirected.", cta: "Sign in to request →", to: "/signin" },
  { icon: Users, title: "I want to join the family", copy: "Pick your branch, then your generation.", cta: "Join the family →", to: "/auth/signup" },
];

export const RECEIVE_STEPS = [
  { title: "Open your link", copy: "Tap the link a relative sent you. No app, no login." },
  { title: "Enter your 4-digit PIN", copy: "The PIN only you know — never your M-Pesa PIN." },
  { title: "Enter the code", copy: "A 6-digit code arrives by SMS (simulated in this build)." },
  { title: "Money arrives", copy: "You get an M-Pesa message and a reference." },
];

/* ─── S6 · FAQ ─── */
export const FAQ: { icon: LucideIcon; title: string; copy: string }[] = [
  { icon: TreePine, title: "How lineage works", copy: "Every person sits once in the family tree and can hold many roles — a father in one branch, an uncle in another, a son in a third. The tree is kept by admins. If something is wrong, send a note and an elder confirms it before anything changes." },
  { icon: KeyRound, title: "How PIN receive links work", copy: "A relative sends you a link. You open it, enter your own 4-digit PIN, then a one-time code sent to your phone. The money goes to the M-Pesa line registered for you. No app, no password, no login." },
  { icon: HandCoins, title: "How contributions work", copy: "Open a cause — a wedding, a hospital bill, a harambee — choose an amount, and give by M-Pesa or from your family wallet. Every shilling is posted to one ledger that every member can see." },
  { icon: ShieldCheck, title: "Is my data safe?", copy: "Public pages like this one show roles, shortened names and counties only. Phone numbers, addresses, dates of birth and money details stay behind family sign-in, and a change to where your money goes needs an admin's approval. We follow Kenya's Data Protection Act 2019." },
  { icon: Accessibility, title: "What does Elder Mode do?", copy: "One switch makes the text larger, the buttons bigger and the motion calmer, and turns tables into cards. Money becomes a 4-digit PIN instead of a password. A grandchild can switch it on once and it stays on for that phone." },
];

/* ─── S7 · Emergency contacts (SIMULATED placeholders) ─── */
export interface Emergency { id: string; icon: LucideIcon; title: string; who: string; hours: string; placeholder: string }
export const EMERGENCIES: Emergency[] = [
  { id: "line", icon: PhoneCall, title: "Emergency line", who: "The family head is woken, not a bot.", hours: "Any day, any time", placeholder: "0700 000 000" },
  { id: "medical", icon: HeartPulse, title: "Medical", who: "A nurse in the family and the Foundation chair.", hours: "Any day, any time", placeholder: "0700 000 001" },
  { id: "funeral", icon: Flower2, title: "Funeral organiser", who: "The council of elders and the branch at home.", hours: "Any day, any time", placeholder: "0700 000 002" },
];

/* ─── CTA ─── */
export const CONTACT_CTA = {
  eyebrow: "The family office",
  title: "One note is",
  titleAccent: "enough.",
  copy: "Write it in your own words. The right person reads it and you hear back — without anyone's private number changing hands.",
  primary: { label: "Join the family", to: "/auth/signup" },
  secondary: { label: "About the family", to: "/about" },
};
