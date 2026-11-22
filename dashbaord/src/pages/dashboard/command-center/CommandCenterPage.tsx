import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  HandCoins,
  Network,
  Plus,
  Sprout,
  TrendingUp,
  UsersRound,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useWorkspace } from "@/state/Workspace";
import { family, localDate, memories } from "@/data/dashboard/command-center";
import {
  Count,
  IconBox,
  Reveal,
  Sparkline,
} from "@/components/shared/Primitives";
import { IrisPhoto } from "@/components/media/IrisPhoto";
import { FinancePanel } from "@/components/dashboard/FinancePanel";
import { EventSpotlight } from "@/components/dashboard/EventSpotlight";
import {
  AttentionPanel,
  BranchPanel,
  CalendarPanel,
  ContributionPanel,
  FundPanel,
  IntegrationPanel,
  MemoriesSection,
  SavingsPanel,
} from "@/components/dashboard/DashboardSections";
import { LineagePreview } from "@/components/lineage/LineagePreview";
import "./command-center.css";

const heroSlides = memories.slice(0, 4);
export default function CommandCenterPage() {
  const w = useWorkspace();
  const now = Date.now();
  const upcoming = w.scopedEvents.filter(
    (e) => +new Date(e.date) >= now && +new Date(e.date) <= now + 30 * 86400000,
  ).length;
  const stats = [
    {
      label: "Family members",
      value: w.branch?.members || family.members,
      money: false,
      icon: UsersRound,
      tone: "sage",
      hint: w.branch ? "In this branch" : "Across 12 branches",
      trend: "",
      stats: [4, 4, 6, 5.5, 7, 7, 8.5, 8, 11, 10.5, 13, 13],
      color: "#82a07a",
      action: "members",
    },
    {
      label: "Family wallet",
      value: w.balance,
      money: true,
      icon: Wallet,
      tone: "gold",
      hint: "this month",
      trend: "12.8%",
      stats: [8, 9, 8, 12, 11, 13, 12, 18, 17, 19, 18, 23],
      color: "#b6a06e",
      action: "wallet",
    },
    {
      label: "Contributions",
      value: w.contributionTotal,
      money: true,
      icon: HandCoins,
      tone: "clay",
      hint: "this month",
      trend: "8.4%",
      stats: [5, 7, 6, 10, 8, 9, 7, 11, 12, 11, 14, 15],
      color: "#b88c74",
      action: "contributions",
    },
    {
      label: "Upcoming events",
      value: upcoming,
      money: false,
      icon: CalendarDays,
      tone: "violet",
      hint: "In the next 30 days",
      trend: "",
      stats: [3, 3, 5, 5, 4, 6, 6, 5, 7, 7, 9, 9],
      color: "#9b90aa",
      action: "events",
    },
  ] as const;
  return (
    <div className="page-dash-command-center">
      <section
        className="ny-welcome-section"
        aria-label="Welcome to your family workspace"
      >
        <IrisPhoto slides={heroSlides} className="ny-welcome-hero" priority>
          <div className="ny-welcome-copy">
            <div className="ny-eyebrow">
              <span className="ny-eyebrow-line" />
              FAMILY COMMAND CENTER
            </div>
            <h1>
              Welcome home, <em>Brian.</em>
            </h1>
            <p>
              Your people, your memories, and your shared future. All in one
              place.
            </p>
            <button
              className="ny-btn ny-btn-gold"
              onClick={() => w.go("/dashboard/lineage")}
            >
              <Network size={15} />
              Explore family tree
              <ArrowRight size={14} />
            </button>
          </div>
        </IrisPhoto>
      </section>
      <section className="ny-overview-section" aria-labelledby="overview-title">
        <div className="ny-overview-heading">
          <h2 id="overview-title">Family overview</h2>
          <div>
            <span className="ny-overview-date">
              <CalendarDays size={13} />
              {localDate(new Date(), { month: "long", year: "numeric" })}
            </span>
            <button
              className="ny-btn ny-btn-primary ny-quick-actions"
              onClick={() => w.open("actions")}
            >
              <Plus size={14} />
              Quick actions
              <ChevronDown size={12} />
            </button>
          </div>
        </div>
        <div className="ny-stat-grid perspective-[1200px]">
          {stats.map((s, i) => (
            <motion.button
              key={s.label}
              className="ny-stat-card transform-3d"
              whileHover={w.reduced ? undefined : { y: -3, rotateX: 1.5 }}
              whileTap={{ scale: 0.99 }}
              initial={w.reduced ? false : { opacity: 0.75, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.23, delay: i * 0.035 }}
              onClick={() => w.open(s.action)}
            >
              <span className="ny-stat-label">
                <IconBox icon={s.icon} tone={s.tone} size={16} />
                <span>{s.label}</span>
                <ArrowUpRight size={12} />
              </span>
              <span className="ny-stat-value">
                {s.money && <small>KES</small>}
                <Count value={s.value} />
              </span>
              <span className="ny-stat-bottom">
                <span>
                  {s.trend && (
                    <b>
                      <TrendingUp size={11} />
                      {s.trend}
                    </b>
                  )}
                  {s.hint}
                </span>
                <Sparkline values={[...s.stats]} color={s.color} fill />
              </span>
            </motion.button>
          ))}
        </div>
      </section>
      <div className="ny-dashboard-row ny-feature-row">
        <FinancePanel />
        <EventSpotlight />
      </div>
      <Reveal className="ny-dashboard-row ny-data-row">
        <ContributionPanel />
        <AttentionPanel />
      </Reveal>
      <Reveal className="ny-dashboard-row ny-lineage-row">
        <LineagePreview />
        <BranchPanel />
      </Reveal>
      <Reveal>
        <MemoriesSection />
      </Reveal>
      <Reveal className="ny-dashboard-row ny-even-row">
        <SavingsPanel />
        <FundPanel />
      </Reveal>
      <Reveal>
        <CalendarPanel />
      </Reveal>
      <Reveal>
        <IntegrationPanel />
      </Reveal>
      <div className="ny-closing-line">
        <Sprout size={16} />
        <span>
          Rooted in Mzee Victor Nalyanya. Growing with every generation.
        </span>
      </div>
    </div>
  );
}
