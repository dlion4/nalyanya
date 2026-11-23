import { createRoute, type AnyRoute } from "@tanstack/react-router";
import FinancesPage from "@/app/(dashboard)/dashboard/finances/FinancesPage";

/* ══════════════════════════════════════════════════════════════════════
   T-8 · FINANCES — TanStack route
   URL state: ?chama=, &act=, &status=, &cadence=, &q=
   ══════════════════════════════════════════════════════════════════════ */

export type FinanceAct =
  | "deposit"
  | "create-chama"
  | "chama-deposit"
  | "share-purchase"
  | "loan-request"
  | "transaction-detail"
  | "payout-release"
  | "broadcast"
  | "chama-delete"
  | "chama-publish"
  | "mpesa-import"
  | "ledger-export"
  | "transaction-edit"
  | "chama-archive"
  | "emergency-payout";

const ACTS = [
  "deposit",
  "create-chama",
  "chama-deposit",
  "share-purchase",
  "loan-request",
  "transaction-detail",
  "payout-release",
  "broadcast",
  "chama-delete",
  "chama-publish",
  "mpesa-import",
  "ledger-export",
  "transaction-edit",
  "chama-archive",
  "emergency-payout",
] as const;

export function buildFinanceRoute(parent: AnyRoute) {
  return createRoute({
    getParentRoute: () => parent,
    path: "finances",
    validateSearch: (search: Record<string, unknown>) => {
      const out: Record<string, string | undefined> = {};
      if (typeof search.chama === "string") out.chama = search.chama;
      if (typeof search.act === "string" && (ACTS as readonly string[]).includes(search.act))
        out.act = search.act;
      if (typeof search.status === "string") out.status = search.status;
      if (typeof search.cadence === "string") out.cadence = search.cadence;
      if (typeof search.q === "string") out.q = search.q;
      return out;
    },
    component: FinancesPage,
  });
}
