/* ── S13 · CTA + footer — join funnel and family-office contact ──────────── */

import { Link } from "react-router-dom";
import { ArrowRight, Mail, Globe2, ShieldCheck, Accessibility } from "lucide-react";
import Reveal from "./Reveal";
import { Crest } from "./Logo";
import { FOOTER } from "../../data/home/landing";

const FOOTER_FAMILY = [
  { label: "About", to: "/about" },
  { label: "Professions", to: "/professions" },
  { label: "Foundation", to: "/foundation" },
  { label: "Events", to: "/events" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
];

const FOOTER_RESOURCES = [
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Sign in", to: "/signin" },
  { label: "Join the family", to: "/join" },
];

interface CtaProps {
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  copy?: string;
  primary?: { label: string; to: string };
  secondary?: { label: string; to: string };
}

export default function CtaFooter({
  eyebrow = "Old and young together",
  title = "Sign in to your family.",
  titleAccent = "Or start one.",
  copy = "The tree, the pool and the memories are waiting. No password needed to receive money — a 4-digit PIN is all it takes.",
  primary = { label: "Sign in", to: "/signin" },
  secondary = { label: "Join the family", to: "/join" },
}: CtaProps = {}) {
  const year = new Date().getFullYear();
  return (
    <>
      {/* ── CTA ── */}
      <section aria-label="Get started" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <div className="ny-cta-rings relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-brand-primary-deep px-6 py-14 text-center shadow-panel sm:px-12 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_0%,rgba(212,164,55,0.20),transparent_60%)]" aria-hidden="true" />
            <div className="relative">
              <span className="ny-eyebrow border-white/25! bg-white/10! text-brand-accent!">
                <Accessibility className="size-3.5" aria-hidden="true" />
                {eyebrow}
              </span>
              <h2 className="mx-auto mt-5 max-w-3xl font-display text-3xl font-semibold leading-[1.06] tracking-[-0.02em] text-surface-0 sm:text-5xl">
                {title}
                <br />
                <em className="font-display italic font-medium text-brand-accent">{titleAccent}</em>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-surface-2/80">
                {copy}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link to={primary.to} className="ny-btn-gold ny-touch">
                  {primary.label}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link to={secondary.to} className="ny-btn-ghost ny-touch bg-white/10! border-white/30! text-surface-0! hover:bg-white/15!">
                  {secondary.label}
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold text-surface-2/70">
                <span className="ny-chip border-white/20! bg-white/10! text-surface-2/80!"><ShieldCheck className="size-3.5 text-brand-accent" aria-hidden="true" />Phase 1: frontend-only</span>
                <span className="ny-chip border-white/20! bg-white/10! text-surface-2/80!"><Globe2 className="size-3.5 text-brand-accent" aria-hidden="true" />Kenya-first</span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-3/60 bg-surface-0 px-4 pb-8 pt-14 sm:px-6 lg:px-8" aria-label="Footer">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-12">
            {/* brand */}
            <div className="md:col-span-5">
              <Link to="/" className="flex items-center gap-3" aria-label="Nalyanya — home">
                <Crest className="h-11 w-11" />
                <span className="leading-tight">
                  <span className="block font-display text-2xl font-semibold tracking-tight text-brand-primary">Nalyanya</span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-text-tertiary">{FOOTER.motto} — {FOOTER.mottoCopy}</span>
                </span>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary">{FOOTER.tagline}</p>
              <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-text-tertiary">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-primary" aria-hidden="true" />
                {FOOTER.privacy}
              </p>
            </div>

            {/* family */}
            <nav className="md:col-span-2" aria-label="Family pages">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-tertiary">Family</h3>
              <ul className="mt-4 space-y-2.5">
                {FOOTER_FAMILY.map((l) => (
                  <li key={l.to}><Link to={l.to} className="text-sm font-semibold text-text-secondary transition-colors hover:text-brand-primary">{l.label}</Link></li>
                ))}
              </ul>
            </nav>

            {/* resources */}
            <nav className="md:col-span-2" aria-label="Resources">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-tertiary">Resources</h3>
              <ul className="mt-4 space-y-2.5">
                {FOOTER_RESOURCES.map((l) => (
                  <li key={l.to}><Link to={l.to} className="text-sm font-semibold text-text-secondary transition-colors hover:text-brand-primary">{l.label}</Link></li>
                ))}
              </ul>
            </nav>

            {/* contact */}
            <div className="md:col-span-3">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-tertiary">Family office</h3>
              <a href={`mailto:${FOOTER.email}`} className="mt-4 flex items-center gap-2 text-sm font-semibold text-brand-primary hover:underline">
                <Mail className="size-4" aria-hidden="true" />
                {FOOTER.email}
              </a>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{FOOTER.locations}</p>
              <p className="mt-3 text-[11px] leading-relaxed text-text-tertiary">
                All integrations shown are SIMULATED in this frontend-only build.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-surface-3/60 pt-6 text-xs font-medium text-text-tertiary sm:flex-row">
            <p>© {year} Nalyanya · {FOOTER.locations}</p>
            <p className="flex items-center gap-2">
              <span className="size-1.5 rounded-pill bg-brand-accent" aria-hidden="true" />
              React · Vite · three.js · GSAP · Tailwind — frontend-only build
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
