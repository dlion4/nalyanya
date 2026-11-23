import { useMemo, useState } from "react";
import { Filter, Plus, ScrollText } from "lucide-react";
import { useWorkspace } from "@/state/Workspace";
import { TRANSACTIONS, type FinanceTransaction, transactionTypeLabel } from "@/data/dashboard/finances";
import { kes } from "@/lib/format";

/* ══════════════════════════════════════════════════════════════════════
   S4 · FINANCE TRANSACTIONS — table with filters + export
   ══════════════════════════════════════════════════════════════════════ */

interface FinanceTransactionsProps {
  onExport: () => void;
  onNewTransaction: () => void;
  calm: boolean;
}

export interface TxnFilters {
  type: "all" | FinanceTransaction["type"];
  status: "all" | FinanceTransaction["status"];
  q: string;
}

export function FinanceTransactions({ onExport, onNewTransaction, calm }: FinanceTransactionsProps) {
  const w = useWorkspace();
  const [filters, setFilters] = useState<TxnFilters>({ type: "all", status: "all", q: "" });

  const visible = useMemo(() => {
    const term = filters.q.trim().toLowerCase();
    return TRANSACTIONS.filter((t) => {
      if (filters.type !== "all" && t.type !== filters.type) return false;
      if (filters.status !== "all" && t.status !== filters.status) return false;
      if (term) {
        const hay = `${t.member} ${t.note} ${t.reference} ${t.channel}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [filters]);

  return (
    <div className="ny-fin-section">
      <div className="ny-fin-section-head">
        <div>
          <span className="ny-fin-section-number">S4 · TRANSACTIONS</span>
          <h2 className="ny-fin-section-title">Ledger history</h2>
        </div>
        <div className="ny-fin-section-actions">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onExport}>
            <ScrollText size={14} aria-hidden />
            Export
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onNewTransaction}>
            <Plus size={14} aria-hidden />
            New transaction
          </button>
        </div>
      </div>

      <div className="ny-fin-filter-bar">
        {[
          { id: "all", label: "All types" },
          { id: "deposit", label: "Deposit" },
          { id: "withdrawal", label: "Withdrawal" },
          { id: "contribution", label: "Contribution" },
          { id: "payout", label: "Payout" },
          { id: "loan-repayment", label: "Loan repayment" },
          { id: "share-purchase", label: "Share purchase" },
        ].map((t) => {
          const active = filters.type === t.id;
          return (
            <button
              key={t.id}
              type="button"
              className={`ny-fin-filter-chip ${active ? "active" : ""}`}
              onClick={() => setFilters({ ...filters, type: t.id as TxnFilters["type"] })}
            >
              {t.label}
            </button>
          );
        })}
        {[
          { id: "all", label: "All status" },
          { id: "confirmed", label: "Confirmed" },
          { id: "pending", label: "Pending" },
          { id: "failed", label: "Failed" },
        ].map((s) => {
          const active = filters.status === s.id;
          return (
            <button
              key={s.id}
              type="button"
              className={`ny-fin-filter-chip ${active ? "active" : ""}`}
              onClick={() => setFilters({ ...filters, status: s.id as TxnFilters["status"] })}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="ny-fin-table-wrap">
        <table className="ny-fin-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Member</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Balance</th>
              <th>Channel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((txn) => (
              <tr key={txn.id}>
                <td>
                  <span className="ny-fin-txn-ref">{txn.reference}</span>
                </td>
                <td>
                  <div className="flex items-center gap-8">
                    <img
                      src={memberImage(txn.member)}
                      alt={txn.member}
                      className="w-5 h-5 rounded-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/images/family/reunion.jpg"; }}
                    />
                    <span className="ny-fin-txn-member">{txn.member}</span>
                  </div>
                </td>
                <td>
                  <span className="ny-fin-txn-type">{transactionTypeLabel(txn.type)}</span>
                </td>
                <td>
                  <span className={`ny-fin-txn-amount ${txn.type === 'deposit' ? 'is-positive' : txn.type === 'withdrawal' || txn.type === 'payout' ? 'is-negative' : 'is-positive'}`}>
                    {txn.type === 'deposit' ? '+' : ''}{kes(txn.amount)}
                  </span>
                </td>
                <td>
                  <span className="ny-fin-txn-amount">{kes(txn.balance)}</span>
                </td>
                <td>
                  <span className="ny-fin-txn-channel">{txn.channel}</span>
                </td>
                <td>
                  <span className={`ny-fin-txn-status ${txn.status}`}>{txn.status}</span>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={7} className="ny-fin-table-empty">
                  No transactions match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-hairline/50">
        <div className="ny-fin-simulated">
          <span className="ny-fin-sim-dot" aria-hidden></span>
          Transaction entry is SIMULATED — connects when the backend is wired.
        </div>
      </div>
    </div>
  );
}

function memberImage(member: string): string {
  const map: Record<string, string> = {
    "Peter Otieno Nalyanya": "/images/family/peter.jpg",
    "Naomi Achieng Nalyanya": "/images/family/naomi.jpg",
    "Mercy Auma Nalyanya": "/images/family/mercy.jpg",
    "Tom Mutua Okoth": "/images/family/tom.jpg",
    "Daniel Wafula Nalyanya": "/images/family/daniel.jpg",
    "Lynn Ruth Wakoli": "/images/family/ruth.jpg",
    "Caleb Kiprono Nalyanya": "/images/family/caleb.jpg",
    "Hellen Nasimiyu Nalyanya": "/images/family/hellen.jpg",
  };
  return map[member] ?? "/images/family/reunion.jpg";
}
