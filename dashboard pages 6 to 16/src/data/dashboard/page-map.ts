/* Dashboard route map — every T-page ships with real section index + KPIs so
   no route is a dead end while pages land one per turn (T-7 is fully built). */

export type PageKpi = { label: string; value: string; hint: string };

export type DashboardPageMeta = {
  slug: string;
  code: string;
  title: string;
  tagline: string;
  icon: string;
  accent: "brand" | "gold" | "terra" | "violet" | "ocean";
  kpis: PageKpi[];
  sections: string[];
  built: boolean;
};

export const dashboardPages: DashboardPageMeta[] = [
  {
    slug: "lineage",
    code: "T-2",
    title: "Lineage · 3D family tree",
    tagline: "Walk every branch and generation in 3D — find where you belong.",
    icon: "git-fork",
    accent: "gold",
    kpis: [
      { label: "Members", value: "243", hint: "12 branches" },
      { label: "Generations", value: "5", hint: "root → newest grandchild" },
      { label: "Relations", value: "618", hint: "parent · spouse · sibling · ward" },
      { label: "Edit requests", value: "2", hint: "awaiting admin approval" },
    ],
    sections: ["S1 · KPI row", "S2 · 3D tree canvas + camera rig", "S3 · Search & where-am-I", "S4 · Member preview drawer", "S5 · Add member / relation wizard", "S6 · Deceased & adopted visuals", "S7 · Edit-request queue"],
    built: false,
  },
  {
    slug: "members",
    code: "T-3",
    title: "Members directory",
    tagline: "Every person in the family, filterable by branch, role and generation.",
    icon: "users",
    accent: "brand",
    kpis: [
      { label: "Members", value: "243", hint: "141 adults · 102 minors" },
      { label: "Branches", value: "12", hint: "5 counties + diaspora" },
      { label: "Elders", value: "17", hint: "Elder Mode enabled" },
      { label: "Profiles incomplete", value: "9", hint: "missing birth year" },
    ],
    sections: ["S1 · KPI row", "S2 · Member grid + filters", "S3 · Member detail drawer", "S4 · Add member wizard", "S5 · Role & RBAC matrix", "S6 · Change-request queue", "S7 · Export CSV"],
    built: false,
  },
  {
    slug: "events",
    code: "T-4",
    title: "Events & activities",
    tagline: "Reunions, harambees, weddings and remembrance — RSVPs in one place.",
    icon: "calendar-days",
    accent: "terra",
    kpis: [
      { label: "Upcoming", value: "7", hint: "next: reunion 21 Mar" },
      { label: "RSVPs in", value: "96", hint: "of 240 invited" },
      { label: "Reminders queued", value: "4", hint: "E-2d and E-1h" },
      { label: "Albums linked", value: "11", hint: "→ T-5 gallery" },
    ],
    sections: ["S1 · KPI row", "S2 · Timeline of events", "S3 · Event detail drawer", "S4 · Create event wizard", "S5 · RSVP board", "S6 · Reminders & broadcast", "S7 · Calendar export (.ics)"],
    built: false,
  },
  {
    slug: "gallery",
    code: "T-5",
    title: "Gallery",
    tagline: "Family photographs pulled from Google Drive — Phase 2, mock frames now.",
    icon: "images",
    accent: "gold",
    kpis: [
      { label: "Photos", value: "1,284", hint: "18 albums" },
      { label: "Drive folders", value: "3", hint: "SIMULATED connector" },
      { label: "This year", value: "212", hint: "uploads" },
      { label: "Untagged", value: "64", hint: "needs who's-who" },
    ],
    sections: ["S1 · KPI row", "S2 · Album contact sheet", "S3 · Lightbox + shutter transitions", "S4 · Drive connector form", "S5 · Tag people", "S6 · Download / share", "S7 · Upload queue"],
    built: false,
  },
  {
    slug: "obituaries",
    code: "T-6",
    title: "Obituaries",
    tagline: "Remembering those who came before — notices, tributes and the family tree.",
    icon: "flower-2",
    accent: "violet",
    kpis: [
      { label: "Memorials", value: "23", hint: "since 1961" },
      { label: "Tributes", value: "187", hint: "41 this year" },
      { label: "Anniversaries", value: "3", hint: "this month" },
      { label: "Pending review", value: "1", hint: "family head" },
    ],
    sections: ["S1 · KPI row", "S2 · Memorial cards", "S3 · Memorial detail drawer", "S4 · Post tribute", "S5 · Tree linkage", "S6 · Broadcast notice", "S7 · Archive by year"],
    built: false,
  },
  {
    slug: "finances",
    code: "T-8",
    title: "Chama · Merry-go-round · Sacco",
    tagline: "The family's collective money engine — shares unlock loans.",
    icon: "landmark",
    accent: "brand",
    kpis: [
      { label: "Sacco pool", value: "KES 4.2M", hint: "+6% this quarter" },
      { label: "Your shares", value: "120", hint: "value KES 144,000" },
      { label: "Active chamas", value: "4", hint: "1 rotating now" },
      { label: "Eligible to borrow", value: "KES 432K", hint: "3× shares" },
    ],
    sections: ["S1 · KPI row", "S2 · Chama & M-G-R panel", "S3 · Sacco share engine", "S4 · Transactions table", "S5 · Chama detail drawer", "S6 · Create chama wizard", "S7 · Governance & audit"],
    built: false,
  },
  {
    slug: "finance-access",
    code: "T-9",
    title: "Allocations & elder receive links",
    tagline: "Send an elder money with a no-login PIN + OTP link — no app needed.",
    icon: "link-2",
    accent: "gold",
    kpis: [
      { label: "Available to allocate", value: "KES 250K", hint: "your ceiling" },
      { label: "Active links", value: "5", hint: "awaiting PIN" },
      { label: "Settled today", value: "2", hint: "KES 34,000" },
      { label: "Expired 7d", value: "1", hint: "auto-expired" },
    ],
    sections: ["S1 · KPI row", "S2 · Allocations table", "S3 · Receive-link panel", "S4 · Live elder phone preview", "S5 · Link health", "S6 · Rules & limits", "S7 · Audit"],
    built: false,
  },
  {
    slug: "loans",
    code: "T-10",
    title: "Loans",
    tagline: "Salary advances, emergency and school loans — eligibility from Sacco shares.",
    icon: "hand-coins",
    accent: "ocean",
    kpis: [
      { label: "Active loans", value: "12", hint: "KES 1.4M outstanding" },
      { label: "Overdue", value: "1", hint: "6 days · grace ended" },
      { label: "Your eligible amount", value: "KES 432K", hint: "3× shares" },
      { label: "Collected this month", value: "KES 102K", hint: "84 on time" },
    ],
    sections: ["S1 · KPI row", "S2 · Loan board", "S3 · Apply wizard", "S4 · Amortization drawer", "S5 · Approve (2FA) & disburse", "S6 · Repay & restructure", "S7 · Guarantors & audit"],
    built: false,
  },
  {
    slug: "foundation",
    code: "T-11",
    title: "Nalyanya Foundation",
    tagline: "Academic and medical charity from the family's pooled giving.",
    icon: "heart-handshake",
    accent: "violet",
    kpis: [
      { label: "Grant pool", value: "KES 1.8M", hint: "since 2021" },
      { label: "Awards", value: "34", hint: "19 schools · 15 hospitals" },
      { label: "Open applications", value: "6", hint: "closes 31 Dec" },
      { label: "Beneficiaries", value: "1,102", hint: "students + patients" },
    ],
    sections: ["S1 · KPI row", "S2 · Pillars", "S3 · Grant applications", "S4 · Award wizard (2FA)", "S5 · Disbursement records", "S6 · Impact stories", "S7 · Audit"],
    built: false,
  },
  {
    slug: "records",
    code: "T-12",
    title: "Records & analytics",
    tagline: "One ledger, every shilling reconciled — exports, exceptions, anomaly hints.",
    icon: "file-spreadsheet",
    accent: "brand",
    kpis: [
      { label: "Ledger entries", value: "8,412", hint: "double-entry, balanced" },
      { label: "Open exceptions", value: "3", hint: "1 duplicate · 2 mismatch" },
      { label: "Exports queued", value: "2", hint: "CSV · PDF" },
      { label: "Balance check", value: "Balanced", hint: "debits = credits" },
    ],
    sections: ["S1 · KPI row", "S2 · Unified transactions", "S3 · Ledger inspector", "S4 · Reconciliation", "S5 · Exceptions queue", "S6 · Exports", "S7 · Anomaly hints"],
    built: false,
  },
  {
    slug: "professions",
    code: "T-13",
    title: "Professions & expertise",
    tagline: "Who in the family (and circle) does what — find a doctor, lawyer, boda pilot.",
    icon: "briefcase-business",
    accent: "terra",
    kpis: [
      { label: "Listed", value: "148", hint: "family + friends" },
      { label: "Professions", value: "37", hint: "health · law · build · tech" },
      { label: "Diaspora", value: "22", hint: "Canada · UK" },
      { label: "Open to work", value: "41", hint: "opt-in" },
    ],
    sections: ["S1 · KPI row", "S2 · Directory grid", "S3 · Profile drawer", "S4 · Add listing", "S5 · Search & filters", "S6 · Endorsements", "S7 · Export"],
    built: false,
  },
  {
    slug: "communications",
    code: "T-14",
    title: "Broadcasts",
    tagline: "One composer, four rails — WhatsApp, SMS, email and in-app.",
    icon: "megaphone",
    accent: "ocean",
    kpis: [
      { label: "Sent this month", value: "18", hint: "243 max recipients" },
      { label: "Delivered", value: "99.2%", hint: "SIMULATED receipts" },
      { label: "Templates", value: "7", hint: "RSVP · harambee · notice" },
      { label: "SMS budget left", value: "KES 1,840", hint: "daily cap guard" },
    ],
    sections: ["S1 · KPI row", "S2 · Composer", "S3 · Audience resolver", "S4 · Cost preview", "S5 · Send (SIMULATED fanout)", "S6 · Delivery receipts", "S7 · Templates & quiet hours"],
    built: false,
  },
  {
    slug: "account",
    code: "T-15",
    title: "Account",
    tagline: "Your profile — money-routing fields are admin-gated by design.",
    icon: "circle-user-round",
    accent: "brand",
    kpis: [
      { label: "Profile", value: "92%", hint: "missing: birth certificate" },
      { label: "Change requests", value: "1", hint: "mobile number · pending" },
      { label: "Sessions", value: "3", hint: "Nairobi · Kitale · London" },
      { label: "2FA", value: "On", hint: "TOTP + receive PIN" },
    ],
    sections: ["S1 · KPI row", "S2 · Profile editor", "S3 · Admin-gated fields", "S4 · Change-request wizard", "S5 · Security", "S6 · Devices", "S7 · Sessions & audit"],
    built: false,
  },
  {
    slug: "settings",
    code: "T-16",
    title: "Settings",
    tagline: "Master-admin config: caps, RBAC matrix, integrations and webhook docs.",
    icon: "settings-2",
    accent: "gold",
    kpis: [
      { label: "Integrations", value: "7", hint: "all SIMULATED · Phase 2" },
      { label: "Roles", value: "6", hint: "RBAC matrix" },
      { label: "Per-tx cap", value: "KES 50,000", hint: "2FA above" },
      { label: "Audit entries", value: "8,412", hint: "append-only" },
    ],
    sections: ["S1 · KPI row", "S2 · Family profile", "S3 · Integration matrix", "S4 · Caps & limits (2FA)", "S5 · RBAC matrix", "S6 · API & webhooks", "S7 · Audit export"],
    built: false,
  },
];

export const pageBySlug = (slug: string) => dashboardPages.find((p) => p.slug === slug);
