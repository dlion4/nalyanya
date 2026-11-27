/* T-10 Loans — mock data (frontend-only Phase 1).
   Every schedule, balance, due date, penalty and status is COMPUTED from the loan terms
   below, so every number on the page agrees with every other number.
   KES via kes() · EAT dates (ISO strings, formatted by fmtDate) · IDs per nalyanyaMO.md §3.4.
   Signed-in user is Peter Wanyama Nalyanya (ME_ID), the same person as the T-1 shell. */

import { pct } from "@/lib/format";

export const ME_ID = "m05";
export const AS_OF = "2025-11-18";
export const unitValue = 1200;

export type ProductId =
  | "short-term"
  | "long-term"
  | "salary"
  | "school"
  | "emergency"
  | "asset"
  | "sacco"
  | "chama"
  | "family";
export type Method = "flat" | "reducing";
export type Freq = "monthly" | "single";
export type Channel = "mpesa" | "bank" | "internal";
export type Stored = "applied" | "under-review" | "approved" | "declined" | "written-off";
export type Status = Stored | "disbursed" | "repaying" | "overdue" | "restructured" | "settled";
export type Scope = "individual" | "family" | "group";
export type Tone = "plain" | "gold" | "red";

export type Product = {
  id: ProductId;
  name: string;
  chip: string;
  tone: string;
  blurb: string;
  min: number;
  max: number;
  termMin: number;
  termMax: number;
  rate: number;
  method: Method;
  freq: Freq;
  shares: boolean;
  sharesX: number;
  guarantors: number;
  salary: boolean;
  collateral: boolean;
  school: boolean;
  scope: Scope;
  fast: boolean;
  image: string;
};

export type Member = { id: string; name: string; initials: string; branch: string; shares: number; netSalary: number };
export type Guarantor = { id: string; shares: number };

export type Loan = {
  id: string;
  ref: string;
  product: ProductId;
  title: string;
  purpose: string;
  borrowers: string[];
  branch: string;
  amount: number;
  rate: number;
  method: Method;
  freq: Freq;
  termMonths: number;
  start: string | null;
  applied: string;
  channel: Channel;
  destination: string;
  stored: Stored | null;
  paid: number;
  priorPaid: number;
  restructures: number;
  penaltyWaived: boolean;
  guarantors: Guarantor[];
  collateral: { desc: string; value: number } | null;
  school: { name: string; paybill: string } | null;
  image: string;
  note: string;
};

export type Row = { no: number; due: string; principal: number; interest: number; instalment: number; balance: number };

export type Repayment = {
  ref: string;
  loanId: string;
  date: string;
  amount: number;
  channel: Channel;
  status: "confirmed" | "pending";
  ledger: string;
  no: number;
};

export type AuditEntry = { ref: string; at: string; actor: string; action: string; entity: string; detail: string; tone: Tone };

export type Policy = {
  sharesMultiplier: number;
  pledgePct: number;
  maxActive: number;
  autoApproveUnder: number;
  twoFactorAbove: number;
  fourEyesAbove: number;
  graceDays: number;
  penaltyPct: number;
  callUpAfterDays: number;
  writeOffAfterDays: number;
  salaryCapPct: number;
  creditBase: number;
};

/* ------------------------------------------------------------------ */
/* Policy — family-wide rules (changed only through the 2FA policy editor) */
/* ------------------------------------------------------------------ */
export const policy: Policy = {
  sharesMultiplier: 3,
  pledgePct: 50,
  maxActive: 3,
  autoApproveUnder: 15000,
  twoFactorAbove: 100000,
  fourEyesAbove: 250000,
  graceDays: 5,
  penaltyPct: 5,
  callUpAfterDays: 14,
  writeOffAfterDays: 180,
  salaryCapPct: 50,
  creditBase: 150000,
};

export const policyLabels: Record<keyof Policy, string> = {
  sharesMultiplier: "Sacco loan multiplier (× shares)",
  pledgePct: "Share of a guarantor’s shares that counts (%)",
  maxActive: "Active loans allowed per member",
  autoApproveUnder: "Auto-approve below (KES)",
  twoFactorAbove: "2FA approval above (KES)",
  fourEyesAbove: "Second approver above (KES)",
  graceDays: "Grace days before penalty",
  penaltyPct: "Late penalty (% of the instalment)",
  callUpAfterDays: "Guarantor call-up after (days)",
  writeOffAfterDays: "Write-off review after (days)",
  salaryCapPct: "Salary advance cap (% of net pay)",
  creditBase: "Credit base for unsecured loans (KES)",
};

/* ------------------------------------------------------------------ */
/* The catalogue — nine products                                        */
/* ------------------------------------------------------------------ */
export const products: Product[] = [
  { id: "short-term", name: "Short-Term Personal", chip: "Short-term", tone: "ny-chip-info", blurb: "A bridge for a few months. Flat interest, paid monthly.", min: 5000, max: 100000, termMin: 1, termMax: 6, rate: 12, method: "flat", freq: "monthly", shares: false, sharesX: 0, guarantors: 0, salary: false, collateral: false, school: false, scope: "individual", fast: false, image: "/images/frame-elder.jpg" },
  { id: "long-term", name: "Long-Term Personal", chip: "Long-term", tone: "ny-chip-brand", blurb: "Bigger goals over up to three years. Reducing balance and two guarantors.", min: 50000, max: 1000000, termMin: 6, termMax: 36, rate: 11, method: "reducing", freq: "monthly", shares: false, sharesX: 0, guarantors: 2, salary: false, collateral: false, school: false, scope: "individual", fast: false, image: "/images/fin-sacco.jpg" },
  { id: "salary", name: "Salary Advance", chip: "Salary advance", tone: "ny-chip-warn", blurb: "Up to half your net pay, repaid in one go on payday.", min: 2000, max: 50000, termMin: 1, termMax: 1, rate: 48, method: "flat", freq: "single", shares: false, sharesX: 0, guarantors: 0, salary: true, collateral: false, school: false, scope: "individual", fast: true, image: "/images/contrib-hero.jpg" },
  { id: "school", name: "School-Fees Loan", chip: "School fees", tone: "ny-chip-info", blurb: "Paid straight to the school paybill. Repaid monthly across the term.", min: 20000, max: 300000, termMin: 3, termMax: 12, rate: 9, method: "flat", freq: "monthly", shares: false, sharesX: 0, guarantors: 0, salary: false, collateral: false, school: true, scope: "individual", fast: false, image: "/images/cause-school.jpg" },
  { id: "emergency", name: "Emergency Medical", chip: "Emergency", tone: "ny-chip-danger", blurb: "Fast-tracked within 24 hours against your shares. The hospital can be paid direct.", min: 5000, max: 150000, termMin: 1, termMax: 6, rate: 8, method: "reducing", freq: "monthly", shares: true, sharesX: 1, guarantors: 0, salary: false, collateral: false, school: false, scope: "individual", fast: true, image: "/images/cause-medical.jpg" },
  { id: "asset", name: "Asset & Business", chip: "Asset / business", tone: "ny-chip-brand", blurb: "Tools, machines and stock for a small business. Collateral and one guarantor.", min: 50000, max: 3000000, termMin: 3, termMax: 60, rate: 13, method: "reducing", freq: "monthly", shares: false, sharesX: 0, guarantors: 1, salary: false, collateral: true, school: false, scope: "individual", fast: false, image: "/images/cause-water.jpg" },
  { id: "sacco", name: "Sacco-Backed", chip: "Sacco-backed", tone: "ny-chip-ok", blurb: "Borrow up to three times your shares at the family’s lowest rate.", min: 10000, max: 1000000, termMin: 6, termMax: 48, rate: 12, method: "reducing", freq: "monthly", shares: true, sharesX: 3, guarantors: 0, salary: false, collateral: false, school: false, scope: "individual", fast: false, image: "/images/fin-sacco.jpg" },
  { id: "chama", name: "Chama Group Loan", chip: "Chama group", tone: "ny-chip-warn", blurb: "The circle borrows together against pooled shares. At least three members co-sign.", min: 100000, max: 2000000, termMin: 6, termMax: 24, rate: 12, method: "reducing", freq: "monthly", shares: true, sharesX: 3, guarantors: 0, salary: false, collateral: false, school: false, scope: "group", fast: false, image: "/images/fin-chama-hero.jpg" },
  { id: "family", name: "Family Joint Loan", chip: "Family joint", tone: "ny-chip-brand", blurb: "Two or more family members co-sign one loan. The family head stands behind it.", min: 50000, max: 1500000, termMin: 6, termMax: 36, rate: 11, method: "reducing", freq: "monthly", shares: false, sharesX: 0, guarantors: 1, salary: false, collateral: false, school: false, scope: "family", fast: false, image: "/images/frame-reunion.jpg" },
];

export const productOf = (id: ProductId): Product => products.find((p) => p.id === id) ?? products[0];

/* ------------------------------------------------------------------ */
/* Members — borrowers, co-signers and guarantors                       */
/* ------------------------------------------------------------------ */
export const members: Member[] = [
  { id: "m05", name: "Peter Wanyama Nalyanya", initials: "PW", branch: "Nairobi", shares: 120, netSalary: 95000 },
  { id: "m02", name: "Ruth Akinyi Nalyanya", initials: "RA", branch: "Nairobi", shares: 60, netSalary: 110000 },
  { id: "m07", name: "Faith Chebet Nalyanya", initials: "FC", branch: "Nairobi", shares: 90, netSalary: 140000 },
  { id: "m11", name: "Agnes Wanjiru Nalyanya", initials: "AW", branch: "Nairobi", shares: 40, netSalary: 88000 },
  { id: "m21", name: "Millicent Aoko Nalyanya", initials: "MA", branch: "Nairobi", shares: 35, netSalary: 82000 },
  { id: "m15", name: "Hamza Hassan Nalyanya", initials: "HH", branch: "Nairobi", shares: 18, netSalary: 76000 },
  { id: "m03", name: "Brian Otieno Nalyanya", initials: "BO", branch: "Bungoma", shares: 22, netSalary: 66000 },
  { id: "m09", name: "Esther Nafula Nalyanya", initials: "EN", branch: "Trans-Nzoia", shares: 35, netSalary: 70000 },
  { id: "m14", name: "Samuel Kiprop Nalyanya", initials: "SK", branch: "Trans-Nzoia", shares: 30, netSalary: 64000 },
  { id: "m12", name: "Grace Kwamboka Nalyanya", initials: "GK", branch: "Kakamega", shares: 25, netSalary: 72000 },
  { id: "m18", name: "Dennis Barasa Nalyanya", initials: "DB", branch: "Kakamega", shares: 12, netSalary: 58000 },
  { id: "m19", name: "Joseph Nyongesa Nalyanya", initials: "JN", branch: "Kakamega", shares: 20, netSalary: 61000 },
  { id: "m22", name: "Lydia Atieno Nalyanya", initials: "LA", branch: "Diaspora", shares: 10, netSalary: 90000 },
  { id: "m23", name: "Kevin Otieno Nalyanya", initials: "KO", branch: "Diaspora", shares: 0, netSalary: 150000 },
];

export const memberOf = (id: string): Member | undefined => members.find((m) => m.id === id);
export const nameOf = (id: string): string => memberOf(id)?.name ?? "—";

/* ------------------------------------------------------------------ */
/* Dates + schedule maths (pure, deterministic)                         */
/* ------------------------------------------------------------------ */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
}

export function addMonths(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, d)).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

type TermFields = Pick<Loan, "amount" | "rate" | "method" | "freq" | "termMonths" | "start">;

/** Flat or reducing-balance schedule. Last row absorbs rounding so the balance lands on zero. */
export function schedule(l: TermFields): Row[] {
  const start = l.start ?? AS_OF;
  const n = l.freq === "single" ? 1 : l.termMonths;
  const r = l.rate / 1200;
  const flatInterest = l.amount * (l.rate / 100) * (l.termMonths / 12);
  const emi =
    l.method === "flat"
      ? (l.amount + flatInterest) / n
      : r === 0
        ? l.amount / n
        : (l.amount * r) / (1 - Math.pow(1 + r, -n));
  const inst = Math.round(emi);
  const rows: Row[] = [];
  let bal = l.amount;
  for (let i = 0; i < n; i++) {
    const last = i === n - 1;
    const interest = l.method === "flat" ? Math.round(flatInterest / n) : Math.round(bal * r);
    const principal = last ? bal : inst - interest;
    const instalment = last ? principal + interest : inst;
    bal -= principal;
    rows.push({
      no: i + 1,
      due: l.freq === "single" ? addMonths(start, l.termMonths) : addMonths(start, i + 1),
      principal,
      interest,
      instalment,
      balance: Math.max(0, bal),
    });
  }
  return rows;
}

export const totalOf = (rows: Row[]): number => rows.reduce((s, r) => s + r.instalment, 0);

/** Whole instalments covered by what has been paid, earliest first. */
export function paidCountOf(rows: Row[], paid: number): number {
  let acc = 0;
  let k = 0;
  for (const r of rows) {
    if (acc + r.instalment <= paid) {
      acc += r.instalment;
      k += 1;
    } else break;
  }
  return k;
}

export const activeStatuses: Status[] = ["disbursed", "repaying", "overdue", "restructured"];
export const pendingStatuses: Status[] = ["applied", "under-review", "approved"];
export const closedStatuses: Status[] = ["settled", "declined", "written-off"];

export type LoanView = {
  loan: Loan;
  rows: Row[];
  total: number;
  k: number;
  due: number;
  status: Status;
  next: Row | null;
  daysLate: number;
  penalty: number;
  overdueAmt: number;
  principalLeft: number;
  outstanding: number;
  pct: number;
  instalment: number;
};

/** Everything the UI needs about one loan, derived from its terms and payments. */
export function viewOf(loan: Loan, rules: Policy = policy): LoanView {
  const rows = schedule(loan);
  const total = totalOf(rows);
  const k = paidCountOf(rows, loan.paid);
  const due = rows.filter((r) => r.due <= AS_OF).length;
  const next = rows[k] ?? null;
  let status: Status;
  if (loan.stored) status = loan.stored;
  else if (total > 0 && loan.paid >= total) status = "settled";
  else if (k < due) status = "overdue";
  else if (loan.restructures > 0 && loan.paid === 0) status = "restructured";
  else if (due === 0 && loan.paid === 0) status = "disbursed";
  else status = "repaying";
  const daysLate = status === "overdue" && next ? Math.max(0, daysBetween(next.due, AS_OF)) : 0;
  const penalty =
    status === "overdue" && next && daysLate > rules.graceDays && !loan.penaltyWaived
      ? Math.round((next.instalment * rules.penaltyPct) / 100)
      : 0;
  const principalLeft = k >= rows.length ? 0 : k === 0 ? loan.amount : rows[k - 1].balance;
  return {
    loan,
    rows,
    total,
    k,
    due,
    status,
    next,
    daysLate,
    penalty,
    overdueAmt: rows.slice(k, due).reduce((s, r) => s + r.instalment, 0),
    principalLeft,
    outstanding: Math.max(0, total - loan.paid),
    pct: pct(loan.paid, total),
    instalment: rows[0]?.instalment ?? 0,
  };
}

/* ------------------------------------------------------------------ */
/* Eligibility — shares × multiplier, salary cap, or credit + pledges    */
/* ------------------------------------------------------------------ */
export type Ceiling = { ceiling: number; available: number; basis: string; pledge: number };

export function ceilingFor(p: Product, borrowers: Member[], guarantors: Guarantor[], rules: Policy, obligations: number): Ceiling {
  const shares = borrowers.reduce((s, m) => s + m.shares, 0);
  const pledge = Math.round(guarantors.reduce((s, g) => s + g.shares, 0) * unitValue * (rules.pledgePct / 100));
  let base: number;
  let basis: string;
  if (p.salary) {
    base = Math.round((borrowers[0]?.netSalary ?? 0) * (rules.salaryCapPct / 100));
    basis = `${rules.salaryCapPct}% of net monthly pay`;
  } else if (p.shares) {
    const mult = p.id === "sacco" || p.id === "chama" ? rules.sharesMultiplier : p.sharesX;
    base = shares * unitValue * mult;
    basis = `${mult}× the ${shares} shares held`;
  } else {
    base = rules.creditBase + pledge;
    basis = "Credit base plus guarantor pledges";
  }
  const ceiling = Math.min(p.max, base);
  return { ceiling, available: Math.max(0, ceiling - obligations), basis, pledge };
}

/** What a member still owes. A joint or group loan is shared equally between its co-signers. */
export function obligationsOf(memberId: string, loans: Loan[], rules: Policy = policy): number {
  return Math.round(
    loans
      .filter((l) => l.borrowers.includes(memberId))
      .map((l) => ({ l, v: viewOf(l, rules) }))
      .filter(({ v }) => activeStatuses.includes(v.status))
      .reduce((s, { l, v }) => s + v.principalLeft / Math.max(1, l.borrowers.length), 0),
  );
}

export function activeCountOf(memberId: string, loans: Loan[], rules: Policy = policy): number {
  return loans
    .filter((l) => l.borrowers.includes(memberId))
    .map((l) => viewOf(l, rules))
    .filter((v) => activeStatuses.includes(v.status)).length;
}

export const statusMeta: Record<Status, { label: string; tone: string; hint: string }> = {
  applied: { label: "Applied", tone: "ny-chip-neutral", hint: "Received — waiting for the review queue" },
  "under-review": { label: "Under review", tone: "ny-chip-info", hint: "Guarantors, eligibility and documents being checked" },
  approved: { label: "Approved", tone: "ny-chip-brand", hint: "Approved — ready to disburse" },
  declined: { label: "Declined", tone: "ny-chip-neutral", hint: "Not approved this time — the reason is on file" },
  "written-off": { label: "Written off", tone: "ny-chip-danger", hint: "Closed as a loss with reason and 2FA on file" },
  disbursed: { label: "Disbursed", tone: "ny-chip-ok", hint: "Money sent — first instalment not yet due" },
  repaying: { label: "Repaying", tone: "ny-chip-brand", hint: "On schedule" },
  overdue: { label: "Overdue", tone: "ny-chip-danger", hint: "An instalment is past its due date" },
  restructured: { label: "Restructured", tone: "ny-chip-warn", hint: "New schedule agreed — first instalment ahead" },
  settled: { label: "Settled", tone: "ny-chip-ok", hint: "Paid in full · guarantor shares released" },
};

/* ------------------------------------------------------------------ */
/* The book — thirteen loans across every stage of the lifecycle         */
/* ------------------------------------------------------------------ */
type Draft = Omit<
  Loan,
  "paid" | "priorPaid" | "restructures" | "penaltyWaived" | "stored" | "guarantors" | "collateral" | "school" | "note" | "start"
> &
  Partial<Pick<Loan, "stored" | "guarantors" | "collateral" | "school" | "note" | "start">>;

/** Builds a loan and sets `paid` to exactly the first k instalments, so history and balances agree. */
function seal(d: Draft, k: number): Loan {
  const base: Loan = {
    stored: null,
    guarantors: [],
    collateral: null,
    school: null,
    note: "",
    start: null,
    paid: 0,
    priorPaid: 0,
    restructures: 0,
    penaltyWaived: false,
    ...d,
  };
  const rows = schedule(base);
  const paid = rows.slice(0, k).reduce((s, r) => s + r.instalment, 0);
  return { ...base, paid };
}

export const seedLoans: Loan[] = [
  seal({ id: "ln-00121", ref: "NY-LON-2025-00121", product: "sacco", title: "Sacco-backed loan — land deposit and home repairs", purpose: "Land deposit and home repairs", borrowers: ["m05"], branch: "Nairobi", amount: 150000, rate: 12, method: "reducing", freq: "monthly", termMonths: 12, start: "2025-06-05", applied: "2025-05-28", channel: "mpesa", destination: "M-Pesa ···· 2210", image: "/images/fin-sacco.jpg", note: "Secured by 120 Sacco shares. Instalments fall on the 5th of each month.", guarantors: [] }, 5),
  seal({ id: "ln-00114", ref: "NY-LON-2025-00114", product: "emergency", title: "Emergency medical — Dennis’s hospital bill", purpose: "Hospital bill at Kakamega County", borrowers: ["m18"], branch: "Kakamega", amount: 47100, rate: 8, method: "reducing", freq: "monthly", termMonths: 4, start: "2025-07-12", applied: "2025-07-08", channel: "mpesa", destination: "M-Pesa ···· 7726", image: "/images/cause-medical.jpg", note: "Joseph Nyongesa is the guarantor on file. Instalment four is past due.", guarantors: [{ id: "m19", shares: 20 }] }, 3),
  seal({ id: "ln-00115", ref: "NY-LON-2025-00115", product: "chama", title: "Nairobi Merry-Go-Round — group loan", purpose: "Working capital for the circle’s savings pool", borrowers: ["m02", "m05", "m07", "m11"], branch: "Nairobi", amount: 400000, rate: 12, method: "reducing", freq: "monthly", termMonths: 12, start: "2025-09-05", applied: "2025-08-26", channel: "bank", destination: "Chama account · Equity ···· 4471", image: "/images/fin-chama-hero.jpg", note: "Four co-signers from the Nairobi circle. Repaid from the pooled account." }, 2),
  seal({ id: "ln-00116", ref: "NY-LON-2025-00116", product: "school", title: "School fees — Brian Jr. and Sharon, terms 1 and 2", purpose: "Secondary school fees", borrowers: ["m07"], branch: "Bungoma", amount: 120000, rate: 9, method: "flat", freq: "monthly", termMonths: 6, start: "2025-09-01", applied: "2025-08-20", channel: "bank", destination: "Bungoma High School paybill", school: { name: "Bungoma High School", paybill: "Fees paybill 400200 · acct BHS-0412" }, image: "/images/cause-school.jpg", note: "Paid direct to the school. Repayments fall on the 1st." }, 2),
  seal({ id: "ln-00118", ref: "NY-LON-2025-00118", product: "long-term", title: "Long-term personal — tailoring stock and shop rent", purpose: "Tailoring stock and shop rent", borrowers: ["m18"], branch: "Kakamega", amount: 97000, rate: 11, method: "reducing", freq: "monthly", termMonths: 12, start: "2025-07-03", applied: "2025-06-24", channel: "mpesa", destination: "M-Pesa ···· 7726", image: "/images/frame-elder.jpg", note: "Instalment four of twelve cleared. Two guarantors on file.", guarantors: [{ id: "m14", shares: 30 }, { id: "m12", shares: 25 }] }, 4),
  seal({ id: "ln-00124", ref: "NY-LON-2025-00124", product: "asset", title: "Tailoring workshop — equipment and stock", purpose: "Workshop equipment in Karen", borrowers: ["m21"], branch: "Nairobi", amount: 480000, rate: 13, method: "reducing", freq: "monthly", termMonths: 24, applied: "2025-11-12", channel: "bank", destination: "Equity Bank ···· 4471", stored: "under-review", image: "/images/cause-water.jpg", note: "Two sewing machines and a cutting table are pledged as collateral.", guarantors: [{ id: "m11", shares: 40 }], collateral: { desc: "Two industrial sewing machines and a cutting table, Karen", value: 520000 } }, 0),
  seal({ id: "ln-00125", ref: "NY-LON-2025-00125", product: "salary", title: "Salary advance — payday 25 November", purpose: "Bridge to payday", borrowers: ["m15"], branch: "Nairobi", amount: 25000, rate: 48, method: "flat", freq: "single", termMonths: 1, applied: "2025-11-17", channel: "mpesa", destination: "M-Pesa ···· 9920", stored: "approved", image: "/images/contrib-hero.jpg", note: "Repaid in one instalment on payday." }, 0),
  seal({ id: "ln-00120", ref: "NY-LON-2025-00120", product: "long-term", title: "Long-term personal — house extension in Kisumu", purpose: "House extension", borrowers: ["m23"], branch: "Diaspora", amount: 900000, rate: 11, method: "reducing", freq: "monthly", termMonths: 36, applied: "2025-11-02", channel: "bank", destination: "Stanbic ···· 2081", stored: "declined", image: "/images/fin-sacco.jpg", note: "Declined: guarantor cover is below half the amount. Kevin can reapply with two guarantors." }, 0),
  seal({ id: "ln-00109", ref: "NY-LON-2025-00109", product: "school", title: "School fees — Esther’s nephew, term fees", purpose: "Term fees", borrowers: ["m09"], branch: "Trans-Nzoia", amount: 60000, rate: 9, method: "flat", freq: "monthly", termMonths: 6, start: "2025-03-10", applied: "2025-02-27", channel: "mpesa", destination: "Kimilili Girls paybill", school: { name: "Kimilili Girls Secondary", paybill: "Fees paybill 522522 · acct KGS-0091" }, image: "/images/cause-school.jpg", note: "Cleared in full by term two." }, 6),
  seal({ id: "ln-00099", ref: "NY-LON-2025-00099", product: "salary", title: "Salary advance — October payday", purpose: "Bridge to payday", borrowers: ["m05"], branch: "Nairobi", amount: 30000, rate: 48, method: "flat", freq: "single", termMonths: 1, start: "2025-10-25", applied: "2025-10-20", channel: "mpesa", destination: "M-Pesa ···· 2210", image: "/images/contrib-hero.jpg", note: "Settled on payday." }, 1),
  seal({ id: "ln-00128", ref: "NY-LON-2025-00128", product: "short-term", title: "Short-term — maize harvest bags and transport", purpose: "Harvest bags and transport", borrowers: ["m14"], branch: "Trans-Nzoia", amount: 40000, rate: 12, method: "flat", freq: "monthly", termMonths: 3, start: "2025-11-14", applied: "2025-11-10", channel: "mpesa", destination: "M-Pesa ···· 1174", image: "/images/frame-reunion.jpg", note: "Disbursed on the 14th. First instalment falls due 14 December." }, 0),
  seal({ id: "ln-00126", ref: "NY-LON-2025-00126", product: "family", title: "Family joint — homestead roof and water tank", purpose: "Roof and water tank at the Kakamega homestead", borrowers: ["m12", "m19"], branch: "Kakamega", amount: 320000, rate: 11, method: "reducing", freq: "monthly", termMonths: 18, applied: "2025-11-14", channel: "bank", destination: "Coop Bank ···· 6135", stored: "under-review", image: "/images/frame-reunion.jpg", note: "Waiting for the family head to co-sign as guarantor." }, 0),
  seal({ id: "ln-00129", ref: "NY-LON-2025-00129", product: "short-term", title: "Short-term — sending money home for school fees", purpose: "Family support", borrowers: ["m22"], branch: "Diaspora", amount: 30000, rate: 12, method: "flat", freq: "monthly", termMonths: 3, applied: "2025-11-17", channel: "bank", destination: "KCB ···· 5530", stored: "applied", image: "/images/frame-elder.jpg", note: "Received from the diaspora branch. Waiting for review." }, 0),
];

let seq = 0;
export const seedRepayments: Repayment[] = seedLoans.flatMap((l) => {
  const rows = schedule(l);
  return rows.slice(0, paidCountOf(rows, l.paid)).map((r) => {
    seq += 1;
    return {
      ref: `NY-RPY-2025-${String(900 + seq)}`,
      loanId: l.id,
      date: r.due,
      amount: r.instalment,
      channel: l.channel,
      status: "confirmed" as const,
      ledger: `NY-LED-00046${String(10 + seq).padStart(2, "0")}`,
      no: r.no,
    };
  });
});

export const auditSeed: AuditEntry[] = [
  { ref: "NY-AUD-01071", at: "18 Nov · 08:12", actor: "Webhook · M-Pesa C2B", action: "repayment.posted", entity: "NY-LON-2025-00121", detail: "KES 13,328 · instalment 5 of 12 · SIMULATED", tone: "gold" },
  { ref: "NY-AUD-01070", at: "17 Nov · 16:20", actor: "Finance officer · Peter W.", action: "loan.approve", entity: "NY-LON-2025-00125", detail: "Salary advance KES 25,000 approved · disbursal on payday", tone: "plain" },
  { ref: "NY-AUD-01069", at: "14 Nov · 11:05", actor: "Peter Wanyama Nalyanya", action: "loan.disburse", entity: "NY-LON-2025-00128", detail: "KES 40,000 → M-Pesa ···· 1174 · SIMULATED B2C", tone: "gold" },
  { ref: "NY-AUD-01068", at: "14 Nov · 09:40", actor: "System", action: "instalment.overdue", entity: "NY-LON-2025-00114", detail: "Instalment 4 unpaid since 12 Nov · grace 5 days · guarantor notified", tone: "red" },
  { ref: "NY-AUD-01067", at: "12 Nov · 15:02", actor: "Loan committee · Mzee V. office", action: "loan.decline", entity: "NY-LON-2025-00120", detail: "Guarantor cover below half the amount · reason logged", tone: "red" },
  { ref: "NY-AUD-01066", at: "10 Nov · 10:30", actor: "Millicent Aoko Nalyanya", action: "loan.apply", entity: "NY-LON-2025-00124", detail: "KES 480,000 · collateral and one guarantor attached", tone: "plain" },
  { ref: "NY-AUD-01065", at: "05 Nov · 07:00", actor: "Standing order · Peter W.", action: "repayment.posted", entity: "NY-LON-2025-00121", detail: "KES 13,328 · instalment 4 of 12 · SIMULATED", tone: "plain" },
  { ref: "NY-AUD-01064", at: "02 Nov · 12:14", actor: "Family head · Mzee V. office", action: "policy.edit", entity: "NY-LON-POLICY", detail: "Late penalty 5% · grace 5 days · 2FA verified", tone: "plain" },
];

export const channelIds: Channel[] = ["mpesa", "bank", "internal"];
