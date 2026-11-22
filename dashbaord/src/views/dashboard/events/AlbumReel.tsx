"use client";

import { Aperture, Maximize2 } from "lucide-react";
import { useMemo, useState } from "react";
import { IrisReel, type ReelSlide } from "@/components/ui/IrisReel";
import { SectionHeader } from "@/components/ui/Primitives";
import { type FamilyEvent, sortByStart, venueById } from "@/data/dashboard/events";
import { longDate } from "@/lib/calendar";
import type { EventsActions } from "@/views/dashboard/events/types";

export function AlbumReel({ events, actions }: { events: FamilyEvent[]; actions: EventsActions }) {
  const withAlbums = useMemo(() => sortByStart(events.filter((e) => e.album.length > 0)).reverse(), [events]);
  const [pickedId, setPickedId] = useState<string>(withAlbums[0]?.id ?? "");
  const picked = withAlbums.find((e) => e.id === pickedId) ?? withAlbums[0];

  const slides: ReelSlide[] = useMemo(
    () =>
      picked
        ? picked.album.map((shot) => ({
            src: shot.src,
            alt: shot.alt,
            caption: shot.caption,
            year: picked.date.slice(0, 4),
            place: venueById(picked.venueId)?.town ?? "Kenya",
          }))
        : [],
    [picked],
  );

  return (
    <section id="album" aria-labelledby="album-heading" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S8 · Camera-pinhole album"
        title="Each photo arrives through a shutter"
        description="Pick any album. The aperture closes to a pinhole, the exposure changes, and the lens opens on the next moment. Full-screen mode gives every frame room."
        actions={
          picked && (
            <button type="button" onClick={() => actions.openAct("album-view", { event: picked.id })} className="ny-btn ny-btn-primary">
              <Maximize2 className="size-4" aria-hidden /> Open full-screen album
            </button>
          )
        }
      />
      <h2 id="album-heading" className="sr-only">Event photo albums</h2>

      {picked ? (
        <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <div>
            <IrisReel key={picked.id} slides={slides} />
          </div>
          <aside className="ny-card flex flex-col gap-4 p-5 sm:p-6">
            <p className="ny-eyebrow flex items-center gap-1.5">
              <Aperture className="size-3.5" aria-hidden /> Choose an album
            </p>
            <ul className="ny-scroll max-h-[28rem] space-y-2.5 overflow-y-auto pr-1">
              {withAlbums.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setPickedId(e.id)}
                    aria-pressed={e.id === picked.id}
                    className={
                      e.id === picked.id
                        ? "flex w-full items-center gap-3 rounded-2xl border border-brand-primary bg-brand-primary/[0.06] p-2.5 text-left"
                        : "flex w-full items-center gap-3 rounded-2xl border border-hairline bg-surface-0/60 p-2.5 text-left transition hover:border-brand-primary/40"
                    }
                  >
                    <img src={e.cover} alt="" loading="lazy" decoding="async" className="size-14 shrink-0 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-text-primary">{e.title}</span>
                      <span className="block truncate text-xs text-text-tertiary">
                        {longDate(e.date).split(",")[1]?.trim()} · {e.album.length} frames
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="rounded-2xl border border-dashed border-brand-secondary/50 p-3 text-xs leading-relaxed text-text-secondary">
              Album photos are illustrative. Google Drive folder sync connects in Phase 2 (SIMULATED here).
            </p>
          </aside>
        </div>
      ) : (
        <div className="ny-card p-10 text-center text-sm text-text-secondary">No albums yet. Add photos to a held gathering to start one.</div>
      )}
    </section>
  );
}
