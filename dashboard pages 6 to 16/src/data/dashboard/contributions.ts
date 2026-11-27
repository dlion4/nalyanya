/* T-7 Contributions mock data — causes, contributions, payouts, ledger, audit.
   Frontend-only Phase 1. Money in KES via kes(), dates EAT, refs per nalyanyaMO.md §3.4. */

export type Purpose =
  | "wedding"
  | "medical"
  | "funeral"
  | "harambee"
  | "project"
  | "education"
  | "emergency"
  | "merry-go-round";

export type Channel = "mpesa" | "airtel" | "bank" | "internal";
export type ConStatus = "initiated" | "pending" | "confirmed" | "failed";

export const purposeLabel: Record<Purpose, string> = {
  wedding: "Wedding",
  medical: "Sickness & medical",
  funeral: "Funeral & memorial",
  harambee: "Fundraising harambee",
  project: "Family project",
  education: "Education",
  emergency: "Emergency",
  "merry-go-round": "Merry-go-round",
};

export const purposeTone: Record<Purpose, string> = {
  wedding: "ny-chip-warn",
  medical: "ny-chip-danger",
  funeral: "ny-chip-neutral",
  harambee: "ny-chip-brand",
  project: "ny-chip-info",
  education: "ny-chip-info",
  emergency: "ny-chip-danger",
  "merry-go-round": "ny-chip-ok",
};

export const channelLabel: Record<Channel, string> = {
  mpesa: "M-Pesa",
  airtel: "Airtel Money",
  bank: "Bank EFT",
  internal: "Internal wallet",
};

export const statusTone: Record<ConStatus, string> = {
  initiated: "ny-chip-neutral",
  pending: "ny-chip-warn",
  confirmed: "ny-chip-ok",
  failed: "ny-chip-danger",
};

export type Cause = {
  id: string;
  ref: string;
  title: string;
  purpose: Purpose;
  beneficiary: string;
  beneficiaryNote?: string;
  goal: number;
  raised: number;
  contributors: number;
  deadline: string;
  status: "open" | "closing" | "met" | "paid-out" | "draft";
  branch: string;
  organizer: string;
  image: string;
  blurb: string;
  payoutTo: string;
  scope: "All the family" | "Branch only" | "Selected members";
};

export const causes: Cause[] = [
  {
    id: "c1",
    ref: "NY-CON-2025-00431",
    title: "School fees — Brian Jr. & the Musanda girls",
    purpose: "education",
    beneficiary: "Brian Otieno Nalyanya (Jnr), Sharon Aoko Nalyanya",
    beneficiaryNote: "minors — guardians only",
    goal: 180000,
    raised: 180000,
    contributors: 64,
    deadline: "12 Dec 2025",
    status: "met",
    branch: "Bungoma",
    organizer: "Ruth Akinyi Nalyanya",
    image: "/images/cause-school.jpg",
    blurb:
      "Term 2 school fees for two Nalyanya children — one at Bungoma High, one at Kimilili Girls. Organised by their aunt so every branch can chip in before schools reopen.",
    payoutTo: "M-Pesa ···· 7890 (organizer)",
    scope: "All the family",
  },
  {
    id: "c2",
    ref: "NY-CON-2025-00428",
    title: "Clinic bills — Mama Ruth's heart medicine",
    purpose: "medical",
    beneficiary: "Ruth Akinyi Nalyanya (76), Nairobi",
    goal: 240000,
    raised: 163500,
    contributors: 91,
    deadline: "30 Nov 2025",
    status: "closing",
    branch: "Nairobi",
    organizer: "Peter Wanyama Nalyanya",
    image: "/images/cause-medical.jpg",
    blurb:
      "Six months of cardiac medication plus two reviews at Nairobi Hospital. The family tops up whatever the NHIF cover leaves behind.",
    payoutTo: "Equity Bank ···· 4471 (organizer)",
    scope: "All the family",
  },
  {
    id: "c3",
    ref: "NY-CON-2025-00419",
    title: "Memorial — send-off for Mzee Samuel Kiprop",
    purpose: "funeral",
    beneficiary: "The Kiprop household, Trans-Nzoia",
    goal: 320000,
    raised: 320000,
    contributors: 148,
    deadline: "02 Nov 2025",
    status: "paid-out",
    branch: "Trans-Nzoia",
    organizer: "Esther Nafula Nalyanya",
    image: "/images/cause-memorial.jpg",
    blurb:
      "Send-off costs for Mzee Samuel Kiprop Nalyanya, brother to Mzee Victor. Fully funded in 9 days — thank you to every branch.",
    payoutTo: "M-Pesa ···· 2210 (organizer)",
    scope: "All the family",
  },
  {
    id: "c4",
    ref: "NY-CON-2025-00436",
    title: "Borehole at Musanda social hall",
    purpose: "project",
    beneficiary: "Musanda community hall, Bungoma",
    goal: 650000,
    raised: 214000,
    contributors: 37,
    deadline: "28 Feb 2026",
    status: "open",
    branch: "Bungoma",
    organizer: "Collins Munyasia Nalyanya",
    image: "/images/cause-water.jpg",
    blurb:
      "Drill and pipe a borehole beside the hall the family built in 2019 — it will water the hall garden and serve 40 households in dry months.",
    payoutTo: "KCB ···· 9920 (project account)",
    scope: "All the family",
  },
  {
    id: "c5",
    ref: "NY-CON-2025-00440",
    title: "Wedding — Millicent & Daniel",
    purpose: "wedding",
    beneficiary: "Millicent Aoko Nalyanya & Daniel Omondi",
    goal: 150000,
    raised: 42000,
    contributors: 18,
    deadline: "14 Feb 2026",
    status: "open",
    branch: "Nairobi",
    organizer: "Agnes Wanjiru Nalyanya",
    image: "/images/cause-wedding.jpg",
    blurb:
      "The first Nalyanya wedding of 2026 — daisies, a marquee in Karen and enough ugali for the whole of Nairobi branch.",
    payoutTo: "M-Pesa ···· 5512 (bride's mother)",
    scope: "All the family",
  },
  {
    id: "c6",
    ref: "NY-CON-2025-00412",
    title: "Emergency roof repair — Barasa home",
    purpose: "emergency",
    beneficiary: "Dennis Barasa Nalyanya household, Kakamega",
    goal: 95000,
    raised: 95000,
    contributors: 29,
    deadline: "08 Oct 2025",
    status: "paid-out",
    branch: "Kakamega",
    organizer: "Joseph Nyongesa Nalyanya",
    image: "/images/frame-reunion.jpg",
    blurb:
      "Iron sheets and labour after the April storms took half the roof. Repaired and signed off by the branch elder.",
    payoutTo: "M-Pesa ···· 3308 (organizer)",
    scope: "Branch only",
  },
  {
    id: "c7",
    ref: "NY-CON-2025-00444",
    title: "Reunion harambee — March 2026",
    purpose: "harambee",
    beneficiary: "Nalyanya reunion kitty, Kitale",
    goal: 400000,
    raised: 118500,
    contributors: 52,
    deadline: "20 Mar 2026",
    status: "open",
    branch: "Trans-Nzoia",
    organizer: "Hamza Hassan Nalyanya",
    image: "/images/contrib-hero.jpg",
    blurb:
      "Venue, tents, transport for the elders and one very long table. Every branch sends one contribution per member.",
    payoutTo: "Coop Bank ···· 6135 (reunion account)",
    scope: "All the family",
  },
  {
    id: "c8",
    ref: "NY-CON-2025-00407",
    title: "Merry-go-round top-up — November round",
    purpose: "merry-go-round",
    beneficiary: "Chama round 11 recipients",
    goal: 260000,
    raised: 260000,
    contributors: 26,
    deadline: "05 Nov 2025",
    status: "met",
    branch: "Nairobi",
    organizer: "Grace Kwamboka Nalyanya",
    image: "/images/frame-elder.jpg",
    blurb:
      "Round 11 of the Nairobi chama — 26 members × KES 10,000, rotating to the next recipient on the 5th.",
    payoutTo: "Internal wallet · chama pool",
    scope: "Selected members",
  },
];

export type Contribution = {
  ref: string;
  date: string;
  contributor: string;
  contributorId: string;
  causeId: string;
  amount: number;
  channel: Channel;
  status: ConStatus;
  receipt: string;
  ledgerRef: string;
  message?: string;
};

export const contributions: Contribution[] = [
  { ref: "NY-CON-2025-00451", date: "18 Nov 2025 · 09:12", contributor: "Grace Kwamboka Nalyanya", contributorId: "m12", causeId: "c2", amount: 5000, channel: "mpesa", status: "confirmed", receipt: "RKX7H8KP2", ledgerRef: "NY-LED-0004511", message: "Pole sana Mama Ruth, get well soon." },
  { ref: "NY-CON-2025-00450", date: "18 Nov 2025 · 08:41", contributor: "Brian Otieno Nalyanya", contributorId: "m03", causeId: "c7", amount: 10000, channel: "mpesa", status: "confirmed", receipt: "RKX7H8JQ9", ledgerRef: "NY-LED-0004510", message: "For the elders' transport." },
  { ref: "NY-CON-2025-00449", date: "17 Nov 2025 · 19:55", contributor: "Faith Chebet Nalyanya", contributorId: "m07", causeId: "c1", amount: 12000, channel: "bank", status: "confirmed", receipt: "EFT-88213", ledgerRef: "NY-LED-0004509" },
  { ref: "NY-CON-2025-00448", date: "17 Nov 2025 · 16:20", contributor: "Hamza Hassan Nalyanya", contributorId: "m15", causeId: "c4", amount: 25000, channel: "bank", status: "confirmed", receipt: "EFT-88190", ledgerRef: "NY-LED-0004508", message: "Push the borehole to 40% before Christmas." },
  { ref: "NY-CON-2025-00447", date: "17 Nov 2025 · 12:03", contributor: "Millicent Aoko Nalyanya", contributorId: "m21", causeId: "c5", amount: 2000, channel: "mpesa", status: "pending", receipt: "PENDING", ledgerRef: "—" },
  { ref: "NY-CON-2025-00446", date: "16 Nov 2025 · 21:44", contributor: "Dennis Barasa Nalyanya", contributorId: "m18", causeId: "c2", amount: 3500, channel: "airtel", status: "confirmed", receipt: "ATL-447190", ledgerRef: "NY-LED-0004506" },
  { ref: "NY-CON-2025-00445", date: "16 Nov 2025 · 14:30", contributor: "Esther Nafula Nalyanya", contributorId: "m09", causeId: "c4", amount: 15000, channel: "mpesa", status: "confirmed", receipt: "RKX7H7TT4", ledgerRef: "NY-LED-0004505" },
  { ref: "NY-CON-2025-00444", date: "16 Nov 2025 · 11:11", contributor: "Peter Wanyama Nalyanya", contributorId: "m05", causeId: "c7", amount: 8000, channel: "internal", status: "confirmed", receipt: "WAL-99213", ledgerRef: "NY-LED-0004504", message: "Nairobi branch is in." },
  { ref: "NY-CON-2025-00443", date: "15 Nov 2025 · 18:02", contributor: "Agnes Wanjiru Nalyanya", contributorId: "m11", causeId: "c5", amount: 7500, channel: "mpesa", status: "confirmed", receipt: "RKX7H7M2C", ledgerRef: "NY-LED-0004503" },
  { ref: "NY-CON-2025-00442", date: "15 Nov 2025 · 10:26", contributor: "Samuel Kiprop Nalyanya", contributorId: "m14", causeId: "c2", amount: 20000, channel: "bank", status: "confirmed", receipt: "EFT-88101", ledgerRef: "NY-LED-0004502", message: "From the Kitale children." },
  { ref: "NY-CON-2025-00441", date: "14 Nov 2025 · 20:19", contributor: "Collins Munyasia Nalyanya", contributorId: "m16", causeId: "c4", amount: 4000, channel: "mpesa", status: "failed", receipt: "—", ledgerRef: "—" },
  { ref: "NY-CON-2025-00440", date: "14 Nov 2025 · 09:00", contributor: "Ruth Akinyi Nalyanya", contributorId: "m02", causeId: "c1", amount: 6000, channel: "mpesa", status: "confirmed", receipt: "RKX7H6QQ1", ledgerRef: "NY-LED-0004499", message: "For my grandchildren." },
  { ref: "NY-CON-2025-00439", date: "13 Nov 2025 · 15:47", contributor: "Joseph Nyongesa Nalyanya", contributorId: "m19", causeId: "c7", amount: 12500, channel: "internal", status: "confirmed", receipt: "WAL-99180", ledgerRef: "NY-LED-0004497" },
  { ref: "NY-CON-2025-00438", date: "13 Nov 2025 · 07:58", contributor: "Faith Chebet Nalyanya", contributorId: "m07", causeId: "c2", amount: 9000, channel: "mpesa", status: "initiated", receipt: "STK-queued", ledgerRef: "—" },
];

export type Payout = {
  ref: string;
  causeId: string;
  amount: number;
  destination: string;
  channel: Channel;
  status: "ready" | "released" | "settled" | "held";
  at: string;
  ledgerRef: string;
};

export const payouts: Payout[] = [
  { ref: "NY-PAY-2025-0079", causeId: "c1", amount: 180000, destination: "M-Pesa ···· 7890 · Ruth Akinyi", channel: "mpesa", status: "ready", at: "Awaiting release", ledgerRef: "NY-LED-0004520" },
  { ref: "NY-PAY-2025-0078", causeId: "c8", amount: 260000, destination: "Internal wallet · chama pool", channel: "internal", status: "ready", at: "Awaiting release", ledgerRef: "NY-LED-0004519" },
  { ref: "NY-PAY-2025-0077", causeId: "c3", amount: 320000, destination: "M-Pesa ···· 2210 · Esther Nafula", channel: "mpesa", status: "settled", at: "03 Nov 2025 · 10:22", ledgerRef: "NY-LED-0004461" },
  { ref: "NY-PAY-2025-0071", causeId: "c6", amount: 95000, destination: "M-Pesa ···· 3308 · Joseph Nyongesa", channel: "mpesa", status: "settled", at: "09 Oct 2025 · 16:04", ledgerRef: "NY-LED-0004390" },
  { ref: "NY-PAY-2025-0068", causeId: "c2", amount: 40000, destination: "Equity Bank ···· 4471 · Peter Wanyama", channel: "bank", status: "held", at: "Held — 4-eyes review", ledgerRef: "—" },
];

export type LedgerEntry = {
  ref: string;
  at: string;
  debit: string;
  credit: string;
  amount: number;
  source: string;
};

export const ledger: LedgerEntry[] = [
  { ref: "NY-LED-0004511", at: "18 Nov · 09:12", debit: "M-Pesa clearing", credit: "Cause escrow · Clinic bills", amount: 5000, source: "NY-CON-2025-00451" },
  { ref: "NY-LED-0004510", at: "18 Nov · 08:41", debit: "M-Pesa clearing", credit: "Cause escrow · Reunion harambee", amount: 10000, source: "NY-CON-2025-00450" },
  { ref: "NY-LED-0004509", at: "17 Nov · 19:55", debit: "Bank clearing · Equity", credit: "Cause escrow · School fees", amount: 12000, source: "NY-CON-2025-00449" },
  { ref: "NY-LED-0004461", at: "03 Nov · 10:22", debit: "Cause escrow · Memorial", credit: "M-Pesa B2C ···· 2210", amount: 320000, source: "NY-PAY-2025-0077" },
  { ref: "NY-LED-0004390", at: "09 Oct · 16:04", debit: "Cause escrow · Emergency roof", credit: "M-Pesa B2C ···· 3308", amount: 95000, source: "NY-PAY-2025-0071" },
  { ref: "NY-LED-0004388", at: "09 Oct · 16:04", debit: "Family wallet · Joseph N.", credit: "M-Pesa clearing", amount: 95000, source: "NY-CON-2025-00412" },
];

export type AuditEntry = {
  ref: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
  detail: string;
  tone: "plain" | "gold" | "red";
};

export const audit: AuditEntry[] = [
  { ref: "NY-AUD-00981", at: "18 Nov 2025 · 09:12", actor: "Grace Kwamboka Nalyanya", action: "contribute", entity: "NY-CON-2025-00451", detail: "KES 5,000 via M-Pesa → escrow · confirmed (SIMULATED STK)", tone: "gold" },
  { ref: "NY-AUD-00980", at: "18 Nov 2025 · 07:30", actor: "Peter Wanyama Nalyanya", action: "payout.released", entity: "NY-PAY-2025-0077", detail: "KES 320,000 → M-Pesa B2C ···· 2210 · 2FA + audit", tone: "plain" },
  { ref: "NY-AUD-00979", at: "17 Nov 2025 · 21:02", actor: "Hamza Hassan Nalyanya", action: "cause.create", entity: "NY-CON-2025-00444", detail: "Reunion harambee published · scope = all the family", tone: "plain" },
  { ref: "NY-AUD-00978", at: "16 Nov 2025 · 11:44", actor: "Finance officer · Faith C.", action: "reconcile.resolve", entity: "NY-EXC-00042", detail: "Duplicate STK ref RKX7H8KP2 removed from statement diff", tone: "red" },
  { ref: "NY-AUD-00977", at: "15 Nov 2025 · 10:31", actor: "System", action: "contribution.failed", entity: "NY-CON-2025-00441", detail: "M-Pesa STK timeout — no money left the contributor's wallet", tone: "red" },
  { ref: "NY-AUD-00976", at: "14 Nov 2025 · 09:00", actor: "Ruth Akinyi Nalyanya", action: "contribute", entity: "NY-CON-2025-00440", detail: "KES 6,000 via M-Pesa → escrow · confirmed (SIMULATED)", tone: "gold" },
  { ref: "NY-AUD-00975", at: "13 Nov 2025 · 16:12", actor: "Family head · Mzee V. office", action: "cause.update", entity: "NY-CON-2025-00428", detail: "Deadline extended 21 Nov → 30 Nov · reason logged", tone: "plain" },
  { ref: "NY-AUD-00974", at: "12 Nov 2025 · 08:04", actor: "Collins Munyasia Nalyanya", action: "payout.hold", entity: "NY-PAY-2025-0068", detail: "Held for 4-eyes review — amount above per-tx cap", tone: "red" },
];

export type ReconLine = {
  ref: string;
  at: string;
  statement: string;
  ledgerSide: string;
  amount: number;
  match: "matched" | "missing" | "mismatch" | "duplicate";
};

export const reconciliation: ReconLine[] = [
  { ref: "RKX7H8KP2", at: "18 Nov 09:12", statement: "Paybill 4471 · Grace K. +2547···2210", ledgerSide: "NY-CON-2025-00451", amount: 5000, match: "matched" },
  { ref: "RKX7H8JQ9", at: "18 Nov 08:41", statement: "Paybill 4471 · Brian O. +2547···8841", ledgerSide: "NY-CON-2025-00450", amount: 10000, match: "matched" },
  { ref: "EFT-88213", at: "17 Nov 19:55", statement: "Equity EFT · Faith C. acct 004412", ledgerSide: "NY-CON-2025-00449", amount: 12000, match: "matched" },
  { ref: "RKX7H7TT4", at: "16 Nov 14:31", statement: "Paybill 4471 · Esther N. +2547···6612", ledgerSide: "— not in ledger yet", amount: 15000, match: "missing" },
  { ref: "RKX7H6QQ1", at: "14 Nov 09:02", statement: "Paybill 4471 · Ruth A. +2547···7890", ledgerSide: "NY-CON-2025-00440 (KES 6,000)", amount: 5500, match: "mismatch" },
  { ref: "RKX7H8KP2", at: "18 Nov 09:13", statement: "Paybill 4471 · duplicate replay", ledgerSide: "NY-CON-2025-00451", amount: 5000, match: "duplicate" },
];

export type Frame = {
  id: string;
  src: string;
  title: string;
  caption: string;
  frame: string;
  lens: string;
  exposure: string;
  place: string;
};

export const frames: Frame[] = [
  { id: "f1", src: "/images/contrib-hero.jpg", title: "The harambee table", caption: "Bungoma veranda — counting the November collection into the tin.", frame: "12A", lens: "35mm", exposure: "1/125 · f2.8", place: "Bungoma" },
  { id: "f2", src: "/images/frame-reunion.jpg", title: "Reunion steps", caption: "Five generations on the homestead steps, March 2025 reunion.", frame: "13", lens: "85mm", exposure: "1/250 · f4", place: "Trans-Nzoia" },
  { id: "f3", src: "/images/cause-school.jpg", title: "Term reopens", caption: "Sharon and Brian Jr. walk to school the morning fees cleared.", frame: "14", lens: "50mm", exposure: "1/500 · f2.8", place: "Kimilili" },
  { id: "f4", src: "/images/cause-medical.jpg", title: "Clinic corridor", caption: "Mama Ruth's second review day — Peter walks her out.", frame: "15A", lens: "35mm", exposure: "1/60 · f2", place: "Nairobi" },
  { id: "f5", src: "/images/cause-water.jpg", title: "First water", caption: "The Musanda borehole test pump, before the drill crews left.", frame: "16", lens: "28mm", exposure: "1/1000 · f5.6", place: "Musanda" },
  { id: "f6", src: "/images/cause-wedding.jpg", title: "Millicent & Daniel", caption: "First dance under the string lights, February 2026 preview.", frame: "17", lens: "35mm", exposure: "1/30 · f1.8", place: "Karen" },
  { id: "f7", src: "/images/frame-elder.jpg", title: "The ledger", caption: "Mzee Victor's handwritten giving book — every shilling accounted for.", frame: "18A", lens: "90mm macro", exposure: "1/45 · f2.8", place: "Kitale" },
  { id: "f8", src: "/images/cause-memorial.jpg", title: "Send-off", caption: "White lilies for Mzee Samuel Kiprop, under the family tent.", frame: "19", lens: "50mm", exposure: "1/125 · f2.8", place: "Trans-Nzoia" },
];

export const kpis = [
  { label: "Active causes", value: 6, hint: "2 closing this week", tone: "brand" },
  { label: "Contributed this month", value: 486500, prefix: "KES ", hint: "184 contributions · +18% vs Oct", tone: "gold" },
  { label: "Your contributions", value: 96500, prefix: "KES ", hint: "11 contributions since Jan", tone: "brand" },
  { label: "Pending verification", value: 3, hint: "finance officer queue", tone: "warn" },
  { label: "Causes you benefit from", value: 2, hint: "School fees · reunion kitty", tone: "ok" },
];

export const contributors = [
  { id: "m12", name: "Grace Kwamboka Nalyanya", branch: "Kakamega", total: 68500, count: 14, phone: "+2547···2210" },
  { id: "m07", name: "Faith Chebet Nalyanya", branch: "Nairobi", total: 142000, count: 19, phone: "+2547···8841" },
  { id: "m15", name: "Hamza Hassan Nalyanya", branch: "Nairobi", total: 96000, count: 12, phone: "+2547···4417" },
  { id: "m05", name: "Peter Wanyama Nalyanya", branch: "Nairobi", total: 87500, count: 16, phone: "+2547···6612" },
  { id: "m09", name: "Esther Nafula Nalyanya", branch: "Trans-Nzoia", total: 74000, count: 11, phone: "+2547···3308" },
  { id: "m14", name: "Samuel Kiprop Nalyanya", branch: "Trans-Nzoia", total: 61000, count: 9, phone: "+2547···1174" },
  { id: "m03", name: "Brian Otieno Nalyanya", branch: "Bungoma", total: 58000, count: 13, phone: "+2547···5512" },
  { id: "m19", name: "Joseph Nyongesa Nalyanya", branch: "Kakamega", total: 44500, count: 8, phone: "+2547···9920" },
];

export const channels = [
  { id: "mpesa" as Channel, label: "M-Pesa Daraja", detail: "STK push to +2547···7890", cap: "money-in", sim: true, eta: "seconds" },
  { id: "airtel" as Channel, label: "Airtel Money", detail: "Secondary rail · same flow", cap: "money-in", sim: true, eta: "seconds" },
  { id: "bank" as Channel, label: "Bank EFT / RTGS", detail: "KCB · Equity · Coop · NCBA", cap: "transfer", sim: true, eta: "same day" },
  { id: "internal" as Channel, label: "Internal wallet", detail: "Family wallet balance KES 24,300", cap: "money-in", sim: false, eta: "instant" },
];

export function kes(n: number): string {
  return "KES " + Math.round(n).toLocaleString("en-KE");
}

export function pct(raised: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((raised / goal) * 100)));
}
