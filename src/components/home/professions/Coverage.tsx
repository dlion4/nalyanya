/* ── H-3 S10 · Where help reaches — county counts, nothing finer ─────────── */

import { MapPin } from "lucide-react";
import Reveal from "../Reveal";
import { COUNTIES, PROFESSIONALS } from "../../../data/home/professions";

export default function Coverage() {
  const max = Math.max(...COUNTIES.map((c) => PROFESSIONALS.filter((p) => p.county === c).length), 1);
  return (
    <section id="coverage" className="scroll-mt-24 border-y border-surface-3/60 bg-surface-2/40 px-4 py-16 sm:px-6 sm:py-20 lg:px-8" aria-label="Where help reaches">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <span className="ny-section-label">Coverage</span>
          <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">Four counties. <em className="font-medium text-brand-secondary">Not a street.</em></h2>
          <p className="ny-prose mt-3 max-w-md">The directory says Bungoma, Kakamega, Nairobi or Trans-Nzoia. Villages, estates and plots are not on this page.</p>
          <p className="mt-4 text-sm font-semibold text-text-tertiary">Diaspora relatives ask through the family office — rides and fundi stay in Kenya.</p>
        </Reveal>
        <ul className="space-y-4">
          {COUNTIES.map((c) => {
            const n = PROFESSIONALS.filter((p) => p.county === c).length;
            return (
              <li key={c}>
                <div className="mb-1.5 flex items-center justify-between text-sm font-semibold">
                  <span className="inline-flex items-center gap-2 text-text-primary"><MapPin className="size-4 text-brand-secondary" aria-hidden="true" />{c}</span>
                  <span className="ny-num text-text-tertiary">{n} listed</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-pill bg-surface-3">
                  <div className="h-full rounded-pill bg-brand-primary" style={{ width: `${(n / max) * 100}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
