import { ChevronRight, Plus } from "lucide-react";
import { PinholeStage, type MemorialPhoto } from "@/app/(dashboard)/dashboard/obituaries/components/PinholeStage";
import { useWorkspace } from "@/state/Workspace";
import { type Cause } from "@/data/dashboard/contributions"
import { kes } from "@/lib/format";

/* ═══════════════════════════════════════════════════════════════════════
   S1 · CONTRIBUTION HERO — KPI row + featured cause stage
   ═══════════════════════════════════════════════════════════════════════ */

interface ContributionHeroProps {
  causes: Cause[];
  onContribute: () => void;
  calm: boolean;
}

export function ContributionHero({ causes, onContribute, calm }: ContributionHeroProps) {
  const w = useWorkspace();
  const featured = causes[0];

  const activeCauses = causes.filter((c) => c.status === "open").length;
  const totalRaised = causes.reduce((s, c) => s + c.raised, 0);
  const causesYouBenefit = causes.filter((c) => c.payoutStatus === "queued").length;

  const gallery: MemorialPhoto[] = featured?.gallery.map((g) => ({
    id: g.id,
    src: g.src,
    alt: g.alt,
    caption: g.caption,
    year: g.year,
    credit: g.credit,
  })) ?? [];

  return (
    <div className="ny-give-hero">
      <div className="ny-give-hero-stage">
        {gallery.length ? (
          <PinholeStage
            photos={gallery}
            index={0}
            style="pinhole"
            focus={{ x: 50, y: 44 }}
            calm={calm}
            label={featured?.title ?? "Family giving"}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--give-dusk)" }}>
            <span className="text-text-tertiary text-sm">No featured cause image</span>
          </div>
        )}
        <div className="ny-give-hero-veil" aria-hidden />
      </div>

      <div className="ny-give-hero-copy">
        <span className="ny-give-rule" aria-hidden />
        <p className="ny-eyebrow" style={{ color: "var(--give-accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.7rem", marginBottom: 10 }}>
          S1 · THE GIVING HUB
        </p>
        <h1>
          Family contributions <em>— given together</em>
        </h1>
        <p className="ny-give-statement">
          Create and contribute to any cause — weddings, sickness, funerals,
          harambees, projects, education, emergencies. Every contribution is
          recorded, receipted and reconciled on the family ledger.
        </p>

        <div className="ny-give-kpis">
          <div>
            <b>{activeCauses}</b>
            <span>Active causes</span>
          </div>
          <div>
            <b>{totalRaised.toLocaleString("en-KE")}</b>
            <span>KES raised</span>
          </div>
          <div>
            <b>{causes.length}</b>
            <span>Total causes</span>
          </div>
          <div>
            <b>{causesYouBenefit}</b>
            <span>You benefit from</span>
          </div>
          <div>
            <b>{pendingVerification()}</b>
            <span>Pending verification</span>
          </div>
        </div>

        <div className="ny-give-hero-actions">
          <button type="button" className="ny-btn ny-btn-primary" onClick={onContribute}>
            <Plus size={14} aria-hidden />
            Contribute to a cause
          </button>
          <button type="button" className="ny-btn ny-btn-ghost" onClick={() => w.setToast("Create a cause — admin gate connects when the backend is wired.")}>
            <ChevronRight size={14} aria-hidden />
            Create new cause
          </button>
        </div>

        <div className="ny-give-hero-note">
          <span role="status" aria-live="polite">
            {w.local.entries.length > 0 ? `Last activity: ${w.local.entries[0].title} — ${kes(w.local.entries[0].amount)}` : "Ledger ready — connects when the backend is wired."}
          </span>
        </div>
      </div>
    </div>
  );
}

function pendingVerification(): number {
  /* Deterministic mock — in production this comes from the ledger. */
  return 3;
}

