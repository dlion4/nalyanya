import { BRANCHES } from "@/data/family/branches";
import type {
  Alert,
  Branch,
  Contribution,
  FamilyEvent,
  Member,
  Memory,
} from "@/types/workspace";

import { between, mulberry32 } from "@/lib/rng";

/* T-1 Command Center — page data (mock, deterministic). */

export const SHARE_UNIT_VALUE_KES = 1250;

export type RangeKey = "1M" | "3M" | "6M" | "1Y" | "ALL";

export const RANGES: Array<{ key: RangeKey; label: string; points: number }> = [
  { key: "1M", label: "1M", points: 5 },
  { key: "3M", label: "3M", points: 13 },
  { key: "6M", label: "6M", points: 26 },
  { key: "1Y", label: "1Y", points: 52 },
  { key: "ALL", label: "All", points: 104 },
];

export interface FinancePoint {
  label: string;
  inflow: number;
  outflow: number;
  balance: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildSeries(): FinancePoint[] {
  const rand = mulberry32(4242);
  const points: FinancePoint[] = [];
  let balance = 8_400_000;
  const start = Date.UTC(2024, 3, 8);
  for (let i = 0; i < 104; i++) {
    const inflow = between(rand, 420_000, 980_000);
    const outflow = between(rand, 260_000, 760_000) + (i % 13 === 12 ? 380_000 : 0);
    balance += inflow - outflow;
    const d = new Date(start + i * 7 * 86_400_000);
    points.push({
      label: `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
      inflow,
      outflow,
      balance,
    });
  }
  return points;
}

/** 104 weekly points ending in the current week (ALL). Ranges slice from the end. */
export const FINANCE_SERIES: FinancePoint[] = buildSeries();

export const BRANCH_SPARKS = BRANCHES.slice(0, 6).map((branch, index) => {
  const rand = mulberry32(900 + index);
  const series = Array.from({ length: 12 }, (_, k) => 200_000 + k * 15_000 + between(rand, -60_000, 90_000));
  return { branchId: branch.id, series, net: series[11] - series[10] };
});

export type ContributionStatus = "received" | "pending" | "quarantined";

export const LIVE_CONTRIBUTIONS: Array<{
  id: string;
  contributor: string;
  purpose: "Wedding" | "Medical" | "Funeral" | "Harambee" | "Project" | "Education";
  cause: string;
  amountKes: number;
  when: string;
  status: ContributionStatus;
}> = [
  { id: "NY-CON-2026-0412", contributor: "Peter Otieno Nalyanya", purpose: "Wedding", cause: "Caleb & Esther · Eldoret", amountKes: 25000, when: "12 min ago", status: "received" },
  { id: "NY-CON-2026-0411", contributor: "Naomi Achieng Nalyanya", purpose: "Medical", cause: "Mzee Victor · clinic fund", amountKes: 60000, when: "38 min ago", status: "received" },
  { id: "NY-CON-2026-0409", contributor: "Mercy Auma Nalyanya", purpose: "Harambee", cause: "Kimilili water project", amountKes: 5000, when: "1 h ago", status: "pending" },
  { id: "NY-CON-2026-0405", contributor: "Tom Mutua Okoth", purpose: "Education", cause: "Ethan's school fees", amountKes: 12000, when: "2 h ago", status: "received" },
  { id: "NY-CON-2026-0402", contributor: "Daniel Wafula Nalyanya", purpose: "Funeral", cause: "Kisumu · Grace's cousin", amountKes: 20000, when: "4 h ago", status: "received" },
  { id: "NY-CON-2026-0398", contributor: "Lynn Ruth Wakoli", purpose: "Project", cause: "Kitale dairy shed roof", amountKes: 15000, when: "yesterday", status: "quarantined" },
  { id: "NY-CON-2026-0396", contributor: "Caleb Kiprono Nalyanya", purpose: "Harambee", cause: "Kimilili water project", amountKes: 30000, when: "yesterday", status: "received" },
  { id: "NY-CON-2026-0391", contributor: "Hellen Nasimiyu Nalyanya", purpose: "Education", cause: "Nyeri bursary", amountKes: 8000, when: "2 days ago", status: "pending" },
];

export const ALERTS: Array<{
  id: string;
  tone: "warning" | "info" | "danger" | "success";
  critical: boolean;
  title: string;
  body: string;
  href: string;
  cta: string;
}> = [
  { id: "al-1", tone: "warning", critical: false, title: "3 contributions waiting for verification", body: "Two M-Pesa references and one cash receipt need a second look.", href: "/dashboard/contributions", cta: "Review contributions" },
  { id: "al-2", tone: "info", critical: false, title: "Chama “Wazee Round” rotates in 2 days", body: "Your turn is position 4 of 12 in the merry-go-round.", href: "/dashboard/finances", cta: "Open the chama" },
  { id: "al-3", tone: "danger", critical: true, title: "Loan NY-LON-2026-00088 is 2 days overdue", body: "Instalment of KES 18,400 is due. A reminder is queued (SIMULATED).", href: "/dashboard/loans", cta: "Open the loan" },
  { id: "al-4", tone: "warning", critical: false, title: "Ann Nekesa's receive link unused for 7 days", body: "Resend the link, or call to confirm the PIN is still remembered.", href: "/dashboard/finance-access", cta: "Resend link" },
  { id: "al-5", tone: "success", critical: false, title: "Broadcast “December reunion” reached 240 of 242", body: "Two numbers failed. Retrying is one tap away.", href: "/dashboard/communications", cta: "View delivery" },
];

export const UPCOMING_EVENTS: Array<{
  id: string;
  title: string;
  date: string;
  time: string;
  host: string;
  kind: string;
  rsvp: string;
  href: string;
}> = [
  { id: "EVT-2026-014", title: "Sunday devotion & family call", date: "Sun 10 May", time: "18:00 EAT", host: "Peter Otieno", kind: "Devotion", rsvp: "34 going", href: "/dashboard/events" },
  { id: "EVT-2026-016", title: "Caleb & Esther's kitchen committee", date: "Tue 12 May", time: "17:30 EAT", host: "Samuel Kipkoech", kind: "Wedding", rsvp: "12 going", href: "/dashboard/events" },
  { id: "EVT-2026-019", title: "Nairobi merry-go-round meeting", date: "Thu 14 May", time: "19:00 EAT", host: "Brian Otieno", kind: "Chama", rsvp: "9 going", href: "/dashboard/finances" },
  { id: "EVT-2026-021", title: "Kisumu clinic drive planning", date: "Sat 16 May", time: "10:00 EAT", host: "Grace Adhiambo", kind: "Foundation", rsvp: "21 going", href: "/dashboard/foundation" },
  { id: "EVT-2026-024", title: "Kimilili reunion committee", date: "Sun 24 May", time: "14:00 EAT", host: "Joseph Wafula", kind: "Reunion", rsvp: "58 going", href: "/dashboard/events" },
];

export const CALENDAR_WEEK: Array<{
  day: string;
  date: string;
  items: Array<{ kind: "chama" | "event" | "loan" | "deadline"; label: string; href: string }>;
}> = [
  { day: "Mon", date: "11", items: [{ kind: "deadline", label: "Contribution deadline · Harambee", href: "/dashboard/contributions" }] },
  { day: "Tue", date: "12", items: [{ kind: "event", label: "Wedding committee", href: "/dashboard/events" }] },
  { day: "Wed", date: "13", items: [{ kind: "chama", label: "Wazee Round payout", href: "/dashboard/finances" }, { kind: "loan", label: "Loan instalment due", href: "/dashboard/loans" }] },
  { day: "Thu", date: "14", items: [{ kind: "event", label: "Nairobi merry-go-round", href: "/dashboard/events" }] },
  { day: "Fri", date: "15", items: [] },
  { day: "Sat", date: "16", items: [{ kind: "event", label: "Kisumu clinic planning", href: "/dashboard/foundation" }] },
  { day: "Sun", date: "17", items: [{ kind: "deadline", label: "Sacco share purchase closes", href: "/dashboard/finances" }] },
];

export const INTEGRATIONS: Array<{ id: string; name: string; detail: string; lastSync: string }> = [
  { id: "mpesa", name: "M-Pesa Daraja", detail: "Contributions & payouts", lastSync: "2 min ago" },
  { id: "whatsapp", name: "WhatsApp Cloud", detail: "Broadcasts & receipts", lastSync: "7 min ago" },
  { id: "sms", name: "Africa's Talking SMS", detail: "OTP & reminders", lastSync: "11 min ago" },
  { id: "drive", name: "Google Drive", detail: "Gallery pulls", lastSync: "1 h ago" },
];

export const EVENTS_NEXT_30_DAYS = 11;

export const CHAMA = {
  name: "Wazee Round",
  cadence: "Fortnightly",
  pool: 480000,
  position: 4,
  of: 12,
  nextPayout: "Wed 13 May",
  recipient: "Peter Otieno Nalyanya",
};

/* ═══════════════════════════════════════════════════════════════════════
   WORKSPACE SNAPSHOT
   The shared, deterministic view of the family that every dashboard page
   reads from: branches, people, gatherings, memories, money and alerts.
   Kept beside the T-1 analytics series so the command centre and the
   module pages speak the same language.
   ═══════════════════════════════════════════════════════════════════════ */


export const family = {
  name: "Nalyanya Family",
  root: "Mzee Victor Wafula Nalyanya",
  members: 248,
  branches: 12,
  generations: 5,
  wallet: 8_420_000,
  shares: 1_250_000,
  loans: 3_180_000,
  contributions: 2_640_000,
};

export const branches: Branch[] = [
  { id: "nalyanya-main", name: "Nalyanya Main", members: 46, balance: 1_840_000, growth: 8.4, color: "#4fae86" },
  { id: "kimilili-joseph", name: "Kimilili · Joseph", members: 28, balance: 720_000, growth: 5.1, color: "#e0764a" },
  { id: "nairobi-peter", name: "Nairobi · Peter", members: 31, balance: 1_120_000, growth: 11.2, color: "#6fa8dc" },
  { id: "kakamega-samuel", name: "Kakamega · Samuel", members: 22, balance: 540_000, growth: 3.8, color: "#a284dc" },
  { id: "kitale-ruth", name: "Kitale · Ruth & the Wakolis", members: 26, balance: 690_000, growth: 6.7, color: "#d4a437" },
  { id: "kisumu-grace", name: "Kisumu · Grace", members: 19, balance: 410_000, growth: 4.4, color: "#4fc1b0" },
  { id: "mombasa-daniel", name: "Mombasa · Daniel", members: 17, balance: 380_000, growth: 2.9, color: "#d86b9b" },
  { id: "nyeri-hellen", name: "Nyeri · Hellen", members: 15, balance: 330_000, growth: 7.5, color: "#9bb85a" },
  { id: "diaspora-naomi", name: "Diaspora · Naomi", members: 12, balance: 620_000, growth: 13.6, color: "#c9a27a" },
  { id: "eldoret-caleb", name: "Eldoret · Caleb", members: 18, balance: 505_000, growth: 9.1, color: "#f09a4a" },
  { id: "nakuru-esther", name: "Nakuru · Esther", members: 8, balance: 245_000, growth: 1.8, color: "#7c8fb3" },
  { id: "kiambu-tom", name: "Kiambu · Tom", members: 6, balance: 115_000, growth: 0.9, color: "#7fbf7a" },
];

export const members: Member[] = [
  {
    id: "NY-MBR-00001",
    name: "Mzee Victor Wafula Nalyanya",
    short: "Mzee Victor",
    branch: "nalyanya-main",
    generation: 1,
    profession: "Retired headteacher (TSC)",
    bio: "Taught for thirty-eight years, raised five children on four acres in Kimilili, and still insists every Nalyanya has a chair at the family table.",
    image: "/images/family/mzee-victor.jpg",
  },
  {
    id: "NY-MBR-00002",
    name: "Esther Nanjala Nalyanya",
    short: "Esther",
    branch: "nalyanya-main",
    generation: 1,
    profession: "Farmer & market trader",
    bio: "Ran the Saturday market stall in Kimilili for thirty years. Her recipe book still lives in the kitchen drawer.",
    image: "/images/family/esther-matriarch.jpg",
  },
  {
    id: "NY-MBR-00003",
    name: "Joseph Wafula Nalyanya",
    short: "Joseph",
    branch: "kimilili-joseph",
    generation: 2,
    profession: "Civil engineer · rural roads",
    bio: "The eldest son builds roads for a living and still counts the rains in the Kimilili valley every season.",
    image: "/images/family/joseph.jpg",
  },
  {
    id: "NY-MBR-00005",
    name: "Peter Otieno Nalyanya",
    short: "Peter",
    branch: "nairobi-peter",
    generation: 2,
    profession: "Pharmacist · community health",
    bio: "Keeps the Nairobi branch connected and never misses the Sunday devotion call.",
    image: "/images/family/peter.jpg",
  },
  {
    id: "NY-MBR-00007",
    name: "Samuel Kipkoech Nalyanya",
    short: "Samuel",
    branch: "kakamega-samuel",
    generation: 2,
    profession: "Sugarcane farmer",
    bio: "Mentors the young farmers of Kakamega and chairs the harambee committee.",
    image: "/images/family/samuel.jpg",
  },
  {
    id: "NY-MBR-00009",
    name: "Ruth Wakoli Nalyanya",
    short: "Ruth",
    branch: "kitale-ruth",
    generation: 2,
    profession: "School headteacher",
    bio: "Runs three schools in Trans-Nzoia and keeps the Wakoli cousins in one spreadsheet.",
    image: "/images/family/ruth.jpg",
  },
  {
    id: "NY-MBR-00011",
    name: "Grace Adhiambo Nalyanya",
    short: "Grace",
    branch: "kisumu-grace",
    generation: 2,
    profession: "Registered nurse",
    bio: "Leads the Kisumu clinic drive and the family health outreach.",
    image: "/images/family/grace.jpg",
  },
  {
    id: "NY-MBR-00012",
    name: "Daniel Wafula Nalyanya",
    short: "Daniel",
    branch: "mombasa-daniel",
    generation: 3,
    profession: "Port logistics manager",
    bio: "Ships cargo for a living and organises the coastal reunion.",
    image: "/images/family/daniel.jpg",
  },
  {
    id: "NY-MBR-00013",
    name: "Hellen Nasimiyu Nalyanya",
    short: "Hellen",
    branch: "nyeri-hellen",
    generation: 3,
    profession: "Community health officer",
    bio: "Runs outreach clinics across Nyeri county and remembers every household.",
    image: "/images/family/hellen.jpg",
  },
  {
    id: "NY-MBR-00014",
    name: "Naomi Achieng Nalyanya",
    short: "Naomi",
    branch: "diaspora-naomi",
    generation: 3,
    profession: "Family finance lead (London)",
    bio: "Keeps the diaspora connected and the family ledger honest.",
    image: "/images/family/naomi.jpg",
  },
  {
    id: "NY-MBR-00019",
    name: "Brian Otieno Nalyanya",
    short: "Brian",
    branch: "nairobi-peter",
    generation: 3,
    profession: "Product designer",
    bio: "Family administrator for the Nalyanya workspace.",
    image: "/images/family/brian.jpg",
  },
  {
    id: "NY-MBR-00022",
    name: "Ethan Nalyanya",
    short: "Ethan",
    branch: "nairobi-peter",
    generation: 4,
    profession: "Scholar",
    bio: "The youngest of the family, and proud of it.",
    image: "/images/family/ethan.jpg",
  },
];

export const memories: Memory[] = [
  {
    id: "mem-1",
    title: "Golden hour on the homestead",
    image: "/images/golden-hour.webp",
    alt: "Warm evening light falling over the Kenyan countryside",
    caption: "The light we waited for after the last burial.",
    place: "Kimilili, Bungoma",
    year: "2019",
    credit: "Family album",
  },
  {
    id: "mem-2",
    title: "Under the reunion tent",
    image: "/images/reunion.webp",
    alt: "A family gathered under a large tent at a reunion",
    caption: "Everyone talking at once, as always.",
    place: "Bungoma",
    year: "2022",
    credit: "Joseph Otieno",
  },
  {
    id: "mem-3",
    title: "Grandparents in charge",
    image: "/images/grandparents.webp",
    alt: "Grandparents laughing with their grandchildren",
    caption: "The little ones always end up on their laps.",
    place: "Kitale",
    year: "2021",
    credit: "Ruth Wakoli",
  },
  {
    id: "mem-4",
    title: "The garden after rain",
    image: "/images/garden.webp",
    alt: "A green garden after a fall of rain",
    caption: "Mzee's last harvest.",
    place: "Kimilili",
    year: "2020",
    credit: "Family album",
  },
  {
    id: "mem-5",
    title: "A long table, short prayers",
    image: "/images/gathering.webp",
    alt: "Family sharing a long table together",
    caption: "Sunday lunch stretched to three hours.",
    place: "Nairobi",
    year: "2023",
    credit: "Peter Otieno",
  },
  {
    id: "mem-6",
    title: "Traditions passed on",
    image: "/images/traditions.webp",
    alt: "Traditional Kenyan attire and beadwork",
    caption: "Every generation learns the names.",
    place: "Kakamega",
    year: "2023",
    credit: "Samuel Kipkoech",
  },
];

export const events: FamilyEvent[] = [
  {
    id: "EVT-2026-014",
    title: "Sunday devotion & family call",
    date: "2026-05-10T18:00:00+03:00",
    place: "Nairobi family compound",
    host: "Peter Otieno",
    type: "Devotion",
    branch: "nairobi-peter",
    attending: 34,
    image: "/images/family/sunday-lunch.jpg",
    description: "Our weekly call, a hymn, and a word for every branch.",
  },
  {
    id: "EVT-2026-016",
    title: "Caleb & Esther's kitchen committee",
    date: "2026-05-12T17:30:00+03:00",
    place: "Eldoret dairy co-op hall",
    host: "Samuel Kipkoech",
    type: "Wedding",
    branch: "eldoret-caleb",
    attending: 12,
    image: "/images/family/wedding.jpg",
    description: "Final fittings, the guest list, and the argument about the cake.",
  },
  {
    id: "EVT-2026-019",
    title: "Nairobi merry-go-round meeting",
    date: "2026-05-14T19:00:00+03:00",
    place: "Kasarani community hall",
    host: "Brian Otieno",
    type: "Chama",
    branch: "nairobi-peter",
    attending: 9,
    image: "/images/family/meeting.jpg",
    description: "Rotation positions, the December pot, and the tea.",
  },
  {
    id: "EVT-2026-021",
    title: "Kisumu clinic drive planning",
    date: "2026-05-16T10:00:00+03:00",
    place: "Kondele community centre",
    host: "Grace Adhiambo",
    type: "Foundation",
    branch: "kisumu-grace",
    attending: 21,
    image: "/images/family/clinic.jpg",
    description: "Free checks, medicines, and a borrowed tent.",
  },
  {
    id: "EVT-2026-024",
    title: "Kimilili reunion committee",
    date: "2026-05-24T14:00:00+03:00",
    place: "Kimilili family compound",
    host: "Joseph Wafula",
    type: "Reunion",
    branch: "kimilili-joseph",
    attending: 58,
    image: "/images/family/reunion.jpg",
    description: "One tent, one long table, and the whole family in one place.",
  },
];

export const contributions: Contribution[] = [
  { id: "NY-CON-2026-0412", member: "Peter Otieno Nalyanya", purpose: "Wedding", amount: 25000, time: "12 min ago", status: "Recorded", branch: "eldoret-caleb" },
  { id: "NY-CON-2026-0411", member: "Naomi Achieng Nalyanya", purpose: "Medical", amount: 60000, time: "38 min ago", status: "Recorded", branch: "nairobi-peter" },
  { id: "NY-CON-2026-0409", member: "Mercy Auma Nalyanya", purpose: "Harambee", amount: 5000, time: "1 h ago", status: "Pending", branch: "kakamega-samuel" },
  { id: "NY-CON-2026-0405", member: "Tom Mutua Okoth", purpose: "Education", amount: 12000, time: "2 h ago", status: "Recorded", branch: "kiambu-tom" },
  { id: "NY-CON-2026-0402", member: "Daniel Wafula Nalyanya", purpose: "Funeral", amount: 20000, time: "4 h ago", status: "Recorded", branch: "mombasa-daniel" },
];

export const alerts: Alert[] = [
  { id: "al-1", title: "3 contributions waiting for verification", text: "Two M-Pesa references and one cash receipt need a second look.", kind: "contribution", time: "12 min ago" },
  { id: "al-2", title: "Chama “Wazee Round” rotates in 2 days", text: "Your turn is position 4 of 12 in the merry-go-round.", kind: "chama", time: "1 h ago" },
  { id: "al-3", title: "Loan NY-LON-2026-00088 is 2 days overdue", text: "Instalment of KES 18,400 is due. A reminder is queued (SIMULATED).", kind: "loan", time: "3 h ago", critical: true },
  { id: "al-4", title: "Ann Nekesa's receive link unused for 7 days", text: "Resend the link, or call to confirm the PIN is still remembered.", kind: "allocation", time: "yesterday" },
  { id: "al-5", title: "Reunion RSVP list closes on Friday", text: "58 going, 12 maybe, 6 pending.", kind: "event", time: "yesterday" },
];

export const chamas = [
  { id: "wazee", name: "Wazee Round", members: 12, pool: 480000, days: 2, cadence: "Fortnightly", position: 4, next: "Wed 13 May", recipient: "Peter Otieno Nalyanya" },
  { id: "umoja", name: "Umoja Round", members: 10, pool: 320000, days: 7, cadence: "Monthly", position: 2, next: "Mon 18 May", recipient: "Grace Adhiambo Nalyanya" },
  { id: "taifa", name: "Taifa Savings Circle", members: 15, pool: 615000, days: 12, cadence: "Fortnightly", position: 9, next: "Fri 22 May", recipient: "Caleb Kiprono Nalyanya" },
];

export const funds = [
  { id: "education", title: "Education fund", target: 1_200_000, raised: 745_000, purpose: "School fees, bursaries and the Nyeri bursary.", description: "Covers school fees, university bursaries and the annual Nyeri bursary for our young relatives." },
  { id: "homestead", title: "Homestead project", target: 3_000_000, raised: 1_180_000, purpose: "Roof, borehole and the second wing at Kimilili.", description: "The family compound at Kimilili: a new roof, a borehole, and a second wing for the visiting cousins." },
  { id: "welfare", title: "Family welfare", target: 600_000, raised: 512_000, purpose: "Illness, burials and the emergency bench.", description: "Health emergencies, burial support and the emergency bench that keeps a family afloat in a hard month." },
];

/** 36 monthly balance points (KES thousands) for the command-centre finance curve. */
export const financeHistory: number[] = Array.from({ length: 36 }, (_, i) => {
  const wave = Math.sin(i / 3.1) * 26 + Math.cos(i / 5.4) * 14;
  return Math.round(286 + i * 4.6 + wave);
});

/* ─── Formatting helpers used across the shell ─────────────────────────── */

/** "KES 245,000" — with a compact option for tight spaces. */
export function kes(value: number, options: { compact?: boolean } = {}): string {
  const abs = Math.abs(Math.round(value));
  if (options.compact && abs >= 1_000_000)
    return `KES ${(abs / 1_000_000).toFixed(1)}M`;
  if (options.compact && abs >= 1_000) return `KES ${Math.round(abs / 1_000)}K`;
  return `KES ${abs.toLocaleString("en-KE")}`;
}

/** "KES 1.2M" — for axis ticks and chips that have no room for the full amount. */
export function compact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `KES ${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `KES ${Math.round(abs / 1_000)}K`;
  return `KES ${Math.round(abs)}`;
}

/** A date formatted in Africa/Nairobi (EAT) with the browser's own locale. */
export function localDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    ...options,
  }).format(date);
}

/** An ISO timestamp `days` from today, used to seed forms with a future date. */
export function dateFromToday(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
