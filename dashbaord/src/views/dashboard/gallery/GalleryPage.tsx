"use client";

import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePrefs } from "@/components/shell/PrefsProvider";
import { useToast } from "@/components/ui/Toast";
import type { GalleryPhoto } from "@/data/dashboard/gallery";
import { CURRENT_USER_ID } from "@/data/dashboard/lineage";
import { getGallerySnapshot, listGallery } from "@/services/galleryService";
import { AlbumManager } from "@/views/dashboard/gallery/AlbumManager";
import { AlbumShelf } from "@/views/dashboard/gallery/AlbumShelf";
import { GalleryHero } from "@/views/dashboard/gallery/GalleryHero";
import { GalleryLightbox } from "@/views/dashboard/gallery/GalleryLightbox";
import { PhotoGrid } from "@/views/dashboard/gallery/PhotoGrid";
import { ConnectFolderModal, SourceConnector } from "@/views/dashboard/gallery/SourceConnector";
import { TrashAudit } from "@/views/dashboard/gallery/TrashAudit";
import { AlbumDeleteModal, AlbumEditModal, AlbumShareModal } from "@/views/dashboard/gallery/AlbumModals";
import {
  DeletePhotoModal,
  EventLinkModal,
  MovePhotoModal,
  PhotoEditModal,
  RotateModal,
  SlideshowModal,
  TagModal,
} from "@/views/dashboard/gallery/PhotoModals";
import { UploadWizard } from "@/views/dashboard/gallery/UploadWizard";
import type { ActKind, GalleryActions, GalleryParams, ToastInput, UrlPatch } from "@/views/dashboard/gallery/types";
import type { GalleryState } from "@/services/galleryService";

const GALLERY_KEY = ["gallery", "family"] as const;

const ACT_KINDS: ActKind[] = [
  "upload", "connect", "album-edit", "album-delete", "share-album",
  "edit-photo", "move-photo", "delete-photo", "tag", "event-link", "rotate", "slideshow",
];

const VIEWER_ROLE = "Family Head";

/** Album visibility is enforced here, so a restricted album never reaches the grid. */
function canViewAlbum(album: GalleryState["albums"][number], branchContext: string): boolean {
  if (album.visibility === "admins-only") return VIEWER_ROLE === "Family Head";
  if (album.visibility === "branch") return branchContext === "all" || branchContext === album.branchId;
  return true;
}

function GalleryInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const { calmMotion, branchContext } = usePrefs();

  /* Seeded synchronously for an instant first paint, then kept fresh by the query. */
  const { data } = useQuery({
    queryKey: GALLERY_KEY,
    queryFn: listGallery,
    initialData: getGallerySnapshot,
    staleTime: 60_000,
  });
  const state: GalleryState = data ?? getGallerySnapshot();

  const mutation = useMutation({
    mutationFn: (job: () => Promise<GalleryState>) => job(),
    onSuccess: (next) => queryClient.setQueryData(GALLERY_KEY, next),
    onError: () => notify({ title: "That didn't save", body: "Nothing changed. Please try again.", tone: "danger" }),
  });
  const runMutation = mutation.mutate;
  const pending = mutation.isPending;

  const run = useCallback(
    (job: () => Promise<GalleryState>, ok?: ToastInput, after?: (next: GalleryState) => void) => {
      runMutation(job, {
        onSuccess: (next) => {
          if (ok) notify(ok);
          after?.(next);
        },
      });
    },
    [runMutation, notify],
  );

  /* URL state — filters, the open photo and every overlay are search params. */
  const params = useMemo<GalleryParams>(() => {
    const act = searchParams.get("act");
    const view = searchParams.get("view");
    const sort = searchParams.get("sort");
    return {
      album: searchParams.get("album") ?? "all",
      year: searchParams.get("year") ?? "all",
      branch: searchParams.get("branch") ?? "all",
      contributor: searchParams.get("contributor") ?? "all",
      event: searchParams.get("event") ?? "all",
      tag: searchParams.get("tag") ?? "all",
      q: searchParams.get("q") ?? "",
      view: view === "grid" || view === "list" ? view : "masonry",
      sort: sort === "oldest" || sort === "favourites" ? sort : "newest",
      img: searchParams.get("img"),
      act: act && (ACT_KINDS as string[]).includes(act) ? (act as ActKind) : null,
      target: searchParams.get("target"),
    };
  }, [searchParams]);

  const setParams = useCallback(
    (patch: UrlPatch, mode: "push" | "replace" = "replace") => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === "" || value === "all") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (mode === "push") router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const actions = useMemo<GalleryActions>(
    () => ({
      openPhoto: (id) => setParams({ img: id, act: null }, "push"),
      showPhoto: (id) => setParams({ img: id }, "replace"),
      closePhoto: () => setParams({ img: null, act: null }, "replace"),
      openAct: (act, extra) => setParams({ act, ...extra }, "push"),
      closeAct: () => setParams({ act: null, target: null }, "replace"),
      setParams,
      run,
      notify,
      pending,
    }),
    [setParams, run, notify, pending],
  );

  /* Only albums this viewer may see. */
  const visibleAlbums = useMemo(() => state.albums.filter((a) => canViewAlbum(a, branchContext)), [state.albums, branchContext]);
  const allowedAlbumIds = useMemo(() => new Set(visibleAlbums.map((a) => a.id)), [visibleAlbums]);
  const visiblePhotos = useMemo(() => state.photos.filter((p) => allowedAlbumIds.has(p.albumId)), [state.photos, allowedAlbumIds]);

  const photo = params.img ? visiblePhotos.find((p) => p.id === params.img) ?? null : null;
  const targetAlbum = params.target ? state.albums.find((a) => a.id === params.target) ?? null : null;
  const act = params.act;

  /* Keyboard: Esc closes the lightbox; arrows move within the visible set (newest first). */
  const photoIds = useMemo(() => [...visiblePhotos].sort((a, b) => b.seq - a.seq).map((p) => p.id), [visiblePhotos]);

  const step = useCallback(
    (dir: 1 | -1) => {
      const i = photoIds.indexOf(photo?.id ?? "");
      if (i < 0 || photoIds.length === 0) return;
      const next = photoIds[(i + dir + photoIds.length) % photoIds.length];
      actions.showPhoto(next);
    },
    [photoIds, photo?.id, actions],
  );

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (!photo) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      } else if (e.key === "Escape" && !act) {
        actions.closePhoto();
      }
    },
    [photo, act, step, actions],
  );

  /* Attach only while the lightbox is open; always remove on change or unmount. */
  useEffect(() => {
    if (!photo) return;
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photo, onKey]);

  return (
    <div className="relative space-y-12 pb-8">
      {pending && (
        <div aria-hidden className="fixed inset-x-0 top-0 z-[80] h-1 overflow-hidden bg-brand-accent/20">
          <div className={calmMotion ? "h-full w-1/3 bg-brand-accent" : "ny-progress-bar h-full w-1/3 bg-brand-accent"} />
        </div>
      )}

      {/* S1 — Hero + KPI row */}
      <GalleryHero photos={visiblePhotos} albums={visibleAlbums} sources={state.sources} actions={actions} />

      {/* S2 — Sources: Google Drive connector, direct and contributor uploads */}
      <SourceConnector sources={state.sources} actions={actions} />

      {/* S3 + S4 — Album chips, filters and the masonry / grid / list of photos */}
      <AlbumShelf albums={visibleAlbums} photos={visiblePhotos} params={params} actions={actions} viewerRole={VIEWER_ROLE} />
      <PhotoGrid photos={visiblePhotos} albums={visibleAlbums} params={params} actions={actions} />

      {/* S5 — Upload wizard launchpad */}
      <UploadWizard open={act === "upload"} albums={visibleAlbums} actions={actions} />

      {/* S6 — Albums manager */}
      <AlbumManager albums={visibleAlbums} photos={visiblePhotos} actions={actions} viewerRole={VIEWER_ROLE} />

      {/* S7 — Trash & audit */}
      <TrashAudit state={state} actions={actions} />

      {/* ─── Lightbox and overlays (no page reload) ─── */}
      <GalleryLightbox
        photo={photo}
        photos={visiblePhotos}
        albums={visibleAlbums}
        act={act}
        calm={calmMotion}
        actions={actions}
        onStep={step}
      />

      <PhotoEditModal key={`edit-${photo?.id ?? "none"}`} open={act === "edit-photo"} photo={photo} actions={actions} />
      <MovePhotoModal key={`move-${photo?.id ?? "none"}`} open={act === "move-photo"} photo={photo} albums={visibleAlbums} actions={actions} />
      <TagModal key={`tag-${photo?.id ?? "none"}`} open={act === "tag"} photo={photo} actions={actions} />
      <EventLinkModal key={`event-${photo?.id ?? "none"}`} open={act === "event-link"} photo={photo} actions={actions} />
      <RotateModal key={`rotate-${photo?.id ?? "none"}`} open={act === "rotate"} photo={photo} actions={actions} />
      <DeletePhotoModal key={`del-${photo?.id ?? "none"}`} open={act === "delete-photo"} photo={photo} actions={actions} />
      <SlideshowModal open={act === "slideshow"} photos={visiblePhotos} actions={actions} calm={calmMotion} />

      <ConnectFolderModal open={act === "connect"} actions={actions} />

      <AlbumEditModal key={`alb-edit-${targetAlbum?.id ?? "none"}`} open={act === "album-edit"} album={targetAlbum} photos={visiblePhotos} actions={actions} />
      <AlbumDeleteModal key={`alb-del-${targetAlbum?.id ?? "none"}`} open={act === "album-delete"} album={targetAlbum} photos={visiblePhotos} actions={actions} />
      <AlbumShareModal key={`alb-share-${targetAlbum?.id ?? "none"}`} open={act === "share-album"} album={targetAlbum} photos={visiblePhotos} actions={actions} />

      <span className="sr-only" aria-live="polite">
        {photo ? `Photo ${photo.caption} open.` : ""}
      </span>
      <span className="sr-only">{`Signed in as ${CURRENT_USER_ID}, ${VIEWER_ROLE}.`}</span>
    </div>
  );
}

/** T-5 · Gallery — client shell that owns the query cache and all URL state. */
export function GalleryPage() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
          mutations: { retry: 0 },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <GalleryInner />
    </QueryClientProvider>
  );
}
