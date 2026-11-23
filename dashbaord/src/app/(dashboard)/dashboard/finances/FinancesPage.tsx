import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, Plus, ScrollText, ShieldCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useWorkspace } from "@/state/Workspace";
import {
  CHAMAS,
  chamaById,
  type Chama,
  type ChamaFilters,
} from "@/data/dashboard/finances";
import { FinanceHero } from "./components/FinanceHero";
import { ChamaCards } from "./components/ChamaCards";
import { SaccoPanel } from "./components/SaccoPanel";
import { FinanceTransactions } from "./components/FinanceTransactions";
import { ChamaDrawer } from "./components/ChamaDrawer";
import { CreateChamaWizard } from "./components/CreateChamaWizard";
import { GovernanceAudit } from "./components/GovernanceAudit";
import { FinanceOverlays } from "./components/FinanceOverlays";
import "./finances.css";

/* ══════════════════════════════════════════════════════════════════════
   T-8 · FINANCES — the family's money engine
   Seven sections, one page, no reloads. Every overlay writes to the URL
   so a chama can be shared, reloaded, or handed to a relative exactly
   as it was left.
   ══════════════════════════════════════════════════════════════════════ */

export default function FinancesPage() {
  const w = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const params = (location.search ?? {}) as Record<string, string | undefined>;

  /* ── Local, browser-only state ───────────────────────────────────── */
  const [txnFilters, setTxnFilters] = useState<{
    type: "all" | string;
    status: "all" | string;
    q: string;
  }>({ type: "all", status: "all", q: "" });

  /* URL-backed filters for chama grid */
  const filters: ChamaFilters = useMemo(
    () => ({
      status: (params.status as ChamaFilters["status"]) ?? "all",
      cadence: (params.cadence as ChamaFilters["cadence"]) ?? "all",
      q: params.q ?? "",
    }),
    [params.status, params.cadence, params.q],
  );

  const visible = useMemo(() => {
    const term = filters.q.trim().toLowerCase();
    return CHAMAS.filter((c) => {
      if (filters.status !== "all" && c.status !== filters.status) return false;
      if (filters.cadence !== "all" && c.cadence !== filters.cadence) return false;
      if (term) {
        const hay = `${c.name} ${c.purpose} ${c.recipient}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [CHAMAS, filters]);

  const activeChamas = CHAMAS.filter((c) => c.status === "active").length;
  const totalPool = CHAMAS.reduce((s, c) => s + c.pool, 0);
  const totalSharesValue = CHAMAS.reduce((s, c) => s + c.pool, 0); // placeholder, real calc in SaccoPanel

  const setFilters = useCallback(
    (patch: Partial<ChamaFilters>) => {
      void navigate({
        to: "/dashboard/finances",
        search: (prev: Record<string, string | undefined>) => ({ ...prev, ...patch }),
        replace: true,
      });
    },
    [navigate],
  );

  const openChamaById = useCallback(
    (id: string) => {
      void navigate({
        to: "/dashboard/finances",
        search: (prev: Record<string, string | undefined>) => ({
          ...prev,
          chama: id,
          act: undefined,
          target: undefined,
        }),
        replace: false,
      });
    },
    [navigate],
  );

  const closeChama = useCallback(() => {
    void navigate({
      to: "/dashboard/finances",
      search: (prev: Record<string, string | undefined>) => ({ ...prev, chama: undefined }),
      replace: true,
    });
  }, [navigate]);

  const openOverlay = useCallback(
    (act: string, target?: string) => {
      void navigate({
        to: "/dashboard/finances",
        search: (prev: Record<string, string | undefined>) => ({ ...prev, act, target }),
        replace: false,
      });
    },
    [navigate],
  );

  const closeOverlay = useCallback(() => {
    void navigate({
      to: "/dashboard/finances",
      search: (prev: Record<string, string | undefined>) => ({
        ...prev,
        act: undefined,
        target: undefined,
      }),
      replace: true,
    });
  }, [navigate]);

  /* ── The open chama ──────────────────────────────────────────────── */
  const openId = params.chama;
  const resolvedChama = openId ? CHAMAS.find((c) => c.id === openId) : undefined;

  /* ── The open overlay ────────────────────────────────────────────── */
  const act = params.act ?? "";

  /* ── Actions ─────────────────────────────────────────────────────── */

  const deposit = (payload: {
    chamaId: string;
    amount: number;
    channel: string;
    message?: string;
  }) => {
    const chama = CHAMAS.find((c) => c.id === payload.chamaId);
    w.setToast(
      `Deposit of KES ${payload.amount.toLocaleString("en-KE")} to ${chama?.name ?? "family wallet"} — SIMULATED.`,
    );
    closeOverlay();
    if (chama) openChamaById(chama.id);
  };

  const createChama = (chamaData: {
    name: string;
    purpose: string;
    cadence: string;
    contributionKes: number;
    members: number;
  }) => {
    w.setToast(
      `Chama "${chamaData.name}" created on this device — Ready — connects when the backend is wired.`,
    );
    closeOverlay();
  };

  const chamaDeposit = (chama: Chama, amount: number) => {
    w.setToast(
      `Deposit of KES ${amount.toLocaleString("en-KE")} to ${chama.name} — SIMULATED.`,
    );
    closeOverlay();
    openChamaById(chama.id);
  };

  const sharePurchase = (member: string, shares: number) => {
    w.setToast(
      `Purchased ${shares} shares for ${member} — SIMULATED.`,
    );
    closeOverlay();
  };

  const loanRequest = (member: string, amount: number, purpose: string) => {
    w.setToast(
      `Loan request of KES ${amount.toLocaleString("en-KE")} for ${member} — SIMULATED.`,
    );
    closeOverlay();
  };

  const payoutRelease = (chamaId: string, amount: number) => {
    w.setToast(
      `Payout of KES ${amount.toLocaleString("en-KE")} released — SIMULATED.`,
    );
    closeOverlay();
  };

  const broadcast = (channel: string, message: string) => {
    w.setToast(`Broadcast prepared for ${channel} — SIMULATED, not sent.`);
    closeOverlay();
  };

  const deleteChama = (chamaId: string) => {
    w.setToast("Chama archived — SIMULATED.");
    closeOverlay();
  };

  const publishChama = (chamaId: string) => {
    w.setToast("Chama published — SIMULATED.");
    closeOverlay();
  };

  const mpesaImport = () => {
    w.setToast("M-Pesa statement import prepared — SIMULATED.");
    closeOverlay();
  };

  const ledgerExport = () => {
    w.setToast("Ledger export prepared — SIMULATED.");
    closeOverlay();
  };

  const transactionEdit = (txnId: string, note: string) => {
    w.setToast("Transaction edited — SIMULATED.");
    closeOverlay();
  };

  const archiveChama = (chamaId: string) => {
    w.setToast("Chama archived — SIMULATED.");
    closeOverlay();
  };

  const emergencyPayout = (chamaId: string, amount: number) => {
    w.setToast(`Emergency payout of KES ${amount.toLocaleString("en-KE")} recorded — SIMULATED.`);
    closeOverlay();
  };

  const share = async (id: string) => {
    const url = `${window.location.origin}/dashboard/finances?chama=${id}`;
    try {
      await navigator.clipboard.writeText(url);
      w.setToast("The chama link is copied.");
    } catch {
      w.setToast("Copy this link: " + url);
    }
  };

  return (
    <div className="page-dash-finances">
      <nav className="ny-fin-crumbs" aria-label="Breadcrumb">
        <Link to="/dashboard" search={{ branch: w.query.branch }}>
          <ArrowLeft size={13} aria-hidden />
          Command center
        </Link>
        <span className="ny-fin-crumb-divider" aria-hidden>/</span>
        <span>Family finances</span>
        <span className="ml-auto" />
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
          onClick={() => openOverlay("deposit")}
        >
          <Plus size={14} aria-hidden />
          Deposit
        </button>
      </nav>

      {/* ── S1 · Finance hero / KPI row ── */}
      <FinanceHero
        onDeposit={() => openOverlay("deposit")}
        onCreateChama={() => openOverlay("create-chama")}
        calm={w.reduced}
      />

      {/* ── S2 · Chama cards ── */}
      <ChamaCards
        chamas={CHAMAS}
        filters={filters}
        onChange={setFilters}
        onDeposit={(chama) => {
          openOverlay("chama-deposit", chama.id);
        }}
        onOpen={(chama) => {
          openChamaById(chama.id);
        }}
        calm={w.reduced}
      />

      {/* ── S3 · Sacco panel ── */}
      <SaccoPanel
        onViewShares={() => openOverlay("share-purchase")}
        calm={w.reduced}
      />

      {/* ── S4 · Finance transactions ── */}
      <FinanceTransactions
        onExport={ledgerExport}
        onNewTransaction={() => openOverlay("transaction-detail")}
        calm={w.reduced}
      />

      {/* ── S5 · Chama detail drawer ── */}
      {resolvedChama ? (
        <ChamaDrawer
          chama={resolvedChama}
          onClose={closeChama}
          onDeposit={(c) => {
            closeChama();
            openOverlay("chama-deposit", c.id);
          }}
          calm={w.reduced}
        />
      ) : null}

      {/* ── S6 · Create chama wizard ── */}
      {act === "create-chama" ? (
        <CreateChamaWizard
          open={true}
          onClose={closeOverlay}
          onCreate={createChama}
        />
      ) : null}

      {/* ── S7 · Governance & audit ── */}
      <GovernanceAudit
        onViewAudit={() => openOverlay("transaction-detail")}
        calm={w.reduced}
      />

      <p className="ny-fin-footnote">
        <ShieldCheck size={13} aria-hidden />
        Chama rotations, Sacco shares and payouts are recorded on the family
        ledger and reconciled against M-Pesa statements · every change is
        audited ·{" "}
        <button
          type="button"
          className="ny-fin-link"
          onClick={() => openOverlay("mpesa-import")}
        >
          import an M-Pesa statement
        </button>
      </p>

      {/* ── Overlays (only render when open — no sticky backdrops) ── */}
      <FinanceOverlays
        openDeposit={act === "deposit"}
        onDepositClose={closeOverlay}
        onDeposit={deposit}
        openCreateChama={act === "create-chama"}
        onCreateChamaClose={closeOverlay}
        onCreateChama={createChama}
        openChamaDeposit={act === "chama-deposit"}
        onChamaDepositClose={closeOverlay}
        onChamaDeposit={chamaDeposit}
        openSharePurchase={act === "share-purchase"}
        onSharePurchaseClose={closeOverlay}
        onSharePurchase={sharePurchase}
        openLoanRequest={act === "loan-request"}
        onLoanRequestClose={closeOverlay}
        onLoanRequest={loanRequest}
        openTransactionDetail={act === "transaction-detail"}
        onTransactionDetailClose={closeOverlay}
        openPayoutRelease={act === "payout-release"}
        onPayoutReleaseClose={closeOverlay}
        onPayoutRelease={payoutRelease}
        openBroadcast={act === "broadcast"}
        onBroadcastClose={closeOverlay}
        onBroadcast={broadcast}
        openChamaDelete={act === "chama-delete"}
        onChamaDeleteClose={closeOverlay}
        onChamaDelete={deleteChama}
        openChamaPublish={act === "chama-publish"}
        onChamaPublishClose={closeOverlay}
        onChamaPublish={publishChama}
        openMpesaImport={act === "mpesa-import"}
        onMpesaImportClose={closeOverlay}
        onMpesaImport={mpesaImport}
        openLedgerExport={act === "ledger-export"}
        onLedgerExportClose={closeOverlay}
        onLedgerExport={ledgerExport}
        openTransactionEdit={act === "transaction-edit"}
        onTransactionEditClose={closeOverlay}
        onTransactionEdit={transactionEdit}
        openChamaArchive={act === "chama-archive"}
        onChamaArchiveClose={closeOverlay}
        onChamaArchive={archiveChama}
        openEmergencyPayout={act === "emergency-payout"}
        onEmergencyPayoutClose={closeOverlay}
        onEmergencyPayout={emergencyPayout}
      />

      <span className="sr-only" aria-live="polite">
        {resolvedChama ? `The chama ${resolvedChama.name} is open.` : ""}
      </span>
    </div>
  );
}
