"use client";

import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, Switch } from "@headlessui/react";
import { Crosshair, Maximize2, RotateCcw, Search, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/Primitives";
import { searchMembers, type FamilyGraph } from "@/lib/family/graph";
import type { Member } from "@/types/family";
import { cn } from "@/lib/format";

export interface ControlRailProps {
  graph: FamilyGraph;
  visibleGens: number[] | null;
  visibleBranches: string[] | null;
  showWhere: boolean;
  rotateOn: boolean;
  use2d: boolean;
  calm: boolean;
  onPick: (memberId: string) => void;
  onToggleGen: (generation: number) => void;
  onToggleBranch: (branchId: string) => void;
  onClearFilters: () => void;
  onToggleWhere: () => void;
  onToggleRotate: () => void;
  onToggle2d: () => void;
  onCommand: (kind: "family" | "branch" | "reset") => void;
}

/** S2 — search (Headless Combobox), generation + branch filters, camera and view controls. URL-synced. */
export function ControlRail(props: ControlRailProps) {
  const {
    graph,
    visibleGens,
    visibleBranches,
    showWhere,
    rotateOn,
    use2d,
    calm,
    onPick,
    onToggleGen,
    onToggleBranch,
    onClearFilters,
    onToggleWhere,
    onToggleRotate,
    onToggle2d,
    onCommand,
  } = props;

  const [query, setQuery] = useState("");
  const results = useMemo(() => searchMembers(graph, query, 7), [graph, query]);

  const genShown = (g: number) => !visibleGens || visibleGens.includes(g);
  const branchShown = (id: string) => !visibleBranches || visibleBranches.includes(id);
  const filtered = Boolean(visibleGens || visibleBranches);

  return (
    <div className="ny-card space-y-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Combobox
            value={null as Member | null}
            onChange={(member: Member | null) => {
              if (member) {
                onPick(member.id);
                setQuery("");
              }
            }}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden />
              <ComboboxInput
                aria-label="Search family members by name or NY-MBR ID"
                placeholder="Search a name or NY-MBR ID…"
                className="ny-input pl-11"
                displayValue={() => query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <ComboboxOptions
                anchor="bottom start"
                className="z-40 mt-2 max-h-80 w-[var(--input-width)] overflow-y-auto rounded-2xl border border-hairline bg-surface-1 p-1.5 shadow-lift empty:invisible focus:outline-none"
              >
                {results.length === 0 && <div className="px-3 py-2 text-sm text-text-secondary">No family member matches that yet.</div>}
                {results.map((m) => (
                  <ComboboxOption
                    key={m.id}
                    value={m}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 data-focus:bg-surface-2"
                  >
                    <Avatar member={m} size={34} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-text-primary">
                        {m.preferredName} {m.lastName}
                      </span>
                      <span className="block truncate text-xs text-text-tertiary">
                        {m.id} · {m.role} · Gen {m.generation}
                      </span>
                    </span>
                  </ComboboxOption>
                ))}
              </ComboboxOptions>
            </div>
          </Combobox>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleWhere}
            aria-pressed={showWhere}
            className={cn("ny-btn ny-btn-sm", showWhere ? "ny-btn-gold" : "ny-btn-ghost")}
          >
            <Crosshair className="size-4" aria-hidden />
            Where am I?
          </button>
          <button type="button" onClick={() => onCommand("family")} className="ny-btn ny-btn-ghost ny-btn-sm">
            <Maximize2 className="size-4" aria-hidden />
            Fit family
          </button>
          <button type="button" onClick={() => onCommand("branch")} className="ny-btn ny-btn-ghost ny-btn-sm">
            <Share2 className="size-4" aria-hidden />
            Fit branch
          </button>
          <button type="button" onClick={() => onCommand("reset")} className="ny-btn ny-btn-ghost ny-btn-sm">
            <RotateCcw className="size-4" aria-hidden />
            Reset
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-hairline pt-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">Generation</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by generation">
            <button
              type="button"
              onClick={onClearFilters}
              aria-pressed={!filtered}
              className={cn("ny-chip cursor-pointer", !filtered && "ny-chip-solid")}
            >
              All
            </button>
            {graph.generations.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => onToggleGen(g)}
                aria-pressed={genShown(g)}
                className={cn("ny-chip cursor-pointer", genShown(g) && "ny-chip-solid")}
              >
                Gen {g}
                <span className="ny-num opacity-70">{graph.generationCounts.get(g) ?? 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">Branches</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by branch">
            {graph.branches.map((b) => {
              const on = branchShown(b.id);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onToggleBranch(b.id)}
                  aria-pressed={on}
                  className={cn("ny-chip cursor-pointer", !branchShown(b.id) && "opacity-45")}
                  style={on ? { background: b.color, borderColor: b.color, color: "#0f2a20" } : { borderColor: `${b.color}66` }}
                >
                  <span className="size-2 rounded-full" style={{ background: b.color }} aria-hidden />
                  {b.shortName}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 lg:flex-col lg:items-end">
          <label className="flex items-center gap-2.5 text-sm font-semibold text-text-secondary">
            <Switch
              checked={rotateOn && !calm}
              disabled={calm}
              onChange={onToggleRotate}
              aria-label="Orbit the tree slowly when idle"
              className="group relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-surface-3 transition data-checked:bg-brand-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <span className="size-5 translate-x-0.5 rounded-full bg-white shadow transition group-data-checked:translate-x-[22px]" />
            </Switch>
            Slow orbit{calm ? " (paused in Elder Mode)" : ""}
          </label>
          <label className="flex items-center gap-2.5 text-sm font-semibold text-text-secondary">
            <Switch
              checked={use2d || calm}
              disabled={calm}
              onChange={onToggle2d}
              aria-label="Use the 2D tree view"
              className="group relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full bg-surface-3 transition data-checked:bg-brand-primary data-disabled:cursor-not-allowed data-disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            >
              <span className="size-5 translate-x-0.5 rounded-full bg-white shadow transition group-data-checked:translate-x-[22px]" />
            </Switch>
            2D tree view
          </label>
        </div>
      </div>
    </div>
  );
}
