import { ShieldCheck, Wallet, ChevronRight } from "lucide-react";
import { useWorkspace } from "@/state/Workspace";
import { SACCO_SHARES, totalSharesValue } from "@/data/dashboard/finances";
import { kes } from "@/lib/format";

/* ══════════════════════════════════════════════════════════════════════
   S3 · SACCO PANEL — shares, loan eligibility, member balances
   ══════════════════════════════════════════════════════════════════════ */

interface SaccoPanelProps {
  onViewShares: () => void;
  calm: boolean;
}

export function SaccoPanel({ onViewShares, calm }: SaccoPanelProps) {
  const w = useWorkspace();
  const totalValue = totalSharesValue();
  const totalShares = SACCO_SHARES.reduce((s, sh) => s + sh.shares, 0);
  const eligibleMembers = SACCO_SHARES.filter((sh) => sh.loanEligible).length;
  const totalLoanLimit = SACCO_SHARES.reduce((s, sh) => s + sh.loanLimit, 0);

  return (
    <div className="ny-fin-section">
      <div className="ny-fin-section-head">
        <div>
          <span className="ny-fin-section-number">S3 · SACCO PANEL</span>
          <h2 className="ny-fin-section-title">Family Sacco & shares</h2>
        </div>
        <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onViewShares}>
          <ChevronRight size={14} aria-hidden />
          View all shares
        </button>
      </div>

      <div className="ny-fin-kpis" style={{ marginBottom: 20 }}>
        <div>
          <b className="is-gold font-mono text-lg">{kes(totalValue)}</b>
          <span className="text-text-tertiary text-xs">Total share value</span>
        </div>
        <div>
          <b className="font-mono text-lg">{totalShares}</b>
          <span className="text-text-tertiary text-xs">Shares issued</span>
        </div>
        <div>
          <b className="font-mono text-lg">{eligibleMembers}</b>
          <span className="text-text-tertiary text-xs">Loan-eligible members</span>
        </div>
        <div>
          <b className="is-gold font-mono text-lg">{kes(totalLoanLimit)}</b>
          <span className="text-text-tertiary text-xs">Combined loan headroom</span>
        </div>
      </div>

      <div className="ny-fin-sacco-panel">
        <div className="ny-fin-sacco-header">
          <h3 className="ny-fin-sacco-title">Member shareholdings</h3>
          <p className="ny-fin-sacco-sub">
            KES 1,250 per share. Shares unlock loans up to 60% of share value.
          </p>
        </div>
        <div className="ny-fin-sacco-grid">
          {SACCO_SHARES.map((share) => (
            <div key={share.id} className="ny-fin-sacco-share">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-8">
                  <img
                    src={share.image}
                    alt={share.member}
                    className="w-8 h-8 rounded-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/images/family/reunion.jpg"; }}
                  />
                  <div>
                    <div className="ny-fin-share-member">{share.member}</div>
                    <div className="text-xs text-text-tertiary">{share.shares} shares</div>
                  </div>
                </div>
                <div className="ny-fin-share-loan {share.loanEligible ? 'is-eligible' : 'is-not-eligible'}">
                  {share.loanEligible ? "Loan eligible" : "Not eligible"}
                </div>
              </div>
              <div className="ny-fin-share-stats">
                <span>{kes(share.totalValue)} value</span>
                <span>{share.loanEligible ? kes(share.loanLimit) : "—"} loan headroom</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-hairline/50">
        <div className="ny-fin-simulated">
          <span className="ny-fin-sim-dot" aria-hidden></span>
          Sacco operations are SIMULATED — shares and loan limits connect when the backend is wired.
        </div>
        <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onViewShares} style={{ width: '100%' }}>
          <Wallet size={14} aria-hidden />
          Manage share portfolio
        </button>
      </div>
    </div>
  );
}
