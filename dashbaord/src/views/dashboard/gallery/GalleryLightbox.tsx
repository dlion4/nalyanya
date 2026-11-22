"use client";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { Aperture, ChevronLeft, ChevronRight, CircleDot, Heart, ImagePlus, Info, Link2, MapPin, Maximize2, Minimize2, Tag, Trash, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Avatar, BranchChip, SimulatedBadge } from "@/components/ui/Primitives";
import type { GalleryAlbum, GalleryPhoto } from "@/data/dashboard/gallery";
import { eventTitle, memberById } from "@/data/dashboard/gallery";
import { cn } from "@/lib/format";
import { photoSrc } from "@/services/galleryService";
import { albumName, ago, bytesLabel, photoDate } from "@/views/dashboard/gallery/galleryUi";
import { ShutterFrame, type ShutterStyle } from "@/views/dashboard/gallery/ShutterFrame";
import type { GalleryActions, GalleryParams } from "@/views/dashboard/gallery/types";

function Meta({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <span className="mt-0.5 text-white/55">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">{label}</span>
        <span className="block text-white/90">{children}</span>
      </span>
    </div>
  );
}

/** The on-screen frame. Keyed so the shutter swaps it while the blades are closed. */
function Frame({ photo, zoomed }: { photo: GalleryPhoto; zoomed: boolean }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <img
        src={photoSrc(photo)}
        alt={photo.caption}
        decoding="async"
        fetchPriority="high"
        draggable={false}
        className={cn("max-h-full max-w-full object-contain transition-transform duration-700 ease-out", zoomed && "scale-[1.6] cursor-zoom-out", !zoomed && "cursor-zoom-in")}
      />
    </div>
  );
}

/**
 * Full-screen lightbox. Moving between photographs runs the camera shutter:
 * the blades close onto the focus point, the exposure swaps, the blades open.
 * Deep-linkable with ?img=NY-IMG-…
 */
export function GalleryLightbox({
  photo,
  photos,
  albums,
  act,
  calm,
  actions,
  onStep,
}: {
  photo: GalleryPhoto | null;
  photos: GalleryPhoto[];
  albums: GalleryAlbum[];
  act: GalleryParams["act"];
  calm: boolean;
  actions: GalleryActions;
  onStep: (dir: 1 | -1) => void;
}) {
  const ordered = useMemo(() => [...photos].sort((a, b) => b.seq - a.seq), [photos]);
  const index = photo ? ordered.findIndex((p) => p.id === photo.id) : -1;
  const prev = index > 0 ? ordered[index - 1] : null;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : null;

  const [shutterStyle, setShutterStyle] = useState<ShutterStyle>("iris");
  const [showInfo, setShowInfo] = useState(true);
  const [zoomed, setZoomed] = useState(false);
  const [busy, setBusy] = useState(false);

  /* Reset zoom each time the frame changes. */
  useEffect(() => {
    setZoomed(false);
  }, [photo?.id]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!photo || act) return; // a nested overlay owns the keyboard
      if (e.key === "ArrowRight" && next) {
        e.preventDefault();
        onStep(1);
      } else if (e.key === "ArrowLeft" && prev) {
        e.preventDefault();
        onStep(-1);
      } else if (e.key === "Escape" && zoomed) {
        e.preventDefault();
        setZoomed(false);
      } else if (e.key === "i") setShowInfo((v) => !v);
      else if (e.key === "p") setShutterStyle((s) => (s === "pinhole" ? "iris" : "pinhole"));
      else if (e.key === "f") setZoomed((v) => !v);
      else if (e.key === "s" && next) actions.openAct("slideshow");
    },
    [photo, act, next, prev, onStep, zoomed, actions],
  );

  useEffect(() => {
    if (!photo) return;
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photo, onKey]);

  const album = photo ? albums.find((a) => a.id === photo.albumId) : undefined;
  const contributor = photo ? memberById(photo.contributorId) : undefined;
  const tagged = photo ? photo.taggedIds.map((t) => memberById(t)).filter((m): m is NonNullable<typeof m> => Boolean(m)) : [];
  const focus = photo?.focus ?? { x: 50, y: 50 };
  const controls = [
    { key: "←→", label: "Previous / next" },
    { key: "I", label: "Details" },
    { key: "P", label: "Pinhole" },
    { key: "F", label: "Zoom" },
    { key: "S", label: "Slideshow" },
  ];

  return (
    <Dialog open={Boolean(photo)} onClose={actions.closePhoto} className="relative z-[60]">
      <DialogBackdrop transition className="fixed inset-0 bg-[#071510]/90 backdrop-blur-sm transition duration-300 data-closed:opacity-0" />
      <div className="fixed inset-0">
        <DialogPanel transition className="absolute inset-0 grid transition duration-300 data-closed:scale-[0.98] data-closed:opacity-0 lg:grid-cols-[1fr_22rem]">
          {/* ─── Stage ─── */}
          <div className="relative flex min-h-0 flex-col p-3 sm:p-5">
            <div className="flex items-center justify-between gap-3 pb-3">
              <p className="ny-num truncate font-mono text-xs text-white/60">
                {photo?.id} · {index + 1} / {ordered.length}
              </p>
              <div className="flex items-center gap-1.5">
                {/* Shutter style */}
                <div className="inline-flex rounded-full border border-white/15 bg-white/10 p-1" role="group" aria-label="Shutter style">
                  {(
                    [
                      ["iris", Aperture, "Iris"],
                      ["pinhole", CircleDot, "Pinhole"],
                    ] as Array<[ShutterStyle, typeof Aperture, string]>
                  ).map(([key, Icon, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setShutterStyle(key)}
                      aria-pressed={shutterStyle === key}
                      title={`${label} shutter`}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                        shutterStyle === key ? "bg-brand-accent text-brand-deep" : "text-white/70 hover:text-white",
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setShowInfo((v) => !v)} aria-pressed={showInfo} title="Details (I)" className={cn("ny-btn ny-btn-dark ny-btn-sm size-9 p-0", showInfo && "!bg-white/25")}>
                  <Info className="size-4" aria-hidden />
                </button>
                <button type="button" onClick={() => setZoomed((v) => !v)} aria-pressed={zoomed} title="Zoom (F)" className={cn("ny-btn ny-btn-dark ny-btn-sm size-9 p-0", zoomed && "!bg-white/25")}>
                  {zoomed ? <Minimize2 className="size-4" aria-hidden /> : <Maximize2 className="size-4" aria-hidden />}
                </button>
                <button type="button" onClick={actions.closePhoto} aria-label="Close (Esc)" className="ny-btn ny-btn-dark ny-btn-sm size-9 p-0">
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            </div>

            {/* Shutter stage */}
            <div className="relative min-h-0 flex-1">
              {photo ? (
                <>
                  <ShutterFrame
                    frameKey={photo.id}
                    focus={focus}
                    shutterStyle={shutterStyle}
                    calm={calm}
                    onBusyChange={setBusy}
                    className="absolute inset-0 ny-lightbox-stage rounded-[24px] lg:rounded-r-none"
                    renderFrame={(shownKey) => {
                      /* Render whichever frame is on screen, so the swap is hidden by the blades. */
                      const shown = shownKey === photo.id ? photo : (ordered.find((p) => p.id === shownKey) ?? photo);
                      return <Frame photo={shown} zoomed={zoomed} />;
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setZoomed((v) => !v)}
                    aria-label={zoomed ? "Zoom out" : "Zoom in"}
                    className="absolute inset-0 z-[5] cursor-inherit focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-accent"
                    tabIndex={-1}
                  />

                  {/* Caption over the stage; hidden while the shutter moves so nothing sits on closed blades. */}
                  <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 z-[6] bg-gradient-to-t from-black/80 via-black/35 to-transparent p-4 pt-16 transition-opacity duration-300 sm:p-6", busy ? "opacity-0" : "opacity-100")}>
                    <p className="ny-title text-lg !text-white sm:text-2xl">{photo.caption}</p>
                    <p className="mt-1 text-xs text-white/75">
                      {albumName(photo.albumId)} · {photoDate(photo.takenOn)}
                    </p>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 grid place-items-center text-white/60">No photo selected</div>
              )}

              {/* Prev / next */}
              {prev && (
                <button
                  type="button"
                  onClick={() => onStep(-1)}
                  disabled={busy}
                  aria-label={`Previous: ${prev.caption}`}
                  className="ny-lb-arrow absolute left-3 top-1/2 z-[7] grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65 disabled:opacity-40"
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
              )}
              {next && (
                <button
                  type="button"
                  onClick={() => onStep(1)}
                  disabled={busy}
                  aria-label={`Next: ${next.caption}`}
                  className="ny-lb-arrow absolute right-3 top-1/2 z-[7] grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-md transition hover:bg-black/65 disabled:opacity-40"
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              )}
            </div>

            {/* Filmstrip */}
            <div className="ny-scroll mt-3 flex gap-2 overflow-x-auto pb-1.5" role="listbox" aria-label="Photographs">
              {ordered.slice(Math.max(0, index - 6), index + 7).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="option"
                  aria-selected={p.id === photo?.id}
                  onClick={() => actions.showPhoto(p.id)}
                  className={cn(
                    "relative size-14 shrink-0 overflow-hidden rounded-xl border-2 transition",
                    p.id === photo?.id ? "border-brand-accent shadow-gold" : "border-transparent opacity-60 hover:opacity-100",
                  )}
                >
                  <img src={photoSrc(p)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ─── Details panel ─── */}
          <aside
            className={cn(
              "ny-scroll overflow-y-auto border-t border-white/10 bg-[#0c2119] p-5 text-white transition-all duration-300 lg:border-l lg:border-t-0",
              showInfo ? "block" : "hidden",
            )}
            aria-label="Photo details"
          >
            {photo && (
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-accent">Caption</p>
                  <h2 id="lightbox-caption" className="ny-title mt-1 text-xl leading-snug">
                    {photo.caption}
                  </h2>
                </div>

                <dl className="space-y-3.5">
                  <Meta icon={<MapPin className="size-4" aria-hidden />} label="Album">
                    {album?.name ?? "Unsorted"} · {album?.year}
                    {album && <span className="mt-1.5 block"><BranchChip branchId={album.branchId} className="!border-white/20 !bg-white/10 !text-white/85" /></span>}
                  </Meta>
                  <Meta icon={<ImagePlus className="size-4" aria-hidden />} label="Taken">
                    {photoDate(photo.takenOn)}
                    <span className="block text-xs text-white/55">
                      {photo.w} × {photo.h} · {bytesLabel(photo.bytes / 1024)}
                    </span>
                  </Meta>
                  <Meta icon={<Aperture className="size-4" aria-hidden />} label="Added by">
                    {contributor ? (
                      <span className="flex items-center gap-2">
                        <Avatar member={contributor} size={28} className="!rounded-full" />
                        {contributor.preferredName} {contributor.lastName}
                      </span>
                    ) : (
                      "Unknown"
                    )}
                  </Meta>
                  {photo.eventId && (
                    <Meta icon={<Link2 className="size-4" aria-hidden />} label="From a gathering">
                      {eventTitle(photo.eventId)}
                    </Meta>
                  )}
                  <Meta icon={<Heart className="size-4" aria-hidden />} label="Favourites">
                    {photo.favourites} relative{photo.favourites === 1 ? "" : "s"}
                  </Meta>
                </dl>

                {/* Tagged relatives */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">People in this photo</p>
                    <button type="button" onClick={() => actions.openAct("tag")} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-accent hover:underline">
                      <Tag className="size-3.5" aria-hidden /> Edit
                    </button>
                  </div>
                  {tagged.length === 0 ? (
                    <p className="mt-2 text-sm text-white/60">No one tagged yet.</p>
                  ) : (
                    <ul className="mt-2.5 space-y-1.5">
                      {tagged.map((m) => (
                        <li key={m.id} className="flex items-center gap-2.5 rounded-xl bg-white/5 px-2.5 py-2">
                          <Avatar member={m} size={30} className="!rounded-full" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{m.preferredName} {m.lastName}</span>
                            <span className="block truncate text-[11px] text-white/50">{m.role} · {m.homeTown}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
                  <button type="button" onClick={() => actions.openAct("edit-photo")} className="ny-btn ny-btn-dark ny-btn-sm">Edit caption</button>
                  <button type="button" onClick={() => actions.openAct("move-photo")} className="ny-btn ny-btn-dark ny-btn-sm">Add to album</button>
                  <button type="button" onClick={() => actions.openAct("rotate")} className="ny-btn ny-btn-dark ny-btn-sm">Rotate &amp; crop</button>
                  <button type="button" onClick={() => actions.openAct("event-link")} className="ny-btn ny-btn-dark ny-btn-sm">Link event</button>
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}/dashboard/gallery?img=${photo.id}`;
                      if (navigator.clipboard) void navigator.clipboard.writeText(url);
                      actions.notify({ title: "Link copied", body: "Opens straight onto this photo.", tone: "success" });
                    }}
                    className="ny-btn ny-btn-gold ny-btn-sm col-span-2"
                  >
                    <Link2 className="size-4" aria-hidden /> Copy link to this photo
                  </button>
                  <button type="button" onClick={() => actions.openAct("delete-photo")} className="ny-btn ny-btn-dark ny-btn-sm col-span-2 !text-[#ff8f8a]">
                    <Trash className="size-4" aria-hidden /> Move to trash
                  </button>
                </div>

                <p className="text-[11px] leading-relaxed text-white/40">
                  Added {ago(38)} · Deleted photos stay recoverable in the trash for 30 days. <SimulatedBadge label="Drive originals" className="mt-2" />
                </p>
              </div>
            )}

            <div className="mt-6 space-y-1 border-t border-white/10 pt-4">
              {controls.map((c) => (
                <p key={c.key} className="flex items-center justify-between text-[11px] text-white/50">
                  <span>{c.label}</span>
                  <kbd className="rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/80">{c.key}</kbd>
                </p>
              ))}
            </div>
          </aside>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
