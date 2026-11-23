import { ChevronRight, Eye, Plus, Users } from "lucide-react";
import { PinholeStage, type MemorialPhoto } from "@/app/(dashboard)/dashboard/obituaries/components/PinholeStage";
import { useWorkspace } from "@/state/Workspace";
import { CHAMAS, type Chama, type ChamaCadence } from "@/data/dashboard/finances";
import { kes } from "@/lib/format";

/* ══════════════════════════════════════════════════════════════════════
   S2 · CHAMA CARDS — filterable grid with pinhole stage images
   ══════════════════════════════════════════════════════════════════════ */

export interface ChamaFilters {
  status: "all" | "active" | "paused";
  cadence: "all" | "Weekly" | "Fortnightly" | "Monthly";
  q: string;
}

interface ChamaCardsProps {
  chamas: Chama[];
  filters: ChamaFilters;
  onChange: (patch: Partial<ChamaFilters>) => void;
  onDeposit: (chama: Chama) => void;
  onOpen: (chama: Chama) => void;
  calm: boolean;
}

export function ChamaCards({ chamas, filters, onChange, onDeposit, onOpen, calm }: ChamaCardsProps) {
  const visible = chamas.filter((c) => {
    if (filters.status !== "all" && c.status !== filters.status) return false;
    if (filters.cadence !== "all" && c.cadence !== filters.cadence) return false;
    const term = filters.q.trim().toLowerCase();
    if (term) {
      const hay = `${c.name} ${c.purpose} ${c.recipient}`.toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  });

  const cadenceLabel = (c: ChamaCadence): string => {
    const map: Record<string, string> = {
      Weekly: "Weekly",
      Fortnightly: "Fortnightly",
      Monthly: "Monthly",
    };
    return map[c] ?? c;
  };

  return (
    <div className="ny-fin-section">
      <div className="ny-fin-section-head">
        <div>
          <span className="ny-fin-section-number">S2 · CHAMAS & MERRY-GO-ROUND</span>
          <h2 className="ny-fin-section-title">Active saving circles</h2>
        </div>
        <div className="ny-fin-filter-bar">
          {[
            { id: "all", label: "All" },
            { id: "active", label: "Active" },
            { id: "paused", label: "Paused" },
          ].map((s) => {
            const active = filters.status === s.id;
            return (
              <button
                key={s.id}
                type="button"
                className={`ny-fin-filter-chip ${active ? "active" : ""}`}
                onClick={() => onChange({ status: s.id as ChamaFilters["status"] })}
              >
                {s.label}
              </button>
            );
          })}
          {[
            { id: "all", label: "All cadence" },
            { id: "Weekly", label: "Weekly" },
            { id: "Fortnightly", label: "Fortnightly" },
            { id: "Monthly", label: "Monthly" },
          ].map((c) => {
            const active = filters.cadence === c.id;
            return (
              <button
                key={c.id}
                type="button"
                className={`ny-fin-filter-chip ${active ? "active" : ""}`}
                onClick={() => onChange({ cadence: c.id as ChamaFilters["cadence"] })}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ny-fin-grid">
        {visible.map((chama) => (
          <div key={chama.id} className="ny-fin-card">
            <div className="ny-fin-card-stage">
              <PinholeStage
                photos={chama.gallery.map((g) => ({
                  id: g.id,
                  src: g.src,
                  alt: g.alt,
                  caption: g.caption,
                  year: g.year,
                  credit: g.credit,
                }))}
                index={0}
                style="pinhole"
                focus={{ x: 50, y: 46 }}
                calm={calm}
                bare
                label={chama.name}
              />
              <span className="ny-fin-chip {chama.status === 'active' ? 'is-active' : 'is-paused'}" style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
                {chama.status === 'active' ? 'Active' : 'Paused'}
              </span>
            </div>
            <div className="ny-fin-card-body">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h3 className="ny-fin-card-title">{chama.name}</h3>
                  <p className="ny-fin-card-purpose">{chama.purpose}</p>
                </div>
                <div className="text-right">
                  <b className="block text-lg font-semibold is-gold font-mono">{kes(chama.pool)}</b>
                  <span className="text-xs text-text-tertiary">pool</span>
                </div>
              </div>
              <div className="ny-fin-card-meta">
                <span className="ny-fin-chip">
                  <Users size={10} aria-hidden />
                  {chama.members} members
                </span>
                <span className="ny-fin-chip">
                  {cadenceLabel(chama.cadence)}
                </span>
                <span className="ny-fin-chip">
                  {chama.position} of {chama.of}
                </span>
              </div>
            </div>
            <div className="ny-fin-card-footer">
              <div className="ny-fin-card-row">
                <span className="ny-fin-label">Next payout</span>
                <b className="ny-fin-value">{chama.nextPayout}</b>
              </div>
              <div className="ny-fin-card-row">
                <span className="ny-fin-label">Recipient</span>
                <b className="ny-fin-value">{chama.recipient}</b>
              </div>
              <div className="ny-fin-card-row">
                <span className="ny-fin-label">Contribution</span>
                <b className="ny-fin-value">{kes(chama.contributionKes)}</b>
              </div>
            </div>
            <div className="ny-fin-card-actions">
              <button type="button" className="ny-fin-btn-sm is-primary" onClick={() => onDeposit(chama)}>
                <Plus size={12} aria-hidden />
                Deposit
              </button>
              <button type="button" className="ny-fin-btn-sm" onClick={() => onOpen(chama)}>
                <Eye size={12} aria-hidden />
                Details
              </button>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-text-tertiary text-sm">No chamas match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
