/* ── H-7 · The people who answer — role plus shortened name, nothing more ───── */

import { PenLine } from "lucide-react";
import Reveal from "../Reveal";
import { ROUTES, ROUTE_PHOTOS } from "../../../data/home/contact";
import { cn } from "../../../utils/cn";

export default function People({ onWrite }: { onWrite: (id: string) => void }) {
  return (
    <section id="people" className="scroll-mt-24 border-y border-surface-3/60 bg-surface-2/50 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="The people who answer">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="ny-section-label">Who answers</span>
              <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">Six people. <em className="font-medium text-brand-secondary">One inbox.</em></h2>
            </div>
            <p className="max-w-sm text-sm text-text-tertiary">Shown by role and shortened name. Their numbers and addresses are never on this page.</p>
          </div>
        </Reveal>

        <ul className="mt-10 grid gap-4 [perspective:1400px] sm:grid-cols-2 lg:grid-cols-3">
          {ROUTES.map((r, i) => {
            const photo = ROUTE_PHOTOS[r.id];
            return (
              <li key={r.id} className="h-full">
                <Reveal delay={(i % 3) * 0.06} className="h-full">
                  <article className="ny-ct-person ny-card flex h-full flex-col overflow-hidden rounded-2xl">
                    <div className={cn("relative aspect-[16/9] overflow-hidden", !photo && "grid place-items-center bg-brand-primary-deep")}>
                      {photo
                        ? <img src={photo} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                        : <r.icon className="size-10 text-brand-accent" aria-hidden="true" />}
                      <span className="absolute inset-x-3 top-3 flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0b1610] sm:inset-x-auto"
                        style={{ background: r.color }}>
                        <span className="ny-num font-semibold">{String(i + 1).padStart(2, "0")}</span>{r.role}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="font-display text-xl font-semibold text-text-primary">{r.person}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">Reads notes about {r.handles.toLowerCase()}.</p>
                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <span className="text-xs font-bold text-brand-secondary">Reply within {r.replyIn}</span>
                        <button type="button" onClick={() => onWrite(r.id)} className="ny-btn-ghost px-3.5 py-2.5 text-xs">
                          <PenLine className="size-3.5" aria-hidden="true" />Write
                        </button>
                      </div>
                    </div>
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
