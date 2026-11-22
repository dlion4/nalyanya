"use client";

import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  CalendarDays,
  GraduationCap,
  Flower2,
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
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_NAV, NAV_GROUPS, type NavIcon } from "@/data/dashboard/navigation";
import { CURRENT_USER_ID } from "@/data/dashboard/lineage";
import { MEMBERS } from "@/data/family/people";
import { Avatar } from "@/components/ui/Primitives";
import { cn } from "@/lib/format";

const ICONS: Record<NavIcon, LucideIcon> = {
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

function BrandMark() {
  return (
    <span className="grid size-11 place-items-center rounded-2xl bg-brand-accent text-brand-deep shadow-gold" aria-hidden>
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5.8" r="2.3" />
        <circle cx="6.2" cy="14.6" r="2.1" />
        <circle cx="17.8" cy="14.6" r="2.1" />
        <circle cx="12" cy="19.6" r="1.6" />
        <path d="M12 8.1v4.1M12 12.2 7.6 13M12 12.2l4.4.8M12 17.9v-1.5" />
      </svg>
    </span>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const me = MEMBERS.find((m) => m.id === CURRENT_USER_ID);

  return (
    <div className="flex h-full flex-col text-white">
      <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-3 px-6 pt-7">
        <BrandMark />
        <span className="min-w-0">
          <span className="block font-display text-[1.35rem] font-semibold leading-none">Nalyanya</span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Family console</span>
        </span>
      </Link>

      <nav aria-label="Dashboard pages" className="ny-scroll mt-6 min-h-0 flex-1 overflow-y-auto px-3 pb-6">
        {NAV_GROUPS.map((group) => (
          <div key={group} className="mt-5 first:mt-2">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{group}</p>
            <ul className="mt-2 space-y-0.5">
              {DASHBOARD_NAV.filter((m) => m.group === group).map((m) => {
                const active = pathname === m.href;
                const Icon = ICONS[m.icon];
                return (
                  <li key={m.slug}>
                    <Link
                      href={m.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[0.9rem] font-medium transition duration-200",
                        active ? "bg-white/14 text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)]" : "text-white/75 hover:bg-white/8 hover:text-white",
                      )}
                    >
                      {active && <span aria-hidden className="absolute inset-y-2 left-0 w-1 rounded-full bg-brand-accent" />}
                      <Icon className={cn("size-[18px] shrink-0 transition", active ? "text-brand-accent" : "text-white/60 group-hover:text-brand-accent")} />
                      <span className="min-w-0 flex-1 truncate">{m.label}</span>
                      <span className="font-mono text-[10px] tracking-wide text-white/40">{m.code}</span>
                      {m.status === "queued" && <span className="sr-only">(queued build step)</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {me && (
        <div className="m-3 flex items-center gap-3 rounded-2xl border border-white/12 bg-white/8 p-3.5">
          <Avatar member={me} size={42} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{me.preferredName} Nalyanya</p>
            <p className="truncate text-xs text-white/60">Family Head · admin</p>
          </div>
        </div>
      )}
    </div>
  );
}
