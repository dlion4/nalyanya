"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/format";

export type ShutterStyle = "iris" | "pinhole";

/** Six-blade aperture polygon centred on (cx, cy) in %. radius 0 = fully closed. */
export function apertureAt(radius: number, cx: number, cy: number, rotation = 0): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = ((rotation + i * 60) * Math.PI) / 180;
    pts.push(`${(cx + radius * Math.cos(a)).toFixed(2)}% ${(cy + radius * Math.sin(a)).toFixed(2)}%`);
  }
  return `polygon(${pts.join(", ")})`;
}

/**
 * Radius (in % of the frame) at which a hexagon centred at (cx, cy) fully
 * clears the frame. A hexagon's corners reach its circumradius but its flat
 * edges sit only at r·cos(30°), so sizing by the corners alone would clip the
 * frame's corners. Divide by cos(30°) so the *edges* clear the frame.
 */
function coverRadius(cx: number, cy: number): number {
  const farthest = Math.hypot(Math.max(cx, 100 - cx), Math.max(cy, 100 - cy));
  return farthest / Math.cos(Math.PI / 6) + 6;
}

const CLOSE_EASE = [0.65, 0, 0.35, 1] as const;
const OPEN_EASE = [0.16, 1, 0.3, 1] as const;

export interface ShutterFrameProps {
  /** Unique key per frame. Changing it runs the shutter transition. */
  frameKey: string;
  /** Where the aperture closes to, 0–100. Defaults to the centre. */
  focus?: { x: number; y: number };
  /** "iris" closes fully; "pinhole" leaves a small opening, like a camera pinhole. */
  shutterStyle?: ShutterStyle;
  /** Disables transitions (reduced motion, Elder Mode). */
  calm?: boolean;
  className?: string;
  onBusyChange?: (busy: boolean) => void;
  /** Render the frame to display. Called with the key currently on screen. */
  renderFrame: (shownKey: string) => ReactNode;
}

/**
 * A camera shutter between frames. Six blades close onto the focus point, the
 * exposure is swapped while they are closed, then they open onto the new frame.
 *
 * The component owns which frame is on screen, so callers can pass the newest
 * data without the swap ever being visible.
 */
export function ShutterFrame({
  frameKey,
  focus,
  shutterStyle = "iris",
  calm = false,
  className,
  onBusyChange,
  renderFrame,
}: ShutterFrameProps) {
  const fx = Math.min(96, Math.max(4, focus?.x ?? 50));
  const fy = Math.min(96, Math.max(4, focus?.y ?? 50));
  const open = apertureAt(coverRadius(fx, fy), fx, fy, 0);
  const closed = shutterStyle === "pinhole" ? apertureAt(3.4, fx, fy, 30) : apertureAt(0.01, fx, fy, 30);

  const [shown, setShown] = useState(frameKey);
  const [progress, setProgress] = useState(0);
  const aperture = useRef<HTMLDivElement>(null);
  const dial = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const queued = useRef<string | null>(null);
  const reduced = useReducedMotion();
  const still = calm || Boolean(reduced);

  const report = useCallback((value: boolean) => onBusyChange?.(value), [onBusyChange]);

  const transition = useCallback(
    async (to: string) => {
      const el = aperture.current;
      /* Calm mode (reduced motion or Elder Mode): change the frame with no animation. */
      if (still || !el) {
        setShown(to);
        return;
      }
      /* Mid-transition: keep only the latest request and run it after this one. */
      if (busy.current) {
        queued.current = to;
        return;
      }
      busy.current = true;
      report(true);

      /* A 0→1 value drives both the opening and the blades, so they stay in step. */
      const track = { p: 0 };

      // 1. Close the aperture onto the focus point.
      const bladesClose = animate(track, { p: 1 }, { duration: 0.46, ease: CLOSE_EASE, onUpdate: (v) => setProgress(v.p) });
      await animate(el, { clipPath: [open, closed] }, { duration: 0.46, ease: CLOSE_EASE });
      bladesClose.stop();
      setProgress(1);

      // 2. Swap the exposure while the blades are fully closed.
      setShown(to);
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      // 3. Open onto the new frame.
      const bladesOpen = animate(track, { p: 0 }, { duration: 0.82, ease: OPEN_EASE, onUpdate: (v) => setProgress(v.p) });
      await animate(el, { clipPath: [closed, open] }, { duration: 0.82, ease: OPEN_EASE });
      bladesOpen.stop();
      setProgress(0);
      busy.current = false;
      report(false);
      if (queued.current) {
        const next = queued.current;
        queued.current = null;
        void transition(next);
      }
    },
    [closed, open, report, still],
  );

  /* Follow the frame key, but never animate on first render. */
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    void transition(frameKey);
  }, [frameKey, transition]);

  useEffect(() => () => report(false), [report]);

  /* Blade spread, derived from progress. Each blade is a rotated half-plane. */
  const bladeVars = {
    "--cx": `${fx}%`,
    "--cy": `${fy}%`,
    "--p": progress.toFixed(4),
    "--spin": shutterStyle === "pinhole" ? "30deg" : "0deg",
  } as CSSProperties;

  return (
    <div className={cn("ny-shutter relative overflow-hidden bg-brand-deep", className)}>
      <div ref={aperture} className="absolute inset-0" style={{ clipPath: open }}>
        {renderFrame(shown)}
      </div>

      {/* Six mechanical blades, visible only while the shutter is moving or closed. */}
      <div
        ref={dial}
        aria-hidden
        className="ny-iris pointer-events-none absolute inset-0 z-10"
        style={{ ...bladeVars, opacity: progress > 0.001 ? 1 : 0 }}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="ny-iris-blade" style={{ ["--i" as string]: i } as CSSProperties} />
        ))}
        <span className="ny-iris-hub" />
      </div>

      <span aria-hidden className="ny-vf ny-vf-tl" />
      <span aria-hidden className="ny-vf ny-vf-tr" />
      <span aria-hidden className="ny-vf ny-vf-bl" />
      <span aria-hidden className="ny-vf ny-vf-br" />
    </div>
  );
}
