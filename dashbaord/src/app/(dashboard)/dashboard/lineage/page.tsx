import type { Metadata } from "next";
import { Suspense } from "react";
import "@/styles/pages/dashboard/lineage.css";
import { LineagePage } from "@/views/dashboard/lineage/LineagePage";

export const metadata: Metadata = {
  title: "Lineage · T-2",
};

function LineageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading the family tree">
      <div className="h-80 animate-pulse rounded-[32px] bg-surface-2" />
      <div className="h-[62vh] animate-pulse rounded-[30px] bg-brand-deep/80 lg:h-[78vh]" />
    </div>
  );
}

export default function LineageRoute() {
  return (
    <div className="page-dash-lineage">
      <Suspense fallback={<LineageSkeleton />}>
        <LineagePage />
      </Suspense>
    </div>
  );
}
