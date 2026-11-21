/* ── H-1 Hero — GSAP entrance + scroll parallax + lazy 3D tree teaser ────── */

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, Sparkles, TreePine, Eye, Accessibility, KeyRound } from "lucide-react";
import gsap from "gsap";
import TreeFallback from "./TreeFallback";
import { HERO } from "../../data/home/landing";
import { usePrefersReducedMotion } from "../../lib/hooks";
import { cn } from "../../utils/cn";

const TreeScene = lazy(() => import("./TreeScene"));

const CHIP_ICONS = [Accessibility, TreePine, KeyRound];
const CHIP_LABELS = HERO.microChips;

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Hero({ elderMode }: { elderMode: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const reduced = usePrefersReducedMotion();
  const reducedOrElder = reduced || elderMode;

  // lazy-mount the 3D scene shortly after paint — shell paints first
  useEffect(() => {
    if (reducedOrElder || !webglAvailable()) return;
    const t = window.setTimeout(() => setSceneReady(true), 700);
    return () => window.clearTimeout(t);
  }, [reducedOrElder]);

  // GSAP entrance — hero shell paints immediately, text staggers in
  useEffect(() => {
    if (reducedOrElder) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.08 });
      tl
        .from(".ny-hero-eyebrow", { y: 26, opacity: 0, duration: 0.7 })
        .from(".ny-hero-line", { y: 74, opacity: 0, duration: 0.9, stagger: 0.13 }, "-=0.45")
        .from(".ny-hero-sub", { y: 26, opacity: 0, duration: 0.8 }, "-=0.58")
        .from(".ny-hero-cta", { y: 26, opacity: 0, duration: 0.7, stagger: 0.11 }, "-=0.55")
        .from(".ny-hero-chip", { y: 18, opacity: 0, duration: 0.55, stagger: 0.09 }, "-=0.6")
        .from(".ny-scene", { opacity: 0, scale: 0.94, duration: 1.15, ease: "power2.out" }, "-=0.85");
    }, rootRef);
    return () => ctx.revert();
  }, [reducedOrElder]);

  // GSAP scroll parallax — glow, scene and content drift at different rates
  useEffect(() => {
    if (reducedOrElder) return;
    const ctx = gsap.context(() => {
      const onScroll = () => {
        const y = window.scrollY;
        if (y > 900) return;
        gsap.set(".ny-hero-parallax", { y: y * 0.22 });
        gsap.set(".ny-hero-content", { y: y * 0.1 });
        gsap.set(".ny-hero-scene-wrap", { y: y * 0.05 });
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }, rootRef);
    return () => ctx.revert();
  }, [reducedOrElder]);

  const scrollToLineage = () => document.getElementById("lineage")?.scrollIntoView({ behavior: reducedOrElder ? "auto" : "smooth" });

  return (
    <section ref={rootRef} className="relative overflow-hidden pt-24 sm:pt-28" aria-label="Hero">
      {/* atmosphere layers (parallax target) */}
      <div className="ny-hero-parallax pointer-events-none absolute inset-0 -z-0" aria-hidden="true">
        <div className="ny-grid-paper absolute inset-0" />
        <div className="ny-hero-glow absolute inset-0" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 pb-16 pt-6 sm:pt-10 lg:min-h-[78vh] lg:grid-cols-12 lg:gap-4">
          {/* ── left: copy ── */}
          <div className="ny-hero-content relative z-10 lg:col-start-1 lg:col-span-7">
            <span className="ny-hero-eyebrow ny-eyebrow">
              <TreePine className="size-3.5" aria-hidden="true" />
              {HERO.eyebrow}
            </span>

            <h1 className="ny-heading mt-6 text-[2.9rem] sm:text-6xl xl:text-[4.6rem]">
              <span className="ny-hero-line block">Our roots.</span>
              <span className="ny-hero-line block">Our people.</span>
              <span className="ny-hero-line block font-display italic font-medium tracking-[-0.02em] text-brand-secondary">One home.</span>
            </h1>

            <p className="ny-hero-sub ny-prose mt-6 max-w-xl text-[1.05rem] sm:text-lg">
              {HERO.sub}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={scrollToLineage} className="ny-btn-gold ny-hero-cta">
                <TreePine className="size-5" aria-hidden="true" />
                {HERO.ctaPrimary}
              </button>
              <Link to="/join" className="ny-btn-ghost ny-hero-cta">
                {HERO.ctaSecondary}
                <ArrowDown className="hidden size-4 lg:block" aria-hidden="true" />
              </Link>
            </div>

            <ul className="ny-hero-chip mt-7 flex flex-wrap gap-2">
              {CHIP_LABELS.map((label, i) => {
                const Icon = CHIP_ICONS[i] ?? Sparkles;
                return (
                  <li key={label} className="ny-hero-chip ny-chip">
                    <Icon className="size-3.5 text-brand-primary" aria-hidden="true" />
                    {label}
                  </li>
                );
              })}
            </ul>

            <p className="ny-hero-chip mt-6 flex items-center gap-2 text-xs font-semibold text-text-tertiary">
              <Eye className="size-3.5" aria-hidden="true" />
              No account needed to browse — sign in to keep this family alive.
            </p>
          </div>

          {/* ── right: 3D teaser (lazy, fallback static SVG) ── */}
          <div className="ny-hero-scene-wrap pointer-events-none relative z-10 lg:col-start-8 lg:pointer-events-auto lg:col-span-5">
            <div className="ny-scene relative mx-auto aspect-[4/4.6] w-full max-w-md overflow-hidden rounded-[1.75rem] opacity-95 lg:aspect-auto lg:h-[34rem] lg:opacity-100">
              {sceneReady && !reducedOrElder ? (
                <Suspense fallback={<TreeFallback className="absolute inset-0 h-full w-full p-6" />}>
                  <TreeScene reduced={reduced} />
                </Suspense>
              ) : (
                <TreeFallback className="absolute inset-0 h-full w-full p-6" />
              )}

              {/* live chip */}
              <span className="ny-glass absolute left-4 top-4 inline-flex items-center gap-2 rounded-pill px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brand-primary">
                <span className={cn("size-2 rounded-pill", sceneReady && !reducedOrElder ? "bg-brand-success ny-pulse-soft" : "bg-text-tertiary")} />
                {sceneReady && !reducedOrElder ? "3D teaser" : elderMode ? "Static tree · Elder Mode" : reduced ? "Static tree" : "Tree teaser"}
              </span>

              <span className="ny-glass absolute bottom-4 right-4 hidden rounded-pill px-3 py-1.5 text-[10px] font-semibold text-text-tertiary lg:block">
                Drag to orbit · auto-rotates
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div className="relative z-10 mx-auto -mt-2 flex w-max items-center gap-2 rounded-pill border border-brand-primary/10 bg-surface-1/80 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-primary shadow-card backdrop-blur-md">
        <ArrowDown className="size-3.5 animate-bounce" aria-hidden="true" />
        scroll
      </div>
    </section>
  );
}
