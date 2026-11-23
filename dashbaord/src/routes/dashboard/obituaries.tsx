import { createRoute, type AnyRoute } from "@tanstack/react-router";
import RemembrancePage from "@/app/(dashboard)/dashboard/obituaries/RemembrancePage";

/* ═══════════════════════════════════════════════════════════════════════
   T-6 · IN REMEMBRANCE — route
   /dashboard/obituaries

   The page owns its own URL grammar so every notice, tab and overlay is
   deep-linkable:

     ?obit=NY-OB-2019-0007      the open notice
     &tab=funeral               which tab of the drawer is open
     &act=wizard                which overlay is open
     &target=NY-CDN-0053       what that overlay acts on
     &year=2019&branch=…&view=list&q=…   the filters

   Back closes, reload restores, and a link can be handed to a relative.
   ═══════════════════════════════════════════════════════════════════════ */

const ACTS = [
  "wizard",
  "condolence",
  "moderate",
  "funeral",
  "cause",
  "album",
  "broadcast",
  "export",
  "unpublish",
  "tribute",
  "statement",
  "story",
  "scope",
  "audit",
  "filter",
  "lightbox",
] as const;

export type ObituaryAct = (typeof ACTS)[number];

export function buildObituaryRoute(parent: AnyRoute) {
  return createRoute({
    getParentRoute: () => parent,
    path: "obituaries",
    validateSearch: (search: Record<string, unknown>) => {
      const out: Record<string, string | undefined> = {};
      if (typeof search.obit === "string") out.obit = search.obit;
      if (typeof search.tab === "string") out.tab = search.tab;
      if (typeof search.act === "string" && (ACTS as readonly string[]).includes(search.act))
        out.act = search.act;
      if (typeof search.target === "string") out.target = search.target;
      if (typeof search.year === "string") out.year = search.year;
      if (typeof search.branch === "string") out.branch = search.branch;
      if (typeof search.view === "string") out.view = search.view;
      if (typeof search.q === "string") out.q = search.q;
      return out;
    },
    component: RemembrancePage,
  });
}
