/* ── Route paths, grouped by category (single source of truth) ─────────── */

export const HOME_PATHS = {
  landing: "/",               // H-1
  about: "/about",            // H-2
  professions: "/professions", // H-3
  foundation: "/foundation",  // H-4
  events: "/events",          // H-5
  gallery: "/gallery",        // H-6
  contact: "/contact",        // H-7
} as const;

export const AUTH_PATHS = {
  signup: "/auth/signup",           // A-1
  signin: "/signin",                // A-2 (canonical alias)
  signinSpecCanonical: "/auth/signin", // A-2 (blueprint path)
  join: "/join",                    // A-1 alias used across the site
  onboard: "/auth/onboard",         // A-3
  createFamily: "/auth/create-family",// A-4
  forgot: "/auth/forgot-password",  // A-5
  reset: "/auth/reset-password",    // A-6
  verify: "/auth/verify-otp",       // A-7
  twoFA: "/auth/2fa",               // A-8
} as const;

export const LEGAL_PATHS = {
  privacy: "/privacy",
  terms: "/terms",
} as const;
