/* ── H-2 S5 · The family today (stats + stylised branch map) · S6 · 12 branches ── */

import { useState } from "react";
import { MapPin, Plane } from "lucide-react";
import Reveal from "../Reveal";
import { BRANCHES, COUNTY_PINS, DIASPORA, TODAY_STATS, type TodayStat } from "../../../data/home/about";
import { useCountUp, useInView } from "../../../lib/hooks";
import { cn } from "../../../utils/cn";

const KENYA = "M7 26 L71 13 L75 18 L146 46 L194 51 L238 33 L275 35 L245 73 L245 195 L264 220 L218 248 L204 274 L197 297 L184 319 L133 281 L129 264 L7 198 L7 158 L27 129 L37 83 L20 43 Z";

function Stat({ s, i }: { s: TodayStat; i: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const n = useCountUp(s.value, { start: inView, duration: 1400 + i * 150 });
  return (
    <div ref={ref} className="ny-card flex items-center gap-4 rounded-2xl p-5">
      <span className="ny-icon-chip"><s.icon className="size-5" aria-hidden="true" /></span>
      <span>
        <span className="ny-num block font-display text-3xl font-semibold text-brand-primary">{n}<span className="text-brand-accent">{s.suffix}</span></span>
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-text-tertiary">{s.label}</span>
      </span>
    </div>
  );
}

export default function FamilyToday() {
  const [pin, setPin] = useState("bungoma");
  const root = COUNTY_PINS.find((p) => p.root)!;
  const selected = COUNTY_PINS.find((p) => p.id === pin)!;

  return (
    <section id="today" className="scroll-mt-24 border-y border-surface-3/60 bg-surface-2/50 px-4 py-20 sm:px-6 sm:py-28 lg:px-8" aria-label="The family today">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="ny-section-label">The family today</span>
          <h2 className="ny-heading mt-3 max-w-2xl text-4xl sm:text-5xl">Four counties. <em className="font-medium text-brand-secondary">Three countries.</em></h2>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {TODAY_STATS.map((s, i) => <Stat key={s.label} s={s} i={i} />)}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="ny-card relative overflow-hidden rounded-[1.75rem] p-5 sm:p-7">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-tertiary">Stylised branch map · county level only</p>
                <span className="ny-chip">Kenya</span>
              </div>
              <svg viewBox="-20 0 330 330" className="mx-auto mt-4 w-full max-w-lg" role="img" aria-label="Stylised map of Kenya with family counties">
                <path d={KENYA} fill="#E8EFE8" stroke="#1F4D3A" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M-20 175 Q -8 190 7 198 L7 230 L-20 230 Z" fill="#cfe0ea" opacity="0.8" />
                <text x="-14" y="222" fontSize="8" fill="#5A6B57" fontStyle="italic">L. Victoria</text>
                {COUNTY_PINS.filter((p) => !p.root).map((p) => (
                  <path key={p.id} className="ny-map-arc" d={`M${root.x} ${root.y} Q ${(root.x + p.x) / 2} ${Math.min(root.y, p.y) - 30} ${p.x} ${p.y}`} fill="none" stroke="#D4A437" strokeWidth="1.6" />
                ))}
                <path className="ny-map-arc" d={`M${root.x} ${root.y} Q -10 120 -18 90`} fill="none" stroke="#6A4C93" strokeWidth="1.4" />
                <path className="ny-map-arc" d={`M103 208 Q 200 120 290 60`} fill="none" stroke="#6A4C93" strokeWidth="1.4" />
                {COUNTY_PINS.map((p) => (
                  <g key={p.id} onClick={() => setPin(p.id)} className="cursor-pointer" role="button" aria-label={`${p.name}: ${p.branches} branches`}>
                    {p.id === pin && <circle className="ny-map-pulse" cx={p.x} cy={p.y} r="6" fill="#D4A437" />}
                    <circle cx={p.x} cy={p.y} r={p.root ? 7 : 5.5} fill={p.root ? "#D4A437" : "#1F4D3A"} stroke="#fff" strokeWidth="2" />
                  </g>
                ))}
                <text x="-18" y="84" fontSize="9" fontWeight="700" fill="#6A4C93">→ UG</text>
                <text x="262" y="52" fontSize="9" fontWeight="700" fill="#6A4C93">US →</text>
              </svg>
              <div className="ny-glass absolute bottom-5 right-5 rounded-xl px-4 py-3">
                <p className="flex items-center gap-1.5 text-sm font-bold text-text-primary"><MapPin className="size-4 text-brand-secondary" aria-hidden="true" />{selected.name}</p>
                <p className="text-xs text-text-secondary">{selected.branches} branches{selected.root ? " · the original homestead" : ""}</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="flex flex-col gap-4 lg:col-span-5">
            <div className="ny-card rounded-[1.75rem] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-tertiary">Pick a county</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {COUNTY_PINS.map((p) => (
                  <button key={p.id} type="button" onClick={() => setPin(p.id)} aria-pressed={pin === p.id}
                    className={cn("ny-touch rounded-xl border px-3 py-2.5 text-left text-sm font-semibold transition-colors", pin === p.id ? "border-brand-primary bg-brand-primary text-surface-0" : "border-surface-3 bg-surface-1 text-text-secondary hover:border-brand-primary/40")}>
                    {p.name}<span className="block text-[11px] font-medium opacity-75">{p.branches} branches</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="ny-card rounded-[1.75rem] p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-tertiary">Diaspora</p>
              <ul className="mt-3 space-y-2.5">
                {DIASPORA.map((d) => (
                  <li key={d.code} className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-pill bg-brand-violet-tint font-display text-sm font-semibold text-brand-violet">{d.code}</span>
                    <span><span className="block text-sm font-bold text-text-primary">{d.name}</span><span className="text-xs text-text-tertiary">{d.note}</span></span>
                    <Plane className="ml-auto size-4 text-brand-violet" aria-hidden="true" />
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function BranchesGrid() {
  return (
    <section id="branches" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24 lg:px-8" aria-label="The twelve branches">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="ny-section-label">12 branches</span>
          <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">Nine children. <em className="font-medium text-brand-secondary">Twelve houses.</em></h2>
          <p className="ny-prose mt-3 max-w-xl">Each house carries the name of the branch that founded it. Member counts are approximate.</p>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-3 [perspective:1000px] sm:grid-cols-2 lg:grid-cols-4">
          {BRANCHES.map((b, i) => (
            <Reveal key={b.name} delay={(i % 4) * 0.06}>
              <div className="ny-branch ny-card flex items-center gap-3 rounded-2xl p-4" style={{ ["--branch" as string]: b.color }}>
                <span className="grid size-11 shrink-0 place-items-center rounded-xl font-display text-lg font-semibold text-surface-0" style={{ background: b.color }}>{b.name.split(" ").pop()?.[0]}</span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-base font-semibold text-text-primary">{b.name}</span>
                  <span className="block truncate text-xs text-text-tertiary">{b.county} · ~{b.members} members</span>
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
