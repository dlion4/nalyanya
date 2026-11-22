"use client";

import { FolderPlus, Images, Pencil, Share2, Trash } from "lucide-react";
import { useState } from "react";
import { Reveal, TiltCard } from "@/components/ui/motion";
import { SectionHeader } from "@/components/ui/Primitives";
import type { GalleryAlbum, GalleryPhoto } from "@/data/dashboard/gallery";
import { BRANCHES } from "@/data/family/branches";
import { cn } from "@/lib/format";
import { albumName, VisibilityChip, visibilityHint } from "@/views/dashboard/gallery/galleryUi";
import { photoSrc } from "@/services/galleryService";
import type { GalleryActions } from "@/views/dashboard/gallery/types";

/** S6 — Albums manager: create, rename, cover, permissions, delete. */
export function AlbumManager({
  albums,
  photos,
  actions,
  viewerRole,
}: {
  albums: GalleryAlbum[];
  photos: GalleryPhoto[];
  actions: GalleryActions;
  viewerRole: string;
}) {
  const [filter, setFilter] = useState<"all" | "all-family" | "branch" | "admins-only">("all");
  const canEdit = viewerRole === "Family Head";
  const list = albums.filter((a) => filter === "all" || a.visibility === filter);
  const counts = {
    all: albums.length,
    "all-family": albums.filter((a) => a.visibility === "all-family").length,
    branch: albums.filter((a) => a.visibility === "branch").length,
    "admins-only": albums.filter((a) => a.visibility === "admins-only").length,
  };

  return (
    <section id="manage" aria-labelledby="manage-heading" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S6 · Albums manager"
        title="Name them, cover them, choose who sees them"
        description="Each album can be open to the whole family, limited to one branch, or kept for admins while faces are confirmed."
        actions={
          canEdit ? (
            <button type="button" onClick={() => actions.openAct("album-edit")} className="ny-btn ny-btn-primary">
              <FolderPlus className="size-4" aria-hidden />
              New album
            </button>
          ) : (
            <span className="ny-chip">Only the Family Head can change albums</span>
          )
        }
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter albums by visibility">
        {(["all", "all-family", "branch", "admins-only"] as const).map((key) => (
          <button key={key} type="button" onClick={() => setFilter(key)} aria-pressed={filter === key} className={cn("ny-chip cursor-pointer", filter === key && "ny-chip-solid")}>
            {key === "all" ? "All albums" : key === "all-family" ? "Whole family" : key === "branch" ? "Branch only" : "Admins only"}
            <span className="ny-num opacity-75">{counts[key]}</span>
          </button>
        ))}
      </div>

      <div className="perspective-[1200px] grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((album, i) => {
          const inAlbum = photos.filter((p) => p.albumId === album.id);
          const cover = inAlbum.find((p) => p.id === album.coverId) ?? inAlbum[0];
          const branch = BRANCHES.find((b) => b.id === album.branchId);
          return (
            <Reveal key={album.id} delay={(i % 3) * 0.05}>
              <TiltCard max={4} className="h-full">
                <article className="ny-card ny-card-3d group flex h-full flex-col overflow-hidden">
                  <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
                    {cover ? (
                      <img src={photoSrc(cover)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full place-items-center text-xs text-text-tertiary">No photos yet</div>
                    )}
                    <span className="absolute left-3 top-3 ny-chip !border-white/25 !bg-black/50 !text-white">
                      <Images className="size-3.5" aria-hidden /> {inAlbum.length}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="ny-title text-xl leading-tight">{album.name}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <VisibilityChip visibility={album.visibility} />
                      <span className="ny-chip">{album.year}</span>
                      <span className="ny-chip">{branch?.shortName ?? "—"} · {branch?.county}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-text-secondary">{album.description}</p>
                    <p className="text-[11px] text-text-tertiary">{visibilityHint(album.visibility)}</p>

                    <div className="mt-auto flex flex-wrap gap-2 border-t border-hairline pt-4">
                      <button type="button" onClick={() => actions.setParams({ album: album.id }, "push")} className="ny-btn ny-btn-primary ny-btn-sm">
                        Open
                      </button>
                      <button type="button" onClick={() => actions.openAct("share-album", { target: album.id })} className="ny-btn ny-btn-ghost ny-btn-sm">
                        <Share2 className="size-3.5" aria-hidden /> Share
                      </button>
                      {canEdit && (
                        <button type="button" onClick={() => actions.openAct("album-edit", { target: album.id })} aria-label={`Edit ${album.name}`} className="ny-btn ny-btn-ghost ny-btn-sm size-9 p-0">
                          <Pencil className="size-4" aria-hidden />
                        </button>
                      )}
                      {canEdit && (
                        <button type="button" onClick={() => actions.openAct("album-delete", { target: album.id })} aria-label={`Delete ${album.name}`} className="ny-btn ny-btn-ghost ny-btn-sm size-9 p-0 !text-danger">
                          <Trash className="size-4" aria-hidden />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              </TiltCard>
            </Reveal>
          );
        })}

        {/* Create tile */}
        {canEdit && (
          <button type="button" onClick={() => actions.openAct("album-edit")} className="ny-card flex min-h-[16rem] flex-col items-center justify-center gap-3 border-dashed p-6 text-center transition hover:-translate-y-1 hover:shadow-lift">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <FolderPlus className="size-5" aria-hidden />
            </span>
            <span className="ny-title text-xl">Start a new album</span>
            <span className="max-w-[16rem] text-sm text-text-secondary">For a gathering, a season, or a branch of the family.</span>
          </button>
        )}
      </div>

      <p className="text-xs text-text-tertiary">{albumName("ALB-REUNION")} is the default home for photos that are not sorted yet.</p>
    </section>
  );
}
