"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { usePrefs } from "@/components/shell/PrefsProvider";
import { useToast } from "@/components/ui/Toast";
import { BRANCHES } from "@/data/family/branches";
import { MEMBERS as INITIAL_MEMBERS } from "@/data/family/people";
import {
  FAMILY_ROLES,
  INITIAL_REQUESTS,
  INITIAL_ROLE_MAP,
  type AgeBand,
  type FamilyRole,
  type MemberRequest,
} from "@/data/dashboard/members";
import { ageOf, kes, maskPhone } from "@/lib/format";
import type { Member } from "@/types/family";
import { AddMemberLaunchpad, AddMemberWizard } from "@/views/dashboard/members/AddMemberWizard";
import { MemberDetailDrawer, type DrawerQuickAction } from "@/views/dashboard/members/MemberDetailDrawer";
import { MembersFilterBar, type MemberFilters } from "@/views/dashboard/members/MembersFilterBar";
import { MembersHeader } from "@/views/dashboard/members/MembersHeader";
import {
  AddRelationModal,
  AssignRoleModal,
  BulkBranchModal,
  BulkBroadcastModal,
  BulkImportWizard,
  EditMemberModal,
  ExportDirectoryModal,
  MemberQrModal,
  MergeDuplicatesWizard,
  MessageMemberModal,
  NewRequestModal,
  ReceiveLinkModal,
  RemoveMemberModal,
  ReviewRequestModal,
  SuspendMemberModal,
} from "@/views/dashboard/members/MembersModals";
import {
  DemographicsSection,
  EldersAndWardsSection,
  OperationsHub,
  PortraitShutterStudio,
  RequestsQueuePanel,
  RolesAccessPanel,
} from "@/views/dashboard/members/MembersPanels";
import { MembersTableAndGrid } from "@/views/dashboard/members/MembersTableAndGrid";

type ActiveModal =
  | null
  | { kind: "add-member" }
  | { kind: "edit-member"; memberId: string }
  | { kind: "assign-role"; memberId: string }
  | { kind: "receive-link"; memberId: string }
  | { kind: "message"; memberId: string }
  | { kind: "add-relation"; memberId: string }
  | { kind: "member-qr"; memberId: string }
  | { kind: "suspend"; memberId: string }
  | { kind: "remove"; memberId: string }
  | { kind: "review-request"; requestId: string }
  | { kind: "new-request" }
  | { kind: "bulk-broadcast"; ids: string[] }
  | { kind: "bulk-branch"; ids: string[] }
  | { kind: "bulk-import" }
  | { kind: "merge-duplicates" }
  | { kind: "export" };

const DEFAULT_FILTERS: MemberFilters = {
  query: "",
  branch: "all",
  gen: "all",
  role: "all",
  county: "all",
  ageBand: "all",
  hasLoan: false,
  saccoOnly: false,
  deceasedOnly: false,
  view: "table",
};

function nowEatLabel(): string {
  const d = new Date(Date.now() + 3 * 3600_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCHours())}:${p(d.getUTCMinutes())} EAT`;
}

/** T-3 · Members Directory — complete 11-section directory with 17 zero-reload overlays. */
export function MembersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { elder } = usePrefs();
  const { notify } = useToast();

  // Live frontend-only local directory state
  const [members, setMembers] = useState<Member[]>(() => INITIAL_MEMBERS);
  const [roleMap, setRoleMap] = useState<Record<string, FamilyRole>>(() => INITIAL_ROLE_MAP);
  const [requests, setRequests] = useState<MemberRequest[]>(() => INITIAL_REQUESTS);
  const [suspendedIds, setSuspendedIds] = useState<Set<string>>(() => new Set());
  const [recentIds, setRecentIds] = useState<Set<string>>(() => new Set());
  const [previewRole, setPreviewRole] = useState<FamilyRole>("Family Head");
  const [modal, setModal] = useState<ActiveModal>(null);
  const [activityLog, setActivityLog] = useState<Array<{ id: string; at: string; text: string }>>([
    { id: "act-1", at: "09:12 EAT", text: "Directory hydrated with 200 Nalyanya family records across 12 branches." },
    { id: "act-2", at: "09:05 EAT", text: "Mercy Auma Nalyanya submitted an OTP-gated payout phone update (NY-REQ-2026-0118)." },
    { id: "act-3", at: "Yesterday", text: "Joseph Wafula approved Ann Nekesa's elder PIN reset." },
  ]);

  const logEvent = useCallback((text: string) => {
    setActivityLog((prev) => [{ id: `act-${Date.now()}-${Math.random()}`, at: nowEatLabel(), text }, ...prev]);
  }, []);

  // URL-synced filters + deep-linked member drawer (?member=... or ?focus=...)
  const filters = useMemo<MemberFilters>(() => {
    const viewParam = searchParams.get("view");
    const ageParam = searchParams.get("age") as AgeBand | null;
    const validAge: AgeBand =
      ageParam === "minor" || ageParam === "youth" || ageParam === "adult" || ageParam === "elder" ? ageParam : "all";
    return {
      query: searchParams.get("q") ?? "",
      branch: searchParams.get("branch") ?? "all",
      gen: searchParams.get("gen") ?? "all",
      role: searchParams.get("role") ?? "all",
      county: searchParams.get("county") ?? "all",
      ageBand: validAge,
      hasLoan: searchParams.get("loan") === "1",
      saccoOnly: searchParams.get("sacco") === "1",
      deceasedOnly: searchParams.get("deceased") === "1",
      view: viewParam === "grid" ? "grid" : "table",
    };
  }, [searchParams]);

  const inspectedId = searchParams.get("member") ?? searchParams.get("focus") ?? null;

  const updateUrl = useCallback(
    (patch: Record<string, string | null>, mode: "push" | "replace" = "replace") => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === null || v === "" || v === "all" || v === "0") next.delete(k);
        else next.set(k, v);
      }
      const qs = next.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (mode === "push") router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const patchFilters = useCallback(
    (patch: Partial<MemberFilters>) => {
      const merged = { ...filters, ...patch };
      updateUrl({
        q: merged.query || null,
        branch: merged.branch === "all" ? null : merged.branch,
        gen: merged.gen === "all" ? null : merged.gen,
        role: merged.role === "all" ? null : merged.role,
        county: merged.county === "all" ? null : merged.county,
        age: merged.ageBand === "all" ? null : merged.ageBand,
        loan: merged.hasLoan ? "1" : null,
        sacco: merged.saccoOnly ? "1" : null,
        deceased: merged.deceasedOnly ? "1" : null,
        view: merged.view === "grid" ? "grid" : null,
      });
    },
    [filters, updateUrl],
  );

  const resetFilters = useCallback(() => {
    patchFilters(DEFAULT_FILTERS);
  }, [patchFilters]);

  const openMemberDrawer = useCallback(
    (id: string) => {
      updateUrl({ member: id, focus: null }, "push");
    },
    [updateUrl],
  );

  const closeMemberDrawer = useCallback(() => {
    updateUrl({ member: null, focus: null }, "replace");
  }, [updateUrl]);

  // Role lookup & active RBAC permissions (hidden-not-disabled)
  const roleOf = useCallback(
    (m: Member): FamilyRole => {
      if (roleMap[m.id]) return roleMap[m.id];
      if (m.ward || ageOf(m.birthYear, m.deathYear) < 18) return "Ward / Minor";
      return "Member";
    },
    [roleMap],
  );

  const activePermissions = useMemo(
    () => FAMILY_ROLES.find((r) => r.role === previewRole) ?? FAMILY_ROLES[0],
    [previewRole],
  );

  // Derived lists & stats
  const generations = useMemo(
    () => Array.from(new Set(members.map((m) => m.generation))).sort((a, b) => a - b),
    [members],
  );

  const counties = useMemo(
    () => Array.from(new Set(members.map((m) => m.county))).sort((a, b) => a.localeCompare(b)),
    [members],
  );

  const filteredMembers = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return members.filter((m) => {
      if (filters.branch !== "all" && m.branchId !== filters.branch) return false;
      if (filters.gen !== "all" && String(m.generation) !== filters.gen) return false;
      if (filters.role !== "all" && roleOf(m) !== filters.role) return false;
      if (filters.county !== "all" && m.county !== filters.county) return false;
      if (filters.hasLoan && m.activeLoans <= 0) return false;
      if (filters.saccoOnly && m.saccoShares <= 0) return false;
      if (filters.deceasedOnly && m.deathYear === undefined) return false;

      if (filters.ageBand !== "all") {
        const age = ageOf(m.birthYear, m.deathYear);
        if (filters.ageBand === "minor" && age >= 18) return false;
        if (filters.ageBand === "youth" && (age < 18 || age > 35)) return false;
        if (filters.ageBand === "adult" && (age < 36 || age > 64)) return false;
        if (filters.ageBand === "elder" && age < 65) return false;
      }

      if (q) {
        const hay = `${m.firstName} ${m.middleName ?? ""} ${m.lastName} ${m.preferredName} ${m.id} ${m.homeTown} ${m.county} ${m.profession}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [filters, members, roleOf]);

  const eldersCount = useMemo(
    () => members.filter((m) => m.deathYear === undefined && ageOf(m.birthYear) >= 65).length,
    [members],
  );
  const minorsCount = useMemo(
    () => members.filter((m) => m.ward || (m.deathYear === undefined && ageOf(m.birthYear) < 18)).length,
    [members],
  );
  const pendingRequestsCount = useMemo(
    () => requests.filter((r) => r.status === "pending").length,
    [requests],
  );

  const nextIdNumber = useMemo(() => {
    let max = 200;
    for (const m of members) {
      const n = Number(m.id.replace(/\D/g, ""));
      if (!Number.isNaN(n) && n > max) max = n;
    }
    return max + 1;
  }, [members]);

  const inspectedMember = inspectedId ? members.find((m) => m.id === inspectedId) ?? null : null;

  // Helpers to launch modal for any member
  const triggerMemberAction = useCallback((action: DrawerQuickAction, memberId: string) => {
    setModal({ kind: action, memberId });
  }, []);

  const memberForModal =
    modal && "memberId" in modal ? members.find((m) => m.id === modal.memberId) ?? null : null;

  const requestForModal =
    modal?.kind === "review-request" ? requests.find((r) => r.id === modal.requestId) ?? null : null;

  // Export CSV/JSON helper
  const runDownload = useCallback(
    (rows: Member[], format: "csv" | "json") => {
      let content = "";
      let mime = "text/csv;charset=utf-8";
      if (format === "csv") {
        const header = ["id", "name", "role", "generation", "branch", "age", "home", "county", "phone_masked", "sacco_shares", "wallet_kes"];
        const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
        const lines = rows.map((m) =>
          [
            m.id,
            `${m.preferredName} ${m.lastName}`,
            roleOf(m),
            m.generation,
            m.branchId,
            ageOf(m.birthYear, m.deathYear),
            m.homeTown,
            m.county,
            maskPhone(m.phone),
            m.saccoShares,
            m.walletKes,
          ]
            .map(esc)
            .join(","),
        );
        content = [header.join(","), ...lines].join("\n");
      } else {
        mime = "application/json;charset=utf-8";
        content = JSON.stringify(
          rows.map((m) => ({
            id: m.id,
            name: `${m.preferredName} ${m.lastName}`,
            role: roleOf(m),
            generation: m.generation,
            branchId: m.branchId,
            county: m.county,
            phone: maskPhone(m.phone),
            saccoShares: m.saccoShares,
            walletKes: m.walletKes,
          })),
          null,
          2,
        );
      }

      const url = URL.createObjectURL(new Blob([content], { type: mime }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `nalyanya-members-directory.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      logEvent(`Exported ${rows.length} members as ${format.toUpperCase()} (phones masked).`);
      notify({
        title: `Directory exported (${format.toUpperCase()})`,
        body: `${rows.length} family records downloaded cleanly.`,
        tone: "success",
      });
    },
    [logEvent, notify, roleOf],
  );

  const scrollToDirectory = () => {
    document.getElementById("directory")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-12 pb-8">
      {/* S1 — Hero & 5-KPI Row */}
      <MembersHeader
        totalMembers={members.length}
        branchCount={BRANCHES.length}
        generationCount={generations.length}
        eldersCount={eldersCount}
        minorsCount={minorsCount}
        pendingRequests={pendingRequestsCount}
        canAdmin={activePermissions.canEditMembers}
        onAddMember={() => setModal({ kind: "add-member" })}
        onBulkImport={() => setModal({ kind: "bulk-import" })}
        onMergeDuplicates={() => setModal({ kind: "merge-duplicates" })}
        onExport={() => setModal({ kind: "export" })}
        onQuickFilter={(kind) => {
          if (kind === "all") resetFilters();
          else if (kind === "elders") patchFilters({ ageBand: "elder" });
          else patchFilters({ ageBand: "minor" });
          scrollToDirectory();
        }}
      />

      {/* S2 + S3 — Filter Bar & TanStack Table / 3D Avatar Grid */}
      <section id="directory" className="scroll-mt-24 space-y-5">
        <div>
          <p className="ny-eyebrow">S2–S3 · Searchable family roll</p>
          <h2 className="ny-title mt-2 text-3xl sm:text-4xl">Directory table &amp; 3D avatar cards</h2>
          <p className="mt-2 max-w-2xl text-text-secondary">
            Sort any column, expand a row to peek at immediate relatives, select multiple rows for bulk actions, or switch to the 3D tilted
            avatar grid.
          </p>
        </div>

        <MembersFilterBar
          filters={filters}
          counties={counties}
          generations={generations}
          matchedCount={filteredMembers.length}
          totalCount={members.length}
          onPatch={patchFilters}
          onReset={resetFilters}
        />

        <MembersTableAndGrid
          members={filteredMembers}
          allMembers={members}
          roleOf={roleOf}
          suspendedIds={suspendedIds}
          recentIds={recentIds}
          view={filters.view}
          canEdit={activePermissions.canEditMembers}
          canAssignRole={activePermissions.canAssignRoles}
          canSendLink={activePermissions.canSendReceiveLinks}
          canRemove={activePermissions.canRemoveMembers}
          onInspect={openMemberDrawer}
          onAction={triggerMemberAction}
          onBulkBroadcast={(ids) => setModal({ kind: "bulk-broadcast", ids })}
          onBulkBranch={(ids) => setModal({ kind: "bulk-branch", ids })}
          onBulkExport={(ids) => {
            const set = new Set(ids);
            runDownload(
              members.filter((m) => set.has(m.id)),
              "csv",
            );
          }}
          onResetFilters={resetFilters}
        />
      </section>

      {/* S5 — Inline Add Member Launchpad */}
      <AddMemberLaunchpad
        canAdmin={activePermissions.canEditMembers}
        onOpenWizard={() => setModal({ kind: "add-member" })}
        onOpenRequest={() => setModal({ kind: "new-request" })}
      />

      {/* S6 — Roles & Access RBAC Panel */}
      <RolesAccessPanel
        members={members}
        roleOf={roleOf}
        previewRole={previewRole}
        onChangePreviewRole={(role) => {
          setPreviewRole(role);
          notify({
            title: `RBAC preview: ${role}`,
            body: "Unauthorized admin buttons are hidden (not disabled) to match Nalyanya's security rules.",
            tone: "info",
          });
        }}
        canAssignRole={activePermissions.canAssignRoles}
        onAssignForMember={(memberId) => setModal({ kind: "assign-role", memberId })}
      />

      {/* S7 — Member Requests Queue */}
      <RequestsQueuePanel
        requests={requests}
        canApprove={activePermissions.canApproveRequests}
        onReview={(req) => setModal({ kind: "review-request", requestId: req.id })}
        onNewRequest={() => setModal({ kind: "new-request" })}
      />

      {/* S8 — Camera Pinhole Portrait Studio (Shutter Transition Reel) */}
      <PortraitShutterStudio onInspectMember={openMemberDrawer} />

      {/* S9 — Elders Council (65+) & Minors/Wards Guardianship */}
      <EldersAndWardsSection
        members={members}
        canSendLink={activePermissions.canSendReceiveLinks}
        onInspect={openMemberDrawer}
        onReceiveLink={(memberId) => setModal({ kind: "receive-link", memberId })}
        onMessage={(memberId) => setModal({ kind: "message", memberId })}
      />

      {/* S10 — Generation, County & Diaspora Demographics Explorer */}
      <DemographicsSection
        members={members}
        onFilterCounty={(county) => {
          patchFilters({ county });
          scrollToDirectory();
        }}
        onFilterGen={(gen) => {
          patchFilters({ gen: String(gen) });
          scrollToDirectory();
        }}
      />

      {/* S11 — Directory Operations Hub */}
      <OperationsHub
        canAdmin={activePermissions.canEditMembers}
        activityLog={activityLog}
        onBulkImport={() => setModal({ kind: "bulk-import" })}
        onMergeDuplicates={() => setModal({ kind: "merge-duplicates" })}
        onExport={() => setModal({ kind: "export" })}
        onNewRequest={() => setModal({ kind: "new-request" })}
      />

      {/* ─── S4 · MEMBER DETAIL DRAWER (6 tabs, deep-linkable ?member=...) ─── */}
      <MemberDetailDrawer
        key={inspectedMember?.id ?? "drawer-none"}
        member={inspectedMember}
        members={members}
        role={inspectedMember ? roleOf(inspectedMember) : "Member"}
        suspended={inspectedMember ? suspendedIds.has(inspectedMember.id) : false}
        canEdit={activePermissions.canEditMembers}
        canAssignRole={activePermissions.canAssignRoles}
        canSendLink={activePermissions.canSendReceiveLinks}
        canViewPhone={activePermissions.canViewPhones}
        onClose={closeMemberDrawer}
        onSelectMember={openMemberDrawer}
        onAction={triggerMemberAction}
      />

      {/* ─── 16+ MODALS & MULTI-STEP WIZARDS (zero page reload) ─── */}

      <AddMemberWizard
        open={modal?.kind === "add-member"}
        members={members}
        nextIdNumber={nextIdNumber}
        onClose={() => setModal(null)}
        onCreate={(created, accessRole) => {
          setMembers((prev) => [created, ...prev]);
          setRoleMap((prev) => ({ ...prev, [created.id]: accessRole }));
          setRecentIds((prev) => new Set(prev).add(created.id));
          setModal(null);
          logEvent(`Added ${created.preferredName} ${created.lastName} (${created.id}) as ${accessRole}.`);
          notify({
            title: `${created.preferredName} ${created.lastName} joined the directory`,
            body: `Assigned ${created.id} · row highlighted at the top of the table.`,
            tone: "success",
          });
          scrollToDirectory();
        }}
      />

      <EditMemberModal
        key={modal?.kind === "edit-member" ? modal.memberId : "edit-none"}
        member={modal?.kind === "edit-member" ? memberForModal : null}
        onClose={() => setModal(null)}
        onSave={(memberId, patch, reason) => {
          setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, ...patch } : m)));
          setRecentIds((prev) => new Set(prev).add(memberId));
          setModal(null);
          logEvent(`Updated profile for ${memberId} (${reason}).`);
          notify({ title: "Profile updated", body: `Logged to audit trail: “${reason}”.`, tone: "success" });
        }}
      />

      <AssignRoleModal
        key={modal?.kind === "assign-role" ? modal.memberId : "role-none"}
        member={modal?.kind === "assign-role" ? memberForModal : null}
        currentRole={modal?.kind === "assign-role" && memberForModal ? roleOf(memberForModal) : "Member"}
        onClose={() => setModal(null)}
        onAssign={(memberId, newRole) => {
          setRoleMap((prev) => ({ ...prev, [memberId]: newRole }));
          setModal(null);
          logEvent(`Assigned RBAC role “${newRole}” to ${memberId} (2FA simulated).`);
          notify({ title: "Role updated", body: `${memberId} is now ${newRole} (2FA SIMULATED).`, tone: "success" });
        }}
      />

      <ReceiveLinkModal
        key={modal?.kind === "receive-link" ? modal.memberId : "link-none"}
        member={modal?.kind === "receive-link" ? memberForModal : null}
        onClose={() => setModal(null)}
        onIssued={(member, amount, token) => {
          setModal(null);
          logEvent(`Issued elder receive link ${token} (${kes(amount)}) for ${member.preferredName} (SIMULATED).`);
          notify({
            title: "Elder receive link ready (SIMULATED)",
            body: `${kes(amount)} link /r/${token} prepared for ${member.preferredName}. Connects to M-Pesa B2C when backend is wired.`,
            tone: "success",
          });
        }}
      />

      <MessageMemberModal
        key={modal?.kind === "message" ? modal.memberId : "msg-none"}
        member={modal?.kind === "message" ? memberForModal : null}
        onClose={() => setModal(null)}
        onSend={(member, channel) => {
          setModal(null);
          logEvent(`Queued ${channel} message to ${member.preferredName} ${member.lastName} (SIMULATED).`);
          notify({
            title: `Ready via ${channel} (SIMULATED)`,
            body: `Message to ${member.preferredName} connects to ${channel} API when the backend is wired.`,
            tone: "info",
          });
        }}
      />

      <AddRelationModal
        key={modal?.kind === "add-relation" ? modal.memberId : "rel-none"}
        member={modal?.kind === "add-relation" ? memberForModal : null}
        members={members}
        onClose={() => setModal(null)}
        onLink={(member, relationType, targetName) => {
          setModal(null);
          logEvent(`Linked ${targetName} as ${relationType} of ${member.preferredName} ${member.lastName}.`);
          notify({
            title: "Family relation linked",
            body: `${targetName} recorded as ${relationType} of ${member.preferredName} (audit logged).`,
            tone: "success",
          });
        }}
      />

      <MemberQrModal
        member={modal?.kind === "member-qr" ? memberForModal : null}
        role={modal?.kind === "member-qr" && memberForModal ? roleOf(memberForModal) : "Member"}
        onClose={() => setModal(null)}
        onCopy={(text) => {
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            void navigator.clipboard.writeText(text);
          }
          notify({ title: "Deep link copied", body: text, tone: "success" });
        }}
      />

      <SuspendMemberModal
        key={modal?.kind === "suspend" ? modal.memberId : "susp-none"}
        member={modal?.kind === "suspend" ? memberForModal : null}
        isSuspended={modal?.kind === "suspend" ? suspendedIds.has(modal.memberId) : false}
        onClose={() => setModal(null)}
        onConfirm={(memberId, reason) => {
          const was = suspendedIds.has(memberId);
          setSuspendedIds((prev) => {
            const next = new Set(prev);
            if (was) next.delete(memberId);
            else next.add(memberId);
            return next;
          });
          setModal(null);
          logEvent(`${was ? "Restored" : "Suspended"} ${memberId}: ${reason}`);
          notify({
            title: was ? "Member restored" : "Member suspended",
            body: `Reason recorded: ${reason}`,
            tone: was ? "success" : "warning",
          });
        }}
      />

      <RemoveMemberModal
        key={modal?.kind === "remove" ? modal.memberId : "rem-none"}
        member={modal?.kind === "remove" ? memberForModal : null}
        onClose={() => setModal(null)}
        onConfirm={(memberId, reason) => {
          const target = members.find((m) => m.id === memberId);
          setMembers((prev) => prev.filter((m) => m.id !== memberId));
          if (inspectedId === memberId) closeMemberDrawer();
          setModal(null);
          logEvent(`Removed ${target ? `${target.preferredName} ${target.lastName}` : memberId} (${reason}).`);
          notify({ title: "Member removed", body: `Audit entry saved: ${reason}`, tone: "warning" });
        }}
      />

      <ReviewRequestModal
        key={modal?.kind === "review-request" ? modal.requestId : "req-none"}
        request={requestForModal}
        canApprove={activePermissions.canApproveRequests}
        onClose={() => setModal(null)}
        onDecide={(id, status, note) => {
          setRequests((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status, decidedBy: `${previewRole} (${note})` } : r)),
          );
          setModal(null);
          logEvent(`${status === "approved" ? "Approved" : "Rejected"} request ${id}: ${note}`);
          notify({
            title: status === "approved" ? "Request approved & applied" : "Request rejected",
            body: `${id} updated in queue (SIMULATED).`,
            tone: status === "approved" ? "success" : "info",
          });
        }}
      />

      <NewRequestModal
        open={modal?.kind === "new-request"}
        members={members}
        onClose={() => setModal(null)}
        onCreate={(req) => {
          setRequests((prev) => [req, ...prev]);
          setModal(null);
          logEvent(`Submitted change request ${req.id} for ${req.memberName}.`);
          notify({ title: "Request added to queue", body: `${req.id} is waiting for Family Head approval.`, tone: "success" });
        }}
      />

      <BulkBroadcastModal
        open={modal?.kind === "bulk-broadcast"}
        recipients={
          modal?.kind === "bulk-broadcast"
            ? members.filter((m) => modal.ids.includes(m.id))
            : []
        }
        onClose={() => setModal(null)}
        onSend={(count, channel) => {
          setModal(null);
          logEvent(`Dispatched SIMULATED broadcast via ${channel} to ${count} selected members.`);
          notify({
            title: `Broadcast queued for ${count} members (SIMULATED)`,
            body: `Channel routing (${channel}) connects when Africa's Talking / WhatsApp Cloud are wired.`,
            tone: "success",
          });
        }}
      />

      <BulkBranchModal
        open={modal?.kind === "bulk-branch"}
        count={modal?.kind === "bulk-branch" ? modal.ids.length : 0}
        onClose={() => setModal(null)}
        onTransfer={(branchId, reason) => {
          if (modal?.kind !== "bulk-branch") return;
          const set = new Set(modal.ids);
          setMembers((prev) => prev.map((m) => (set.has(m.id) ? { ...m, branchId } : m)));
          setModal(null);
          const bName = BRANCHES.find((b) => b.id === branchId)?.name ?? branchId;
          logEvent(`Transferred ${modal.ids.length} members to ${bName} (${reason}).`);
          notify({ title: "Branch transfer complete", body: `${modal.ids.length} members moved to ${bName}.`, tone: "success" });
        }}
      />

      <BulkImportWizard
        open={modal?.kind === "bulk-import"}
        nextIdNumber={nextIdNumber}
        onClose={() => setModal(null)}
        onImport={(created) => {
          setMembers((prev) => [...created, ...prev]);
          setRecentIds((prev) => {
            const next = new Set(prev);
            for (const c of created) next.add(c.id);
            return next;
          });
          setModal(null);
          logEvent(`Imported ${created.length} relatives via CSV wizard.`);
          notify({
            title: `${created.length} relatives imported`,
            body: "New rows added to the top of the directory table.",
            tone: "success",
          });
          scrollToDirectory();
        }}
      />

      <MergeDuplicatesWizard
        open={modal?.kind === "merge-duplicates"}
        members={members}
        onClose={() => setModal(null)}
        onMerge={(primaryId, duplicateId) => {
          const dup = members.find((m) => m.id === duplicateId);
          setMembers((prev) =>
            prev
              .filter((m) => m.id !== duplicateId)
              .map((m) =>
                m.id === primaryId && dup
                  ? { ...m, walletKes: m.walletKes + dup.walletKes, saccoShares: m.saccoShares + dup.saccoShares }
                  : m,
              ),
          );
          setModal(null);
          logEvent(`Merged duplicate ${duplicateId} into ${primaryId}.`);
          notify({
            title: "Duplicate merged cleanly",
            body: `${duplicateId} folded into ${primaryId}; shares and wallet preserved.`,
            tone: "success",
          });
        }}
      />

      <ExportDirectoryModal
        open={modal?.kind === "export"}
        filteredCount={filteredMembers.length}
        totalCount={members.length}
        onClose={() => setModal(null)}
        onExport={(format, scope) => {
          setModal(null);
          runDownload(scope === "filtered" ? filteredMembers : members, format);
        }}
      />

      <span className="sr-only" aria-live="polite">
        {elder ? "Elder Mode active on Members Directory." : ""}
      </span>
    </div>
  );
}
