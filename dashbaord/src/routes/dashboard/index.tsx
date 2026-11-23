import { createRoute, Outlet, type AnyRootRoute } from "@tanstack/react-router";
import CommandCenterPage from "@/pages/dashboard/command-center/CommandCenterPage";
import LineagePage from "@/pages/dashboard/lineage/LineagePage";
import MembersPage from "@/pages/dashboard/members/MembersPage";
import EventsPage from "@/pages/dashboard/events/EventsPage";
import GalleryPage from "@/pages/dashboard/gallery/GalleryPage";
import AllocationsPage from "@/pages/dashboard/finance-access/AllocationsPage";
import LoansPage from "@/pages/dashboard/loans/LoansPage";
import FoundationPage from "@/pages/dashboard/foundation/FoundationPage";
import RecordsPage from "@/pages/dashboard/records/RecordsPage";
import ProfessionsPage from "@/pages/dashboard/professions/ProfessionsPage";
import CommunicationsPage from "@/pages/dashboard/communications/CommunicationsPage";
import AccountPage from "@/pages/dashboard/account/AccountPage";
import SettingsPage from "@/pages/dashboard/settings/SettingsPage";
import { buildObituaryRoute } from "./obituaries";
import { buildContributionRoute } from "./contributions";
import { buildFinanceRoute } from "./finances";

export function buildDashboardRoutes(parent: AnyRootRoute) {
  const dashboard = createRoute({
    getParentRoute: () => parent,
    path: "dashboard",
    component: Outlet,
  });
  return dashboard.addChildren([
    createRoute({
      getParentRoute: () => dashboard,
      path: "/",
      component: CommandCenterPage,
    }),
    createRoute({
      getParentRoute: () => dashboard,
      path: "lineage",
      component: LineagePage,
    }),
    createRoute({
      getParentRoute: () => dashboard,
      path: "members",
      component: MembersPage,
    }),
    createRoute({
      getParentRoute: () => dashboard,
      path: "events",
      component: EventsPage,
    }),
    createRoute({
      getParentRoute: () => dashboard,
      path: "gallery",
      component: GalleryPage,
    }),
    buildObituaryRoute(dashboard),
    buildContributionRoute(dashboard),
    buildFinanceRoute(dashboard),
    createRoute({
      getParentRoute: () => dashboard,
      path: "finance-access",
      component: AllocationsPage,
    }),
    createRoute({
      getParentRoute: () => dashboard,
      path: "loans",
      component: LoansPage,
    }),
    createRoute({
      getParentRoute: () => dashboard,
      path: "foundation",
      component: FoundationPage,
    }),
    createRoute({
      getParentRoute: () => dashboard,
      path: "records",
      component: RecordsPage,
    }),
    createRoute({
      getParentRoute: () => dashboard,
      path: "professions",
      component: ProfessionsPage,
    }),
    createRoute({
      getParentRoute: () => dashboard,
      path: "communications",
      component: CommunicationsPage,
    }),
    createRoute({
      getParentRoute: () => dashboard,
      path: "account",
      component: AccountPage,
    }),
    createRoute({
      getParentRoute: () => dashboard,
      path: "settings",
      component: SettingsPage,
    }),
  ]);
}
