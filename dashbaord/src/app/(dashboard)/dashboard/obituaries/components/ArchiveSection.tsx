import { useState } from "react";
import {
  Download,
  Eye,
  FileDown,
  Filter,
  MoreHorizontal,
  Share2,
  Undo2,
} from "lucide-react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { BRANCHES } from "@/data/family/branches";
import type { Obituary } from "@/data/dashboard/obituaries";
import { longDate } from "@/lib/calendar";
import { cn } from "@/lib/format";
import { MemorialChip } from "./PinholeStage";

/* ═══════════════════════════════════════════════════════════════════════
   S7 · ARCHIVE
   Every notice ever written, filterable by year and branch, with a
   memorial sheet export for printing or sharing with elders who are not
   on the app.
   ═══════════════════════════════════════════════════════════════════════ */

export function ArchiveSection({
  obituaries,
  onOpen,
  onAction,
}: {
  obituaries: Obituary[];
  onOpen: (id: string) => void;
  onAction: (act: string, id?: string) => void;
}) {
  const [year, setYear] = useState("all");
  const [branch, setBranch] = useState("all");

  const years = Array.from(new Set(obituaries.map((o) => o.deathYear))).sort(
    (a, b) => b - a,
  );

  const rows = obituaries.filter(
    (o) =>
      (year === "all" || String(o.deathYear) === year) &&
      (branch === "all" || o.branchId === branch),
  );

  return (
    <section className="ny-memorial-section" aria-labelledby="archive">
      <div className="ny-memorial-section-head">
        <div>
          <p className="ny-eyebrow">
            <FileDown size={12} aria-hidden />
            S7 · THE ARCHIVE
          </p>
          <h2 id="archive">Every notice we have written</h2>
          <p className="ny-memorial-section-intro">
            The complete record, from the patriarch's notice to the newest
            draft. Filter it, print a memorial sheet, or share one notice.
          </p>
        </div>
        <div className="ny-memorial-archive-actions">
          <button
            type="button"
            className="ny-btn ny-btn-ghost ny-btn-sm"
            onClick={() => onAction("filter")}
          >
            <Filter size={14} aria-hidden />
            Filter
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            onClick={() => onAction("export")}
          >
            <Download size={14} aria-hidden />
            Export a memorial sheet
          </button>
        </div>
      </div>

      <div className="ny-memorial-archive-bar">
        <label className="ny-memorial-inline-field">
          <span>Year</span>
          <select
            className="ny-memorial-select"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="ny-memorial-inline-field">
          <span>Branch</span>
          <select
            className="ny-memorial-select"
            value={branch}
            onChange={(event) => setBranch(event.target.value)}
          >
            <option value="all">All branches</option>
            {BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <span className="ny-memorial-archive-count ny-num">
          {rows.length} of {obituaries.length} notices
        </span>
      </div>

      <div className="ny-memorial-archive-table" role="table" aria-label="Obituary archive">
        <div className="ny-memorial-archive-row is-head" role="row">
          <span role="columnheader">Notice</span>
          <span role="columnheader">Years</span>
          <span role="columnheader">Relationship</span>
          <span role="columnheader">Branch</span>
          <span role="columnheader">Published</span>
          <span role="columnheader">Status</span>
          <span role="columnheader" className="sr-only">
            Actions
          </span>
        </div>
        {rows.map((o) => (
          <div key={o.id} className="ny-memorial-archive-row" role="row">
            <span role="cell" className="ny-memorial-archive-name">
              <img src={o.portrait} alt="" loading="lazy" />
              <span>
                <b>{o.name}</b>
                <small className="ny-num">{o.id}</small>
              </span>
            </span>
            <span role="cell" className="ny-num">
              {o.birthYear}–{o.deathYear}
            </span>
            <span role="cell">{o.relationship}</span>
            <span role="cell">
              <MemorialChip tone="sage">
                {BRANCHES.find((b) => b.id === o.branchId)?.shortName ?? "—"}
              </MemorialChip>
            </span>
            <span role="cell" className="ny-memorial-archive-date">
              {longDate(o.publishedAt)}
            </span>
            <span role="cell">
              <MemorialChip
                tone={
                  o.status === "published"
                    ? "sage"
                    : o.status === "draft"
                      ? "gold"
                      : "clay"
                }
              >
                {o.status}
              </MemorialChip>
            </span>
            <span role="cell" className="ny-memorial-archive-menu">
              <Menu>
                <MenuButton
                  className="ny-memorial-iconbtn"
                  aria-label={`Actions for ${o.name}`}
                >
                  <MoreHorizontal size={16} />
                </MenuButton>
                <MenuItems anchor="bottom end" className="ny-memorial-menu">
                  <MenuItem>
                    <button type="button" onClick={() => onOpen(o.id)}>
                      <Eye size={14} aria-hidden />
                      View the notice
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button type="button" onClick={() => onAction("share", o.id)}>
                      <Share2 size={14} aria-hidden />
                      Copy the share link
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button type="button" onClick={() => onAction("export", o.id)}>
                      <Download size={14} aria-hidden />
                      Export a memorial sheet
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button type="button" onClick={() => onAction("unpublish", o.id)}>
                      <Undo2 size={14} aria-hidden />
                      Unpublish the notice
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </span>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="ny-memorial-quiet ny-memorial-archive-empty">
            No notices match that filter.
          </p>
        )}
      </div>
    </section>
  );
}
