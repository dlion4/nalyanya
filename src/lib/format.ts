/* ── Formatting helpers — KES, counts, tabular numbers ────────────────────── */

export function kes(amount: number, opts: { decimals?: number; compact?: boolean } = {}): string {
  const { decimals = 0, compact = false } = opts;
  const prefix = "KES ";
  if (compact && Math.abs(amount) >= 1_000_000) {
    const m = amount / 1_000_000;
    return `${prefix}${m % 1 === 0 ? m.toFixed(1) : m.toFixed(1)}M`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    const k = amount / 1_000;
    return `${prefix}${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return `${prefix}${amount.toLocaleString("en-KE", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}`;
}

export function kesFull(amount: number): string {
  return kes(amount);
}

export function count(n: number): string {
  return n.toLocaleString("en-KE");
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
