import { BRANCHES } from "@/data/family/branches";
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
