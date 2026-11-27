/* Dashboard registry — the 16 family-console routes, grouped for the sidebar. */

export type NavGroup = "Command" | "Family" | "Money" | "People & records" | "Account";

export type NavIcon =
  | "LayoutDashboard"
  | "TreeDeciduous"
  | "Users"
  | "CalendarDays"
  | "Images"
  | "Flower2"
  | "HandCoins"
  | "Wallet"
  | "KeyRound"
  | "Landmark"
  | "GraduationCap"
  | "ScrollText"
  | "Briefcase"
  | "Megaphone"
  | "UserRound"
  | "Settings";

export interface ModuleSpec {
  code: string;
  slug: string;
  href: string;
  label: string;
  group: NavGroup;
  icon: NavIcon;
  status: "live" | "queued";
  purpose: string;
  image: string;
  accent: string;
  sections: string[];
  integrations: string[];
}

export const NAV_GROUPS: NavGroup[] = ["Command", "Family", "Money", "People & records", "Account"];

export const DASHBOARD_NAV: ModuleSpec[] = [
  {
    code: "T-1", slug: "command-center", href: "/dashboard", label: "Command Center", group: "Command", icon: "LayoutDashboard", status: "live",
    purpose: "The family cockpit: portfolio state, chama rounds, contributions, alerts and quick finance actions in one screen.",
    image: "/images/family/reunion.jpg", accent: "#D4A437",
    sections: ["Status ribbon", "KPI row", "Finance curve", "Live contributions", "Mini 3D lineage", "Alerts & actions", "Events & calendar"],
    integrations: ["M-Pesa", "WhatsApp", "SMS", "Google Drive"],
  },
  {
    code: "T-2", slug: "lineage", href: "/dashboard/lineage", label: "Lineage", group: "Family", icon: "TreeDeciduous", status: "live",
    purpose: "A living 3D family tree rooted at Mzee Victor Nalyanya. Orbit, dolly into a branch, and see exactly where you sit.",
    image: "/images/family/elgon.jpg", accent: "#4FAE86",
    sections: ["Header & root card", "Control rail", "3D canvas", "Member inspector", "Where am I?", "Branches overview", "Audit & requests"],
    integrations: [],
  },
  {
    code: "T-3", slug: "members", href: "/dashboard/members", label: "Members", group: "Family", icon: "Users", status: "live",
    purpose: "The searchable list of every member across branches, the table companion to the 3D tree.",
    image: "/images/family/reunion-attire.jpg", accent: "#E0764A",
    sections: ["KPI row", "Filter bar & view toggle", "Members table", "Member detail drawer", "Add member wizard", "Roles & access", "Requests queue"],
    integrations: [],
  },
  {
    code: "T-4", slug: "events", href: "/dashboard/events", label: "Events", group: "Family", icon: "CalendarDays", status: "live",
    purpose: "Plan and run family events: weddings, funerals, birthdays, graduations, reunions and harambees.",
    image: "/images/family/wedding.jpg", accent: "#A284DC",
    sections: ["KPI row", "Calendar (month · week · list)", "Events table", "Event detail drawer", "Event builder wizard", "Invites & reminders", "Past events archive"],
    integrations: ["WhatsApp", "SMS"],
  },
  {
    code: "T-5", slug: "gallery", href: "/dashboard/gallery", label: "Gallery", group: "Family", icon: "Images", status: "live",
    purpose: "Every family photo, organised by album, event and year. Google Drive pulls arrive in Phase 2.",
    image: "/images/family/album.jpg", accent: "#4FC1B0",
    sections: ["KPI row", "Drive source connector", "Album chips & filters", "Masonry grid", "Upload wizard", "Albums manager", "Trash & audit"],
    integrations: ["Google Drive"],
  },
  {
    code: "T-6", slug: "obituaries", href: "/dashboard/obituaries", label: "Obituaries", group: "Family", icon: "Flower2", status: "live",
    purpose: "Honour the departed: notices, life stories, funeral details and condolences, handled with dignity.",
    image: "/images/family/elder-stick.jpg", accent: "#7C8FB3",
    sections: ["In memoriam header", "Obituary cards", "Obituary detail drawer", "New obituary wizard", "Condolence wall", "Anniversary reminders", "Archive"],
    integrations: ["SMS"],
  },
  {
    code: "T-7", slug: "contributions", href: "/dashboard/contributions", label: "Contributions", group: "Money", icon: "HandCoins", status: "live",
    purpose: "The family's giving hub: contribute to weddings, sickness, funerals, harambees and community projects.",
    image: "/images/family/sunday-lunch.jpg", accent: "#D17A22",
    sections: ["KPI row", "Causes grid", "Contribute wizard", "Contributions table", "Cause detail drawer", "Create cause wizard", "Payout & reconciliation"],
    integrations: ["M-Pesa"],
  },
  {
    code: "T-8", slug: "finances", href: "/dashboard/finances", label: "Finances", group: "Money", icon: "Wallet", status: "live",
    purpose: "The collective money engine: chama, merry-go-round and the family Sacco with shares that unlock loans.",
    image: "/images/family/tea-hills.jpg", accent: "#2A9D8F",
    sections: ["Finance KPI row", "Chama & merry-go-round", "Sacco panel", "Transactions table", "Chama detail drawer", "Create chama wizard", "Governance & audit"],
    integrations: ["M-Pesa"],
  },
  {
    code: "T-9", slug: "finance-access", href: "/dashboard/finance-access", label: "Finance Access", group: "Money", icon: "KeyRound", status: "queued",
    purpose: "Allocate money to members and send no-login receive links that elders can open on any phone with a PIN and OTP.",
    image: "/images/family/hands-album.jpg", accent: "#6A4C93",
    sections: ["KPI row", "Allocations table & create", "Receive-link panel", "Elder preview (phone mockup)", "Link health & status", "Rules & limits (2FA)", "Audit"],
    integrations: ["M-Pesa", "SMS"],
  },
  {
    code: "T-10", slug: "loans", href: "/dashboard/loans", label: "Loans", group: "Money", icon: "Landmark", status: "queued",
    purpose: "Loans for individuals and families: short-term, long-term and salary advances, with clear repayment schedules.",
    image: "/images/family/elgon.jpg", accent: "#B5532A",
    sections: ["Loans KPI row", "Loan products grid", "Application wizard", "Loans table", "Loan detail drawer", "Repayment & collections", "Governance & audit"],
    integrations: ["M-Pesa"],
  },
  {
    code: "T-11", slug: "foundation", href: "/dashboard/foundation", label: "Foundation", group: "Money", icon: "GraduationCap", status: "queued",
    purpose: "The Nalyanya Foundation: scholarships, medical bills, emergency relief and community charity.",
    image: "/images/family/grandparents.jpg", accent: "#3A7CA5",
    sections: ["KPI row", "Pillars: education · medical · emergency", "Active grants grid", "Grant detail drawer", "Application intake wizard", "Disbursement & reconciliation", "Governance & transparency"],
    integrations: ["M-Pesa", "Bank EFT"],
  },
  {
    code: "T-12", slug: "records", href: "/dashboard/records", label: "Records", group: "People & records", icon: "ScrollText", status: "queued",
    purpose: "The system of record: every family money event, attributed, reconciled and exportable.",
    image: "/images/family/archive.jpg", accent: "#8C6A3F",
    sections: ["KPI row", "Unified history table", "Analytics charts", "Attribution analytics", "Reconciliation (simulated)", "Export center", "Journal & notes"],
    integrations: [],
  },
  {
    code: "T-13", slug: "professions", href: "/dashboard/professions", label: "Professions", group: "People & records", icon: "Briefcase", status: "queued",
    purpose: "A directory of family members and trusted family friends who offer services, with vetting and endorsements.",
    image: "/images/family/faith.jpg", accent: "#5B8C5A",
    sections: ["KPI row", "Filter bar", "Directory table", "Profile drawer", "Add listing wizard", "Endorsements & reviews", "Categories manager"],
    integrations: ["WhatsApp"],
  },
  {
    code: "T-14", slug: "communications", href: "/dashboard/communications", label: "Communications", group: "People & records", icon: "Megaphone", status: "queued",
    purpose: "When something must reach everyone at once: one compose, routed to SMS, WhatsApp, email and in-app.",
    image: "/images/family/reunion.jpg", accent: "#D86B9B",
    sections: ["KPI row", "Broadcast composer", "Broadcasts table", "Broadcast detail drawer", "1:1 messages (simulated)", "Templates & quick send", "Quiet hours & rate limits"],
    integrations: ["WhatsApp", "SMS", "Email"],
  },
  {
    code: "T-15", slug: "account", href: "/dashboard/account", label: "Account", group: "Account", icon: "UserRound", status: "queued",
    purpose: "Your identity and money-routing profile. Payout number changes go through admin approval, never silently.",
    image: "/images/family/brian.jpg", accent: "#1F4D3A",
    sections: ["Profile", "Contact & money routing (admin-gated)", "Security: password & 2FA", "Preferences: Elder Mode & currency", "Finance profile", "My change requests", "Data & privacy"],
    integrations: [],
  },
  {
    code: "T-16", slug: "settings", href: "/dashboard/settings", label: "Settings", group: "Account", icon: "Settings", status: "queued",
    purpose: "Master-admin configuration: security policy, roles, integrations, automation and feature flags.",
    image: "/images/family/sunday-lunch.jpg", accent: "#4B6584",
    sections: ["Family profile & governance", "Roles, RBAC & approvals", "Integrations & credentials (vault)", "Automation & scheduling", "Appearance, accessibility & locale", "Data & privacy", "Feature flags, webhooks & audit"],
    integrations: ["M-Pesa", "WhatsApp", "SMS", "Google Drive"],
  },
];

export function moduleBySlug(slug: string): ModuleSpec | undefined {
  return DASHBOARD_NAV.find((m) => m.slug === slug);
}

/* ─────────────────────────────────────────────────────────────────────
   Shell navigation — the icon set and route helpers the dashboard
   chrome (sidebar · top bar · search) reads from.
   ───────────────────────────────────────────────────────────────────── */

import {
  Briefcase,
  CalendarDays,
  Flower2,
  GraduationCap,
  HandCoins,
  Images,
  KeyRound,
  Landmark,
  LayoutDashboard,
  Megaphone,
  ScrollText,
  Settings,
  TreeDeciduous,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  slug: string;
  code: string;
  icon: LucideIcon;
}

const NAV_ICONS: Record<NavIcon, LucideIcon> = {
  LayoutDashboard,
  TreeDeciduous,
  Users,
  CalendarDays,
  Images,
  Flower2,
  HandCoins,
  Wallet,
  KeyRound,
  Landmark,
  GraduationCap,
  ScrollText,
  Briefcase,
  Megaphone,
  UserRound,
  Settings,
};

/** Every dashboard module as a sidebar row. */
export const allNav: NavItem[] = DASHBOARD_NAV.map((module) => ({
  label: module.label,
  slug: module.slug,
  code: module.code,
  icon: NAV_ICONS[module.icon],
}));

/** The route a module slug lives at. */
export function dashPath(slug: string): string {
  return slug === "command-center" ? "/dashboard" : `/dashboard/${slug}`;
}

/** Sidebar groups, in reading order. */
export const navGroups: Array<{ title: string; items: NavItem[] }> =
  NAV_GROUPS.map((group) => ({
    title: group,
    items: allNav.filter((item) => {
      const module = DASHBOARD_NAV.find((m) => m.slug === item.slug);
      return module?.group === group;
    }),
  }));

/** Utility routes tucked behind "More tools" — empty until a page ships them. */
export const extraNav: NavItem[] = [];
