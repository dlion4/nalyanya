/* ══════════════════════════════════════════════════════════════════════
   T-8 · FINANCES — typed mock dataset
   Chama, merry-go-round, family Sacco, transactions, governance.
   Every number is deterministic; every integration is SIMULATED.
   ══════════════════════════════════════════════════════════════════════ */

export type ChamaStatus = "active" | "paused" | "closing";
export type ChamaCadence = "Weekly" | "Fortnightly" | "Monthly";

export interface ChamaFilters {
  status: "all" | "active" | "paused";
  cadence: "all" | "Weekly" | "Fortnightly" | "Monthly";
  q: string;
}

export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "contribution"
  | "payout"
  | "loan-repayment"
  | "share-purchase";
export type TransactionStatus = "confirmed" | "pending" | "failed";

export interface Chama {
  id: string;
  name: string;
  purpose: string;
  cadence: ChamaCadence;
  contributionKes: number;
  members: number;
  pool: number;
  position: number;
  of: number;
  nextPayout: string;
  recipient: string;
  status: ChamaStatus;
  image: string;
  gallery: ChamaImage[];
}

export interface ChamaImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
  year: string;
  credit: string;
}

export interface SaccoShare {
  id: string;
  member: string;
  shares: number;
  valuePerShare: number;
  totalValue: number;
  loanEligible: boolean;
  loanLimit: number;
  image: string;
}

export interface FinanceTransaction {
  id: string;
  date: string;
  member: string;
  type: TransactionType;
  chamaId?: string;
  amount: number;
  balance: number;
  status: TransactionStatus;
  channel: string;
  reference: string;
  note: string;
}

export interface GovernanceItem {
  id: string;
  title: string;
  description: string;
  owner: string;
  status: "open" | "approved" | "rejected" | "pending-review";
  due: string;
}

export const CHAMAS: Chama[] = [
  {
    id: "wazee-round",
    name: "Wazee Round",
    purpose:
      "Fortnightly merry-go-round for the elder branch — each member hosts the pool in rotation.",
    cadence: "Fortnightly",
    contributionKes: 40000,
    members: 12,
    pool: 480000,
    position: 4,
    of: 12,
    nextPayout: "Wed 13 May",
    recipient: "Peter Otieno Nalyanya",
    status: "active",
    image: "/images/family/tea-hills.jpg",
    gallery: [
      {
        id: "wazee-1",
        src: "/images/family/tea-hills.jpg",
        alt: "Tea plantation hills near Kericho",
        caption: "Wazee Round meeting under the acacia",
        year: "2024",
        credit: "Peter Otieno",
      },
      {
        id: "wazee-2",
        src: "/images/family/sunday-lunch.jpg",
        alt: "Family sharing a long table together",
        caption: "Rotation day lunch",
        year: "2025",
        credit: "Esther Nanjala",
      },
      {
        id: "wazee-3",
        src: "/images/family/meeting.jpg",
        alt: "Chama members in discussion",
        caption: "Position draw and rules review",
        year: "2025",
        credit: "Brian Otieno",
      },
    ],
  },
  {
    id: "umoja-round",
    name: "Umoja Round",
    purpose:
      "Monthly contributions for school fees across the Kakamega and Kitale branches.",
    cadence: "Monthly",
    contributionKes: 32000,
    members: 10,
    pool: 320000,
    position: 2,
    of: 10,
    nextPayout: "Mon 18 May",
    recipient: "Grace Adhiambo Nalyanya",
    status: "active",
    image: "/images/family/clinic.jpg",
    gallery: [
      {
        id: "umoja-1",
        src: "/images/family/clinic.jpg",
        alt: "Kisumu clinic drive planning",
        caption: "Umoja Round health fund meeting",
        year: "2025",
        credit: "Grace Adhiambo",
      },
      {
        id: "umoja-2",
        src: "/images/family/grace.jpg",
        alt: "Grace Adhiambo Nalyanya portrait",
        caption: "Recipient this rotation",
        year: "2025",
        credit: "Family album",
      },
    ],
  },
  {
    id: "taifa-circle",
    name: "Taifa Savings Circle",
    purpose:
      "Fortnightly savings circle targeting the homestead project at Kimilili.",
    cadence: "Fortnightly",
    contributionKes: 41000,
    members: 15,
    pool: 615000,
    position: 9,
    of: 15,
    nextPayout: "Fri 22 May",
    recipient: "Caleb Kiprono Nalyanya",
    status: "active",
    image: "/images/family/elgon.jpg",
    gallery: [
      {
        id: "taifa-1",
        src: "/images/family/elgon.jpg",
        alt: "Mount Elgon foothills near Kimilili",
        caption: "Homestead project site visit",
        year: "2024",
        credit: "Joseph Wafula",
      },
      {
        id: "taifa-2",
        src: "/images/family/caleb.jpg",
        alt: "Caleb Kiprono Nalyanya portrait",
        caption: "Rotation 9 of 15",
        year: "2025",
        credit: "Eldoret branch",
      },
    ],
  },
  {
    id: "harambee-fund",
    name: "Kimilili Harambee Fund",
    purpose:
      "Community haramhee for the Kimilili water project and borehole drilling.",
    cadence: "Monthly",
    contributionKes: 25000,
    members: 22,
    pool: 550000,
    position: 1,
    of: 6,
    nextPayout: "Sat 30 May",
    recipient: "Samuel Kipkoech Nalyanya",
    status: "paused",
    image: "/images/family/archive.jpg",
    gallery: [
      {
        id: "harambee-1",
        src: "/images/family/archive.jpg",
        alt: "Family archive photo",
        caption: "Haramhee planning session",
        year: "2023",
        credit: "Samuel Kipkoech",
      },
    ],
  },
];

export const SACCO_SHARES: SaccoShare[] = [
  {
    id: "share-001",
    member: "Mzee Victor Wafula Nalyanya",
    shares: 1200,
    valuePerShare: 1250,
    totalValue: 1500000,
    loanEligible: true,
    loanLimit: 900000,
    image: "/images/family/mzee-victor.jpg",
  },
  {
    id: "share-002",
    member: "Esther Nanjala Nalyanya",
    shares: 850,
    valuePerShare: 1250,
    totalValue: 1062500,
    loanEligible: true,
    loanLimit: 637500,
    image: "/images/family/esther-matriarch.jpg",
  },
  {
    id: "share-003",
    member: "Joseph Wafula Nalyanya",
    shares: 600,
    valuePerShare: 1250,
    totalValue: 750000,
    loanEligible: true,
    loanLimit: 450000,
    image: "/images/family/joseph.jpg",
  },
  {
    id: "share-004",
    member: "Peter Otieno Nalyanya",
    shares: 520,
    valuePerShare: 1250,
    totalValue: 650000,
    loanEligible: true,
    loanLimit: 390000,
    image: "/images/family/peter.jpg",
  },
  {
    id: "share-005",
    member: "Samuel Kipkoech Nalyanya",
    shares: 480,
    valuePerShare: 1250,
    totalValue: 600000,
    loanEligible: false,
    loanLimit: 0,
    image: "/images/family/samuel.jpg",
  },
  {
    id: "share-006",
    member: "Grace Adhiambo Nalyanya",
    shares: 400,
    valuePerShare: 1250,
    totalValue: 500000,
    loanEligible: true,
    loanLimit: 300000,
    image: "/images/family/grace.jpg",
  },
  {
    id: "share-007",
    member: "Daniel Wafula Nalyanya",
    shares: 320,
    valuePerShare: 1250,
    totalValue: 400000,
    loanEligible: true,
    loanLimit: 240000,
    image: "/images/family/daniel.jpg",
  },
  {
    id: "share-008",
    member: "Hellen Nasimiyu Nalyanya",
    shares: 280,
    valuePerShare: 1250,
    totalValue: 350000,
    loanEligible: true,
    loanLimit: 210000,
    image: "/images/family/hellen.jpg",
  },
];

export const TRANSACTIONS: FinanceTransaction[] = [
  {
    id: "NY-TXN-2026-0412",
    date: "2026-05-10T10:15:00+03:00",
    member: "Peter Otieno Nalyanya",
    type: "contribution",
    chamaId: "wazee-round",
    amount: 40000,
    balance: 480000,
    status: "confirmed",
    channel: "M-Pesa",
    reference: "NY-MP-2026-0412",
    note: "Wazee Round · position 4 of 12",
  },
  {
    id: "NY-TXN-2026-0411",
    date: "2026-05-09T14:30:00+03:00",
    member: "Naomi Achieng Nalyanya",
    type: "deposit",
    amount: 60000,
    balance: 540000,
    status: "confirmed",
    channel: "Bank transfer",
    reference: "NY-BNK-2026-0411",
    note: "Family wallet top-up",
  },
  {
    id: "NY-TXN-2026-0409",
    date: "2026-05-08T09:00:00+03:00",
    member: "Mercy Auma Nalyanya",
    type: "contribution",
    chamaId: "umoja-round",
    amount: 32000,
    balance: 320000,
    status: "pending",
    channel: "M-Pesa",
    reference: "NY-MP-2026-0409",
    note: "Umoja Round · position 2 of 10",
  },
  {
    id: "NY-TXN-2026-0405",
    date: "2026-05-07T16:45:00+03:00",
    member: "Tom Mutua Okoth",
    type: "share-purchase",
    amount: 25000,
    balance: 250000,
    status: "confirmed",
    channel: "M-Pesa",
    reference: "NY-MP-2026-0405",
    note: "20 Sacco shares @ KES 1,250",
  },
  {
    id: "NY-TXN-2026-0402",
    date: "2026-05-06T11:20:00+03:00",
    member: "Daniel Wafula Nalyanya",
    type: "payout",
    chamaId: "taifa-circle",
    amount: 41000,
    balance: 205000,
    status: "confirmed",
    channel: "M-Pesa",
    reference: "NY-MP-2026-0402",
    note: "Taifa Circle payout · rotation 9 of 15",
  },
  {
    id: "NY-TXN-2026-0398",
    date: "2026-05-05T08:30:00+03:00",
    member: "Lynn Ruth Wakoli",
    type: "contribution",
    chamaId: "harambee-fund",
    amount: 25000,
    balance: 550000,
    status: "failed",
    channel: "Airtel Money",
    reference: "NY-AM-2026-0398",
    note: "Haramhee Fund · insufficient balance",
  },
  {
    id: "NY-TXN-2026-0396",
    date: "2026-05-04T19:10:00+03:00",
    member: "Caleb Kiprono Nalyanya",
    type: "contribution",
    chamaId: "taifa-circle",
    amount: 41000,
    balance: 615000,
    status: "confirmed",
    channel: "M-Pesa",
    reference: "NY-MP-2026-0396",
    note: "Taifa Circle · rotation 9 of 15",
  },
  {
    id: "NY-TXN-2026-0391",
    date: "2026-05-03T12:00:00+03:00",
    member: "Hellen Nasimiyu Nalyanya",
    type: "loan-repayment",
    amount: 18400,
    balance: 186000,
    status: "confirmed",
    channel: "M-Pesa",
    reference: "NY-MP-2026-0391",
    note: "Loan NY-LON-2026-00088 instalment",
  },
];

export const GOVERNANCE: GovernanceItem[] = [
  {
    id: "gov-1",
    title: "Approve Wazee Round rotation rules",
    description:
      "Update the fortnightly rotation to skip positions during December holidays.",
    owner: "Finance Committee",
    status: "pending-review",
    due: "Fri 22 May",
  },
  {
    id: "gov-2",
    title: "Share value review — KES 1,250 → KES 1,400",
    description:
      "Annual Sacco share revaluation vote, requires 75% member approval.",
    owner: "Sacco Board",
    status: "open",
    due: "Mon 1 Jun",
  },
  {
    id: "gov-3",
    title: "Loan limit increase for Peter Otieno",
    description:
      "Member requests loan limit raised from KES 390,000 to KES 750,000.",
    owner: "Credit Committee",
    status: "approved",
    due: "Paid",
  },
  {
    id: "gov-4",
    title: "Harambhee Fund payout freeze",
    description:
      "Temporarily pause payouts pending borehole contractor verification.",
    owner: "Audit Committee",
    status: "rejected",
    due: "Resolved",
  },
  {
    id: "gov-5",
    title: "New chama onboarding: Diaspora Round",
    description:
      "London-based members propose a GBP-denominated merry-go-round.",
    owner: "Diaspora Liaison",
    status: "open",
    due: "Wed 10 Jun",
  },
];

/* ─── Helpers ─────────────────────────────────────────────────────────── */

export function chamaById(id: string): Chama | undefined {
  return CHAMAS.find((c) => c.id === id);
}

export function activeChamas(): Chama[] {
  return CHAMAS.filter((c) => c.status === "active");
}

export function totalPool(): number {
  return CHAMAS.reduce((s, c) => s + c.pool, 0);
}

export function totalSharesValue(): number {
  return SACCO_SHARES.reduce((s, sh) => s + sh.totalValue, 0);
}

export function memberShare(memberId: string): SaccoShare | undefined {
  return SACCO_SHARES.find((sh) => sh.id === memberId);
}

export function transactionTypeLabel(t: TransactionType): string {
  const map: Record<TransactionType, string> = {
    deposit: "Deposit",
    withdrawal: "Withdrawal",
    contribution: "Chama contribution",
    payout: "Chama payout",
    "loan-repayment": "Loan repayment",
    "share-purchase": "Share purchase",
  };
  return map[t];
}

export function channelLabel(ch: string): string {
  const map: Record<string, string> = {
    mpesa: "M-Pesa",
    airtel: "Airtel Money",
    bank: "Bank",
    internal: "Family ledger",
  };
  return map[ch] ?? "M-Pesa";
}
