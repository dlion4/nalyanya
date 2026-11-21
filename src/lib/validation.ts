/* ── Shared field validators — plain language, EAT-land defaults ──────────── */

import { KENYA_PHONE_RE } from "../data/auth/families";

export function phoneOK(value: string): boolean {
  return KENYA_PHONE_RE.test(value.trim());
}

export function emailOK(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/** Returns null when the password is acceptable, otherwise one thing to fix. */
export function passwordIssue(password: string): string | null {
  if (password.length < 8) return "At least 8 characters.";
  if (!/[A-Za-z]/.test(password)) return "Include a letter.";
  if (!/\d/.test(password)) return "Include a number.";
  if (/\s/.test(password)) return "No spaces, please.";
  return null;
}

/** A short ticket reference from a namespaced prefix, seeded by Web Crypto. */
export function makeRef(prefix: string): string {
  const buf = new Uint32Array(1);
  const c = globalThis.crypto;
  if (c && typeof c.getRandomValues === "function") c.getRandomValues(buf);
  else buf[0] = Math.floor(Math.random() * 2 ** 32);
  return `${prefix}-${new Date().getFullYear()}-${String(1000 + (buf[0] % 9000))}`;
}
