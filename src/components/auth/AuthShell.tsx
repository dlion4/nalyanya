/* ── AuthShell — the one heritage frame every auth page shares ───────────────
   Split layout on lg+ (heritage panel | form), single column on smaller
   screens: slim top bar with Elder Mode + back home, stage area, quiet footer.
   Each auth page renders <main className="page-auth-…"><AuthShell>…</AuthShell></main>
   and injects its own page stylesheet on top of this shell.

   Visuals: every auth screen passes 3–4 heritage slides. The panel plays them
   through the shared camera — variant="pinhole": the picture collapses to a
   point of light, swaps, then floods back. Elder Mode / reduced motion →
   instant swap, no autoplay (handled inside ApertureShutter).            */

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Accessibility, ArrowLeft, LifeBuoy } from "lucide-react";
import { Crest } from "../home/Logo";
import ApertureShutter, { type ShutterSlide } from "../home/ApertureShutter";
import { useElderMode } from "../../lib/hooks";
import { usePageStyles } from "../../lib/usePageStyles";
import shellCss from "../../styles/components/auth-shell.css?inline";
import { cn } from "../../utils/cn";
import familyTraditional from "../../assets/images/family-traditional.jpg";

export interface AuthVisual { src: string; alt: string; kicker: string; line: string; caption: string }

interface Props {
  children: ReactNode;
  visual: AuthVisual;
  slides?: ShutterSlide[];
  autoPlay?: number;
  kicker?: string;
  backTo?: string;
}

const DEFAULT_VISUAL: AuthVisual = {
  src: familyTraditional,
  alt: "A Nalyanya family in traditional attire",
  kicker: "Imarishi — we stand firm",
  line: "One family. Many branches. One home.",
  caption: "Bungoma · Kakamega · Trans-Nzoia · Nairobi",
};

export default function AuthShell({ children, visual = DEFAULT_VISUAL, slides, autoPlay = 5600, kicker, backTo = "/" }: Props) {
  usePageStyles("auth-shell", shellCss);
  const { mode, toggle } = useElderMode();

  const frames: ShutterSlide[] = slides && slides.length > 0
    ? slides
    : [{ src: visual.src, alt: visual.alt, meta: visual.kicker, caption: visual.caption }];

  return (
    <div className="auth-shell">
      <a href="#auth-form" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-brand-primary focus:px-5 focus:py-3 focus:font-semibold focus:text-surface-0">
        Skip to the form
      </a>
      <div className="auth-shell__grid">
        {/* ── left: the heritage we come from — pinhole camera, 3D stage, HUD ── */}
        <aside className="auth-shell__visual" aria-label="Heritage photos">
          <div className="auth-shell__stage">
            <ApertureShutter
              slides={frames}
              variant="pinhole"
              autoPlay={frames.length > 1 ? autoPlay : 0}
              controls={frames.length > 1}
              hud
              caption={false}
              label="Heritage photos"
              exposure="ƒ/167 · pinhole"
              className="auth-shell__shutter"
            />
          </div>
          <div className="auth-shell__veil" />
          <div className="auth-shell__grain" />
          <div className="auth-shell__rail">{visual.kicker}</div>
          <div className="auth-shell__copy">
            <Link to="/" className="flex w-max items-center gap-2.5 rounded-xl">
              <Crest className="h-10 w-10" />
              <span className="font-display text-2xl font-semibold tracking-tight text-surface-0">Nalyanya</span>
            </Link>
            <div className="max-w-md">
              {kicker && <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-accent">{kicker}</p>}
              <p className="mt-3 font-display text-4xl font-semibold leading-[1.08] text-surface-0 [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]">{visual.line}</p>
              <p className="mt-4 text-sm font-semibold leading-relaxed text-surface-2/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.5)]">{visual.caption}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="ny-glass-dark inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-surface-0">
                  <span className="size-1.5 rounded-full bg-brand-accent" aria-hidden="true" /> Frontend-only
                </span>
                <span className="ny-glass-dark inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-surface-0">
                  Pinhole · ƒ/167
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── right: the one job of this screen ── */}
        <section className="auth-shell__panel">
          <header className="flex items-center justify-between gap-2 border-b border-surface-3/60 px-4 py-3 sm:px-6">
            <Link to={backTo} className="ny-touch inline-flex items-center gap-2 rounded-pill px-3.5 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-2 hover:text-brand-primary">
              <ArrowLeft className="size-4" aria-hidden="true" /> {backTo === "/" ? "Home" : "Back"}
            </Link>
            <div className="flex items-center gap-1.5">
              <Link to="/contact" className="ny-touch inline-flex items-center gap-2 rounded-pill px-3.5 py-2 text-sm font-semibold text-text-tertiary transition-colors hover:bg-surface-2 hover:text-brand-primary">
                <LifeBuoy className="size-4" aria-hidden="true" /> <span className="hidden sm:inline">Need help?</span>
              </Link>
              <button type="button" onClick={toggle} aria-pressed={mode} title="Elder Mode — larger text, bigger targets"
                className={cn("ny-touch inline-flex items-center gap-2 rounded-pill border px-3 py-2 text-xs font-bold transition-colors",
                  mode ? "border-brand-accent/70 bg-brand-accent-soft text-[#7a5b14]" : "border-surface-3 text-text-tertiary hover:text-brand-primary")}>
                <Accessibility className="size-4" aria-hidden="true" /> Elder
              </button>
            </div>
          </header>

          {/* mobile heritage reel — same pinhole camera, compact */}
          <div className="auth-shell__mobile">
            <ApertureShutter
              slides={frames}
              variant="pinhole"
              autoPlay={frames.length > 1 ? autoPlay : 0}
              controls={false}
              hud
              caption={false}
              label="Heritage photos"
              exposure="ƒ/167 · pinhole"
              className="auth-shell__mobile-shutter"
            />
            <p className="auth-shell__mobile-line">{visual.line}</p>
          </div>

          <div id="auth-form" className="auth-shell__form">{children}</div>

          <footer className="mt-auto border-t border-surface-3/60 px-4 py-3 text-center text-[11px] font-medium text-text-tertiary sm:px-6">
            <Link to="/privacy" className="hover:text-brand-primary">Privacy</Link>
            <span aria-hidden="true" className="px-2">·</span>
            <Link to="/terms" className="hover:text-brand-primary">Terms</Link>
            <span aria-hidden="true" className="px-2">·</span>
            <Link to="/contact" className="hover:text-brand-primary">Contact the family office</Link>
            <span aria-hidden="true" className="px-2">·</span>
            <span>Phase 1: frontend-only</span>
          </footer>
        </section>
      </div>
    </div>
  );
}
