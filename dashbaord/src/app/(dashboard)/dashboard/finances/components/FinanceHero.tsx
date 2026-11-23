import { ChevronRight, Plus } from "lucide-react";
import { PinholeStage, type MemorialPhoto } from "@/app/(dashboard)/dashboard/obituaries/components/PinholeStage";
import { useWorkspace } from "@/state/Workspace";
import { CHAMAS, SACCO_SHARES, TRANSACTIONS, totalPool, totalSharesValue } from "@/data/dashboard/finances";
import { kes } from "@/lib/format";

/* ══════════════════════════════════════════════════════════════════════
   S1 · FINANCE HERO — KPI row + featured chama camera stage
   ══════════════════════════════════════════════════════════════════════ */

interface FinanceHeroProps {
  onDeposit: () => void;
  onCreateChama: () => void;
  calm: boolean;
}

export function FinanceHero({ onDeposit, onCreateChama, calm }: FinanceHeroProps) {
  const w = useWorkspace();
  const featured = CHAMAS[0];

  const activeChamas = CHAMAS.filter((c) => c.status === "active").length;
  const totalPoolValue = totalPool();
  const totalShareValue = totalSharesValue();
  const confirmedTxns = TRANSACTIONS.filter((t) => t.status === "confirmed").length;

  const gallery: MemorialPhoto[] = featured?.gallery.map((g) => ({
    id: g.id,
    src: g.src,
    alt: g.alt,
    caption: g.caption,
    year: g.year,
    credit: g.credit,
  })) ?? [];

  return (
    <div className="ny-fin-hero">
      <div className="ny-money-stage">
        {gallery.length ? (
          <PinholeStage
            photos={gallery}
            index={0}
            style="pinhole"
            focus={{ x: 50, y: 44 }}
            calm={calm}
            label={featured?.name ?? "Family finances"}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "#0b2a1e" }}>
            <span className="text-text-tertiary text-sm">No featured finance image</span>
          </div>
        )}
        <div className="ny-money-veil" aria-hidden />
      </div>

      <div className="ny-fin-hero-copy">
        <span className="ny-fin-rule" aria-hidden />
        <p className="ny-eyebrow" style={{ color: "var(--fin-accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.7rem", marginBottom: 10 }}>
          S1 · THE MONEY ENGINE
        </p>
        <h1>
          Family finances <em>— built together</em>
        </h1>
        <p className="ny-fin-statement">
          The collective money engine: chama, merry-go-round and the family
          Sacco. Shares unlock loans, rotations build pools, and every
          transaction is recorded on the family ledger.
        </p>

        <div className="ny-fin-kpis">
          <div>
            <b className="is-gold">{kes(totalPoolValue)}</b>
            <span>Chama pools</span>
          </div>
          <div>
            <b className="is-gold">{kes(totalShareValue)}</b>
            <span>Sacco share value</span>
          </div>
          <div>
            <b>{activeChamas}</b>
            <span>Active chamas</span>
          </div>
          <div>
            <b>{SACCO_SHARES.length}</b>
            <span>Shareholding members</span>
          </div>
          <div>
            <b>{confirmedTxns}</b>
            <span>Confirmed transactions</span>
          </div>
        </div>

        <div className="ny-fin-hero-actions">
          <button type="button" className="ny-btn ny-btn-primary" onClick={onDeposit}>
            <Plus size={14} aria-hidden />
            Deposit funds
          </button>
          <button type="button" className="ny-btn ny-btn-ghost" onClick={onCreateChama}>
            <ChevronRight size={14} aria-hidden />
            Create new chama
          </button>
        </div>

        <div className="ny-fin-hero-note">
          <span role="status" aria-live="polite">
            Ledger ready — connects when the backend is wired.
          </span>
        </div>
      </div>
    </div>
  );
}
