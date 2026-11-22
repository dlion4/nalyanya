import { useEffect, useState } from "react";
import { Link, Outlet } from "@tanstack/react-router";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Command,
  Glasses,
  Layers3,
  Menu,
  PanelLeft,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Brand, BrandMark } from "@/components/shared/Brand";
import { Avatar } from "@/components/shared/Primitives";
import {
  allNav,
  dashPath,
  extraNav,
  navGroups,
  type NavItem,
} from "@/data/dashboard/navigation";
import { alerts } from "@/data/dashboard/command-center";
import { useWorkspace } from "@/state/Workspace";
import { OverlayHost } from "@/components/overlays/OverlayHost";
import "@/styles/shell.css";

function Sidebar() {
  const w = useWorkspace();
  const [more, setMore] = useState(false);
  const navLink = ({ label, slug, icon: Icon }: NavItem) => {
    const active =
      w.path.replace(/\/$/, "") === dashPath(slug) || (!slug && w.path === "/");
    return (
      <Link
        title={label}
        key={slug}
        to={dashPath(slug)}
        search={{ branch: w.query.branch }}
        onClick={() => w.setMobileNav(false)}
        className={`ny-nav-link ${active ? "is-current" : ""}`}
        aria-current={active ? "page" : undefined}
      >
        <Icon size={17} />
        <span>{label}</span>
        {active && <i />}
      </Link>
    );
  };
  return (
    <div className="ny-sidebar-inner">
      <Link
        to="/dashboard"
        className="ny-brand-link"
        aria-label="Nalyanya command center"
      >
        <Brand />
      </Link>
      <button
        className="ny-mobile-close"
        onClick={() => w.setMobileNav(false)}
        aria-label="Close navigation"
      >
        <X size={20} />
      </button>
      <button
        className="ny-family-switch"
        onClick={() => w.open("family")}
        aria-label="Switch family branch"
      >
        <span className="ny-family-crest">
          <BrandMark size={30} />
        </span>
        <span className="ny-family-label">
          <strong>Nalyanya Family</strong>
          <small>
            <i />
            {w.branch ? `${w.branch.name} branch` : "All branches"}
          </small>
        </span>
        <ChevronsUpDown size={13} />
      </button>
      <nav className="ny-sidebar-nav" aria-label="Family workspace navigation">
        {navGroups.map((group) => (
          <div className="ny-nav-group" key={group.title}>
            <p>{group.title}</p>
            {group.items.map(navLink)}
          </div>
        ))}
        <button
          className={`ny-nav-link more-tools ${more ? "expanded" : ""}`}
          aria-expanded={more}
          onClick={() => setMore(!more)}
          title="More tools"
        >
          <Layers3 size={17} />
          <span>More tools</span>
          <ChevronDown size={13} />
        </button>
        {more && <div className="ny-extra-links">{extraNav.map(navLink)}</div>}
      </nav>
      <div className="ny-sidebar-bottom">
        <span className="ny-demo-label">
          <i />
          Local demo workspace
        </span>
        <button
          className="ny-account"
          aria-label="Open your profile"
          onClick={() => w.open("profile")}
        >
          <Avatar name="Brian Nalyanya" image="/images/brian.webp" size={36} />
          <span>
            <strong>Brian Nalyanya</strong>
            <small>Family administrator</small>
          </span>
          <ChevronsUpDown size={14} />
        </button>
      </div>
    </div>
  );
}
export function DashboardShell() {
  const w = useWorkspace();
  const active =
    allNav.find((i) => dashPath(i.slug) === w.path.replace(/\/$/, ""))?.label ||
    "Command center";
  const unread = alerts.filter(
    (a) => !w.local.read.includes(a.id) && !w.local.dismissed.includes(a.id),
  ).length;
  useEffect(() => {
    document.title = `${active} | Nalyanya Family`;
  }, [active]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        w.open("search");
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [w]);
  return (
    <div className={`ny-app ${w.collapsed ? "is-collapsed" : ""}`}>
      <a className="ny-skip" href="#main-content">
        Skip to dashboard
      </a>
      <aside className="ny-sidebar">
        <Sidebar />
      </aside>
      {w.mobileNav && (
        <Dialog
          open
          onClose={() => w.setMobileNav(false)}
          className="ny-mobile-navigation"
        >
          <div className="ny-mobile-scrim" />
          <DialogPanel className="ny-mobile-sidebar">
            <DialogTitle className="sr-only">Family navigation</DialogTitle>
            <Sidebar />
          </DialogPanel>
        </Dialog>
      )}
      <div className="ny-main-shell">
        <header className="ny-topbar">
          <div className="ny-breadcrumb">
            <button
              className="ny-icon-button ny-desktop-toggle"
              onClick={() => w.setCollapsed(!w.collapsed)}
              aria-label="Toggle sidebar"
            >
              <PanelLeft size={18} />
            </button>
            <button
              className="ny-icon-button ny-mobile-toggle"
              onClick={() => w.setMobileNav(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <Link
              className="ny-mobile-wordmark"
              to="/dashboard"
              search={{ branch: w.query.branch }}
              aria-label="Nalyanya command center"
            >
              <BrandMark size={24} />
              <span>Nalyanya</span>
            </Link>
            <span className="ny-top-divider" />
            <span className="crumb-workspace">Workspace</span>
            <ChevronRight size={12} className="crumb-workspace" />
            <strong>{active}</strong>
          </div>
          <div className="ny-top-tools">
            <button
              className="ny-search-trigger"
              aria-label="Search workspace"
              onClick={() => w.open("search")}
            >
              <Search size={16} />
              <span>Search</span>
              <kbd>
                <Command size={10} /> K
              </kbd>
            </button>
            <span className="ny-top-divider" />
            <button
              className="ny-elder-trigger"
              role="switch"
              aria-checked={w.local.elder}
              aria-label="Elder mode"
              onClick={w.toggleElder}
            >
              <Glasses size={17} />
              <span>Elder mode</span>
              <i className={w.local.elder ? "on" : ""} />
            </button>
            <span className="ny-top-divider last-divider" />
            <button
              className="ny-bell"
              onClick={() => w.open("notifications")}
              aria-label={`Notifications, ${unread} unread`}
            >
              <Bell size={19} />
              {unread > 0 && <i />}
            </button>
          </div>
        </header>
        <main id="main-content" className="ny-main-content">
          <Outlet />
        </main>
        <footer className="ny-footer">
          <span>
            <BrandMark size={20} />
            Nalyanya <b>/</b> Our roots. Our people. One home.
          </span>
          <button onClick={() => w.open("about")}>
            About this workspace <ChevronRight size={12} />
          </button>
        </footer>
      </div>
      <button
        className="ny-mobile-fab"
        onClick={() => w.open("actions")}
        aria-label="Open quick actions"
      >
        <SlidersHorizontal size={21} />
      </button>
      <OverlayHost />
      <AnimatePresence>
        {w.toast && (
          <motion.div
            role="status"
            className="ny-toast"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
          >
            <Check size={17} />
            {w.toast}
            <button onClick={() => w.setToast("")} aria-label="Dismiss message">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
