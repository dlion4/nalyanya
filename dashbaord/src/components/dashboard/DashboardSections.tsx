import { photoSrcSet } from "@/utils/photos";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BellRing,
  BookOpen,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  CircleDollarSign,
  CircleHelp,
  Clock3,
  Flower2,
  FolderOpen,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  House,
  Images,
  Landmark,
  Layers3,
  Leaf,
  Link2,
  MessageCircle,
  MessageSquare,
  Repeat2,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import {
  alerts,
  branches,
  chamas,
  dateFromToday,
  family,
  financeHistory,
  funds,
  kes,
  localDate,
  memories,
} from "@/data/dashboard/command-center";
import { useWorkspace } from "@/state/Workspace";
import {
  Avatar,
  EmptyState,
  IconBox,
  SectionTitle,
  Simulated,
  Sparkline,
} from "@/components/shared/Primitives";
import type { Panel } from "@/types/workspace";

export function ContributionPanel({ full = false }: { full?: boolean }) {
  const w = useWorkspace();
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState("All");
  const records = w.scopedContributions.filter(
    (c) => filter === "All" || c.status === filter,
  );
  const list = records.slice(0, full || expanded ? 100 : 4);
  return (
    <section className="ny-panel ny-contribution-panel">
      <SectionTitle
        action={full ? "Contribute" : "View all"}
        onClick={() =>
          full ? w.open("contribute") : w.go("/dashboard/contributions")
        }
      >
        Recent contributions
      </SectionTitle>
      {full && (
        <div className="ny-tab-strip" aria-label="Contribution status">
          {["All", "Recorded", "Pending", "Simulated"].map((f) => (
            <button
              key={f}
              aria-pressed={f === filter}
              className={f === filter ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      )}
      <div className="ny-table-scroll">
        <table className="ny-contribution-table">
          <thead>
            <tr>
              <th>Contributor</th>
              <th>Purpose</th>
              <th>Amount</th>
              <th aria-label="Details" />
            </tr>
          </thead>
          <tbody>
            {list.map((c, i) => (
              <tr key={c.id}>
                <td>
                  <button
                    className="ny-person-name"
                    onClick={() => w.open("contribution", c.id)}
                  >
                    <Avatar name={c.member} color={i} size={29} />
                    <span>
                      <strong>
                        {c.member.split(" ").slice(0, 2).join(" ")}
                      </strong>
                      <small>{c.time}</small>
                    </span>
                  </button>
                </td>
                <td>{c.purpose}</td>
                <td>
                  <span className="ny-table-amount">{kes(c.amount)}</span>
                  <span className={`ny-record-state ${c.status.toLowerCase()}`}>
                    <i />
                    {c.status}
                  </span>
                </td>
                <td>
                  <button
                    className="ny-row-open"
                    aria-label={`View contribution ${c.id}`}
                    onClick={() => w.open("contribution", c.id)}
                  >
                    <ChevronRight size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!list.length && (
        <EmptyState title="No contributions in this view">
          Choose another status or branch to see more family contributions.
        </EmptyState>
      )}
      {!full && records.length > 4 && (
        <button
          className="ny-panel-bottom-link"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? "Show fewer contributions"
            : `Show ${Math.min(8, records.length - 4)} more contributions`}
          <ChevronRight size={12} />
        </button>
      )}
    </section>
  );
}
export const alertIcons = {
  contribution: HandCoins,
  chama: Repeat2,
  loan: Clock3,
  allocation: Link2,
  event: CalendarDays,
};
export function AttentionPanel() {
  const w = useWorkspace();
  const visible = alerts.filter((a) => !w.local.dismissed.includes(a.id));
  return (
    <section className="ny-panel ny-attention-panel">
      <SectionTitle action="See all" onClick={() => w.open("notifications")}>
        Needs your attention
      </SectionTitle>
      <div className="ny-attention-list">
        {visible.slice(0, 3).map((a, i) => (
          <button
            className="ny-attention-row"
            key={a.id}
            onClick={() => {
              w.markRead([a.id]);
              w.open("alert", a.id);
            }}
          >
            <IconBox
              icon={alertIcons[a.kind]}
              tone={["gold", "sage", "clay"][i]}
            />
            <span>
              <strong>{a.title}</strong>
              <small>
                {a.kind === "contribution"
                  ? "3 pending verification"
                  : a.kind === "chama"
                    ? "Wazee Round, in 2 days"
                    : a.kind === "loan"
                      ? "KES 2,500 overdue"
                      : a.time}
              </small>
            </span>
            <ChevronRight size={13} />
          </button>
        ))}
      </div>
      <button className="ny-attention-note" onClick={() => w.open("health")}>
        <ShieldCheck size={15} />
        Workspace health
        <ArrowUpRight size={13} />
      </button>
    </section>
  );
}
export function BranchPanel() {
  const w = useWorkspace();
  return (
    <section className="ny-panel ny-branch-panel">
      <SectionTitle action="All branches" onClick={() => w.open("family")}>
        Branch balances
      </SectionTitle>
      <p className="ny-panel-description">
        A closer look at our shared savings.
      </p>
      <div>
        {(w.branch ? [w.branch] : branches.slice(0, 4)).map((b, i) => (
          <button
            className="ny-branch-row"
            key={b.id}
            onClick={() => w.open("branch", b.id)}
          >
            <i style={{ background: b.color }} />
            <span>
              <strong>{b.name}</strong>
              <small>{b.members} members</small>
            </span>
            <Sparkline
              values={financeHistory.slice(i * 3, i * 3 + 11)}
              color={b.color}
            />
            <b>{kes(b.balance)}</b>
            <ChevronRight size={12} />
          </button>
        ))}
      </div>
    </section>
  );
}
export function MemoriesSection() {
  const w = useWorkspace();
  return (
    <section className="ny-memories-section">
      <SectionTitle
        action="Open gallery"
        onClick={() => w.go("/dashboard/gallery")}
      >
        From the family album
      </SectionTitle>
      <div className="ny-memory-grid">
        {[memories[1], memories[2], memories[3]].map((m, i) => (
          <button
            key={m.id}
            className="ny-memory-thumb group perspective-[1000px]"
            onClick={() => w.open("memory", m.id)}
          >
            <img
              sizes="(max-width:640px) 72vw, 29vw"
              srcSet={photoSrcSet(m.image)}
              src={m.image}
              alt={m.alt}
              loading="lazy"
              decoding="async"
            />
            <div />
            <span className="ny-memory-icon">
              <Images size={14} />
            </span>
            <span className="ny-memory-caption">
              <small>MEMORY {String(i + 1).padStart(2, "0")}</small>
              <strong>{m.title}</strong>
              <em>{m.place}</em>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
export function SavingsPanel() {
  const w = useWorkspace();
  return (
    <section className="ny-panel">
      <SectionTitle
        action={
          w.path === "/dashboard/finances" ? "Share holding" : "View savings"
        }
        onClick={() =>
          w.path === "/dashboard/finances"
            ? w.open("shares")
            : w.go("/dashboard/finances")
        }
      >
        Our savings circles
      </SectionTitle>
      <div className="ny-inline-summary">
        <Repeat2 size={14} />
        <span>
          <b>3</b> active chama rounds
        </span>
      </div>
      {chamas.map((c, i) => (
        <button
          className="ny-list-row"
          key={c.id}
          onClick={() => w.open("chama", c.id)}
        >
          <IconBox
            icon={i === 0 ? Leaf : i === 1 ? Layers3 : Flower2}
            tone={["sage", "gold", "violet"][i]}
          />
          <span className="ny-row-copy">
            <strong>{c.name}</strong>
            <small>
              {c.members} members &middot; Next in {c.days} days
            </small>
          </span>
          <b className="ny-money">{kes(c.pool)}</b>
          <ChevronRight size={13} />
        </button>
      ))}
      <button className="ny-panel-bottom-link" onClick={() => w.open("shares")}>
        <Landmark size={14} />
        Sacco share holding <b>{kes(family.shares)}</b>
        <ArrowUpRight size={13} />
      </button>
    </section>
  );
}
export function FundPanel() {
  const w = useWorkspace();
  return (
    <section className="ny-panel">
      <SectionTitle
        action={
          w.path === "/dashboard/foundation" ? "Education fund" : "Foundation"
        }
        onClick={() =>
          w.path === "/dashboard/foundation"
            ? w.open("cause", "education")
            : w.go("/dashboard/foundation")
        }
      >
        Growing together
      </SectionTitle>
      <p className="ny-panel-description">
        The family causes we are building, together.
      </p>
      {funds.map((f, i) => {
        const raised =
          f.raised +
          w.local.entries
            .filter((e) => e.purpose === f.title && e.kind === "contribute")
            .reduce((s, e) => s + e.amount, 0);
        return (
          <button
            className="ny-fund-row"
            key={f.id}
            onClick={() => w.open("cause", f.id)}
          >
            <span>
              <i>
                {i === 0 ? (
                  <GraduationCap size={16} />
                ) : i === 1 ? (
                  <House size={16} />
                ) : (
                  <HeartHandshake size={16} />
                )}
              </i>
              <strong>{f.title}</strong>
              <b>{Math.round((raised / f.target) * 100)}%</b>
            </span>
            <span className="ny-progress-track">
              <i
                style={{
                  width: `${Math.min(100, (raised / f.target) * 100)}%`,
                  background: ["#76916c", "#b39b6a", "#9b8b9f"][i],
                }}
              />
            </span>
            <small>
              {kes(raised)} of {kes(f.target)}
            </small>
          </button>
        );
      })}
    </section>
  );
}
export function CalendarPanel() {
  const w = useWorkspace();
  const items = [
    {
      title: "Wazee rotation",
      day: 2,
      label: "Chama",
      panel: "chama",
      id: "wazee",
    },
    {
      title: "Education fund",
      day: 5,
      label: "Contribution",
      panel: "cause",
      id: "education",
    },
    {
      title: "Umoja rotation",
      day: 7,
      label: "Chama",
      panel: "chama",
      id: "umoja",
    },
    {
      title: "Family reunion",
      day: 8,
      label: "Gathering",
      panel: "event",
      id: "NY-EVT-0001",
    },
    {
      title: "Cousins Circle",
      day: 12,
      label: "Chama",
      panel: "chama",
      id: "cousins",
    },
  ];
  return (
    <section className="ny-panel ny-calendar-panel">
      <SectionTitle action="Full calendar" onClick={() => w.open("calendar")}>
        On the family calendar
      </SectionTitle>
      <div className="ny-calendar-strip">
        {items.map((i) => (
          <button key={i.title} onClick={() => w.open(i.panel as Panel, i.id)}>
            <small>
              {localDate(dateFromToday(i.day), {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </small>
            <strong>{i.title}</strong>
            <span>
              <i />
              {i.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
export function IntegrationPanel() {
  const w = useWorkspace();
  return (
    <section className="ny-panel ny-integration-panel">
      <div className="ny-section-heading">
        <h2>Family connections</h2>
        <Simulated />
      </div>
      <p className="ny-panel-description">
        Try the connection workflows. No money or messages leave this device.
      </p>
      <div className="ny-integration-grid">
        {(
          [
            {
              title: "M-Pesa",
              icon: Smartphone,
              panel: "deposit",
              text: "Payments",
            },
            {
              title: "WhatsApp",
              icon: MessageCircle,
              panel: "whatsapp",
              text: "Family updates",
            },
            {
              title: "Google Drive",
              icon: FolderOpen,
              panel: "drive",
              text: "Photo albums",
            },
            {
              title: "SMS",
              icon: MessageSquare,
              panel: "sms",
              text: "Text reminders",
            },
          ] as const
        ).map((i) => (
          <button key={i.title} onClick={() => w.open(i.panel)}>
            <IconBox icon={i.icon} />
            <span>
              <strong>{i.title}</strong>
              <small>{i.text}</small>
            </span>
            <ArrowUpRight size={14} />
          </button>
        ))}
      </div>
    </section>
  );
}
export const quickActions = [
  {
    id: "deposit",
    title: "Deposit funds",
    text: "Add to the family wallet",
    icon: ArrowDownLeft,
    tone: "sage",
  },
  {
    id: "withdraw",
    title: "Withdraw funds",
    text: "Preview a wallet withdrawal",
    icon: ArrowUpRight,
    tone: "gold",
  },
  {
    id: "transfer",
    title: "Transfer funds",
    text: "Between family members",
    icon: Wallet,
    tone: "blue",
  },
  {
    id: "contribute",
    title: "Make a contribution",
    text: "Support a family cause",
    icon: HandCoins,
    tone: "clay",
  },
  {
    id: "broadcast",
    title: "Family broadcast",
    text: "Prepare a family message",
    icon: BellRing,
    tone: "violet",
  },
  {
    id: "event-create",
    title: "Plan a gathering",
    text: "Add to our local calendar",
    icon: CalendarDays,
    tone: "sage",
  },
  {
    id: "allocate",
    title: "Elder receive link",
    text: "Preview a family allocation",
    icon: Link2,
    tone: "gold",
  },
] as const;
export const detailIcons = {
  health: ShieldCheck,
  wallet: Wallet,
  shares: Landmark,
  contribution: HandCoins,
  chama: Repeat2,
  loan: CircleDollarSign,
  allocation: Link2,
  alert: BellRing,
  receipt: CheckCheck,
  about: BookOpen,
  default: CircleHelp,
};
export function ActionList() {
  const w = useWorkspace();
  return (
    <div className="ny-action-list">
      {quickActions.map((a) => (
        <button key={a.id} onClick={() => w.open(a.id)}>
          <IconBox icon={a.icon} tone={a.tone} />
          <span>
            <strong>{a.title}</strong>
            <small>{a.text}</small>
          </span>
          <ArrowRight size={15} />
        </button>
      ))}
    </div>
  );
}
