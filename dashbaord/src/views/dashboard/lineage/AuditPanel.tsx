"use client";

import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionHeader, StatusChip } from "@/components/ui/Primitives";
import { cn } from "@/lib/format";
import type { AuditAction, AuditEntry, AuditStatus } from "@/types/family";

const ACTION_LABEL: Record<AuditAction, string> = {
  "member.added": "Member added",
  "member.edited": "Edited",
  "member.deceased": "Passed on",
  "relation.added": "Relation",
  "branch.created": "Branch",
  "edit.requested": "Requested",
};

const FILTERS: Array<{ key: "all" | AuditStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "applied", label: "Applied" },
  { key: "pending", label: "Pending approval" },
  { key: "rejected", label: "Rejected" },
];

interface Props {
  entries: AuditEntry[];
  onOpen: (id: string) => void;
  onExport: () => void;
}

/** S7 — the lineage audit trail and the queue of member-suggested edits. */
export function AuditPanel({ entries, onOpen, onExport }: Props) {
  const [filter, setFilter] = useState<"all" | AuditStatus>("all");
  const counts = useMemo(() => {
    const map: Record<string, number> = { all: entries.length };
    for (const e of entries) map[e.status] = (map[e.status] ?? 0) + 1;
    return map;
  }, [entries]);
  const list = filter === "all" ? entries : entries.filter((e) => e.status === filter);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="S7 · Audit & requests"
        title="Every change leaves a trace"
        description="Admin edits apply and are logged with before and after values. Edits suggested by members wait in the queue until the Family Head approves them."
        actions={
          <button type="button" onClick={onExport} className="ny-btn ny-btn-gold">
            <Download className="size-4" aria-hidden />
            Export CSV
          </button>
        }
      />

      <div className="ny-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-hairline p-4">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={cn("ny-chip cursor-pointer", filter === f.key && "ny-chip-solid")}
            >
              {f.label}
              <span className="ny-num opacity-75">{counts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>

        <ul role="list" className="divide-y divide-hairline">
          {list.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => onOpen(entry.id)}
                className="grid w-full gap-2.5 p-4 text-left transition hover:bg-surface-0/70 sm:p-5 md:grid-cols-[10.5rem_7.5rem_1fr_auto] md:items-center md:gap-5"
              >
                <span className="font-mono text-xs text-text-tertiary">{entry.at}</span>
                <span className="ny-chip w-fit">{ACTION_LABEL[entry.action]}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-text-primary">{entry.summary}</span>
                  <span className="block truncate text-xs text-text-tertiary">
                    {entry.actor} · {entry.entity}
                  </span>
                </span>
                <StatusChip status={entry.status} />
              </button>
            </li>
          ))}
        </ul>

        {list.length === 0 && <p className="p-6 text-sm text-text-secondary">Nothing in this view. New changes appear here at once.</p>}
      </div>
    </div>
  );
}
