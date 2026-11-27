/* T-16 Settings — master-admin configuration of the family instance (frontend-only Phase 1).
   Security policy, RBAC matrix, integration vault, automation, appearance, data/privacy,
   feature flags and webhooks. Every credential write is write-only and SIMULATED; no value
   is ever echoed back. All state is local and resets on reload. */

import type { Frame } from "@/data/dashboard/contributions";

export const AS_OF = "2025-11-18";
export const ME_ID = "m05";

export type Role = "Family Head" | "Co-Admin" | "Elder" | "Finance Officer" | "Member" | "Ward / Minor" | "Viewer";
export type Perm =
  | "allocate"
  | "approveLoan"
  | "sendBroadcast"
  | "editLineage"
  | "manageSacco"
  | "payout"
  | "editSettings";
export type ApprovalMode = "always-ask" | "standing" | "never";
export type VaultState = "ready-ui" | "configured";
export type Tone = "plain" | "gold" | "red";
export type Cadence = "off" | "weekly" | "fortnightly" | "monthly";
export type RetentionUnit = "years" | "days";

export const ROLES: Role[] = ["Family Head", "Co-Admin", "Elder", "Finance Officer", "Member", "Ward / Minor", "Viewer"];
export const PERMS: Perm[] = ["allocate", "approveLoan", "sendBroadcast", "editLineage", "manageSacco", "payout", "editSettings"];

export const PERM_LABEL: Record<Perm, string> = {
  allocate: "Allocate money",
  approveLoan: "Approve loans",
  sendBroadcast: "Send broadcasts",
  editLineage: "Edit lineage",
  manageSacco: "Manage Sacco",
  payout: "Release payouts",
  editSettings: "Edit settings",
};

export const APPROVAL_LABEL: Record<ApprovalMode, string> = {
  "always-ask": "Always ask",
  standing: "Standing approval",
  never: "Never",
};

/* ------------------------------------------------------------------ */
/* S1 — family profile and governance                                   */
/* ------------------------------------------------------------------ */
export type FamilyProfile = {
  name: string;
  motto: string;
  crest: string;
  head: string;
  coAdmins: string[];
  elders: { name: string; branch: string; since: string }[];
  branches: { id: string; name: string; members: number; lead: string }[];
  conduct: string;
  founded: string;
};

export const familySeed: FamilyProfile = {
  name: "Nalyanya",
  motto: "Our roots. Our people. One home.",
  crest: "/images/frame-elder.jpg",
  head: "Mzee Victor Nalyanya",
  coAdmins: ["Ruth Akinyi Nalyanya", "Faith Chebet Nalyanya"],
  elders: [
    { name: "Ruth Akinyi Nalyanya", branch: "Nairobi", since: "2021" },
    { name: "Samuel Kiprop Nalyanya", branch: "Trans-Nzoia", since: "2022" },
    { name: "Joseph Nyongesa Nalyanya", branch: "Kakamega", since: "2023" },
    { name: "Esther Nafula Nalyanya", branch: "Bungoma", since: "2024" },
  ],
  branches: [
    { id: "br1", name: "Nairobi", members: 54, lead: "Ruth Akinyi Nalyanya" },
    { id: "br2", name: "Bungoma", members: 61, lead: "Brian Otieno Nalyanya" },
    { id: "br3", name: "Kakamega", members: 44, lead: "Joseph Nyongesa Nalyanya" },
    { id: "br4", name: "Trans-Nzoia", members: 38, lead: "Samuel Kiprop Nalyanya" },
    { id: "br5", name: "Diaspora", members: 22, lead: "Lydia Atieno Nalyanya" },
  ],
  conduct:
    "We keep one ledger and tell each other the truth about money. No member is left to pay alone. An elder's word is checked, not assumed. What is given quietly is still recorded.",
  founded: "1961",
};

/* ------------------------------------------------------------------ */
/* S2 — RBAC matrix and approval policy                                  */
/* ------------------------------------------------------------------ */
export type Rbac = { role: Role; perms: Record<Perm, boolean> };
export const rbacSeed: Rbac[] = [
  { role: "Family Head", perms: { allocate: true, approveLoan: true, sendBroadcast: true, editLineage: true, manageSacco: true, payout: true, editSettings: true } },
  { role: "Co-Admin", perms: { allocate: true, approveLoan: true, sendBroadcast: true, editLineage: true, manageSacco: true, payout: true, editSettings: false } },
  { role: "Elder", perms: { allocate: true, approveLoan: false, sendBroadcast: true, editLineage: true, manageSacco: false, payout: false, editSettings: false } },
  { role: "Finance Officer", perms: { allocate: true, approveLoan: true, sendBroadcast: true, editLineage: false, manageSacco: true, payout: true, editSettings: false } },
  { role: "Member", perms: { allocate: false, approveLoan: false, sendBroadcast: false, editLineage: false, manageSacco: false, payout: false, editSettings: false } },
  { role: "Ward / Minor", perms: { allocate: false, approveLoan: false, sendBroadcast: false, editLineage: false, manageSacco: false, payout: false, editSettings: false } },
  { role: "Viewer", perms: { allocate: false, approveLoan: false, sendBroadcast: false, editLineage: false, manageSacco: false, payout: false, editSettings: false } },
];

export type ApprovalPolicy = { action: string; mode: ApprovalMode; note: string };
export const approvalsSeed: ApprovalPolicy[] = [
  { action: "Add or change a payout channel", mode: "always-ask", note: "OTP on the current number plus a second family head" },
  { action: "Change money caps (allocation, loan, SMS)", mode: "always-ask", note: "Family head 2FA, then an audit row" },
  { action: "Approve a loan above KES 250,000", mode: "always-ask", note: "Two approvers, both with 2FA" },
  { action: "Release a contribution payout", mode: "standing", note: "Finance officer may release under the cap alone" },
  { action: "Send a routine broadcast", mode: "standing", note: "Co-admin and above" },
  { action: "Edit lineage details", mode: "standing", note: "Admin approves a member's own correction" },
  { action: "Read the ledger and audit trail", mode: "never", note: "Every member can read. Money routing stays hidden." },
];

/* ------------------------------------------------------------------ */
/* S3 — integration vault (write-only, SIMULATED)                        */
/* ------------------------------------------------------------------ */
export type Integration = {
  id: string;
  name: string;
  category: "money-in" | "money-out" | "transfer" | "messaging" | "images" | "identity";
  state: VaultState;
  detail: string;
  fields: { key: string; label: string; placeholder: string; secret: boolean }[];
  lastTested: string | null;
  lastTestOk: boolean | null;
};

export const integrationsSeed: Integration[] = [
  {
    id: "mpesa", name: "M-Pesa Daraja", category: "money-in", state: "ready-ui",
    detail: "STK push, B2C payouts, B2B paybill and C2B callbacks",
    fields: [
      { key: "key", label: "Consumer key", placeholder: "paste consumer key", secret: true },
      { key: "secret", label: "Consumer secret", placeholder: "paste consumer secret", secret: true },
      { key: "shortcode", label: "Business shortcode", placeholder: "4471", secret: false },
      { key: "passkey", label: "LNMO passkey", placeholder: "paste passkey", secret: true },
    ],
    lastTested: "18 Nov · 09:14", lastTestOk: true,
  },
  {
    id: "airtel", name: "Airtel Money", category: "money-in", state: "ready-ui",
    detail: "Secondary rail for members without Safaricom",
    fields: [
      { key: "user", label: "Username", placeholder: "airtel username", secret: false },
      { key: "key", label: "API key", placeholder: "paste api key", secret: true },
    ],
    lastTested: null, lastTestOk: null,
  },
  {
    id: "bank", name: "Bank EFT / RTGS", category: "transfer", state: "ready-ui",
    detail: "KCB, Equity, Coop, NCBA, ABSA, Stanbic and five more",
    fields: [
      { key: "file", label: "Bulk payment file key", placeholder: "paste file key", secret: true },
      { key: "callback", label: "Callback URL", placeholder: "https://…/webhooks/bank", secret: false },
    ],
    lastTested: "17 Nov · 16:02", lastTestOk: true,
  },
  {
    id: "africastalking", name: "Africa's Talking", category: "messaging", state: "ready-ui",
    detail: "Bulk SMS, OTP delivery and premium short codes",
    fields: [
      { key: "user", label: "Username", placeholder: "nalyanya", secret: false },
      { key: "key", label: "API key", placeholder: "paste api key", secret: true },
      { key: "sender", label: "Sender ID", placeholder: "NALYANYA", secret: false },
    ],
    lastTested: "18 Nov · 07:40", lastTestOk: true,
  },
  {
    id: "whatsapp", name: "WhatsApp Cloud API", category: "messaging", state: "ready-ui",
    detail: "Template messages, 1:1 threads and inbound replies",
    fields: [
      { key: "token", label: "Permanent token", placeholder: "paste token", secret: true },
      { key: "phone", label: "Phone number ID", placeholder: "phone number id", secret: false },
      { key: "waba", label: "WABA account ID", placeholder: "waba id", secret: false },
    ],
    lastTested: null, lastTestOk: null,
  },
  {
    id: "gdrive", name: "Google Drive", category: "images", state: "ready-ui",
    detail: "Per-album folder IDs for the family gallery",
    fields: [
      { key: "oauth", label: "OAuth client secret", placeholder: "paste client secret", secret: true },
      { key: "root", label: "Root folder ID", placeholder: "root folder id", secret: false },
    ],
    lastTested: null, lastTestOk: null,
  },
  {
    id: "resend", name: "Resend", category: "messaging", state: "ready-ui",
    detail: "Transactional email and the weekly digest",
    fields: [{ key: "key", label: "API key", placeholder: "re_live_…", secret: true }],
    lastTested: null, lastTestOk: null,
  },
  {
    id: "otp", name: "OTP delivery", category: "identity", state: "ready-ui",
    detail: "Routes a one-time code by SMS, WhatsApp or email",
    fields: [{ key: "vault", label: "Shared signing key", placeholder: "paste signing key", secret: true }],
    lastTested: "18 Nov · 08:22", lastTestOk: true,
  },
];

/* ------------------------------------------------------------------ */
/* S4 — automation and scheduling                                       */
/* ------------------------------------------------------------------ */
export type Automation = {
  id: string;
  name: string;
  detail: string;
  on: boolean;
  critical: boolean;
  cadence?: Cadence;
};

export const automationSeed: Automation[] = [
  { id: "rotation", name: "Auto-run chama rotations", detail: "Pays the merry-go-round recipient on the last day of the cycle", on: true, critical: true, cadence: "monthly" },
  { id: "collect", name: "Auto-collect loan instalments", detail: "STK push on the due date, 08:00 EAT", on: true, critical: true },
  { id: "evt2d", name: "Event reminder · 2 days before", detail: "Broadcast to RSVPs who have not replied", on: true, critical: false },
  { id: "evt1h", name: "Event reminder · 1 hour before", detail: "In-app and push only", on: true, critical: false },
  { id: "contribution", name: "Contribution deadline · 1 day before", detail: "Reminder to members who have not given", on: true, critical: false },
  { id: "instalment", name: "Loan instalment · 3 days before", detail: "Reminder with the exact amount due", on: true, critical: false },
  { id: "shares", name: "Monthly Sacco share call", detail: "Standing-order prompt on day 5", on: true, critical: false },
  { id: "digest", name: "Auto-broadcast digest", detail: "A weekly summary of money in, money out and open exceptions", on: false, critical: false, cadence: "weekly" },
  { id: "mitigate", name: "Auto-mitigate on anomaly", detail: "Pause payouts when the ledger looks wrong. Off by default.", on: false, critical: true },
];

export type Job = { id: string; label: string; at: string; kind: string };

export const queueSeed: Job[] = [
  { id: "q1", label: "Chama rotation · Nairobi MGR round 11", at: "23 Nov · 00:00 EAT", kind: "rotation" },
  { id: "q2", label: "Loan instalment reminder · NY-LON-2025-00114", at: "21 Nov · 08:00 EAT", kind: "reminder" },
  { id: "q3", label: "Loan instalment reminder · NY-LON-2025-00121", at: "05 Dec · 08:00 EAT", kind: "reminder" },
  { id: "q4", label: "Sacco monthly share call", at: "05 Dec · 07:00 EAT", kind: "standing" },
  { id: "q5", label: "Contribution deadline · Musanda hall", at: "15 Dec · 09:00 EAT", kind: "reminder" },
  { id: "q6", label: "Weekly digest", at: "24 Nov · 07:00 EAT", kind: "digest" },
  { id: "q7", label: "Event reminder · reunion 2 days", at: "19 Mar 2026 · 09:00 EAT", kind: "reminder" },
  { id: "q8", label: "Gallery archive sweep · 90 days", at: "01 Jan 2026 · 02:00 EAT", kind: "retention" },
];

/* ------------------------------------------------------------------ */
/* S5 — appearance, accessibility and locale                            */
/* ------------------------------------------------------------------ */
export type Appearance = {
  theme: "light" | "dark" | "system";
  elderDefault: boolean;
  currency: "KES" | "USD" | "EUR";
  timezone: string;
  language: "en" | "sw";
  numbers: "1,234,567.89" | "1 234 567,89";
  reduceMotion: boolean;
};

export const appearanceSeed: Appearance = {
  theme: "light",
  elderDefault: false,
  currency: "KES",
  timezone: "Africa/Nairobi",
  language: "en",
  numbers: "1,234,567.89",
  reduceMotion: false,
};

/* ------------------------------------------------------------------ */
/* S6 — data and privacy                                                */
/* ------------------------------------------------------------------ */
export type Retention = { ledgerYears: number; auditYears: number; imagesHotDays: number; archiveYears: number };

export const retentionSeed: Retention = { ledgerYears: 7, auditYears: 7, imagesHotDays: 90, archiveYears: 10 };

export type ConsentEntry = { id: string; at: string; who: string; note: string; tone: Tone };

export const consentSeed: ConsentEntry[] = [
  { id: "cn1", at: "18 Nov · 08:40", who: "All 243 members", note: "Family data policy v3 accepted on signup", tone: "plain" },
  { id: "cn2", at: "16 Nov · 09:31", who: "Peter Wanyama Nalyanya", note: "OTP consent for a mobile change request", tone: "gold" },
  { id: "cn3", at: "10 Nov · 14:18", who: "Lydia Atieno Nalyanya", note: "Gallery image consent for the Toronto branch album", tone: "plain" },
  { id: "cn4", at: "04 Sep · 07:00", who: "Diaspora circle", note: "Email consent for the weekly digest", tone: "plain" },
  { id: "cn5", at: "20 Jul · 12:00", who: "Kevin Otieno Nalyanya", note: "Secondary email consent withdrawn", tone: "red" },
];

/* ------------------------------------------------------------------ */
/* S7 — feature flags, webhooks, audit                                   */
/* ------------------------------------------------------------------ */
export type Flag = { id: string; key: string; label: string; on: boolean; limit?: number; kind: "toggle" | "number" };

export const flagsSeed: Flag[] = [
  { id: "f1", key: "enable_sacco", label: "Sacco shares and dividends", on: true, kind: "toggle" },
  { id: "f2", key: "enable_loans", label: "Loan applications and repayment", on: true, kind: "toggle" },
  { id: "f3", key: "enable_allocations", label: "Finance access and allocations", on: true, kind: "toggle" },
  { id: "f4", key: "enable_foundation", label: "Nalyanya Foundation grants", on: true, kind: "toggle" },
  { id: "f5", key: "enable_broadcasts", label: "Broadcast composer", on: true, kind: "toggle" },
  { id: "f6", key: "enable_gallery_gdrive", label: "Google Drive gallery sync", on: false, kind: "toggle" },
  { id: "f7", key: "enable_elder_receive_links", label: "No-login elder receive links", on: true, kind: "toggle" },
  { id: "f8", key: "MAX_BRANCHES", label: "Maximum branches", on: true, limit: 12, kind: "number" },
  { id: "f9", key: "MAX_MEMBERS", label: "Maximum members", on: true, limit: 500, kind: "number" },
  { id: "f10", key: "MAX_ACTIVE_LOANS_PER_MEMBER", label: "Active loans per member", on: true, limit: 3, kind: "number" },
  { id: "f11", key: "MAX_ALLOCATION_LINKS", label: "Allocation links per day", on: true, limit: 50, kind: "number" },
];

export type Webhook = { id: string; url: string; secret: string; events: string[]; on: boolean; last: string | null; ok: boolean | null };

export const webhooksSeed: Webhook[] = [
  { id: "w1", url: "https://ops.nalyanya.example/hooks/ledger", secret: "whsec_7f4c…", events: ["ledger.posted", "contribution.confirmed"], on: true, last: "18 Nov · 09:12", ok: true },
  { id: "w2", url: "https://reports.nalyanya.example/hooks/daily", secret: "whsec_9b2a…", events: ["digest.sent"], on: true, last: "18 Nov · 07:00", ok: true },
  { id: "w3", url: "https://legacy.example/nalyanya", secret: "whsec_1c8d…", events: ["member.added"], on: false, last: "02 Oct · 11:40", ok: false },
];

export type AuditEntry = { ref: string; at: string; actor: string; action: string; entity: string; detail: string; tone: Tone };

export const auditSeed: AuditEntry[] = [
  { ref: "NY-AUD-01240", at: "18 Nov · 11:20", actor: "Peter Wanyama Nalyanya", action: "flag.toggle", entity: "enable_gallery_gdrive", detail: "Switched off · reason logged", tone: "plain" },
  { ref: "NY-AUD-01239", at: "18 Nov · 10:55", actor: "Mzee Victor Nalyanya (office)", action: "rbac.edit", entity: "NY-RBAC", detail: "Co-Admin payout permission removed · 2FA verified", tone: "gold" },
  { ref: "NY-AUD-01238", at: "17 Nov · 16:02", actor: "Faith Chebet Nalyanya", action: "integration.test", entity: "bank", detail: "Bank EFT test fired · SIMULATED proof returned", tone: "plain" },
  { ref: "NY-AUD-01237", at: "16 Nov · 09:31", actor: "Peter Wanyama Nalyanya", action: "vault.write", entity: "mpesa", detail: "Consumer key rotated · write-only, never echoed", tone: "gold" },
  { ref: "NY-AUD-01236", at: "14 Nov · 08:30", actor: "System", action: "scheduler.pause", entity: "NY-SCHED", detail: "All scheduled jobs paused for 2 hours during reconciliation", tone: "red" },
  { ref: "NY-AUD-01235", at: "12 Nov · 07:00", actor: "Mzee Victor Nalyanya (office)", action: "retention.edit", entity: "NY-RETENTION", detail: "Ledger retention set to 7 years", tone: "plain" },
];

/* ------------------------------------------------------------------ */
/* Frames for the camera-pinhole section                                */
/* ------------------------------------------------------------------ */
export const frames: Frame[] = [
  { id: "fs1", src: "/images/frame-elder.jpg", title: "The elder's ledger", caption: "The rules this page enforces were written down long before a settings screen existed.", frame: "81A", lens: "90mm macro", exposure: "1/45 · f2.8", place: "Kitale" },
  { id: "fs2", src: "/images/frame-reunion.jpg", title: "Reunion steps", caption: "Two hundred and forty-three people, one set of permissions, one set of rules.", frame: "82", lens: "85mm", exposure: "1/250 · f4", place: "Trans-Nzoia" },
  { id: "fs3", src: "/images/fin-sacco.jpg", title: "The counters", caption: "A credential that moves money is never shown back to the person who typed it.", frame: "83", lens: "50mm", exposure: "1/80 · f2.8", place: "Nairobi" },
  { id: "fs4", src: "/images/contrib-hero.jpg", title: "The harambee table", caption: "Automation is the newest member of this table. It still has to earn trust.", frame: "84", lens: "35mm", exposure: "1/125 · f2.8", place: "Bungoma" },
  { id: "fs5", src: "/images/cause-water.jpg", title: "First water", caption: "A scheduled payout bought this borehole. The queue did the remembering.", frame: "85", lens: "28mm", exposure: "1/1000 · f5.6", place: "Musanda" },
  { id: "fs6", src: "/images/cause-school.jpg", title: "Term reopens", caption: "Feature flags decide whether a child's fees can be requested at all.", frame: "86", lens: "50mm", exposure: "1/500 · f2.8", place: "Kimilili" },
  { id: "fs7", src: "/images/cause-medical.jpg", title: "Clinic corridor", caption: "A paused automation is a human decision, not a failure.", frame: "87A", lens: "35mm", exposure: "1/60 · f2", place: "Nairobi" },
  { id: "fs8", src: "/images/fin-chama-hero.jpg", title: "The circle", caption: "Rotation day arrives whether or not anyone remembers to press a button.", frame: "88", lens: "35mm", exposure: "1/125 · f2", place: "Bungoma" },
];

/* ------------------------------------------------------------------ */
/* Derived helpers                                                      */
/* ------------------------------------------------------------------ */
export const vaultTone = (s: VaultState) => (s === "configured" ? "ny-chip-ok" : "ny-chip-sim");
export const fmtDate = (iso: string): string => {
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${M[Number(m) - 1]} ${y}`;
};
export const configuredCount = (list: Integration[]) => list.filter((i) => i.state === "configured").length;
export const activeAutomationCount = (list: Automation[]) => list.filter((a) => a.on).length;
export const permCount = (r: Rbac) => PERMS.filter((p) => r.perms[p]).length;
export const activeFlagCount = (list: Flag[]) => list.filter((f) => f.on).length;
