"use client";

import { useAnimate, useReducedMotion } from "framer-motion";
import { Aperture, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/format";

export interface ReelSlide {
  src: string;
  alt: string;
  caption: string;
  year: string;
  place: string;
}

/** Six-blade aperture polygon. radius 0 = closed pinhole; ~112 covers the frame. */
export function irisPolygon(radius: number, rotation: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = ((rotation + i * 60) * Math.PI) / 180;
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    points.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${points.join(", ")})`;
}

const APERTURE_OPEN = irisPolygon(112, 0);
const APERTURE_PINHOLE = irisPolygon(0, 30);

/**
 * Camera-shutter photo reel: the aperture closes to a pinhole, the exposure
 * swaps to the next photo, then a flash + iris opens on the new frame.
 */
export function IrisReel({ slides, interval = 5200, className }: { slides: ReelSlide[]; interval?: number; className?: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const indexRef = useRef(0);
  const busyRef = useRef(false);
  const flashRef = useRef<HTMLDivElement>(null);
  const [scope, animateEl] = useAnimate<HTMLDivElement>();
  const reduced = useReducedMotion();
  const count = slides.length;

  const go = useCallback(
    async (target: number) => {
      const next = ((target % count) + count) % count;
      if (busyRef.current || next === indexRef.current) return;
      busyRef.current = true;
      const frame = scope.current;
      if (reduced || !frame) {
        indexRef.current = next;
        setIndex(next);
        busyRef.current = false;
        return;
      }
      await animateEl(frame, { clipPath: [APERTURE_OPEN, APERTURE_PINHOLE] }, { duration: 0.42, ease: [0.65, 0, 0.35, 1] });
      indexRef.current = next;
      setIndex(next);
      if (flashRef.current) {
        void animateEl(flashRef.current, { opacity: [0, 0.8, 0] }, { duration: 0.55, ease: "easeOut" });
      }
      await animateEl(frame, { clipPath: [APERTURE_PINHOLE, APERTURE_OPEN] }, { duration: 0.8, ease: [0.16, 1, 0.3, 1] });
      busyRef.current = false;
    },
    [count, reduced, animateEl, scope],
  );

  useEffect(() => {
    if (paused || reduced || count < 2) return;
    const id = window.setInterval(() => {
      if (!document.hidden) void go(indexRef.current + 1);
    }, interval);
    return () => window.clearInterval(id);
  }, [paused, reduced, count, interval, go]);

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") void go(indexRef.current + 1);
    if (event.key === "ArrowLeft") void go(indexRef.current - 1);
  };

  const slide = slides[index];
  const frameNumber = `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;

  return (
    <div className={cn("ny-reel", className)}>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Family photo archive. Use arrow keys to change photos."
        tabIndex={0}
        onKeyDown={onKey}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className="ny-reel-stage relative aspect-[16/10] w-full overflow-hidden rounded-[26px] bg-brand-deep"
      >
        <div ref={scope} className="ny-reel-aperture absolute inset-0" style={{ clipPath: APERTURE_OPEN }}>
          {slide && (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              decoding="async"
              draggable={false}
              className="ny-reel-img h-full w-full object-cover"
            />
          )}
        </div>
        <div ref={flashRef} aria-hidden className="pointer-events-none absolute inset-0 bg-white opacity-0" />

        {/* Viewfinder HUD */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="ny-corner ny-corner-tl" />
          <span className="ny-corner ny-corner-tr" />
          <span className="ny-corner ny-corner-bl" />
          <span className="ny-corner ny-corner-br" />
        </div>
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
          <span className="size-2 animate-ny-rec rounded-full bg-[#ff5c4d]" aria-hidden />
          REC · {frameNumber}
        </div>
        <div className="absolute right-4 top-4 hidden rounded-full bg-black/35 px-3 py-1.5 font-mono text-[11px] text-white/90 backdrop-blur-md sm:block">
          f/2.8 · 1/125 · ISO 200
        </div>

        {slide && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-5 pt-16 text-white sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-accent">
              {slide.year} · {slide.place}
            </p>
            <p className="ny-title mt-1 text-xl !text-white sm:text-2xl">{slide.caption}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void go(indexRef.current - 1)}
            aria-label="Previous photo"
            className="ny-btn ny-btn-ghost ny-btn-sm size-10 !p-0"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => void go(indexRef.current + 1)}
            aria-label="Next photo (shutter)"
            className="ny-btn ny-btn-primary ny-btn-sm"
          >
            <Aperture className="size-4" />
            Shutter
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="ny-btn ny-btn-ghost ny-btn-sm"
            aria-pressed={paused}
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            onClick={() => void go(indexRef.current + 1)}
            aria-label="Next photo"
            className="ny-btn ny-btn-ghost ny-btn-sm size-10 !p-0"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a photo">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => void go(i)}
              aria-label={`Show photo ${i + 1}: ${s.caption}`}
              aria-current={i === index}
              className={cn(
                "ny-reel-thumb size-11 overflow-hidden rounded-xl border-2 transition",
                i === index ? "border-brand-accent scale-105" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <img src={s.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
