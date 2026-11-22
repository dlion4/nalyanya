"use client";

import { Funnel, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Reveal, TiltCard } from "@/components/ui/motion";
import { Avatar, SectionHeader } from "@/components/ui/Primitives";
import { ALBUMS, albumById, eventTitle, memberById, type GalleryAlbum, type GalleryPhoto } from "@/data/dashboard/gallery";
import { BRANCHES } from "@/data/family/branches";
import { EVENTS_SEED } from "@/data/dashboard/events";
import { MEMBERS } from "@/data/family/people";
import { cn } from "@/lib/format";
import { photoSrc } from "@/services/galleryService";
import { albumName, shortPhotoDate, VisibilityChip, visibilityHint } from "@/views/dashboard/gallery/galleryUi";
import type { GalleryActions, GalleryParams } from "@/views/dashboard/gallery/types";

const YEARS = ["all", "2026", "2025", "2024"];

/** S3 — Album chips and the filter bar (album · year · branch · contributor · event · tagged member · search). */
export function AlbumShelf({
  albums,
  photos,
  params,
  actions,
  viewerRole,
}: {
  albums: GalleryAlbum[];
  photos: GalleryPhoto[];
  params: GalleryParams;
  actions: GalleryActions;
  viewerRole: string;
}) {
  const [showAllFilters, setShowAllFilters] = useState(false);
  const set = actions.setParams;

  const countFor = (albumId: string) => (albumId === "all" ? photos.length : photos.filter((p) => p.albumId === albumId).length);
  const current = params.album === "all" ? null : albumById(params.album);

  const contributors = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of photos) map.set(p.contributorId, (map.get(p.contributorId) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [photos]);

  const tagged = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of photos) for (const t of p.taggedIds) map.set(t, (map.get(t) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [photos]);

  const linkedEvents = useMemo(() => [...new Set(photos.map((p) => p.eventId).filter((x): x is string => Boolean(x)))], [photos]);

  const active: Array<{ label: string; clear: () => void }> = [];
  if (current) active.push({ label: current.name, clear: () => set({ album: null }) });
  if (params.year !== "all") active.push({ label: `Year: ${params.year}`, clear: () => set({ year: null }) });
  if (params.branch !== "all") active.push({ label: BRANCHES.find((b) => b.id === params.branch)?.shortName ?? params.branch, clear: () => set({ branch: null }) });
  if (params.contributor !== "all") {
    const m = MEMBERS.find((x) => x.id === params.contributor);
    active.push({ label: `By ${m?.preferredName ?? "relative"}`, clear: () => set({ contributor: null }) });
  }
  if (params.event !== "all") active.push({ label: eventTitle(params.event) ?? "Event", clear: () => set({ event: null }) });
  if (params.tag !== "all") {
    const m = MEMBERS.find((x) => x.id === params.tag);
    active.push({ label: `Tagged: ${m?.preferredName ?? "member"}`, clear: () => set({ tag: null }) });
  }
  if (params.q) active.push({ label: `“${params.q}”`, clear: () => set({ q: null }) });

  const clearAll = () => set({ album: null, year: null, branch: null, contributor: null, event: null, tag: null, q: null });

  return (
    <section id="albums" aria-labelledby="albums-heading" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S3 · Albums & filters"
        title="Nine albums, one family story"
        description="Pick an album, then narrow by year, branch, the relative who took the photo, or who is in it."
      />

      {/* Album chips — horizontal scroll, each shows its photo count */}
      <div className="ny-scroll ny-chip-row -mx-1 flex gap-2 overflow-x-auto px-1 pb-2" role="group" aria-label="Choose an album">
        <button
          type="button"
          onClick={() => set({ album: null }, "replace")}
          aria-pressed={params.album === "all"}
          className={cn("ny-chip shrink-0 cursor-pointer py-2.5", params.album === "all" && "ny-chip-solid")}
        >
          All photos
          <span className="ny-num opacity-75">{photos.length}</span>
        </button>
        {albums.map((album) => (
          <button
            key={album.id}
            type="button"
            onClick={() => set({ album: album.id }, "replace")}
            aria-pressed={params.album === album.id}
            title={visibilityHint(album.visibility)}
            className={cn(
              "ny-chip shrink-0 cursor-pointer gap-2 py-2.5",
              params.album === album.id ? "ny-chip-solid" : album.visibility === "admins-only" && "border-brand-secondary/50",
            )}
          >
            {album.visibility !== "all-family" && <span className={cn("size-1.5 rounded-full", album.visibility === "admins-only" ? "bg-brand-secondary" : "bg-info")} aria-hidden />}
            {album.name}
            <span className="ny-num opacity-75">{countFor(album.id)}</span>
          </button>
        ))}
      </div>

      {/* Selected album banner */}
      {current && (
        <Reveal>
          <TiltCard max={3}>
            <article className="ny-card ny-card-3d grid gap-5 overflow-hidden p-4 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:p-5">
              <img src={photoSrc(photos.find((p) => p.id === current.coverId) ?? photos.find((p) => p.albumId === current.id) ?? photos[0])} alt="" className="h-28 w-full rounded-2xl object-cover sm:h-24 sm:w-36" decoding="async" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="ny-title text-2xl leading-tight">{current.name}</h3>
                  <VisibilityChip visibility={current.visibility} />
                  <span className="ny-chip">{current.year}</span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{current.description}</p>
                <p className="mt-2 text-xs text-text-tertiary">
                  {countFor(current.id)} photos · {BRANCHES.find((b) => b.id === current.branchId)?.name}
                  {current.eventId ? ` · From: ${eventTitle(current.eventId)}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {viewerRole === "Family Head" && (
                  <button type="button" onClick={() => actions.openAct("album-edit", { target: current.id })} className="ny-btn ny-btn-ghost ny-btn-sm">
                    Edit album
                  </button>
                )}
                <button type="button" onClick={() => actions.openAct("share-album", { target: current.id })} className="ny-btn ny-btn-primary ny-btn-sm">
                  Share album
                </button>
              </div>
            </article>
          </TiltCard>
        </Reveal>
      )}

      {/* Filter bar */}
      <div className="ny-card space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search photos by caption</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden />
            <input
              type="search"
              value={params.q}
              onChange={(e) => set({ q: e.target.value }, "replace")}
              placeholder="Search captions, e.g. “first dance” or “sunset”…"
              className="ny-input pl-11"
            />
          </label>
          <button type="button" onClick={() => setShowAllFilters((v) => !v)} aria-expanded={showAllFilters} className={cn("ny-btn ny-btn-sm", showAllFilters ? "ny-btn-ghost" : "ny-btn-ghost")}>
            <Funnel className="size-4" aria-hidden />
            {showAllFilters ? "Fewer filters" : "All filters"}
          </button>
          {active.length > 0 && (
            <button type="button" onClick={clearAll} className="ny-btn ny-btn-gold ny-btn-sm">
              <X className="size-3.5" aria-hidden />
              Clear {active.length}
            </button>
          )}
        </div>

        <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", !showAllFilters && "lg:grid-cols-3")}>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">Year</span>
            <select value={params.year} onChange={(e) => set({ year: e.target.value }, "replace")} className="ny-input !min-h-[42px] !py-2 text-sm">
              {YEARS.map((y) => (
                <option key={y} value={y}>{y === "all" ? "All years" : y}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">Branch</span>
            <select value={params.branch} onChange={(e) => set({ branch: e.target.value }, "replace")} className="ny-input !min-h-[42px] !py-2 text-sm">
              <option value="all">All branches</option>
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">Taken by</span>
            <select value={params.contributor} onChange={(e) => set({ contributor: e.target.value }, "replace")} className="ny-input !min-h-[42px] !py-2 text-sm">
              <option value="all">Anyone</option>
              {contributors.map(([id, n]) => {
                const m = MEMBERS.find((x) => x.id === id);
                return (
                  <option key={id} value={id}>{m ? `${m.preferredName} ${m.lastName}` : id} · {n}</option>
                );
              })}
            </select>
          </label>
          {showAllFilters && (
            <>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">Tagged member</span>
                <select value={params.tag} onChange={(e) => set({ tag: e.target.value }, "replace")} className="ny-input !min-h-[42px] !py-2 text-sm">
                  <option value="all">Anyone in the photo</option>
                  {tagged.map(([id, n]) => {
                    const m = MEMBERS.find((x) => x.id === id);
                    return (
                      <option key={id} value={id}>{m ? `${m.preferredName} ${m.lastName}` : id} · {n}</option>
                    );
                  })}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">From an event</span>
                <select value={params.event} onChange={(e) => set({ event: e.target.value }, "replace")} className="ny-input !min-h-[42px] !py-2 text-sm">
                  <option value="all">Any gathering</option>
                  {linkedEvents.map((id) => (
                    <option key={id} value={id}>{eventTitle(id) ?? id}</option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>

        {/* Active filters */}
        {active.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-hairline pt-3">
            <span className="text-xs font-semibold text-text-tertiary">Showing:</span>
            {active.map((chip) => (
              <button key={chip.label} type="button" onClick={chip.clear} className="ny-chip ny-chip-gold max-w-[16rem] cursor-pointer hover:opacity-85" title="Remove this filter">
                <span className="truncate">{chip.label}</span>
                <X className="size-3 shrink-0" aria-hidden />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* Small shared pieces reused by the grid and the album manager. */
export function AlbumCover({ album, photos, className }: { album: GalleryAlbum; photos: GalleryPhoto[]; className?: string }) {
  const inAlbum = photos.filter((p) => p.albumId === album.id);
  const cover = inAlbum.find((p) => p.id === album.coverId) ?? inAlbum[0];
  return cover ? (
    <img src={photoSrc(cover)} alt="" loading="lazy" decoding="async" className={cn("object-cover", className)} />
  ) : (
    <div className={cn("grid place-items-center bg-surface-2 text-xs text-text-tertiary", className)}>No photos yet</div>
  );
}

export function ContributorAvatars({ photos, max = 4 }: { photos: GalleryPhoto[]; max?: number }) {
  const ids = [...new Set(photos.map((p) => p.contributorId))].slice(0, max);
  return (
    <span className="flex -space-x-2">
      {ids.map((id) => {
        const m = memberById(id);
        return m ? <Avatar key={id} member={m} size={28} className="!rounded-full ring-2 ring-surface-1" /> : null;
      })}
    </span>
  );
}

export { ALBUMS, albumName, shortPhotoDate, EVENTS_SEED };
