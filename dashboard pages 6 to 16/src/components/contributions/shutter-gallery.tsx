"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, Maximize2, X } from "lucide-react";
import { frames as allFrames, type Frame } from "@/data/dashboard/contributions";

/* --------------------------------------------------------------------- */
/* ShutterStage — camera pinhole transition between two photographic frames */
/* Sequence: iris slams to a pinhole (400ms) → exposure flash → iris opens */
/* on the next frame (440ms) while the frame counter ticks.               */
/* --------------------------------------------------------------------- */

type Phase = "idle" | "closing" | "opening";

export function ShutterStage({
  frames = allFrames,
  index,
  onIndexChange,
  variant = "stage",
  onClose,
}: {
  frames?: Frame[];
  index: number;
  onIndexChange: (i: number) => void;
  variant?: "stage" | "lightbox";
  onClose?: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [shown, setShown] = useState(index);
  const [auto, setAuto] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  /* transition state machine */
  useEffect(() => {
    let t: number | undefined;
    if (index === shown) {
      if (phase === "opening") t = window.setTimeout(() => setPhase("idle"), 450);
    } else if (phase === "idle") {
      t = window.setTimeout(() => setPhase("closing"), 0);
    } else if (phase === "closing") {
      t = window.setTimeout(() => {
        setShown(index);
        setPhase("opening");
      }, 400);
    } else {
      t = window.setTimeout(() => setPhase("closing"), 450);
    }
    return () => window.clearTimeout(t);
  }, [index, shown, phase]);

  /* auto-advance (parked under reduced motion / elder mode) */
  useEffect(() => {
    if (!auto) return;
    const reduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.nyMode === "elder";
    if (reduce) {
      const off = window.setTimeout(() => setAuto(false), 0);
      return () => window.clearTimeout(off);
    }
    const id = window.setInterval(() => onIndexChange((shown + 1) % frames.length), 5200);
    return () => window.clearInterval(id);
  }, [auto, shown, frames.length, onIndexChange]);

  const frame = frames[shown];
  const closing = phase === "closing";
  const clip = closing ? "circle(0% at 50% 50%)" : "circle(92% at 50% 50%)";
  const fStop = closing ? "f/16" : phase === "opening" ? "f/2.8" : "f/1.8";

  const go = (dir: -1 | 1) => onIndexChange((index + dir + frames.length) % frames.length);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (variant === "lightbox") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 4.5, y: px * 5.5 });
  };

  return (
    <div
      className="shutter-stage group relative"
      data-variant={variant}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{
        ["--tilt-x" as string]: `${tilt.x}deg`,
        ["--tilt-y" as string]: `${tilt.y}deg`,
      }}
    >
      {/* film gate */}
      <div className="shutter-gate">
        <div className="shutter-layer" style={{ clipPath: clip }}>
          <img
            src={frame.src}
            alt={frame.title}
            className="shutter-img"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
          <div className="shutter-scrim" />
        </div>

        {/* aperture iris — gold lens ring driven by the same phase */}
        <svg className="shutter-iris" viewBox="0 0 100 100" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--color-brand-accent)"
            strokeWidth="0.5"
            strokeDasharray="2 3"
            className={closing ? "is-closing" : ""}
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(250,246,238,0.65)"
            strokeWidth="0.35"
            className={closing ? "is-closing" : ""}
          />
          <g className={closing ? "is-closing" : ""}>
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="50"
                x2="50"
                y2="4"
                stroke="rgba(250,246,238,0.35)"
                strokeWidth="0.3"
                transform={`rotate(${i * 45} 50 50)`}
              />
            ))}
          </g>
        </svg>

        {/* viewfinder reticle */}
        <div className={`shutter-reticle ${phase === "opening" ? "is-on" : ""}`} aria-hidden>
          <span />
          <span />
        </div>

        {/* exposure flash at the moment the pinhole swaps frames */}
        <div className={`shutter-flash ${phase === "closing" ? "is-firing" : ""}`} aria-hidden />

        {/* HUD */}
        <div className="shutter-hud">
          <div className="flex items-start justify-between gap-3">
            <p className="ny-hud !text-[0.62rem] !text-[rgba(250,246,238,0.86)]">
              Frame {frame.frame} · {frame.lens} · {frame.exposure}
            </p>
            <div className="flex items-center gap-2">
              <p className="ny-hud !text-[0.62rem] !text-[rgba(250,246,238,0.86)]">
                {fStop} · ISO 400 · {frame.place}
              </p>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close gallery"
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/25 bg-black/35 text-[rgba(250,246,238,0.92)] backdrop-blur transition hover:bg-black/60"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between gap-4">
            <div className="max-w-[46ch]">
              <p className="shutter-title">{frame.title}</p>
              <p className="shutter-caption">{frame.caption}</p>
            </div>
            <p className="shutter-counter ny-num" aria-live="polite">
              {frame.frame}
            </p>
          </div>
        </div>

        {/* mechanical controls */}
        <div className="shutter-controls">
          <button type="button" onClick={() => go(-1)} aria-label="Previous frame" className="shutter-nav">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next frame" className="shutter-nav">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* under-stage: frame counter strip + transport controls */}
      <div className="shutter-transport">
        <div className="shutter-sprocket-x h-3 w-full" aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAuto((a) => !a)}
              className="ny-btn ny-btn-outline ny-btn-sm"
              aria-pressed={auto}
            >
              {auto ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {auto ? "Stop transport" : "Auto advance"}
            </button>
            <span className="ny-hud">
              {String(index + 1).padStart(2, "0")} / {String(frames.length).padStart(2, "0")}
            </span>
          </div>
          <p className="ny-hud hidden sm:block">Iris · pinhole · exposure — click a frame to switch</p>
        </div>
      </div>
    </div>
  );
}

/* Thumbnail contact strip under the stage */
export function FrameStrip({
  frames = allFrames,
  index,
  onIndexChange,
}: {
  frames?: Frame[];
  index: number;
  onIndexChange: (i: number) => void;
}) {
  return (
    <div className="ny-scroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-2" role="tablist" aria-label="Film frames">
      {frames.map((f, i) => (
        <button
          key={f.id}
          type="button"
          role="tab"
          aria-selected={i === index}
          onClick={() => onIndexChange(i)}
          className={`group/thumb relative w-[124px] shrink-0 overflow-hidden rounded-md border-2 text-left transition-all duration-200 ${
            i === index
              ? "-translate-y-0.5 border-brand-accent shadow-[var(--shadow-lift)]"
              : "border-border-subtle opacity-75 hover:-translate-y-0.5 hover:opacity-100"
          }`}
        >
          <img src={f.src} alt="" className="h-16 w-full object-cover" loading="lazy" decoding="async" />
          <span className="flex items-center justify-between gap-1 bg-surface-2 px-1.5 py-1">
            <span className="ny-hud !text-[0.58rem]">{f.frame}</span>
            <span className="ny-hud !text-[0.58rem] truncate">{f.lens}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/* Lightbox — the stage at full size, opened from the section */
export function ShutterLightbox({
  open,
  onClose,
  index,
  onIndexChange,
  frames = allFrames,
}: {
  open: boolean;
  onClose: () => void;
  index: number;
  onIndexChange: (i: number) => void;
  frames?: Frame[];
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange((index + 1) % frames.length);
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + frames.length) % frames.length);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, index, onClose, onIndexChange, frames]);

  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[110] flex flex-col bg-[rgba(10,14,11,0.94)] px-3 py-4 backdrop-blur-sm sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      role="dialog"
      aria-modal="true"
      aria-label="Gallery lightbox"
    >
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 pb-3">
        <p className="ny-hud !text-[rgba(250,246,238,0.75)]">Nalyanya contact sheet · frames behind the causes</p>
        <div className="flex items-center gap-2">
          <span className="ny-hud !text-[rgba(250,246,238,0.75)]">
            {String(index + 1).padStart(2, "0")} / {String(allFrames.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ny-btn ny-btn-accent ny-btn-sm"
            aria-label="Close lightbox"
          >
            <X className="h-4 w-4" /> Close
          </button>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1200px] min-h-0 flex-1">
        <div className="h-full">
          <ShutterStage frames={frames} index={index} onIndexChange={onIndexChange} variant="lightbox" onClose={onClose} />
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1200px] pt-3">
        <FrameStrip frames={frames} index={index} onIndexChange={onIndexChange} />
      </div>
    </motion.div>
  );
}

export function ExpandButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="ny-btn ny-btn-accent ny-btn-sm">
      <Maximize2 className="h-3.5 w-3.5" /> Open contact sheet
    </button>
  );
}
