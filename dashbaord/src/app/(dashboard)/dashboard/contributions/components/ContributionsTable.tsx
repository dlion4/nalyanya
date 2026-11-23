import { useState } from "react";
import { Eye, Printer } from "lucide-react";
import { useWorkspace } from "@/state/Workspace";
import { type Contribution, type Cause } from "@/data/dashboard/contributions"
import { kes } from "@/lib/format";

/* ═══════════════════════════════════════════════════════════════════════
   S4 · CONTRIBUTIONS TABLE — all contributions with filters + export
   ═══════════════════════════════════════════════════════════════════════ */

interface ContributionsTableProps {
  contributions: Contribution[];
  causes: Cause[];
  onOpen: (cause: Cause) => void;
}

export function ContributionsTable({
  contributions,
  causes,
  onOpen,
}: ContributionsTableProps) {
  const w = useWorkspace();

  const [filters, setFilters] = useState<{
    cause: string | "all";
    status: string | "all";
    q: string;
  }>({ cause: "all", status: "all", q: "" });

  const visible = contributions.filter((c) => {
    if (filters.cause !== "all" && c.causeId !== filters.cause) return false;
    if (filters.status !== "all" && c.status !== filters.status) return false;
    if (filters.q.trim()) {
      const term = filters.q.trim().toLowerCase();
      const hay = `${c.member} ${c.purpose} ${c.channel} ${c.reference ?? ""} ${c.ledgerRef ?? ""}`.toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  });

  const causeMap = new Map(causes.map((c) => [c.id, c.title]));

  return (
    <section className="ny-give-section" aria-labelledby="contributions-table">
      <div className="ny-give-section-head">
        <div>
          <p className="ny-eyebrow" style={{ color: "var(--give-accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.7rem", marginBottom: 10 }}>
            S4 · THE CONTRIBUTIONS TABLE
          </p>
          <h2 id="contributions-table">Every contribution on the ledger</h2>
          <p className="ny-give-section-intro">
            Date · contributor · cause · amount · channel · status · receipt ·
            ledger ref. Filters and export are on this device only — SIMULATED.
          </p>
        </div>
        <div className="ny-give-table-actions">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => w.setToast("Export prepared — CSV download connects when the backend is wired.")}>
            <Printer size={13} aria-hidden />
            Export CSV
          </button>
        </div>
      </div>

      <div className="ny-give-table-wrap">
        <div className="ny-give-table-row is-head">
          <span>Date</span>
          <span>Contributor</span>
          <span>Cause</span>
          <span>Amount</span>
          <span>Channel</span>
          <span>Status</span>
          <span style={{ textAlign: "right" }}>Receipt</span>
        </div>
        {visible.length === 0 ? (
          <div className="ny-give-table-row">
            <span style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px", color: "var(--color-text-tertiary)" }}>
              No contributions match your filters.
            </span>
          </div>
        ) : (
          visible.map((c) => {
            const causeTitle = causeMap.get(c.causeId) ?? "Unknown cause";
            return (
              <div
                key={c.id}
                className="ny-give-table-row"
                onClick={() => {
                  const cause = causes.find((x) => x.id === c.causeId);
                  if (cause) onOpen(cause);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const cause = causes.find((x) => x.id === c.causeId);
                    if (cause) onOpen(cause);
                  }
                }}
              >
                <span>{new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                <span className="text-text-primary font-medium">{c.member}</span>
                <span className="text-sm">{causeTitle}</span>
                <span className="font-display font-semibold text-give-ink">{kes(c.amount)}</span>
                <span className="ny-give-channel-chip">
                  <span aria-hidden>{c.channel === "mpesa" ? "📱" : c.channel === "airtel" ? "📱" : c.channel === "bank" ? "🏦" : "📒"}</span>{" "}
                  {c.channelLabel}
                </span>
                <span className={`ny-give-status-chip is-${c.status}`}>{c.status}</span>
                <span style={{ textAlign: "right" }}>
                  {c.receiptUrl ? (
                    <a href={c.receiptUrl} target="_blank" rel="noopener noreferrer" className="ny-give-table-receipt" onClick={(e) => e.stopPropagation()}>
                      <Eye size={12} aria-hidden />
                      View
                    </a>
                  ) : (
                    <span className="text-text-tertiary text-xs">—</span>
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>

      <p className="ny-give-quiet" style={{ marginTop: 10 }}>
        Click any row to open the cause detail drawer · every integration is
        SIMULATED — Ready — connects when the backend is wired.
      </p>
    </section>
  );
}
