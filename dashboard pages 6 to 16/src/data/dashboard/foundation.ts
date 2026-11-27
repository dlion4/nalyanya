/* T-11 Nalyanya Foundation — grants, intake, disbursement and governance (frontend-only Phase 1).
   Every schedule, tally and pillar total below is COMPUTED from these records, so the numbers
   agree everywhere on the page. KES via kes() · EAT dates (ISO, formatted by fmtDate) ·
   IDs per nalyanyaMO.md §3.4 (NY-FND-… grants · NY-APP-… applications · NY-LED-… ledger ·
   NY-AUD-… audit). Signed-in user is Peter Wanyama Nalyanya (ME_ID), same as the T-1 shell. */

import { pct } from "@/lib/format";

export const ME_ID = "m05";
export const AS_OF = "2025-11-18";

export type Pillar = "education" | "medical" | "emergency";
export type GrantStatus = "active" | "completed" | "approved" | "pending" | "declined";
export type AppStatus = "submitted" | "under-review" | "approved" | "declined" | "paid";
export type Channel = "mpesa" | "bank" | "internal";
export type Tone = "plain" | "gold" | "red";

export type Grant = {
  id: string;
  ref: string;
  title: string;
  pillar: Pillar;
  beneficiary: string;
  minor: boolean;
  guardian?: string;
  branch: string;
  amount: number;
  disbursed: number;
  starts: string;
  ends: string;
  status: GrantStatus;
  destination: string;
  channel: Channel;
  purpose: string;
  note: string;
  schedule: { no: number; date: string; amount: number; paid: boolean; ref: string }[];
  documents: { name: string; kind: string; uploaded: string; verified: boolean }[];
};

export type Application = {
  id: string;
  ref: string;
  applicant: string;
  applicantId: string;
  pillar: Pillar;
  amount: number;
  purpose: string;
  justification: string;
  status: AppStatus;
  submitted: string;
  reviewer: string;
  documents: string[];
};

export type LedgerEntry = { ref: string; at: string; debit: string; credit: string; amount: number; source: string };
export type AuditEntry = { ref: string; at: string; actor: string; action: string; entity: string; detail: string; tone: Tone };
export type Donor = { id: string; name: string; since: string; total: number; count: number; anonymous: boolean };
export type ReconLine = { ref: string; at: string; statement: string; ledgerSide: string; amount: number; match: "matched" | "missing" | "mismatch" | "duplicate" };
export type Frame = { id: string; src: string; title: string; caption: string; frame: string; lens: string; exposure: string; place: string };

export const pillarLabel: Record<Pillar, string> = {
  education: "Education",
  medical: "Medical",
  emergency: "Emergency relief",
};

export const pillarTone: Record<Pillar, string> = {
  education: "ny-chip-info",
  medical: "ny-chip-danger",
  emergency: "ny-chip-warn",
};

export const statusMeta: Record<GrantStatus, { label: string; tone: string; hint: string }> = {
  active: { label: "Active", tone: "ny-chip-brand", hint: "Releasing funds on schedule" },
  completed: { label: "Completed", tone: "ny-chip-ok", hint: "Fully paid out and closed" },
  approved: { label: "Approved", tone: "ny-chip-brand", hint: "Approved — first release not yet made" },
  pending: { label: "Pending review", tone: "ny-chip-warn", hint: "Waiting on the grant council" },
  declined: { label: "Declined", tone: "ny-chip-neutral", hint: "Not funded this round — reason on file" },
};

export const appStatusMeta: Record<AppStatus, { label: string; tone: string }> = {
  submitted: { label: "Submitted", tone: "ny-chip-neutral" },
  "under-review": { label: "Under review", tone: "ny-chip-info" },
  approved: { label: "Approved", tone: "ny-chip-brand" },
  declined: { label: "Declined", tone: "ny-chip-neutral" },
  paid: { label: "Paid", tone: "ny-chip-ok" },
};

export const pillarImage: Record<Pillar, string> = {
  education: "/images/cause-school.jpg",
  medical: "/images/cause-medical.jpg",
  emergency: "/images/contrib-hero.jpg",
};

/* ------------------------------------------------------------------ */
/* Grants — six across the three pillars, each with a real schedule     */
/* ------------------------------------------------------------------ */
const sched = (amount: number, parts: number, from: string, paid: number): Grant["schedule"] => {
  const per = Math.round(amount / parts);
  return Array.from({ length: parts }, (_, i) => {
    const [y, m, d] = from.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1 + i * 3, d));
    return {
      no: i + 1,
      date: dt.toISOString().slice(0, 10),
      amount: i === parts - 1 ? amount - per * (parts - 1) : per,
      paid: i < paid,
      ref: `NY-FND-PAY-00${i + 1}`,
    };
  });
};

export const grants: Grant[] = [
  {
    id: "g1", ref: "NY-FND-2025-00041", title: "School fees — Brian Jr. & Sharon, terms 1–3",
    pillar: "education", beneficiary: "Brian Otieno Nalyanya (Jnr) · guardian: Ruth A.", minor: true, guardian: "Ruth Akinyi Nalyanya",
    branch: "Bungoma", amount: 180000, disbursed: 120000, starts: "2025-09-01", ends: "2026-04-30", status: "active",
    destination: "Bungoma High School paybill · acct BHS-0412", channel: "bank",
    purpose: "Secondary school fees for two pupils, paid straight to the school paybill each term.",
    note: "Pupil list verified by the Bungoma branch elder. Next release lands when term 2 invoices arrive.",
    schedule: sched(180000, 3, "2025-09-01", 2),
    documents: [
      { name: "Term 1 fee structure", kind: "School invoice", uploaded: "2025-08-28", verified: true },
      { name: "Term 2 fee structure", kind: "School invoice", uploaded: "2025-11-04", verified: true },
      { name: "Birth certificates", kind: "Identity", uploaded: "2025-08-28", verified: true },
    ],
  },
  {
    id: "g2", ref: "NY-FND-2025-00039", title: "Cardiac medicine — Mama Ruth, 6 months",
    pillar: "medical", beneficiary: "Ruth Akinyi Nalyanya", minor: false, guardian: "Peter Wanyama Nalyanya",
    branch: "Nairobi", amount: 150000, disbursed: 150000, starts: "2025-06-01", ends: "2025-11-30", status: "completed",
    destination: "M-Pesa ···· 2210 (pharmacy account)", channel: "mpesa",
    purpose: "Six months of cardiac medication and two specialist reviews at Nairobi Hospital.",
    note: "Closed in November. The family tops up anything the NHIF cover leaves behind.",
    schedule: sched(150000, 6, "2025-06-01", 6),
    documents: [
      { name: "Hospital invoice (June)", kind: "Hospital invoice", uploaded: "2025-06-04", verified: true },
      { name: "Pharmacy receipts", kind: "Receipt", uploaded: "2025-09-12", verified: true },
      { name: "Specialist report", kind: "Medical report", uploaded: "2025-06-04", verified: true },
    ],
  },
  {
    id: "g3", ref: "NY-FND-2025-00044", title: "Emergency relief — storm damage, Musanda",
    pillar: "emergency", beneficiary: "The Barasa household · guardian: Joseph N.", minor: false, guardian: "Joseph Nyongesa Nalyanya",
    branch: "Kakamega", amount: 95000, disbursed: 47500, starts: "2025-11-02", ends: "2026-01-15", status: "active",
    destination: "M-Pesa ···· 7726 (household)", channel: "mpesa",
    purpose: "Iron sheets, timber and labour after the April storms took half the roof.",
    note: "First tranche released for materials. Second tranche follows the contractor's sign-off.",
    schedule: sched(95000, 2, "2025-11-02", 1),
    documents: [
      { name: "Damage photographs", kind: "Evidence", uploaded: "2025-11-02", verified: true },
      { name: "Quotation from hardware", kind: "Quotation", uploaded: "2025-11-03", verified: true },
    ],
  },
  {
    id: "g4", ref: "NY-FND-2025-00043", title: "Surgical support — Millicent's procedure",
    pillar: "medical", beneficiary: "Millicent Aoko Nalyanya", minor: false, guardian: "Agnes Wanjiru Nalyanya",
    branch: "Nairobi", amount: 220000, disbursed: 110000, starts: "2025-10-10", ends: "2026-02-28", status: "active",
    destination: "Equity Bank ···· 4471 (hospital account)", channel: "bank",
    purpose: "Deposit and follow-up care for a planned procedure at Nairobi Hospital.",
    note: "Deposit paid to the hospital directly. The balance releases against the discharge summary.",
    schedule: sched(220000, 2, "2025-10-10", 1),
    documents: [
      { name: "Hospital pro-forma", kind: "Hospital invoice", uploaded: "2025-10-08", verified: true },
      { name: "Admission letter", kind: "Medical report", uploaded: "2025-10-08", verified: true },
    ],
  },
  {
    id: "g5", ref: "NY-FND-2025-00046", title: "Bursary top-up — Kimilili Girls, term 3",
    pillar: "education", beneficiary: "Sharon Aoko Nalyanya (Jnr) · guardian: Esther N.", minor: true, guardian: "Esther Nafula Nalyanya",
    branch: "Trans-Nzoia", amount: 60000, disbursed: 0, starts: "2025-12-01", ends: "2026-03-31", status: "approved",
    destination: "Kimilili Girls paybill · acct KGS-0091", channel: "bank",
    purpose: "Bursary top-up covering the balance the county bursary does not reach.",
    note: "Approved by the council. First release is scheduled for 1 December.",
    schedule: sched(60000, 2, "2025-12-01", 0),
    documents: [
      { name: "Bursary award letter", kind: "School invoice", uploaded: "2025-11-12", verified: true },
      { name: "Guardian consent", kind: "Consent", uploaded: "2025-11-12", verified: true },
    ],
  },
  {
    id: "g6", ref: "NY-FND-2025-00047", title: "Water tank — Musanda social hall",
    pillar: "emergency", beneficiary: "Musanda social hall committee", minor: false, guardian: "Collins Munyasia Nalyanya",
    branch: "Bungoma", amount: 75000, disbursed: 0, starts: "2025-12-15", ends: "2026-02-28", status: "pending",
    destination: "KCB ···· 9920 (project account)", channel: "bank",
    purpose: "A 10,000-litre tank so the hall garden survives the dry months.",
    note: "Awaiting two quotes from the council before the first release.",
    schedule: sched(75000, 1, "2025-12-15", 0),
    documents: [{ name: "Committee request letter", kind: "Request", uploaded: "2025-11-15", verified: false }],
  },
];

/* ------------------------------------------------------------------ */
/* Applications — the intake queue                                       */
/* ------------------------------------------------------------------ */
export const applications: Application[] = [
  { id: "a1", ref: "NY-APP-2025-00058", applicant: "Grace Kwamboka Nalyanya", applicantId: "m12", pillar: "education", amount: 84000, purpose: "University tuition balance, second year", justification: "My daughter's tuition balance for the second semester. I have already paid KES 40,000 from my savings and need the balance cleared before exams.", status: "under-review", submitted: "2025-11-16", reviewer: "Peter Wanyama Nalyanya", documents: ["Admission letter", "Fee statement", "Payslip"] },
  { id: "a2", ref: "NY-APP-2025-00057", applicant: "Dennis Barasa Nalyanya", applicantId: "m18", pillar: "medical", amount: 65000, purpose: "Dialysis sessions, three months", justification: "Three months of dialysis at Kakamega County Referral. My NSSF cover has run out and the family chama has already topped up KES 20,000.", status: "under-review", submitted: "2025-11-15", reviewer: "—", documents: ["Hospital card", "Doctor's note"] },
  { id: "a3", ref: "NY-APP-2025-00056", applicant: "Samuel Kiprop Nalyanya", applicantId: "m14", pillar: "emergency", amount: 40000, purpose: "Replacement bed and bedding after the fire", justification: "Our bed and bedding were lost in the kitchen fire on 9 November. Neighbours have already helped with food.", status: "submitted", submitted: "2025-11-14", reviewer: "—", documents: ["Photographs"] },
  { id: "a4", ref: "NY-APP-2025-00055", applicant: "Agnes Wanjiru Nalyanya", applicantId: "m11", pillar: "education", amount: 52000, purpose: "Form 4 registration and exam fees", justification: "Registration and exam fees for my son at St. Mary's. The county bursary covers tuition only.", status: "approved", submitted: "2025-11-10", reviewer: "Family head · Mzee V. office", documents: ["School invoice", "Bursary letter"] },
  { id: "a5", ref: "NY-APP-2025-00054", applicant: "Lydia Atieno Nalyanya", applicantId: "m22", pillar: "medical", amount: 130000, purpose: "Maternity cover, Nairobi hospital", justification: "Maternity deposit and delivery costs. I am due in January and my insurance tops out at KES 60,000.", status: "paid", submitted: "2025-11-04", reviewer: "Peter Wanyama Nalyanya", documents: ["Pro-forma invoice", "Scan report"] },
  { id: "a6", ref: "NY-APP-2025-00053", applicant: "Kevin Otieno Nalyanya", applicantId: "m23", pillar: "emergency", amount: 250000, purpose: "Business stock replacement after burglary", justification: "Stock stolen from the shop in Nairobi. I am asking for a large amount against a business I have not yet documented.", status: "declined", submitted: "2025-11-06", reviewer: "Loan committee · Mzee V. office", documents: ["Police abstract"] },
];

/* ------------------------------------------------------------------ */
/* Ledger + audit                                                        */
/* ------------------------------------------------------------------ */
export const ledger: LedgerEntry[] = [
  { ref: "NY-LED-0004561", at: "16 Nov · 11:20", debit: "Foundation pool", credit: "School paybill · BHS-0412", amount: 60000, source: "NY-FND-2025-00041" },
  { ref: "NY-LED-0004558", at: "12 Nov · 09:04", debit: "Foundation pool", credit: "M-Pesa ···· 7726", amount: 47500, source: "NY-FND-2025-00044" },
  { ref: "NY-LED-0004540", at: "08 Nov · 15:32", debit: "Foundation pool", credit: "Equity ···· 4471 (hospital)", amount: 110000, source: "NY-FND-2025-00043" },
  { ref: "NY-LED-0004531", at: "04 Nov · 10:11", debit: "M-Pesa clearing", credit: "Foundation pool", amount: 75000, source: "NY-APP-2025-00054" },
  { ref: "NY-LED-0004490", at: "31 Oct · 16:44", debit: "Bank clearing · Coop", credit: "Foundation pool", amount: 120000, source: "NY-DIV-2025-00007" },
  { ref: "NY-LED-0004461", at: "30 Sep · 09:18", debit: "Foundation pool", credit: "M-Pesa ···· 2210", amount: 25000, source: "NY-FND-2025-00039" },
];

export const audit: AuditEntry[] = [
  { ref: "NY-AUD-01091", at: "16 Nov · 11:20", actor: "Treasurer · Peter W.", action: "grant.disburse", entity: "NY-FND-2025-00041", detail: "KES 60,000 → school paybill · term 2 of 3 · SIMULATED", tone: "gold" },
  { ref: "NY-AUD-01090", at: "16 Nov · 10:40", actor: "Grace Kwamboka Nalyanya", action: "application.submit", entity: "NY-APP-2025-00058", detail: "KES 84,000 · education · 3 documents attached", tone: "plain" },
  { ref: "NY-AUD-01089", at: "15 Nov · 14:02", actor: "Grant council · elders", action: "grant.review", entity: "NY-FND-2025-00047", detail: "Awaiting two quotes before first release", tone: "plain" },
  { ref: "NY-AUD-01088", at: "12 Nov · 09:04", actor: "Treasurer · Peter W.", action: "grant.disburse", entity: "NY-FND-2025-00044", detail: "KES 110,000 → hospital account · deposit · SIMULATED", tone: "gold" },
  { ref: "NY-AUD-01087", at: "10 Nov · 12:15", actor: "Family head · Mzee V. office", action: "application.approve", entity: "NY-APP-2025-00055", detail: "KES 52,000 · education · reason logged", tone: "gold" },
  { ref: "NY-AUD-01086", at: "06 Nov · 16:48", actor: "Loan committee · Mzee V. office", action: "application.decline", entity: "NY-APP-2025-00053", detail: "Business case undocumented · applicant invited to reapply", tone: "red" },
  { ref: "NY-AUD-01085", at: "04 Nov · 10:11", actor: "Lydia Atieno Nalyanya", action: "application.pay", entity: "NY-APP-2025-00054", detail: "KES 130,000 disbursed to maternity account · SIMULATED", tone: "gold" },
  { ref: "NY-AUD-01084", at: "02 Nov · 08:30", actor: "Peter Wanyama Nalyanya", action: "grant.create", entity: "NY-FND-2025-00044", detail: "Emergency relief · storm damage · Kakamega branch", tone: "plain" },
];

/* ------------------------------------------------------------------ */
/* Donors + governance + reconciliation                                 */
/* ------------------------------------------------------------------ */
export const donors: Donor[] = [
  { id: "d1", name: "Nairobi branch pool", since: "2021", total: 640000, count: 34, anonymous: false },
  { id: "d2", name: "Bungoma branch pool", since: "2021", total: 512000, count: 41, anonymous: false },
  { id: "d3", name: "Trans-Nzoia branch pool", since: "2022", total: 388000, count: 27, anonymous: false },
  { id: "d4", name: "Diaspora circle", since: "2022", total: 296000, count: 22, anonymous: false },
  { id: "d5", name: "Sacco dividend hand-back", since: "2023", total: 240000, count: 1, anonymous: false },
  { id: "d6", name: "Anonymous family member", since: "2024", total: 185000, count: 9, anonymous: true },
  { id: "d7", name: "Kakamega branch pool", since: "2022", total: 171000, count: 19, anonymous: false },
  { id: "d8", name: "Well-wishers, Musanda", since: "2025", total: 64000, count: 31, anonymous: false },
];

export const governance = {
  chair: "Mzee Victor Nalyanya (office)",
  treasurer: "Peter Wanyama Nalyanya",
  secretary: "Faith Chebet Nalyanya",
  elders: [
    { name: "Ruth Akinyi Nalyanya", role: "Elder · Nairobi", since: "2021" },
    { name: "Samuel Kiprop Nalyanya", role: "Elder · Trans-Nzoia", since: "2022" },
    { name: "Joseph Nyongesa Nalyanya", role: "Elder · Kakamega", since: "2023" },
  ],
  reports: [
    { year: 2024, pages: 24, published: "2025-04-02", disbursed: 812000 },
    { year: 2023, pages: 21, published: "2024-04-05", disbursed: 604000 },
    { year: 2022, pages: 18, published: "2023-04-03", disbursed: 431000 },
  ],
  publicSync: true,
};

export const reconciliation: ReconLine[] = [
  { ref: "RKX7H8KP2", at: "16 Nov 11:20", statement: "School paybill 400200 · BHS-0412", ledgerSide: "NY-FND-2025-00041", amount: 60000, match: "matched" },
  { ref: "RKX7H7TT4", at: "12 Nov 09:06", statement: "Paybill 4471 · Barasa household", ledgerSide: "NY-FND-2025-00044", amount: 47500, match: "matched" },
  { ref: "EFT-88213", at: "08 Nov 15:33", statement: "Equity EFT · hospital account", ledgerSide: "NY-FND-2025-00043", amount: 110000, match: "matched" },
  { ref: "RKX7H6QQ1", at: "04 Nov 10:12", statement: "Paybill 4471 · maternity deposit", ledgerSide: "— not in ledger yet", amount: 130000, match: "missing" },
  { ref: "EFT-88190", at: "31 Oct 16:45", statement: "Coop clearing · Sacco dividend", ledgerSide: "NY-DIV-2025-00007 (KES 120,000)", amount: 120000, match: "mismatch" },
  { ref: "RKX7H8KP2", at: "16 Nov 11:21", statement: "School paybill · duplicate replay", ledgerSide: "NY-FND-2025-00041", amount: 60000, match: "duplicate" },
];

/* ------------------------------------------------------------------ */
/* Frames — the photography behind the grants (same library, T-11 captions) */
/* ------------------------------------------------------------------ */
export const frames: Frame[] = [
  { id: "fd1", src: "/images/cause-school.jpg", title: "Term reopens", caption: "Sharon and Brian Jr. the morning the second fee release reached the school paybill.", frame: "31", lens: "50mm", exposure: "1/500 · f2.8", place: "Kimilili" },
  { id: "fd2", src: "/images/cause-medical.jpg", title: "Clinic corridor", caption: "Mama Ruth walks out of her second cardiac review — six months of medicine paid for.", frame: "32A", lens: "35mm", exposure: "1/60 · f2", place: "Nairobi" },
  { id: "fd3", src: "/images/contrib-hero.jpg", title: "The harambee table", caption: "Bungoma veranda — where the foundation's emergency fund was counted by hand first.", frame: "33", lens: "35mm", exposure: "1/125 · f2.8", place: "Bungoma" },
  { id: "fd4", src: "/images/cause-water.jpg", title: "First water", caption: "Musanda — the community projects the foundation funds when a household is not involved.", frame: "34", lens: "28mm", exposure: "1/1000 · f5.6", place: "Musanda" },
  { id: "fd5", src: "/images/frame-elder.jpg", title: "The ledger", caption: "Mzee Victor's handwritten giving book — the record every grant still answers to.", frame: "35A", lens: "90mm macro", exposure: "1/45 · f2.8", place: "Kitale" },
  { id: "fd6", src: "/images/frame-reunion.jpg", title: "Reunion steps", caption: "Five generations. The foundation exists so no one here is left to pay alone.", frame: "36", lens: "85mm", exposure: "1/250 · f4", place: "Trans-Nzoia" },
  { id: "fd7", src: "/images/cause-memorial.jpg", title: "Send-off", caption: "What emergency relief looks like when it arrives in time — a dignified farewell.", frame: "37", lens: "50mm", exposure: "1/125 · f2.8", place: "Trans-Nzoia" },
  { id: "fd8", src: "/images/fin-sacco.jpg", title: "The counters", caption: "Dividend hand-backs from the Sacco are one of the foundation's largest single donors.", frame: "38", lens: "50mm", exposure: "1/80 · f2.8", place: "Nairobi" },
];

export const channels: { id: Channel; label: string; eta: string; sim: boolean }[] = [
  { id: "mpesa", label: "M-Pesa B2C", eta: "seconds", sim: true },
  { id: "bank", label: "Bank EFT / paybill", eta: "same day", sim: true },
  { id: "internal", label: "Internal ledger", eta: "instant", sim: false },
];

/* ------------------------------------------------------------------ */
/* Derived — every KPI and pillar total is computed here                */
/* ------------------------------------------------------------------ */
export const pillarOf = (g: Grant): Pillar => g.pillar;

export function pillarStats(list: Grant[]): Record<Pillar, { disbursed: number; committed: number; active: number; count: number }> {
  const out = {
    education: { disbursed: 0, committed: 0, active: 0, count: 0 },
    medical: { disbursed: 0, committed: 0, active: 0, count: 0 },
    emergency: { disbursed: 0, committed: 0, active: 0, count: 0 },
  } as Record<Pillar, { disbursed: number; committed: number; active: number; count: number }>;
  for (const g of list) {
    const s = out[g.pillar];
    s.disbursed += g.disbursed;
    s.committed += g.amount;
    s.count += 1;
    if (g.status === "active" || g.status === "approved") s.active += 1;
  }
  return out;
}

export const totalDisbursed = (list: Grant[]) => list.reduce((s, g) => s + g.disbursed, 0);
export const totalCommitted = (list: Grant[]) => list.reduce((s, g) => s + g.amount, 0);
export const activeBeneficiaries = (list: Grant[]) => list.filter((g) => g.status === "active" || g.status === "approved").length;
export const pendingApplications = (list: Application[]) => list.filter((a) => a.status === "submitted" || a.status === "under-review").length;
export const fundedThisYear = (list: Grant[]) => list.filter((g) => g.starts.startsWith("2025")).reduce((s, g) => s + g.disbursed, 0);
export const donorCount = (list: Donor[]) => list.length;
export const grantPct = (g: Grant) => pct(g.disbursed, g.amount);
export const monthsLeft = (g: Grant) => Math.max(0, Math.round((Date.parse(g.ends) - Date.parse(AS_OF)) / 2_629_800_000));

export const fmtDate = (iso: string): string => {
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${M[Number(m) - 1]} ${y}`;
};
