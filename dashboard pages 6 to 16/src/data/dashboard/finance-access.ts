/* T-9 Finance Access — allocations & elder receive links (frontend-only Phase 1).
   The /r/:token flow is previewed live in the phone mockup. IDs per nalyanyaMO.md §3.4
   (NY-ALC-… allocations · NY-RCV-… receive tokens · NY-LED-… ledger · NY-AUD-… audit). */

import type { Frame } from "@/data/dashboard/contributions";

export type AllocStatus =
  | "draft"
  | "link-issued"
  | "pin-entered"
  | "otp-verified"
  | "released"
  | "settled"
  | "expired"
  | "failed";

export type AllocPurpose = "personal" | "family" | "medical" | "school" | "emergency";
export type PayChannel = "mpesa" | "bank" | "internal";
export type OtpChannel = "sms" | "whatsapp" | "email";

export type Allocation = {
  id: string;
  ref: string;
  token: string;
  recipient: string;
  recipientId: string | null;
  phone: string;
  amount: number;
  purpose: AllocPurpose;
  channel: PayChannel;
  status: AllocStatus;
  issuedAt: string;
  expiresAt: string;
  expiryInSec: number;
  otpChannel: OtpChannel;
  pinRequired: boolean;
  note: string;
  settledRef?: string;
};

export type LedgerEntry = {
  ref: string;
  at: string;
  debit: string;
  credit: string;
  amount: number;
  source: string;
};

export type AuditEntry = {
  ref: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
  detail: string;
  tone: "plain" | "gold" | "red";
};

export type Ceiling = {
  role: string;
  perTx: number;
  daily: number;
  note: string;
};

export type FaRules = {
  perTxCap: number;
  dailyCap: number;
  memberMonthlyCap: number;
  pinAttempts: number;
  otpAttempts: number;
  lockMinutes: number;
  defaultExpiryHrs: number;
  maxExpiryHrs: number;
  pinRequired: boolean;
  otpChannel: OtpChannel;
  whitelist: boolean;
  fourEyesAbove: number;
};

export type Recipient = {
  id: string;
  name: string;
  initials: string;
  relation: string;
  phone: string;
  branch: string;
  elder: boolean;
  member: boolean;
};

export const statusMeta: Record<AllocStatus, { label: string; tone: string; step: number; hint: string }> = {
  draft: { label: "Draft", tone: "ny-chip-neutral", step: 0, hint: "Saved locally, no link issued yet" },
  "link-issued": { label: "Link issued", tone: "ny-chip-info", step: 1, hint: "Waiting for the elder to open it" },
  "pin-entered": { label: "PIN entered", tone: "ny-chip-warn", step: 2, hint: "4-digit PIN accepted, OTP not verified" },
  "otp-verified": { label: "OTP verified", tone: "ny-chip-warn", step: 3, hint: "Identity checked, ready to release" },
  released: { label: "Released", tone: "ny-chip-brand", step: 4, hint: "Payout sent to the wallet (SIMULATED B2C)" },
  settled: { label: "Settled", tone: "ny-chip-ok", step: 5, hint: "Elder confirmed receipt · money leg SIMULATED" },
  expired: { label: "Expired", tone: "ny-chip-neutral", step: 1, hint: "Link passed its expiry time" },
  failed: { label: "Failed", tone: "ny-chip-danger", step: 1, hint: "PIN/OTP lock or payout error" },
};

export const purposeLabel: Record<AllocPurpose, string> = {
  personal: "Personal",
  family: "Family",
  medical: "Medical",
  school: "School",
  emergency: "Emergency",
};

export const purposeTone: Record<AllocPurpose, string> = {
  personal: "ny-chip-neutral",
  family: "ny-chip-brand",
  medical: "ny-chip-danger",
  school: "ny-chip-info",
  emergency: "ny-chip-warn",
};

export const channelLabel: Record<PayChannel, string> = {
  mpesa: "M-Pesa",
  bank: "Bank EFT",
  internal: "Internal wallet",
};

export const otpChannelLabel: Record<OtpChannel, string> = {
  sms: "SMS",
  whatsapp: "WhatsApp",
  email: "Email",
};

export const recipients: Recipient[] = [
  { id: "e1", name: "Mzee Victor Nalyanya", initials: "MV", relation: "Root ancestor · elder", phone: "+2547 ··· 7890", branch: "Kitale", elder: true, member: true },
  { id: "e2", name: "Ruth Akinyi Nalyanya", initials: "RA", relation: "Grandmother · elder", phone: "+2547 ··· 2210", branch: "Nairobi", elder: true, member: true },
  { id: "e3", name: "Samuel Kiprop Nalyanya", initials: "SK", relation: "Elder · Trans-Nzoia", phone: "+2547 ··· 1174", branch: "Trans-Nzoia", elder: true, member: true },
  { id: "e4", name: "Grace Kwamboka Nalyanya", initials: "GK", relation: "Aunt · Kakamega", phone: "+2547 ··· 4417", branch: "Kakamega", elder: false, member: true },
  { id: "e5", name: "Esther Nafula Nalyanya", initials: "EN", relation: "Sister · Trans-Nzoia", phone: "+2547 ··· 3308", branch: "Trans-Nzoia", elder: false, member: true },
  { id: "e6", name: "Dennis Barasa Nalyanya", initials: "DB", relation: "Cousin · Kakamega", phone: "+2547 ··· 7726", branch: "Kakamega", elder: false, member: true },
  { id: "e7", name: "Agnes Wanjiru Nalyanya", initials: "AW", relation: "Mother · Nairobi", phone: "+2547 ··· 6612", branch: "Nairobi", elder: false, member: true },
  { id: "e8", name: "Joseph Nyongesa Nalyanya", initials: "JN", relation: "Uncle · Kakamega", phone: "+2547 ··· 3390", branch: "Kakamega", elder: false, member: true },
  { id: "e9", name: "Mama Sarah Wanyonyi", initials: "SW", relation: "Neighbour elder (not a member)", phone: "+2547 ··· 9052", branch: "Bungoma", elder: true, member: false },
];

export const allocations: Allocation[] = [
  {
    id: "a1", ref: "NY-ALC-2025-00143", token: "NY-RCV-4K7P2M", recipient: "Collins Munyasia Nalyanya", recipientId: "e4",
    phone: "+2547 ··· 0451", amount: 3500, purpose: "school", channel: "mpesa", status: "draft", issuedAt: "18 Nov · 09:31",
    expiresAt: "19 Nov · 09:31", expiryInSec: 86400, otpChannel: "sms", pinRequired: true,
    note: "Textbooks for term 2 — waiting for the finance officer to issue the link.",
  },
  {
    id: "a2", ref: "NY-ALC-2025-00142", token: "NY-RCV-8H2K4Q", recipient: "Mzee Victor Nalyanya", recipientId: "e1",
    phone: "+2547 ··· 7890", amount: 12000, purpose: "medical", channel: "mpesa", status: "settled", issuedAt: "18 Nov · 08:04",
    expiresAt: "19 Nov · 08:04", expiryInSec: 61200, otpChannel: "sms", pinRequired: true,
    note: "Monthly heart medicine top-up — settled this morning at 08:22.", settledRef: "B2C-RKX7H8KP",
  },
  {
    id: "a3", ref: "NY-ALC-2025-00141", token: "NY-RCV-2D9X1V", recipient: "Grace Kwamboka Nalyanya", recipientId: "e4",
    phone: "+2547 ··· 4417", amount: 8000, purpose: "family", channel: "mpesa", status: "released", issuedAt: "18 Nov · 07:12",
    expiresAt: "19 Nov · 07:12", expiryInSec: 43200, otpChannel: "whatsapp", pinRequired: true,
    note: "Family transport to the reunion planning meeting in Kitale.",
  },
  {
    id: "a4", ref: "NY-ALC-2025-00140", token: "NY-RCV-7F3L9T", recipient: "Ruth Akinyi Nalyanya", recipientId: "e2",
    phone: "+2547 ··· 2210", amount: 15000, purpose: "medical", channel: "bank", status: "otp-verified", issuedAt: "17 Nov · 19:40",
    expiresAt: "18 Nov · 19:40", expiryInSec: 27000, otpChannel: "sms", pinRequired: true,
    note: "Clinic review at Nairobi Hospital — OTP verified, release pending 4-eyes.",
  },
  {
    id: "a5", ref: "NY-ALC-2025-00139", token: "NY-RCV-1Q8B6N", recipient: "Esther Nafula Nalyanya", recipientId: "e5",
    phone: "+2547 ··· 3308", amount: 25000, purpose: "school", channel: "mpesa", status: "pin-entered", issuedAt: "17 Nov · 16:22",
    expiresAt: "18 Nov · 16:22", expiryInSec: 18000, otpChannel: "whatsapp", pinRequired: true,
    note: "School fees balance for two pupils in Kimilili.",
  },
  {
    id: "a6", ref: "NY-ALC-2025-00138", token: "NY-RCV-5R4C7J", recipient: "Samuel Kiprop Nalyanya", recipientId: "e3",
    phone: "+2547 ··· 1174", amount: 10000, purpose: "personal", channel: "mpesa", status: "link-issued", issuedAt: "17 Nov · 11:05",
    expiresAt: "18 Nov · 11:05", expiryInSec: 9000, otpChannel: "sms", pinRequired: true,
    note: "Monthly upkeep for the elder — link sent by SMS, not opened yet.",
  },
  {
    id: "a7", ref: "NY-ALC-2025-00137", token: "NY-RCV-9T1W5Z", recipient: "Joseph Nyongesa Nalyanya", recipientId: "e8",
    phone: "+2547 ··· 3390", amount: 6500, purpose: "emergency", channel: "internal", status: "settled", issuedAt: "18 Nov · 06:48",
    expiresAt: "19 Nov · 06:48", expiryInSec: 72000, otpChannel: "whatsapp", pinRequired: false,
    note: "Emergency boda fare and medicine after the night storm.", settledRef: "WAL-99231",
  },
  {
    id: "a8", ref: "NY-ALC-2025-00136", token: "NY-RCV-6M2Y8H", recipient: "Mama Sarah Wanyonyi", recipientId: "e9",
    phone: "+2547 ··· 9052", amount: 40000, purpose: "family", channel: "bank", status: "link-issued", issuedAt: "16 Nov · 14:30",
    expiresAt: "19 Nov · 14:30", expiryInSec: 36000, otpChannel: "sms", pinRequired: true,
    note: "Neighbour elder supported by the family — non-member recipient, free phone number.",
  },
  {
    id: "a9", ref: "NY-ALC-2025-00135", token: "NY-RCV-3V7G2K", recipient: "Agnes Wanjiru Nalyanya", recipientId: "e7",
    phone: "+2547 ··· 6612", amount: 9000, purpose: "personal", channel: "mpesa", status: "expired", issuedAt: "14 Nov · 09:15",
    expiresAt: "15 Nov · 09:15", expiryInSec: 0, otpChannel: "sms", pinRequired: true,
    note: "Link expired before it was opened — reissue from the allocations table.",
  },
  {
    id: "a10", ref: "NY-ALC-2025-00134", token: "NY-RCV-8N4S1D", recipient: "Dennis Barasa Nalyanya", recipientId: "e6",
    phone: "+2547 ··· 7726", amount: 5000, purpose: "emergency", channel: "mpesa", status: "failed", issuedAt: "13 Nov · 21:02",
    expiresAt: "14 Nov · 21:02", expiryInSec: 0, otpChannel: "sms", pinRequired: true,
    note: "PIN locked after 3 wrong attempts — 15 minute lock, then retry.",
  },
  {
    id: "a11", ref: "NY-ALC-2025-00133", token: "NY-RCV-2C6H9P", recipient: "Mzee Victor Nalyanya", recipientId: "e1",
    phone: "+2547 ··· 7890", amount: 20000, purpose: "family", channel: "mpesa", status: "settled", issuedAt: "12 Nov · 10:11",
    expiresAt: "13 Nov · 10:11", expiryInSec: 0, otpChannel: "sms", pinRequired: true,
    note: "Household support for the month of November.", settledRef: "B2C-RKX6Q1PL",
  },
];

export const kpis = [
  { label: "Available to allocate", value: 250000, prefix: "KES ", hint: "Finance officer ceiling · resets daily", tone: "brand" },
  { label: "Active allocations out", value: 79000, prefix: "KES ", hint: "5 allocations · not yet settled", tone: "gold" },
  { label: "Pending receive links", value: 3, hint: "awaiting PIN + OTP", tone: "warn", pulse: true },
  { label: "Settled today", value: 18500, prefix: "KES ", hint: "2 elders received · 18 Nov", tone: "ok" },
  { label: "Expired / failed (7d)", value: 2, hint: "1 expired · 1 PIN lock", tone: "danger" },
];

export const ceilings: Ceiling[] = [
  { role: "Family Head", perTx: 1000000, daily: 5000000, note: "All scopes · 4-eyes above KES 100,000" },
  { role: "Co-Admin / Elder", perTx: 400000, daily: 1200000, note: "Scoped to their branch(es)" },
  { role: "Finance Officer", perTx: 250000, daily: 250000, note: "Allocations, payouts, ledger" },
  { role: "Member", perTx: 25000, daily: 25000, note: "Own household only" },
  { role: "Ward / Minor", perTx: 0, daily: 0, note: "Guardian-managed · cannot allocate" },
  { role: "Viewer", perTx: 0, daily: 0, note: "Read-only" },
];

export const rules: FaRules = {
  perTxCap: 250000,
  dailyCap: 250000,
  memberMonthlyCap: 100000,
  pinAttempts: 3,
  otpAttempts: 3,
  lockMinutes: 15,
  defaultExpiryHrs: 24,
  maxExpiryHrs: 72,
  pinRequired: true,
  otpChannel: "sms",
  whitelist: false,
  fourEyesAbove: 100000,
};

export const ledger: LedgerEntry[] = [
  { ref: "NY-LED-0004561", at: "18 Nov · 08:22", debit: "Allocations clearing", credit: "M-Pesa B2C ···· 7890", amount: 12000, source: "NY-ALC-2025-00142" },
  { ref: "NY-LED-0004560", at: "18 Nov · 08:04", debit: "Family wallet · Peter W.", credit: "Allocations clearing", amount: 12000, source: "NY-ALC-2025-00142" },
  { ref: "NY-LED-0004552", at: "18 Nov · 06:52", debit: "Allocations clearing", credit: "Internal wallet · Joseph N.", amount: 6500, source: "NY-ALC-2025-00137" },
  { ref: "NY-LED-0004531", at: "12 Nov · 10:26", debit: "Allocations clearing", credit: "M-Pesa B2C ···· 7890", amount: 20000, source: "NY-ALC-2025-00133" },
  { ref: "NY-LED-0004530", at: "12 Nov · 10:11", debit: "Family wallet · Peter W.", credit: "Allocations clearing", amount: 20000, source: "NY-ALC-2025-00133" },
];

export const audit: AuditEntry[] = [
  { ref: "NY-AUD-01042", at: "18 Nov · 09:31", actor: "Peter Wanyama Nalyanya", action: "allocation.draft", entity: "NY-ALC-2025-00143", detail: "KES 3,500 · school · link not issued yet", tone: "plain" },
  { ref: "NY-AUD-01041", at: "18 Nov · 08:22", actor: "Webhook · /api/webhooks/receive/:token", action: "allocation.settled", entity: "NY-ALC-2025-00142", detail: "KES 12,000 → M-Pesa ···· 7890 · B2C confirmation (SIMULATED)", tone: "gold" },
  { ref: "NY-AUD-01040", at: "18 Nov · 08:04", actor: "Peter Wanyama Nalyanya", action: "allocation.issue", entity: "NY-ALC-2025-00142", detail: "PIN required · OTP via SMS · link expires 19 Nov 08:04", tone: "plain" },
  { ref: "NY-AUD-01039", at: "17 Nov · 16:24", actor: "Elder flow · /r/1Q8B6N", action: "pin.entered", entity: "NY-ALC-2025-00139", detail: "4-digit PIN accepted on first try · OTP sent (SIMULATED)", tone: "plain" },
  { ref: "NY-AUD-01038", at: "14 Nov · 09:41", actor: "System", action: "link.expired", entity: "NY-ALC-2025-00135", detail: "24h expiry passed · no PIN entered · money never left the clearing account", tone: "red" },
  { ref: "NY-AUD-01037", at: "13 Nov · 21:09", actor: "Elder flow · /r/8N4S1D", action: "link.locked", entity: "NY-ALC-2025-00134", detail: "3 wrong PIN attempts · locked 15 minutes", tone: "red" },
  { ref: "NY-AUD-01036", at: "12 Nov · 10:11", actor: "Family head · Mzee V. office", action: "allocation.issue", entity: "NY-ALC-2025-00133", detail: "KES 20,000 · family · within per-tx cap", tone: "plain" },
  { ref: "NY-AUD-01035", at: "11 Nov · 15:20", actor: "Family head · Mzee V. office", action: "rules.edit", entity: "NY-ALC-RULES", detail: "Per-member monthly cap 80,000 → 100,000 · 2FA verified", tone: "plain" },
];

export const pipeline: AllocStatus[] = ["draft", "link-issued", "pin-entered", "otp-verified", "released", "settled"];

export const payChannels: { id: PayChannel; label: string; detail: string; sim: boolean; eta: string }[] = [
  { id: "mpesa", label: "M-Pesa Daraja", detail: "B2C to the elder's number · STK not required", sim: true, eta: "seconds" },
  { id: "bank", label: "Bank EFT / RTGS", detail: "KCB · Equity · Coop · NCBA", sim: true, eta: "same day" },
  { id: "internal", label: "Internal wallet", detail: "Family wallet balance KES 24,300", sim: false, eta: "instant" },
];

export const otpChannels: { id: OtpChannel; label: string; detail: string; cost: string }[] = [
  { id: "sms", label: "SMS", detail: "Africa's Talking · reaches every basic phone", cost: "KES 1.20 / message" },
  { id: "whatsapp", label: "WhatsApp", detail: "Richer message · used when the number is capable", cost: "Free in Phase 1" },
  { id: "email", label: "Email", detail: "Long-form receipts for diaspora elders", cost: "Free in Phase 1" },
];

/* Stories behind the allocations — same photographic library as T-7, T-9 captions. */
export const frames: Frame[] = [
  { id: "fa1", src: "/images/frame-elder.jpg", title: "Mzee's ledger", caption: "Kitale, 18 November — every allocation still gets written down by hand before the link goes out.", frame: "21A", lens: "90mm macro", exposure: "1/45 · f2.8", place: "Kitale" },
  { id: "fa2", src: "/images/cause-medical.jpg", title: "Clinic corridor", caption: "Mama Ruth's second review — the allocation covered transport and the follow-up fee.", frame: "22", lens: "35mm", exposure: "1/60 · f2", place: "Nairobi" },
  { id: "fa3", src: "/images/cause-school.jpg", title: "Term reopens", caption: "Sharon and Brian Jr. the morning the school-fees link settled into the guardian's M-Pesa.", frame: "23", lens: "50mm", exposure: "1/500 · f2.8", place: "Kimilili" },
  { id: "fa4", src: "/images/contrib-hero.jpg", title: "The harambee table", caption: "Bungoma — where the family pooled shillings by hand, long before there was a receive link.", frame: "24", lens: "35mm", exposure: "1/125 · f2.8", place: "Bungoma" },
  { id: "fa5", src: "/images/frame-reunion.jpg", title: "Reunion steps", caption: "Five generations on the homestead steps. The elders never touch an app — just a PIN.", frame: "25", lens: "85mm", exposure: "1/250 · f4", place: "Trans-Nzoia" },
  { id: "fa6", src: "/images/cause-memorial.jpg", title: "Send-off", caption: "Mzee Samuel Kiprop's send-off, funded in nine days and reconciled to the shilling.", frame: "26", lens: "50mm", exposure: "1/125 · f2.8", place: "Trans-Nzoia" },
  { id: "fa7", src: "/images/cause-water.jpg", title: "First water", caption: "The Musanda borehole test — allocations can fund community work too, not only households.", frame: "27", lens: "28mm", exposure: "1/1000 · f5.6", place: "Musanda" },
  { id: "fa8", src: "/images/cause-wedding.jpg", title: "Millicent & Daniel", caption: "A wedding kitty sent as one receive link to the bride's mother, opened on a basic phone.", frame: "28", lens: "35mm", exposure: "1/30 · f1.8", place: "Karen" },
];

export const walkthrough = [
  { step: "1", title: "You send a link", body: "Pick a family member (or any phone number for an elder who isn't on the platform), set the amount and purpose, and issue the link. No app, no login, no account." },
  { step: "2", title: "The elder opens it", body: "A plain page at /r/:token shows exactly who sent how much and why. Large type, one question at a time, works on a basic Android browser." },
  { step: "3", title: "4-digit PIN", body: "They type the PIN they already know. Three wrong tries locks the link for 15 minutes so nobody can guess it." },
  { step: "4", title: "One-time code", body: "A 6-digit code arrives by SMS or WhatsApp. Three wrong tries lock it the same way." },
  { step: "5", title: "Money arrives", body: "The payout lands on their M-Pesa in seconds. The family sees the settlement, the ledger posts, and the audit row — and you get the confirmation." },
];

export const activeCount = (list: Allocation[]) =>
  list.filter((a) => a.status === "link-issued" || a.status === "pin-entered" || a.status === "otp-verified" || a.status === "released").length;

export const activeTotal = (list: Allocation[]) =>
  list
    .filter((a) => a.status === "link-issued" || a.status === "pin-entered" || a.status === "otp-verified" || a.status === "released")
    .reduce((s, a) => s + a.amount, 0);
