/* Gallery service — frontend-only mock with the exact signatures the REST API will expose.
   Every call resolves after realistic latency and returns the next immutable snapshot, so
   swapping in fetch() later changes this file only. Nothing here reaches Google Drive or a network. */

import {
  ALBUMS,
  AUDIT_SEED,
  PHOTOS_SEED,
  SOURCES,
  TRASH_SEED,
  UPLOAD_POOL,
  photoUrl,
  type AlbumVisibility,
  type AuditAction,
  type GalleryAlbum,
  type GalleryAudit,
  type GalleryPhoto,
  type PhotoSource,
  type TrashEntry,
} from "@/data/dashboard/gallery";

export interface GalleryState {
  photos: GalleryPhoto[];
  albums: GalleryAlbum[];
  sources: PhotoSource[];
  trash: Array<{ photo: GalleryPhoto; entry: TrashEntry }>;
  audit: GalleryAudit[];
}

export type GalleryList = GalleryState[keyof GalleryState];

function clone(state: GalleryState): GalleryState {
  return {
    photos: state.photos.map((p) => ({ ...p, taggedIds: [...p.taggedIds] })),
    albums: state.albums.map((a) => ({ ...a })),
    sources: state.sources.map((s) => ({ ...s })),
    trash: state.trash.map((t) => ({ photo: { ...t.photo, taggedIds: [...t.photo.taggedIds] }, entry: { ...t.entry } })),
    audit: state.audit.map((a) => ({ ...a })),
  };
}

let state: GalleryState = clone({
  photos: PHOTOS_SEED,
  albums: ALBUMS,
  sources: SOURCES,
  trash: TRASH_SEED,
  audit: AUDIT_SEED,
});

let seq = PHOTOS_SEED.length;

const wait = (ms = 420) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Synchronous snapshot used to seed the query cache (identical on server and client). */
export function getGallerySnapshot(): GalleryState {
  return clone(state);
}

export function galleryKeyOf(stateValue: GalleryState): string {
  return `${stateValue.photos.length}:${stateValue.albums.length}:${stateValue.trash.length}:${stateValue.audit[0]?.id ?? ""}:${stateValue.audit.length}`;
}

function eatNow(offsetMin = 0): string {
  const d = new Date(Date.UTC(2026, 4, 6, 6, 52 + offsetMin));
  return `2026-05-06 ${String(d.getUTCHours() + 3).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} EAT`;
}

function log(a: GalleryState, actorId: string, action: AuditAction, subject: string, detail: string): void {
  seq += 1;
  a.audit = [{ id: `NY-GA-2026-${String(413 + (seq % 500)).padStart(4, "0")}`, at: eatNow(seq % 9), actorId, action, subject, detail }, ...a.audit].slice(0, 80);
}

export async function listGallery(): Promise<GalleryState> {
  await wait(360);
  return clone(state);
}

function touchSource(a: GalleryState, sourceId: string, add: number): void {
  a.sources = a.sources.map((s) => (s.id === sourceId ? { ...s, photoCount: s.photoCount + add, lastSyncMinutes: 0 } : s));
}

/* ─── S5 · Upload ────────────────────────────────────────────────────── */

export interface UploadInput {
  names: string[];
  albumId: string;
  caption: string;
  taggedIds: string[];
  eventId: string | null;
  contributorId: string;
}

function stripExt(name: string): string {
  return name.replace(/\.[a-z0-9]+$/i, "");
}

export async function uploadPhotos(input: UploadInput): Promise<{ state: GalleryState; added: GalleryPhoto[] }> {
  await wait(1400);
  const next = clone(state);
  const album = next.albums.find((a) => a.id === input.albumId);
  const added: GalleryPhoto[] = input.names.map((name, i) => {
    seq += 1;
    const file = UPLOAD_POOL[(seq + i) % UPLOAD_POOL.length];
    const shapes = [0.74, 1.5, 1, 0.68, 1.42];
    const landscape = ["r03", "s04"].includes(file);
    return {
      id: `NY-IMG-${String(seq).padStart(5, "0")}`,
      file,
      w: landscape ? 1350 : 900,
      h: landscape ? 900 : 1200,
      ratio: shapes[(seq + i) % shapes.length],
      caption: input.caption.trim() || stripExt(name),
      albumId: input.albumId,
      takenOn: "2026-05-06",
      year: "2026",
      contributorId: input.contributorId,
      eventId: input.eventId,
      taggedIds: [...input.taggedIds],
      sourceId: "SRC-DIRECT",
      seq,
      favourites: 0,
      bytes: (900 + ((seq + i) % 7) * 310) * 1024,
    };
  });
  next.photos = [...next.photos, ...added];
  touchSource(next, "SRC-DIRECT", added.length);
  log(next, input.contributorId, "upload", added.map((p) => p.id).join(", "), `Uploaded ${added.length} photo${added.length === 1 ? "" : "s"} to ${album?.name ?? "an album"}`);
  state = next;
  return { state: clone(state), added };
}

/* ─── S2 · Sources ───────────────────────────────────────────────────── */

export async function connectFolder(url: string, label: string): Promise<GalleryState> {
  await wait(1600);
  const next = clone(state);
  seq += 1;
  next.sources = [
    ...next.sources,
    {
      id: `SRC-DRIVE-${String(seq).padStart(3, "0")}`,
      kind: "google-drive",
      label: `Google Drive · ${label.trim() || "New folder"}`,
      detail: "Folder connected · first sync queued",
      folderUrl: url.trim() || null,
      state: "syncing",
      lastSyncMinutes: 0,
      photoCount: 0,
      owner: "Brian Otieno Nalyanya",
    },
  ];
  log(next, "NY-MBR-00019", "connect", `SRC-DRIVE-${String(seq).padStart(3, "0")}`, `Connected Google Drive folder “${label.trim() || "New folder"}”`);
  state = next;
  return clone(state);
}

export async function syncSource(sourceId: string): Promise<{ state: GalleryState; imported: number }> {
  await wait(1700);
  const next = clone(state);
  const imported = sourceId === "SRC-SCAN" ? 0 : 2 + (seq % 3);
  const source = next.sources.find((s) => s.id === sourceId);
  if (source) {
    const updated: PhotoSource = { ...source, state: "synced", lastSyncMinutes: 0, photoCount: source.photoCount + imported, detail: imported > 0 ? "Sync complete" : "Nothing new in this folder" };
    next.sources = next.sources.map((s) => (s.id === sourceId ? updated : s));
  }
  log(next, "NY-MBR-00019", "sync", sourceId, imported > 0 ? `Drive sync complete · ${imported} new photo${imported === 1 ? "" : "s"}` : "Sync complete · no new photos");
  state = next;
  return { state: clone(state), imported };
}

export async function toggleSource(sourceId: string, paused: boolean): Promise<GalleryState> {
  await wait(380);
  const next = clone(state);
  next.sources = next.sources.map((s) => (s.id === sourceId ? { ...s, state: paused ? "paused" : "synced", detail: paused ? "Paused by the Family Head" : "Syncing on schedule" } : s));
  log(next, "NY-MBR-00019", "sync", sourceId, paused ? "Paused folder sync" : "Resumed folder sync");
  state = next;
  return clone(state);
}

export async function disconnectSource(sourceId: string): Promise<GalleryState> {
  await wait(520);
  const next = clone(state);
  /* Photos already in the gallery are kept; only the link to the source is removed. */
  next.sources = next.sources.filter((s) => s.id !== sourceId);
  next.photos = next.photos.map((p) => (p.sourceId === sourceId ? { ...p, sourceId: "SRC-DIRECT" } : p));
  log(next, "NY-MBR-00019", "sync", sourceId, "Disconnected a source · existing photos kept");
  state = next;
  return clone(state);
}

/* ─── S4 · Lightbox actions ──────────────────────────────────────────── */

export async function updatePhoto(
  photoId: string,
  patch: Partial<Pick<GalleryPhoto, "caption" | "albumId" | "taggedIds" | "eventId" | "takenOn">>,
  actorId: string,
): Promise<GalleryState> {
  await wait(360);
  const next = clone(state);
  const before = next.photos.find((p) => p.id === photoId);
  /* Unknown id: nothing to change, so leave the gallery exactly as it was. */
  if (!before) return clone(state);

  const moved = patch.albumId !== undefined && patch.albumId !== before.albumId;
  const retitled = patch.caption !== undefined && patch.caption !== before.caption;
  const relinked = patch.eventId !== undefined && patch.eventId !== before.eventId;

  /* Face tags are replaced as a whole set; compare old and new to describe what changed. */
  const tagsChanged = patch.taggedIds !== undefined;
  const nextTags = patch.taggedIds ?? before.taggedIds;
  const addedTags = tagsChanged ? nextTags.filter((t) => !before.taggedIds.includes(t)) : [];
  const removedTags = tagsChanged ? before.taggedIds.filter((t) => !nextTags.includes(t)) : [];

  next.photos = next.photos.map((p) => (p.id === photoId ? { ...p, ...patch, taggedIds: [...nextTags] } : p));

  /* Describe the change for the audit trail and pick the action that matches it. */
  const detail: string[] = [];
  if (retitled) detail.push("caption edited");
  if (moved) detail.push(`moved to ${next.albums.find((a) => a.id === patch.albumId)?.name ?? "another album"}`);
  if (addedTags.length > 0) detail.push(`${addedTags.length} face${addedTags.length === 1 ? "" : "s"} tagged`);
  if (removedTags.length > 0) detail.push(`${removedTags.length} face tag${removedTags.length === 1 ? "" : "s"} removed`);
  if (relinked) detail.push(patch.eventId ? "linked to an event" : "unlinked from its event");

  const onlyChange = detail.length === 1 ? detail[0] : "";
  const action: AuditAction =
    onlyChange.startsWith("moved") ? "move" : onlyChange.endsWith("removed") ? "untag" : onlyChange.endsWith("tagged") ? "tag" : retitled ? "rename" : "tag";

  log(next, actorId, action, photoId, detail.join(", ") || "photo updated");
  state = next;
  return clone(state);
}

export async function deletePhoto(photoId: string, actorId: string, reason: string): Promise<GalleryState> {
  await wait(480);
  const next = clone(state);
  const photo = next.photos.find((p) => p.id === photoId);
  if (!photo) return clone(state);
  seq += 1;
  next.photos = next.photos.filter((p) => p.id !== photoId);
  next.trash = [
    { photo: { ...photo, id: `NY-IMG-9${String(seq % 9000 + 1000).padStart(4, "0")}` }, entry: { deletedAt: "2026-05-06", deletedBy: actorId, reason, daysLeft: 30 } },
    ...next.trash,
  ];
  log(next, actorId, "delete", photoId, `Moved to trash · ${reason}`);
  state = next;
  return clone(state);
}

export async function restorePhoto(trashPhotoId: string, actorId: string): Promise<GalleryState> {
  await wait(460);
  const next = clone(state);
  const item = next.trash.find((t) => t.photo.id === trashPhotoId);
  if (!item) return clone(state);
  seq += 1;
  next.trash = next.trash.filter((t) => t.photo.id !== trashPhotoId);
  next.photos = [...next.photos, { ...item.photo, id: `NY-IMG-${String(seq).padStart(5, "0")}` }];
  log(next, actorId, "restore", trashPhotoId, `Restored “${item.photo.caption}” from trash`);
  state = next;
  return clone(state);
}

export async function purgePhoto(trashPhotoId: string, actorId: string): Promise<GalleryState> {
  await wait(520);
  const next = clone(state);
  const item = next.trash.find((t) => t.photo.id === trashPhotoId);
  if (!item) return clone(state);
  next.trash = next.trash.filter((t) => t.photo.id !== trashPhotoId);
  log(next, actorId, "delete", trashPhotoId, "Deleted permanently from trash");
  state = next;
  return clone(state);
}

export async function emptyTrash(actorId: string): Promise<GalleryState> {
  await wait(640);
  const next = clone(state);
  const count = next.trash.length;
  next.trash = [];
  log(next, actorId, "delete", "trash", `Emptied trash · ${count} photo${count === 1 ? "" : "s"} deleted permanently`);
  state = next;
  return clone(state);
}

/* ─── S6 · Albums ────────────────────────────────────────────────────── */

export interface AlbumInput {
  name: string;
  year: string;
  branchId: string;
  visibility: AlbumVisibility;
  description: string;
  eventId: string | null;
}

export async function createAlbum(input: AlbumInput): Promise<{ state: GalleryState; album: GalleryAlbum }> {
  await wait(620);
  const next = clone(state);
  seq += 1;
  const slug = input.name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 18);
  const album: GalleryAlbum = {
    id: `ALB-${slug || "NEW"}-${String(seq).padStart(3, "0")}`,
    name: input.name.trim(),
    year: input.year,
    branchId: input.branchId,
    visibility: input.visibility,
    coverId: "",
    description: input.description.trim(),
    eventId: input.eventId,
    createdAt: "2026-05-06",
  };
  next.albums = [...next.albums, album];
  log(next, "NY-MBR-00019", "rename", album.id, `Created album “${album.name}”`);
  state = next;
  return { state: clone(state), album };
}

export async function updateAlbum(albumId: string, patch: Partial<Pick<GalleryAlbum, "name" | "year" | "branchId" | "visibility" | "description" | "coverId" | "eventId">>): Promise<GalleryState> {
  await wait(420);
  const next = clone(state);
  const before = next.albums.find((a) => a.id === albumId);
  if (!before) return clone(state);
  next.albums = next.albums.map((a) => (a.id === albumId ? { ...a, ...patch } : a));
  const changes: string[] = [];
  if (patch.name && patch.name !== before.name) changes.push(`renamed to “${patch.name}”`);
  if (patch.coverId && patch.coverId !== before.coverId) changes.push("cover changed");
  if (patch.visibility && patch.visibility !== before.visibility) changes.push(`visibility set to ${patch.visibility}`);
  log(next, "NY-MBR-00019", patch.coverId && changes.length === 1 ? "cover" : patch.name ? "rename" : "rename", albumId, changes.join(", ") || "album updated");
  state = next;
  return clone(state);
}

export async function deleteAlbum(albumId: string, actorId: string, mode: "move" | "delete"): Promise<GalleryState> {
  await wait(760);
  const next = clone(state);
  const album = next.albums.find((a) => a.id === albumId);
  if (!album) return clone(state);
  const affected = next.photos.filter((p) => p.albumId === albumId);
  if (mode === "move") {
    next.photos = next.photos.map((p) => (p.albumId === albumId ? { ...p, albumId: "ALB-REUNION", year: "2025" } : p));
  } else {
    for (const p of affected) {
      next.trash = [{ photo: { ...p, id: `NY-IMG-9${String(2000 + (p.seq % 7000)).padStart(4, "0")}` }, entry: { deletedAt: "2026-05-06", deletedBy: actorId, reason: `Album “${album.name}” deleted`, daysLeft: 30 } }, ...next.trash];
    }
    next.photos = next.photos.filter((p) => p.albumId !== albumId);
  }
  next.albums = next.albums.filter((a) => a.id !== albumId);
  log(next, actorId, "delete", albumId, mode === "move" ? `Deleted album · ${affected.length} photos kept and moved to Reunions` : `Deleted album · ${affected.length} photos moved to trash`);
  state = next;
  return clone(state);
}

export function photoSrc(photo: GalleryPhoto): string {
  return photoUrl(photo.file);
}
