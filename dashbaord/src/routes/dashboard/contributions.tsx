import { createRoute, type AnyRoute } from "@tanstack/react-router";
import ContributionsPage from "@/app/(dashboard)/dashboard/contributions/ContributionsPage";

/* ═══════════════════════════════════════════════════════════════════════
   T-7 · CONTRIBUTIONS — route
   /dashboard/contributions

   URL grammar so every cause, overlay and filter is deep-linkable:

     ?cause=NY-CAUSE-2026-001      the open cause (drawer)
     &act=contribute               which overlay is open
     &target=NY-CON-…              what that overlay acts on
     &purpose=wedding&status=open&q=…   the filters

   Back closes, reload restores, and a link can be handed to a relative.
   ═══════════════════════════════════════════════════════════════════════ */

const ACTS = [
  "contribute",
  "contribution-confirm",
  "receipt",
  "verify",
  "failed",
  "cause-detail",
  "payout",
  "broadcast",
  "cause-delete",
  "create-cause",
  "mpesa-import",
  "ledger-export",
  "contribution-edit",
  "cause-archive",
  "emergency-release",
] as const;

export type ContributionAct = (typeof ACTS)[number];

export function buildContributionRoute(parent: AnyRoute) {
  return createRoute({
    getParentRoute: () => parent,
    path: "contributions",
    validateSearch: (search: Record<string, unknown>) => {
      const out: Record<string, string | undefined> = {};
      if (typeof search.cause === "string") out.cause = search.cause;
      if (typeof search.act === "string" && (ACTS as readonly string[]).includes(search.act))
        out.act = search.act;
      if (typeof search.target === "string") out.target = search.target;
      if (typeof search.purpose === "string") out.purpose = search.purpose;
      if (typeof search.status === "string") out.status = search.status;
      if (typeof search.q === "string") out.q = search.q;
      return out;
    },
    component: ContributionsPage,
  });
}
