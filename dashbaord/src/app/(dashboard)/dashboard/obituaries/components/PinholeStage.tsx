import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { animate } from "motion/react";
import { ChevronLeft, ChevronRight, Focus } from "lucide-react";
import type { MemorialPhoto } from "@/data/dashboard/obituaries";
import { cn } from "@/lib/format";

/* ═══════════════════════════════════════════════════════════════════════
   CAMERA STAGE
   A photographic viewfinder that changes exposure the way a camera does:
   the shutter closes onto a focus point, the frame is swapped while the
   blades are shut, then the blades open onto the new photograph.

   · "pinhole" — the blades stop at a small hole, like a pinhole camera.
   · "iris"    — the blades close completely to a point.

   Elder Mode and prefers-reduced-motion skip the animation and swap the
   exposure instantly; the information is identical either way.
   ═══════════════════════════════════════════════════════════════════════ */

const CLOSE_EASE = [0.65, 0, 0.35, 1] as const;
const OPEN_EASE = [0.16, 1, 0.3, 1] as const;

export type ShutterStyle = "pinhole" | "iris";

export interface PinholeStageProps {
  photos: MemorialPhoto[];
  index: number;
  onIndexChange?: (index: number) => void;
  style?: ShutterStyle;
  focus?: { x: number; y: number };
  calm?: boolean;
  className?: string;
  /** Hides the camera chrome (counters, aperture readout, buttons). */
  bare?: boolean;
  label?: string;
  priority?: boolean;
}

export function PinholeStage({
  photos,
  index,
  onIndexChange,
  style = "pinhole",
  focus = { x: 50, y: 46 },
  calm = false,
  className,
  bare = false,
  label = "Family photographs",
  priority = false,
}: PinholeStageProps) {
  const [shown, setShown] = useState(index);
  const [progress, setProgress] = useState(0);
  const [flash, setFlash] = useState(0);
  const busy = useRef(false);
  const first = useRef(true);
  const fx = Math.min(96, Math.max(4, focus.x));
  const fy = Math.min(96, Math.max(4, focus.y));
  const current = photos[shown] ?? photos[0];

  const swap = useCallback(
    async (to: number) => {
      if (busy.current || !photos.length) return;
      busy.current = true;
      if (calm) {
        setShown(to);
        busy.current = false;
        return;
      }
      /* 1 · close the shutter onto the focus point */
      await animate(0, 1, {
        duration: 0.42,
        ease: CLOSE_EASE,
        onUpdate: (v) => setProgress(v),
      });
      /* 2 · change the exposure while the blades are shut */
      setShown(to);
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
      /* 3 · open onto the new frame */
      await animate(1, 0, {
        duration: 0.78,
        ease: OPEN_EASE,
        onUpdate: (v) => setProgress(v),
      });
      setFlash(1);
      window.setTimeout(() => setFlash(0), 260);
      busy.current = false;
    },
    [calm, photos.length],
  );

  useEffect(() => {
    if (first.current) {
      first.current = false;
      setShown(index);
      return;
    }
    if (index === shown) return;
    void swap(index);
  }, [index, shown, swap]);

  const step = (dir: 1 | -1) => {
    const next = (index + dir + photos.length) % photos.length;
    onIndexChange?.(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  /* The hole the light passes through: wide open → a pinhole (or shut). */
  const openHole = 150;
  const closedHole = style === "pinhole" ? 4.6 : 0;
  const hole = openHole - progress * (openHole - closedHole);

  return (
    <div
      className={cn("ny-memorial-stage", className)}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      style={
        {
          "--cx": `${fx}%`,
          "--cy": `${fy}%`,
          "--hole": `${hole.toFixed(2)}%`,
          "--spin": `${(progress * 34).toFixed(2)}deg`,
        } as React.CSSProperties
      }
    >
      {current && (
        <img
          key={current.id}
          className="ny-memorial-plate"
          src={current.src}
          alt={current.alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
        />
      )}

      {/* The shutter body — everything outside the aperture is dark. */}
      <span className="ny-memorial-blades" aria-hidden>
        <i className="ny-memorial-seam" />
      </span>

      {/* The exposure fires: a soft bloom as the blades reopen. */}
      <span
        className="ny-memorial-flash"
        aria-hidden
        style={{ opacity: flash }}
      />

      {/* Viewfinder brackets */}
      <span className="ny-vf ny-vf-tl" aria-hidden />
      <span className="ny-vf ny-vf-tr" aria-hidden />
      <span className="ny-vf ny-vf-bl" aria-hidden />
      <span className="ny-vf ny-vf-br" aria-hidden />

      {!bare && (
        <div className="ny-memorial-chrome">
          <span className="ny-memorial-readout">
            <Focus size={12} aria-hidden />
            <span className="ny-num">
              {String(shown + 1).padStart(2, "0")}
              <b> / </b>
              {String(photos.length).padStart(2, "0")}
            </span>
          </span>
          <span className="ny-memorial-settings" aria-hidden>
            f/2.8 · 1/125 · ISO 200
          </span>
          <span className="ny-memorial-arrows">
            <button
              type="button"
              aria-label="Previous photograph"
              onClick={() => step(-1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              aria-label="Next photograph"
              onClick={() => step(1)}
            >
              <ChevronRight size={16} />
            </button>
          </span>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Small building blocks shared by the remembrance page.
   ───────────────────────────────────────────────────────────────────── */

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

/** An accessible tab strip with arrow-key navigation. */
export function MemorialTabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = items.findIndex((i) => i.id === value);
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % items.length
        : (index - 1 + items.length) % items.length;
    onChange(items[next].id);
    const node = ref.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next];
    node?.focus();
  };
  return (
    <div
      ref={ref}
      role="tablist"
      className={cn("ny-memorial-tabs", className)}
      onKeyDown={onKeyDown}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          id={`mem-tab-${item.id}`}
          aria-selected={value === item.id}
          aria-controls={`mem-panel-${item.id}`}
          tabIndex={value === item.id ? 0 : -1}
          className="ny-memorial-tab"
          onClick={() => onChange(item.id)}
        >
          {item.icon}
          {item.label}
          {item.count !== undefined && (
            <span className="ny-memorial-tab-count ny-num">{item.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function MemorialTabPanel({
  id,
  active,
  children,
}: {
  id: string;
  active: string;
  children: ReactNode;
}) {
  if (id !== active) return null;
  return (
    <div
      role="tabpanel"
      id={`mem-panel-${id}`}
      aria-labelledby={`mem-tab-${id}`}
      tabIndex={0}
      className="ny-memorial-panel"
    >
      {children}
    </div>
  );
}

/** A labelled form field. The control is wrapped, so the association is implicit. */
export function Field({
  label,
  hint,
  children,
  required,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="ny-memorial-field">
      <span className="ny-memorial-label">
        {label}
        {required && <em aria-hidden> *</em>}
      </span>
      <span className="ny-memorial-control">{children}</span>
      {hint && <span className="ny-memorial-hint">{hint}</span>}
    </label>
  );
}

/** The wizard's progress rail. */
export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  return (
    <ol className="ny-memorial-stepper">
      {steps.map((label, index) => (
        <li
          key={label}
          className={cn(
            "ny-memorial-step",
            index < current && "is-done",
            index === current && "is-current",
          )}
          aria-current={index === current ? "step" : undefined}
        >
          <span className="ny-memorial-step-dot ny-num">
            {index < current ? "✓" : index + 1}
          </span>
          <span className="ny-memorial-step-label">{label}</span>
        </li>
      ))}
    </ol>
  );
}

/** A small status pill. */
export function MemorialChip({
  children,
  tone = "quiet",
  icon,
}: {
  children: ReactNode;
  tone?: "quiet" | "gold" | "sage" | "clay" | "violet" | "danger";
  icon?: ReactNode;
}) {
  return (
    <span className={`ny-memorial-chip is-${tone}`}>
      {icon}
      {children}
    </span>
  );
}

/** A candle flame that breathes. */
export function Candle({ lit = true }: { lit?: boolean }) {
  return (
    <span className={cn("ny-candle", lit && "is-lit")} aria-hidden>
      <i className="ny-candle-flame" />
      <i className="ny-candle-body" />
    </span>
  );
}

export type { MemorialPhoto } from "@/data/dashboard/obituaries";
