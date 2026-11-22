import type { Metadata } from "next";
import { Suspense } from "react";
import "@/styles/pages/dashboard/gallery.css";
import { GalleryPage } from "@/views/dashboard/gallery/GalleryPage";

export const metadata: Metadata = {
  title: "Gallery · T-5",
};

function GallerySkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading the family gallery">
      <div className="h-80 animate-pulse rounded-[32px] bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl bg-surface-2" />
        ))}
      </div>
      <div className="h-8 w-2/3 animate-pulse rounded-full bg-surface-2" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-[20px] bg-surface-2" style={{ animationDelay: `${(i % 4) * 90}ms` }} />
        ))}
      </div>
    </div>
  );
}

export default function GalleryRoute() {
  return (
    <div className="page-dash-gallery">
      <Suspense fallback={<GallerySkeleton />}>
        <GalleryPage />
      </Suspense>
    </div>
  );
}
