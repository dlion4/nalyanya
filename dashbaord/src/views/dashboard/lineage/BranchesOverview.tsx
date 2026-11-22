"use client";

import Link from "next/link";
import { LocateFixed, Plus } from "lucide-react";
import { Avatar, SectionHeader } from "@/components/ui/Primitives";
import { CountUp, Reveal } from "@/components/ui/motion";
import type { FamilyGraph } from "@/lib/family/graph";
import type { Branch } from "@/types/family";

interface Props {
  graph: FamilyGraph;
  extraBranches: Branch[];
  onOpen: (branchId: string) => void;
  onCreate: () => void;
}

/** S6 — every branch as a card: founder, size, generations, and a camera fit. */
export function BranchesOverview({ graph, extraBranches, onOpen, onCreate }: Props) {
  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="S6 · Branches overview"
        title="Twelve branches, one family"
        description="Each branch keeps its own colour in the tree. Open a branch to fit the camera around it, or jump to its members."
        actions={
          <button type="button" onClick={onCreate} className="ny-btn ny-btn-primary">
            <Plus className="size-4" aria-hidden />
            Create new branch
          </button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {graph.branches.map((branch, index) => {
          const stat = graph.branchStats.get(branch.id);
          const founder = graph.memberById.get(branch.founderId);
          return (
            <Reveal key={branch.id} delay={(index % 3) * 0.06}>
              <article className="ny-card transform-3d group relative h-full overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:rotate-x-2 hover:shadow-lift">
                <span aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: branch.color }} />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="ny-eyebrow" style={{ color: branch.color }}>
                      {branch.county}
                    </p>
                    <h3 className="ny-title mt-1.5 text-xl leading-snug">{branch.name}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{branch.tagline}</p>
                  </div>
                  {founder && <Avatar member={founder} size={48} />}
                </div>

                <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-surface-0/80 p-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">People</dt>
                    <dd className="ny-title mt-1 text-2xl">{stat ? <CountUp value={stat.count} /> : "—"}</dd>
                  </div>
                  <div className="rounded-2xl bg-surface-0/80 p-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Gens</dt>
                    <dd className="ny-title mt-1 text-2xl">{stat ? `${stat.minGen}–${stat.maxGen}` : "—"}</dd>
                  </div>
                  <div className="rounded-2xl bg-surface-0/80 p-3">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">Founder</dt>
                    <dd className="mt-1.5 truncate text-sm font-semibold text-text-primary">{founder?.preferredName ?? "—"}</dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap gap-2">
                  <button type="button" onClick={() => onOpen(branch.id)} className="ny-btn ny-btn-primary ny-btn-sm">
                    <LocateFixed className="size-4" aria-hidden />
                    Open in 3D
                  </button>
                  <Link href={`/dashboard/members?branch=${branch.id}`} className="ny-btn ny-btn-ghost ny-btn-sm">
                    Members →
                  </Link>
                </div>
              </article>
            </Reveal>
          );
        })}

        {extraBranches.map((branch) => (
          <article key={branch.id} className="ny-card relative overflow-hidden border-dashed p-6">
            <span aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: branch.color }} />
            <p className="ny-chip ny-chip-gold w-fit">New · pending placement</p>
            <h3 className="ny-title mt-3 text-xl">{branch.name}</h3>
            <p className="mt-1.5 text-sm text-text-secondary">{branch.county} · {branch.tagline}</p>
            <p className="mt-5 text-xs text-text-tertiary">Members join this branch as they are linked in the tree (SIMULATED).</p>
          </article>
        ))}
      </div>
    </div>
  );
}
