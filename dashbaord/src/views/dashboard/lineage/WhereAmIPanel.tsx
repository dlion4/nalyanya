"use client";

import { ArrowRight, Crosshair, Route } from "lucide-react";
import { useState } from "react";
import { BranchChip, GenChip, SectionHeader } from "@/components/ui/Primitives";
import { CURRENT_USER_ID } from "@/data/dashboard/lineage";
import { BRANCH_BY_ID } from "@/data/family/branches";
import type { FamilyGraph } from "@/lib/family/graph";
import { cn } from "@/lib/format";

interface Props {
  graph: FamilyGraph;
  showWhere: boolean;
  onToggleWhere: () => void;
  onFocus: (memberId: string, branchId?: string) => void;
}

/** S5 — every position the current user holds across the family graph. */
export function WhereAmIPanel({ graph, showWhere, onToggleWhere, onFocus }: Props) {
  const me = graph.memberById.get(CURRENT_USER_ID);
  const positions = graph.nodes.filter((n) => n.id === CURRENT_USER_ID);
  const branchCount = new Set(positions.map((p) => p.branchId)).size;
  const [cursor, setCursor] = useState(0);

  const jumpNext = () => {
    if (positions.length === 0) return;
    const next = (cursor + 1) % positions.length;
    setCursor(next);
    const target = positions[next];
    onFocus(target.id, target.kind === "presence" ? target.branchId : undefined);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="S5 · Where am I?"
        title="You appear in more than one place"
        description="In a family this size one person can be a son in one branch, a guardian in another and a trustee in a third. Each position is listed here and drawn in the tree."
        actions={
          <button type="button" onClick={onToggleWhere} aria-pressed={showWhere} className={cn("ny-btn ny-btn-sm", showWhere ? "ny-btn-gold" : "ny-btn-primary")}>
            <Route className="size-4" aria-hidden />
            {showWhere ? "Hide connectors" : "Draw connectors"}
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
        <div className="ny-card flex flex-col justify-between gap-6 p-6 sm:p-7">
          <div className="flex items-center gap-4">
            {me && (
              <span className="grid size-16 place-items-center rounded-2xl text-lg font-display font-semibold" style={{ background: "#1F4D3A", color: "#FFFDF7" }}>
                {me.firstName.charAt(0)}
                {me.lastName.charAt(0)}
              </span>
            )}
            <div>
              <p className="ny-title text-2xl">
                {me?.preferredName} {me?.lastName}
              </p>
              <p className="text-sm text-text-secondary">Family Head · signed in</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-surface-0/70 p-4">
              <dt className="text-xs text-text-tertiary">Positions</dt>
              <dd className="ny-title mt-1 text-3xl">{positions.length}</dd>
            </div>
            <div className="rounded-2xl bg-surface-0/70 p-4">
              <dt className="text-xs text-text-tertiary">Branches</dt>
              <dd className="ny-title mt-1 text-3xl">{branchCount}</dd>
            </div>
          </dl>
          <button type="button" onClick={jumpNext} className="ny-btn ny-btn-primary w-full">
            <Crosshair className="size-4" aria-hidden />
            Jump to next me
          </button>
        </div>

        <ol className="grid gap-3 sm:grid-cols-2">
          {positions.map((p, index) => {
            const branch = BRANCH_BY_ID[p.branchId];
            const isPrimary = p.kind !== "presence";
            return (
              <li key={p.key}>
                <button
                  type="button"
                  onClick={() => {
                    setCursor(index);
                    onFocus(p.id, isPrimary ? undefined : p.branchId);
                  }}
                  className="group flex h-full w-full flex-col gap-3 rounded-[22px] border border-hairline bg-surface-1 p-5 text-left shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="ny-eyebrow" style={{ color: isPrimary ? "#1F4D3A" : "#B5532A" }}>
                      {isPrimary ? "Primary position" : "Additional position"}
                    </span>
                    <GenChip generation={p.generation} />
                  </div>
                  <p className="ny-title text-xl leading-tight">{p.label}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {branch && <BranchChip branchId={branch.id} />}
                    <span className="text-xs text-text-tertiary">{branch?.name}</span>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand-primary">
                    Focus in the tree
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
