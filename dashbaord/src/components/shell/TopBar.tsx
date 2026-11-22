"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Popover,
  PopoverButton,
  PopoverPanel,
  Switch,
} from "@headlessui/react";
import { ArrowRight, Bell, Check, ChevronDown, LogOut, Menu as MenuIcon, Settings, UserRound, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRANCHES } from "@/data/family/branches";
import { MEMBERS } from "@/data/family/people";
import { CURRENT_USER_ID } from "@/data/dashboard/lineage";
import { ALERTS } from "@/data/dashboard/command-center";
import { DASHBOARD_NAV } from "@/data/dashboard/navigation";
import { Avatar } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { usePrefs } from "@/components/shell/PrefsProvider";
import { cn } from "@/lib/format";

const QUICK_ACTIONS = [
  { label: "Deposit to the chama", href: "/dashboard/finances" },
  { label: "Withdraw from the Sacco", href: "/dashboard/finances" },
  { label: "Transfer between wallets", href: "/dashboard/finances" },
  { label: "Send an elder receive link", href: "/dashboard/finance-access" },
  { label: "New family broadcast", href: "/dashboard/communications" },
  { label: "Create a family event", href: "/dashboard/events" },
];

export function TopBar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const { elder, setElder, branchContext, setBranchContext } = usePrefs();
  const { notify } = useToast();
  const moduleLabel = DASHBOARD_NAV.find((m) => m.href === pathname)?.label ?? "Dashboard";
  const me = MEMBERS.find((m) => m.id === CURRENT_USER_ID);

  const branchOptions = [
    { id: "all", label: "All branches" },
    ...BRANCHES.map((b) => ({ id: b.id, label: b.name })),
  ];
  const currentBranch = branchOptions.find((o) => o.id === branchContext) ?? branchOptions[0];

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-surface-0/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center gap-2.5 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open navigation"
          className="ny-btn ny-btn-ghost ny-btn-sm size-10 shrink-0 p-0 xl:hidden"
        >
          <MenuIcon className="size-4" />
        </button>

        <div className="hidden min-w-0 items-center gap-2 text-sm text-text-secondary md:flex">
          <span className="font-display text-base font-semibold text-text-primary">Nalyanya</span>
          <span aria-hidden className="text-text-tertiary">/</span>
          <span className="truncate">{moduleLabel}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Family / branch context */}
          <Listbox
            value={branchContext}
            onChange={(id: string) => {
              setBranchContext(id);
              const picked = branchOptions.find((o) => o.id === id);
              notify({ title: "Family context switched", body: `Showing ${picked?.label ?? "all branches"}.`, tone: "info" });
            }}
          >
            <ListboxButton
              aria-label="Family and branch context"
              className="ny-chip h-10 max-w-[13rem] gap-2 px-3.5 text-sm font-semibold text-text-primary"
            >
              <span className="size-2 rounded-full bg-brand-accent" aria-hidden />
              <span className="truncate">Nalyanya · {currentBranch.label}</span>
              <ChevronDown className="size-3.5 shrink-0 text-text-tertiary" aria-hidden />
            </ListboxButton>
            <ListboxOptions
              anchor="bottom end"
              className="z-50 mt-2 max-h-80 w-72 overflow-y-auto rounded-2xl border border-hairline bg-surface-1 p-2 shadow-lift focus:outline-none"
            >
              {branchOptions.map((option) => (
                <ListboxOption
                  key={option.id}
                  value={option.id}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-text-primary data-focus:bg-surface-2"
                >
                  {({ selected }) => (
                    <>
                      <span className="truncate">{option.label}</span>
                      {selected && <Check className="size-4 shrink-0 text-brand-primary" aria-hidden />}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </Listbox>

          {/* Quick actions */}
          <Menu>
            <MenuButton className="ny-btn ny-btn-gold ny-btn-sm hidden lg:inline-flex">
              <Zap className="size-4" aria-hidden />
              Quick actions
            </MenuButton>
            <MenuItems
              anchor="bottom end"
              className="z-50 mt-2 w-72 rounded-2xl border border-hairline bg-surface-1 p-2 shadow-lift focus:outline-none"
            >
              {QUICK_ACTIONS.map((action) => (
                <MenuItem key={action.label}>
                  {({ focus }) => (
                    <Link
                      href={action.href}
                      className={cn("flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-text-primary", focus && "bg-surface-2")}
                    >
                      {action.label}
                      <ArrowRight className="size-4 text-text-tertiary" aria-hidden />
                    </Link>
                  )}
                </MenuItem>
              ))}
            </MenuItems>
          </Menu>

          {/* Elder Mode */}
          <div className="hidden items-center gap-2 rounded-full border border-hairline bg-surface-1 py-1.5 pl-3.5 pr-2 text-sm font-semibold text-text-secondary md:flex">
            <span id="elder-mode-label">Elder Mode</span>
            <Switch
              aria-labelledby="elder-mode-label"
              checked={elder}
              onChange={(value: boolean) => {
                setElder(value);
                notify({
                  title: value ? "Elder Mode is on" : "Elder Mode is off",
                  body: value ? "Larger type, bigger buttons and calmer motion." : "Standard view restored.",
                  tone: "success",
                });
              }}
              className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-surface-3 transition duration-200 data-checked:bg-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <span className="size-5 translate-x-0.5 rounded-full bg-white shadow transition duration-200 group-data-checked:translate-x-[22px]" />
            </Switch>
          </div>

          {/* Notifications */}
          <Popover>
            <PopoverButton
              aria-label={`Notifications, ${ALERTS.length} open`}
              className="ny-btn ny-btn-ghost ny-btn-sm relative size-10 shrink-0 p-0"
            >
              <Bell className="size-4" aria-hidden />
              <span className="absolute -right-1 -top-1 grid size-[18px] place-items-center rounded-full bg-brand-secondary text-[10px] font-bold text-white">
                {ALERTS.length}
              </span>
            </PopoverButton>
            <PopoverPanel
              anchor="bottom end"
              className="z-50 mt-2 w-[22rem] max-w-[90vw] rounded-2xl border border-hairline bg-surface-1 p-3 shadow-lift focus:outline-none"
            >
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">Open alerts</p>
              <ul className="space-y-1">
                {ALERTS.map((alert) => (
                  <li key={alert.id}>
                    <Link href={alert.href} className="block rounded-xl px-3 py-2.5 transition hover:bg-surface-2">
                      <p className="text-sm font-semibold text-text-primary">{alert.title}</p>
                      <p className="mt-0.5 text-xs text-brand-primary">{alert.cta} →</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </PopoverPanel>
          </Popover>

          {/* Profile */}
          <Menu>
            <MenuButton className="flex items-center gap-2 rounded-full border border-hairline bg-surface-1 py-1 pl-1 pr-2.5 transition hover:border-brand-primary">
              {me && <Avatar member={me} size={32} className="!rounded-full" />}
              <span className="hidden text-left leading-tight 2xl:block">
                <span className="block text-sm font-semibold text-text-primary">{me?.preferredName ?? "Family Head"}</span>
                <span className="block text-xs text-text-tertiary">Family Head</span>
              </span>
              <ChevronDown className="size-3.5 text-text-tertiary" aria-hidden />
            </MenuButton>
            <MenuItems
              anchor="bottom end"
              className="z-50 mt-2 w-64 rounded-2xl border border-hairline bg-surface-1 p-2 shadow-lift focus:outline-none"
            >
              <MenuItem>
                {({ focus }) => (
                  <Link href="/dashboard/account" className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm", focus && "bg-surface-2")}>
                    <UserRound className="size-4 text-text-tertiary" aria-hidden /> My account
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <Link href="/dashboard/settings" className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm", focus && "bg-surface-2")}>
                    <Settings className="size-4 text-text-tertiary" aria-hidden /> Family settings
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => {
                      setElder(!elder);
                      notify({ title: elder ? "Standard view" : "Elder Mode is on", tone: "success" });
                    }}
                    className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm", focus && "bg-surface-2")}
                  >
                    <Check className="size-4 text-text-tertiary" aria-hidden /> {elder ? "Switch to standard view" : "Switch to Elder Mode"}
                  </button>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={() => notify({ title: "Sign-out is simulated", body: "Authentication connects when the backend is wired.", tone: "info" })}
                    className={cn("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-danger", focus && "bg-[#fbe5e5]")}
                  >
                    <LogOut className="size-4" aria-hidden /> Sign out (simulated)
                  </button>
                )}
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </header>
  );
}
