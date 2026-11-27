/* T-12 Records — the family system of record (frontend-only Phase 1).
   Every money event in one ledger: contributions, chamas, shares, loans, allocations, grants,
   transfers and manual entries. Balances, monthly totals, bucket shares, branch heat, attribution,
   reconciliation status and KPIs are all COMPUTED from the raw rows below, so every number on the
   page agrees with every other. KES via kes() · EAT dates (ISO) · NY-LED ledger refs (§3.4). */

import type { Frame } from "@/data/dashboard/contributions";
import { pct } from "@/lib/format";

export const ME_ID = "m05";
export const AS_OF = "2025-11-18";
export const OPENING_DATE = "2025-06-01";
export const OPENING_BALANCE = 1250000;

/* Mock daily rate: KES per 1 unit of currency. Display only — the ledger is always KES. */
export const FX = { KES: 1, USD: 129.4, EUR: 140.1 } as const;
export type Currency = keyof typeof FX;

export type Kind =
  | "contrib"
  | "chama"
  | "share"
  | "payout"
  | "loan-out"
  | "loan-in"
  | "alloc"
  | "grant"
  | "dividend-in"
  | "dividend-out"
  | "xfer-in"
  | "xfer-out"
  | "deposit"
  | "withdraw";
export type Source = "manual" | "contribution" | "loan" | "sacco" | "chama" | "allocation" | "foundation" | "transfer";
export type Dir = "in" | "out";
export type Channel = "mpesa" | "bank" | "internal" | "airtel";
export type Branch = "Nairobi" | "Bungoma" | "Kakamega" | "Trans-Nzoia" | "Diaspora";
export type Bucket =
  | "Contributions"
  | "Chama"
  | "Shares & dividends"
  | "Loans out"
  | "Loan repayments"
  | "Allocations & grants"
  | "Transfers & cash";
export type SyncState = "SYNCED" | "DRIFT" | "STALE";
export type Tone = "plain" | "gold" | "red";
export type DirTab = "all" | "in" | "out";
export type JobFormat = "CSV" | "XLSX" | "PDF" | "KRA";

export const BUCKETS: Bucket[] = [
  "Contributions",
  "Chama",
  "Shares & dividends",
  "Loans out",
  "Loan repayments",
  "Allocations & grants",
  "Transfers & cash",
];
export const BRANCHES: Branch[] = ["Nairobi", "Bungoma", "Kakamega", "Trans-Nzoia", "Diaspora"];
export const SOURCES: Source[] = ["contribution", "chama", "sacco", "loan", "allocation", "foundation", "transfer", "manual"];
export const MONTH_KEYS = ["2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11"];

const MONTH_LABEL: Record<string, string> = {
  "2025-06": "Jun",
  "2025-07": "Jul",
  "2025-08": "Aug",
  "2025-09": "Sep",
  "2025-10": "Oct",
  "2025-11": "Nov",
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const monthLabel = (k: string): string => MONTH_LABEL[k] ?? k;
export const monthKeyOf = (iso: string): string => iso.slice(0, 7);
export const daysBetween = (from: string, to: string): number => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
export const fmtDate = (iso: string): string => {
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`;
};

export const SOURCE_LABEL: Record<Source, string> = {
  contribution: "Contributions",
  chama: "Chama",
  sacco: "Sacco",
  loan: "Loans",
  allocation: "Allocations",
  foundation: "Foundation",
  transfer: "Transfers",
  manual: "Manual entries",
};

export const channelLabel: Record<Channel, string> = {
  mpesa: "M-Pesa",
  bank: "Bank EFT",
  internal: "Internal wallet",
  airtel: "Airtel Money",
};

export const accountOf: Record<Channel, string> = {
  mpesa: "M-Pesa ···· 2210",
  bank: "Equity ···· 4471",
  internal: "Family wallet",
  airtel: "Airtel ···· 1174",
};

type KindMeta = { label: string; source: Source; dir: Dir; bucket: Bucket; route: (link: string) => string };

const loanRoute = (link: string) => (link ? `/dashboard/loans?o=loan&id=${link}` : "/dashboard/loans");
const allocRoute = (link: string) => (link ? `/dashboard/finance-access?o=allocation&id=${link}` : "/dashboard/finance-access");
const grantRoute = (link: string) => (link ? `/dashboard/foundation?o=grant&id=${link}` : "/dashboard/foundation");

export const kindMeta: Record<Kind, KindMeta> = {
  contrib: { label: "Contribution", source: "contribution", dir: "in", bucket: "Contributions", route: () => "/dashboard/contributions" },
  chama: { label: "Chama contribution", source: "chama", dir: "in", bucket: "Chama", route: () => "/dashboard/finances" },
  share: { label: "Share purchase", source: "sacco", dir: "in", bucket: "Shares & dividends", route: () => "/dashboard/finances" },
  payout: { label: "Round payout", source: "chama", dir: "out", bucket: "Chama", route: () => "/dashboard/finances" },
  "loan-out": { label: "Loan disbursed", source: "loan", dir: "out", bucket: "Loans out", route: loanRoute },
  "loan-in": { label: "Loan repayment", source: "loan", dir: "in", bucket: "Loan repayments", route: loanRoute },
  alloc: { label: "Allocation released", source: "allocation", dir: "out", bucket: "Allocations & grants", route: allocRoute },
  grant: { label: "Foundation grant", source: "foundation", dir: "out", bucket: "Allocations & grants", route: grantRoute },
  "dividend-in": { label: "Dividend hand-back", source: "sacco", dir: "in", bucket: "Shares & dividends", route: () => "/dashboard/finances" },
  "dividend-out": { label: "Dividend paid", source: "sacco", dir: "out", bucket: "Shares & dividends", route: () => "/dashboard/finances" },
  "xfer-in": { label: "Transfer in", source: "transfer", dir: "in", bucket: "Transfers & cash", route: () => "/dashboard/records" },
  "xfer-out": { label: "Transfer out", source: "transfer", dir: "out", bucket: "Transfers & cash", route: () => "/dashboard/records" },
  deposit: { label: "Manual deposit", source: "manual", dir: "in", bucket: "Transfers & cash", route: () => "/dashboard/account" },
  withdraw: { label: "Manual withdrawal", source: "manual", dir: "out", bucket: "Transfers & cash", route: () => "/dashboard/account" },
};

export type Person = { id: string; name: string; initials: string; branch: Branch };

export const roster: Person[] = [
  { id: "m01", name: "Mzee Victor Nalyanya", initials: "MV", branch: "Trans-Nzoia" },
  { id: "m02", name: "Ruth Akinyi Nalyanya", initials: "RA", branch: "Nairobi" },
  { id: "m03", name: "Brian Otieno Nalyanya", initials: "BO", branch: "Bungoma" },
  { id: "m05", name: "Peter Wanyama Nalyanya", initials: "PW", branch: "Nairobi" },
  { id: "m07", name: "Faith Chebet Nalyanya", initials: "FC", branch: "Nairobi" },
  { id: "m09", name: "Esther Nafula Nalyanya", initials: "EN", branch: "Trans-Nzoia" },
  { id: "m12", name: "Grace Kwamboka Nalyanya", initials: "GK", branch: "Kakamega" },
  { id: "m14", name: "Samuel Kiprop Nalyanya", initials: "SK", branch: "Trans-Nzoia" },
  { id: "m18", name: "Dennis Barasa Nalyanya", initials: "DB", branch: "Kakamega" },
  { id: "m19", name: "Joseph Nyongesa Nalyanya", initials: "JN", branch: "Kakamega" },
  { id: "m21", name: "Millicent Aoko Nalyanya", initials: "MA", branch: "Nairobi" },
  { id: "m22", name: "Lydia Atieno Nalyanya", initials: "LA", branch: "Diaspora" },
  { id: "m23", name: "Kevin Otieno Nalyanya", initials: "KO", branch: "Diaspora" },
];

export const nameOf = (id: string): string => roster.find((p) => p.id === id)?.name ?? "—";

/* ------------------------------------------------------------------ */
/* Raw ledger rows: [date, kind, member, branch, amount KES, channel, link, note] */
/* ------------------------------------------------------------------ */
type Raw = [string, Kind, string, Branch, number, Channel, string, string];

const RAW: Raw[] = [
  ["2025-06-02", "deposit", "m05", "Nairobi", 150000, "bank", "", "Family wallet top-up for the June harambee"],
  ["2025-06-05", "share", "m05", "Nairobi", 6000, "mpesa", "", "Monthly auto-debit · 5 shares"],
  ["2025-06-05", "loan-out", "m05", "Nairobi", 150000, "mpesa", "ln-00121", "Sacco-backed loan · land deposit and home repairs"],
  ["2025-06-08", "contrib", "m12", "Kakamega", 5000, "mpesa", "", "Harambee pledge for the reunion kitty"],
  ["2025-06-14", "chama", "m02", "Nairobi", 10000, "mpesa", "", "Nairobi merry-go-round · June contribution"],
  ["2025-06-20", "xfer-in", "m22", "Diaspora", 250000, "bank", "", "Remittance from London · school fees pool"],
  ["2025-07-03", "loan-out", "m18", "Kakamega", 97000, "mpesa", "ln-00118", "Long-term personal · tailoring stock and shop rent"],
  ["2025-07-05", "loan-in", "m05", "Nairobi", 13327, "mpesa", "ln-00121", "Instalment 1 of 12"],
  ["2025-07-05", "share", "m05", "Nairobi", 6000, "mpesa", "", "Monthly auto-debit · 5 shares"],
  ["2025-07-12", "loan-out", "m18", "Kakamega", 47100, "mpesa", "ln-00114", "Emergency medical · hospital bill"],
  ["2025-07-14", "contrib", "m19", "Kakamega", 12000, "internal", "", "Storm relief pledge · Musanda"],
  ["2025-08-03", "loan-in", "m18", "Kakamega", 8573, "mpesa", "ln-00118", "Instalment 1 of 12"],
  ["2025-08-05", "loan-in", "m05", "Nairobi", 13327, "mpesa", "ln-00121", "Instalment 2 of 12"],
  ["2025-08-05", "share", "m05", "Nairobi", 6000, "mpesa", "", "Monthly auto-debit · 5 shares"],
  ["2025-08-12", "loan-in", "m18", "Kakamega", 11972, "mpesa", "ln-00114", "Instalment 1 of 4"],
  ["2025-08-14", "withdraw", "m12", "Kakamega", 40000, "internal", "", "Cash for the harambee event"],
  ["2025-08-28", "xfer-out", "m05", "Nairobi", 80000, "internal", "", "Moved to the Nairobi chama pool"],
  ["2025-09-01", "loan-out", "m07", "Bungoma", 120000, "bank", "ln-00116", "School fees · Brian Jr. and Sharon, terms 1 and 2"],
  ["2025-09-03", "loan-in", "m18", "Kakamega", 8573, "mpesa", "ln-00118", "Instalment 2 of 12"],
  ["2025-09-05", "loan-out", "m02", "Nairobi", 400000, "bank", "ln-00115", "Nairobi merry-go-round · group loan to the chama account"],
  ["2025-09-05", "loan-in", "m05", "Nairobi", 13327, "mpesa", "ln-00121", "Instalment 3 of 12"],
  ["2025-09-05", "share", "m05", "Nairobi", 6000, "mpesa", "", "Monthly auto-debit · 5 shares"],
  ["2025-09-12", "loan-in", "m18", "Kakamega", 11972, "mpesa", "ln-00114", "Instalment 2 of 4"],
  ["2025-09-30", "grant", "m02", "Nairobi", 25000, "mpesa", "g2", "Cardiac medicine · Mama Ruth"],
  ["2025-10-01", "loan-in", "m07", "Bungoma", 20900, "bank", "ln-00116", "Instalment 1 of 6"],
  ["2025-10-03", "loan-in", "m18", "Kakamega", 8573, "mpesa", "ln-00118", "Instalment 3 of 12"],
  ["2025-10-05", "loan-in", "m05", "Nairobi", 13327, "mpesa", "ln-00121", "Instalment 4 of 12"],
  ["2025-10-05", "loan-in", "m02", "Nairobi", 35540, "bank", "ln-00115", "Group loan instalment 1 of 12"],
  ["2025-10-05", "share", "m05", "Nairobi", 6000, "mpesa", "", "Monthly auto-debit · 5 shares"],
  ["2025-10-12", "loan-in", "m18", "Kakamega", 11972, "mpesa", "ln-00114", "Instalment 3 of 4"],
  ["2025-10-23", "payout", "m21", "Nairobi", 120000, "mpesa", "", "Merry-go-round round 10 pot"],
  ["2025-10-28", "share", "m09", "Trans-Nzoia", 24000, "bank", "", "10 shares · bank EFT"],
  ["2025-10-31", "dividend-in", "m05", "Nairobi", 120000, "bank", "", "Sacco dividend hand-back to the foundation"],
  ["2025-11-01", "loan-in", "m07", "Bungoma", 20900, "bank", "ln-00116", "Instalment 2 of 6"],
  ["2025-11-03", "loan-in", "m18", "Kakamega", 8573, "mpesa", "ln-00118", "Instalment 4 of 12"],
  ["2025-11-05", "loan-in", "m05", "Nairobi", 13327, "mpesa", "ln-00121", "Instalment 5 of 12"],
  ["2025-11-05", "loan-in", "m02", "Nairobi", 35540, "bank", "ln-00115", "Group loan instalment 2 of 12"],
  ["2025-11-05", "share", "m05", "Nairobi", 6000, "mpesa", "", "Monthly auto-debit · 5 shares"],
  ["2025-11-08", "grant", "m21", "Nairobi", 110000, "bank", "g4", "Surgical deposit · Nairobi Hospital"],
  ["2025-11-10", "chama", "m22", "Diaspora", 20000, "bank", "", "Diaspora merry-go-round · round 4 contribution"],
  ["2025-11-11", "chama", "m23", "Diaspora", 20000, "airtel", "", "Diaspora merry-go-round · contribution"],
  ["2025-11-12", "grant", "m18", "Kakamega", 47500, "mpesa", "g3", "Storm relief · first tranche for materials"],
  ["2025-11-12", "alloc", "m01", "Trans-Nzoia", 20000, "mpesa", "a11", "Household support for November"],
  ["2025-11-13", "contrib", "m19", "Kakamega", 12500, "internal", "", "Musanda hall contribution"],
  ["2025-11-14", "loan-out", "m14", "Trans-Nzoia", 40000, "mpesa", "ln-00128", "Short-term · harvest bags and transport"],
  ["2025-11-15", "contrib", "m11", "Nairobi", 7500, "mpesa", "", "Wedding kitty · Millicent and Daniel"],
  ["2025-11-15", "contrib", "m14", "Trans-Nzoia", 20000, "bank", "", "Medical support · Mama Ruth"],
  ["2025-11-16", "contrib", "m09", "Trans-Nzoia", 15000, "mpesa", "", "Reunion harambee pledge"],
  ["2025-11-16", "grant", "m03", "Bungoma", 60000, "bank", "g1", "School paybill · term 2 release"],
  ["2025-11-17", "contrib", "m07", "Nairobi", 12000, "bank", "", "School fees chip-in · Brian and Sharon"],
  ["2025-11-17", "share", "m07", "Nairobi", 12000, "bank", "", "10 shares · bank EFT"],
  ["2025-11-18", "contrib", "m12", "Kakamega", 5000, "mpesa", "", "Get-well pledge · clinic bills"],
  ["2025-11-18", "contrib", "m05", "Nairobi", 8000, "internal", "", "Reunion harambee pledge"],
  ["2025-11-18", "chama", "m02", "Nairobi", 10000, "mpesa", "", "Nairobi merry-go-round · November contribution"],
  ["2025-11-18", "alloc", "m01", "Trans-Nzoia", 12000, "mpesa", "a2", "Monthly heart medicine top-up"],
  ["2025-11-18", "alloc", "m19", "Kakamega", 6500, "internal", "a7", "Emergency boda fare and medicine"],
  ["2025-11-18", "contrib", "m03", "Bungoma", 10000, "mpesa", "", "Harambee for the elders' transport"],
];

/* ------------------------------------------------------------------ */
/* The ledger — sorted, with a running balance                          */
/* ------------------------------------------------------------------ */
export type Tx = {
  id: string;
  ref: string;
  date: string;
  kind: Kind;
  label: string;
  source: Source;
  dir: Dir;
  bucket: Bucket;
  member: string;
  memberName: string;
  branch: Branch;
  amount: number;
  signed: number;
  channel: Channel;
  account: string;
  link: string;
  href: string;
  note: string;
  status: "confirmed" | "pending";
  balance: number;
};

const built: Tx[] = [];
let running = OPENING_BALANCE;
[...RAW]
  .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
  .forEach((r, i) => {
    const [date, kind, member, branch, amount, channel, link, note] = r;
    const m = kindMeta[kind];
    const signed = m.dir === "in" ? amount : -amount;
    running += signed;
    built.push({
      id: `t${String(i + 1).padStart(3, "0")}`,
      ref: `NY-LED-${String(4400 + i).padStart(7, "0")}`,
      date,
      kind,
      label: m.label,
      source: m.source,
      dir: m.dir,
      bucket: m.bucket,
      member,
      memberName: nameOf(member),
      branch,
      amount,
      signed,
      channel,
      account: accountOf[channel],
      link,
      href: m.route(link),
      note,
      status: channel === "airtel" ? "pending" : "confirmed",
      balance: running,
    });
  });

export const txs: Tx[] = built;
export const idOf = (pred: (t: Tx) => boolean): string => txs.find(pred)?.id ?? "";

/* ------------------------------------------------------------------ */
/* Derived — every figure on the page comes from these                   */
/* ------------------------------------------------------------------ */
export type MonthRow = { key: string; label: string; inTotal: number; outTotal: number; net: number; cumulative: number; count: number };

function buildMonthly(): MonthRow[] {
  const rows: MonthRow[] = [];
  let cumulative = 0;
  for (const key of MONTH_KEYS) {
    const list = txs.filter((t) => monthKeyOf(t.date) === key);
    const inTotal = list.filter((t) => t.dir === "in").reduce((s, t) => s + t.amount, 0);
    const outTotal = list.filter((t) => t.dir === "out").reduce((s, t) => s + t.amount, 0);
    const net = inTotal - outTotal;
    cumulative += net;
    rows.push({ key, label: monthLabel(key), inTotal, outTotal, net, cumulative, count: list.length });
  }
  return rows;
}

export const monthly: MonthRow[] = buildMonthly();

export function topBucketOf(key: string): Bucket | "—" {
  const sums = new Map<Bucket, number>();
  for (const t of txs) {
    if (monthKeyOf(t.date) === key) sums.set(t.bucket, (sums.get(t.bucket) ?? 0) + t.amount);
  }
  let best: Bucket | "—" = "—";
  let bestValue = -1;
  sums.forEach((value, bucket) => {
    if (value > bestValue) {
      best = bucket;
      bestValue = value;
    }
  });
  return best;
}

export const bucketTotals = BUCKETS.map((bucket) => ({
  bucket,
  total: txs.filter((t) => t.bucket === bucket).reduce((s, t) => s + t.amount, 0),
}));

export const sourceTotals = SOURCES.map((source) => {
  const rows = txs.filter((t) => t.source === source);
  return { source, label: SOURCE_LABEL[source], total: rows.reduce((s, t) => s + t.amount, 0), count: rows.length };
});

export const heatValue = (branch: Branch, key: string): number =>
  txs.filter((t) => t.branch === branch && monthKeyOf(t.date) === key).reduce((s, t) => s + t.amount, 0);

export const heatMax = Math.max(1, ...BRANCHES.flatMap((b) => MONTH_KEYS.map((k) => heatValue(b, k))));

export const totalIn = txs.filter((t) => t.dir === "in").reduce((s, t) => s + t.amount, 0);
export const totalOut = txs.filter((t) => t.dir === "out").reduce((s, t) => s + t.amount, 0);
export const netAll = totalIn - totalOut;
export const meIn = txs.filter((t) => t.dir === "in" && t.member === ME_ID).reduce((s, t) => s + t.amount, 0);
export const meShare = pct(meIn, totalIn);
export const monthCount = txs.filter((t) => monthKeyOf(t.date) === "2025-11").length;
export const balanceNow = txs[txs.length - 1]?.balance ?? OPENING_BALANCE;
export const balanceCheck = OPENING_BALANCE + totalIn - totalOut === balanceNow;

/* ------------------------------------------------------------------ */
/* Channels, statements and exceptions                                   */
/* ------------------------------------------------------------------ */
export type ChannelSeed = { id: Channel; label: string; lastSync: string; sim: boolean; detail: string };

export const channelSeeds: ChannelSeed[] = [
  { id: "mpesa", label: "M-Pesa Daraja", lastSync: "2025-11-18", sim: true, detail: "Paybill 4471 and B2C statement" },
  { id: "bank", label: "Bank EFT / RTGS", lastSync: "2025-11-17", sim: true, detail: "Equity, KCB and Coop statements" },
  { id: "airtel", label: "Airtel Money", lastSync: "2025-11-13", sim: true, detail: "Diaspora and secondary rail" },
  { id: "internal", label: "Internal wallet", lastSync: AS_OF, sim: false, detail: "Family ledger · always local" },
];

export function channelStatus(c: ChannelSeed, syncedOn: string, openCount: number): SyncState {
  if (c.id === "internal") return "SYNCED";
  if (daysBetween(syncedOn, AS_OF) > 2) return "STALE";
  return openCount > 0 ? "DRIFT" : "SYNCED";
}

export type Exception = {
  id: string;
  channel: Channel;
  ref: string;
  at: string;
  statement: string;
  amount: number;
  kind: "missing" | "mismatch" | "duplicate" | "unmatched";
  detail: string;
  txId: string;
};

export const exceptionSeeds: Exception[] = [
  { id: "x1", channel: "mpesa", ref: "RKX7H6QQ1", at: "2025-11-14", statement: "Paybill 4471 · maternity deposit", amount: 130000, kind: "missing", detail: "Statement line has no ledger post yet", txId: "" },
  { id: "x2", channel: "bank", ref: "EFT-88190", at: "2025-10-31", statement: "Coop clearing · dividend hand-back", amount: 118500, kind: "mismatch", detail: "Statement shows KES 118,500 and the ledger shows KES 120,000", txId: idOf((t) => t.kind === "dividend-in") },
  { id: "x3", channel: "mpesa", ref: "RKX7H8KP2", at: "2025-11-16", statement: "School paybill · duplicate replay", amount: 60000, kind: "duplicate", detail: "The same receipt appears twice in the statement", txId: idOf((t) => t.kind === "grant" && t.link === "g1") },
  { id: "x4", channel: "airtel", ref: "ATL-447190", at: "2025-11-11", statement: "Diaspora contribution · Kevin O.", amount: 20000, kind: "unmatched", detail: "The ledger has the post but the statement line is not imported", txId: idOf((t) => t.kind === "chama" && t.member === "m23") },
];

export type Job = { id: string; label: string; format: JobFormat; scope: string; status: "done" | "running" | "queued"; progress: number; created: string };

export const jobSeeds: Job[] = [
  { id: "j1", label: "All transactions · Jun–Nov 2025", format: "CSV", scope: "Family", status: "done", progress: 100, created: AS_OF },
  { id: "j2", label: "Peter W. · statement", format: "PDF", scope: "Member", status: "done", progress: 100, created: "2025-11-17" },
  { id: "j3", label: "Nairobi branch · workbook", format: "XLSX", scope: "Branch", status: "running", progress: 46, created: AS_OF },
  { id: "j4", label: "Family · KRA iTax 2025 (stub)", format: "KRA", scope: "Family", status: "queued", progress: 0, created: AS_OF },
];

export type Note = { id: string; txId: string; text: string; tags: string[]; at: string; author: string };

export const TAGS = ["Reconcile", "Receipt", "Query", "Tax", "Family", "Audit"];

export const noteSeeds: Note[] = [
  { id: "n1", txId: idOf((t) => t.kind === "payout"), text: "Round 10 paid to Millicent. Round 11 goes to Grace. Confirm the 23 Nov date with the treasurer.", tags: ["Reconcile", "Family"], at: "2025-11-17", author: "Peter W." },
  { id: "n2", txId: idOf((t) => t.kind === "dividend-in"), text: "The Coop hand-back is KES 1,500 short on the statement. Raised as EFT-88190.", tags: ["Reconcile"], at: "2025-11-16", author: "Peter W." },
  { id: "n3", txId: idOf((t) => t.kind === "alloc" && t.link === "a2"), text: "Monthly heart medicine top-up. Keep the pharmacy receipt for the annual tax return.", tags: ["Receipt", "Tax"], at: "2025-11-18", author: "Faith C." },
];

export type Digest = { on: boolean; day: string; time: string; recipients: string[] };
export const digestSeed: Digest = { on: false, day: "Mon", time: "07:00", recipients: ["Peter W.", "Faith C.", "Mzee V. office"] };
export const RECIPIENT_OPTIONS = ["Peter W.", "Faith C.", "Mzee V. office", "Ruth A.", "Grace K."];

export type AuditEntry = { ref: string; at: string; actor: string; action: string; entity: string; detail: string; tone: Tone };

export const auditSeed: AuditEntry[] = [
  { ref: "NY-AUD-01118", at: "18 Nov · 09:40", actor: "Webhook · M-Pesa C2B", action: "ledger.post", entity: "NY-LED-0004460", detail: "KES 13,327 · loan repayment · SIMULATED", tone: "gold" },
  { ref: "NY-AUD-01117", at: "17 Nov · 16:20", actor: "Finance officer · Peter W.", action: "statement.import", entity: "mpesa", detail: "Paybill 4471 statement imported · 2 exceptions raised", tone: "red" },
  { ref: "NY-AUD-01116", at: "16 Nov · 11:21", actor: "System", action: "reconcile.duplicate", entity: "RKX7H8KP2", detail: "Replayed receipt flagged and not counted twice", tone: "red" },
  { ref: "NY-AUD-01115", at: "14 Nov · 09:02", actor: "Family head · Mzee V. office", action: "export.kra", entity: "NY-EXP-2025", detail: "KRA tax export queued (stub)", tone: "plain" },
  { ref: "NY-AUD-01114", at: "12 Nov · 15:10", actor: "Treasurer · Peter W.", action: "note.add", entity: "NY-LED-0004444", detail: "Tagged Tax and Receipt", tone: "plain" },
  { ref: "NY-AUD-01113", at: "08 Nov · 10:05", actor: "Peter Wanyama Nalyanya", action: "ledger.post", entity: "NY-LED-0004441", detail: "KES 110,000 · foundation grant · SIMULATED", tone: "gold" },
];

/* ------------------------------------------------------------------ */
/* Photography — the same library, Records captions                      */
/* ------------------------------------------------------------------ */
export const frames: Frame[] = [
  { id: "fr1", src: "/images/contrib-hero.jpg", title: "The harambee table", caption: "Bungoma. Every shilling was counted by hand before it reached the ledger.", frame: "41", lens: "35mm", exposure: "1/125 · f2.8", place: "Bungoma" },
  { id: "fr2", src: "/images/frame-elder.jpg", title: "Mzee's ledger", caption: "The giving book from 1961. The digital ledger still has to agree with it.", frame: "42A", lens: "90mm macro", exposure: "1/45 · f2.8", place: "Kitale" },
  { id: "fr3", src: "/images/fin-sacco.jpg", title: "The counters", caption: "Sacco statements are reconciled line by line every month, before any dividend.", frame: "43", lens: "50mm", exposure: "1/80 · f2.8", place: "Nairobi" },
  { id: "fr4", src: "/images/cause-school.jpg", title: "Term reopens", caption: "The school paybill line that proves a grant landed where it was promised.", frame: "44", lens: "50mm", exposure: "1/500 · f2.8", place: "Kimilili" },
  { id: "fr5", src: "/images/fin-chama-hero.jpg", title: "The circle", caption: "A chama's cash book: who paid, who received, and what is still owed.", frame: "45", lens: "35mm", exposure: "1/125 · f2", place: "Bungoma" },
  { id: "fr6", src: "/images/cause-medical.jpg", title: "Clinic corridor", caption: "Medical allocations are tagged, receipted and kept for the tax return.", frame: "46", lens: "35mm", exposure: "1/60 · f2", place: "Nairobi" },
  { id: "fr7", src: "/images/frame-reunion.jpg", title: "Reunion steps", caption: "Five generations, one family ledger. Every branch shows up in the same table.", frame: "47", lens: "85mm", exposure: "1/250 · f4", place: "Trans-Nzoia" },
  { id: "fr8", src: "/images/cause-water.jpg", title: "First water", caption: "Community projects appear here too. The borehole's first invoice, reconciled.", frame: "48", lens: "28mm", exposure: "1/1000 · f5.6", place: "Musanda" },
];

/* ------------------------------------------------------------------ */
/* Filters                                                              */
/* ------------------------------------------------------------------ */
export type TxFilters = { q: string; bucket: Bucket | "all"; member: string; channel: Channel | "all"; branch: Branch | "all"; from: string; to: string };

export const emptyFilters: TxFilters = { q: "", bucket: "all", member: "all", channel: "all", branch: "all", from: "", to: "" };

export function countActive(f: TxFilters): number {
  return (f.q ? 1 : 0) + (f.bucket !== "all" ? 1 : 0) + (f.member !== "all" ? 1 : 0) + (f.channel !== "all" ? 1 : 0) + (f.branch !== "all" ? 1 : 0) + (f.from ? 1 : 0) + (f.to ? 1 : 0);
}

export function applyFilters(list: Tx[], f: TxFilters, dir: DirTab): Tx[] {
  const q = f.q.trim().toLowerCase();
  return list.filter((t) => {
    if (dir !== "all" && t.dir !== dir) return false;
    if (f.bucket !== "all" && t.bucket !== f.bucket) return false;
    if (f.member !== "all" && t.member !== f.member) return false;
    if (f.channel !== "all" && t.channel !== f.channel) return false;
    if (f.branch !== "all" && t.branch !== f.branch) return false;
    if (f.from && t.date < f.from) return false;
    if (f.to && t.date > f.to) return false;
    if (q && !`${t.memberName} ${t.ref} ${t.label} ${t.note} ${t.account}`.toLowerCase().includes(q)) return false;
    return true;
  });
}
