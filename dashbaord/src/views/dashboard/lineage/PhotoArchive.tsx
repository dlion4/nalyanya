"use client";

import Link from "next/link";
import { IrisReel } from "@/components/ui/IrisReel";
import { SectionHeader } from "@/components/ui/Primitives";
import { ARCHIVE_SLIDES } from "@/data/dashboard/lineage";

/** S8 — family photographs in a camera-shutter reel (aperture closes, swaps, re-opens). */
export function PhotoArchive() {
  return (
    <section id="archive" className="scroll-mt-24 space-y-8">
      <SectionHeader
        eyebrow="S8 · Family archive"
        title="Memories, framed like a camera roll"
        description="Each photograph arrives through a shutter: the aperture closes to a pinhole, the exposure changes, and the lens opens on the next moment. Illustrative images for now; Google Drive pulls arrive in Phase 2."
        actions={
          <>
            <span className="ny-chip ny-chip-sim">Google Drive · SIMULATED</span>
            <Link href="/dashboard/gallery" className="ny-btn ny-btn-ghost">
              Open the gallery →
            </Link>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <IrisReel slides={ARCHIVE_SLIDES} />

        <aside className="ny-card flex flex-col gap-4 p-6">
          <p className="ny-eyebrow">Shot list</p>
          <ol className="ny-scroll max-h-[28rem] space-y-3 overflow-y-auto pr-1">
            {ARCHIVE_SLIDES.map((slide, index) => (
              <li key={slide.src} className="flex gap-3 rounded-2xl border border-hairline bg-surface-0/60 p-3">
                <img src={slide.src} alt="" loading="lazy" decoding="async" className="size-14 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-brand-secondary">
                    Frame {String(index + 1).padStart(2, "0")} · {slide.year}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-text-primary">{slide.caption}</p>
                  <p className="mt-0.5 text-xs text-text-tertiary">{slide.place}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}
