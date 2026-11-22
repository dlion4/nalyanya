"use client";

import { Link2, Share2, Trash } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { SimulatedBadge } from "@/components/ui/Primitives";
import { eventTitle, type AlbumVisibility, type GalleryAlbum, type GalleryPhoto } from "@/data/dashboard/gallery";
import { BRANCHES } from "@/data/family/branches";
import { EVENTS_SEED } from "@/data/dashboard/events";
import { cn, groupDigits } from "@/lib/format";
import { createAlbum, deleteAlbum, updateAlbum } from "@/services/galleryService";
import { photoSrc } from "@/services/galleryService";
import { VisibilityChip } from "@/views/dashboard/gallery/galleryUi";
import type { GalleryActions } from "@/views/dashboard/gallery/types";

const ACTOR = "NY-MBR-00019";
const YEARS = ["2026", "2025", "2024", "2023", "1978"];
const VISIBILITIES: Array<{ id: AlbumVisibility; label: string; hint: string }> = [
  { id: "all-family", label: "Whole family", hint: "Every signed-in relative can view this album." },
  { id: "branch", label: "One branch only", hint: "Only members of the album's branch can view it." },
  { id: "admins-only", label: "Admins only", hint: "Hidden until the Family Head opens it. Useful while faces are confirmed." },
];

function pickField(error: string | null, id: string): { "aria-invalid": boolean; "aria-describedby"?: string } {
  return error ? { "aria-invalid": true, "aria-describedby": id } : { "aria-invalid": false };
}

/* ─── 1. Create or edit an album (md) ────────────────────────────────── */

export function AlbumEditModal({ open, album, photos, actions }: { open: boolean; album: GalleryAlbum | null; photos: GalleryPhoto[]; actions: GalleryActions }) {
  const isNew = album === null;
  const [name, setName] = useState(album?.name ?? "");
  const [year, setYear] = useState(album?.year ?? "2026");
  const [branchId, setBranchId] = useState(album?.branchId ?? "nalyanya-main");
  const [visibility, setVisibility] = useState<AlbumVisibility>(album?.visibility ?? "all-family");
  const [description, setDescription] = useState(album?.description ?? "");
  const [eventId, setEventId] = useState(album?.eventId ?? "");
  const [coverId, setCoverId] = useState(album?.coverId ?? "");
  const [error, setError] = useState<string | null>(null);

  /* Re-seed every field when a different album opens. */
  useEffect(() => {
    setName(album?.name ?? "");
    setYear(album?.year ?? "2026");
    setBranchId(album?.branchId ?? "nalyanya-main");
    setVisibility(album?.visibility ?? "all-family");
    setDescription(album?.description ?? "");
    setEventId(album?.eventId ?? "");
    setCoverId(album?.coverId ?? "");
    setError(null);
  }, [album?.id, open]);

  const inAlbum = useMemo(() => photos.filter((p) => p.albumId === album?.id).slice(0, 8), [photos, album?.id]);
  const events = EVENTS_SEED.filter((e) => e.status !== "cancelled");
  const dirty =
    Boolean(album) &&
    (name.trim() !== album?.name || year !== album?.year || branchId !== album?.branchId || visibility !== album?.visibility || description.trim() !== album?.description || (eventId || null) !== album?.eventId || coverId !== album?.coverId);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 3) return setError("Give the album a name of at least three letters.");
    if (/[A-Z]{3,}/.test(trimmed) && trimmed === trimmed.toUpperCase()) return setError("Write the name in normal sentence case, e.g. “Kitchen & recipes”.");
    if (description.trim().length < 12) return setError("Add a sentence so relatives know what the album holds.");
    setError(null);

    if (isNew) {
      actions.run(
        async () => (await createAlbum({ name: trimmed, year, branchId, visibility, description: description.trim(), eventId: eventId || null })).state,
        { title: "Album created", body: `“${trimmed}” is ready for photos.`, tone: "success" },
        () => actions.closeAct(),
      );
    } else if (album) {
      actions.run(
        () => updateAlbum(album.id, { name: trimmed, year, branchId, visibility, description: description.trim(), eventId: eventId || null, coverId: coverId || album.coverId }),
        { title: "Album saved", body: `“${trimmed}” updated.`, tone: "success" },
        () => actions.closeAct(),
      );
    }
  };

  return (
    <ModalDialog
      open={open}
      onClose={actions.closeAct}
      size="md"
      title={isNew ? "New album" : `Edit “${album?.name}”`}
      description={isNew ? "Group photos by a gathering, a season, or a branch of the family." : "Changes apply at once and are written to the audit trail."}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SimulatedBadge label={isNew ? "Saved locally · SIMULATED" : "Audited locally"} />
          <div className="flex gap-2">
            <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Cancel</button>
            <button type="submit" form="album-form" disabled={actions.pending || (!isNew && !dirty)} className="ny-btn ny-btn-primary ny-btn-sm">
              {isNew ? "Create album" : "Save changes"}
            </button>
          </div>
        </div>
      }
    >
      <form id="album-form" onSubmit={submit} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="rounded-xl bg-[#fbe5e5] p-3 text-sm text-danger">{error}</p>
        )}

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Album name</span>
          <input value={name} onChange={(e) => { setName(e.target.value); setError(null); }} placeholder="e.g. Reunion 2026" className="ny-input" {...pickField(error, "album-error")} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Year</span>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="ny-input">
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Branch</span>
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)} className="ny-input">
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Description</span>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will relatives find here?" className="ny-input" />
        </label>

        {/* Who can see it */}
        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-sm font-semibold">Who can see this album</legend>
          {VISIBILITIES.map((v) => (
            <label key={v.id} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition", visibility === v.id ? "border-brand-primary bg-brand-primary/[0.06]" : "border-hairline")}>
              <input type="radio" name="album-visibility" checked={visibility === v.id} onChange={() => setVisibility(v.id)} className="mt-1 size-4 accent-brand-primary" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-text-primary">{v.label}</span>
                <span className="block text-xs leading-relaxed text-text-secondary">{v.hint}</span>
              </span>
            </label>
          ))}
        </fieldset>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Tied to a gathering <span className="font-normal text-text-tertiary">(optional)</span></span>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="ny-input">
            <option value="">No gathering</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{eventTitle(e.id) ?? e.title}</option>
            ))}
          </select>
        </label>

        {/* Cover picker — only meaningful once the album has photos */}
        {!isNew && inAlbum.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-semibold">Cover photo</p>
            <div className="flex flex-wrap gap-2">
              {inAlbum.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCoverId(p.id)}
                  aria-pressed={coverId === p.id}
                  aria-label={`Use “${p.caption}” as the cover`}
                  className={cn("size-16 overflow-hidden rounded-xl border-2 transition", coverId === p.id ? "border-brand-accent shadow-gold" : "border-transparent opacity-75 hover:opacity-100")}
                >
                  <img src={photoSrc(p)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </ModalDialog>
  );
}

/* ─── 2. Delete an album (sm) — photos are never silently destroyed ──── */

export function AlbumDeleteModal({ open, album, photos, actions }: { open: boolean; album: GalleryAlbum | null; photos: GalleryPhoto[]; actions: GalleryActions }) {
  const [mode, setMode] = useState<"move" | "delete">("move");
  const [typed, setTyped] = useState("");
  const count = photos.filter((p) => p.albumId === album?.id).length;

  useEffect(() => {
    setMode("move");
    setTyped("");
  }, [album?.id, open]);

  const matches = Boolean(album) && typed.trim().toLowerCase() === (album?.name ?? "").trim().toLowerCase();

  return (
    <ModalDialog
      open={open && Boolean(album)}
      onClose={actions.closeAct}
      size="sm"
      title="Delete this album?"
      description="The album is removed. You decide what happens to its photographs."
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Keep album</button>
          <button
            type="button"
            disabled={!album || !matches || actions.pending}
            onClick={() => {
              if (!album) return;
              actions.run(
                () => deleteAlbum(album.id, ACTOR, mode),
                mode === "move"
                  ? { title: "Album deleted", body: `${count} photos were kept and moved to Reunions & gatherings.`, tone: "success" }
                  : { title: "Album deleted", body: `${count} photos are in the trash and recoverable for 30 days.`, tone: "warning" },
              );
              actions.closeAct();
            }}
            className="ny-btn ny-btn-sm bg-danger text-white"
          >
            <Trash className="size-4" aria-hidden /> Delete album
          </button>
        </div>
      }
    >
      {album && (
        <div className="space-y-4">
          <p className="rounded-2xl bg-surface-0/80 p-3.5 text-sm text-text-secondary">
            <strong className="text-text-primary">{album.name}</strong> holds {count} photo{count === 1 ? "" : "s"}.
          </p>

          <div className="space-y-2" role="radiogroup" aria-label="What happens to the photos">
            {(
              [
                ["move", "Keep the photos", "Move them to “Reunions & gatherings”. Nothing is lost."],
                ["delete", "Move them to the trash", "They leave the gallery but stay recoverable for 30 days."],
              ] as const
            ).map(([id, label, hint]) => (
              <label key={id} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition", mode === id ? "border-brand-primary bg-brand-primary/[0.06]" : "border-hairline")}>
                <input type="radio" name="delete-mode" checked={mode === id} onChange={() => setMode(id)} className="mt-1 size-4 accent-brand-primary" />
                <span className="text-sm">
                  <strong className="block text-text-primary">{label}</strong>
                  <span className="text-xs leading-relaxed text-text-secondary">{hint}</span>
                </span>
              </label>
            ))}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Type the album name to confirm</span>
            <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={album.name} className="ny-input" autoComplete="off" />
          </label>
        </div>
      )}
    </ModalDialog>
  );
}

/* ─── 3. Share an album (sm) ─────────────────────────────────────────── */

export function AlbumShareModal({ open, album, photos, actions }: { open: boolean; album: GalleryAlbum | null; photos: GalleryPhoto[]; actions: GalleryActions }) {
  const count = photos.filter((p) => p.albumId === album?.id).length;
  const link = album ? `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/gallery?album=${album.id}` : "";
  const text = album ? `${album.name}: ${count} photo${count === 1 ? "" : "s"} from the Nalyanya family gallery.` : "";
  const restricted = album?.visibility === "admins-only" || album?.visibility === "branch";

  return (
    <ModalDialog
      open={open && Boolean(album)}
      onClose={actions.closeAct}
      size="sm"
      title={album ? `Share “${album.name}”` : "Share album"}
      description="Relatives must sign in to view. The album's visibility setting still applies."
      footer={<div className="flex justify-end"><button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Done</button></div>}
    >
      {album && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <VisibilityChip visibility={album.visibility} />
            <span className="ny-chip">{groupDigits(count)} photos</span>
          </div>

          {restricted && (
            <p className="rounded-2xl border border-brand-accent/50 bg-brand-accent-soft/40 p-3.5 text-xs leading-relaxed text-text-secondary">
              This album is {album.visibility === "admins-only" ? "for admins only" : "limited to one branch"}. Anyone else who opens the link will be told they cannot view it.
            </p>
          )}

          <div className="rounded-2xl border border-hairline bg-surface-0/70 p-3.5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Link</p>
            <code className="mt-1.5 block break-all font-mono text-xs text-brand-primary">{link}</code>
          </div>

          <button
            type="button"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) void navigator.clipboard.writeText(link);
              actions.notify({ title: "Album link copied", body: album.visibility === "all-family" ? "Any signed-in relative can open it." : "Only relatives allowed by the album's setting can open it.", tone: "success" });
            }}
            className="ny-btn ny-btn-primary w-full"
          >
            <Link2 className="size-4" aria-hidden /> Copy link
          </button>

          <button
            type="button"
            onClick={() => {
              /* Only opens the share sheet with the text prepared; nothing is sent. */
              window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`, "_blank", "noopener,noreferrer");
              actions.notify({ title: "WhatsApp opened", body: "Choose a chat and send it yourself. Nothing was sent.", tone: "info" });
            }}
            className="ny-btn ny-btn-gold w-full"
          >
            <Share2 className="size-4" aria-hidden /> Share on WhatsApp
          </button>

          <p className="text-xs leading-relaxed text-text-tertiary">Photos stay inside the family gallery. This shares a link, never the image files.</p>
        </div>
      )}
    </ModalDialog>
  );
}
