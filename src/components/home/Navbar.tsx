/* ── H-1 glassmorphic floating navbar ─────────────────────────────────────── */

import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Accessibility, Menu, X, ChevronRight } from "lucide-react";
import { Crest } from "./Logo";
import { useElderMode } from "../../lib/hooks";
import { cn } from "../../utils/cn";

const NAV_LINKS = [
  { label: "About", to: "/about" },
  { label: "Professions", to: "/professions" },
  { label: "Foundation", to: "/foundation" },
  { label: "Events", to: "/events" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { mode, toggle } = useElderMode();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mobile menu on navigation
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={cn(
          "pointer-events-auto mx-auto max-w-7xl rounded-2xl border transition-all duration-300 ease-out",
          scrolled
            ? "border-white/60 bg-surface-1/90 shadow-lift backdrop-blur-2xl"
            : "border-white/50 bg-surface-1/70 shadow-card backdrop-blur-xl"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 pl-3 pr-2 sm:gap-4 sm:pl-4 sm:pr-3">
          {/* logo */}
          <Link to="/" className="flex min-h-11 items-center gap-2.5 rounded-full" aria-label="Nalyanya — home">
            <Crest className="h-9 w-9" />
            <span className="leading-tight">
              <span className="block font-display text-[1.35rem] font-semibold tracking-tight text-brand-primary">Nalyanya</span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-text-tertiary sm:block">Family · Kenya</span>
            </span>
          </Link>

          {/* center links */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => cn(
                  "ny-touch rounded-pill px-3.5 py-2 text-[13px] font-semibold transition-colors duration-150",
                  isActive ? "bg-brand-primary text-surface-0" : "text-text-secondary hover:bg-brand-primary-tint hover:text-brand-primary"
                )}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* right cluster */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggle()}
              aria-pressed={mode}
              title="Elder Mode — larger text, bigger touch targets"
              className={cn(
                "ny-touch hidden items-center gap-2 rounded-pill border px-3.5 py-2 text-xs font-bold transition-all duration-300 sm:inline-flex",
                mode
                  ? "border-brand-accent/70 bg-brand-accent-soft text-[#7a5b14]"
                  : "border-surface-3 bg-surface-2/70 text-text-secondary hover:border-brand-primary/30 hover:text-brand-primary"
              )}
            >
              <Accessibility className="size-4" aria-hidden="true" />
              Elder
              <span className={cn("relative h-4 w-7 rounded-pill transition-colors", mode ? "bg-brand-accent" : "bg-surface-3")} aria-hidden="true">
                <span className={cn("absolute top-0.5 size-3 rounded-pill bg-surface-1 shadow transition-all", mode ? "left-3.5" : "left-0.5")} />
              </span>
            </button>

            <Link to="/signin" className="ny-touch hidden rounded-pill px-4 py-2.5 text-[13px] font-bold text-brand-primary transition-colors hover:bg-brand-primary-tint sm:inline-flex">
              Sign in
            </Link>
            <Link to="/join" className="ny-touch hidden rounded-pill bg-brand-primary px-4 py-2.5 text-[13px] font-bold text-surface-0 shadow-card transition-all hover:bg-brand-primary-deep hover:shadow-lift md:inline-flex">
              Join the family
            </Link>

            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label="Toggle menu"
              className="ny-touch grid size-10 place-items-center rounded-pill border border-surface-3 bg-surface-1 text-brand-primary transition-colors hover:bg-brand-primary-tint lg:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-surface-3/60 lg:hidden"
              aria-label="Mobile"
            >
              <div className="grid gap-1 p-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="ny-touch flex items-center justify-between rounded-xl px-4 py-3 font-semibold text-text-primary transition-colors hover:bg-brand-primary-tint"
                  >
                    {link.label}
                    <ChevronRight className="size-4 text-text-tertiary" />
                  </Link>
                ))}
                <div className="mt-2 grid gap-2 border-t border-surface-3/60 pt-3">
                  <button
                    type="button"
                    onClick={() => toggle()}
                    aria-pressed={mode}
                    className={cn(
                      "ny-touch flex items-center justify-between rounded-xl border px-4 py-3 font-bold",
                      mode ? "border-brand-accent/70 bg-brand-accent-soft text-[#7a5b14]" : "border-surface-3 text-text-secondary"
                    )}
                  >
                    <span className="inline-flex items-center gap-2"><Accessibility className="size-5" /> Elder Mode</span>
                    <span className="relative h-5 w-9 rounded-pill bg-surface-3">
                      <span className={cn("absolute top-0.5 size-4 rounded-pill bg-brand-primary transition-all", mode ? "left-4" : "left-0.5")} />
                    </span>
                  </button>
                  <Link to="/signin" className="ny-touch rounded-pill border border-brand-primary/30 py-3 text-center font-bold text-brand-primary">Sign in</Link>
                  <Link to="/join" className="ny-touch rounded-pill bg-brand-primary py-3 text-center font-bold text-surface-0 shadow-card">Join the family</Link>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
