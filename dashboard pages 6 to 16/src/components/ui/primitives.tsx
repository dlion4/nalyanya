"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* Reveal on scroll — .ny-reveal + IntersectionObserver (nalyanyaMO.md §2.3) */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "tr";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => setSeen(true), 0);
      return () => window.clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSeen(true);
            io.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Comp = Tag as "div";
  return (
    <Comp
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`ny-reveal ${seen ? "is-in" : ""} ${className}`}
      style={{ ["--ny-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Comp>
  );
}

/* Count-up — snaps to value under reduced motion */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1200,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      (window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        document.documentElement.dataset.nyMode === "elder");
    if (reduce) {
      const t = window.setTimeout(() => setN(value), 0);
      return () => window.clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || started.current) return;
          started.current = true;
          const t0 = performance.now();
          const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(Math.round(value * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={`ny-num ${className}`}>
      {prefix}
      {n.toLocaleString("en-KE")}
      {suffix}
    </span>
  );
}

/* Progress ring — SVG stroke-dashoffset draw */
export function Ring({
  pct,
  size = 58,
  stroke = 6,
  gold = false,
  label,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  gold?: boolean;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setDrawn(pct), 120);
    return () => window.clearTimeout(id);
  }, [pct]);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="ny-ring-track" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={c - (c * Math.min(100, Math.max(0, drawn))) / 100}
          className={`ny-ring-fill ${gold ? "is-gold" : ""}`}
        />
      </svg>
      <span className="ny-hud absolute inset-0 grid place-items-center !text-[0.6rem] !tracking-tight text-text-secondary">
        {label ?? `${pct}%`}
      </span>
    </div>
  );
}

/* Multi-step wizard progress */
export function Stepper({ total, current, labels }: { total: number; current: number; labels: string[] }) {
  return (
    <div className="mb-4">
      <div className="cc-steps">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`cc-step ${i < current ? "is-done" : ""} ${i === current ? "is-active" : ""}`}
            aria-hidden
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="ny-hud">
          Step {current + 1} / {total}
        </p>
        <p className="text-xs font-semibold text-text-secondary">{labels[current]}</p>
      </div>
    </div>
  );
}

/* Tabs — simple controlled set, underline indicator */
export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="cc-tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          className="cc-tab"
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
