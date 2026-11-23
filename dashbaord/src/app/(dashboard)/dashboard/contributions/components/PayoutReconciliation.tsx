import { useState } from "react";
import { Banknote, RotateCcw, ShieldCheck, Upload } from "lucide-react";
import { useWorkspace } from "@/state/Workspace";
import { type Payout, PAYOUTS } from "@/data/dashboard/contributions"
import { kes } from "@/lib/format";

/* ═══════════════════════════════════════════════════════════════════════
   S7 · PAYOUT & RECONCILIATION — release funds, double-entry ledger, SIMULATED
   ═══════════════════════════════════════════════════════════════════════ */

interface PayoutReconciliationProps {
  causes: { id: string; title: string }[];
}

export function PayoutReconciliation({ causes }: PayoutReconciliationProps) {
  const w = useWorkspace();
  const [filter, setFilter] = useState<"all" | "queued" | "released" | "held">("all");

  const visible = PAYOUTS.filter((p) => filter === "all" || p.status === filter);

  const totalQueued = PAYOUTS.filter((p) => p.status === "queued").reduce((s, p) => s + p.amount, 0);
  const totalReleased = PAYOUTS.filter((p) => p.status === "released").reduce((s, p) => s + p.amount, 0);
  const totalHeld = PAYOUTS.filter((p) => p.status === "held").reduce((s, p) => s + p.amount, 0);

  return (
    <section className="ny-give-section" aria-labelledby="payout-reconciliation">
      <div className="ny-give-section-head">
        <div>
          <p className="ny-eyebrow" style={{ color: "var(--give-accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.7rem", marginBottom: 10 }}>
            S7 · PAYOUT & RECONCILIATION
          </p>
          <h2 id="payout-reconciliation">Release funds to organizers</h2>
          <p className="ny-give-section-intro">
            Release payouts when goals are met. Every release is a double-entry
            ledger event, reconciled against M-Pesa statements — SIMULATED.
          </p>
        </div>
      </div>

      <div className="ny-give-kpis">
        <div>
          <b>{totalReleased.toLocaleString("en-KE")}</b>
          <span>Released (KES)</span>
        </div>
        <div>
          <b>{totalQueued.toLocaleString("en-KE")}</b>
          <span>Queued payouts</span>
        </div>
        <div>
          <b>{totalHeld.toLocaleString("en-KE")}</b>
          <span>Held payouts</span>
        </div>
      </div>

      <div className="ny-give-filter-chips" style={{ margin: "18px 0", display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { id: "all" as const, label: "All" },
          { id: "queued" as const, label: "Queued" },
          { id: "released" as const, label: "Released" },
          { id: "held" as const, label: "Held" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            className={`px-4 py-2 rounded-full border text-sm font-medium transition ${filter === f.id ? "border-give-ink bg-[#16211b] text-[#fdfbf5]" : "border-hairline bg-surface-0 text-text-secondary hover:border-give-accent"}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="ny-give-table-wrap">
        <div className="ny-give-table-row is-head">
          <span>Cause</span>
          <span>Recipient</span>
          <span>Amount</span>
          <span>Channel</span>
          <span>Status</span>
          <span style={{ textAlign: "right" }}>Action</span>
        </div>
        {visible.length === 0 ? (
          <div className="ny-give-table-row">
            <span style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px", color: "var(--color-text-tertiary)" }}>
              No payouts match your filter.
            </span>
          </div>
        ) : (
          visible.map((p) => (
            <div key={p.id} className="ny-give-table-row">
              <span>{causes.find((c) => c.id === p.causeId)?.title ?? "Unknown cause"}</span>
              <span className="text-text-primary font-medium">{p.recipient}</span>
              <span className="font-display font-semibold text-give-ink">{kes(p.amount)}</span>
              <span className="ny-give-channel-chip">
                <span aria-hidden>{p.channel === "mpesa" ? "📱" : p.channel === "bank" ? "🏦" : "📒"}</span>{" "}
                {p.channel === "mpesa" ? "M-Pesa" : p.channel === "bank" ? "Bank" : p.channel === "airtel" ? "Airtel Money" : "Family ledger"}
              </span>
              <span className={`ny-give-status-chip is-${p.status === "released" ? "confirmed" : p.status === "queued" ? "pending" : "failed"}`}>
                {p.status}
              </span>
              <span style={{ textAlign: "right" }}>
                {p.status === "queued" || p.status === "held" ? (
                  <button
                    type="button"
                    className="ny-btn ny-btn-primary ny-btn-sm"
                    onClick={() => {
                      w.setToast(
                        `Payout released to ${p.recipient} — SIMULATED, not sent.`,
                      );
                    }}
                  >
                    <ShieldCheck size={13} aria-hidden />
                    Release
                  </button>
                ) : (
                  <span className="text-text-tertiary text-xs">Done</span>
                )}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 border-t border-hairline pt-6">
        <div className="flex items-center gap-3">
          <Banknote size={16} className="text-text-tertiary" aria-hidden />
          <div>
            <h3 className="font-medium text-text-primary">Reconcile against M-Pesa statement</h3>
            <p className="text-sm text-text-secondary">
              Match each payout to its M-Pesa reference. Double-entry ledger
              keeps both sides in balance — SIMULATED until the backend is wired.
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button type="button" className="ny-btn ny-btn-ghost" onClick={() => w.setToast("M-Pesa statement import prepared — SIMULATED.")}>
            <Upload size={14} aria-hidden />
            Import statement
          </button>
          <button type="button" className="ny-btn ny-btn-ghost" onClick={() => w.setToast("Ledger reconciliation queued — SIMULATED.")}>
            <RotateCcw size={14} aria-hidden />
            Reconcile now
          </button>
        </div>
      </div>
    </section>
  );
}
