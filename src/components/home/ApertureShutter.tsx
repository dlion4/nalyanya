/* ── ApertureShutter — camera transition between photos ─────────────────────
   variant="iris"     8 SVG blades rotate in toward the optical centre, the
                      frame swaps while shut, then the blades spiral back out
                      with an exposure flash.
   variant="pinhole"  the picture collapses to a point of light — light through
                      a pinhole — swaps, then floods back in as the hole opens.
   Viewfinder HUD: corner brackets, focus reticle, REC dot, exposure readout,
   frame counter, caption panel, progress segments.
   Reduced motion / Elder Mode → instant swap, no autoplay.               */

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useElderMode, usePrefersReducedMotion } from "../../lib/hooks";
import { cn } from "../../utils/cn";

export interface ShutterSlide { src: string; alt: string; caption?: string; meta?: string }

const BLADES = 8;
const CLOSE_MS = 440;
const HOLD_MS = 120;

interface Props {
  slides: ShutterSlide[];
  index?: number;
  onIndexChange?: (i: number) => void;
  autoPlay?: number;
  controls?: boolean;
  hud?: boolean;
  caption?: boolean;
  label: string;
  className?: string;
  exposure?: string;
  variant?: "iris" | "pinhole";
}

export default function ApertureShutter({
  slides, index, onIndexChange, autoPlay = 0, controls = true, hud = true, caption = true,
  label, className, exposure = "ƒ/2.8 · 1/125s · ISO 200", variant = "iris",
}: Props) {
  const reduced = usePrefersReducedMotion();
  const { mode: elder } = useElderMode();
  const instant = reduced || elder;

  const [internal, setInternal] = useState(0);
  const last = Math.max(0, slides.length - 1);
  const target = Math.min(Math.max(index ?? internal, 0), last);
  const [shown, setShown] = useState(target);
  const [closed, setClosed] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const gid = `ny-blade-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const go = useCallback((i: number) => {
    const n = slides.length;
    if (n === 0) return;
    const next = ((i % n) + n) % n;
    if (onIndexChange) onIndexChange(next);
    else setInternal(next);
  }, [slides.length, onIndexChange]);

  // iris / pinhole sequence: close → swap frame → open + flash
  useEffect(() => {
    if (target === shown) { setClosed(false); return; }
    if (instant) { setShown(target); setClosed(false); return; }
    setClosed(true);
    const t1 = window.setTimeout(() => setShown(target), CLOSE_MS);
    const t2 = window.setTimeout(() => { setClosed(false); setFlashKey((k) => k + 1); }, CLOSE_MS + HOLD_MS);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, instant]);

  // only autoplay while visible
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!autoPlay || paused || !inView || instant) return;
    const t = window.setTimeout(() => go(target + 1), autoPlay);
    return () => window.clearTimeout(t);
  }, [autoPlay, paused, inView, instant, target, go]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") { e.preventDefault(); go(target + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(target - 1); }
  };

  const slide = slides[shown] ?? { src: "", alt: "" };
  const pad = (n: number) => String(n).padStart(2, "0");
  const autoActive = !!autoPlay && !instant;
  const pinhole = variant === "pinhole";

  const frame = (
    <>
      <img key={shown} src={slide.src} alt={slide.alt} className="ny-shutter-img" decoding="async" />
      <div className="ny-shutter-vignette" aria-hidden="true" />
    </>
  );

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={onKey}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className={cn(
        "ny-shutter group outline-none focus-visible:ring-2 focus-visible:ring-brand-accent",
        pinhole && closed && "is-shut",
        paused && "is-paused",
        className
      )}
      style={{ "--ny-dur": `${autoPlay}ms` } as CSSProperties}
    >
      {pinhole && <div className="ny-pinhole-plate" aria-hidden="true" />}
      {pinhole ? <div className="ny-pinhole-layer">{frame}</div> : frame}

      {!pinhole && (
        <svg className={cn("ny-iris", closed && "is-closed")} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#24342a" />
              <stop offset="100%" stopColor="#0a110d" />
            </linearGradient>
          </defs>
          {Array.from({ length: BLADES }).map((_, i) => (
            <g key={i} className="ny-blade" style={{ "--a": `${(360 / BLADES) * i}deg` } as CSSProperties}>
              <rect x={-200} y={-80} width={500} height={134} fill={`url(#${gid})`} stroke="rgba(212,164,55,0.5)" strokeWidth={0.35} />
            </g>
          ))}
        </svg>
      )}

      <div key={flashKey} className={cn("ny-shutter-flash", flashKey > 0 && "is-firing")} aria-hidden="true" />

      {/* viewfinder HUD */}
      {hud && (
        <div className="ny-vf" aria-hidden="true">
          <span className="ny-vf-corner tl" /><span className="ny-vf-corner tr" />
          <span className="ny-vf-corner bl" /><span className="ny-vf-corner br" />
          <div className={cn("ny-vf-reticle", closed && "is-focusing")} />
          <div className="absolute left-10 top-[18px] flex items-center gap-2">
            <span className="ny-vf-rec" />
            <span className="ny-vf-text">REC</span>
            <span className="ny-vf-text hidden opacity-80 sm:inline">· {exposure}</span>
          </div>
          <span className="ny-vf-text absolute right-10 top-[18px]">FR {pad(shown + 1)} / {pad(slides.length)}</span>
        </div>
      )}

      {/* caption panel */}
      {caption && (slide.caption || slide.meta) && (
        <div className="ny-glass-dark absolute inset-x-4 bottom-9 z-[6] rounded-xl px-4 py-3 text-surface-0 sm:inset-x-6 sm:right-auto sm:max-w-[80%]">
          {slide.meta && <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent">{slide.meta}</p>}
          {slide.caption && <p className="mt-1 font-display text-[15px] font-medium leading-snug sm:text-base">{slide.caption}</p>}
        </div>
      )}

      {/* controls */}
      {controls && slides.length > 1 && (
        <>
          <button type="button" onClick={() => go(target - 1)} aria-label="Previous photo"
            className="ny-touch absolute left-3 top-1/2 z-[7] grid size-11 -translate-y-1/2 place-items-center rounded-pill bg-surface-0/85 text-brand-primary shadow-card backdrop-blur-md transition-all duration-300 hover:scale-105 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => go(target + 1)} aria-label="Next photo"
            className="ny-touch absolute right-3 top-1/2 z-[7] grid size-11 -translate-y-1/2 place-items-center rounded-pill bg-surface-0/85 text-brand-primary shadow-card backdrop-blur-md transition-all duration-300 hover:scale-105 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100">
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute inset-x-4 bottom-3.5 z-[7] flex items-center gap-1.5 sm:inset-x-6">
            {slides.map((s, i) => (
              <button
                key={i === target ? `active-${target}-${paused ? "p" : "r"}` : `seg-${i}`}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show photo ${i + 1}: ${s.alt}`}
                aria-current={i === target}
                className="flex-1 cursor-pointer py-2"
              >
                <span className={cn("ny-shutter-seg block w-full", i < target && "is-done", i === target && (autoActive ? "is-active" : "is-done"))}>
                  <span />
                </span>
              </button>
            ))}
            {autoActive && (
              <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                className="ml-1 grid size-7 shrink-0 place-items-center rounded-pill bg-surface-0/80 text-brand-primary">
                {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
