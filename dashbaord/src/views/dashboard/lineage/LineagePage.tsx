"use client";

import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Plus, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePrefs } from "@/components/shell/PrefsProvider";
import { GEN_HEX } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { AUDIT_SEED } from "@/data/dashboard/lineage";
import { getFamilyGraph, LAYOUT, type FamilyGraph } from "@/lib/family/graph";
import type { AuditEntry, Branch } from "@/types/family";
import type { SceneCommand } from "@/views/dashboard/lineage/scene/LineageScene";
import { ActionDialog, ACTION_KINDS, AuditDialog, ShortcutsDialog, type ActionKind } from "@/views/dashboard/lineage/LineageDialogs";
import { AuditPanel } from "@/views/dashboard/lineage/AuditPanel";
import { AccessPanel, Sayings } from "@/views/dashboard/lineage/SayingsAndAccess";
import { BranchesOverview } from "@/views/dashboard/lineage/BranchesOverview";
import { CanvasStage } from "@/views/dashboard/lineage/CanvasStage";
import { ControlRail } from "@/views/dashboard/lineage/ControlRail";
import { FamilyNumbers } from "@/views/dashboard/lineage/FamilyNumbers";
import { LineageHeader } from "@/views/dashboard/lineage/LineageHeader";
import { MemberInspector } from "@/views/dashboard/lineage/MemberInspector";
import { PhotoArchive } from "@/views/dashboard/lineage/PhotoArchive";
import { WhereAmIPanel } from "@/views/dashboard/lineage/WhereAmIPanel";

function Legend({ graph }: { graph: FamilyGraph }) {
  return (
    <div className="ny-card flex flex-wrap items-center gap-x-6 gap-y-3 p-4 text-sm text-text-secondary">
      <span className="font-semibold text-text-primary">Legend</span>
      {graph.generations.map((g) => (
        <span key={g} className="inline-flex items-center gap-2">
          <span className="size-3 rounded-full" style={{ background: GEN_HEX[g - 1] }} aria-hidden />
          Gen {g}
        </span>
      ))}
      <span className="inline-flex items-center gap-2">
        <span className="size-3 rounded-full border-2 border-brand-accent" aria-hidden />
        You
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="size-3 rounded-full border border-[#c9d1c4] bg-surface-2" aria-hidden />
        Passed on
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="size-3 rounded-full border-2 border-[#A284DC]" aria-hidden />
        Adopted
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-0.5 w-5 bg-[#F4A07A]" aria-hidden />
        Marriage
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="h-0 w-5 border-t-2 border-dashed border-brand-accent" aria-hidden />
        Where am I?
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="size-3 rounded-full bg-brand-accent/70" aria-hidden />
        Also present
      </span>
    </div>
  );
}

/** T-2 · Lineage — the 3D family tree page. Every control is URL state (shareable, back-button safe). */
export function LineagePage() {
  const graph = useMemo(() => getFamilyGraph(), []);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { calmMotion, elder } = usePrefs();
  const { notify } = useToast();

  const [audit, setAudit] = useState<AuditEntry[]>(AUDIT_SEED);
  const [extraBranches, setExtraBranches] = useState<Branch[]>([]);
  const [command, setCommand] = useState<SceneCommand>(null);
  const nonce = useRef(0);

  const genParam = searchParams.get("gen");
  const branchParam = searchParams.get("branch");
  const focusParam = searchParams.get("focus");
  const atParam = searchParams.get("at");
  const rotateParam = searchParams.get("rotate");
  const whereParam = searchParams.get("where");
  const modeParam = searchParams.get("mode");
  const actParam = searchParams.get("act");
  const auditParam = searchParams.get("audit");
  const helpParam = searchParams.get("help");

  const visibleGens = useMemo<number[] | null>(() => {
    if (!genParam) return null;
    const list = genParam.split(",").map(Number).filter((g) => graph.generations.includes(g));
    return list.length > 0 ? list : null;
  }, [genParam, graph]);

  const allBranchIds = useMemo(
    () => [...graph.branches.map((b) => b.id), ...extraBranches.map((b) => b.id)],
    [graph, extraBranches],
  );

  const visibleBranches = useMemo<string[] | null>(() => {
    if (!branchParam) return null;
    const list = branchParam.split(",").filter((id) => allBranchIds.includes(id));
    return list.length > 0 ? list : null;
  }, [branchParam, allBranchIds]);

  const focusKey = useMemo<string | null>(() => {
    if (!focusParam || !graph.memberById.has(focusParam)) return null;
    if (atParam && graph.nodeByKey.has(`${focusParam}@${atParam}`)) return `${focusParam}@${atParam}`;
    return focusParam;
  }, [focusParam, atParam, graph]);

  const inspectedId = focusKey ? focusKey.split("@")[0] : null;
  const rotateOn = rotateParam !== "0";
  const showWhere = whereParam === "1";
  const use2d = modeParam === "2d" || calmMotion;
  const actKind = ACTION_KINDS.find((k) => k === actParam) ?? null;
  const helpOpen = helpParam === "1";
  const auditEntry = audit.find((e) => e.id === auditParam) ?? null;
  const actMember = graph.memberById.get(inspectedId ?? LAYOUT.root) ?? null;

  const update = useCallback(
    (patch: Record<string, string | null>, mode: "push" | "replace" = "replace") => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      const query = next.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      if (mode === "push") router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const pick = useCallback((memberId: string, branchId?: string) => update({ focus: memberId, at: branchId ?? null }, "push"), [update]);
  const navigate = useCallback((memberId: string) => update({ focus: memberId, at: null }, "replace"), [update]);
  const closeInspector = useCallback(() => update({ focus: null, at: null }, "replace"), [update]);

  const fitCommand = useCallback((kind: "family" | "branch" | "reset", branchId?: string) => {
    nonce.current += 1;
    setCommand({ kind, branchId, nonce: nonce.current });
  }, []);

  const scrollToTree = () => document.getElementById("tree")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const openBranch = (branchId: string) => {
    fitCommand("branch", branchId);
    scrollToTree();
  };

  const runCommand = (kind: "family" | "branch" | "reset") => {
    if (kind !== "branch") {
      fitCommand(kind);
      return;
    }
    const branchId =
      visibleBranches?.length === 1 ? visibleBranches[0] : focusKey ? graph.nodeByKey.get(focusKey)?.branchId : undefined;
    if (!branchId) {
      notify({ title: "Choose a branch first", body: "Tap a branch chip, or select a family member, then fit the branch.", tone: "info" });
      return;
    }
    fitCommand("branch", branchId);
  };

  const toggleGen = (g: number) => {
    const current = visibleGens ?? graph.generations;
    const next = current.includes(g) ? current.filter((x) => x !== g) : [...current, g].sort((a, b) => a - b);
    update({ gen: next.length === 0 || next.length === graph.generations.length ? null : next.join(",") });
  };

  const toggleBranch = (id: string) => {
    const current = visibleBranches ?? allBranchIds;
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    update({ branch: next.length === 0 || next.length === allBranchIds.length ? null : next.join(",") });
  };

  const clearFilters = () => update({ gen: null, branch: null });

  const openAct = (kind: ActionKind) => update({ act: kind }, "push");
  const closeAct = () => update({ act: null }, "replace");
  const openAudit = (id: string) => update({ audit: id }, "push");
  const closeAudit = () => update({ audit: null }, "replace");
  const openHelp = () => update({ help: "1" }, "push");
  const closeHelp = () => update({ help: null }, "replace");

  const toggleWhere = () => update({ where: showWhere ? null : "1" });

  useEffect(() => {
    if (!inspectedId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !actKind && !auditEntry && !helpOpen) closeInspector();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [inspectedId, actKind, auditEntry, helpOpen, closeInspector]);

  const onSubmitAction = (entry: AuditEntry, extra?: { branch?: Branch }) => {
    setAudit((prev) => [entry, ...prev]);
    if (extra?.branch) {
      const created = extra.branch;
      setExtraBranches((prev) => [...prev, created]);
    }
    closeAct();
    notify({
      title: entry.status === "pending" ? "Sent for approval" : "Saved to the tree",
      body: "SIMULATED: the change is in the audit trail and connects to the backend when it is wired.",
      tone: entry.status === "pending" ? "info" : "success",
    });
  };

  const approve = (id: string) => {
    setAudit((prev) => prev.map((e): AuditEntry => (e.id === id ? { ...e, status: "applied" } : e)));
    closeAudit();
    notify({ title: "Change approved", body: "The edit is applied and logged (SIMULATED).", tone: "success" });
  };

  const exportCsv = () => {
    const header = ["id", "at", "actor", "action", "entity", "summary", "before", "after", "reason", "status"];
    const esc = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = audit.map((e) =>
      [e.id, e.at, e.actor, e.action, e.entity, e.summary, e.before, e.after, e.reason, e.status].map(esc).join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "nalyanya-lineage-audit.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    notify({ title: "Audit exported", body: `${audit.length} entries downloaded as CSV.`, tone: "success" });
  };

  return (
    <div className="space-y-14 pb-6">
      <LineageHeader graph={graph} onFocusRoot={() => pick(LAYOUT.root)} onOpenBranch={openBranch} />

      <section id="tree" className="scroll-mt-24 space-y-5">
        <div>
          <p className="ny-eyebrow">S2–S4 · Explore the tree</p>
          <h2 className="ny-title mt-2 text-3xl sm:text-4xl">Walk the tree, branch by branch</h2>
          <p className="mt-2 max-w-2xl text-text-secondary">
            Search, filter and orbit. Click anyone to dolly in and open their profile. Every control lives in the URL, so a view can be shared
            or bookmarked.
          </p>
        </div>

        <ControlRail
          graph={graph}
          visibleGens={visibleGens}
          visibleBranches={visibleBranches}
          showWhere={showWhere}
          rotateOn={rotateOn}
          use2d={use2d}
          calm={calmMotion}
          onPick={(id) => pick(id)}
          onToggleGen={toggleGen}
          onToggleBranch={toggleBranch}
          onClearFilters={clearFilters}
          onToggleWhere={toggleWhere}
          onToggleRotate={() => update({ rotate: rotateOn ? "0" : null })}
          onToggle2d={() => update({ mode: modeParam === "2d" ? null : "2d" })}
          onCommand={runCommand}
        />

        <CanvasStage
          graph={graph}
          focusKey={focusKey}
          visibleGens={visibleGens}
          visibleBranches={visibleBranches}
          showWhere={showWhere}
          rotateOn={rotateOn}
          use2d={use2d}
          calm={calmMotion}
          command={command}
          onPick={(id, branchId) => pick(id, branchId)}
          onNavigate={navigate}
          onCommand={runCommand}
          onToggleWhere={toggleWhere}
          onHelp={openHelp}
          inspector={
            <AnimatePresence>
              {inspectedId && (
                <MemberInspector
                  key={inspectedId}
                  graph={graph}
                  memberId={inspectedId}
                  onClose={closeInspector}
                  onFocus={(id) => pick(id)}
                  onAction={(kind) => openAct(kind)}
                />
              )}
            </AnimatePresence>
          }
        />

        <Legend graph={graph} />
      </section>

      <section id="where" className="scroll-mt-24">
        <WhereAmIPanel graph={graph} showWhere={showWhere} onToggleWhere={toggleWhere} onFocus={(id, branchId) => pick(id, branchId)} />
      </section>

      <section id="branches" className="scroll-mt-24">
        <BranchesOverview graph={graph} extraBranches={extraBranches} onOpen={openBranch} onCreate={() => openAct("branch")} />
      </section>

      <section id="audit" className="scroll-mt-24">
        <AuditPanel entries={audit} onOpen={openAudit} onExport={exportCsv} />
      </section>

      <PhotoArchive />

      <FamilyNumbers graph={graph} />

      <Sayings />

      <AccessPanel onHelp={openHelp} />

      <section className="ny-card relative overflow-hidden p-7 sm:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="ny-eyebrow">S12 · Grow the tree</p>
            <h2 className="ny-title mt-3 text-3xl sm:text-5xl">Every new cousin is a new branch of light.</h2>
            <p className="mt-4 max-w-xl text-text-secondary">
              Invite a relative, welcome a newborn, or open a branch for a household that has moved. Everything is audited, and suggestions from
              members wait for approval.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <button type="button" onClick={() => openAct("invite")} className="ny-btn ny-btn-primary">
              <Plus className="size-4" aria-hidden />
              Invite a relative
            </button>
            <button type="button" onClick={() => openAct("add-child")} className="ny-btn ny-btn-gold">
              Welcome a newborn
            </button>
            <Link href="/dashboard/members" className="ny-btn ny-btn-ghost">
              <Users className="size-4" aria-hidden />
              Open the members directory
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <ActionDialog
        key={`${actKind ?? "none"}-${inspectedId ?? LAYOUT.root}`}
        kind={actKind}
        member={actMember}
        members={graph.members}
        nextAuditNo={audit.length + 1}
        onClose={closeAct}
        onSubmit={onSubmitAction}
      />
      <ShortcutsDialog open={helpOpen} onClose={closeHelp} />
      <AuditDialog entry={auditEntry} onClose={closeAudit} onApprove={approve} />

      <span className="sr-only" aria-live="polite">
        {elder ? "Elder Mode is on." : ""}
      </span>
    </div>
  );
}
