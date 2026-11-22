import type { Metadata } from "next";
import { Suspense } from "react";
import "@/styles/pages/dashboard/events.css";
import { EventsPage } from "@/views/dashboard/events/EventsPage";

export const metadata: Metadata = {
  title: "Events · T-4",
};

function EventsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading events">
      <div className="h-80 animate-pulse rounded-[32px] bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl bg-surface-2" />
        ))}
      </div>
      <div className="h-[32rem] animate-pulse rounded-[28px] bg-surface-2" />
    </div>
  );
}

export default function EventsRoute() {
  return (
    <div className="page-dash-events">
      <Suspense fallback={<EventsSkeleton />}>
        <EventsPage />
      </Suspense>
    </div>
  );
}
