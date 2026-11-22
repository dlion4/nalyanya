import {
  LayoutDashboard,
  Network,
  UsersRound,
  CalendarDays,
  Images,
  HandCoins,
  Wallet,
  Landmark,
  ArrowLeftRight,
  HeartHandshake,
  Megaphone,
  BriefcaseBusiness,
  ScrollText,
  Flower2,
  Settings2,
  CircleUserRound,
  type LucideIcon,
} from "lucide-react";
export type NavItem = { label: string; slug: string; icon: LucideIcon };
export const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { label: "Command center", slug: "", icon: LayoutDashboard },
      { label: "Family tree", slug: "lineage", icon: Network },
      { label: "Family members", slug: "members", icon: UsersRound },
      { label: "Events & gatherings", slug: "events", icon: CalendarDays },
      { label: "Memory gallery", slug: "gallery", icon: Images },
    ],
  },
  {
    title: "Family finance",
    items: [
      { label: "Contributions", slug: "contributions", icon: HandCoins },
      { label: "Chama & Sacco", slug: "finances", icon: Wallet },
      { label: "Family loans", slug: "loans", icon: Landmark },
      { label: "Allocations", slug: "finance-access", icon: ArrowLeftRight },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "Foundation", slug: "foundation", icon: HeartHandshake },
      { label: "Communications", slug: "communications", icon: Megaphone },
    ],
  },
];
export const extraNav: NavItem[] = [
  { label: "Family professions", slug: "professions", icon: BriefcaseBusiness },
  { label: "In remembrance", slug: "obituaries", icon: Flower2 },
  { label: "Family records", slug: "records", icon: ScrollText },
  { label: "My account", slug: "account", icon: CircleUserRound },
  { label: "Settings", slug: "settings", icon: Settings2 },
];
export const allNav = [...navGroups.flatMap((g) => g.items), ...extraNav];
export const dashPath = (slug: string) =>
  slug ? `/dashboard/${slug}` : "/dashboard";
