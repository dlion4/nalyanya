"use client";

import { CircleCheck, RotateCw, Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { Avatar, SimulatedBadge } from "@/components/ui/Primitives";
import { eventTitle, type GalleryPhoto } from "@/data/dashboard/gallery";
import { EVENTS_SEED } from "@/data/dashboard/events";
import { MEMBERS } from "@/data/family/people";
import { cn } from "@/lib/format";
import { deletePhoto, updatePhoto } from "@/services/galleryService";
import { photoSrc } from "@/services/galleryService";
import { ShutterFrame } from "@/views/dashboard/gallery/ShutterFrame";
import type { GalleryActions } from "@/views/dashboard/gallery/types";

const ACTOR = "NY-MBR-00019";

/* ─── 1. Edit caption & date (sm) ────────────────────────────────────── */

export function PhotoEditModal({ open, photo, actions }: { open: boolean; photo: GalleryPhoto | null; actions: GalleryActions }) {
  const [caption, setCaption] = useState(photo?.caption ?? "");
  const [takenOn, setTakenOn] = useState(photo?.takenOn ?? "2026-01-01");

  useEffect(() => {
    setCaption(photo?.caption ?? "");
    setTakenOn(photo?.takenOn ?? "2026-01-01");
  }, [photo?.id]); // re-seed when the photo changes

  const dirty = Boolean(photo) && (caption.trim() !== photo?.caption || takenOn !== photo?.takenOn);

  return (
    <ModalDialog
      open={open && Boolean(photo)}
      onClose={actions.closeAct}
      size="sm"
      title="Edit photo details"
      description="The caption is what relatives read under the photo and in searches."
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Cancel</button>
          <button
            type="button"
            disabled={!dirty || caption.trim().length < 2 || actions.pending}
            onClick={() => {
              if (!photo) return;
              actions.run(() => updatePhoto(photo.id, { caption: caption.trim(), takenOn }, ACTOR), { title: "Caption saved", tone: "success" });
              actions.closeAct();
            }}
            className="ny-btn ny-btn-primary ny-btn-sm"
          >
            Save
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {photo && (
          <img src={photoSrc(photo)} alt="" className="aspect-[16/10] w-full rounded-2xl object-cover" decoding="async" />
        )}
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Caption</span>
          <textarea rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} className="ny-input" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Date taken</span>
          <input type="date" value={takenOn} min="1960-01-01" max="2026-12-31" onChange={(e) => setTakenOn(e.target.value)} className="ny-input" />
        </label>
      </div>
    </ModalDialog>
  );
}

/* ─── 2. Add to / move to an album (sm) ──────────────────────────────── */

export function MovePhotoModal({ open, photo, albums, actions }: { open: boolean; photo: GalleryPhoto | null; albums: Array<{ id: string; name: string; visibility: string }>; actions: GalleryActions }) {
  const [target, setTarget] = useState(photo?.albumId ?? "");
  useEffect(() => setTarget(photo?.albumId ?? ""), [photo?.id]);

  return (
    <ModalDialog
      open={open && Boolean(photo)}
      onClose={actions.closeAct}
      size="sm"
      title="Add this photo to an album"
      description="A photo lives in one album. Moving it here takes it out of the previous one."
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Cancel</button>
          <button
            type="button"
            disabled={!photo || target === photo.albumId || actions.pending}
            onClick={() => {
              if (!photo) return;
              const name = albums.find((a) => a.id === target)?.name;
              actions.run(() => updatePhoto(photo.id, { albumId: target }, ACTOR), { title: "Photo moved", body: `Now in ${name}.`, tone: "success" });
              actions.closeAct();
            }}
            className="ny-btn ny-btn-primary ny-btn-sm"
          >
            Move photo
          </button>
        </div>
      }
    >
      <ul className="space-y-2">
        {albums.map((a) => (
          <li key={a.id}>
            <label className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition", target === a.id ? "border-brand-primary bg-brand-primary/[0.06]" : "border-hairline")}>
              <input type="radio" name="move-album" checked={target === a.id} onChange={() => setTarget(a.id)} className="size-4 accent-brand-primary" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-text-primary">{a.name}</span>
                <span className="block text-xs capitalize text-text-tertiary">{a.visibility.replace("-", " ")}</span>
              </span>
              {a.id === photo?.albumId && <span className="ny-chip">Current</span>}
            </label>
          </li>
        ))}
      </ul>
    </ModalDialog>
  );
}

/* ─── 3. Tag people (md) ─────────────────────────────────────────────── */

export function TagModal({ open, photo, actions }: { open: boolean; photo: GalleryPhoto | null; actions: GalleryActions }) {
  const [picked, setPicked] = useState<string[]>(photo?.taggedIds ?? []);
  const [query, setQuery] = useState("");
  useEffect(() => {
    setPicked(photo?.taggedIds ?? []);
    setQuery("");
  }, [photo?.id]);

  const people = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MEMBERS.filter((m) => m.deathYear === undefined)
      .filter((m) => (q ? `${m.preferredName} ${m.lastName} ${m.homeTown}`.toLowerCase().includes(q) : true))
      .slice(0, 24);
  }, [query]);

  const toggle = (id: string) => setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <ModalDialog
      open={open && Boolean(photo)}
      onClose={actions.closeAct}
      size="md"
      title="Tag people in this photo"
      description="Tagged relatives can find this photo from their own profile."
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="ny-num text-xs text-text-tertiary">{picked.length} tagged</span>
          <div className="flex gap-2">
            <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Cancel</button>
            <button
              type="button"
              disabled={!photo || actions.pending}
              onClick={() => {
                if (!photo) return;
                actions.run(() => updatePhoto(photo.id, { taggedIds: picked }, ACTOR), { title: "Tags saved", body: `${picked.length} relative${picked.length === 1 ? "" : "s"} tagged.`, tone: "success" });
                actions.closeAct();
              }}
              className="ny-btn ny-btn-primary ny-btn-sm"
            >
              <CircleCheck className="size-4" aria-hidden /> Save tags
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {picked.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {picked.map((id) => {
              const m = MEMBERS.find((x) => x.id === id);
              return m ? (
                <button key={id} type="button" onClick={() => toggle(id)} className="ny-chip ny-chip-solid cursor-pointer" aria-label={`Remove tag ${m.preferredName}`}>
                  {m.preferredName} <span aria-hidden>×</span>
                </button>
              ) : null;
            })}
          </div>
        )}
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a relative by name or town" className="ny-input" aria-label="Find a relative" />
        <ul className="ny-scroll max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {people.map((m) => {
            const on = picked.includes(m.id);
            return (
              <li key={m.id}>
                <button type="button" onClick={() => toggle(m.id)} aria-pressed={on} className={cn("flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition", on ? "border-brand-primary bg-brand-primary/[0.06]" : "border-hairline hover:border-brand-primary/40")}>
                  <Avatar member={m} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-text-primary">{m.preferredName} {m.lastName}</span>
                    <span className="block truncate text-xs text-text-tertiary">{m.role} · {m.homeTown}</span>
                  </span>
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border", on ? "border-brand-primary bg-brand-primary text-white" : "border-hairline")} aria-hidden>
                    {on && <CircleCheck className="size-3.5" />}
                  </span>
                </button>
              </li>
            );
          })}
          {people.length === 0 && <li className="p-4 text-sm text-text-secondary">No relative matches that search.</li>}
        </ul>
      </div>
    </ModalDialog>
  );
}

/* ─── 4. Link to a gathering (sm) ────────────────────────────────────── */

export function EventLinkModal({ open, photo, actions }: { open: boolean; photo: GalleryPhoto | null; actions: GalleryActions }) {
  const [eventId, setEventId] = useState(photo?.eventId ?? "");
  useEffect(() => setEventId(photo?.eventId ?? ""), [photo?.id]);
  const events = EVENTS_SEED.filter((e) => e.status !== "cancelled");

  return (
    <ModalDialog
      open={open && Boolean(photo)}
      onClose={actions.closeAct}
      size="sm"
      title="Link to a gathering"
      description="Linked photos appear on the gathering's page and in its album."
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Cancel</button>
          <button
            type="button"
            disabled={!photo || eventId === (photo?.eventId ?? "") || actions.pending}
            onClick={() => {
              if (!photo) return;
              actions.run(() => updatePhoto(photo.id, { eventId: eventId || null }, ACTOR), { title: eventId ? "Linked to gathering" : "Link removed", body: eventId ? eventTitle(eventId) ?? undefined : undefined, tone: "success" });
              actions.closeAct();
            }}
            className="ny-btn ny-btn-primary ny-btn-sm"
          >
            Save link
          </button>
        </div>
      }
    >
      <ul className="space-y-2">
        <li>
          <label className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5", eventId === "" ? "border-brand-primary bg-brand-primary/[0.06]" : "border-hairline")}>
            <input type="radio" name="event-link" checked={eventId === ""} onChange={() => setEventId("")} className="size-4 accent-brand-primary" />
            <span className="text-sm font-semibold text-text-primary">Not from a gathering</span>
          </label>
        </li>
        {events.map((e) => (
          <li key={e.id}>
            <label className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5", eventId === e.id ? "border-brand-primary bg-brand-primary/[0.06]" : "border-hairline")}>
              <input type="radio" name="event-link" checked={eventId === e.id} onChange={() => setEventId(e.id)} className="size-4 accent-brand-primary" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-text-primary">{e.title}</span>
                <span className="block text-xs text-text-tertiary">{e.date} · {e.kind}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </ModalDialog>
  );
}

/* ─── 5. Rotate & crop (md) ──────────────────────────────────────────── */

const ORIENTATIONS = [
  { id: "auto", label: "As shot", degrees: 0, ratio: null as number | null },
  { id: "landscape", label: "Landscape 3:2", degrees: 0, ratio: 1.5 },
  { id: "square", label: "Square", degrees: 0, ratio: 1 },
  { id: "portrait", label: "Portrait 3:4", degrees: 0, ratio: 0.75 },
] as const;

export function RotateModal({ open, photo, actions }: { open: boolean; photo: GalleryPhoto | null; actions: GalleryActions }) {
  const [turns, setTurns] = useState(0);
  const [crop, setCrop] = useState<string>("auto");
  useEffect(() => {
    setTurns(0);
    setCrop("auto");
  }, [photo?.id]);

  const ratio = ORIENTATIONS.find((o) => o.id === crop)?.ratio;

  return (
    <ModalDialog
      open={open && Boolean(photo)}
      onClose={actions.closeAct}
      size="md"
      title="Rotate & choose a crop"
      description="This changes how the photo is shown in the gallery. The original is never altered."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SimulatedBadge label="Original kept · edit is display-only" />
          <div className="flex gap-2">
            <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Cancel</button>
            <button
              type="button"
              disabled={!photo || turns === 0 || actions.pending}
              onClick={() => {
                if (!photo) return;
                /* Rotation isn't part of the photo record yet, so say so rather than pretend it saved. */
                actions.notify({ title: turns % 360 === 0 ? "Back to the original rotation" : "Rotation previewed", body: "Saving rotation to the photo record arrives with the storage backend.", tone: "info" });
                actions.closeAct();
              }}
              className="ny-btn ny-btn-primary ny-btn-sm"
            >
              Apply
            </button>
          </div>
        </div>
      }
    >
      {photo && (
        <div className="space-y-4">
          <div className="grid place-items-center overflow-hidden rounded-2xl bg-surface-2" style={ratio ? { aspectRatio: String(ratio) } : { aspectRatio: `${photo.w} / ${photo.h}` }}>
            <img
              src={photoSrc(photo)}
              alt={photo.caption}
              className="h-full w-full object-cover transition-transform duration-500 ease-out"
              style={{ transform: `rotate(${turns}deg)` }}
              decoding="async"
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => setTurns((t) => (t + 90) % 360)} className="ny-btn ny-btn-ghost ny-btn-sm">
              <RotateCw className="size-4" aria-hidden /> Rotate 90°
            </button>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Crop shape">
              {ORIENTATIONS.map((o) => (
                <button key={o.id} type="button" onClick={() => setCrop(o.id)} aria-pressed={crop === o.id} className={cn("ny-chip cursor-pointer", crop === o.id && "ny-chip-solid")}>
                  {o.id === "square" ? <Square className="size-3" aria-hidden /> : null}
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-text-tertiary">
            Source: {photo.w} × {photo.h}{turns ? ` · preview rotated ${turns}°` : ""}
          </p>
        </div>
      )}
    </ModalDialog>
  );
}

/* ─── 6. Delete with confirm (sm) ────────────────────────────────────── */

export function DeletePhotoModal({ open, photo, actions }: { open: boolean; photo: GalleryPhoto | null; actions: GalleryActions }) {
  const [reason, setReason] = useState("");
  useEffect(() => setReason(""), [photo?.id]);

  return (
    <ModalDialog
      open={open && Boolean(photo)}
      onClose={actions.closeAct}
      size="sm"
      title="Move this photo to the trash?"
      description="It leaves the gallery now and stays recoverable for 30 days."
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Keep photo</button>
          <button
            type="button"
            disabled={!photo || actions.pending}
            onClick={() => {
              if (!photo) return;
              actions.run(() => deletePhoto(photo.id, ACTOR, reason.trim() || "No reason given"), { title: "Moved to trash", body: "You can restore it from the trash for 30 days.", tone: "warning" });
              actions.closePhoto();
            }}
            className="ny-btn ny-btn-sm bg-danger text-white"
          >
            Move to trash
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {photo && <img src={photoSrc(photo)} alt="" className="aspect-[16/9] w-full rounded-2xl object-cover" decoding="async" />}
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Why is it being removed? <span className="font-normal text-text-tertiary">(optional, recorded in the audit)</span></span>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Blurry, duplicate, wrong person" className="ny-input" />
        </label>
        <p className="text-xs text-text-tertiary">The Family Head is told, and the removal appears in the audit trail.</p>
      </div>
    </ModalDialog>
  );
}

/* ─── 7. Slideshow (xl) — auto-advance through the camera shutter ────── */

export function SlideshowModal({ open, photos, actions, calm }: { open: boolean; photos: GalleryPhoto[]; actions: GalleryActions; calm: boolean }) {
  return <SlideshowInner open={open} photos={photos} actions={actions} calm={calm} />;
}

function SlideshowInner({ open, photos, actions, calm }: { open: boolean; photos: GalleryPhoto[]; actions: GalleryActions; calm: boolean }) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setPlaying(true);
  }, [open]);

  /* Auto-advance; waits for each shutter to finish so frames don't stack up. */
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open || !playing || calm || busy) return;
    /* Loop: after the last frame the shutter opens onto the first again. */
    const id = window.setInterval(() => setIndex((i) => (i + 1) % photos.length), 5200);
    return () => window.clearInterval(id);
  }, [open, playing, calm, busy, photos.length]);


  const current = photos[index];

  return (
    <ModalDialog
      open={open && photos.length > 0}
      onClose={() => {
        setPlaying(false);
        actions.closeAct();
      }}
      size="xl"
      title="Slideshow"
      description="Each photograph arrives through the camera shutter."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="ny-num text-xs text-text-tertiary">
            {index + 1} / {photos.length}
            {calm ? " · motion is reduced, so frames change without the shutter" : ""}
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)} className="ny-btn ny-btn-ghost ny-btn-sm">Previous</button>
            <button type="button" onClick={() => setPlaying((p) => !p)} className="ny-btn ny-btn-primary ny-btn-sm">
              {playing ? "Pause" : "Play"}
            </button>
            <button type="button" onClick={() => setIndex((i) => (i + 1) % photos.length)} className="ny-btn ny-btn-ghost ny-btn-sm">Next</button>
            {current && (
              <button
                type="button"
                onClick={() => {
                  setPlaying(false);
                  actions.closeAct();
                  actions.openPhoto(current.id);
                }}
                className="ny-btn ny-btn-gold ny-btn-sm"
              >
                Open in lightbox
              </button>
            )}
          </div>
        </div>
      }
    >
      {current && (
        <div className="space-y-3">
          {/* The shutter closes onto the frame, swaps the exposure, then opens. */}
          <ShutterFrame
            frameKey={current.id}
            focus={current.focus}
            shutterStyle="pinhole"
            calm={calm}
            onBusyChange={setBusy}
            className="aspect-[16/9] w-full rounded-[24px]"
            renderFrame={(shownKey) => {
              /* Render the frame that is on screen, so the swap is hidden by the blades. */
              const shown = photos.find((p) => p.id === shownKey) ?? current;
              return <img src={photoSrc(shown)} alt={shown.caption} className="h-full w-full object-cover" decoding="async" />;
            }}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="ny-title text-lg leading-snug">{current.caption}</p>
            <span className="ny-num shrink-0 text-xs text-text-tertiary">{current.year}</span>
          </div>
          {/* Progress dots */}
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Go to a photograph">
            {photos.slice(0, 30).map((p, i) => (
              <button key={p.id} type="button" onClick={() => setIndex(i)} aria-label={`Go to photo ${i + 1}`} aria-current={i === index} className={cn("h-1.5 rounded-full transition-all", i === index ? "w-6 bg-brand-accent" : "w-1.5 bg-surface-3 hover:bg-text-tertiary")} />
            ))}
          </div>
        </div>
      )}
    </ModalDialog>
  );
}
