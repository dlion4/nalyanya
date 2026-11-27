/* ═══════════════════════════════════════════════════════════════════════
   T-7 · CONTRIBUTIONS — page data (mock, deterministic, Kenyan family
   records). Every record here is fictional but internally consistent:
   the same people, branches, causes and albums the rest of the dashboard
   already knows about.
   ═══════════════════════════════════════════════════════════════════════ */

import type { PageConfig } from "@/types/workspace";

export const pageData: PageConfig = {
  slug: "contributions",
  name: "Family contributions",
  eyebrow: "Giving together",
  description:
    "The family's giving hub — weddings, sickness, funerals, harambees, projects, education and emergencies.",
  action: "Make a contribution",
  panel: "contribute",
  layout: "money",
};

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type CausePurpose =
  | "wedding"
  | "sickness"
  | "funeral"
  | "harambee"
  | "project"
  | "education"
  | "emergency";

export type ContributionChannel =
  | "mpesa"
  | "airtel"
  | "bank"
  | "internal";

export type ContributionStatus =
  | "initiated"
  | "pending"
  | "confirmed"
  | "failed";

export type PayoutStatus = "queued" | "released" | "held";

export interface CausePhoto {
  id: string;
  src: string;
  alt: string;
  caption: string;
  year: string;
  credit: string;
}

export interface Cause {
  id: string;
  title: string;
  purpose: CausePurpose;
  purposeLabel: string;
  beneficiary: string;
  beneficiaryAnonymized: boolean;
  goal: number;
  raised: number;
  contributors: number;
  deadline: string;
  status: "open" | "closed" | "paused";
  image: string;
  imageAlt: string;
  gallery: CausePhoto[];
  description: string;
  tags: string[];
  payoutDestination: string;
  payoutStatus: PayoutStatus;
}

export interface CauseFilters {
  purpose: CausePurpose | "all";
  status: "open" | "closed" | "all";
  q: string;
}

export interface Contribution {
  id: string;
  causeId: string;
  member: string;
  memberImage?: string;
  purpose: CausePurpose;
  amount: number;
  channel: ContributionChannel;
  channelLabel: string;
  reference?: string;
  message?: string;
  status: ContributionStatus;
  createdAt: string;
  confirmedAt?: string;
  receiptUrl?: string;
  ledgerRef?: string;
}

export interface Payout {
  id: string;
  causeId: string;
  causeTitle: string;
  recipient: string;
  amount: number;
  channel: ContributionChannel;
  status: PayoutStatus;
  requestedAt: string;
  releasedAt?: string;
  ledgerRef: string;
  reference?: string;
}

export interface AuditEntry {
  id: string;
  causeId?: string;
  action: "cause_created" | "cause_updated" | "contributed" | "payout" | "verified";
  actor: string;
  detail: string;
  at: string;
  amount?: number;
}

export interface CauseFilters {
  purpose: CausePurpose | "all";
  status: "open" | "closed" | "all";
  q: string;
}

export interface TableFilters {
  cause: string | "all";
  channel: ContributionStatus | "all";
  status: ContributionStatus | "all";
  q: string;
}

/* ─── Mock data ─────────────────────────────────────────────────────────── */

const now = new Date();
const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

export const CAUSES: Cause[] = [
  {
    id: "NY-CAUSE-2026-001",
    title: "Grace's Wedding Harambee",
    purpose: "wedding",
    purposeLabel: "Wedding",
    beneficiary: "Grace Adhiambo Nalyanya",
    beneficiaryAnonymized: false,
    goal: 750_000,
    raised: 412_000,
    contributors: 28,
    deadline: "2026-07-15",
    status: "open",
    image: "/images/family/wedding.jpg",
    imageAlt: "Grace's wedding celebration",
    gallery: [
      {
        id: "gp-1",
        src: "/images/family/wedding.jpg",
        alt: "Grace's wedding harambee",
        caption: "Family gathering at the homestead",
        year: "2026",
        credit: "Brian Otieno Nalyanya",
      },
      {
        id: "gp-2",
        src: "/images/family/gathering.jpg",
        alt: "Guests at the wedding harambee",
        caption: "Relatives contributing to the gift",
        year: "2026",
        credit: "Naomi Achieng Nalyanya",
      },
    ],
    description:
      "Contributions toward Grace's wedding ceremony and the couple's new home in Eldoret.",
    tags: ["wedding", "eldoret", "family"],
    payoutDestination: "M-Pesa 0712 345 678",
    payoutStatus: "queued",
  },
  {
    id: "NY-CAUSE-2026-002",
    title: "Daniel's Medical Fund",
    purpose: "sickness",
    purposeLabel: "Sickness",
    beneficiary: "Daniel Wafula Nalyanya",
    beneficiaryAnonymized: false,
    goal: 300_000,
    raised: 186_000,
    contributors: 19,
    deadline: "2026-06-20",
    status: "open",
    image: "/images/memorial/daniel-wafula.jpg",
    imageAlt: "Daniel Wafula Nalyanya",
    gallery: [
      {
        id: "gp-3",
        src: "/images/memorial/daniel-wafula.jpg",
        alt: "Daniel at the family homestead",
        caption: "Daniel before treatment",
        year: "2025",
        credit: "Esther Nanjala Nalyanya",
      },
    ],
    description:
      "Medical expenses for Daniel's treatment at the Nairobi hospital.",
    tags: ["sickness", "nairobi", "health"],
    payoutDestination: "Bank: Family Welfare Sacco",
    payoutStatus: "released",
  },
  {
    id: "NY-CAUSE-2026-003",
    title: "Mzee Victor Memorial Funeral",
    purpose: "funeral",
    purposeLabel: "Funeral",
    beneficiary: "The Nalyanya family",
    beneficiaryAnonymized: true,
    goal: 500_000,
    raised: 498_000,
    contributors: 42,
    deadline: "2026-05-30",
    status: "closed",
    image: "/images/memorial/mzee-victor.jpg",
    imageAlt: "Mzee Victor Wafula Nalyanya",
    gallery: [
      {
        id: "gp-4",
        src: "/images/memorial/mzee-victor.jpg",
        alt: "Mzee Victor Wafula Nalyanya",
        caption: "Our patriarch at the family home",
        year: "2019",
        credit: "Family archive",
      },
    ],
    description:
      "Funeral and burial expenses for Mzee Victor Wafula Nalyanya, our patriarch.",
    tags: ["funeral", "kimilili", "patriarch"],
    payoutDestination: "M-Pesa 0722 111 222",
    payoutStatus: "released",
  },
  {
    id: "NY-CAUSE-2026-004",
    title: "Kimilili Homestead Project",
    purpose: "project",
    purposeLabel: "Project",
    beneficiary: "Extended family compound",
    beneficiaryAnonymized: true,
    goal: 3_000_000,
    raised: 1_180_000,
    contributors: 34,
    deadline: "2026-12-01",
    status: "open",
    image: "/images/family/highlands.jpg",
    imageAlt: "Kimilili homestead project site",
    gallery: [
      {
        id: "gp-5",
        src: "/images/family/highlands.jpg",
        alt: "Homestead construction site",
        caption: "Foundation work underway",
        year: "2026",
        credit: "Caleb Kiprono Nalyanya",
      },
    ],
    description:
      "Roof, borehole and the second wing at the Kimilili family compound.",
    tags: ["project", "kimilili", "construction"],
    payoutDestination: "Bank: Nalyanya Family Sacco",
    payoutStatus: "queued",
  },
  {
    id: "NY-CAUSE-2026-005",
    title: "Education Bursary Fund",
    purpose: "education",
    purposeLabel: "Education",
    beneficiary: "Family scholars (anonymized)",
    beneficiaryAnonymized: true,
    goal: 1_200_000,
    raised: 745_000,
    contributors: 41,
    deadline: "2027-01-15",
    status: "open",
    image: "/images/family/reunion.jpg",
    imageAlt: "Family scholars gathering",
    gallery: [
      {
        id: "gp-6",
        src: "/images/family/reunion.jpg",
        alt: "Students at family reunion",
        caption: "Scholars receiving bursaries",
        year: "2025",
        credit: "Grace Adhiambo Nalyanya",
      },
    ],
    description:
      "School fees, university bursaries and the annual Nyeri bursary for young relatives.",
    tags: ["education", "bursary", "school"],
    payoutDestination: "Bank: Education Trust",
    payoutStatus: "queued",
  },
  {
    id: "NY-CAUSE-2026-006",
    title: "Emergency Relief Fund",
    purpose: "emergency",
    purposeLabel: "Emergency",
    beneficiary: "Any family member in crisis",
    beneficiaryAnonymized: true,
    goal: 600_000,
    raised: 512_000,
    contributors: 37,
    deadline: "2026-08-01",
    status: "open",
    image: "/images/family/golden-hour.jpg",
    imageAlt: "Emergency bench gathering",
    gallery: [],
    description:
      "Health emergencies, burial support and the emergency bench for hard months.",
    tags: ["emergency", "welfare", "crisis"],
    payoutDestination: "M-Pesa 0733 444 555",
    payoutStatus: "held",
  },
];

export const CONTRIBUTIONS: Contribution[] = [
  {
    id: "NY-CON-2026-0412",
    causeId: "NY-CAUSE-2026-001",
    member: "Peter Otieno Nalyanya",
    memberImage: "/images/family/peter.jpg",
    purpose: "wedding",
    amount: 25_000,
    channel: "mpesa",
    channelLabel: "M-Pesa",
    reference: "MP260506A1",
    message: "Congratulations Grace!",
    status: "confirmed",
    createdAt: "2026-05-06T09:12:00Z",
    confirmedAt: "2026-05-06T09:15:00Z",
    receiptUrl: "/receipts/NY-CON-2026-0412.pdf",
    ledgerRef: "NY-LED-2026-00142",
  },
  {
    id: "NY-CON-2026-0411",
    causeId: "NY-CAUSE-2026-002",
    member: "Naomi Achieng Nalyanya",
    memberImage: "/images/family/naomi.jpg",
    purpose: "sickness",
    amount: 60_000,
    channel: "bank",
    channelLabel: "Bank",
    reference: "BNK-8812",
    message: "Get well soon Daniel.",
    status: "confirmed",
    createdAt: "2026-05-05T14:30:00Z",
    confirmedAt: "2026-05-05T15:02:00Z",
    receiptUrl: "/receipts/NY-CON-2026-0411.pdf",
    ledgerRef: "NY-LED-2026-00141",
  },
  {
    id: "NY-CON-2026-0410",
    causeId: "NY-CAUSE-2026-001",
    member: "Esther Nanjala Nalyanya",
    memberImage: "/images/memorial/esther-nanjala.jpg",
    purpose: "wedding",
    amount: 15_000,
    channel: "mpesa",
    channelLabel: "M-Pesa",
    reference: "MP260505B2",
    message: "For the new home.",
    status: "confirmed",
    createdAt: "2026-05-05T08:00:00Z",
    confirmedAt: "2026-05-05T08:04:00Z",
    receiptUrl: "/receipts/NY-CON-2026-0410.pdf",
    ledgerRef: "NY-LED-2026-00140",
  },
  {
    id: "NY-CON-2026-0409",
    causeId: "NY-CAUSE-2026-006",
    member: "Mercy Auma Nalyanya",
    memberImage: "/images/family/mercy.jpg",
    purpose: "emergency",
    amount: 5_000,
    channel: "airtel",
    channelLabel: "Airtel Money",
    reference: "AM-4421",
    message: "Emergency bench top-up.",
    status: "pending",
    createdAt: "2026-05-04T11:20:00Z",
    ledgerRef: "NY-LED-2026-00139",
  },
  {
    id: "NY-CON-2026-0408",
    causeId: "NY-CAUSE-2026-005",
    member: "Tom Mutua Okoth",
    memberImage: "/images/family/tom.jpg",
    purpose: "education",
    amount: 12_000,
    channel: "internal",
    channelLabel: "Family ledger",
    message: "School fees for the term.",
    status: "confirmed",
    createdAt: "2026-05-03T16:45:00Z",
    confirmedAt: "2026-05-03T16:50:00Z",
    receiptUrl: "/receipts/NY-CON-2026-0408.pdf",
    ledgerRef: "NY-LED-2026-00138",
  },
  {
    id: "NY-CON-2026-0407",
    causeId: "NY-CAUSE-2026-004",
    member: "Caleb Kiprono Nalyanya",
    memberImage: "/images/family/caleb.jpg",
    purpose: "project",
    amount: 50_000,
    channel: "bank",
    channelLabel: "Bank",
    reference: "BNK-8801",
    message: "For the borehole.",
    status: "confirmed",
    createdAt: "2026-05-02T10:15:00Z",
    confirmedAt: "2026-05-02T10:22:00Z",
    receiptUrl: "/receipts/NY-CON-2026-0407.pdf",
    ledgerRef: "NY-LED-2026-00137",
  },
  {
    id: "NY-CON-2026-0406",
    causeId: "NY-CAUSE-2026-003",
    member: "Faith Auma Nalyanya",
    memberImage: "/images/memorial/faith-auma.jpg",
    purpose: "funeral",
    amount: 20_000,
    channel: "mpesa",
    channelLabel: "M-Pesa",
    reference: "MP260501C3",
    message: "Rest in peace, Mzee.",
    status: "confirmed",
    createdAt: "2026-05-01T19:00:00Z",
    confirmedAt: "2026-05-01T19:05:00Z",
    receiptUrl: "/receipts/NY-CON-2026-0406.pdf",
    ledgerRef: "NY-LED-2026-00136",
  },
  {
    id: "NY-CON-2026-0405",
    causeId: "NY-CAUSE-2026-005",
    member: "Brian Otieno Nalyanya",
    memberImage: "/images/family/brian.jpg",
    purpose: "education",
    amount: 8_000,
    channel: "mpesa",
    channelLabel: "M-Pesa",
    reference: "MP260430D4",
    message: "Bursary contribution.",
    status: "failed",
    createdAt: "2026-04-30T22:10:00Z",
    ledgerRef: "NY-LED-2026-00135",
  },
  {
    id: "NY-CON-2026-0404",
    causeId: "NY-CAUSE-2026-004",
    member: "Naomi Achieng Nalyanya",
    memberImage: "/images/family/naomi.jpg",
    purpose: "project",
    amount: 30_000,
    channel: "bank",
    channelLabel: "Bank",
    reference: "BNK-8799",
    message: "Roofing materials.",
    status: "confirmed",
    createdAt: "2026-04-29T07:30:00Z",
    confirmedAt: "2026-04-29T07:45:00Z",
    receiptUrl: "/receipts/NY-CON-2026-0404.pdf",
    ledgerRef: "NY-LED-2026-00134",
  },
  {
    id: "NY-CON-2026-0403",
    causeId: "NY-CAUSE-2026-006",
    member: "Grace Adhiambo Nalyanya",
    memberImage: "/images/family/grace.jpg",
    purpose: "emergency",
    amount: 25_000,
    channel: "mpesa",
    channelLabel: "M-Pesa",
    reference: "MP260428E5",
    message: "Emergency bench.",
    status: "confirmed",
    createdAt: "2026-04-28T14:00:00Z",
    confirmedAt: "2026-04-28T14:03:00Z",
    receiptUrl: "/receipts/NY-CON-2026-0403.pdf",
    ledgerRef: "NY-LED-2026-00133",
  },
  {
    id: "NY-CON-2026-0402",
    causeId: "NY-CAUSE-2026-002",
    member: "Daniel Wafula Nalyanya",
    memberImage: "/images/memorial/daniel-wafula.jpg",
    purpose: "sickness",
    amount: 20_000,
    channel: "internal",
    channelLabel: "Family ledger",
    message: "For my own treatment.",
    status: "confirmed",
    createdAt: "2026-04-27T09:00:00Z",
    confirmedAt: "2026-04-27T09:05:00Z",
    receiptUrl: "/receipts/NY-CON-2026-0402.pdf",
    ledgerRef: "NY-LED-2026-00132",
  },
];

export const PAYOUTS: Payout[] = [
  {
    id: "NY-PAY-2026-001",
    causeId: "NY-CAUSE-2026-002",
    causeTitle: "Daniel's Medical Fund",
    recipient: "Daniel Wafula Nalyanya",
    amount: 186_000,
    channel: "bank",
    status: "released",
    requestedAt: "2026-05-04T08:00:00Z",
    releasedAt: "2026-05-04T09:15:00Z",
    ledgerRef: "NY-LED-2026-00150",
    reference: "BNK-8820",
  },
  {
    id: "NY-PAY-2026-002",
    causeId: "NY-CAUSE-2026-003",
    causeTitle: "Mzee Victor Memorial Funeral",
    recipient: "The Nalyanya family",
    amount: 498_000,
    channel: "mpesa",
    status: "released",
    requestedAt: "2026-05-02T10:00:00Z",
    releasedAt: "2026-05-02T10:30:00Z",
    ledgerRef: "NY-LED-2026-00149",
    reference: "MP260502F1",
  },
  {
    id: "NY-PAY-2026-003",
    causeId: "NY-CAUSE-2026-001",
    causeTitle: "Grace's Wedding Harambee",
    recipient: "Grace Adhiambo Nalyanya",
    amount: 412_000,
    channel: "mpesa",
    status: "queued",
    requestedAt: "2026-05-06T09:00:00Z",
    ledgerRef: "NY-LED-2026-00148",
    reference: "MP260506G1",
  },
  {
    id: "NY-PAY-2026-004",
    causeId: "NY-CAUSE-2026-006",
    causeTitle: "Emergency Relief Fund",
    recipient: "Mercy Auma Nalyanya",
    amount: 512_000,
    channel: "mpesa",
    status: "held",
    requestedAt: "2026-05-05T12:00:00Z",
    ledgerRef: "NY-LED-2026-00147",
    reference: "MP260505H1",
  },
];

export const AUDIT: AuditEntry[] = [
  {
    id: "NY-AUD-2026-001",
    causeId: "NY-CAUSE-2026-001",
    action: "contributed",
    actor: "Peter Otieno Nalyanya",
    detail: "KES 25,000 via M-Pesa ref MP260506A1",
    at: "2026-05-06T09:12:00Z",
    amount: 25_000,
  },
  {
    id: "NY-AUD-2026-002",
    causeId: "NY-CAUSE-2026-001",
    action: "contributed",
    actor: "Esther Nanjala Nalyanya",
    detail: "KES 15,000 via M-Pesa ref MP260505B2",
    at: "2026-05-05T08:00:00Z",
    amount: 15_000,
  },
  {
    id: "NY-AUD-2026-003",
    causeId: "NY-CAUSE-2026-002",
    action: "payout",
    actor: "Family Treasurer",
    detail: "Released KES 186,000 to Daniel's bank account",
    at: "2026-05-04T09:15:00Z",
    amount: 186_000,
  },
  {
    id: "NY-AUD-2026-004",
    causeId: "NY-CAUSE-2026-006",
    action: "contributed",
    actor: "Mercy Auma Nalyanya",
    detail: "KES 5,000 via Airtel Money ref AM-4421 — pending verification",
    at: "2026-05-04T11:20:00Z",
    amount: 5_000,
  },
  {
    id: "NY-AUD-2026-005",
    causeId: "NY-CAUSE-2026-001",
    action: "cause_created",
    actor: "Grace Adhiambo Nalyanya",
    detail: "Created wedding harambee with goal KES 750,000",
    at: "2026-04-25T06:00:00Z",
  },
  {
    id: "NY-AUD-2026-006",
    causeId: "NY-CAUSE-2026-004",
    action: "contributed",
    actor: "Caleb Kiprono Nalyanya",
    detail: "KES 50,000 via Bank ref BNK-8801",
    at: "2026-05-02T10:15:00Z",
    amount: 50_000,
  },
  {
    id: "NY-AUD-2026-007",
    causeId: "NY-CAUSE-2026-005",
    action: "contributed",
    actor: "Brian Otieno Nalyanya",
    detail: "KES 8,000 via M-Pesa — payment failed",
    at: "2026-04-30T22:10:00Z",
    amount: 8_000,
  },
];

export const PURPOSES: { id: CausePurpose; label: string }[] = [
  
  { id: "wedding", label: "Wedding" },
  { id: "sickness", label: "Sickness" },
  { id: "funeral", label: "Funeral" },
  { id: "project", label: "Project" },
  { id: "education", label: "Education" },
  { id: "emergency", label: "Emergency" },
];

/* ─── Helpers ───────────────────────────────────────────────────────────── */

export function causeById(id: string): Cause | undefined {
  return CAUSES.find((c) => c.id === id);
}

export function contributionById(id: string): Contribution | undefined {
  return CONTRIBUTIONS.find((c) => c.id === id);
}

export function payoutById(id: string): Payout | undefined {
  return PAYOUTS.find((p) => p.id === id);
}

export function contributionsForCause(causeId: string): Contribution[] {
  return CONTRIBUTIONS.filter((c) => c.causeId === causeId);
}

export function payoutsForCause(causeId: string): Payout[] {
  return PAYOUTS.filter((p) => p.causeId === causeId);
}

export function raisedForCause(causeId: string): number {
  return CONTRIBUTIONS
    .filter((c) => c.causeId === causeId && c.status === "confirmed")
    .reduce((sum, c) => sum + c.amount, 0);
}

export function totalRaised(): number {
  return CAUSES.reduce((sum, c) => sum + c.raised, 0);
}

export function totalContributedThisMonth(): number {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return CONTRIBUTIONS.filter(
    (c) => new Date(c.createdAt) >= start && c.status === "confirmed",
  ).reduce((sum, c) => sum + c.amount, 0);
}

export function pendingVerificationCount(): number {
  return CONTRIBUTIONS.filter((c) => c.status === "pending").length;
}

export function causesYouBenefit(): number {
  return CAUSES.filter((c) => c.payoutStatus === "queued").length;
}

export function channelIcon(channel: ContributionChannel): string {
  switch (channel) {
    case "mpesa":
      return "📱";
    case "airtel":
      return "📱";
    case "bank":
      return "🏦";
    case "internal":
      return "📒";
    default:
      return "•";
  }
}
