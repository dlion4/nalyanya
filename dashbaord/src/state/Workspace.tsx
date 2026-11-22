import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { MotionConfig, useReducedMotion } from "motion/react";
import {
  branches,
  contributions,
  events,
  family,
} from "@/data/dashboard/command-center";
import type {
  Contribution,
  FamilyEvent,
  LedgerEntry,
  Panel,
  SavedWorkspace,
} from "@/types/workspace";

const storageKey = "nalyanya.workspace.v1";
const initial: SavedWorkspace = {
  elder: false,
  rsvps: {},
  dismissed: [],
  read: [],
  saved: [],
  entries: [],
  events: [],
};
function readLocal(): SavedWorkspace {
  try {
    return {
      ...initial,
      ...JSON.parse(localStorage.getItem(storageKey) || "{}"),
    };
  } catch {
    return initial;
  }
}
function useWorkspaceState() {
  const [local, setLocal] = useState<SavedWorkspace>(readLocal);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const query = location.search as Record<string, string | undefined>;
  const branch = branches.find((b) => b.id === query.branch);
  const reduced = !!useReducedMotion() || local.elder;
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(local));
    } catch {
      /* Private browsing may disable persistent storage. */
    }
    document.documentElement.dataset.nyMode = local.elder
      ? "elder"
      : "standard";
  }, [local]);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === storageKey) setLocal(readLocal());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3800);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  const updateQuery = useCallback(
    (changes: Record<string, string | undefined>, replace = false) => {
      void navigate({
        to: location.pathname,
        search: { ...query, ...changes },
        replace,
        resetScroll: false,
      });
    },
    [navigate, location.pathname, query],
  );
  const open = (panel: Panel, id?: string) => {
    setMobileNav(false);
    updateQuery({ panel, id }, !!query.panel);
  };
  const close = () => updateQuery({ panel: undefined, id: undefined }, true);
  const go = (path: string, panel?: Panel, id?: string) => {
    setMobileNav(false);
    void navigate({
      to: path,
      search: { branch: query.branch, panel, id },
      resetScroll: true,
    });
  };
  const chooseBranch = (id?: string) => {
    updateQuery({ branch: id, panel: undefined, id: undefined }, true);
    setToast(
      id
        ? `Viewing the ${branches.find((b) => b.id === id)?.name} branch`
        : "Viewing all family branches",
    );
  };
  const allEvents = useMemo(
    () =>
      [...local.events, ...events].sort((a, b) => a.date.localeCompare(b.date)),
    [local.events],
  );
  const scopedEvents = branch
    ? allEvents.filter((e) => e.branch === branch.id)
    : allEvents;
  const allContributions = useMemo<Contribution[]>(
    () => [
      ...local.entries
        .filter((e) => e.kind === "contribute")
        .map((e) => ({
          id: e.id,
          member: "Brian Otieno Nalyanya",
          purpose: e.purpose || "Family welfare",
          amount: e.amount,
          time: localDateShort(e.date),
          status: "Simulated" as const,
          branch: e.branch,
        })),
      ...contributions,
    ],
    [local.entries],
  );
  const scopedContributions = branch
    ? allContributions.filter((c) => c.branch === branch.id)
    : allContributions;
  const scopedEntries = local.entries.filter(
    (e) => !branch || e.branch === branch.id,
  );
  const balance =
    (branch?.balance ?? family.wallet) +
    scopedEntries.reduce((sum, e) => sum + e.delta, 0);
  const contributionTotal =
    Math.round(
      family.contributions * (branch ? branch.members / family.members : 1),
    ) +
    scopedEntries
      .filter((e) => e.kind === "contribute")
      .reduce((s, e) => s + e.amount, 0);
  const addEntry = (entry: LedgerEntry) =>
    setLocal((s) => ({ ...s, entries: [entry, ...s.entries] }));
  const addEvent = (event: FamilyEvent) =>
    setLocal((s) => ({ ...s, events: [event, ...s.events] }));
  const rsvp = (id: string, value: string) => {
    setLocal((s) => ({ ...s, rsvps: { ...s.rsvps, [id]: value } }));
    setToast("Your RSVP is saved on this device.");
  };
  const toggleSaved = (id: string) =>
    setLocal((s) => ({
      ...s,
      saved: s.saved.includes(id)
        ? s.saved.filter((m) => m !== id)
        : [...s.saved, id],
    }));
  const dismiss = (id: string) =>
    setLocal((s) => ({ ...s, dismissed: [...new Set([...s.dismissed, id])] }));
  const markRead = (ids: string[]) =>
    setLocal((s) => ({ ...s, read: [...new Set([...s.read, ...ids])] }));
  const toggleElder = () => setLocal((s) => ({ ...s, elder: !s.elder }));
  return {
    local,
    toast,
    setToast,
    mobileNav,
    setMobileNav,
    collapsed,
    setCollapsed,
    query,
    branch,
    reduced,
    open,
    close,
    go,
    updateQuery,
    chooseBranch,
    allEvents,
    scopedEvents,
    allContributions,
    scopedContributions,
    balance,
    contributionTotal,
    addEntry,
    addEvent,
    rsvp,
    toggleSaved,
    dismiss,
    markRead,
    toggleElder,
    path: location.pathname,
  };
}
function localDateShort(date: string) {
  return (
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Nairobi",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date)) + " EAT"
  );
}
const WorkspaceContext = createContext<ReturnType<
  typeof useWorkspaceState
> | null>(null);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const value = useWorkspaceState();
  return (
    <WorkspaceContext.Provider value={value}>
      <MotionConfig reducedMotion={value.reduced ? "always" : "user"}>
        {children}
      </MotionConfig>
    </WorkspaceContext.Provider>
  );
}
export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("The family workspace provider is missing.");
  return ctx;
}
