/* T-15 Account — the member's own identity and money-routing profile (frontend-only Phase 1).
   Money-routing fields (mobile, bank, Airtel, receive PIN) are admin-gated by design: a change
   creates a REQUEST, the old value stays active until an admin approves, and every action is
   audit-logged. Everything else is self-editable. No network calls; OTP and 2FA are simulated. */

import type { Frame } from "@/data/dashboard/contributions";

export const ME_ID = "m05";
export const AS_OF = "2025-11-18";

export type Gender = "male" | "female" | "prefer-not-to-say";
export type Language = "en" | "sw";
export type Tone = "plain" | "gold" | "red";
export type ReqStatus = "submitted" | "under-review" | "approved" | "rejected";
export type ChangeField = "mobile" | "bank" | "airtel" | "pin" | "password";
export type ConsentAction = "viewed" | "granted" | "withdrawn";

export type Profile = {
  name: string;
  preferredName: string;
  gender: Gender;
  birthYear: number;
  branch: string;
  town: string;
  bio: string;
  role: string;
  memberRef: string;
  photo: string;
  email: string;
  phone: string;
  bank: string;
  airtel: string;
  wallet: string;
  pinSet: boolean;
  twoFa: boolean;
  consentVersion: string;
};

export type ChangeRequest = {
  id: string;
  ref: string;
  field: ChangeField;
  label: string;
  current: string;
  requested: string;
  reason: string;
  submitted: string;
  status: ReqStatus;
  adminNote: string;
  tone: Tone;
};

export type Session = {
  id: string;
  device: string;
  location: string;
  ip: string;
  at: string;
  current: boolean;
};

export type ConsentEntry = {
  id: string;
  action: ConsentAction;
  at: string;
  note: string;
  tone: Tone;
};

export type AuditEntry = {
  ref: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
  detail: string;
  tone: Tone;
};

export const profileSeed: Profile = {
  name: "Peter Wanyama Nalyanya",
  preferredName: "Peter",
  gender: "male",
  birthYear: 1982,
  branch: "Nairobi",
  town: "Karen, Nairobi",
  bio: "Nairobi branch treasurer. Keeps the family ledger tidy and the elders' phones working.",
  role: "Finance officer",
  memberRef: "NY-MBR-00005",
  photo: "/images/frame-reunion.jpg",
  email: "peter.wanyama@nalyanya.example",
  phone: "+2547 ··· 2210",
  bank: "Equity ···· 4471",
  airtel: "+2547 ··· 5512",
  wallet: "KES 24,300",
  pinSet: true,
  twoFa: true,
  consentVersion: "NY-CONSENT-2025-v3",
};

export const changeRequestsSeed: ChangeRequest[] = [
  { id: "r1", ref: "NY-CHG-2025-00041", field: "mobile", label: "Mobile number", current: "+2547 ··· 2210", requested: "+2547 ··· 8899", reason: "New Safaricom line after the old one was stolen", submitted: "2025-11-16", status: "under-review", adminNote: "OTP verified on the old number. Waiting for the finance officer's co-sign.", tone: "plain" },
  { id: "r2", ref: "NY-CHG-2025-00038", field: "bank", label: "Bank account", current: "Equity ···· 4471", requested: "KCB ···· 9902", reason: "Moved the salary account to KCB", submitted: "2025-11-08", status: "approved", adminNote: "Approved by Peter W. after OTP and a call. New account is active.", tone: "gold" },
  { id: "r3", ref: "NY-CHG-2025-00033", field: "pin", label: "Receive PIN", current: "••••", requested: "New 4-digit PIN", reason: "Elder forgot the PIN", submitted: "2025-11-04", status: "rejected", adminNote: "Asked to come in with ID. Rejected pending in-person verification.", tone: "red" },
];

export const sessionsSeed: Session[] = [
  { id: "s1", device: "This device · Chrome", location: "Nairobi", ip: "41.80.···.··", at: "Now", current: true },
  { id: "s2", device: "iPhone · Safari", location: "Karen, Nairobi", ip: "41.80.···.··", at: "18 Nov · 09:20", current: false },
  { id: "s3", device: "Android · Chrome", location: "Kitale", ip: "197.232.···.··", at: "17 Nov · 21:14", current: false },
  { id: "s4", device: "Unknown · Firefox", location: "London", ip: "86.181.···.··", at: "12 Nov · 14:02", current: false },
];

export const consentSeed: ConsentEntry[] = [
  { id: "c1", action: "granted", at: "2025-11-18 08:40", note: "Consent to the family data policy (v3) was recorded when this account was set up.", tone: "plain" },
  { id: "c2", action: "granted", at: "2025-11-16 09:31", note: "OTP verified on the current number for the mobile change request.", tone: "gold" },
  { id: "c3", action: "viewed", at: "2025-11-10 14:18", note: "The data-privacy notice was opened from this account page.", tone: "plain" },
  { id: "c4", action: "granted", at: "2025-09-02 07:55", note: "The photo and WhatsApp contact were added by the member.", tone: "plain" },
  { id: "c5", action: "withdrawn", at: "2025-07-20 12:00", note: "An old secondary email was removed from the contact preferences.", tone: "red" },
];

export const auditSeed: AuditEntry[] = [
  { ref: "NY-AUD-01210", at: "18 Nov · 10:40", actor: "Peter Wanyama Nalyanya", action: "profile.edit", entity: "NY-MBR-00005", detail: "Bio and town updated · self-edit · audit row written", tone: "plain" },
  { ref: "NY-AUD-01209", at: "16 Nov · 09:31", actor: "Peter Wanyama Nalyanya", action: "change.request", entity: "NY-CHG-2025-00041", detail: "Mobile change request · OTP on current number · SIMULATED", tone: "gold" },
  { ref: "NY-AUD-01208", at: "16 Nov · 09:05", actor: "System", action: "session.revoke", entity: "NY-SES-0004", detail: "Unknown London session revoked by the member", tone: "red" },
  { ref: "NY-AUD-01207", at: "14 Nov · 18:22", actor: "Finance officer · Faith C.", action: "change.approve", entity: "NY-CHG-2025-00038", detail: "Bank account change approved · new account active", tone: "gold" },
  { ref: "NY-AUD-01206", at: "12 Nov · 07:00", actor: "Peter Wanyama Nalyanya", action: "security.enable", entity: "NY-MBR-00005", detail: "2FA TOTP enrolled · SIMULATED", tone: "plain" },
];

/* Privacy + data rights notice for Kenya's DPA 2019. */
export const PRIVACY_NOTICE = {
  title: "Kenya DPA 2019 notice",
  version: "NY-DPA-2025-v2",
  body: "Your data is kept for the family's lineage, money and memories. Contact details are shown to the family, not the public. You can view, correct or export your own data, and you can withdraw consent where the law allows it. Ledger and audit records are retained for the protection of every member.",
};

/* ---------- Finance profile (all local, computed from this account) ---------- */
export const finance = {
  saccoShares: 120,
  saccoValue: 144000,
  saccoMultiplier: 3,
  chamaMemberships: 3,
  loanEligible: 432000,
  activeLoans: 2,
  payoutChannels: ["M-Pesa ···· 2210", "Equity ···· 4471", "Airtel ···· 5512", "Family wallet · KES 24,300"],
};

/* ---------- Preferences ---------- */
export const prefsSeed = {
  elderMode: false,
  currency: "KES" as "KES" | "USD" | "EUR",
  language: "en" as Language,
  channels: {
    whatsapp: true,
    sms: true,
    email: false,
    inApp: true,
  } as Record<"whatsapp" | "sms" | "email" | "inApp", boolean>,
};

export const CHANGE_FIELD_LABEL: Record<ChangeField, string> = {
  mobile: "Mobile number",
  bank: "Bank account",
  airtel: "Airtel number",
  pin: "Receive PIN",
  password: "Password",
};

export const requestTone: Record<ReqStatus, string> = {
  submitted: "ny-chip-warn",
  "under-review": "ny-chip-info",
  approved: "ny-chip-ok",
  rejected: "ny-chip-danger",
};

export const requestLabel: Record<ReqStatus, string> = {
  submitted: "Submitted",
  "under-review": "Under review",
  approved: "Approved",
  rejected: "Rejected",
};

/* ---------- Shared frames for the camera-pinhole section ---------- */
export const frames: Frame[] = [
  { id: "f-ac1", src: "/images/frame-elder.jpg", title: "The elder's ledger", caption: "A phone number that pays out money is guarded the way this book was guarded.", frame: "71A", lens: "90mm macro", exposure: "1/45 · f2.8", place: "Kitale" },
  { id: "f-ac2", src: "/images/frame-reunion.jpg", title: "Reunion steps", caption: "One family, one account. Five generations on the homestead steps.", frame: "72", lens: "85mm", exposure: "1/250 · f4", place: "Trans-Nzoia" },
  { id: "f-ac3", src: "/images/contrib-hero.jpg", title: "The harambee table", caption: "Where the money-routing fields were first agreed, before any account existed.", frame: "73", lens: "35mm", exposure: "1/125 · f2.8", place: "Bungoma" },
  { id: "f-ac4", src: "/images/fin-sacco.jpg", title: "The counters", caption: "A bank account change needs an OTP and a second person. It has always been the rule.", frame: "74", lens: "50mm", exposure: "1/80 · f2.8", place: "Nairobi" },
  { id: "f-ac5", src: "/images/cause-medical.jpg", title: "Clinic corridor", caption: "The payout for a medicine review goes only to the account the family approved.", frame: "75A", lens: "35mm", exposure: "1/60 · f2", place: "Nairobi" },
  { id: "f-ac6", src: "/images/cause-school.jpg", title: "Term reopens", caption: "Children's fees, paid to the school paybill, after a change was reviewed and approved.", frame: "76", lens: "50mm", exposure: "1/500 · f2.8", place: "Kimilili" },
  { id: "f-ac7", src: "/images/fin-chama-hero.jpg", title: "The circle", caption: "The chama's treasurer keeps the member ledger the way the platform keeps the audit trail.", frame: "77", lens: "35mm", exposure: "1/125 · f2", place: "Bungoma" },
  { id: "f-ac8", src: "/images/cause-wedding.jpg", title: "Millicent & Daniel", caption: "A new home, a new phone number. The change request tells the family why.", frame: "78", lens: "35mm", exposure: "1/30 · f1.8", place: "Karen" },
];

export const fmtDate = (iso: string): string => {
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${M[Number(m) - 1]} ${y}`;
};

export const pendingCount = (list: ChangeRequest[]): number => list.filter((r) => r.status === "submitted" || r.status === "under-review").length;
export const approvedCount = (list: ChangeRequest[]): number => list.filter((r) => r.status === "approved").length;
export const rejectedCount = (list: ChangeRequest[]): number => list.filter((r) => r.status === "rejected").length;
