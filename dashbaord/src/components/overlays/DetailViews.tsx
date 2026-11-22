import { photoSrcSet } from "@/utils/photos";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Download,
  FlaskConical,
  Glasses,
  Heart,
  MapPin,
  Network,
  ShieldCheck,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  alerts,
  branches,
  chamas,
  dateFromToday,
  family,
  funds,
  kes,
  localDate,
  members,
} from "@/data/dashboard/command-center";
import { useWorkspace } from "@/state/Workspace";
import {
  Avatar,
  CheckLine,
  EmptyState,
  IconBox,
  Simulated,
} from "@/components/shared/Primitives";
import { BrandMark } from "@/components/shared/Brand";
import { downloadText, exportCalendar } from "@/utils/download";
import type { Panel } from "@/types/workspace";

export function Details({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="ny-detail-list">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
export function MemberDetail({ id }: { id?: string }) {
  const w = useWorkspace();
  const m = members.find((m) => m.id === id);
  if (!m) return <Missing />;
  return (
    <>
      <div className="ny-person-intro">
        <Avatar name={m.name} image={m.image} size={65} />
        <p className="ny-eyebrow">GENERATION {m.generation}</p>
        <h3>{m.name}</h3>
        <p>{m.profession}</p>
      </div>
      <p className="ny-detail-paragraph">{m.bio}</p>
      <Details
        rows={[
          ["Family branch", branches.find((b) => b.id === m.branch)?.name],
          ["Member ID", m.id],
          ["Family root", family.root],
        ]}
      />
      <button
        className="ny-btn ny-btn-primary"
        onClick={() => w.go("/dashboard/lineage")}
      >
        <Network size={14} />
        Explore the family tree
      </button>
    </>
  );
}
export function EventDetail({ id }: { id?: string }) {
  const w = useWorkspace();
  const e = w.allEvents.find((v) => v.id === id);
  if (!e) return <Missing />;
  return (
    <div className="ny-event-detail">
      <img
        sizes="(max-width:640px) 92vw, 445px"
        srcSet={photoSrcSet(e.image)}
        src={e.image}
        alt={`Illustrative photograph for ${e.title}`}
      />
      <p className="ny-eyebrow">{e.type}</p>
      <h3>{e.title}</h3>
      <div className="ny-event-metadata">
        <span>
          <CalendarDays size={15} />
          {localDate(e.date, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
        <span>
          <Clock3 size={15} />
          {localDate(e.date, { hour: "2-digit", minute: "2-digit" })} EAT
        </span>
        <span>
          <MapPin size={15} />
          {e.place}
        </span>
      </div>
      <p className="ny-detail-paragraph">{e.description}</p>
      <Details
        rows={[
          ["Your host", e.host],
          [
            "Family attending",
            `${e.attending + (w.local.rsvps[e.id] === "Going" ? 1 : 0)} family members`,
          ],
        ]}
      />
      <h4>Your RSVP</h4>
      <div className="ny-rsvp-choices">
        {["Going", "Maybe", "Not going"].map((s) => (
          <button
            className={w.local.rsvps[e.id] === s ? "selected" : ""}
            key={s}
            aria-pressed={w.local.rsvps[e.id] === s}
            onClick={() => w.rsvp(e.id, s)}
          >
            {w.local.rsvps[e.id] === s && <Check size={13} />} {s}
          </button>
        ))}
      </div>
      <p className="ny-field-help">RSVPs are saved on this device only.</p>
      <button
        className="ny-btn ny-btn-secondary mt-5"
        onClick={() => exportCalendar(e)}
      >
        <Download size={14} />
        Add to my calendar (.ics)
      </button>
    </div>
  );
}
export function ProfileContent() {
  const w = useWorkspace();
  return (
    <>
      <div className="ny-person-intro">
        <Avatar name="Brian Nalyanya" image="/images/brian.webp" size={70} />
        <p className="ny-eyebrow">FAMILY ADMINISTRATOR</p>
        <h3>Brian Otieno Nalyanya</h3>
        <p>Nairobi branch &middot; Generation 3</p>
      </div>
      <Details
        rows={[
          ["Workspace", "Nalyanya Family"],
          ["Member ID", members[2].id],
          ["Access", "Family administrator"],
          ["Mode", "Local demonstration"],
        ]}
      />
      <button
        className="ny-select-row"
        role="switch"
        aria-checked={w.local.elder}
        onClick={w.toggleElder}
      >
        <IconBox icon={Glasses} />
        <span>
          <strong>Elder mode</strong>
          <small>Larger text, easier controls, less motion</small>
        </span>
        <b>{w.local.elder ? "On" : "Off"}</b>
      </button>
      <button
        className="ny-btn ny-btn-primary mt-5"
        onClick={() =>
          w.path === "/dashboard/account"
            ? w.open("member", members[2].id)
            : w.go("/dashboard/account")
        }
      >
        {w.path === "/dashboard/account"
          ? "View lineage profile"
          : "Account overview"}
        <ArrowRight size={14} />
      </button>
    </>
  );
}
export function Missing() {
  return (
    <EmptyState title="This record was not found">
      It may belong to a different local workspace. Close this view and select
      an available family record.
    </EmptyState>
  );
}
export function WalletDetail() {
  const w = useWorkspace();
  return (
    <>
      <div className="ny-balance-card">
        <span>
          <Wallet size={16} />
          Family wallet
        </span>
        <b>{kes(w.balance)}</b>
        <small>
          {w.branch?.name || "All family branches"} &middot; Local demo balance
        </small>
      </div>
      <div className="ny-money-actions">
        {(["deposit", "withdraw", "transfer"] as const).map((k, i) => (
          <button key={k} onClick={() => w.open(k)}>
            {i === 0 ? (
              <ArrowDownLeft size={15} />
            ) : i === 1 ? (
              <ArrowUpRight size={15} />
            ) : (
              <ArrowRight size={15} />
            )}{" "}
            {k}
          </button>
        ))}
      </div>
      <Details
        rows={[
          ["This month's contributions", kes(w.contributionTotal)],
          ["Sacco share value", kes(family.shares)],
          ["Active savings circles", "3 rounds"],
          ["Outstanding family loans", kes(family.loans)],
        ]}
      />
      <h3 className="ny-subheading">Local activity</h3>
      <RecordsList />
      <button
        className="ny-btn ny-btn-secondary mt-4"
        onClick={() => w.go("/dashboard/finances")}
      >
        Explore family finances
        <ArrowUpRight size={14} />
      </button>
    </>
  );
}
export function RecordsList() {
  const w = useWorkspace();
  const entries = w.local.entries.filter(
    (e) => !w.branch || e.branch === w.branch.id,
  );
  return entries.length ? (
    <div>
      {entries.map((e) => (
        <button
          className="ny-list-row"
          key={e.id}
          onClick={() => w.open("receipt", e.id)}
        >
          <IconBox icon={FlaskConical} tone="gold" />
          <span className="ny-row-copy">
            <strong>{e.title}</strong>
            <small>{e.id} &middot; Simulated</small>
          </span>
          {e.amount > 0 && <b className="ny-money">{kes(e.amount)}</b>}
          <ChevronRight size={13} />
        </button>
      ))}
    </div>
  ) : (
    <div className="ny-record-empty">
      <FlaskConical size={16} />
      <p>
        No simulations yet. A deposit, a contribution, or a message preview will
        appear here.
      </p>
    </div>
  );
}
export function DetailView({ kind, id }: { kind: Panel; id?: string }) {
  const w = useWorkspace();
  if (kind === "event") return <EventDetail id={id} />;
  if (kind === "member") return <MemberDetail id={id} />;
  if (kind === "profile") return <ProfileContent />;
  if (kind === "wallet") return <WalletDetail />;
  if (kind === "receipt") {
    const e = w.local.entries.find((v) => v.id === id);
    if (!e) return <Missing />;
    return (
      <>
        <Simulated />
        <h3 className="ny-detail-heading">{e.title}</h3>
        <p className="ny-detail-paragraph">
          Ready. Connects when the backend is wired.
        </p>
        <Details
          rows={[
            ["Local reference", e.id],
            ["Type", e.kind],
            ["Amount", e.amount ? kes(e.amount) : "Not applicable"],
            [
              "Recorded",
              localDate(e.date, {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              }) + " EAT",
            ],
            ["Mode", "Simulation only"],
            ...(e.purpose ? [["Purpose", e.purpose] as [string, string]] : []),
          ]}
        />
        <div className="ny-notice">
          <ShieldCheck size={17} />
          <p>{e.note}</p>
        </div>
        <button
          className="ny-btn ny-btn-secondary mt-4"
          onClick={() =>
            downloadText(
              `${e.id}.json`,
              JSON.stringify(
                { ...e, simulated: true, externalDelivery: false },
                null,
                2,
              ),
              "application/json",
            )
          }
        >
          <Download size={14} />
          Export local record
        </button>
      </>
    );
  }
  if (kind === "contribution") {
    const c = w.allContributions.find((v) => v.id === id);
    if (!c) return <Missing />;
    return (
      <>
        <div className="ny-detail-kpi">
          <span>Family contribution</span>
          <strong>{kes(c.amount)}</strong>
          <small>{c.status} &middot; Local demo record</small>
        </div>
        <Details
          rows={[
            ["Contributor", c.member],
            ["Family cause", c.purpose],
            ["Branch", branches.find((b) => b.id === c.branch)?.name],
            ["Reference", c.id],
            ["Status", c.status],
          ]}
        />
        <button
          className="ny-btn ny-btn-primary"
          onClick={() => w.go("/dashboard/contributions")}
        >
          See all contributions
          <ArrowRight size={14} />
        </button>
      </>
    );
  }
  if (kind === "branch") {
    const b = branches.find((v) => v.id === id);
    if (!b) return <Missing />;
    return (
      <>
        <div className="ny-detail-kpi">
          <span>{b.name} branch</span>
          <strong>{kes(b.balance)}</strong>
          <small>Family wallet &middot; {b.growth}% growth this month</small>
        </div>
        <Details
          rows={[
            ["Family members", b.members],
            ["Family root", family.root],
            ["Home county", b.name],
            ["Workspace", "Nalyanya Family"],
          ]}
        />
        <button
          className="ny-btn ny-btn-primary"
          onClick={() => w.chooseBranch(b.id)}
        >
          Switch to this branch
          <ArrowRight size={14} />
        </button>
      </>
    );
  }
  if (kind === "chama") {
    const c = chamas.find((c) => c.id === id) || chamas[0];
    return (
      <>
        <div className="ny-detail-kpi">
          <span>Monthly savings circle</span>
          <strong>{c.name}</strong>
          <small>{c.members} family members saving together</small>
        </div>
        <Details
          rows={[
            ["Current pool", kes(c.pool)],
            ["Next recipient", c.next],
            [
              "Next rotation",
              localDate(dateFromToday(c.days), {
                weekday: "long",
                day: "numeric",
                month: "long",
              }),
            ],
            ["Your queue position", `${c.position} of ${c.members}`],
            ["Cycle", "Monthly"],
          ]}
        />
        <div className="ny-notice">
          <CalendarDays size={16} />
          <p>
            The next local rotation is in {c.days} days. No funds will be
            transferred by this preview.
          </p>
        </div>
        <button
          className="ny-btn ny-btn-primary mt-5"
          onClick={() => w.open("broadcast", c.id)}
        >
          Prepare a circle update
          <ArrowRight size={13} />
        </button>
      </>
    );
  }
  if (kind === "shares")
    return (
      <>
        <div className="ny-detail-kpi">
          <span>Sacco share holding</span>
          <strong>{kes(family.shares)}</strong>
          <small>624 shares held across the family</small>
        </div>
        <Details
          rows={[
            ["Value per share", "KES 500"],
            ["Savings pool", kes(family.shares)],
            ["Last review", "This month"],
            ["Source", "Local family finance snapshot"],
          ]}
        />
        <button
          className="ny-btn ny-btn-primary"
          onClick={() => w.go("/dashboard/finances")}
        >
          Go to family finances
          <ArrowRight size={13} />
        </button>
      </>
    );
  if (kind === "loan")
    return (
      <>
        <div className="ny-detail-kpi warm">
          <span>Education loan &middot; NY-LON-00088</span>
          <strong>KES 2,500</strong>
          <small>Instalment overdue by two days</small>
        </div>
        <Details
          rows={[
            ["Member", "Daniel Wekesa Nalyanya"],
            ["Original loan", "KES 75,000"],
            ["Repaid", "KES 22,500"],
            ["Remaining balance", "KES 52,500"],
            ["Purpose", "School fees"],
            ["Payment schedule", "Monthly"],
          ]}
        />
        <button
          className="ny-btn ny-btn-primary"
          onClick={() => w.open("sms", "loan-reminder")}
        >
          Prepare a reminder
          <ArrowRight size={13} />
        </button>
      </>
    );
  if (kind === "allocation")
    return (
      <>
        <Simulated />
        <h3 className="ny-detail-heading">Mama Grace's allocation</h3>
        <p className="ny-detail-paragraph">
          A local preview of a receive link for an elder. No money has been
          released and no link was delivered.
        </p>
        <Details
          rows={[
            ["Recipient", "Mama Grace Nalyanya"],
            ["Amount", "KES 3,000"],
            ["Preview age", "7 days"],
            ["Reference", "NY-ALC-00014"],
            ["Delivery", "Not connected"],
          ]}
        />
        <button
          className="ny-btn ny-btn-primary"
          onClick={() => w.open("allocate")}
        >
          Prepare an allocation
          <ArrowRight size={13} />
        </button>
      </>
    );
  if (kind === "cause") {
    const f = funds.find((f) => f.id === id) || funds[0];
    const raised =
      f.raised +
      w.local.entries
        .filter((e) => e.kind === "contribute" && e.purpose === f.title)
        .reduce((s, e) => s + e.amount, 0);
    return (
      <>
        <IconBox icon={Heart} tone="gold" />
        <h3 className="ny-detail-heading">{f.title}</h3>
        <p className="ny-detail-paragraph">{f.description}</p>
        <div className="ny-detail-kpi">
          <span>Raised together</span>
          <strong>{kes(raised)}</strong>
          <small>of the {kes(f.target)} goal</small>
          <span className="ny-progress-track">
            <i
              style={{
                width: `${Math.min(100, (raised / f.target) * 100)}%`,
                background: "#829c73",
              }}
            />
          </span>
        </div>
        <button
          className="ny-btn ny-btn-primary mt-5"
          onClick={() => w.open("contribute", f.id)}
        >
          Preview a contribution
          <ArrowRight size={13} />
        </button>
      </>
    );
  }
  if (kind === "alert") {
    const a = alerts.find((a) => a.id === id);
    if (!a) return <Missing />;
    const target = (
      {
        contribution: "contributions",
        chama: "chama",
        loan: "loan",
        allocation: "allocation",
        event: "event",
      } as const
    )[a.kind];
    return (
      <>
        <p className="ny-eyebrow">
          {a.critical ? "REQUIRES ATTENTION" : "FAMILY UPDATE"}
        </p>
        <h3 className="ny-detail-heading">{a.title}</h3>
        <p className="ny-detail-paragraph">{a.text}</p>
        <p className="ny-field-help">
          {a.time} &middot; In-app demo notification
        </p>
        <div className="ny-form-actions mt-5">
          {!a.critical && (
            <button
              className="ny-btn ny-btn-secondary"
              onClick={() => {
                w.dismiss(a.id);
                w.open("notifications");
              }}
            >
              Dismiss update
            </button>
          )}
          <button
            className="ny-btn ny-btn-primary"
            onClick={() =>
              w.open(
                target,
                a.kind === "event"
                  ? "NY-EVT-0001"
                  : a.kind === "chama"
                    ? "wazee"
                    : undefined,
              )
            }
          >
            Review details
            <ArrowRight size={13} />
          </button>
        </div>
      </>
    );
  }
  if (kind === "health")
    return (
      <>
        <div className="ny-family-intro">
          <ShieldCheck size={31} />
          <div>
            <strong>Your family workspace</strong>
            <p>Local family health snapshot</p>
          </div>
        </div>
        <Details
          rows={[
            ["Family", family.name],
            ["Active branch", w.branch?.name || "All branches"],
            ["Family members", w.branch?.members || family.members],
            ["Generations", family.generations],
            ["Active savings circles", 3],
            [
              "Pending contributions",
              w.scopedContributions.filter((c) => c.status === "Pending")
                .length,
            ],
            ["Sacco shares", 624],
            ["Outstanding loans", `${3} loans / ${kes(family.loans)}`],
            ["Elder mode", w.local.elder ? "On" : "Off"],
            ["Your role", "Family administrator"],
          ]}
        />
        <Simulated />
        <p className="ny-detail-paragraph">
          M-Pesa, WhatsApp, SMS, and Drive are available as local previews. No
          external connection is active.
        </p>
      </>
    );
  return (
    <>
      <div className="ny-family-intro">
        <BrandMark size={48} />
        <div>
          <strong>Nalyanya Family</strong>
          <p>Our roots. Our people. One home.</p>
        </div>
      </div>
      <h3 className="ny-detail-heading">A home for every generation.</h3>
      <p className="ny-detail-paragraph">
        This family workspace is rooted at Mzee Victor Nalyanya. Explore our
        lineage, keep family memories, and preview the finances we share.
      </p>
      <div className="space-y-3 my-5">
        <CheckLine>
          All family profiles, balances, and events are illustrative local data.
        </CheckLine>
        <CheckLine>
          Photographs are locally hosted stock images from Pexels and Unsplash.
        </CheckLine>
        <CheckLine>
          Preferences, RSVPs, and simulated records stay in this browser.
        </CheckLine>
      </div>
      <button
        className="ny-btn ny-btn-primary"
        onClick={() => w.open("family")}
      >
        <UsersRound size={15} />
        Explore our branches
      </button>
    </>
  );
}
