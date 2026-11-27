import { ShieldCheck, ScrollText, ChevronRight } from "lucide-react";
import { useWorkspace } from "@/state/Workspace";
import { GOVERNANCE, type GovernanceItem } from "@/data/dashboard/finances";

/* ══════════════════════════════════════════════════════════════════════
   S7 · GOVERNANCE & AUDIT — compliance, approvals, audit trail
   ══════════════════════════════════════════════════════════════════════ */

interface GovernanceAuditProps {
  onViewAudit: () => void;
  calm: boolean;
}

const STATUS_STYLE: Record<GovernanceItem["status"], { color: string; bg: string }> = {
  open: { color: "#b9c6b3", bg: "rgba(185, 198, 179, 0.1)" },
  approved: { color: "#7fd0b7", bg: "rgba(127, 208, 183, 0.1)" },
  rejected: { color: "#d86b9b", bg: "rgba(216, 107, 155, 0.1)" },
  "pending-review": { color: "#d4a437", bg: "rgba(212, 164, 55, 0.1)" },
};

export function GovernanceAudit({ onViewAudit, calm }: GovernanceAuditProps) {
  const w = useWorkspace();
  const openItems = GOVERNANCE.filter((g) => g.status === "open" || g.status === "pending-review");
  const approvedItems = GOVERNANCE.filter((g) => g.status === "approved");

  return (
    <div className="ny-fin-section">
      <div className="ny-fin-section-head">
        <div>
          <span className="ny-fin-section-number">S7 · GOVERNANCE & AUDIT</span>
          <h2 className="ny-fin-section-title">Compliance & approvals</h2>
        </div>
        <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onViewAudit}>
          <ChevronRight size={14} aria-hidden />
          Full audit trail
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-surface-0/30 rounded-xl p-5 border border-hairline">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-text-primary">Open items</h3>
            <span className="text-xs font-mono font-bold text-amber-400">{openItems.length}</span>
          </div>
          <div className="space-y-3">
            {openItems.map((item) => {
              const style = STATUS_STYLE[item.status];
              return (
                <div key={item.id} className="p-3 rounded-lg border border-hairline bg-surface-1/50">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="font-medium text-text-primary text-sm">{item.title}</div>
                    <span
                      className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ color: style.color, backgroundColor: style.bg }}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary">{item.due}</div>
                </div>
              );
            })}
            {openItems.length === 0 && (
              <div className="text-text-tertiary text-sm text-center py-4">No open governance items.</div>
            )}
          </div>
        </div>

        <div className="bg-surface-0/30 rounded-xl p-5 border border-hairline">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-text-primary">Approved this month</h3>
            <span className="text-xs font-mono font-bold text-green-600">{approvedItems.length}</span>
          </div>
          <div className="space-y-3">
            {approvedItems.map((item) => (
              <div key={item.id} className="p-3 rounded-lg border border-hairline bg-surface-1/50">
                <div className="font-medium text-text-primary text-sm">{item.title}</div>
                <div className="text-xs text-text-secondary">Owner: {item.owner}</div>
                <div className="text-[10px] text-text-tertiary mt-1 font-mono uppercase">Approved</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface-0/30 rounded-xl p-5 border border-hairline">
        <h3 className="font-medium text-text-primary mb-4">Recent audit entries</h3>
        <div className="space-y-3">
          {[
            { date: "2 min ago", actor: "System", action: "Chama rotation confirmed", ref: "NY-AUD-001" },
            { date: "1 h ago", actor: "Peter Otieno", action: "KES 40,000 contribution recorded", ref: "NY-AUD-002" },
            { date: "3 h ago", actor: "Committee", action: "Payout approved for Wazee Round", ref: "NY-AUD-003" },
            { date: "1 day ago", actor: "System", action: "Sacco share revaluation queued", ref: "NY-AUD-004" },
            { date: "2 days ago", actor: "Audit Committee", action: "Harambhee Fund payout freeze reviewed", ref: "NY-AUD-005" },
          ].map((a) => (
            <div key={a.ref} className="flex items-start justify-between px-3 py-3 rounded-lg border border-hairline bg-surface-0/30">
              <div className="flex-1">
                <div className="font-medium text-text-primary text-sm">{a.action}</div>
                <div className="text-xs text-text-secondary">{a.actor} • {a.date}</div>
              </div>
              <div className="text-[10px] text-text-tertiary font-mono">{a.ref}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-hairline/50">
        <div className="ny-fin-simulated">
          <span className="ny-fin-sim-dot" aria-hidden></span>
          Governance actions are SIMULATED — approvals connect when the backend is wired.
        </div>
        <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onViewAudit} style={{ width: '100%' }}>
          <ScrollText size={14} aria-hidden />
          Open full audit trail
        </button>
      </div>
    </div>
  );
}
