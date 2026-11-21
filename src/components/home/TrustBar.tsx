/* ── S3 · Trust bar — marquee of integration + accessibility promises ─────── */

import { TRUST_BADGES } from "../../data/home/landing";

export default function TrustBar() {
  const items = [...TRUST_BADGES, ...TRUST_BADGES]; // seamless loop
  return (
    <div id="trust" className="ny-marquee relative border-y border-surface-3/60 bg-surface-2/70 py-3" role="list" aria-label="Trust signals">
      <div className="ny-marquee-track [animation-play-state:running]">
        {items.map((badge, i) => (
          <span
            key={`${badge.label}-${i}`}
            role="listitem"
            className="inline-flex shrink-0 items-center gap-2.5 rounded-pill px-2 text-[13px] font-semibold text-text-secondary"
          >
            <badge.icon className="size-4 text-brand-primary" aria-hidden="true" />
            {badge.label}
            <span className="ml-1 size-1 rounded-pill bg-brand-accent" aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
}
