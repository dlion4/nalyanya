import type { Metadata } from "next";
import { Suspense } from "react";
import "@/styles/pages/dashboard/members.css";
import { MembersPage } from "@/views/dashboard/members/MembersPage";

export const metadata: Metadata = {
  title: "Members · T-3",
};

function MembersSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading the members directory">
      <div className="h-72 animate-pulse rounded-[32px] bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl bg-surface-2" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-[28px] bg-surface-2" />
    </div>
  );
}

export default function MembersRoute() {
  return (
    <div className="page-dash-members">
      <Suspense fallback={<MembersSkeleton />}>
        <MembersPage />
      </Suspense>
    </div>
  );
}
