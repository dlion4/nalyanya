import type { GalleryState } from "@/services/galleryService";

/** Every overlay is addressed by ?act=… so back closes it and reload restores it. */
/** Every value here must be rendered by GalleryPage — an unrendered kind would be a silent no-op. */
export type ActKind =
  | "upload"
  | "connect"
  | "album-edit"
  | "album-delete"
  | "share-album"
  | "edit-photo"
  | "move-photo"
  | "delete-photo"
  | "tag"
  | "event-link"
  | "rotate"
  | "slideshow";

export type Tone = "success" | "info" | "warning" | "danger";

export interface ToastInput {
  title: string;
  body?: string;
  tone?: Tone;
}

export type UrlPatch = Record<string, string | null | undefined>;

export interface GalleryActions {
  /** Open a photo in the lightbox (pushes history, so back closes it). */
  openPhoto: (id: string) => void;
  /** Move between photos inside the open lightbox without adding history entries. */
  showPhoto: (id: string) => void;
  closePhoto: () => void;
  openAct: (act: ActKind, extra?: UrlPatch) => void;
  closeAct: () => void;
  setParams: (patch: UrlPatch, mode?: "push" | "replace") => void;
  /** Run one write. The service returns the next state, which replaces the cache. */
  run: (job: () => Promise<GalleryState>, ok?: ToastInput, after?: (next: GalleryState) => void) => void;
  notify: (toast: ToastInput) => void;
  pending: boolean;
}

export interface GalleryParams {
  album: string;
  year: string;
  branch: string;
  contributor: string;
  event: string;
  tag: string;
  q: string;
  view: "masonry" | "grid" | "list";
  sort: "newest" | "oldest" | "favourites";
  img: string | null;
  act: ActKind | null;
  /** Album targeted by an album-level overlay. */
  target: string | null;
}

export const PAGE_SIZE = 24;
