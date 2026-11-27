import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, Plus, ScrollText, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useWorkspace } from "@/state/Workspace";
import {
  CAUSES,
  CONTRIBUTIONS,
  causeById,
  type Cause,
  type Contribution,
} from "@/data/dashboard/contributions";
import { ContributionHero } from "./components/ContributionHero";
import { CauseCards } from "./components/CauseCards";
import type { CauseFilters } from "@/data/dashboard/contributions";
import { CauseDrawer } from "./components/CauseDrawer";
import { ContributeWizard } from "./components/ContributeWizard";
import { ContributionsTable } from "./components/ContributionsTable";
import { CreateCauseWizard } from "./components/CreateCauseWizard";
import { PayoutReconciliation } from "./components/PayoutReconciliation";
import {
  ContributionOverlays,
  type ContributionOverlaysProps,
} from "./components/ContributionOverlays";
import "./contributions.css";

/* ═══════════════════════════════════════════════════════════════════════
   T-7 · CONTRIBUTIONS — the family's giving hub
   Seven sections, one page, no reloads. Every overlay writes to the URL
   so a cause can be shared, reloaded, or handed to a relative exactly
   as it was left.
   ═══════════════════════════════════════════════════════════════════════ */

export default function ContributionsPage() {
  const w = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const params = (location.search ?? {}) as Record<string, string | undefined>;

  /* ── Local, browser-only state ─────────────────────────────────────── */
  const [contribs, setContribs] = useState<Contribution[]>(CONTRIBUTIONS);

  /* URL-backed filters */
  const filters: CauseFilters = useMemo(
    () => ({
      purpose: (params.purpose as CauseFilters["purpose"]) ?? "all",
      status: (params.status as CauseFilters["status"]) ?? "all",
      q: params.q ?? "",
    }),
    [params.purpose, params.status, params.q],
  );

  const visible = useMemo(() => {
    const term = filters.q.trim().toLowerCase();
    return CAUSES.filter((c) => {
      if (filters.purpose !== "all" && c.purpose !== filters.purpose) return false;
      if (filters.status !== "all" && c.status !== filters.status) return false;
      if (term) {
        const hay = `${c.title} ${c.purposeLabel} ${c.beneficiary} ${c.description} ${c.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [CAUSES, filters]);

  const openCauses = CAUSES.filter((c) => c.status === "open").length;
  const totalRaised = CAUSES.reduce((s, c) => s + c.raised, 0);
  const causesYouBenefit = CAUSES.filter((c) => c.payoutStatus === "queued").length;

  const setFilters = useCallback(
    (patch: Partial<CauseFilters>) => {
      void navigate({
        to: "/dashboard/contributions",
        search: (prev: Record<string, string | undefined>) => ({ ...prev, ...patch }),
        replace: true,
      });
    },
    [navigate],
  );

  const openCauseById = useCallback(
    (id: string) => {
      void navigate({
        to: "/dashboard/contributions",
        search: (prev: Record<string, string | undefined>) => ({
          ...prev,
          cause: id,
          act: undefined,
          target: undefined,
        }),
        replace: false,
      });
    },
    [navigate],
  );

  const closeCause = useCallback(() => {
    void navigate({
      to: "/dashboard/contributions",
      search: (prev: Record<string, string | undefined>) => ({ ...prev, cause: undefined }),
      replace: true,
    });
  }, [navigate]);

  const openOverlay = useCallback(
    (act: string, target?: string) => {
      void navigate({
        to: "/dashboard/contributions",
        search: (prev: Record<string, string | undefined>) => ({ ...prev, act, target }),
        replace: false,
      });
    },
    [navigate],
  );

  const closeOverlay = useCallback(() => {
    void navigate({
      to: "/dashboard/contributions",
      search: (prev: Record<string, string | undefined>) => ({
        ...prev,
        act: undefined,
        target: undefined,
      }),
      replace: true,
    });
  }, [navigate]);

  /* ── The open cause ────────────────────────────────────────────────── */
  const openId = params.cause;
  const resolvedCause = openId ? CAUSES.find((c) => c.id === openId) : undefined;

  /* ── The open overlay ──────────────────────────────────────────────── */
  const act = params.act ?? "";

  /* ── Actions ───────────────────────────────────────────────────────── */

  const contribute = (payload: {
    causeId: string;
    amount: number;
    channel: string;
    message?: string;
  }) => {
    const cause = CAUSES.find((c) => c.id === payload.causeId);
    const record: Contribution = {
      id: `NY-CON-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      causeId: payload.causeId,
      member: "You (this device)",
      purpose: cause?.purpose ?? "emergency",
      amount: payload.amount,
      channel: payload.channel as any,
      channelLabel: (() => {
        const map: Record<string, string> = {
          mpesa: "M-Pesa",
          airtel: "Airtel Money",
          bank: "Bank",
          internal: "Family ledger",
        };
        return map[payload.channel] ?? "M-Pesa";
      })(),
      status: "confirmed",
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      ledgerRef: `NY-LED-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    };
    setContribs((list) => [record, ...list]);
    w.setToast(
      `Contribution of KES ${payload.amount.toLocaleString("en-KE")} recorded — Ready — connects when the backend is wired.`,
    );
    closeOverlay();
    if (cause) openCauseById(cause.id);
  };

  const createCause = (causeData: {
    title: string;
    purpose: string;
    beneficiary: string;
    goal: number;
    deadline: string;
    scope: string;
    payoutDestination: string;
    description: string;
  }) => {
    w.setToast(
      `Cause "${causeData.title}" created on this device — Ready — connects when the backend is wired.`,
    );
    closeOverlay();
  };

  const releasePayout = () => {
    w.setToast("Payout released — SIMULATED, not sent.");
    closeOverlay();
  };

  const share = async (id: string) => {
    const url = `${window.location.origin}/dashboard/contributions?cause=${id}`;
    try {
      await navigator.clipboard.writeText(url);
      w.setToast("The cause link is copied.");
    } catch {
      w.setToast("Copy this link: " + url);
    }
  };

  return (
    <div className="page-dash-contributions">
      <nav className="ny-give-crumbs" aria-label="Breadcrumb">
        <Link to="/dashboard" search={{ branch: w.query.branch }}>
          <ArrowLeft size={13} aria-hidden />
          Command center
        </Link>
        <span aria-hidden>/</span>
        <span>Family contributions</span>
        <span className="ny-give-crumbs-spacer" />
        <button
          type="button"
          className="ny-btn ny-btn-ghost ny-btn-sm"
          onClick={() => openOverlay("ledger-export")}
        >
          <ScrollText size={14} aria-hidden />
          Export ledger
        </button>
        <button
          type="button"
          className="ny-btn ny-btn-primary ny-btn-sm"
          onClick={() => openOverlay("contribute")}
        >
          <Plus size={14} aria-hidden />
          Contribute
        </button>
      </nav>

      {/* ── S1 · Contribution hero / KPI row ── */}
      <ContributionHero
        causes={CAUSES}
        onContribute={() => openOverlay("contribute")}
        calm={w.reduced}
      />

      {/* ── S2 · Causes grid ── */}
      <CauseCards
        causes={CAUSES}
        filters={filters}
        onChange={setFilters}
        onContribute={(cause) => {
          openCauseById(cause.id);
        }}
        onOpen={(cause) => {
          openCauseById(cause.id);
          openOverlay("cause-detail", cause.id);
        }}
        calm={w.reduced}
      />

      {/* ── S3 · Contribute wizard ── */}
      {act === "contribute" || act === "contribution-confirm" ? (
        <ContributeWizard
          open={true}
          onClose={closeOverlay}
          causes={CAUSES.map((c) => ({ id: c.id, title: c.title }))}
          onContribute={contribute}
        />
      ) : null}

      {/* ── S4 · Contributions table ── */}
      <ContributionsTable
        contributions={contribs}
        causes={CAUSES}
        onOpen={(cause) => {
          openCauseById(cause.id);
        }}
      />

      {/* ── S5 · Cause detail drawer ── */}
      {resolvedCause ? (
        <CauseDrawer
          cause={resolvedCause}
          onClose={closeCause}
          onContribute={(c) => {
            closeCause();
            openOverlay("contribute", c.id);
          }}
          calm={w.reduced}
        />
      ) : null}

      {/* ── S6 · Create cause wizard ── */}
      {act === "create-cause" ? (
        <CreateCauseWizard
          open={true}
          onClose={closeOverlay}
          onCreate={createCause}
        />
      ) : null}

      {/* ── S7 · Payout & reconciliation ── */}
      <PayoutReconciliation
        causes={CAUSES.map((c) => ({ id: c.id, title: c.title }))}
      />

      <p className="ny-give-footnote">
        <ShieldCheck size={13} aria-hidden />
        Contributions are recorded on the family ledger and reconciled against
        M-Pesa statements · every change is audited ·{" "}
        <button
          type="button"
          className="ny-text-link"
          onClick={() => openOverlay("mpesa-import")}
        >
          import an M-Pesa statement
        </button>
      </p>

      {/* ── Overlays (only render when open — no sticky backdrops) ── */}
      <ContributionOverlays
        openContribute={false}
        onContributeClose={closeOverlay}
        openReceipt={act === "receipt"}
        onReceiptClose={closeOverlay}
        openVerify={act === "verify"}
        onVerifyClose={closeOverlay}
        onVerify={() => {
          w.setToast("Contribution verified — SIMULATED.");
          closeOverlay();
        }}
        openFailed={act === "failed"}
        onFailedClose={closeOverlay}
        onRetry={() => {
          w.setToast("Payment retry prepared — SIMULATED.");
          closeOverlay();
        }}
        openCauseDetail={false}
        onCauseDetailClose={closeOverlay}
        openPayout={act === "payout"}
        onPayoutClose={closeOverlay}
        onRelease={releasePayout}
        openBroadcast={act === "broadcast"}
        onBroadcastClose={closeOverlay}
        onBroadcast={(channel) => {
          w.setToast(`Broadcast prepared for ${channel} — SIMULATED, not sent.`);
          closeOverlay();
        }}
        openCauseDelete={act === "cause-delete"}
        onCauseDeleteClose={closeOverlay}
        onDelete={() => {
          w.setToast("Cause archived — SIMULATED.");
          closeOverlay();
        }}
        openCausePublish={false}
        onCausePublishClose={closeOverlay}
        onPublish={() => {
          w.setToast("Cause published — SIMULATED.");
          closeOverlay();
        }}
        openMpesaImport={act === "mpesa-import"}
        onMpesaImportClose={closeOverlay}
        onImport={() => {
          w.setToast("M-Pesa statement import prepared — SIMULATED.");
          closeOverlay();
        }}
        openLedgerExport={act === "ledger-export"}
        onLedgerExportClose={closeOverlay}
        onExport={() => {
          w.setToast("Ledger export prepared — SIMULATED.");
          closeOverlay();
        }}
        openContributionEdit={act === "contribution-edit"}
        onContributionEditClose={closeOverlay}
        onSaveEdit={() => {
          w.setToast("Contribution edited — SIMULATED.");
          closeOverlay();
        }}
        openCauseArchive={act === "cause-archive"}
        onCauseArchiveClose={closeOverlay}
        onArchive={() => {
          w.setToast("Cause archived — SIMULATED.");
          closeOverlay();
        }}
        openEmergencyRelease={act === "emergency-release"}
        onEmergencyReleaseClose={closeOverlay}
        onEmergencyRelease={() => {
          w.setToast("Emergency release recorded — SIMULATED.");
          closeOverlay();
        }}
        openContributionConfirm={act === "contribution-confirm"}
        onContributionConfirmClose={closeOverlay}
        onConfirmContribute={(amount) => {
          w.setToast(`KES ${amount.toLocaleString("en-KE")} contribution confirmed — SIMULATED.`);
          closeOverlay();
        }}
      />

      <span className="sr-only" aria-live="polite">
        {resolvedCause ? `The cause ${resolvedCause.title} is open.` : ""}
      </span>
    </div>
  );
}
