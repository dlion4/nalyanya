import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronRight,
  Download,
  FileText,
  Glasses,
  Link2,
  Mail,
  MessageCircle,
  Network,
  Plus,
  Wallet,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useWorkspace } from "@/state/Workspace";
import {
  family,
  kes,
  localDate,
  members,
} from "@/data/dashboard/command-center";
import {
  IconBox,
  SectionTitle,
  Simulated,
} from "@/components/shared/Primitives";
import {
  BranchPanel,
  ContributionPanel,
  FundPanel,
  IntegrationPanel,
  SavingsPanel,
} from "@/components/dashboard/DashboardSections";
import { LineagePreview } from "@/components/lineage/LineagePreview";
import { FinancePanel } from "@/components/dashboard/FinancePanel";
import {
  EventsList,
  GalleryGrid,
  MemberDirectory,
} from "@/components/overlays/WorkspaceLists";
import {
  Details,
  ProfileContent,
  RecordsList,
} from "@/components/overlays/DetailViews";
import { downloadText } from "@/utils/download";
import type { PageConfig } from "@/types/workspace";
import "./module-workspace.css";

function ModuleContent({ config: c }: { config: PageConfig }) {
  const w = useWorkspace();
  if (c.layout === "people")
    return (
      <section className="ny-panel">
        <MemberDirectory professions={c.slug === "professions"} />
      </section>
    );
  if (c.layout === "tree")
    return (
      <>
        <LineagePreview large />
        <section className="ny-panel">
          <SectionTitle
            action="All members"
            onClick={() => w.go("/dashboard/members")}
          >
            The people behind the branches
          </SectionTitle>
          <p className="ny-panel-description">
            Select a person on the tree, or find their profile below. Drag the
            3D tree to explore another angle.
          </p>
          <MemberDirectory />
        </section>
      </>
    );
  if (c.layout === "events")
    return (
      <section className="ny-panel">
        <EventsList />
      </section>
    );
  if (c.layout === "memories")
    return (
      <section className="ny-panel">
        <GalleryGrid />
      </section>
    );
  if (c.slug === "contributions")
    return (
      <>
        <ContributionPanel full />
        <FundPanel />
      </>
    );
  if (c.slug === "finances")
    return (
      <>
        <div className="ny-module-grid">
          <FinancePanel />
          <SavingsPanel />
        </div>
        <div className="ny-module-grid">
          <BranchPanel />
          <section className="ny-panel">
            <SectionTitle
              action="Wallet details"
              onClick={() => w.open("wallet")}
            >
              Family wallet actions
            </SectionTitle>
            {(["deposit", "withdraw", "transfer"] as const).map((p, i) => (
              <button className="ny-list-row" key={p} onClick={() => w.open(p)}>
                <IconBox
                  icon={i === 0 ? Plus : i === 1 ? ArrowUpRight : ArrowRight}
                  tone={i === 0 ? "sage" : "gold"}
                />
                <span className="ny-row-copy">
                  <strong className="capitalize">{p} funds</strong>
                  <small>Review a local {p} simulation</small>
                </span>
                <ChevronRight size={13} />
              </button>
            ))}
          </section>
        </div>
      </>
    );
  if (c.slug === "finance-access")
    return (
      <section className="ny-panel">
        <div className="ny-section-heading">
          <h2>Elder allocations</h2>
          <Simulated />
        </div>
        <p className="ny-panel-description">
          Receive-link previews for family members, with no external delivery.
        </p>
        <button className="ny-list-row" onClick={() => w.open("allocation")}>
          <IconBox icon={Link2} tone="gold" />
          <span className="ny-row-copy">
            <strong>Mama Grace Nalyanya</strong>
            <small>NY-ALC-00014 &middot; Unused preview</small>
          </span>
          <b>{kes(3000)}</b>
          <ChevronRight size={14} />
        </button>
        {w.local.entries
          .filter((e) => e.kind === "allocate")
          .map((e) => (
            <button
              className="ny-list-row"
              key={e.id}
              onClick={() => w.open("receipt", e.id)}
            >
              <IconBox icon={Link2} />
              <span className="ny-row-copy">
                <strong>{e.member}</strong>
                <small>{e.id} &middot; Simulated</small>
              </span>
              <b>{kes(e.amount)}</b>
              <ChevronRight size={13} />
            </button>
          ))}
      </section>
    );
  if (c.slug === "loans")
    return (
      <div className="ny-module-grid">
        <section className="ny-panel">
          <h2>Family loan snapshot</h2>
          <Details
            rows={[
              ["Outstanding family loans", "3 active loans"],
              ["Total remaining", kes(family.loans)],
              ["Instalments needing attention", "1 instalment"],
              ["Overdue amount", "KES 2,500"],
            ]}
          />
          <button
            className="ny-btn ny-btn-primary"
            onClick={() => w.open("loan")}
          >
            Review education loan
            <ArrowRight size={14} />
          </button>
        </section>
        <section className="ny-panel">
          <h2>Education loan</h2>
          <p className="ny-modal-intro mt-2">
            Daniel Wekesa Nalyanya &middot; Trans-Nzoia
          </p>
          <Details
            rows={[
              ["Principal", "KES 75,000"],
              ["Already repaid", "KES 22,500"],
              ["Reference", "NY-LON-00088"],
            ]}
          />
          <span className="ny-progress-track">
            <i style={{ width: "30%", background: "#7a9570" }} />
          </span>
          <p className="ny-field-help">30% repaid in the local snapshot</p>
        </section>
      </div>
    );
  if (c.layout === "causes")
    return (
      <>
        <FundPanel />
        <section className="ny-panel">
          <SectionTitle
            action="See contributions"
            onClick={() => w.go("/dashboard/contributions")}
          >
            Giving as one family
          </SectionTitle>
          <p className="ny-modal-intro">
            Our education, welfare, and homestead funds keep care close to home.
            Choose a cause to see its purpose and preview a contribution.
          </p>
          <button
            className="ny-btn ny-btn-secondary"
            onClick={() => w.open("cause", "education")}
          >
            <BookOpen size={15} />
            Explore the education fund
          </button>
        </section>
      </>
    );
  if (c.layout === "records")
    return (
      <>
        <section className="ny-panel">
          <SectionTitle>Local simulation journal</SectionTitle>
          <RecordsList />
          <button
            className="ny-btn ny-btn-secondary mt-5"
            onClick={() =>
              downloadText(
                "nalyanya-local-journal.json",
                JSON.stringify(
                  {
                    mode: "SIMULATED",
                    exportedAt: new Date().toISOString(),
                    records: w.local.entries,
                  },
                  null,
                  2,
                ),
                "application/json",
              )
            }
          >
            <Download size={14} />
            Export journal
          </button>
        </section>
        <ContributionPanel full />
      </>
    );
  if (c.layout === "messages")
    return (
      <>
        <section className="ny-panel">
          <div className="ny-section-heading">
            <h2>Prepare a family message</h2>
            <Simulated />
          </div>
          <div className="ny-module-choice-grid">
            {(
              [
                {
                  name: "WhatsApp update",
                  icon: MessageCircle,
                  kind: "whatsapp",
                },
                { name: "SMS reminder", icon: Mail, kind: "sms" },
                { name: "Family broadcast", icon: Network, kind: "broadcast" },
              ] as const
            ).map((x) => (
              <button key={x.kind} onClick={() => w.open(x.kind)}>
                <IconBox icon={x.icon} />
                <strong>{x.name}</strong>
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>
        </section>
        <section className="ny-panel">
          <h2>Prepared messages</h2>
          {w.local.entries
            .filter((e) => ["whatsapp", "sms", "broadcast"].includes(e.kind))
            .map((e) => (
              <button
                key={e.id}
                className="ny-list-row"
                onClick={() => w.open("receipt", e.id)}
              >
                <IconBox icon={FileText} />
                <span className="ny-row-copy">
                  <strong>{e.title}</strong>
                  <small>{e.id} &middot; Not delivered</small>
                </span>
                <ChevronRight size={14} />
              </button>
            ))}
          {!w.local.entries.some((e) =>
            ["whatsapp", "sms", "broadcast"].includes(e.kind),
          ) && (
            <p className="ny-modal-intro mt-3">
              No messages have been prepared yet. Choose a channel above to
              compose a local preview.
            </p>
          )}
        </section>
      </>
    );
  if (c.layout === "settings")
    return (
      <>
        <section className="ny-panel">
          <h2>Workspace preferences</h2>
          <button
            className="ny-list-row"
            role="switch"
            aria-checked={w.local.elder}
            onClick={w.toggleElder}
          >
            <IconBox icon={Glasses} />
            <span className="ny-row-copy">
              <strong>Elder mode</strong>
              <small>
                Larger text, generous touch targets, and a still family tree.
              </small>
            </span>
            <b>{w.local.elder ? "On" : "Off"}</b>
          </button>
          <button className="ny-list-row" onClick={() => w.open("family")}>
            <IconBox icon={Network} tone="gold" />
            <span className="ny-row-copy">
              <strong>Active family branch</strong>
              <small>{w.branch?.name || "All branches"}</small>
            </span>
            <ChevronRight size={14} />
          </button>
          <Details
            rows={[
              ["Time zone", "Africa/Nairobi (EAT)"],
              ["Money format", "Kenyan shilling (KES)"],
              ["Data storage", "This browser only"],
            ]}
          />
        </section>
        <IntegrationPanel />
      </>
    );
  if (c.layout === "profile")
    return (
      <div className="ny-module-grid">
        <section className="ny-panel">
          <ProfileContent />
        </section>
        <section className="ny-panel">
          <h2>Your family connections</h2>
          <Details
            rows={[
              ["Your branch", "Nairobi"],
              ["Generation", 3],
              ["Family root", family.root],
              ["Local RSVPs", Object.keys(w.local.rsvps).length],
              ["Saved photographs", w.local.saved.length],
            ]}
          />
          <button
            className="ny-btn ny-btn-secondary"
            onClick={() => w.open("member", members[2].id)}
          >
            View family profile
            <ArrowUpRight size={14} />
          </button>
          <p className="ny-modal-intro mt-5">
            Payment destinations and receive PINs cannot be edited in this
            frontend workspace.
          </p>
        </section>
      </div>
    );
  return (
    <section className="ny-panel ny-remembrance">
      <img
        src="/images/golden-hour.webp"
        alt="Warm evening light falling over the Kenyan countryside"
      />
      <div>
        <p className="ny-eyebrow">OUR HERITAGE ARCHIVE</p>
        <h2>The stories we carry</h2>
        <p>
          Every branch of the family has stories worth keeping. Return to the
          beginnings of the Nalyanya family through our founder's profile and
          shared photographs.
        </p>
        <button
          className="ny-btn ny-btn-primary"
          onClick={() => w.open("member", members[0].id)}
        >
          Mzee Victor's story
          <ArrowRight size={14} />
        </button>
      </div>
    </section>
  );
}
export default function ModuleWorkspace({ config }: { config: PageConfig }) {
  const w = useWorkspace();
  return (
    <div className={`ny-module-page page-dash-${config.slug}`}>
      <Link
        className="ny-text-link ny-module-back"
        to="/dashboard"
        search={{ branch: w.query.branch }}
      >
        <ArrowLeft size={13} />
        Command center
      </Link>
      <div className="ny-module-header">
        <div>
          <p className="ny-eyebrow">{config.eyebrow}</p>
          <h1>{config.name}</h1>
          <p>{config.description}</p>
        </div>
        <button
          className="ny-btn ny-btn-primary"
          onClick={() => w.open(config.panel)}
        >
          {config.layout === "money" ? (
            <Wallet size={14} />
          ) : (
            <ArrowUpRight size={14} />
          )}{" "}
          {config.action}
        </button>
      </div>
      <ModuleContent config={config} />
      <p className="ny-module-footnote">
        <Check size={12} />
        Local family workspace &middot; {w.branch?.name || "All branches"}{" "}
        &middot; {localDate(new Date(), { month: "long", year: "numeric" })}
      </p>
    </div>
  );
}
