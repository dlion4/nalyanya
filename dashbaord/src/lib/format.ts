/* Formatting helpers — deterministic (no Intl locale drift between server and browser). */

export const DATA_YEAR = 2026;

export function groupDigits(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** KES amounts. compact → "KES 1.2M" / "KES 480K". */
export function kes(value: number, options: { compact?: boolean; signed?: boolean } = {}): string {
  const sign = value < 0 ? "−" : options.signed && value > 0 ? "+" : "";
  const abs = Math.abs(value);
  if (options.compact && abs >= 1_000_000) return `${sign}KES ${(abs / 1_000_000).toFixed(1)}M`;
  if (options.compact && abs >= 1_000) return `${sign}KES ${Math.round(abs / 1_000)}K`;
  return `${sign}KES ${groupDigits(abs)}`;
}

export function count(value: number): string {
  return groupDigits(value);
}

/** +254 7•• ••• 042 — masked by default; reveal is gated in the UI. */
export function maskPhone(phone?: string): string {
  if (!phone) return "Not on file";
  const digits = phone.replace(/\D/g, "");
  return `+${digits.slice(0, 3)} ${digits.slice(3, 4)}•• ••• ${digits.slice(-3)}`;
}

export function ageOf(birthYear: number, deathYear?: number): number {
  return (deathYear ?? DATA_YEAR) - birthYear;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function pct(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
