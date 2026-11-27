import { useCallback, useState } from "react";
import { ArrowRight, CheckCircle2, CreditCard, Eye, Phone, Plus, ScrollText, ShieldCheck, Send, Users, Wallet, X } from "lucide-react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { Stepper, Field } from "@/app/(dashboard)/dashboard/obituaries/components/PinholeStage";
import { CreateChamaWizard } from "./CreateChamaWizard";
import { useWorkspace } from "@/state/Workspace";
import { CHAMAS, chamaById, type Chama } from "@/data/dashboard/finances";
import { kes } from "@/lib/format";

/* ══════════════════════════════════════════════════════════════════════
   FINANCE OVERLAYS — 15 functional surfaces
   All SIMULATED. No fake "Sent" claims. Every action resolves to
   "Ready — connects when the backend is wired."
   ══════════════════════════════════════════════════════════════════════ */

export interface FinanceOverlaysProps {
  openDeposit: boolean;
  onDepositClose: () => void;
  onDeposit: (payload: { chamaId: string; amount: number; channel: string; message?: string }) => void;
  openCreateChama: boolean;
  onCreateChamaClose: () => void;
  onCreateChama: (chama: { name: string; purpose: string; cadence: string; contributionKes: number; members: number }) => void;
  openChamaDeposit: boolean;
  onChamaDepositClose: () => void;
  onChamaDeposit: (chama: Chama, amount: number) => void;
  openSharePurchase: boolean;
  onSharePurchaseClose: () => void;
  onSharePurchase: (member: string, shares: number) => void;
  openLoanRequest: boolean;
  onLoanRequestClose: () => void;
  onLoanRequest: (member: string, amount: number, purpose: string) => void;
  openTransactionDetail: boolean;
  onTransactionDetailClose: () => void;
  openPayoutRelease: boolean;
  onPayoutReleaseClose: () => void;
  onPayoutRelease: (chamaId: string, amount: number) => void;
  openBroadcast: boolean;
  onBroadcastClose: () => void;
  onBroadcast: (channel: string, message: string) => void;
  openChamaDelete: boolean;
  onChamaDeleteClose: () => void;
  onChamaDelete: (chamaId: string) => void;
  openChamaPublish: boolean;
  onChamaPublishClose: () => void;
  onChamaPublish: (chamaId: string) => void;
  openMpesaImport: boolean;
  onMpesaImportClose: () => void;
  onMpesaImport: () => void;
  openLedgerExport: boolean;
  onLedgerExportClose: () => void;
  onLedgerExport: () => void;
  openTransactionEdit: boolean;
  onTransactionEditClose: () => void;
  onTransactionEdit: (txnId: string, note: string) => void;
  openChamaArchive: boolean;
  onChamaArchiveClose: () => void;
  onChamaArchive: (chamaId: string) => void;
  openEmergencyPayout: boolean;
  onEmergencyPayoutClose: () => void;
  onEmergencyPayout: (chamaId: string, amount: number) => void;
}

const STEPS_DEPOSIT: string[] = ["Chama", "Amount", "Channel", "Confirm"];
const STEPS_SHARE: string[] = ["Member", "Shares", "Confirm"];
const STEPS_LOAN: string[] = ["Member", "Amount", "Purpose", "Confirm"];

export function FinanceOverlays({
  openDeposit,
  onDepositClose,
  onDeposit,
  openCreateChama,
  onCreateChamaClose,
  onCreateChama,
  openChamaDeposit,
  onChamaDepositClose,
  onChamaDeposit,
  openSharePurchase,
  onSharePurchaseClose,
  onSharePurchase,
  openLoanRequest,
  onLoanRequestClose,
  onLoanRequest,
  openTransactionDetail,
  onTransactionDetailClose,
  openPayoutRelease,
  onPayoutReleaseClose,
  onPayoutRelease,
  openBroadcast,
  onBroadcastClose,
  onBroadcast,
  openChamaDelete,
  onChamaDeleteClose,
  onChamaDelete,
  openChamaPublish,
  onChamaPublishClose,
  onChamaPublish,
  openMpesaImport,
  onMpesaImportClose,
  onMpesaImport,
  openLedgerExport,
  onLedgerExportClose,
  onLedgerExport,
  openTransactionEdit,
  onTransactionEditClose,
  onTransactionEdit,
  openChamaArchive,
  onChamaArchiveClose,
  onChamaArchive,
  openEmergencyPayout,
  onEmergencyPayoutClose,
  onEmergencyPayout,
}: FinanceOverlaysProps) {
  const w = useWorkspace();

  /* ── 1. Deposit funds (sm) ── */
  const [depositStep, setDepositStep] = useState(0);
  const [depositDraft, setDepositDraft] = useState<{ chamaId: string; amount: number; channel: string; message?: string }>({
    chamaId: CHAMAS[0]?.id ?? "", amount: 0, channel: "mpesa", message: "",
  });

  /* ── 2. Create chama (md) ── */
  /* ── 3. Chama deposit (sm) ── */
  const [chamaDepositDraft, setChamaDepositDraft] = useState<{ chama: Chama | undefined; amount: number }>({ chama: undefined, amount: 0 });

  /* ── 4. Share purchase (sm) ── */
  const [shareDraft, setShareDraft] = useState<{ member: string; shares: number }>({ member: "", shares: 0 });

  /* ── 5. Loan request (md) ── */
  const [loanStep, setLoanStep] = useState(0);
  const [loanDraft, setLoanDraft] = useState<{ member: string; amount: number; purpose: string }>({ member: "", amount: 0, purpose: "" });

  /* ── 6. Transaction detail (lg) ── */
  const [txnDetailId, setTxnDetailId] = useState<string | undefined>(undefined);

  /* ── 7. Payout release (sm) ── */
  const [payoutDraft, setPayoutDraft] = useState<{ chamaId: string; amount: number }>({ chamaId: CHAMAS[0]?.id ?? "", amount: 0 });

  /* ── 8. Broadcast (md) ── */
  const [broadcastChannel, setBroadcastChannel] = useState("whatsapp");
  const [broadcastMessage, setBroadcastMessage] = useState("");

  /* ── 9. Chama delete (sm) ── */
  const [deleteChamaId, setDeleteChamaId] = useState<string | undefined>(undefined);

  /* ── 10. Chama publish (sm) ── */
  const [publishChamaId, setPublishChamaId] = useState<string | undefined>(undefined);

  /* ── 11. M-Pesa import (sm) ── */
  /* ── 12. Ledger export (sm) ── */
  /* ── 13. Transaction edit (sm) ── */
  const [editTxnId, setEditTxnId] = useState<string | undefined>(undefined);
  const [editTxnNote, setEditTxnNote] = useState("");

  /* ── 14. Chama archive (sm) ── */
  const [archiveChamaId, setArchiveChamaId] = useState<string | undefined>(undefined);

  /* ── 15. Emergency payout (sm) ── */
  const [emergencyDraft, setEmergencyDraft] = useState<{ chamaId: string; amount: number }>({ chamaId: CHAMAS[0]?.id ?? "", amount: 0 });

  const channels = [
    { id: "mpesa", label: "M-Pesa", sim: "SIMULATED — M-Pesa Daraya" },
    { id: "airtel", label: "Airtel Money", sim: "SIMULATED — Airtel Money" },
    { id: "bank", label: "Bank transfer", sim: "SIMULATED — Bank to Family Sacco" },
    { id: "internal", label: "Family ledger", sim: "SIMULATED — Internal transfer" },
  ];

  const channelLabel = (ch: string) => {
    const map: Record<string, string> = { mpesa: "M-Pesa", airtel: "Airtel Money", bank: "Bank", internal: "Family ledger" };
    return map[ch] ?? "M-Pesa";
  };

  const handleDepositConfirm = useCallback(() => {
    onDeposit(depositDraft);
    w.setToast(`Deposit of KES ${depositDraft.amount.toLocaleString("en-KE")} recorded — SIMULATED.`);
    setDepositStep(0);
    onDepositClose();
  }, [depositDraft, onDeposit, w, onDepositClose]);

  const handleSharePurchase = useCallback(() => {
    onSharePurchase(shareDraft.member, shareDraft.shares);
    w.setToast(`Purchased ${shareDraft.shares} shares for ${shareDraft.member} — SIMULATED.`);
    onSharePurchaseClose();
  }, [shareDraft, onSharePurchase, w, onSharePurchaseClose]);

  const handleLoanConfirm = useCallback(() => {
    onLoanRequest(loanDraft.member, loanDraft.amount, loanDraft.purpose);
    w.setToast(`Loan request of KES ${loanDraft.amount.toLocaleString("en-KE")} for ${loanDraft.member} — SIMULATED.`);
    setLoanStep(0);
    onLoanRequestClose();
  }, [loanDraft, onLoanRequest, w, onLoanRequestClose]);

  const handlePayoutRelease = useCallback(() => {
    onPayoutRelease(payoutDraft.chamaId, payoutDraft.amount);
    w.setToast(`Payout of KES ${payoutDraft.amount.toLocaleString("en-KE")} released — SIMULATED.`);
    onPayoutReleaseClose();
  }, [payoutDraft, onPayoutRelease, w, onPayoutReleaseClose]);

  const handleEmergencyPayout = useCallback(() => {
    onEmergencyPayout(emergencyDraft.chamaId, emergencyDraft.amount);
    w.setToast(`Emergency payout of KES ${emergencyDraft.amount.toLocaleString("en-KE")} recorded — SIMULATED.`);
    onEmergencyPayoutClose();
  }, [emergencyDraft, onEmergencyPayout, w, onEmergencyPayoutClose]);

  return (
    <>
      {/* ── 1 · Deposit funds ── */}
      <ModalDialog
        open={openDeposit}
        onClose={onDepositClose}
        title="Deposit funds"
        description="Add money to the family wallet or a chama. SIMULATED until the backend is wired."
        size="sm"
      >
        <Stepper steps={STEPS_DEPOSIT} current={depositStep} />
        <div className="space-y-4">
          {depositStep === 0 && (
            <Field label="Choose a chama or wallet" hint="Where should the deposit go?">
              <select className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={depositDraft.chamaId} onChange={(e) => setDepositDraft({ ...depositDraft, chamaId: e.target.value })}>
                <option value="wallet">Family wallet</option>
                {CHAMAS.map((c) => (c.status === 'active' ? <option key={c.id} value={c.id}>{c.name}</option> : null))}
              </select>
            </Field>
          )}
          {depositStep === 1 && (
            <Field label="Amount (KES)" hint="How much are you depositing?">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">KES</span>
                <input type="number" min="0" className="block w-full pl-10 rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={depositDraft.amount} onChange={(e) => setDepositDraft({ ...depositDraft, amount: Number(e.target.value) || 0 })} />
              </div>
            </Field>
          )}
          {depositStep === 2 && (
            <Field label="Channel" hint="How will you send the funds?">
              <div className="space-y-2">
                {channels.map((ch) => (
                  <button key={ch.id} type="button" className={`w-full flex items-center gap-8 px-4 py-3 rounded-lg border transition ${depositDraft.channel === ch.id ? "border-give-ink bg-[#16211b] text-[#fdfbf5]" : "border-hairline bg-surface-0 text-text-secondary hover:border-give-accent"}`} onClick={() => setDepositDraft({ ...depositDraft, channel: ch.id })}>
                    <Phone size={14} aria-hidden />
                    <div>
                      <div className={depositDraft.channel === ch.id ? "font-medium text-[#fdfbf5]" : "font-medium text-text-primary"}>{ch.label}</div>
                      <div className={depositDraft.channel === ch.id ? "text-xs text-[#fdfbf5]/80" : "text-xs text-text-tertiary"}>{ch.sim}</div>
                    </div>
                  </button>
                ))}
              </div>
            </Field>
          )}
          {depositStep === 3 && (
            <Field label="Message (optional)" hint="A short note for the deposit.">
              <textarea className="ny-textarea block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={depositDraft.message ?? ""} onChange={(e) => setDepositDraft({ ...depositDraft, message: e.target.value })} placeholder="e.g. Top-up for December" />
            </Field>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          {depositStep > 0 && (
            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => setDepositStep(depositStep - 1)} disabled={depositStep === 0}>
              <ArrowRight className="-rotate-180" size={14} aria-hidden />
              Back
            </button>
          )}
          {depositStep < STEPS_DEPOSIT.length - 1 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => setDepositStep(depositStep + 1)} disabled={depositDraft.amount <= 0}>
              Next <ArrowRight size={14} aria-hidden />
            </button>
          ) : (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={handleDepositConfirm}>
              Confirm <Send size={14} aria-hidden />
            </button>
          )}
        </div>
      </ModalDialog>

      {/* ── 2 · Create chama ── */}
      <CreateChamaWizard open={openCreateChama} onClose={onCreateChamaClose} onCreate={onCreateChama} />

      {/* ── 3 · Chama deposit ── */}
      <ModalDialog
        open={openChamaDeposit}
        onClose={onChamaDepositClose}
        title="Deposit to chama"
        description="Contribute to a specific chama rotation. SIMULATED."
        size="sm"
      >
        <div className="space-y-4">
          <Field label="Chama" hint="Which chama receives the contribution?">
            <select className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={chamaDepositDraft.chama?.id ?? ""} onChange={(e) => setChamaDepositDraft({ chama: CHAMAS.find((c) => c.id === e.target.value), amount: chamaDepositDraft.amount })}>
              {CHAMAS.filter((c) => c.status === 'active').map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {kes(c.contributionKes)} per member</option>
              ))}
            </select>
          </Field>
          <Field label="Amount (KES)" hint="Your contribution amount.">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">KES</span>
              <input type="number" min="0" className="block w-full pl-10 rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={chamaDepositDraft.amount} onChange={(e) => setChamaDepositDraft({ ...chamaDepositDraft, amount: Number(e.target.value) || 0 })} />
            </div>
          </Field>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onChamaDepositClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => {
            if (chamaDepositDraft.chama && chamaDepositDraft.amount > 0) {
              onChamaDeposit(chamaDepositDraft.chama, chamaDepositDraft.amount);
              w.setToast(`Deposit of KES ${chamaDepositDraft.amount.toLocaleString("en-KE")} to ${chamaDepositDraft.chama.name} — SIMULATED.`);
              onChamaDepositClose();
            }
          }}>
            Contribute <Send size={14} aria-hidden />
          </button>
        </div>
      </ModalDialog>

      {/* ── 4 · Share purchase ── */}
      <ModalDialog
        open={openSharePurchase}
        onClose={onSharePurchaseClose}
        title="Purchase Sacco shares"
        description="Buy shares in the family Sacco. Shares unlock loans. SIMULATED."
        size="sm"
      >
        <Stepper steps={STEPS_SHARE} current={shareDraft.member ? 1 : 0} />
        <div className="space-y-4">
          <Field label="Member" hint="Who is buying shares?">
            <select className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={shareDraft.member} onChange={(e) => setShareDraft({ ...shareDraft, member: e.target.value })}>
              <option value="">Select a member</option>
              {[
                "Mzee Victor Wafula Nalyanya",
                "Esther Nanjala Nalyanya",
                "Joseph Wafula Nalyanya",
                "Peter Otieno Nalyanya",
                "Samuel Kipkoech Nalyanya",
                "Grace Adhiambo Nalyanya",
                "Daniel Wafula Nalyanya",
                "Hellen Nasimiyu Nalyanya",
              ].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Number of shares" hint="KES 1,250 per share.">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">KES</span>
              <input type="number" min="0" className="block w-full pl-10 rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={shareDraft.shares} onChange={(e) => setShareDraft({ ...shareDraft, shares: Number(e.target.value) || 0 })} />
            </div>
            <div className="mt-2 text-xs text-text-tertiary">Cost: {kes(shareDraft.shares * 1250)}</div>
          </Field>
        </div>
        <div className="flex items-center justify-between gap-3">
          {shareDraft.member ? (
            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => setShareDraft({ ...shareDraft, member: "" })}>
              <ArrowRight className="-rotate-180" size={14} aria-hidden />
              Back
            </button>
          ) : (
            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onSharePurchaseClose}>
              Cancel
            </button>
          )}
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={handleSharePurchase} disabled={!shareDraft.member || shareDraft.shares <= 0}>
            Purchase <Send size={14} aria-hidden />
          </button>
        </div>
      </ModalDialog>

      {/* ── 5 · Loan request ── */}
      <ModalDialog
        open={openLoanRequest}
        onClose={onLoanRequestClose}
        title="Request a loan"
        description="Apply for a Sacco-backed loan. Loan limits are based on share value. SIMULATED."
        size="md"
      >
        <Stepper steps={STEPS_LOAN} current={loanStep} />
        <div className="space-y-4">
          {loanStep === 0 && (
            <Field label="Member" hint="Who is requesting the loan?">
              <select className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={loanDraft.member} onChange={(e) => setLoanDraft({ ...loanDraft, member: e.target.value })}>
                <option value="">Select a member</option>
                {[
                  "Mzee Victor Wafula Nalyanya",
                  "Esther Nanjala Nalyanya",
                  "Joseph Wafula Nalyanya",
                  "Peter Otieno Nalyanya",
                  "Samuel Kipkoech Nalyanya",
                  "Grace Adhiambo Nalyanya",
                  "Daniel Wafula Nalyanya",
                  "Hellen Nasimiyu Nalyanya",
                ].map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </Field>
          )}
          {loanStep === 1 && (
            <Field label="Loan amount (KES)" hint="How much do you need to borrow?">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">KES</span>
                <input type="number" min="0" className="block w-full pl-10 rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={loanDraft.amount} onChange={(e) => setLoanDraft({ ...loanDraft, amount: Number(e.target.value) || 0 })} />
              </div>
            </Field>
          )}
          {loanStep === 2 && (
            <Field label="Purpose" hint="What is the loan for?">
              <textarea className="ny-textarea block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={loanDraft.purpose} onChange={(e) => setLoanDraft({ ...loanDraft, purpose: e.target.value })} placeholder="e.g. School fees, medical emergency, homestead…" />
            </Field>
          )}
          {loanStep === 3 && (
            <div className="ny-give-review">
              <div><span>Member</span><b>{loanDraft.member}</b></div>
              <div><span>Amount</span><b className="is-gold font-mono">{kes(loanDraft.amount)}</b></div>
              <div><span>Purpose</span><b>{loanDraft.purpose}</b></div>
              <div><span>Status</span><b className="text-amber-400 font-semibold">Pending review (SIMULATED)</b></div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          {loanStep > 0 && (
            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => setLoanStep(loanStep - 1)} disabled={loanStep === 0}>
              <ArrowRight className="-rotate-180" size={14} aria-hidden />
              Back
            </button>
          )}
          {loanStep < STEPS_LOAN.length - 1 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => setLoanStep(loanStep + 1)} disabled={loanDraft.amount <= 0 || (loanStep === 2 && !loanDraft.purpose)}>
              Next <ArrowRight size={14} aria-hidden />
            </button>
          ) : (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={handleLoanConfirm}>
              Submit <Send size={14} aria-hidden />
            </button>
          )}
        </div>
      </ModalDialog>

      {/* ── 6 · Transaction detail ── */}
      <ModalDialog
        open={openTransactionDetail}
        onClose={onTransactionDetailClose}
        title="Transaction details"
        description="View full details of a ledger entry. SIMULATED."
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-hairline bg-surface-0/30">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-medium text-text-primary">Transaction reference</h3>
                <div className="text-sm font-mono text-text-secondary">NY-TXN-2026-0412</div>
              </div>
              <span className="ny-fin-chip is-active">Confirmed</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <span className="text-text-tertiary text-sm">Member</span>
                <b className="text-text-primary">Peter Otieno Nalyanya</b>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-text-tertiary text-sm">Chama</span>
                <b className="text-text-primary">Wazee Round</b>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-text-tertiary text-sm">Type</span>
                <b className="text-text-primary">Chama contribution</b>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-text-tertiary text-sm">Amount</span>
                <b className="is-gold font-mono text-text-primary">KES 40,000</b>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-text-tertiary text-sm">Channel</span>
                <b className="text-text-primary">M-Pesa</b>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-text-tertiary text-sm">Reference</span>
                <b className="text-xs font-mono text-text-secondary">NY-MP-2026-0412</b>
              </div>
            </div>
          </div>
          <div className="p-5 rounded-xl border border-hairline bg-surface-0/30">
            <h3 className="font-medium text-text-primary mb-3">Audit trail</h3>
            <div className="space-y-2">
              <div className="text-xs text-text-secondary">Recorded 2 min ago by System</div>
              <div className="text-xs text-text-secondary">Verified 1 min ago by Finance Committee</div>
              <div className="text-xs text-text-secondary">Posted to ledger 1 min ago</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onTransactionDetailClose}>
            Close
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onTransactionDetailClose}>
            Done <Send size={14} aria-hidden />
          </button>
        </div>
      </ModalDialog>

      {/* ── 7 · Payout release ── */}
      <ModalDialog
        open={openPayoutRelease}
        onClose={onPayoutReleaseClose}
        title="Release payout"
        description="Disburse chama pool to the rotation recipient. SIMULATED — no money moves."
        size="sm"
      >
        <div className="space-y-4">
          <Field label="Chama" hint="Which chama is paying out?">
            <select className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={payoutDraft.chamaId} onChange={(e) => setPayoutDraft({ ...payoutDraft, chamaId: e.target.value })}>
              {CHAMAS.filter((c) => c.status === 'active').map((c) => (
                <option key={c.id} value={c.id}>{c.name} — pool {kes(c.pool)}</option>
              ))}
            </select>
          </Field>
          <Field label="Payout amount (KES)" hint="Amount to release to the recipient.">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">KES</span>
              <input type="number" min="0" className="block w-full pl-10 rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={payoutDraft.amount} onChange={(e) => setPayoutDraft({ ...payoutDraft, amount: Number(e.target.value) || 0 })} />
            </div>
          </Field>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onPayoutReleaseClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={handlePayoutRelease} disabled={payoutDraft.amount <= 0}>
            Release <Send size={14} aria-hidden />
          </button>
        </div>
      </ModalDialog>

      {/* ── 8 · Broadcast ── */}
      <ModalDialog
        open={openBroadcast}
        onClose={onBroadcastClose}
        title="Broadcast to family"
        description="Send a message to all members via WhatsApp, SMS or in-app. SIMULATED."
        size="md"
      >
        <div className="space-y-4">
          <Field label="Channel" hint="How should the broadcast go out?">
            <div className="space-y-2">
              {[
                { id: "whatsapp", label: "WhatsApp", sim: "SIMULATED — WhatsApp Cloud API" },
                { id: "sms", label: "SMS", sim: "SIMULATED — Africa's Talking" },
                { id: "in-app", label: "In-app notification", sim: "SIMULATED — Workspace push" },
              ].map((ch) => (
                <button key={ch.id} type="button" className={`w-full flex items-center gap-8 px-4 py-3 rounded-lg border transition ${broadcastChannel === ch.id ? "border-give-ink bg-[#16211b] text-[#fdfbf5]" : "border-hairline bg-surface-0 text-text-secondary hover:border-give-accent"}`} onClick={() => setBroadcastChannel(ch.id)}>
                  <Phone size={14} aria-hidden />
                  <div>
                    <div className={broadcastChannel === ch.id ? "font-medium text-[#fdfbf5]" : "font-medium text-text-primary"}>{ch.label}</div>
                    <div className={broadcastChannel === ch.id ? "text-xs text-[#fdfbf5]/80" : "text-xs text-text-tertiary"}>{ch.sim}</div>
                  </div>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Message" hint="What should the broadcast say?">
            <textarea className="ny-textarea block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="e.g. December reunion RSVP closes Friday…" rows={3} />
          </Field>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onBroadcastClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => {
            onBroadcast(broadcastChannel, broadcastMessage);
            w.setToast(`Broadcast prepared for ${broadcastChannel} — SIMULATED, not sent.`);
            onBroadcastClose();
          }} disabled={!broadcastMessage}>
            Broadcast <Send size={14} aria-hidden />
          </button>
        </div>
      </ModalDialog>

      {/* ── 9 · Chama delete ── */}
      <ModalDialog
        open={openChamaDelete}
        onClose={onChamaDeleteClose}
        title="Archive chama"
        description="This chama will be hidden from the grid. SIMULATED."
        size="sm"
      >
        <div className="p-5 rounded-xl border border-hairline bg-surface-0/30">
          <h3 className="font-medium text-text-primary mb-2">Are you sure?</h3>
          <p className="text-text-secondary text-sm">
            The chama <b>{deleteChamaId ? CHAMAS.find((c) => c.id === deleteChamaId)?.name : ""}</b> will be removed from the active grid.
            Its history remains in the audit trail.
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onChamaDeleteClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => {
            if (deleteChamaId) {
              onChamaDelete(deleteChamaId);
              w.setToast("Chama archived — SIMULATED.");
              onChamaDeleteClose();
            }
          }}>
            Archive <X size={14} aria-hidden />
          </button>
        </div>
      </ModalDialog>

      {/* ── 10 · Chama publish ── */}
      <ModalDialog
        open={openChamaPublish}
        onClose={onChamaPublishClose}
        title="Publish chama"
        description="Make the chama visible to all family members. SIMULATED."
        size="sm"
      >
        <div className="p-5 rounded-xl border border-hairline bg-surface-0/30">
          <h3 className="font-medium text-text-primary mb-2">Publish this chama?</h3>
          <p className="text-text-secondary text-sm">
            Publishing makes the chama visible in the chama grid and open for contributions.
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onChamaPublishClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => {
            if (publishChamaId) {
              onChamaPublish(publishChamaId);
              w.setToast("Chama published — SIMULATED.");
              onChamaPublishClose();
            }
          }}>
            Publish <Send size={14} aria-hidden />
          </button>
        </div>
      </ModalDialog>

      {/* ── 11 · M-Pesa import ── */}
      <ModalDialog
        open={openMpesaImport}
        onClose={onMpesaImportClose}
        title="Import M-Pesa statement"
        description="Upload an M-Pesa statement CSV to reconcile transactions. SIMULATED."
        size="sm"
      >
        <div className="p-6 rounded-xl border border-hairline bg-surface-0/30">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-1 flex items-center justify-center border border-hairline">
              <ScrollText size={32} aria-hidden />
            </div>
            <h3 className="font-medium text-text-primary">Select statement file</h3>
            <p className="text-text-secondary text-sm text-center max-w-xs">
              M-Pesa statement import prepares reconciliation — SIMULATED. No real file is processed.
            </p>
            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onMpesaImportClose}>
              Cancel
            </button>
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => {
              onMpesaImport();
              w.setToast("M-Pesa statement import prepared — SIMULATED.");
              onMpesaImportClose();
            }}>
              Import <Send size={14} aria-hidden />
            </button>
          </div>
        </div>
      </ModalDialog>

      {/* ── 12 · Ledger export ── */}
      <ModalDialog
        open={openLedgerExport}
        onClose={onLedgerExportClose}
        title="Export ledger"
        description="Download the full transaction history as CSV. SIMULATED."
        size="sm"
      >
        <div className="p-6 rounded-xl border border-hairline bg-surface-0/30">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-1 flex items-center justify-center border border-hairline">
              <ScrollText size={32} aria-hidden />
            </div>
            <h3 className="font-medium text-text-primary">Export format</h3>
            <p className="text-text-secondary text-sm text-center max-w-xs">
              Ledger export prepares a CSV download — SIMULATED. No file is generated yet.
            </p>
            <div className="space-y-2 w-full">
              <button type="button" className="w-full py-3 rounded-lg border border-hairline bg-surface-0 text-text-secondary hover:border-give-accent" onClick={() => {
                onLedgerExport();
                w.setToast("Ledger export prepared — SIMULATED.");
                onLedgerExportClose();
              }}>
                CSV (comma-separated)
              </button>
              <button type="button" className="w-full py-3 rounded-lg border border-hairline bg-surface-0 text-text-secondary hover:border-give-accent" onClick={() => {
                onLedgerExport();
                w.setToast("Ledger export prepared — SIMULATED.");
                onLedgerExportClose();
              }}>
                OFX (financial exchange)
              </button>
            </div>
          </div>
        </div>
      </ModalDialog>

      {/* ── 13 · Transaction edit ── */}
      <ModalDialog
        open={openTransactionEdit}
        onClose={onTransactionEditClose}
        title="Edit transaction"
        description="Correct a ledger entry note. SIMULATED."
        size="sm"
      >
        <div className="space-y-4">
          <Field label="Transaction reference" hint="Read-only identifier.">
            <input className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value="NY-TXN-2026-0412" readOnly />
          </Field>
          <Field label="Note" hint="Update the transaction description.">
            <textarea className="ny-textarea block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={editTxnNote} onChange={(e) => setEditTxnNote(e.target.value)} placeholder="e.g. Wazee Round · position 4 of 12" rows={3} />
          </Field>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onTransactionEditClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => {
            if (editTxnId) {
              onTransactionEdit(editTxnId, editTxnNote);
              w.setToast("Transaction edited — SIMULATED.");
              onTransactionEditClose();
            }
          }}>
            Save <Send size={14} aria-hidden />
          </button>
        </div>
      </ModalDialog>

      {/* ── 14 · Chama archive ── */}
      <ModalDialog
        open={openChamaArchive}
        onClose={onChamaArchiveClose}
        title="Archive chama"
        description="Move the chama to the archive. SIMULATED."
        size="sm"
      >
        <div className="p-5 rounded-xl border border-hairline bg-surface-0/30">
          <h3 className="font-medium text-text-primary mb-2">Archive this chama?</h3>
          <p className="text-text-secondary text-sm">
            Archiving removes it from rotation but keeps its history.
          </p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onChamaArchiveClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => {
            if (archiveChamaId) {
              onChamaArchive(archiveChamaId);
              w.setToast("Chama archived — SIMULATED.");
              onChamaArchiveClose();
            }
          }}>
            Archive <X size={14} aria-hidden />
          </button>
        </div>
      </ModalDialog>

      {/* ── 15 · Emergency payout ── */}
      <ModalDialog
        open={openEmergencyPayout}
        onClose={onEmergencyPayoutClose}
        title="Emergency payout"
        description="Record an emergency disbursement from a chama pool. SIMULATED."
        size="sm"
      >
        <div className="space-y-4">
          <Field label="Chama" hint="Which chama funds the emergency?">
            <select className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={emergencyDraft.chamaId} onChange={(e) => setEmergencyDraft({ ...emergencyDraft, chamaId: e.target.value })}>
              {CHAMAS.filter((c) => c.status === 'active').map((c) => (
                <option key={c.id} value={c.id}>{c.name} — pool {kes(c.pool)}</option>
              ))}
            </select>
          </Field>
          <Field label="Emergency amount (KES)" hint="Amount to disburse immediately.">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">KES</span>
              <input type="number" min="0" className="block w-full pl-10 rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={emergencyDraft.amount} onChange={(e) => setEmergencyDraft({ ...emergencyDraft, amount: Number(e.target.value) || 0 })} />
            </div>
          </Field>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onEmergencyPayoutClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={handleEmergencyPayout} disabled={emergencyDraft.amount <= 0}>
            Release <Send size={14} aria-hidden />
          </button>
        </div>
      </ModalDialog>
    </>
  );
}
