/* T-8 Finances — Chama · Merry-go-round · Sacco mock data (frontend-only Phase 1).
   KES via kes(), EAT dates, IDs per nalyanyaMO.md §3.4 (NY-CHM · NY-SAC · NY-SHR · NY-DIV · NY-PAY · NY-LED).
   Signed-in user is Peter Wanyama Nalyanya (ME_ID), matching the T-1 shell. */

import { fmt } from "@/lib/format";

export type ChamaType = "savings" | "merry-go-round" | "investment";
export type ProductId = ChamaType | "sacco";
export type Cycle = "weekly" | "fortnightly" | "monthly";
export type SkipPolicy = "none" | "once-a-year" | "admin-approval";
export type Channel = "mpesa" | "airtel" | "bank" | "internal";
export type TxStatus = "confirmed" | "pending" | "scheduled" | "failed";
export type TxType = "share-buy" | "auto-debit" | "chama" | "mgr-payout" | "dividend" | "penalty";
export type TxKind = "shares" | "chama" | "mgr" | "dividends";

export const ME_ID = "m05";

export type Person = { id: string; name: string; initials: string; branch: string; phone: string };

export type Statement = {
  round: string;
  collected: number;
  paidOut: number;
  late: number;
  penalties: number;
  paidTo: string;
  status: "closed" | "open";
};

export type Chama = {
  id: string;
  ref: string;
  name: string;
  type: ChamaType;
  branch: string;
  cycle: Cycle;
  contribution: number;
  memberIds: string[];
  orderIds: string[];
  round: number;
  totalRounds: number;
  recipientIdx: number;
  pool: number;
  target: number;
  targetLabel: string;
  paidIds: string[];
  nextInSec: number;
  nextLabel: string;
  image: string;
  blurb: string;
  penalty: number;
  graceDays: number;
  skip: SkipPolicy;
  roi: number | null;
  payoutLabels: string[];
  statements: Statement[];
  opened: string;
};

export type Tx = {
  id: string;
  ref: string;
  at: string;
  type: TxType;
  who: string;
  group: string;
  amount: number;
  channel: Channel;
  status: TxStatus;
  ledger: string;
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

export type Rules = {
  penalty: number;
  graceDays: number;
  skip: SkipPolicy;
  multiplier: number;
  reservePct: number;
  dividendMonth: string;
};

export type Dividend = {
  year: number;
  perShare: number;
  status: "paid" | "proposed";
  yourShares: number;
  yourTotal: number;
  date: string;
};

export type AutoDebit = { enabled: boolean; amount: number; day: number; channel: Channel };

export const typeLabel: Record<ChamaType, string> = {
  savings: "Savings chama",
  "merry-go-round": "Merry-go-round",
  investment: "Investment chama",
};

export const cycleLabel: Record<Cycle, string> = {
  weekly: "Weekly",
  fortnightly: "Fortnightly",
  monthly: "Monthly",
};

export const skipLabel: Record<SkipPolicy, string> = {
  none: "No skips allowed",
  "once-a-year": "One skip a year",
  "admin-approval": "Skip needs admin approval",
};

export const productTypes: { id: ProductId; label: string; blurb: string }[] = [
  { id: "merry-go-round", label: "Merry-go-round", blurb: "Everyone pays in; one member takes the whole pot each round." },
  { id: "savings", label: "Savings chama", blurb: "A shared pot toward one goal — a roof, a school fund, a farm." },
  { id: "investment", label: "Investment chama", blurb: "Pool capital into projects; returns follow the shares held." },
  { id: "sacco", label: "Sacco product", blurb: "Share-based savings that unlock loan access at 3× your shares." },
];

export const roster: Person[] = [
  { id: "m02", name: "Ruth Akinyi Nalyanya", initials: "RA", branch: "Nairobi", phone: "+2547 ··· 7890" },
  { id: "m03", name: "Brian Otieno Nalyanya", initials: "BO", branch: "Bungoma", phone: "+2547 ··· 5512" },
  { id: "m05", name: "Peter Wanyama Nalyanya", initials: "PW", branch: "Nairobi", phone: "+2547 ··· 2210" },
  { id: "m07", name: "Faith Chebet Nalyanya", initials: "FC", branch: "Nairobi", phone: "+2547 ··· 8841" },
  { id: "m09", name: "Esther Nafula Nalyanya", initials: "EN", branch: "Trans-Nzoia", phone: "+2547 ··· 3308" },
  { id: "m11", name: "Agnes Wanjiru Nalyanya", initials: "AW", branch: "Nairobi", phone: "+2547 ··· 6612" },
  { id: "m12", name: "Grace Kwamboka Nalyanya", initials: "GK", branch: "Kakamega", phone: "+2547 ··· 4417" },
  { id: "m14", name: "Samuel Kiprop Nalyanya", initials: "SK", branch: "Trans-Nzoia", phone: "+2547 ··· 1174" },
  { id: "m15", name: "Hamza Hassan Nalyanya", initials: "HH", branch: "Nairobi", phone: "+2547 ··· 9920" },
  { id: "m16", name: "Collins Munyasia Nalyanya", initials: "CM", branch: "Bungoma", phone: "+2547 ··· 0451" },
  { id: "m18", name: "Dennis Barasa Nalyanya", initials: "DB", branch: "Kakamega", phone: "+2547 ··· 7726" },
  { id: "m19", name: "Joseph Nyongesa Nalyanya", initials: "JN", branch: "Kakamega", phone: "+2547 ··· 3390" },
  { id: "m21", name: "Millicent Aoko Nalyanya", initials: "MA", branch: "Nairobi", phone: "+2547 ··· 5073" },
  { id: "m22", name: "Lydia Atieno Nalyanya", initials: "LA", branch: "Diaspora", phone: "+1 416 ··· 0182" },
  { id: "m23", name: "Kevin Otieno Nalyanya", initials: "KO", branch: "Diaspora", phone: "+44 7700 ··· 311" },
  { id: "m24", name: "Mercy Auma Nalyanya", initials: "MN", branch: "Diaspora", phone: "+44 7700 ··· 905" },
];

export const personById = (id: string): Person | undefined => roster.find((p) => p.id === id);
export const nameOf = (id: string): string => personById(id)?.name ?? "—";

const st = (round: string, collected: number, paidOut: number, late: number, penalties: number, paidTo: string): Statement => ({
  round,
  collected,
  paidOut,
  late,
  penalties,
  paidTo,
  status: "closed",
});

const MGR_ORDER_NBI = ["m02", "m05", "m07", "m09", "m11", "m15", "m16", "m18", "m19", "m21", "m12", "m14"];
const MGR_ORDER_DIA = ["m22", "m23", "m24", "m07", "m11", "m21"];

export const chamas: Chama[] = [
  {
    id: "ch1",
    ref: "NY-CHM-0001",
    name: "Nairobi Merry-Go-Round",
    type: "merry-go-round",
    branch: "Nairobi",
    cycle: "monthly",
    contribution: 10000,
    memberIds: MGR_ORDER_NBI,
    orderIds: MGR_ORDER_NBI,
    round: 11,
    totalRounds: 12,
    recipientIdx: 10,
    pool: 90000,
    target: 120000,
    targetLabel: "this round's pot",
    paidIds: ["m02", "m05", "m07", "m09", "m11", "m15", "m16", "m19", "m12"],
    nextInSec: 454800,
    nextLabel: "Round 11 pays out Sun 23 Nov",
    image: "/images/frame-elder.jpg",
    blurb: "Twelve Nairobi households pay KES 10,000 a month. One of us takes the whole pot each round — Round 11 goes to Grace.",
    penalty: 500,
    graceDays: 3,
    skip: "once-a-year",
    roi: null,
    payoutLabels: [
      "23 Jan 2025", "23 Feb 2025", "23 Mar 2025", "23 Apr 2025", "23 May 2025", "23 Jun 2025",
      "23 Jul 2025", "23 Aug 2025", "23 Sep 2025", "23 Oct 2025", "23 Nov 2025", "23 Dec 2025",
    ],
    statements: [
      st("Oct 2025 · Round 10", 120000, 120000, 1, 500, "Millicent Aoko Nalyanya"),
      st("Sep 2025 · Round 9", 120000, 120000, 0, 0, "Joseph Nyongesa Nalyanya"),
      st("Aug 2025 · Round 8", 120000, 120000, 2, 1000, "Dennis Barasa Nalyanya"),
      st("Jul 2025 · Round 7", 120000, 120000, 1, 500, "Collins Munyasia Nalyanya"),
    ],
    opened: "12 Jan 2025",
  },
  {
    id: "ch2",
    ref: "NY-CHM-0002",
    name: "Bungoma Harambee Savings",
    type: "savings",
    branch: "Bungoma",
    cycle: "weekly",
    contribution: 2000,
    memberIds: ["m03", "m16", "m19", "m12", "m14", "m09", "m05", "m02"],
    orderIds: [],
    round: 0,
    totalRounds: 0,
    recipientIdx: 0,
    pool: 214000,
    target: 500000,
    targetLabel: "Musanda hall roof",
    paidIds: ["m03", "m16", "m19", "m12", "m09", "m05"],
    nextInSec: 223500,
    nextLabel: "Weekly deposit closes Sun 23 Nov",
    image: "/images/frame-reunion.jpg",
    blurb: "A shared pot for one goal — the Musanda hall roof. Everyone saves KES 2,000 a week; the trustees release it when the goal is met.",
    penalty: 200,
    graceDays: 2,
    skip: "none",
    roi: null,
    payoutLabels: [],
    statements: [
      st("Week 46 · 10–16 Nov", 16000, 0, 1, 200, "Held in pool"),
      st("Week 45 · 3–9 Nov", 14000, 0, 2, 400, "Held in pool"),
      st("Week 44 · 27 Oct–2 Nov", 16000, 0, 0, 0, "Held in pool"),
    ],
    opened: "03 Mar 2025",
  },
  {
    id: "ch3",
    ref: "NY-CHM-0003",
    name: "Kitale Maize-Milling Investment",
    type: "investment",
    branch: "Trans-Nzoia",
    cycle: "monthly",
    contribution: 15000,
    memberIds: ["m09", "m14", "m03", "m16", "m12", "m19", "m05", "m07", "m15"],
    orderIds: [],
    round: 0,
    totalRounds: 0,
    recipientIdx: 0,
    pool: 640000,
    target: 1200000,
    targetLabel: "Maize-milling plot, Kitale",
    paidIds: ["m09", "m14", "m03", "m16", "m12", "m19", "m05", "m07"],
    nextInSec: 961200,
    nextLabel: "Project review · 30 Nov",
    image: "/images/cause-water.jpg",
    blurb: "Nine families pool capital for a maize-milling plot in Kitale. Returns follow the shares held; the target is 14% a year.",
    penalty: 1000,
    graceDays: 5,
    skip: "admin-approval",
    roi: 14,
    payoutLabels: [],
    statements: [
      st("Oct 2025 · Capital call", 135000, 0, 1, 1000, "Plot deposit, Kitale"),
      st("Sep 2025 · Capital call", 135000, 0, 0, 0, "Plot deposit, Kitale"),
    ],
    opened: "19 Jun 2025",
  },
  {
    id: "ch4",
    ref: "NY-CHM-0004",
    name: "Diaspora Merry-Go-Round",
    type: "merry-go-round",
    branch: "Diaspora",
    cycle: "fortnightly",
    contribution: 20000,
    memberIds: MGR_ORDER_DIA,
    orderIds: MGR_ORDER_DIA,
    round: 4,
    totalRounds: 6,
    recipientIdx: 3,
    pool: 80000,
    target: 120000,
    targetLabel: "this round's pot",
    paidIds: ["m22", "m23", "m24", "m07"],
    nextInSec: 550800,
    nextLabel: "Round 4 pays out Mon 24 Nov",
    image: "/images/cause-school.jpg",
    blurb: "London, Toronto and Nairobi in one circle — KES 20,000 every fortnight by M-Pesa or bank EFT.",
    penalty: 1000,
    graceDays: 2,
    skip: "once-a-year",
    roi: null,
    payoutLabels: ["13 Oct 2025", "27 Oct 2025", "10 Nov 2025", "24 Nov 2025", "08 Dec 2025", "22 Dec 2025"],
    statements: [
      st("10 Nov · Round 3", 120000, 120000, 1, 1000, "Mercy Auma Nalyanya"),
      st("27 Oct · Round 2", 120000, 120000, 0, 0, "Kevin Otieno Nalyanya"),
      st("13 Oct · Round 1", 120000, 120000, 2, 2000, "Lydia Atieno Nalyanya"),
    ],
    opened: "13 Oct 2025",
  },
];

export const sacco = {
  ref: "NY-SAC-0001",
  name: "Nalyanya Family Sacco",
  pool: 4215600,
  sharesIssued: 3512,
  holders: 96,
  unitValue: 1200,
  unitDeltaPct: 1.2,
  reservePct: 12.5,
  image: "/images/fin-sacco.jpg",
  unitHistory: [1050, 1070, 1080, 1100, 1110, 1125, 1140, 1150, 1160, 1175, 1190, 1200],
  months: ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
  myShares: [60, 64, 68, 73, 79, 84, 90, 96, 101, 108, 114, 120],
  myContributed: 126400,
  thisMonthTotal: 86500,
  auto: { enabled: true, amount: 6000, day: 5, channel: "mpesa" } as AutoDebit,
};

export const rules: Rules = {
  penalty: 500,
  graceDays: 3,
  skip: "once-a-year",
  multiplier: 3,
  reservePct: 12.5,
  dividendMonth: "April",
};

export const dividends: Dividend[] = [
  { year: 2021, perShare: 45, status: "paid", yourShares: 38, yourTotal: 1710, date: "02 Apr 2022" },
  { year: 2022, perShare: 60, status: "paid", yourShares: 52, yourTotal: 3120, date: "01 Apr 2023" },
  { year: 2023, perShare: 75, status: "paid", yourShares: 71, yourTotal: 5325, date: "03 Apr 2024" },
  { year: 2024, perShare: 90, status: "paid", yourShares: 96, yourTotal: 8640, date: "02 Apr 2025" },
  { year: 2025, perShare: 100, status: "proposed", yourShares: 120, yourTotal: 12000, date: "Proposed · Apr 2026" },
];

export const transactions: Tx[] = [
  { id: "t01", ref: "NY-SHR-2025-00412", at: "18 Nov · 08:05", type: "auto-debit", who: "Peter Wanyama Nalyanya", group: "NY-SAC-0001 · Sacco", amount: 6000, channel: "mpesa", status: "confirmed", ledger: "NY-LED-0004528" },
  { id: "t02", ref: "NY-CHM-2025-00311", at: "18 Nov · 07:40", type: "chama", who: "Ruth Akinyi Nalyanya", group: "NY-CHM-0001 · Nairobi MGR", amount: 10000, channel: "mpesa", status: "confirmed", ledger: "NY-LED-0004527" },
  { id: "t03", ref: "NY-SHR-2025-00411", at: "17 Nov · 16:52", type: "share-buy", who: "Faith Chebet Nalyanya", group: "NY-SAC-0001 · Sacco", amount: 12000, channel: "mpesa", status: "confirmed", ledger: "NY-LED-0004526" },
  { id: "t04", ref: "NY-CHM-2025-00310", at: "17 Nov · 12:10", type: "chama", who: "Brian Otieno Nalyanya", group: "NY-CHM-0002 · Bungoma savings", amount: 2000, channel: "mpesa", status: "confirmed", ledger: "NY-LED-0004525" },
  { id: "t05", ref: "NY-CHM-2025-00309", at: "16 Nov · 09:31", type: "chama", who: "Joseph Nyongesa Nalyanya", group: "NY-CHM-0003 · Kitale investment", amount: 15000, channel: "bank", status: "pending", ledger: "—" },
  { id: "t06", ref: "NY-PAY-2025-0080", at: "23 Oct · 10:00", type: "mgr-payout", who: "Millicent Aoko Nalyanya", group: "NY-CHM-0001 · Round 10", amount: 120000, channel: "mpesa", status: "confirmed", ledger: "NY-LED-0004498" },
  { id: "t07", ref: "NY-CHM-2025-00305", at: "14 Nov · 18:22", type: "penalty", who: "Dennis Barasa Nalyanya", group: "NY-CHM-0001 · late fee", amount: 500, channel: "internal", status: "confirmed", ledger: "NY-LED-0004517" },
  { id: "t08", ref: "NY-SHR-2025-00409", at: "12 Nov · 07:02", type: "auto-debit", who: "Peter Wanyama Nalyanya", group: "NY-SAC-0001 · Sacco", amount: 6000, channel: "mpesa", status: "confirmed", ledger: "NY-LED-0004502" },
  { id: "t09", ref: "NY-CHM-2025-00302", at: "11 Nov · 11:44", type: "chama", who: "Hamza Hassan Nalyanya", group: "NY-CHM-0004 · Diaspora MGR", amount: 20000, channel: "airtel", status: "confirmed", ledger: "NY-LED-0004499" },
  { id: "t10", ref: "NY-CHM-2025-00298", at: "10 Nov · 06:58", type: "chama", who: "Lydia Atieno Nalyanya", group: "NY-CHM-0004 · Diaspora MGR", amount: 20000, channel: "bank", status: "confirmed", ledger: "NY-LED-0004493" },
  { id: "t11", ref: "NY-SHR-2025-00405", at: "05 Nov · 07:00", type: "auto-debit", who: "Peter Wanyama Nalyanya", group: "NY-SAC-0001 · Sacco", amount: 6000, channel: "mpesa", status: "confirmed", ledger: "NY-LED-0004480" },
  { id: "t12", ref: "NY-CHM-2025-00291", at: "03 Nov · 13:19", type: "chama", who: "Collins Munyasia Nalyanya", group: "NY-CHM-0002 · Bungoma savings", amount: 2000, channel: "mpesa", status: "failed", ledger: "—" },
  { id: "t13", ref: "NY-SHR-2025-00398", at: "28 Oct · 15:40", type: "share-buy", who: "Esther Nafula Nalyanya", group: "NY-SAC-0001 · Sacco", amount: 24000, channel: "bank", status: "confirmed", ledger: "NY-LED-0004460" },
  { id: "t14", ref: "NY-DIV-2024-00007", at: "02 Apr 2025", type: "dividend", who: "Peter Wanyama Nalyanya", group: "NY-SAC-0001 · 2024 dividend", amount: 8640, channel: "mpesa", status: "confirmed", ledger: "NY-LED-0004211" },
  { id: "t15", ref: "NY-DIV-2025-00012", at: "Proposed · Apr 2026", type: "dividend", who: "Peter Wanyama Nalyanya", group: "NY-SAC-0001 · 2025 proposal", amount: 12000, channel: "internal", status: "scheduled", ledger: "—" },
];

export const auditSeed: AuditEntry[] = [
  { ref: "NY-AUD-01011", at: "18 Nov · 08:05", actor: "Standing order · Peter W.", action: "auto-debit.posted", entity: "NY-SHR-2025-00412", detail: "KES 6,000 → 5 shares · SIMULATED M-Pesa standing order", tone: "gold" },
  { ref: "NY-AUD-01010", at: "17 Nov · 16:52", actor: "Faith Chebet Nalyanya", action: "share.issue", entity: "NY-SAC-0001", detail: "10 shares issued at KES 1,200 · ledger NY-LED-0004526", tone: "gold" },
  { ref: "NY-AUD-01009", at: "16 Nov · 09:31", actor: "Joseph Nyongesa Nalyanya", action: "chama.contribute", entity: "NY-CHM-0003", detail: "KES 15,000 via bank EFT · reference pending", tone: "plain" },
  { ref: "NY-AUD-01008", at: "15 Nov · 22:10", actor: "System", action: "rotation.scheduled", entity: "NY-CHM-0001", detail: "Round 11 pays Grace Kwamboka Nalyanya on 23 Nov", tone: "plain" },
  { ref: "NY-AUD-01007", at: "14 Nov · 18:22", actor: "Treasurer · Agnes W.", action: "penalty.applied", entity: "NY-CHM-0001", detail: "KES 500 late fee · Dennis Barasa Nalyanya (grace passed)", tone: "red" },
  { ref: "NY-AUD-01006", at: "12 Nov · 12:00", actor: "Family head · Mzee V. office", action: "rules.edit", entity: "NY-SAC-0001", detail: "Grace period 2 → 3 days · 2FA verified", tone: "plain" },
  { ref: "NY-AUD-01005", at: "23 Oct · 10:00", actor: "System", action: "mgr.payout", entity: "NY-CHM-0001", detail: "KES 120,000 → Millicent Aoko Nalyanya (Round 10) · SIMULATED B2C", tone: "gold" },
  { ref: "NY-AUD-01004", at: "02 Apr · 10:22", actor: "Family head · Mzee V. office", action: "dividend.declare", entity: "NY-SAC-0001", detail: "KES 90 per share · 2024 · SIMULATED", tone: "plain" },
];

export const kindOf = (t: TxType): TxKind =>
  t === "share-buy" || t === "auto-debit"
    ? "shares"
    : t === "mgr-payout"
      ? "mgr"
      : t === "dividend"
        ? "dividends"
        : "chama";

export function eligibleAmount(shares: number, unitValue: number, multiplier: number, obligations = 0, productMax = 1_000_000): number {
  return Math.max(0, Math.min(shares * unitValue * multiplier, productMax) - obligations);
}

export function cycleSeconds(c: Cycle): number {
  return c === "weekly" ? 7 * 86400 : c === "fortnightly" ? 14 * 86400 : 30 * 86400;
}

/** Pure merry-go-round step: pays the pot to the current recipient and moves the ring on. */
export function advanceRound(c: Chama, at: string): { chama: Chama; statement: Statement; paidTo: string } {
  const paidTo = c.orderIds[c.recipientIdx] ?? "";
  const unpaid = c.memberIds.length - c.paidIds.length;
  const statement: Statement = {
    round: `${at} · Round ${c.round}`,
    collected: c.pool,
    paidOut: c.pool,
    late: unpaid,
    penalties: unpaid * c.penalty,
    paidTo: nameOf(paidTo),
    status: "closed",
  };
  const nextIdx = (c.recipientIdx + 1) % Math.max(1, c.orderIds.length);
  const wrapped = nextIdx === 0;
  return {
    paidTo: nameOf(paidTo),
    statement,
    chama: {
      ...c,
      recipientIdx: nextIdx,
      round: wrapped ? 1 : c.round + 1,
      pool: 0,
      paidIds: [],
      nextInSec: cycleSeconds(c.cycle),
      nextLabel: `Round ${wrapped ? 1 : c.round + 1} pays out ${cycleLabel[c.cycle].toLowerCase()}`,
      statements: [statement, ...c.statements],
    },
  };
}

export const shareCount = (n: number) => `${fmt(n)} ${n === 1 ? "share" : "shares"}`;
