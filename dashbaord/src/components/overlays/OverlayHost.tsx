import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { X } from "lucide-react";
import { useWorkspace } from "@/state/Workspace";
import {
  ActionList,
  ContributionPanel,
} from "@/components/dashboard/DashboardSections";
import { WorkflowForm, workflowTitles } from "./WorkflowForm";
import {
  EventsList,
  FamilyPicker,
  MemberDirectory,
  MemoryViewer,
  NotificationsList,
  WorkspaceSearch,
} from "./WorkspaceLists";
import { DetailView } from "./DetailViews";
import type { Panel, Workflow } from "@/types/workspace";

const titles: Record<Panel, string> = {
  ...workflowTitles,
  actions: "Quick actions",
  search: "Search the workspace",
  family: "Your family branches",
  notifications: "Family updates",
  profile: "Your profile",
  wallet: "Family wallet",
  members: "Family members",
  contributions: "Family contributions",
  events: "Upcoming gatherings",
  event: "Gathering details",
  memory: "From the family album",
  member: "Family member",
  contribution: "Contribution details",
  health: "Workspace health",
  branch: "Branch overview",
  chama: "Savings circle",
  loan: "Loan overview",
  allocation: "Allocation details",
  alert: "Family update",
  cause: "A shared family cause",
  shares: "Our Sacco shares",
  calendar: "Family calendar",
  about: "About this workspace",
  receipt: "Simulation record",
};
function Content({ panel, id }: { panel: Panel; id?: string }) {
  if (Object.prototype.hasOwnProperty.call(workflowTitles, panel))
    return (
      <WorkflowForm key={`${panel}-${id || ""}`} kind={panel as Workflow} />
    );
  switch (panel) {
    case "actions":
      return (
        <>
          <p className="ny-modal-intro">
            A few helpful ways to care for your family workspace.
          </p>
          <ActionList />
        </>
      );
    case "search":
      return <WorkspaceSearch />;
    case "family":
      return <FamilyPicker />;
    case "notifications":
      return <NotificationsList />;
    case "members":
      return <MemberDirectory />;
    case "events":
    case "calendar":
      return <EventsList calendar={panel === "calendar"} />;
    case "memory":
      return <MemoryViewer id={id} />;
    case "contributions":
      return <ContributionPanel full />;
    default:
      return <DetailView kind={panel} id={id} />;
  }
}
export function OverlayHost() {
  const w = useWorkspace();
  const panel = w.query.panel as Panel | undefined;
  if (!panel || !Object.prototype.hasOwnProperty.call(titles, panel))
    return null;
  const drawer = [
    "notifications",
    "wallet",
    "health",
    "members",
    "events",
    "calendar",
    "branch",
    "profile",
    "family",
    "contributions",
    "receipt",
  ].includes(panel);
  return (
    <Dialog
      open
      onClose={w.close}
      className={`ny-dialog ${drawer ? "is-drawer" : ""} ${panel === "memory" ? "is-lightbox" : ""}`}
    >
      <DialogBackdrop transition className="ny-dialog-backdrop" />
      <div className="ny-dialog-position">
        <DialogPanel transition className="ny-dialog-panel" key={panel}>
          <div className="ny-dialog-heading">
            <div>
              <p className="ny-eyebrow">NALYANYA FAMILY WORKSPACE</p>
              <DialogTitle>{titles[panel]}</DialogTitle>
            </div>
            <button
              className="ny-icon-button"
              onClick={w.close}
              aria-label="Close dialog"
            >
              <X size={19} />
            </button>
          </div>
          <div className="ny-detail-body">
            <Content panel={panel} id={w.query.id} />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
