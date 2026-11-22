"use client";

import { History, RotateCcw, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Avatar, SectionHeader } from "@/components/ui/Primitives";
import type { GalleryState } from "@/services/galleryService";
import { memberById, type GalleryAudit } from "@/data/dashboard/gallery";
import { cn } from "@/lib/format";
import { emptyTrash, purgePhoto, restorePhoto } from "@/services/galleryService";
import { albumName, ago, bytesLabel } from "@/views/dashboard/gallery/galleryUi";
import { photoSrc } from "@/services/galleryService";
import type { GalleryActions } from "@/views/dashboard/gallery/types";

const ACTION_STYLE: Record<string, string> = {
  upload: "ny-chip-success",
  restore: "ny-chip-success",
  tag: "ny-chip-info",
  untag: "",
  cover: "ny-chip-gold",
  rename: "ny-chip-gold",
  connect: "ny-chip-violet",
  sync: "ny-chip-info",
  delete: "ny-chip-danger",
};

/** Days left in the 30-day recovery window, shown as a small meter. */
function DaysLeft({ days }: { days: number }) {
  const pct = Math.max(0, Math.min(100, (days / 30) * 100));
  const urgent = days <= 5;
  return (
    <div className="min-w-[7rem]">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div className={cn("h-full rounded-full", urgent ? "bg-brand-secondary" : "bg-brand-primary")} style={{ width: `${pct}%` }} />
      </div>
      <p className={cn("ny-num mt-1 text-[11px]", urgent ? "font-semibold text-brand-secondary" : "text-text-tertiary")}>{days} day{days === 1 ? "" : "s"} left</p>
    </div>
  );
}

/** S7 — Trash (recoverable for 30 days) and the audit trail of every change. */
export function TrashAudit({ state, actions }: { state: GalleryState; actions: GalleryActions }) {
  const [auditFilter, setAuditFilter] = useState<"all" | GalleryAudit["action"]>("all");
  const audit = useMemo(() => (auditFilter === "all" ? state.audit : state.audit.filter((a) => a.action === auditFilter)), [state.audit, auditFilter]);
  const kinds = useMemo(() => [...new Set(state.audit.map((a) => a.action))], [state.audit]);

  return (
    <section id="trash" aria-labelledby="trash-heading" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S7 · Trash & audit"
        title="Nothing is lost by accident"
        description="Deleted photos stay recoverable for 30 days. Every upload, delete, tag and album change is recorded below."
      />

      <TabGroup>
        <TabList className="ny-scroll inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-hairline bg-surface-1 p-1">
          <Tab className="ny-tab">Trash ({state.trash.length})</Tab>
          <Tab className="ny-tab">Audit trail ({state.audit.length})</Tab>
        </TabList>

        <TabPanels className="mt-5">
          {/* Trash */}
          <TabPanel className="focus:outline-none">
            <div className="ny-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline p-4 sm:p-5">
                <div>
                  <h3 className="ny-title text-xl">Recently deleted</h3>
                  <p className="text-xs text-text-secondary">Restore a photo any time in the next 30 days. After that it is gone for good.</p>
                </div>
                {state.trash.length > 0 && (
                  <button
                    type="button"
                    disabled={actions.pending}
                    onClick={() =>
                      actions.run(() => emptyTrash("NY-MBR-00019"), { title: "Trash emptied", body: `${state.trash.length} photo${state.trash.length === 1 ? "" : "s"} deleted permanently.`, tone: "warning" })
                    }
                    className="ny-btn ny-btn-ghost ny-btn-sm !text-danger"
                  >
                    <Trash className="size-3.5" aria-hidden /> Empty trash
                  </button>
                )}
              </div>

              {state.trash.length === 0 ? (
                <div className="grid place-items-center gap-2 p-10 text-center">
                  <RotateCcw className="size-8 text-brand-primary" aria-hidden />
                  <p className="text-sm text-text-secondary">The trash is empty. Deleted photos will wait here for 30 days.</p>
                </div>
              ) : (
                <ul className="divide-y divide-hairline">
                  {state.trash.map(({ photo, entry }) => (
                    <li key={photo.id} className="grid gap-3 p-4 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-4 sm:p-5">
                      <img src={photoSrc(photo)} alt="" loading="lazy" decoding="async" className="aspect-square w-20 rounded-2xl object-cover opacity-80" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-text-primary">{photo.caption.replace(/^Removed: /, "")}</p>
                        <p className="text-xs text-text-tertiary">
                          From {albumName(photo.albumId)} · deleted {entry.deletedAt}
                        </p>
                        <p className="mt-1 text-xs text-text-secondary">Reason: {entry.reason}</p>
                        <div className="mt-2 sm:hidden"><DaysLeft days={entry.daysLeft} /></div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="hidden sm:block"><DaysLeft days={entry.daysLeft} /></div>
                        <button
                          type="button"
                          disabled={actions.pending}
                          onClick={() => actions.run(() => restorePhoto(photo.id, "NY-MBR-00019"), { title: "Photo restored", body: "It is back in its album.", tone: "success" })}
                          className="ny-btn ny-btn-primary ny-btn-sm"
                        >
                          <RotateCcw className="size-3.5" aria-hidden /> Restore
                        </button>
                        <button
                          type="button"
                          disabled={actions.pending}
                          onClick={() => actions.run(() => purgePhoto(photo.id, "NY-MBR-00019"), { title: "Deleted permanently", tone: "warning" })}
                          className="ny-btn ny-btn-ghost ny-btn-sm !text-danger"
                        >
                          Delete forever
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabPanel>

          {/* Audit */}
          <TabPanel className="focus:outline-none">
            <div className="ny-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <History className="size-4 text-text-tertiary" aria-hidden />
                  <h3 className="ny-title text-xl">Who did what, and when</h3>
                </div>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter the audit trail">
                  <button type="button" onClick={() => setAuditFilter("all")} aria-pressed={auditFilter === "all"} className={cn("ny-chip cursor-pointer", auditFilter === "all" && "ny-chip-solid")}>All</button>
                  {kinds.map((k) => (
                    <button key={k} type="button" onClick={() => setAuditFilter(k)} aria-pressed={auditFilter === k} className={cn("ny-chip cursor-pointer capitalize", auditFilter === k && "ny-chip-solid")}>{k}</button>
                  ))}
                </div>
              </div>
              <ul className="divide-y divide-hairline">
                {audit.map((a) => {
                  const actor = memberById(a.actorId);
                  return (
                    <li key={a.id} className="grid gap-2.5 p-4 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:gap-4 sm:px-5">
                      <span className="font-mono text-xs text-text-tertiary">{a.at.replace("2026-", "")}</span>
                      <span className="flex min-w-0 items-center gap-2.5">
                        {actor && <Avatar member={actor} size={28} className="!rounded-full" />}
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-text-primary">{a.detail}</span>
                          <span className="block truncate font-mono text-[11px] text-text-tertiary">{a.subject}</span>
                        </span>
                      </span>
                      <span className={cn("ny-chip w-fit capitalize", ACTION_STYLE[a.action] ?? "")}>{a.action}</span>
                    </li>
                  );
                })}
                {audit.length === 0 && <li className="p-6 text-sm text-text-secondary">Nothing of that kind yet.</li>}
              </ul>
              <p className="border-t border-hairline p-4 text-xs text-text-tertiary sm:px-5">
                Newest first · {bytesLabel(state.photos.reduce((s, p) => s + p.bytes, 0) / 1024)} across {state.photos.length} photos · last change {ago(14)}
              </p>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </section>
  );
}
