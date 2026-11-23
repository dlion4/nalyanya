import { ArrowRight, CheckCircle2, Eye, FileText, Phone, Plus, ShieldCheck, Send, Trash2, Upload } from "lucide-react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { useWorkspace } from "@/state/Workspace";
import { kes } from "@/lib/format";

/* ═══════════════════════════════════════════════════════════════════════
   CONTRIBUTION OVERLAYS — 15 dedicated surfaces for T-7
   All functional, all accessible, all SIMULATED until backend is wired.
   ═══════════════════════════════════════════════════════════════════════ */

export interface ContributionOverlaysProps {
  openContribute: boolean;
  onContributeClose: () => void;
  openReceipt: boolean;
  onReceiptClose: () => void;
  openVerify: boolean;
  onVerifyClose: () => void;
  onVerify: (approved: boolean) => void;
  openFailed: boolean;
  onFailedClose: () => void;
  onRetry: () => void;
  openCauseDetail: boolean;
  onCauseDetailClose: () => void;
  openPayout: boolean;
  onPayoutClose: () => void;
  onRelease: () => void;
  openBroadcast: boolean;
  onBroadcastClose: () => void;
  onBroadcast: (channel: string) => void;
  openCauseDelete: boolean;
  onCauseDeleteClose: () => void;
  onDelete: () => void;
  openCausePublish: boolean;
  onCausePublishClose: () => void;
  onPublish: () => void;
  openMpesaImport: boolean;
  onMpesaImportClose: () => void;
  onImport: () => void;
  openLedgerExport: boolean;
  onLedgerExportClose: () => void;
  onExport: () => void;
  openContributionEdit: boolean;
  onContributionEditClose: () => void;
  onSaveEdit: () => void;
  openCauseArchive: boolean;
  onCauseArchiveClose: () => void;
  onArchive: () => void;
  openEmergencyRelease: boolean;
  onEmergencyReleaseClose: () => void;
  onEmergencyRelease: () => void;
  openContributionConfirm: boolean;
  onContributionConfirmClose: () => void;
  onConfirmContribute: (amount: number) => void;
}

export function ContributionOverlays(props: ContributionOverlaysProps) {
  const w = useWorkspace();

  return (
    <>
      {/* 1 · Contribute confirm (small modal) */}
      <ModalDialog
        open={props.openContribute}
        onClose={props.onContributeClose}
        title="Confirm contribution"
        description="Enter the amount you want to give. This is SIMULATED — no real payment is sent."
        side="center"
        size="sm"
      >
        <div className="space-y-4">
          <div className="ny-give-field">
            <span className="ny-give-label">Amount (KES)</span>
            <input
              type="number"
              min="0"
              className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
              placeholder="e.g. 5000"
            />
          </div>
          <div className="ny-give-simnote">
            <ShieldCheck size={14} aria-hidden />
            Your contribution is recorded on the family ledger. Ready — connects when the backend is wired.
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={props.onContributeClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary" onClick={() => props.onConfirmContribute(5000)}>
            <Send size={14} aria-hidden />
            Confirm (SIMULATED)
          </button>
        </footer>
      </ModalDialog>

      {/* 2 · Receipt view (small modal) */}
      <ModalDialog
        open={props.openReceipt}
        onClose={props.onReceiptClose}
        title="Receipt NY-CON-2026-0000"
        description="Your contribution receipt. Generated on this device — SIMULATED."
        side="center"
        size="sm"
      >
        <div className="ny-give-receipt">
          <div className="ny-give-receipt-head">
            <span className="ny-give-receipt-no">NY-CON-2026-0000</span>
            <span className="text-text-tertiary text-xs">{new Date().toISOString().slice(0, 16)}</span>
          </div>
          <div className="ny-give-receipt-line">
            <span>Cause</span>
            <b>Grace's Wedding Harambee</b>
          </div>
          <div className="ny-give-receipt-line">
            <span>Amount</span>
            <b>KES 5,000</b>
          </div>
          <div className="ny-give-receipt-line">
            <span>Channel</span>
            <b>M-Pesa</b>
          </div>
          <div className="ny-give-receipt-line">
            <span>Status</span>
            <b className="text-green-600 font-semibold">Confirmed (SIMULATED)</b>
          </div>
          <div className="ny-give-receipt-line">
            <span>Ledger ref</span>
            <b className="font-mono text-xs">NY-LED-2026-00000</b>
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-primary" onClick={props.onReceiptClose}>
            <Eye size={14} aria-hidden />
            Done
          </button>
        </footer>
      </ModalDialog>

      {/* 3 · Contribution verify (small modal) */}
      <ModalDialog
        open={props.openVerify}
        onClose={props.onVerifyClose}
        title="Verify contribution"
        description="Two M-Pesa references and one cash receipt need a second look."
        side="center"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Contribution NY-CON-2026-0409 — KES 5,000 via Airtel Money from Mercy Auma Nalyanya.
          </p>
          <div className="space-y-3">
            <button type="button" className="ny-btn ny-btn-ghost w-full" onClick={() => props.onVerify(true)}>
              <CheckCircle2 size={14} aria-hidden />
              Approve
            </button>
            <button type="button" className="ny-btn ny-btn-ghost w-full" onClick={() => props.onVerify(false)}>
              <ArrowRight size={14} className="-rotate-90" aria-hidden />
              Quarantine
            </button>
          </div>
          <div className="ny-give-simnote">
            <ShieldCheck size={14} aria-hidden />
            Verification is recorded on this device — SIMULATED.
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={props.onVerifyClose}>
            Later
          </button>
        </footer>
      </ModalDialog>

      {/* 4 · Failed payment retry (small modal) */}
      <ModalDialog
        open={props.openFailed}
        onClose={props.onFailedClose}
        title="Payment failed"
        description="KES 8,000 M-Pesa contribution to Education Bursary Fund could not be completed."
        side="center"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Reference MP260430D4 — the payment gateway returned an error. Retry or use a different channel.
          </p>
          <div className="ny-give-simnote">
            <ShieldCheck size={14} aria-hidden />
            Retry is SIMULATED — no real money moves until the backend is wired.
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={props.onFailedClose}>
            Dismiss
          </button>
          <button type="button" className="ny-btn ny-btn-primary" onClick={props.onRetry}>
            <ArrowRight className="-rotate-180" size={14} aria-hidden />
            Retry (SIMULATED)
          </button>
        </footer>
      </ModalDialog>

      {/* 5 · Cause detail (medium modal) */}
      <ModalDialog
        open={props.openCauseDetail}
        onClose={props.onCauseDetailClose}
        title="Grace's Wedding Harambee"
        description="Wedding · KES 750,000 goal · 28 contributors · Deadline 15 Jul 2026"
        side="center"
        size="md"
      >
        <div className="space-y-6">
          <div className="ny-give-progress-ring" style={{ "--pct": "55deg" } as React.CSSProperties}>
            <div className="ny-give-progress-ring-text">
              55%
              <small>of goal</small>
            </div>
          </div>
          <div className="ny-give-review">
            <div>
              <span>Raised</span>
              <b>{kes(412000)}</b>
            </div>
            <div>
              <span>Goal</span>
              <b>{kes(750000)}</b>
            </div>
            <div>
              <span>Contributors</span>
              <b>28</b>
            </div>
            <div>
              <span>Payout status</span>
              <b className="text-amber-600 font-medium">Queued</b>
            </div>
          </div>
          <div className="ny-give-simnote">
            <ShieldCheck size={14} aria-hidden />
            Cause details are displayed on this device. Edits connect when the backend is wired.
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={props.onCauseDetailClose}>
            Close
          </button>
          <button type="button" className="ny-btn ny-btn-primary" onClick={() => { w.setToast("Contribute opened — see contribute wizard."); }}>
            <Plus size={14} aria-hidden />
            Contribute
          </button>
        </footer>
      </ModalDialog>

      {/* 6 · Payout release (medium modal) */}
      <ModalDialog
        open={props.openPayout}
        onClose={props.onPayoutClose}
        title="Release payout"
        description="Release KES 412,000 to Grace Adhiambo Nalyanya via M-Pesa."
        side="center"
        size="md"
      >
        <div className="space-y-4">
          <div className="ny-give-review">
            <div>
              <span>Cause</span>
              <b>Grace's Wedding Harambee</b>
            </div>
            <div>
              <span>Recipient</span>
              <b>Grace Adhiambo Nalyanya</b>
            </div>
            <div>
              <span>Amount</span>
              <b>{kes(412000)}</b>
            </div>
            <div>
              <span>Channel</span>
              <b>M-Pesa</b>
            </div>
            <div>
              <span>Reference</span>
              <b className="font-mono text-xs">MP260506G1</b>
            </div>
          </div>
          <div className="ny-give-simnote">
            <ShieldCheck size={14} aria-hidden />
            Releasing records a double-entry ledger event. SIMULATED — no real money is sent.
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={props.onPayoutClose}>
            Hold
          </button>
          <button type="button" className="ny-btn ny-btn-primary" onClick={props.onRelease}>
            <ShieldCheck size={14} aria-hidden />
            Release (SIMULATED)
          </button>
        </footer>
      </ModalDialog>

      {/* 7 · Broadcast SMS (medium drawer) */}
      <ModalDialog
        open={props.openBroadcast}
        onClose={props.onBroadcastClose}
        title="Broadcast to contributors"
        description="Send a message to all contributors of this cause."
        side="right"
        size="md"
      >
        <div className="space-y-4">
          <div className="ny-give-field">
            <span className="ny-give-label">Channel</span>
            <select className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none">
              <option>SMS</option>
              <option>WhatsApp</option>
            </select>
          </div>
          <div className="ny-give-field">
            <span className="ny-give-label">Message</span>
            <textarea className="ny-textarea block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" placeholder="Your message to contributors…" />
          </div>
          <div className="ny-give-simnote">
            <ShieldCheck size={14} aria-hidden />
            Broadcast is prepared on this device — connects to T-14 when wired. SIMULATED, not sent.
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={props.onBroadcastClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary" onClick={() => props.onBroadcast("SMS")}>
            <Send size={14} aria-hidden />
            Send (SIMULATED)
          </button>
        </footer>
      </ModalDialog>

      {/* 8 · Cause delete (confirmation modal) */}
      <ModalDialog
        open={props.openCauseDelete}
        onClose={props.onCauseDeleteClose}
        title="Delete cause"
        description="This cannot be undone. All contributions and payouts for this cause will be removed."
        side="center"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Cause: Kimilili Homestead Project (NY-CAUSE-2026-004)
          </p>
          <div className="ny-give-simnote">
            <ShieldCheck size={14} aria-hidden />
            Deletion is recorded in the audit trail. Ready — connects when the backend is wired.
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={props.onCauseDeleteClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary" onClick={props.onDelete}>
            <Trash2 size={14} aria-hidden />
            Delete cause
          </button>
        </footer>
      </ModalDialog>

      {/* 9 · Cause publish (medium modal) */}
      <ModalDialog
        open={props.openCausePublish}
        onClose={props.onCausePublishClose}
        title="Publish cause"
        description="Make the cause visible to the family so they can contribute."
        side="center"
        size="md"
      >
        <div className="space-y-4">
          <div className="ny-give-review">
            <div>
              <span>Title</span>
              <b>Kimilili Homestead Project</b>
            </div>
            <div>
              <span>Goal</span>
              <b>{kes(3000000)}</b>
            </div>
            <div>
              <span>Scope</span>
              <b>All family members</b>
            </div>
          </div>
          <div className="ny-give-simnote">
            <ShieldCheck size={14} aria-hidden />
            Publishing makes the cause visible. Contributions connect when the backend is wired.
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={props.onCausePublishClose}>
            Keep draft
          </button>
          <button type="button" className="ny-btn ny-btn-primary" onClick={props.onPublish}>
            <Send size={14} aria-hidden />
            Publish cause
          </button>
        </footer>
      </ModalDialog>

      {/* 10 · M-Pesa import (small modal) */}
      <ModalDialog
        open={props.openMpesaImport}
        onClose={props.onMpesaImportClose}
        title="Import M-Pesa statement"
        description="Upload your M-Pesa statement to reconcile contributions."
        side="center"
        size="sm"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-hairline rounded-lg p-8 text-center">
            <Upload size={24} className="text-text-tertiary mb-3" aria-hidden />
            <p className="text-sm text-text-secondary">Drop your M-Pesa statement CSV here</p>
          </div>
          <div className="ny-give-simnote">
            <ShieldCheck size={14} aria-hidden />
            Import is prepared on this device — SIMULATED until the backend is wired.
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={props.onMpesaImportClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary" onClick={props.onImport}>
            <ArrowRight size={14} aria-hidden />
            Import (SIMULATED)
          </button>
        </footer>
      </ModalDialog>

      {/* 11 · Ledger export (small modal) */}
      <ModalDialog
        open={props.openLedgerExport}
        onClose={props.onLedgerExportClose}
        title="Export ledger"
        description="Download all contributions as CSV for your records."
        side="center"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Export covers all contribution records on this device.
          </p>
          <div className="ny-give-simnote">
            <ShieldCheck size={14} aria-hidden />
            Export is generated on this device. Download connects when the backend is wired.
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={props.onLedgerExportClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary" onClick={props.onExport}>
            <FileText size={14} aria-hidden />
            Export CSV (SIMULATED)
          </button>
        </footer>
      </ModalDialog>

      {/* 12 · Contribution edit (medium modal) */}
      <ModalDialog
        open={props.openContributionEdit}
        onClose={props.onContributionEditClose}
        title="Edit contribution"
        description="Correct the amount, channel or message of an existing contribution."
        side="center"
        size="md"
      >
        <div className="space-y-4">
          <div className="ny-give-field">
            <span className="ny-give-label">Amount (KES)</span>
            <input type="number" className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value={25000} readOnly />
          </div>
          <div className="ny-give-field">
            <span className="ny-give-label">Channel</span>
            <select className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none">
              <option>M-Pesa</option>
              <option>Airtel Money</option>
              <option>Bank</option>
            </select>
          </div>
          <div className="ny-give-field">
            <span className="ny-give-label">Message</span>
            <input className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" value="Congratulations Grace!" />
          </div>
          <div className="ny-give-simnote">
            <ShieldCheck size={14} aria-hidden />
            Edits are recorded on this device — SIMULATED until the backend is wired.
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={props.onContributionEditClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary" onClick={props.onSaveEdit}>
            <Send size={14} aria-hidden />
            Save (SIMULATED)
          </button>
        </footer>
      </ModalDialog>

      {/* 13 · Cause archive (confirmation modal) */}
      <ModalDialog
        open={props.openCauseArchive}
        onClose={props.onCauseArchiveClose}
        title="Archive cause"
        description="Move this cause to the archive. It will no longer appear in the active causes grid."
        side="center"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Cause: Daniel's Medical Fund (NY-CAUSE-2026-002)
          </p>
          <div className="ny-give-simnote">
            <ShieldCheck size={14} aria-hidden />
            Archiving is logged in the audit trail. Ready — connects when the backend is wired.
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={props.onCauseArchiveClose}>
            Keep active
          </button>
          <button type="button" className="ny-btn ny-btn-primary" onClick={props.onArchive}>
            <ArchiveIcon size={14} aria-hidden />
            Archive cause
          </button>
        </footer>
      </ModalDialog>

      {/* 14 · Emergency release (medium modal) */}
      <ModalDialog
        open={props.openEmergencyRelease}
        onClose={props.onEmergencyReleaseClose}
        title="Emergency release"
        description="Release funds from the Emergency Relief Fund to a family member in crisis."
        side="center"
        size="md"
      >
        <div className="space-y-4">
          <div className="ny-give-review">
            <div>
              <span>Fund</span>
              <b>Emergency Relief Fund</b>
            </div>
            <div>
              <span>Available</span>
              <b>{kes(512000)}</b>
            </div>
            <div>
              <span>Recipient</span>
              <b>Mercy Auma Nalyanya</b>
            </div>
          </div>
          <div className="ny-give-simnote">
            <ShieldCheck size={14} aria-hidden />
            Emergency release is recorded and audited. SIMULATED — no real payment is sent.
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={props.onEmergencyReleaseClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary" onClick={props.onEmergencyRelease}>
            <ShieldCheck size={14} aria-hidden />
            Release (SIMULATED)
          </button>
        </footer>
      </ModalDialog>

      {/* 15 · Contribution confirm amount (small modal) */}
      <ModalDialog
        open={props.openContributionConfirm}
        onClose={props.onContributionConfirmClose}
        title="Confirm amount"
        description="How much would you like to contribute?"
        side="center"
        size="sm"
      >
        <div className="space-y-4">
          <div className="ny-give-field">
            <span className="ny-give-label">Amount (KES)</span>
            <input type="number" min="0" className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none" placeholder="e.g. 10000" />
          </div>
          <div className="ny-give-simnote">
            <ShieldCheck size={14} aria-hidden />
            Confirming records this on the family ledger. SIMULATED — no real payment is sent.
          </div>
        </div>
        <footer className="ny-give-foot">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={props.onContributionConfirmClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary" onClick={() => props.onConfirmContribute(10000)}>
            <Send size={14} aria-hidden />
            Confirm (SIMULATED)
          </button>
        </footer>
      </ModalDialog>
    </>
  );
}

function ArchiveIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="5" y="3" width="14" height="12" rx="2" ry="2" />
      <path d="M7 8h10" />
    </svg>
  );
}
