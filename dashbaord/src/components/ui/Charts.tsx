"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/format";

/** Smooth-ish area chart in SVG. Path draws in via .ny-draw (page CSS). */
export function AreaChart({
  values,
  height = 260,
  color = "#1F4D3A",
  className,
  label,
}: {
  values: number[];
  height?: number;
  color?: string;
  className?: string;
  label: string;
}) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const W = 640;
  const H = height;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / Math.max(1, values.length - 1)) * W;
    const y = H - 14 - ((v - min) / span) * (H - 34);
    return [x, y] as const;
  });
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${line} L${W} ${H} L0 ${H} Z`;
  const gridYs = [0.2, 0.4, 0.6, 0.8].map((t) => H * t);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      className={cn("h-full w-full overflow-visible", className)}
    >
      <defs>
        <linearGradient id={`area-${rawId}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridYs.map((y) => (
        <line key={y} x1="0" x2={W} y1={y} y2={y} stroke={color} strokeOpacity="0.08" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
      ))}
      <path d={area} fill={`url(#area-${rawId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={2.6}
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={1}
        vectorEffect="non-scaling-stroke"
        className="ny-draw"
      />
    </svg>
  );
}

/** Tiny inline sparkline (no axes). */
export function Sparkline({ values, color = "#1F4D3A", className }: { values: number[]; color?: string; className?: string }) {
  const W = 120;
  const H = 36;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const d = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * W;
      const y = H - 4 - ((v - min) / span) * (H - 8);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={cn("h-9 w-full", className)} aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Horizontal meter that grows in on mount. */
export function BarMeter({ value, max, color = "#1F4D3A", className }: { value: number; max: number; color?: string; className?: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setOn(true));
    return () => window.cancelAnimationFrame(id);
  }, []);
  const width = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-surface-2", className)}>
      <div
        className="h-full rounded-full transition-[width] duration-[900ms] ease-out"
        style={{ width: on ? `${width}%` : "0%", background: color }}
      />
    </div>
  );
}
