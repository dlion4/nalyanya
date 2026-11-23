import { ChevronRight, Eye, Plus } from "lucide-react";
import { PinholeStage, type MemorialPhoto } from "@/app/(dashboard)/dashboard/obituaries/components/PinholeStage";
import { useWorkspace } from "@/state/Workspace";
import { type Cause, type CauseFilters } from "@/data/dashboard/contributions"
import { kes } from "@/lib/format";

/* ═══════════════════════════════════════════════════════════════════════
   S2 · CAUSES GRID — filterable cards with pinhole stage images
   ═══════════════════════════════════════════════════════════════════════ */

interface CauseCardsProps {
  causes: Cause[];
  filters: CauseFilters;
  onChange: (patch: Partial<CauseFilters>) => void;
  onContribute: (cause: Cause) => void;
  onOpen: (cause: Cause) => void;
  calm: boolean;
}

export function CauseCards({
  causes,
  filters,
  onChange,
  onContribute,
  onOpen,
  calm,
}: CauseCardsProps) {
  const w = useWorkspace();

  const visible = causes.filter((c) => {
    if (filters.purpose !== "all" && c.purpose !== filters.purpose) return false;
    if (filters.status !== "all" && c.status !== filters.status) return false;
    if (filters.q.trim()) {
      const term = filters.q.trim().toLowerCase();
      const hay = `${c.title} ${c.purposeLabel} ${c.beneficiary} ${c.description} ${c.tags.join(" ")}`.toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  });

  const progress = (c: Cause) => Math.min(100, Math.round((c.raised / c.goal) * 100));

  const purposePills: { id: string; label: string }[] = [
    { id: "all", label: "All purposes" },
    { id: "wedding", label: "Wedding" },
    { id: "sickness", label: "Sickness" },
    { id: "funeral", label: "Funeral" },
    { id: "project", label: "Project" },
    { id: "education", label: "Education" },
    { id: "emergency", label: "Emergency" },
  ];

  const purposeTone: Record<string, string> = {
    wedding: "is-wedding",
    sickness: "is-sickness",
    funeral: "is-funeral",
    project: "is-project",
    education: "is-education",
    emergency: "is-emergency",
  };

  return (
    <section className="ny-give-section" aria-labelledby="causes">
      <div className="ny-give-section-head">
        <div>
          <p className="ny-eyebrow" style={{ color: "var(--give-accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.7rem", marginBottom: 10 }}>
            S2 · THE CAUSES
          </p>
          <h2 id="causes">Causes the family gives to</h2>
          <p className="ny-give-section-intro">
            Open causes with live tallies. Tap a cause to read its story, see
            contributors and payouts — or contribute straight from the card.
          </p>
        </div>
        <span className="ny-give-count">
          <b className="ny-num">{visible.length}</b> of {causes.length} causes
        </span>
      </div>

      <div className="ny-give-filters">
        <div className="ny-give-filter-chips">
          {purposePills.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`ny-give-filter-chip ${filters.purpose === p.id ? "is-active" : ""}`}
              onClick={() => onChange({ purpose: p.id as CauseFilters["purpose"] })}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="ny-give-filter-controls">
          <label
            className="ny-give-search"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "0 11px",
              minHeight: 36,
              borderRadius: 9999,
              border: "1px solid var(--color-hairline)",
              background: "var(--color-surface-0)",
              color: "var(--color-text-tertiary)",
            }}
          >
            <span style={{ fontSize: 14 }} aria-hidden>🔍</span>
            <input
              type="search"
              placeholder="Search causes…"
              value={filters.q}
              onChange={(e) => onChange({ q: e.target.value })}
              style={{
                border: 0,
                background: "transparent",
                outline: "none",
                fontSize: 0.8,
                width: 170,
                color: "var(--color-text-primary)",
              }}
            />
          </label>
          <button
            type="button"
            className="ny-btn ny-btn-ghost ny-btn-sm"
            onClick={() => {
              const st =
                filters.status === "open"
                  ? "closed"
                  : filters.status === "closed"
                    ? "all"
                    : "open";
              onChange({ status: st as CauseFilters["status"] });
            }}
          >
            {filters.status === "all"
              ? "Open only"
              : filters.status === "open"
                ? "Include closed"
                : "All statuses"}
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="ny-give-empty">
          <span style={{ fontSize: 48, lineHeight: 1, display: "block", marginBottom: 10 }} aria-hidden>🔍</span>
          <h3>No causes match your filters</h3>
          <p>Try a different purpose, status or search term.</p>
          <button type="button" className="ny-btn ny-btn-primary" onClick={() => onChange({ q: "", purpose: "all", status: "all" })}>
            <Eye size={14} aria-hidden />
            Clear filters
          </button>
        </div>
      ) : (
        <div className="ny-give-cards">
          {visible.map((cause) => (
            <article key={cause.id} className="ny-give-card">
              <div className="ny-give-card-stage">
                <PinholeStage
                  photos={cause.gallery.map((g) => ({
                    id: g.id,
                    src: g.src,
                    alt: g.alt,
                    caption: g.caption,
                    year: g.year,
                    credit: g.credit,
                  })) as MemorialPhoto[]}
                  index={0}
                  style="pinhole"
                  focus={{ x: 50, y: 48 }}
                  calm={calm}
                  bare
                  label={cause.title}
                />
                <span className={`ny-give-card-purpose ${purposeTone[cause.purpose] ?? ""}`}>
                  {cause.purposeLabel}
                </span>
                <span className="ny-give-card-deadline">{cause.deadline}</span>
              </div>
              <div className="ny-give-card-body">
                <h3>{cause.title}</h3>
                <p className="ny-give-card-beneficiary">
                  {cause.beneficiaryAnonymized ? "Beneficiary (anonymized)" : cause.beneficiary}
                </p>
                <div className="ny-give-card-meta">
                  <span className="ny-give-contributors">
                    <span aria-hidden>👥</span> {cause.contributors}
                  </span>
                  <span className="ny-give-raised">
                    {kes(cause.raised)} / {kes(cause.goal)}
                  </span>
                </div>
                <div className="ny-give-card-progress">
                  <div className="ny-give-card-progress-head">
                    <span>{cause.purposeLabel} goal</span>
                    <b>{progress(cause)}%</b>
                  </div>
                  <div className="ny-give-card-progress-bar">
                    <div className="ny-give-card-progress-fill" style={{ width: `${progress(cause)}%` }} />
                  </div>
                </div>
              </div>
              <div className="ny-give-card-actions">
                <button type="button" className="ny-btn ny-btn-primary" onClick={() => onContribute(cause)}>
                  <Plus size={13} aria-hidden />
                  Contribute
                </button>
                <button type="button" className="ny-btn ny-btn-ghost" onClick={() => onOpen(cause)}>
                  <Eye size={13} aria-hidden />
                  Details
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
