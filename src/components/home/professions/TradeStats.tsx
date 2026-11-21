/* ── H-3 S2 · Count-up strip ─────────────────────────────────────────────── */

import { BadgeCheck, MapPinned, Users, Wrench } from "lucide-react";
import { CATEGORIES, PROFESSIONALS } from "../../../data/home/professions";
import { useCountUp, useInView } from "../../../lib/hooks";

const ITEMS = [
  { icon: Users, value: PROFESSIONALS.length, suffix: "", label: "People listed" },
  { icon: Wrench, value: CATEGORIES.length, suffix: "", label: "Trades" },
  { icon: MapPinned, value: 4, suffix: "", label: "Counties covered" },
  { icon: BadgeCheck, value: PROFESSIONALS.filter((p) => p.verified && !p.family).length, suffix: "", label: "Friends verified" },
];

function Stat({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const n = useCountUp(value, { start: inView, duration: 1200 });
  return (
    <div ref={ref} className="ny-card flex items-center gap-4 rounded-2xl p-5">
      <span className="ny-icon-chip"><Icon className="size-5" aria-hidden="true" /></span>
      <span>
        <span className="ny-num block font-display text-3xl font-semibold text-brand-primary">{n}</span>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-text-tertiary">{label}</span>
      </span>
    </div>
  );
}

export default function TradeStats() {
  return (
    <section aria-label="Directory numbers" className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {ITEMS.map((s) => <Stat key={s.label} {...s} />)}
      </div>
      <p className="mt-3 text-center text-xs font-medium text-text-tertiary">Counts are of this public list only. Full member records stay behind sign-in.</p>
    </section>
  );
}
