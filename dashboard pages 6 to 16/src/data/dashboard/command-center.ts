/* T-1 Command Center mock data — dashboard shell, context switcher, notifications.
   Frontend-only Phase 1: local typed data, zero network. */

export type NavItem = {
  label: string;
  href: string;
  code: string;
};

export type NavGroup = {
  group: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { label: "Command center", href: "/dashboard", code: "T-1" },
      { label: "Lineage tree", href: "/dashboard/lineage", code: "T-2" },
      { label: "Members", href: "/dashboard/members", code: "T-3" },
    ],
  },
  {
    group: "Family life",
    items: [
      { label: "Events", href: "/dashboard/events", code: "T-4" },
      { label: "Gallery", href: "/dashboard/gallery", code: "T-5" },
      { label: "Obituaries", href: "/dashboard/obituaries", code: "T-6" },
      { label: "Professions", href: "/dashboard/professions", code: "T-13" },
    ],
  },
  {
    group: "Money",
    items: [
      { label: "Contributions", href: "/dashboard/contributions", code: "T-7" },
      { label: "Chama & Sacco", href: "/dashboard/finances", code: "T-8" },
      { label: "Finance access", href: "/dashboard/finance-access", code: "T-9" },
      { label: "Loans", href: "/dashboard/loans", code: "T-10" },
      { label: "Foundation", href: "/dashboard/foundation", code: "T-11" },
    ],
  },
  {
    group: "Admin",
    items: [
      { label: "Records", href: "/dashboard/records", code: "T-12" },
      { label: "Communications", href: "/dashboard/communications", code: "T-14" },
      { label: "Account", href: "/dashboard/account", code: "T-15" },
      { label: "Settings", href: "/dashboard/settings", code: "T-16" },
    ],
  },
];

export type FamilyContext = {
  id: string;
  label: string;
  scope: string;
  members: number;
};

export const familyContexts: FamilyContext[] = [
  { id: "all", label: "Nalyanya family", scope: "All 12 branches · 243 members", members: 243 },
  { id: "bungoma", label: "Bungoma branch", scope: "Western Kenya · 61 members", members: 61 },
  { id: "nairobi", label: "Nairobi branch", scope: "Nairobi & Kiambu · 54 members", members: 54 },
  { id: "trans-nzoia", label: "Trans-Nzoia branch", scope: "Kitale · 38 members", members: 38 },
  { id: "diaspora", label: "Diaspora", scope: "Canada · UK · 22 members", members: 22 },
];

export type AppNotification = {
  id: string;
  kind: "money" | "lineage" | "event" | "system";
  title: string;
  body: string;
  at: string;
  unread: boolean;
  href: string;
};

export const notifications: AppNotification[] = [
  {
    id: "n1",
    kind: "money",
    title: "Contribution confirmed",
    body: "KES 12,000 from Faith Chebet Nalyanya → School fees for Brian Jr.",
    at: "4 min ago",
    unread: true,
    href: "/dashboard/contributions",
  },
  {
    id: "n2",
    kind: "money",
    title: "Payout ready to release",
    body: "Cause NY-CON-2025-00431 met 100% of its goal — organizer awaits KES 180,000.",
    at: "26 min ago",
    unread: true,
    href: "/dashboard/contributions",
  },
  {
    id: "n3",
    kind: "event",
    title: "Harambee RSVP closing",
    body: "Nalyanya reunion harambee closes Friday 18:00 EAT — 96 of 240 replied.",
    at: "1 hr ago",
    unread: true,
    href: "/dashboard/events",
  },
  {
    id: "n4",
    kind: "lineage",
    title: "Lineage edit requested",
    body: "Joseph Nyongesa Nalyanya proposed a birth-year correction on gen-4.",
    at: "3 hrs ago",
    unread: false,
    href: "/dashboard/lineage",
  },
  {
    id: "n5",
    kind: "system",
    title: "SIMULATED rail",
    body: "M-Pesa Daraja adapter is frontend-only in Phase 1 — every send resolves SIMULATED.",
    at: "Yesterday",
    unread: false,
    href: "/dashboard/settings",
  },
  {
    id: "n6",
    kind: "money",
    title: "Loan instalment posted",
    body: "KES 8,500 from Dennis Barasa Nalyanya cleared instalment 4 of 12 (NY-LON-2025-00118).",
    at: "Yesterday",
    unread: false,
    href: "/dashboard/loans",
  },
];

export const shellKpis = [
  { label: "Family members", value: 243, suffix: "", hint: "12 branches · 5 generations" },
  { label: "Active causes", value: 6, suffix: "", hint: "2 closing this week" },
  { label: "Raised this month", value: 486500, prefix: "KES ", hint: "184 contributions" },
  { label: "Awaiting verification", value: 3, suffix: "", hint: "finance officer queue" },
];

export const activityFeed = [
  { at: "09:12", text: "Grace Kwamboka Nalyanya contributed KES 5,000 to Clinic bills — Mama Ruth", tone: "gold" },
  { at: "08:47", text: "Payout NY-PAY-2025-0077 released (SIMULATED) to KCB ····4471", tone: "green" },
  { at: "08:05", text: "New cause published: Borehole at Musanda social hall", tone: "plain" },
  { at: "Yest.", text: "Reconciliation exception resolved — duplicate STK ref RKX7H8KP2", tone: "red" },
];
