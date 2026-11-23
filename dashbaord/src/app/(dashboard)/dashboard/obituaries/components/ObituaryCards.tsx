import { useMemo, useState } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import {
  CalendarHeart,
  Download,
  Eye,
  Flame,
  Grid2X2,
  List,
  MoreHorizontal,
  Pencil,
  Search,
  Share2,
  Undo2,
  X,
} from "lucide-react";
import { BRANCHES } from "@/data/family/branches";
import type { Obituary } from "@/data/dashboard/obituaries";
import { cn } from "@/lib/format";
import { Candle, MemorialChip } from "./PinholeStage";

/* ═══════════════════════════════════════════════════════════════════════
   S2 · OBITUARY CARDS
   Photo · name · birth–death years · relationship in the family · the
   notice itself opens a drawer rather than a page.
   ═══════════════════════════════════════════════════════════════════════ */

export type CardView = "grid" | "list";

export interface CardFilters {
  year: string;
  branch: string;
  q: string;
  view: CardView;
}

export function ObituaryFilterBar({
  filters,
  years,
  counts,
  onChange,
}: {
  filters: CardFilters;
  years: number[];
  counts: { all: number; published: number; draft: number };
  onChange: (patch: Partial<CardFilters>) => void;
}) {
  return (
    <div className="ny-memorial-filters">
      <div className="ny-memorial-filter-chips" role="group" aria-label="Filter by notice status">
        {(
          [
            { id: "all", label: "All notices", count: counts.all },
            { id: "published", label: "Published", count: counts.published },
            { id: "draft", label: "Drafts", count: counts.draft },
          ] as const
        ).map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={cn(
              "ny-memorial-filter-chip",
              filters.year === chip.id && "is-active",
            )}
            aria-pressed={filters.year === chip.id}
            onClick={() => onChange({ year: chip.id })}
          >
            {chip.label}
            <span className="ny-num">{chip.count}</span>
          </button>
        ))}
      </div>

      <div className="ny-memorial-filter-controls">
        <label className="ny-memorial-search">
          <Search size={14} aria-hidden />
          <span className="sr-only">Search notices</span>
          <input
            type="search"
            value={filters.q}
            placeholder="Search a name or a branch…"
            onChange={(event) => onChange({ q: event.target.value })}
          />
          {filters.q && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onChange({ q: "" })}
            >
              <X size={13} />
            </button>
          )}
        </label>

        <select
          className="ny-memorial-select"
          aria-label="Filter by year"
          value={filters.year}
          onChange={(event) => onChange({ year: event.target.value })}
        >
          <option value="all">All years</option>
          {years.map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </select>

        <select
          className="ny-memorial-select"
          aria-label="Filter by branch"
          value={filters.branch}
          onChange={(event) => onChange({ branch: event.target.value })}
        >
          <option value="all">All branches</option>
          {BRANCHES.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>

        <div className="ny-memorial-viewtoggle" role="group" aria-label="Layout">
          <button
            type="button"
            aria-label="Card view"
            aria-pressed={filters.view === "grid"}
            className={filters.view === "grid" ? "is-active" : ""}
            onClick={() => onChange({ view: "grid" })}
          >
            <Grid2X2 size={14} />
          </button>
          <button
            type="button"
            aria-label="List view"
            aria-pressed={filters.view === "list"}
            className={filters.view === "list" ? "is-active" : ""}
            onClick={() => onChange({ view: "list" })}
          >
            <List size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ObituaryCards({
  obituaries,
  filters,
  onChange,
  onOpen,
  onAction,
  candles,
  upcoming,
  calm,
}: {
  obituaries: Obituary[];
  filters: CardFilters;
  onChange: (patch: Partial<CardFilters>) => void;
  onOpen: (id: string) => void;
  onAction: (act: string, id: string) => void;
  candles: Record<string, number>;
  upcoming: Set<string>;
  calm: boolean;
}) {
  const [tilt, setTilt] = useState<{ id: string; x: number; y: number } | null>(
    null,
  );

  const branchOf = (id: string) =>
    BRANCHES.find((b) => b.id === id)?.shortName ?? id;

  if (!obituaries.length) {
    return (
      <div className="ny-memorial-empty">
        <Candle />
        <h3>No notices match that view</h3>
        <p>
          Try another year, branch, or clear the search. Nothing has been
          removed — the family archive is intact.
        </p>
        <button
          type="button"
          className="ny-btn ny-btn-ghost"
          onClick={() => onChange({ year: "all", branch: "all", q: "" })}
        >
          Reset the filters
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "ny-memorial-cards",
        filters.view === "list" && "is-list",
      )}
      onMouseLeave={() => setTilt(null)}
    >
      {obituaries.map((o, index) => {
        const lit = (candles[o.id] ?? 0) + o.candlesLit;
        const style =
          tilt?.id === o.id && !calm
            ? {
                transform: `perspective(1100px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(14px)`,
              }
            : undefined;
        return (
          <article
            key={o.id}
            className={cn(
              "ny-memorial-card",
              o.status !== "published" && "is-draft",
            )}
            style={style}
            onMouseMove={(event) => {
              if (calm) return;
              const box = event.currentTarget.getBoundingClientRect();
              const px = (event.clientX - box.left) / box.width - 0.5;
              const py = (event.clientY - box.top) / box.height - 0.5;
              setTilt({ id: o.id, x: -py * 5, y: px * 6 });
            }}
          >
            <div className="ny-memorial-card-photo">
              <img
                src={o.portrait}
                alt={o.portraitAlt}
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
              />
              <span className="ny-memorial-card-years ny-num">
                {o.birthYear} — {o.deathYear}
              </span>
              {upcoming.has(o.id) && (
                <span className="ny-memorial-card-anniversary">
                  <CalendarHeart size={12} aria-hidden />
                  Anniversary
                </span>
              )}
              {o.status !== "published" && (
                <span className="ny-memorial-card-draft">Draft</span>
              )}
            </div>

            <div className="ny-memorial-card-body">
              <h3>{o.name}</h3>
              <p className="ny-memorial-card-relation">{o.relationship}</p>
              <p className="ny-memorial-card-meta">
                <MemorialChip tone="sage">{branchOf(o.branchId)}</MemorialChip>
                <MemorialChip tone="quiet">Gen {o.generation}</MemorialChip>
                <span className="ny-memorial-card-candles">
                  <Candle lit={lit > 0} />
                  <span className="ny-num">{lit.toLocaleString("en-KE")}</span>
                </span>
              </p>

              <div className="ny-memorial-card-actions">
                <button
                  type="button"
                  className="ny-btn ny-btn-primary ny-btn-sm"
                  onClick={() => onOpen(o.id)}
                >
                  <Eye size={14} aria-hidden />
                  Read the notice
                </button>

                <Menu>
                  <MenuButton
                    className="ny-memorial-iconbtn"
                    aria-label={`More actions for ${o.name}`}
                  >
                    <MoreHorizontal size={16} />
                  </MenuButton>
                  <MenuItems
                    anchor="bottom end"
                    className="ny-memorial-menu"
                  >
                    <MenuItem>
                      <button
                        type="button"
                        onClick={() => onOpen(o.id)}
                      >
                        <Eye size={14} aria-hidden />
                        View the notice
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        type="button"
                        onClick={() => onAction("tribute", o.id)}
                      >
                        <Flame size={14} aria-hidden />
                        Light a candle
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        type="button"
                        onClick={() => onAction("share", o.id)}
                      >
                        <Share2 size={14} aria-hidden />
                        Copy the share link
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        type="button"
                        onClick={() => onAction("statement", o.id)}
                      >
                        <Pencil size={14} aria-hidden />
                        Edit the family statement
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        type="button"
                        onClick={() => onAction("export", o.id)}
                      >
                        <Download size={14} aria-hidden />
                        Export a memorial sheet
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button
                        type="button"
                        onClick={() => onAction("unpublish", o.id)}
                      >
                        <Undo2 size={14} aria-hidden />
                        Unpublish the notice
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/** Counts for the filter chips. */
export function useNoticeCounts(obituaries: Obituary[]) {
  return useMemo(() => {
    const published = obituaries.filter((o) => o.status === "published").length;
    const draft = obituaries.filter((o) => o.status === "draft").length;
    return { all: obituaries.length, published, draft };
  }, [obituaries]);
}
