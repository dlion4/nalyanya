"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  Command,
  ExternalLink,
  HandHeart,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import {
  activityFeed,
  familyContexts,
  navGroups,
  notifications as seedNotifications,
} from "@/data/dashboard/command-center";
import { Drawer, Modal, useToast } from "@/components/ui/overlay";

function Mark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="Nalyanya mark">
      <path
        d="M24 44V24M24 24 12 14M24 24l12-10M24 30l-8-6M24 30l8-6M24 16l-5-6M24 16l5-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="24" cy="9" r="4" fill="var(--color-brand-accent)" />
      <circle cx="10" cy="12.5" r="2.6" fill="currentColor" opacity="0.75" />
      <circle cx="38" cy="12.5" r="2.6" fill="currentColor" opacity="0.75" />
      <path d="M8 44h32" stroke="var(--color-brand-accent)" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const toast = useToast();
  const [navOpen, setNavOpen] = useState(false);
  const [ctxOpen, setCtxOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [ctx, setCtx] = useState(familyContexts[0]);
  const [elder, setElder] = useState(false);
  const [unread, setUnread] = useState(seedNotifications.filter((n) => n.unread).length);

  /* elder mode — persisted + broadcast across tabs */
  useEffect(() => {
    const saved = window.localStorage.getItem("ny-elder") === "1";
    const t = window.setTimeout(() => setElder(saved), 0);
    if (saved) document.documentElement.dataset.nyMode = "elder";
    return () => window.clearTimeout(t);
  }, []);

  const toggleElder = () => {
    const next = !elder;
    setElder(next);
    if (next) document.documentElement.dataset.nyMode = "elder";
    else delete document.documentElement.dataset.nyMode;
    window.localStorage.setItem("ny-elder", next ? "1" : "0");
    try {
      new BroadcastChannel("nalyanya").postMessage({ type: "elder-mode", on: next });
    } catch {
      /* BroadcastChannel unsupported — persistence still works */
    }
    toast({
      tone: next ? "ok" : "info",
      title: next ? "Elder Mode on" : "Elder Mode off",
      body: next
        ? "Bigger type, 56px touch targets, tables become cards, motion reduced."
        : "Standard layout restored.",
    });
  };

  /* command palette shortcut */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setFindOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setNavOpen(false);
      setCtxOpen(false);
      setMenuOpen(false);
    }, 0);
    return () => window.clearTimeout(t);
  }, [pathname]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const all = navGroups.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group })));
    if (!q) return all.slice(0, 8);
    return all.filter(
      (i) => i.label.toLowerCase().includes(q) || i.code.toLowerCase().includes(q) || i.group.toLowerCase().includes(q),
    );
  }, [query]);

  const currentCode =
    [...navGroups.flatMap((g) => g.items)].find((i) =>
      i.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(i.href),
    )?.code ?? "T-1";

  return (
    <div className="min-h-screen bg-surface-0">
      {/* ============ SIDEBAR ============ */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-border-subtle bg-surface-1 xl:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      <AnimatePresence>
        {navOpen && (
          <div className="fixed inset-0 z-[70] xl:hidden">
            <motion.div
              className="absolute inset-0 bg-[rgba(26,38,24,0.5)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNavOpen(false)}
              aria-hidden
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-[264px] bg-surface-1 shadow-[var(--shadow-modal)]"
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
              role="dialog"
              aria-label="Dashboard navigation"
            >
              <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
                <span className="ny-hud">Navigation</span>
                <button type="button" onClick={() => setNavOpen(false)} aria-label="Close navigation" className="ny-btn ny-btn-ghost ny-btn-sm !px-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarContent pathname={pathname} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ============ MAIN ============ */}
      <div className="xl:pl-60">
        {/* top bar */}
        <header className="sticky top-0 z-40 border-b border-border-subtle bg-[rgba(250,246,238,0.86)] backdrop-blur-xl">
          <div className="flex h-16 items-center gap-2 px-3 sm:gap-3 sm:px-5">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="Open navigation"
              className="ny-btn ny-btn-ghost ny-btn-sm !px-2 xl:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* family context switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCtxOpen((v) => !v)}
                aria-expanded={ctxOpen}
                className="ny-btn ny-btn-outline ny-btn-sm max-w-[30vw] sm:max-w-none"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-brand-accent" aria-hidden />
                <span className="truncate">{ctx.label}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
              </button>
              <AnimatePresence>
                {ctxOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute left-0 top-[calc(100%+8px)] z-50 w-[290px] overflow-hidden rounded-xl border border-border-subtle bg-surface-1 shadow-[var(--shadow-lift)]"
                  >
                    <p className="ny-hud border-b border-border-subtle bg-surface-2 px-3 py-2">Family context</p>
                    {familyContexts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setCtx(c);
                          setCtxOpen(false);
                          toast({ tone: "info", title: `Viewing ${c.label}`, body: c.scope });
                        }}
                        className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition hover:bg-surface-2 ${
                          c.id === ctx.id ? "bg-surface-2" : ""
                        }`}
                      >
                        <span>
                          <span className="block text-sm font-semibold text-text-primary">{c.label}</span>
                          <span className="block text-xs text-text-tertiary">{c.scope}</span>
                        </span>
                        {c.id === ctx.id && <ShieldCheck className="h-4 w-4 shrink-0 text-brand-primary" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="ny-hud hidden md:inline">{currentCode}</span>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setFindOpen(true)}
                className="ny-btn ny-btn-ghost ny-btn-sm hidden sm:inline-flex"
              >
                <Search className="h-4 w-4" /> Find
                <kbd className="ny-hud hidden rounded border border-border-subtle bg-surface-2 px-1.5 py-0.5 !text-[0.6rem] lg:inline">
                  ⌘K
                </kbd>
              </button>
              <button
                type="button"
                onClick={() => setFindOpen(true)}
                aria-label="Find a page"
                className="ny-btn ny-btn-ghost ny-btn-sm !px-2 sm:hidden"
              >
                <Search className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={toggleElder}
                aria-pressed={elder}
                title="Elder Mode"
                className={`ny-btn ny-btn-sm ${elder ? "ny-btn-accent" : "ny-btn-ghost"}`}
              >
                <Moon className="h-4 w-4" />
                <span className="hidden sm:inline">{elder ? "Elder Mode on" : "Elder Mode"}</span>
              </button>

              <button
                type="button"
                onClick={() => setBellOpen(true)}
                aria-label={`Notifications, ${unread} unread`}
                className="ny-btn ny-btn-ghost ny-btn-sm relative !px-2"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="ny-num absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-secondary px-1 text-[0.6rem] font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-expanded={menuOpen}
                  aria-label="Account menu"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border-strong bg-brand-primary text-sm font-bold text-on-brand transition hover:shadow-[var(--shadow-raise)]"
                >
                  PN
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-xl border border-border-subtle bg-surface-1 shadow-[var(--shadow-lift)]"
                    >
                      <div className="border-b border-border-subtle px-3 py-2.5">
                        <p className="text-sm font-semibold">Peter Wanyama Nalyanya</p>
                        <p className="text-xs text-text-tertiary">Finance officer · Nairobi branch</p>
                      </div>
                      {[
                        { label: "My account", href: "/dashboard/account", icon: UserRound },
                        { label: "Settings", href: "/dashboard/settings", icon: Settings },
                        { label: "Receive link preview", href: "/dashboard/finance-access", icon: HandHeart },
                      ].map((i) => (
                        <Link
                          key={i.href}
                          href={i.href}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm transition hover:bg-surface-2"
                        >
                          <i.icon className="h-4 w-4 text-text-secondary" /> {i.label}
                        </Link>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          toast({ tone: "info", title: "Signed out is disabled", body: "Frontend-only Phase 1 — auth lands with the backend." });
                        }}
                        className="flex w-full items-center gap-2.5 border-t border-border-subtle px-3 py-2.5 text-left text-sm transition hover:bg-surface-2"
                      >
                        <ExternalLink className="h-4 w-4 text-text-secondary" /> Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        <main className="px-3 pb-16 pt-5 sm:px-5 lg:px-7">{children}</main>
      </div>

      {/* ============ NOTIFICATIONS DRAWER ============ */}
      <Drawer
        open={bellOpen}
        onClose={() => setBellOpen(false)}
        title="Notifications"
        sub="Event × channel matrix — in-app rail active, others SIMULATED in Phase 1"
        footer={
          <>
            <button
              type="button"
              className="ny-btn ny-btn-ghost ny-btn-sm"
              onClick={() => {
                setUnread(0);
                toast({ tone: "ok", title: "All caught up", body: "6 notifications marked as read." });
              }}
            >
              Mark all read
            </button>
            <Link href="/dashboard/settings" className="ny-btn ny-btn-primary ny-btn-sm">
              Notification preferences
            </Link>
          </>
        }
      >
        <ul className="space-y-2">
          {seedNotifications.map((n) => (
            <li key={n.id}>
              <Link
                href={n.href}
                onClick={() => {
                  setBellOpen(false);
                  if (n.unread) setUnread((u) => Math.max(0, u - 1));
                }}
                className="ny-card-flat block px-3.5 py-3 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-raise)]"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`ny-chip ${
                      n.kind === "money" ? "ny-chip-ok" : n.kind === "event" ? "ny-chip-warn" : n.kind === "lineage" ? "ny-chip-brand" : "ny-chip-info"
                    }`}
                  >
                    {n.kind}
                  </span>
                  <span className="ny-hud !text-[0.6rem]">{n.at}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-text-primary">{n.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">{n.body}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className="ny-hud mt-4 text-center">In-app rail · WhatsApp / SMS / email Phase 2</p>
      </Drawer>

      {/* ============ COMMAND PALETTE ============ */}
      <Modal open={findOpen} onClose={() => setFindOpen(false)} title="Jump to" sub="Family dashboard · 16 pages" size="md">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages — try “loans”, “T-7”, “gallery”…"
          className="ny-input"
          aria-label="Search pages"
        />
        <ul className="mt-3 space-y-1.5">
          {results.map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                onClick={() => setFindOpen(false)}
                className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5 transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-raise)]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{r.label}</span>
                  <span className="block text-xs text-text-tertiary">{r.group}</span>
                </span>
                <span className="ny-hud shrink-0">{r.code}</span>
              </Link>
            </li>
          ))}
          {results.length === 0 && (
            <li className="ny-inset px-3 py-6 text-center text-sm text-text-secondary">
              No page matches “{query}”. Try a page code like T-7.
            </li>
          )}
        </ul>
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-border-strong bg-surface-2 px-3 py-2">
          <Command className="h-4 w-4 text-brand-accent" />
          <p className="text-xs text-text-secondary">
            Every jump is client-side — no page reload, back button restores the overlay.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="ny-scroll flex h-full flex-col overflow-y-auto pb-6">
      <Link href="/" className="flex items-center gap-2.5 border-b border-border-subtle px-4 py-4 text-brand-primary">
        <Mark />
        <span>
          <span className="ny-display block text-[1.05rem] leading-none text-text-primary">Nalyanya</span>
          <span className="ny-hud !text-[0.58rem]">lineage · money · memories</span>
        </span>
      </Link>

      <nav className="flex-1 px-2.5 py-3" aria-label="Dashboard">
        {navGroups.map((g) => (
          <div key={g.group} className="mb-3.5">
            <p className="ny-hud px-2.5 pb-1.5 pt-1">{g.group}</p>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active =
                  item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150 ${
                        active
                          ? "bg-brand-primary text-on-brand shadow-[var(--shadow-raise)]"
                          : "text-text-secondary hover:translate-x-0.5 hover:bg-surface-2 hover:text-text-primary"
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <span
                        className={`ny-hud shrink-0 !text-[0.56rem] ${
                          active ? "!text-[rgba(250,246,238,0.75)]" : ""
                        }`}
                      >
                        {item.code}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mx-3 rounded-xl border border-border-subtle bg-surface-2 p-3">
        <p className="ny-hud">Phase 1 · frontend only</p>
        <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
          M-Pesa, WhatsApp, SMS and Drive adapters render in full but resolve{" "}
          <span className="ny-chip ny-chip-sim">SIMULATED</span>
        </p>
        <div className="mt-2.5 flex items-center gap-2 text-xs text-text-tertiary">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
          {activityFeed.length} events in today&apos;s feed
        </div>
      </div>
    </div>
  );
}
