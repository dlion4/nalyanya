"use client";

import { Aperture, ChevronDown, Clock, Heart, ImageOff, Images, LayoutGrid, LayoutList, Rows3, Search, Star, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePrefs } from "@/components/shell/PrefsProvider";
import { Avatar, SimulatedBadge } from "@/components/ui/Primitives";
import type { GalleryAlbum, GalleryPhoto } from "@/data/dashboard/gallery";
import { MEMBERS } from "@/data/family/people";
import { cn } from "@/lib/format";
import { photoSrc } from "@/services/galleryService";
import { albumName, shortPhotoDate } from "@/views/dashboard/gallery/galleryUi";
import { LazyPhoto } from "@/views/dashboard/gallery/LazyPhoto";
import { PAGE_SIZE, type GalleryActions, type GalleryParams } from "@/views/dashboard/gallery/types";

/** Column count per breakpoint — must match the grid classes rendered below. */
const COLS = { base: 2, sm: 2, lg: 3, xl: 4 } as const;

function useColumnCount(): number {
  const [cols, setCols] = useState<number>(COLS.base);
  useEffect(() => {
    const mq = (min: number) => window.matchMedia(`(min-width: ${min}px)`);
    const lg = mq(1024);
    const xl = mq(1280);
    const update = () => setCols(xl.matches ? COLS.xl : lg.matches ? COLS.lg : COLS.sm);
    update();
    lg.addEventListener("change", update);
    xl.addEventListener("change", update);
    return () => {
      lg.removeEventListener("change", update);
      xl.removeEventListener("change", update);
    };
  }, []);
  return cols;
}

/** Shortest-column masonry. Returns columns in DOM order, so reading order is preserved. */
function toColumns<T>(items: T[], cols: number, ratioOf: (item: T) => number): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => []);
  const heights = new Array<number>(cols).fill(0);
  items.forEach((item) => {
    /* Height for a unit-width column: 1 / ratio. */
    let best = 0;
    for (let i = 1; i < cols; i++) if (heights[i] < heights[best] - 1e-6) best = i;
    columns[best].push(item);
    heights[best] += 1 / ratioOf(item);
  });
  return columns;
}

/** One cell — used by all three view modes so hover content and focus behaviour match. */
function PhotoCell({
  photo,
  onOpen,
  eager,
  overlay = "hover",
}: {
  photo: GalleryPhoto;
  onOpen: () => void;
  eager?: boolean;
  overlay?: "hover" | "always" | "none";
}) {
  const contributor = MEMBERS.find((m) => m.id === photo.contributorId);
  const tagged = photo.taggedIds.map((id) => MEMBERS.find((m) => m.id === id)).filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <figure className="ny-tile group relative">
      <LazyPhoto src={photoSrc(photo)} alt={photo.caption} ratio={photo.ratio} eager={eager} imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.05]">
        {overlay !== "none" && (
          <figcaption
            className={cn(
              "absolute inset-x-0 bottom-0 z-10 translate-y-2 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 pt-10 text-white transition duration-300 ease-out",
              overlay === "hover" ? "opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100" : "translate-y-0 opacity-100",
            )}
          >
            <p className="line-clamp-2 text-sm font-semibold leading-snug">{photo.caption}</p>
            <p className="mt-1 truncate text-[11px] text-white/80">
              {albumName(photo.albumId)} · {shortPhotoDate(photo.takenOn)}
            </p>
            {(tagged.length > 0 || photo.favourites > 0) && (
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  {tagged.slice(0, 3).map((m) => (
                    <Avatar key={m.id} member={m} size={22} className="!rounded-full ring-2 ring-white/70" />
                  ))}
                  {tagged.length > 3 && <span className="text-[10px] font-semibold">+{tagged.length - 3}</span>}
                </span>
                {photo.favourites > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold">
                    <Heart className="size-3 fill-current" aria-hidden /> {photo.favourites}
                  </span>
                )}
              </div>
            )}
          </figcaption>
        )}
      </LazyPhoto>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open photo: ${photo.caption}${contributor ? `, taken by ${contributor.preferredName}` : ""}`}
        className="absolute inset-0 cursor-zoom-in rounded-[inherit] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent"
      />
    </figure>
  );
}

/** S4 — The photograph wall: true masonry (or uniform grid / list), lazy, paged. */
export function PhotoGrid({
  photos,
  albums,
  params,
  actions,
}: {
  photos: GalleryPhoto[];
  /** Albums carry the branch, so a photo's branch is looked up through its album. */
  albums: GalleryAlbum[];
  params: GalleryParams;
  actions: GalleryActions;
}) {
  const { calmMotion } = usePrefs();
  const cols = useColumnCount();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const sentinel = useRef<HTMLDivElement>(null);

  /* Reset paging whenever the filter set changes. */
  const filterKey = `${params.album}|${params.year}|${params.branch}|${params.contributor}|${params.event}|${params.tag}|${params.q}|${params.sort}|${params.view}`;
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [filterKey]);

  const branchOfAlbum = useMemo(() => new Map(albums.map((a) => [a.id, a.branchId])), [albums]);
  const albumBranch = (albumId: string) => branchOfAlbum.get(albumId) ?? "";

  const filtered = useMemo(() => {
    const q = params.q.trim().toLowerCase();
    const list = photos.filter((p) => {
      if (params.album !== "all" && p.albumId !== params.album) return false;
      if (params.year !== "all" && p.year !== params.year) return false;
      if (params.contributor !== "all" && p.contributorId !== params.contributor) return false;
      if (params.event !== "all" && p.eventId !== params.event) return false;
      if (params.tag !== "all" && !p.taggedIds.includes(params.tag)) return false;
      /* A photo's branch is its album's branch. */
      if (params.branch !== "all" && albumBranch(p.albumId) !== params.branch) return false;
      if (q && !`${p.caption} ${albumName(p.albumId)}`.toLowerCase().includes(q)) return false;
      return true;
    });
    const sorted = [...list];
    if (params.sort === "oldest") sorted.sort((a, b) => a.takenOn.localeCompare(b.takenOn) || a.seq - b.seq);
    else if (params.sort === "favourites") sorted.sort((a, b) => b.favourites - a.favourites || b.seq - a.seq);
    else sorted.sort((a, b) => b.takenOn.localeCompare(a.takenOn) || b.seq - a.seq);
    return sorted;
  }, [photos, albums, params.album, params.year, params.branch, params.contributor, params.event, params.tag, params.q, params.sort]);

  const shown = filtered.slice(0, limit);
  const remaining = filtered.length - shown.length;

  const columns = useMemo(() => (params.view === "masonry" ? toColumns(shown, cols, (p) => p.ratio) : []), [shown, cols, params.view]);

  /* Load more when the sentinel scrolls into view. */
  useEffect(() => {
    const el = sentinel.current;
    if (!el || remaining <= 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setLimit((n) => n + PAGE_SIZE);
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [remaining, filterKey]);

  const gridCls = params.view === "grid" ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" : "grid grid-cols-1 gap-3 sm:grid-cols-2";

  return (
    <section id="grid" aria-labelledby="grid-heading" className="scroll-mt-24 space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="ny-eyebrow">S4 · The photographs</p>
          <h2 id="grid-heading" className="ny-title mt-2 text-3xl sm:text-4xl">
            {filtered.length === photos.length ? "All photographs" : `${filtered.length} of ${photos.length} photographs`}
          </h2>
          <p className="mt-2 max-w-2xl text-text-secondary">
            {params.view === "masonry"
              ? "Laid out like a print table: each photo keeps its own shape. More load as you scroll."
              : params.view === "grid"
                ? "Every photo cropped to a square, for a quick scan."
                : "A list with captions, albums and dates."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-hairline bg-surface-1 p-1" role="group" aria-label="Layout">
            {(
              [
                ["masonry", Rows3, "Masonry"],
                ["grid", LayoutGrid, "Grid"],
                ["list", LayoutList, "List"],
              ] as Array<[GalleryParams["view"], LucideIcon, string]>
            ).map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => actions.setParams({ view: key }, "replace")}
                aria-pressed={params.view === key}
                aria-label={`${label} view`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition",
                  params.view === key ? "bg-brand-primary text-white" : "text-text-secondary hover:text-text-primary",
                )}
              >
                <Icon className="size-3.5" aria-hidden />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          <div className="inline-flex rounded-full border border-hairline bg-surface-1 p-1" role="group" aria-label="Sort">
            {(
              [
                ["newest", Clock, "Newest"],
                ["oldest", Aperture, "Oldest"],
                ["favourites", Star, "Favourites"],
              ] as Array<[GalleryParams["sort"], LucideIcon, string]>
            ).map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => actions.setParams({ sort: key === "newest" ? null : key }, "replace")}
                aria-pressed={params.sort === key}
                className={cn("rounded-full px-3 py-2 text-xs font-semibold transition", params.sort === key ? "bg-brand-accent text-brand-deep" : "text-text-secondary hover:text-text-primary")}
              >
                <span className="hidden sm:inline">{label}</span>
                <Icon className="size-3.5 sm:hidden" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="ny-card grid place-items-center gap-3 p-10 text-center" role="status">
          <ImageOff className="size-10 text-brand-primary" aria-hidden />
          <h3 className="ny-title text-2xl">No photographs match those filters</h3>
          <p className="max-w-md text-sm text-text-secondary">Try a shorter search, or clear the filters to see the whole collection.</p>
          <button type="button" onClick={() => actions.setParams({ album: null, year: null, branch: null, contributor: null, event: null, tag: null, q: null }, "replace")} className="ny-btn ny-btn-primary">
            Clear filters
          </button>
        </div>
      ) : params.view === "masonry" ? (
        <div className="ny-masonry grid grid-cols-2 items-start gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {columns.map((column, i) => (
            <div key={i} className={cn("flex min-w-0 flex-col gap-3", !calmMotion && "ny-col-in")} style={{ animationDelay: `${i * 70}ms` }}>
              {column.map((p) => (
                <PhotoCell key={p.id} photo={p} onOpen={() => actions.openPhoto(p.id)} eager={i === 0 && p === column[0]} />
              ))}
            </div>
          ))}
        </div>
      ) : params.view === "grid" ? (
        <div className={gridCls}>
          {shown.map((p) => (
            <div key={p.id} className="aspect-square">
              <PhotoCell photo={{ ...p, ratio: 1 }} onOpen={() => actions.openPhoto(p.id)} />
            </div>
          ))}
        </div>
      ) : (
        <ul className="ny-card divide-y divide-hairline overflow-hidden">
          {shown.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => actions.openPhoto(p.id)} className="grid w-full grid-cols-[5.5rem_1fr_auto] items-center gap-4 p-3 text-left transition hover:bg-surface-0/70 sm:grid-cols-[7rem_1fr_auto] sm:p-4">
                <div className="aspect-square overflow-hidden rounded-2xl bg-surface-2">
                  <LazyPhoto src={photoSrc(p)} alt="" ratio={1} />
                </div>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-text-primary">{p.caption}</span>
                  <span className="block truncate text-xs text-text-tertiary">
                    {albumName(p.albumId)} · {shortPhotoDate(p.takenOn)} {p.year}
                  </span>
                  {p.taggedIds.length > 0 && (
                    <span className="mt-1.5 flex items-center gap-1.5 text-xs text-text-secondary">
                      <Images className="size-3.5" aria-hidden />
                      {p.taggedIds.length} tagged
                    </span>
                  )}
                </span>
                <span className="ny-chip hidden sm:inline-flex">{p.year}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Load-more sentinel + manual fallback */}
      {remaining > 0 && (
        <div ref={sentinel} className="grid place-items-center gap-3 py-6 text-center">
          <p className="ny-num text-xs text-text-tertiary">
            Showing {shown.length} of {filtered.length}
          </p>
          <button type="button" onClick={() => setLimit((n) => n + PAGE_SIZE)} className="ny-btn ny-btn-ghost ny-btn-sm">
            <ChevronDown className="size-4" aria-hidden />
            Load {Math.min(PAGE_SIZE, remaining)} more
          </button>
        </div>
      )}

      {filtered.length > 0 && (
        <p className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
          <Search className="size-3.5" aria-hidden />
          Tip: press ← and → to move through photos once one is open. <SimulatedBadge label="Photos are illustrative stock" />
        </p>
      )}
    </section>
  );
}
