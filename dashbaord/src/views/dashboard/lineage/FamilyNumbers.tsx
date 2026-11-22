"use client";

import { BarMeter } from "@/components/ui/Charts";
import { CountUp, Reveal } from "@/components/ui/motion";
import { GEN_HEX, SectionHeader } from "@/components/ui/Primitives";
import { ageOf } from "@/lib/format";
import type { FamilyGraph } from "@/lib/family/graph";

/** S9 — the family in numbers: living, generations, counties, and the oldest living member. */
export function FamilyNumbers({ graph }: { graph: FamilyGraph }) {
  const living = graph.members.filter((m) => m.deathYear === undefined);
  const deceased = graph.members.length - living.length;
  const adopted = graph.members.filter((m) => m.adopted).length;
  const wards = graph.members.filter((m) => m.ward).length;
  const oldest = living.reduce((a, b) => (a.birthYear <= b.birthYear ? a : b));
  const averageAge = Math.round(living.reduce((sum, m) => sum + ageOf(m.birthYear), 0) / Math.max(1, living.length));

  const countyCounts = new Map<string, number>();
  for (const m of graph.members) countyCounts.set(m.county, (countyCounts.get(m.county) ?? 0) + 1);
  const topCounties = Array.from(countyCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCounty = topCounties[0]?.[1] ?? 1;

  const genEntries = graph.generations.map((g) => ({ g, count: graph.generationCounts.get(g) ?? 0 }));
  const maxGen = Math.max(...genEntries.map((e) => e.count), 1);

  const stats = [
    { label: "Living members", value: living.length, note: `${deceased} remembered` },
    { label: "Average age", value: averageAge, note: "of living members" },
    { label: "Adopted or ward", value: adopted + wards, note: `${wards} minors in guardianship` },
    { label: "Oldest living", value: ageOf(oldest.birthYear), note: `${oldest.preferredName}, born ${oldest.birthYear}` },
  ];

  return (
    <section id="numbers" className="scroll-mt-24 space-y-8">
      <SectionHeader
        eyebrow="S9 · Family in numbers"
        title="Who we are, counted gently"
        description="Every figure is computed live from the same graph that draws the tree, so it changes the moment the family changes."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 0.05}>
            <div className="ny-card h-full p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">{stat.label}</p>
              <p className="ny-title mt-3 text-5xl">
                <CountUp value={stat.value} />
              </p>
              <p className="mt-2 text-sm text-text-secondary">{stat.note}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="ny-card space-y-5 p-6 sm:p-7">
          <p className="ny-title text-xl">People per generation</p>
          <ul className="space-y-4">
            {genEntries.map(({ g, count }) => (
              <li key={g} className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-4">
                <span className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
                  <span className="size-2.5 rounded-full" style={{ background: GEN_HEX[g - 1] }} aria-hidden />
                  Gen {g}
                </span>
                <BarMeter value={count} max={maxGen} color={GEN_HEX[g - 1]} />
                <span className="ny-num text-right text-sm font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="ny-card space-y-5 p-6 sm:p-7">
          <p className="ny-title text-xl">Where the family lives</p>
          <ul className="space-y-4">
            {topCounties.map(([county, count]) => (
              <li key={county} className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-4">
                <span className="truncate text-sm font-semibold text-text-secondary">{county}</span>
                <BarMeter value={count} max={maxCounty} color="#1F4D3A" />
                <span className="ny-num text-right text-sm font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
