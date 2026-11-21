/* ── S12 · Integrations — capability matrix, all SIMULATED ───────────────── */

import { GitBranch } from "lucide-react";
import Reveal from "./Reveal";
import { INTEGRATIONS } from "../../data/home/landing";

export default function Integrations() {
  return (
    <section aria-label="Integrations — status matrix" className="border-y border-surface-3/60 bg-surface-2/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <span className="ny-section-label">Integrations</span>
          <h2 className="ny-heading mt-3 max-w-2xl text-3xl sm:text-4xl">
            Built to connect — <em className="font-display italic font-medium text-brand-secondary">honest about it.</em>
          </h2>
          <p className="ny-prose mt-3 max-w-2xl">
            Every integration is drawn in full — forms, validations, receipts, statuses — and stops at the exact boundary where a real backend would connect. Nothing pretends to be sent.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <ul className="mt-9 divide-y divide-surface-3/70 overflow-hidden rounded-2xl border border-surface-3/60 bg-surface-1 shadow-card">
            {INTEGRATIONS.map((item) => (
              <li key={item.name} className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-brand-primary-tint/40">
                <span className="ny-icon-chip size-10">
                  <item.icon className="size-4.5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-semibold text-text-primary">{item.name}</p>
                  <p className="truncate text-sm text-text-secondary">{item.capability}</p>
                </div>
                <span className="ny-sim-badge">SIMULATED</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs font-medium text-text-tertiary">
          <GitBranch className="size-3.5" aria-hidden="true" />
          Phase 1 is frontend-only — Phase 2 wires each service to its real API (same names, same signatures).
        </p>
      </div>
    </section>
  );
}
