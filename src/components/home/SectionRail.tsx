/* ── SectionRail — floating glass "on this page" menu (large screens) ─────── */

import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";

export interface RailItem { id: string; label: string }

export default function SectionRail({ items }: { items: RailItem[] }) {
  const [active, setActive] = useState("");
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    items.forEach((r) => { const el = document.getElementById(r.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="On this page" className="ny-glass fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 rounded-2xl p-2 xl:block">
      <ul className="flex flex-col gap-0.5">
        {items.map((r) => (
          <li key={r.id}>
            <button type="button" onClick={() => document.getElementById(r.id)?.scrollIntoView()} aria-current={active === r.id}
              className={cn("group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left text-[11px] font-bold transition-colors",
                active === r.id ? "bg-brand-primary text-surface-0" : "text-text-tertiary hover:text-brand-primary")}>
              <span className={cn("size-1.5 rounded-pill transition-all", active === r.id ? "scale-125 bg-brand-accent" : "bg-surface-3 group-hover:bg-brand-primary")} />
              {r.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
