"use client";

import { Funnel, LayoutGrid, RotateCcw, Search, Table2, X } from "lucide-react";
import { AGE_BANDS, FAMILY_ROLES, type AgeBand, type FamilyRole } from "@/data/dashboard/members";
import { BRANCHES } from "@/data/family/branches";
import { cn } from "@/lib/format";

export interface MemberFilters {
  query: string;
  branch: string;
  gen: string;
  role: string;
  county: string;
  ageBand: AgeBand;
  hasLoan: boolean;
  saccoOnly: boolean;
  deceasedOnly: boolean;
  view: "table" | "grid";
}

interface Props {
  filters: MemberFilters;
  counties: string[];
  generations: number[];
  matchedCount: number;
  totalCount: number;
  onPatch: (patch: Partial<MemberFilters>) => void;
  onReset: () => void;
}

/** S2 — Filter bar (branch · gen · role · county · age band · has loan · sacco · search) + view toggle. */
export function MembersFilterBar({
  filters,
  counties,
  generations,
  matchedCount,
  totalCount,
  onPatch,
  onReset,
}: Props) {
  const activeChips: Array<{ label: string; clear: () => void }> = [];
  if (filters.query) activeChips.push({ label: `Search: “${filters.query}”`, clear: () => onPatch({ query: "" }) });
  if (filters.branch !== "all") {
    const bName = BRANCHES.find((b) => b.id === filters.branch)?.shortName ?? filters.branch;
    activeChips.push({ label: `Branch: ${bName}`, clear: () => onPatch({ branch: "all" }) });
  }
  if (filters.gen !== "all") activeChips.push({ label: `Gen ${filters.gen}`, clear: () => onPatch({ gen: "all" }) });
  if (filters.role !== "all") activeChips.push({ label: `Role: ${filters.role}`, clear: () => onPatch({ role: "all" }) });
  if (filters.county !== "all") activeChips.push({ label: `County: ${filters.county}`, clear: () => onPatch({ county: "all" }) });
  if (filters.ageBand !== "all") {
    const label = AGE_BANDS.find((a) => a.key === filters.ageBand)?.label ?? filters.ageBand;
    activeChips.push({ label, clear: () => onPatch({ ageBand: "all" }) });
  }
  if (filters.hasLoan) activeChips.push({ label: "Has active loan", clear: () => onPatch({ hasLoan: false }) });
  if (filters.saccoOnly) activeChips.push({ label: "Sacco shareholder", clear: () => onPatch({ saccoOnly: false }) });
  if (filters.deceasedOnly) activeChips.push({ label: "Remembered (†)", clear: () => onPatch({ deceasedOnly: false }) });

  return (
    <section aria-label="Filter family members" className="ny-card space-y-4 p-4 sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Fuzzy Search */}
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => onPatch({ query: e.target.value })}
            aria-label="Search members by name, NY-MBR ID, town or profession"
            placeholder="Search by name, NY-MBR-00019, town, or profession…"
            className="ny-input pl-11"
          />
        </div>

        {/* View Toggle (Table / 3D Avatar Grid) */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Switch directory view"
            className="inline-flex rounded-full border border-hairline bg-surface-0 p-1"
          >
            <button
              type="button"
              onClick={() => onPatch({ view: "table" })}
              aria-pressed={filters.view === "table"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition",
                filters.view === "table" ? "bg-brand-primary text-white shadow-soft" : "text-text-secondary hover:text-text-primary",
              )}
            >
              <Table2 className="size-3.5" aria-hidden />
              Table
            </button>
            <button
              type="button"
              onClick={() => onPatch({ view: "grid" })}
              aria-pressed={filters.view === "grid"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition",
                filters.view === "grid" ? "bg-brand-primary text-white shadow-soft" : "text-text-secondary hover:text-text-primary",
              )}
            >
              <LayoutGrid className="size-3.5" aria-hidden />
              3D Avatar Grid
            </button>
          </div>

          {activeChips.length > 0 && (
            <button type="button" onClick={onReset} className="ny-btn ny-btn-ghost ny-btn-sm">
              <RotateCcw className="size-3.5" aria-hidden />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">Branch</span>
          <select
            value={filters.branch}
            onChange={(e) => onPatch({ branch: e.target.value })}
            className="ny-input !min-h-[42px] !py-2 text-sm"
          >
            <option value="all">All 12 branches</option>
            {BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">Generation</span>
          <select
            value={filters.gen}
            onChange={(e) => onPatch({ gen: e.target.value })}
            className="ny-input !min-h-[42px] !py-2 text-sm"
          >
            <option value="all">All generations</option>
            {generations.map((g) => (
              <option key={g} value={String(g)}>
                Generation {g}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">Access role</span>
          <select
            value={filters.role}
            onChange={(e) => onPatch({ role: e.target.value as FamilyRole | "all" })}
            className="ny-input !min-h-[42px] !py-2 text-sm"
          >
            <option value="all">All roles</option>
            {FAMILY_ROLES.map((r) => (
              <option key={r.role} value={r.role}>
                {r.role}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">Home county</span>
          <select
            value={filters.county}
            onChange={(e) => onPatch({ county: e.target.value })}
            className="ny-input !min-h-[42px] !py-2 text-sm"
          >
            <option value="all">All counties & diaspora</option>
            {counties.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">Age band</span>
          <select
            value={filters.ageBand}
            onChange={(e) => onPatch({ ageBand: e.target.value as AgeBand })}
            className="ny-input !min-h-[42px] !py-2 text-sm"
          >
            {AGE_BANDS.map((band) => (
              <option key={band.key} value={band.key}>
                {band.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Quick Boolean Chips + Match Tally */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Quick filters">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-tertiary">
            <Funnel className="size-3.5" aria-hidden />
            Quick filters:
          </span>
          <button
            type="button"
            onClick={() => onPatch({ hasLoan: !filters.hasLoan })}
            aria-pressed={filters.hasLoan}
            className={cn("ny-chip cursor-pointer transition", filters.hasLoan && "ny-chip-solid")}
          >
            Has loan
          </button>
          <button
            type="button"
            onClick={() => onPatch({ saccoOnly: !filters.saccoOnly })}
            aria-pressed={filters.saccoOnly}
            className={cn("ny-chip cursor-pointer transition", filters.saccoOnly && "ny-chip-solid")}
          >
            Sacco member
          </button>
          <button
            type="button"
            onClick={() => onPatch({ ageBand: filters.ageBand === "elder" ? "all" : "elder" })}
            aria-pressed={filters.ageBand === "elder"}
            className={cn("ny-chip cursor-pointer transition", filters.ageBand === "elder" && "ny-chip-gold")}
          >
            Elders (65+)
          </button>
          <button
            type="button"
            onClick={() => onPatch({ ageBand: filters.ageBand === "minor" ? "all" : "minor" })}
            aria-pressed={filters.ageBand === "minor"}
            className={cn("ny-chip cursor-pointer transition", filters.ageBand === "minor" && "ny-chip-info")}
          >
            Minors & wards
          </button>
          <button
            type="button"
            onClick={() => onPatch({ deceasedOnly: !filters.deceasedOnly })}
            aria-pressed={filters.deceasedOnly}
            className={cn("ny-chip cursor-pointer transition", filters.deceasedOnly && "ny-chip-violet")}
          >
            Remembered (†)
          </button>
        </div>

        <p className="text-sm text-text-secondary">
          Showing <span className="ny-num font-semibold text-text-primary">{matchedCount}</span> of{" "}
          <span className="ny-num font-semibold text-text-primary">{totalCount}</span> members
        </p>
      </div>

      {/* Active filter pills */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {activeChips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.clear}
              className="ny-chip ny-chip-gold cursor-pointer transition hover:opacity-85"
            >
              {chip.label}
              <X className="size-3" aria-hidden />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
