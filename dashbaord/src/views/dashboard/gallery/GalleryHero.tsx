"use client";

import { Aperture, FolderOpen, HardDrive, ImagePlus, Images, RotateCcw, Sparkles, Upload } from "lucide-react";
import { CountUp, Reveal, TiltCard } from "@/components/ui/motion";
import type { GalleryAlbum, GalleryPhoto, PhotoSource } from "@/data/dashboard/gallery";
import { bytesLabel } from "@/views/dashboard/gallery/galleryUi";
import type { GalleryActions } from "@/views/dashboard/gallery/types";
import { photoSrc } from "@/services/galleryService";

export function GalleryHero({
  photos,
  albums,
  sources,
  actions,
}: {
  photos: GalleryPhoto[];
  albums: GalleryAlbum[];
  sources: PhotoSource[];
  actions: GalleryActions;
}) {
  const thisYear = photos.filter((p) => p.year === "2026").length;
  /* Size of the source archive (Drive originals + uploads), not these web-optimised copies. */
  const archiveMb = sources.reduce((sum, s) => sum + s.photoCount * 3.4, 0) + Math.round(photos.length * 2.2);
  const stack = [...photos].sort((a, b) => b.seq - a.seq).slice(0, 3);
  const pos = [
    { cls: "left-0 top-8 w-[60%] -rotate-y-8 -rotate-z-3 translate-z-10", size: "h-52 sm:h-60" },
    { cls: "right-0 top-0 w-[54%] rotate-y-8 rotate-z-3 translate-z-24", size: "h-44 sm:h-52" },
    { cls: "bottom-0 right-8 w-[42%] rotate-y-3 -rotate-z-2 translate-z-16", size: "h-32" },
  ];

  const kpis: Array<
    | { kind: "count"; label: string; value: number; note: string; accent: string; icon: typeof Images; anchor: string }
    | { kind: "text"; label: string; text: string; note: string; accent: string; icon: typeof Images; anchor: string }
  > = [
    { kind: "count", label: "Albums", value: albums.length, note: "Gatherings, weddings, the homeland and the archive", accent: "#1F4D3A", icon: Images, anchor: "#albums" },
    { kind: "count", label: "Photos", value: photos.length, note: "Every frame you can open in this gallery", accent: "#E0764A", icon: ImagePlus, anchor: "#grid" },
    { kind: "count", label: "This year", value: thisYear, note: "Taken in 2026 across all branches", accent: "#D4A437", icon: Sparkles, anchor: "#grid" },
    { kind: "text", label: "Source archive", text: bytesLabel(archiveMb), note: "Originals in Drive and uploads, before optimisation", accent: "#6A4C93", icon: HardDrive, anchor: "#sources" },
  ];

  return (
    <section aria-labelledby="gallery-heading" className="space-y-6">
      <div className="relative overflow-hidden rounded-[32px] border border-hairline bg-surface-1 shadow-soft">
        <div aria-hidden className="absolute inset-0">
          <img src="/images/gallery/g-r04.jpg" alt="" className="h-full w-full object-cover opacity-[0.16]" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-1 via-surface-1/94 to-surface-1/55" />
        </div>

        <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="min-w-0">
            <p className="ny-eyebrow">T-5 · Gallery</p>
            <h1 id="gallery-heading" className="ny-title mt-3 text-[2.5rem] leading-[1.02] sm:text-6xl">
              Every face, <span className="italic text-brand-primary">every season</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
              The family&apos;s photographs, kept by album, gathering and year. Open any photo through the camera shutter, tag the relatives in it, and
              share a link that opens straight onto that frame.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="ny-chip ny-chip-gold">
                <Aperture className="size-3.5" aria-hidden />
                Camera-shutter lightbox
              </span>
              <span className="ny-chip ny-chip-sim">Google Drive sync · SIMULATED</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <button type="button" onClick={() => actions.openAct("upload")} className="ny-btn ny-btn-primary">
                <Upload className="size-4" aria-hidden />
                Upload photos
              </button>
              <button type="button" onClick={() => actions.openAct("slideshow")} className="ny-btn ny-btn-gold">
                <Aperture className="size-4" aria-hidden />
                Play slideshow
              </button>
              <a href="#albums" className="ny-btn ny-btn-ghost">
                <FolderOpen className="size-4" aria-hidden />
                Browse albums
              </a>
              <a href="#trash" className="ny-btn ny-btn-ghost">
                <RotateCcw className="size-4" aria-hidden />
                Trash &amp; audit
              </a>
            </div>

            {/* Jump to any section; every anchor below is a section on this page. */}
            <nav aria-label="Jump to a section" className="mt-5 flex flex-wrap gap-2">
              {(
                [
                  ["#sources", "Sources"],
                  ["#albums", "Albums"],
                  ["#grid", "Photographs"],
                  ["#manage", "Album manager"],
                  ["#trash", "Trash & audit"],
                ] as const
              ).map(([href, label]) => (
                <a key={href} href={href} className="ny-chip transition hover:border-brand-primary hover:text-brand-primary">
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* 3D photo stack — Tailwind perspective and transform-3d utilities */}
          <div className="perspective-[1200px] relative mx-auto h-[19rem] w-full max-w-md sm:h-[22rem]">
            <TiltCard max={6} className="absolute inset-0">
              {stack.map((p, i) => (
                <figure
                  key={p.id}
                  className={`transform-3d absolute overflow-hidden rounded-3xl border-4 border-white bg-surface-2 shadow-lift ${pos[i].cls}`}
                >
                  <button type="button" onClick={() => actions.openPhoto(p.id)} className="block w-full">
                    <img src={photoSrc(p)} alt={p.caption} className={`${pos[i].size} w-full object-cover`} decoding="async" />
                  </button>
                  <figcaption className="truncate bg-surface-1 px-3 py-2 text-xs font-semibold text-text-primary">{p.caption}</figcaption>
                </figure>
              ))}
            </TiltCard>
          </div>
        </div>
      </div>

      {/* S1 — KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Reveal key={kpi.label} delay={index * 0.05}>
            <a href={kpi.anchor} className="ny-card ny-card-3d relative flex h-full flex-col overflow-hidden p-5 transition hover:border-brand-primary">
              <span aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: kpi.accent }} />
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">{kpi.label}</p>
                <kpi.icon className="size-4 text-text-tertiary" aria-hidden />
              </div>
              <p className="ny-title mt-3 text-4xl leading-none">
                {kpi.kind === "count" ? <CountUp value={kpi.value} /> : kpi.text}
              </p>
              <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">{kpi.note}</p>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
