import {
  Link,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { WorkspaceProvider } from "@/state/Workspace";
import { DashboardShell } from "@/components/layout/DashboardShell";
import CommandCenterPage from "@/pages/dashboard/command-center/CommandCenterPage";
import { buildDashboardRoutes } from "./dashboard";

const root = createRootRoute({
  validateSearch: (search: Record<string, unknown>) =>
    Object.fromEntries(
      Object.entries(search).filter(
        ([k, v]) =>
          [
            "branch",
            "panel",
            "id",
            /* T-6 remembrance: the notice, its tab, the open overlay and
               the filters all live in the URL so a page can be shared. */
            "obit",
            "tab",
            "act",
            "target",
            "year",
            "view",
            "q",
          ].includes(k) && typeof v === "string",
      ),
    ) as Record<string, string | undefined>,
  component: () => (
    <WorkspaceProvider>
      <DashboardShell />
    </WorkspaceProvider>
  ),
  notFoundComponent: () => (
    <div className="ny-panel">
      <p className="ny-eyebrow">FAMILY WORKSPACE</p>
      <h1 className="text-3xl mt-2 mb-3">Let's find your way home.</h1>
      <p className="text-text-secondary mb-4">
        This page isn't part of the family workspace.
      </p>
      <Link to="/dashboard" className="ny-btn ny-btn-primary">
        Back to command center
      </Link>
    </div>
  ),
});
const entry = createRoute({
  getParentRoute: () => root,
  path: "/",
  component: CommandCenterPage,
});
export const router = createRouter({
  routeTree: root.addChildren([entry, buildDashboardRoutes(root)]),
  defaultPreload: "intent",
  scrollRestoration: false,
});
