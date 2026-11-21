/* ── H-3 S7 · Friends of the family — vetted non-relatives ───────────────── */

import { useState } from "react";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import AskModal from "./AskModal";
import Reveal from "../Reveal";
import { PROFESSIONALS, type Professional } from "../../../data/home/professions";

const FRIENDS = PROFESSIONALS.filter((p) => !p.family);

export default function FriendsPanel() {
  const [ask, setAsk] = useState<Professional | null>(null);
  return (
    <section id="friends" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="Friends of the family">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="ny-section-label">Friends of the family</span>
          <h2 className="ny-heading mt-3 max-w-2xl text-4xl sm:text-5xl">Not every helper <em className="font-medium text-brand-secondary">is a relative.</em></h2>
          <p className="ny-prose mt-3 max-w-2xl">Workers and friends the council has met. A gold check means two members spoke for them. Without it, the listing says so.</p>
        </Reveal>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {FRIENDS.map((p) => (
            <li key={p.id} className="ny-card flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center">
              <img src={p.photo} alt="" className="h-28 w-full rounded-xl object-cover sm:h-24 sm:w-28" loading="lazy" decoding="async" />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-display text-xl font-semibold">
                  {p.name}
                  {p.verified
                    ? <span className="inline-flex items-center gap-1 rounded-pill bg-brand-success-tint px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-success"><BadgeCheck className="size-3.5" aria-hidden="true" />Verified by family</span>
                    : <span className="inline-flex items-center gap-1 rounded-pill bg-brand-accent-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#7a5b14]"><ShieldAlert className="size-3.5" aria-hidden="true" />Not yet verified</span>}
                </p>
                <p className="text-sm font-semibold text-text-secondary">{p.trade} · {p.county}</p>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">{p.blurb}</p>
              </div>
              <button type="button" onClick={() => setAsk(p)} className="ny-btn-ghost shrink-0 text-sm">Ask for help</button>
            </li>
          ))}
        </ul>
      </div>
      <AskModal person={ask} onClose={() => setAsk(null)} />
    </section>
  );
}
