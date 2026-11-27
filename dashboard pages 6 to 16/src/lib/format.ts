/* Shared money + time formatting. Deterministic (no locale lookups) so SSR and
   the browser always render identical strings — no hydration drift. */

export function fmt(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function kes(n: number): string {
  return `KES ${fmt(n)}`;
}

/** KES 4.2M / KES 432K — compact for dense KPI rows. */
export function kesShort(n: number): string {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`;
  if (a >= 1_000) return `KES ${Math.round(n / 1_000)}K`;
  return kes(n);
}

export function pct(part: number, whole: number): number {
  if (whole <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((part / whole) * 100)));
}

const pad = (n: number) => String(n).padStart(2, "0");

/** 5d 06h 20m for long horizons, HH:MM:SS inside a day. */
export function clock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return d > 0 ? `${d}d ${pad(h)}h ${pad(m)}m` : `${pad(h)}:${pad(m)}:${pad(sec)}`;
}
