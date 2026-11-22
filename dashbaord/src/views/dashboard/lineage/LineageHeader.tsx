"use client";

import Link from "next/link";
import { ArrowRight, Crosshair, Sparkles } from "lucide-react";
import { BRANCHES } from "@/data/family/branches";
import { LINEAGE_HEADLINE } from "@/data/dashboard/lineage";
import { CountUp, TiltCard } from "@/components/ui/motion";
import { GEN_HEX } from "@/components/ui/Primitives";
import { ageOf } from "@/lib/format";
import { LAYOUT, type FamilyGraph } from "@/lib/family/graph";

const SECTION_LINKS = [
  { href: "#tree", label: "Tree" },
  { href: "#where", label: "Where am I?" },
  { href: "#branches", label: "Branches" },
  { href: "#audit", label: "Audit" },
  { href: "#archive", label: "Photo archive" },
  { href: "#numbers", label: "Family in numbers" },
  { href: "#sayings", label: "Sayings & access" },
];

export function LineageHeader({
  graph,
  onFocusRoot,
  onOpenBranch,
}: {
  graph: FamilyGraph;
  onFocusRoot: () => void;
  onOpenBranch: (branchId: string) => void;
}) {
  const root = graph.memberById.get(LAYOUT.root);
  const living = graph.members.filter((m) => m.deathYear === undefined).length;
  const rootAge = root ? ageOf(root.birthYear, root.deathYear) : 0;

  return (
    <section aria-labelledby="lineage-title" className="relative overflow-hidden rounded-[32px] border border-hairline bg-surface-1 shadow-soft">
      <div aria-hidden className="absolute inset-0">
        <img src="/images/family/reunion.jpg" alt="" className="h-full w-full object-cover opacity-[0.2]" decoding="async" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-1 via-surface-1/92 to-surface-1/55" />
      </div>

      <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div className="min-w-0">
          <p className="ny-eyebrow">S1 · {LINEAGE_HEADLINE.eyebrow}</p>
          <h1 id="lineage-title" className="ny-title mt-3 text-[2.5rem] leading-[1.02] sm:text-6xl">
            The Nalyanya <span className="italic text-brand-primary">family tree</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-text-secondary">{LINEAGE_HEADLINE.lede}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="ny-chip ny-chip-gold">
              <Sparkles className="size-3.5" aria-hidden />
              {LINEAGE_HEADLINE.motto} · {LINEAGE_HEADLINE.mottoMeaning}
            </span>
            <span className="ny-chip">Rooted in Kimilili, Bungoma</span>
            <span className="ny-chip ny-chip-success">Live 3D canvas</span>
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "People", value: graph.members.length },
              { label: "Branches", value: BRANCHES.length },
              { label: "Generations", value: graph.generations.length },
              { label: "Living", value: living },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-hairline bg-surface-0/70 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">{stat.label}</dt>
                <dd className="ny-title mt-1 text-3xl">
                  <CountUp value={stat.value} />
                </dd>
              </div>
            ))}
          </dl>

          <nav aria-label="Jump to a section" className="mt-7 flex flex-wrap gap-2">
            {SECTION_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="ny-chip transition hover:border-brand-primary hover:text-brand-primary">
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <TiltCard className="mx-auto w-full max-w-md" max={5}>
          <article className="ny-card overflow-hidden p-4">
            <div className="grid grid-cols-[7.5rem_1fr] gap-4">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface-2">
                {root?.photo && (
                  <img src={root.photo} alt={`Portrait of ${root.preferredName}`} className="h-full w-full object-cover" decoding="async" />
                )}
                <span className="absolute bottom-2 left-2 rounded-full bg-brand-deep/80 px-2 py-0.5 text-[10px] font-semibold text-white">Gen 1</span>
              </div>
              <div className="min-w-0 py-1">
                <p className="ny-eyebrow">Root ancestor</p>
                <h2 className="ny-title mt-1 text-2xl leading-tight">{root?.preferredName} Nalyanya</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Born {root?.birthYear} · age {rootAge} · {root?.homeTown}, {root?.county}
                </p>
                <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-text-secondary">{root?.bio}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Generation legend">
              {graph.generations.map((g) => (
                <span key={g} className="ny-chip" style={{ color: GEN_HEX[g - 1], borderColor: `${GEN_HEX[g - 1]}66` }}>
                  <span className="size-2 rounded-full" style={{ background: GEN_HEX[g - 1] }} aria-hidden />
                  Gen {g}
                </span>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={onFocusRoot} className="ny-btn ny-btn-primary ny-btn-sm">
                <Crosshair className="size-4" aria-hidden />
                Focus Mzee Victor
              </button>
              <button type="button" onClick={() => onOpenBranch("nalyanya-main")} className="ny-btn ny-btn-ghost ny-btn-sm">
                View his branch
                <ArrowRight className="size-4" aria-hidden />
              </button>
              <Link href="/dashboard/members?focus=NY-MBR-00001" className="ny-btn ny-btn-quiet ny-btn-sm">
                Open in members
              </Link>
            </div>
          </article>
        </TiltCard>
      </div>
    </section>
  );
}
