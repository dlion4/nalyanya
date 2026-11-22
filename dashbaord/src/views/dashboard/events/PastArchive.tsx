"use client";

import Link from "next/link";
import { Camera, Images, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { Reveal } from "@/components/ui/motion";
import { SectionHeader } from "@/components/ui/Primitives";
import { causeById, memberById, rsvpSummary, sortByStart, venueById, type FamilyEvent } from "@/data/dashboard/events";
import { cn } from "@/lib/format";
import { KindChip } from "@/views/dashboard/events/eventsUi";
import type { EventsActions, EventsParams } from "@/views/dashboard/events/types";
import { BarMeter } from "@/components/ui/Charts";
import { dayMonth } from "@/lib/calendar";

const YEARS = ["all", "2026", "2025"] as const;

export function PastArchive({ events, params, actions }: { events: FamilyEvent[]; params: EventsParams; actions: EventsActions }) {
  const [withAlbums, setWithAlbums] = useState(false);
  const done = useMemo(() => sortByStart(events.filter((e) => e.status === "done")).reverse(), [events]);
  const list = done.filter((e) => (params.year === "all" || e.date.startsWith(params.year)) && (!withAlbums || e.album.length > 0));

  return (
    <section id="archive" aria-labelledby="archive-heading" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S7 · Past events archive"
        title="What we gathered for, and what we kept"
        description="Every gathering that was held, with attendance, the album and the contribution it raised. Open any card for the full story."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full border border-hairline bg-surface-1 p-1" role="group" aria-label="Filter archive by year">
              {YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => actions.setParams({ year: y }, "replace")}
                  aria-pressed={params.year === y}
                  className={cn("rounded-full px-3.5 py-2 text-xs font-semibold transition", params.year === y ? "bg-brand-primary text-white" : "text-text-secondary hover:text-text-primary")}
                >
                  {y === "all" ? "All years" : y}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setWithAlbums((v) => !v)}
              aria-pressed={withAlbums}
              className={cn("ny-chip cursor-pointer px-3.5 py-2", withAlbums && "ny-chip-solid")}
            >
              <Images className="size-3.5" aria-hidden /> With albums
            </button>
          </div>
        }
      />
      <h2 id="archive-heading" className="sr-only">Past events archive</h2>

      {list.length === 0 ? (
        <div className="ny-card p-10 text-center text-sm text-text-secondary">No held gatherings match that filter yet.</div>
      ) : (
        <div className="perspective-[1400px] grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((e, i) => {
            const s = rsvpSummary(e);
            const cause = causeById(e.causeId);
            const host = memberById(e.host);
            return (
              <Reveal key={e.id} delay={(i % 3) * 0.06}>
                <article className="ny-polaroid group relative flex h-full flex-col rounded-[22px] bg-surface-1 p-3 shadow-soft transition duration-500 hover:-translate-y-1.5 hover:-rotate-1 hover:shadow-lift">
                  <button type="button" onClick={() => actions.openEvent(e.id)} className="relative block overflow-hidden rounded-2xl text-left">
                    <img src={e.cover} alt={`Photo from ${e.title}`} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" />
                    <span className="absolute left-3 top-3">
                      <KindChip kind={e.kind} className="!bg-black/50 !text-white !border-white/30" />
                    </span>
                    <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                      {e.album.length} photos
                    </span>
                  </button>

                  <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-secondary">
                      {dayMonth(e.date)} {e.date.slice(0, 4)} · {venueById(e.venueId)?.town}
                    </p>
                    <h3 className="ny-title mt-1.5 text-xl leading-snug">{e.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">{e.description}</p>

                    <dl className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-xl bg-surface-0/80 p-2">
                        <dt className="text-[10px] uppercase text-text-tertiary">Arrived</dt>
                        <dd className="ny-num font-semibold text-text-primary">{s.arrived}</dd>
                      </div>
                      <div className="rounded-xl bg-surface-0/80 p-2">
                        <dt className="text-[10px] uppercase text-text-tertiary">Host</dt>
                        <dd className="truncate font-semibold text-text-primary">{host?.preferredName ?? "Family"}</dd>
                      </div>
                      <div className="rounded-xl bg-surface-0/80 p-2">
                        <dt className="text-[10px] uppercase text-text-tertiary">Album</dt>
                        <dd className="ny-num font-semibold text-text-primary">{e.album.length}</dd>
                      </div>
                    </dl>

                    {cause && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="truncate font-semibold text-text-secondary">{cause.title}</span>
                          <span className="ny-num font-semibold text-brand-primary">{Math.round((cause.raised / cause.target) * 100)}%</span>
                        </div>
                        <BarMeter value={cause.raised} max={cause.target} color="#D4A437" className="mt-1.5" />
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap gap-2 pt-5">
                      {e.album.length > 0 ? (
                        <button type="button" onClick={() => actions.openAct("album-view", { event: e.id })} className="ny-btn ny-btn-primary ny-btn-sm">
                          <Camera className="size-4" aria-hidden /> Open album
                        </button>
                      ) : (
                        <button type="button" onClick={() => actions.openAct("upload", { event: e.id })} className="ny-btn ny-btn-primary ny-btn-sm">
                          <Upload className="size-4" aria-hidden /> Add photos
                        </button>
                      )}
                      <button type="button" onClick={() => actions.openEvent(e.id)} className="ny-btn ny-btn-ghost ny-btn-sm">
                        Details
                      </button>
                      {e.causeId && (
                        <Link href="/dashboard/contributions" className="ny-btn ny-btn-quiet ny-btn-sm">
                          Reconcile →
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      )}
    </section>
  );
}
