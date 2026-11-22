"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Crosshair, Megaphone, Send, Wallet, Zap } from "lucide-react";
import { useMemo } from "react";
import { usePrefs } from "@/components/shell/PrefsProvider";
import { Sparkline } from "@/components/ui/Charts";
import { CountUp, Reveal, TiltCard } from "@/components/ui/motion";
import { SimulatedBadge, SectionHeader } from "@/components/ui/Primitives";
import { CHAMA, EVENTS_NEXT_30_DAYS, FINANCE_SERIES, INTEGRATIONS, SHARE_UNIT_VALUE_KES } from "@/data/dashboard/command-center";
import { getFamilyGraph } from "@/lib/family/graph";
import { cn, kes } from "@/lib/format";
import { AlertsCenter, EventsCalendar, FinanceCurve, LiveContributions } from "@/views/dashboard/command-center/CommandCenterPanels";
import TreeFallback2D from "@/views/dashboard/lineage/scene/TreeFallback2D";

/* S5 — the mini 3D lineage teaser, code-split and client-only. */
const MiniTree = dynamic(() => import("@/views/dashboard/lineage/scene/LineageScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-sm text-white/70">
      <span>Rooting the tree…</span>
    </div>
  ),
});

const QUICK = [
  { label: "Deposit", href: "/dashboard/finances", icon: Wallet },
  { label: "Withdraw", href: "/dashboard/finances", icon: Zap },
  { label: "Transfer", href: "/dashboard/finances", icon: Send },
  { label: "New broadcast", href: "/dashboard/communications", icon: Megaphone },
];

export function CommandCenterPage() {
  const graph = useMemo(() => getFamilyGraph(), []);
  const { elder, calmMotion, branchContext } = usePrefs();

  const walletTotal = graph.members.reduce((sum, m) => sum + m.walletKes, 0);
  const totalShares = graph.members.reduce((sum, m) => sum + m.saccoShares, 0);
  const saccoValue = totalShares * SHARE_UNIT_VALUE_KES;
  const activeLoans = graph.members.reduce((sum, m) => sum + m.activeLoans, 0);
  const inflowMonth = FINANCE_SERIES.slice(-4).reduce((sum, p) => sum + p.inflow, 0);
  const familyWallet = walletTotal + saccoValue;
  const contextLabel =
    branchContext === "all" ? "All branches" : graph.branches.find((b) => b.id === branchContext)?.name ?? "All branches";
  const balanceSpark = FINANCE_SERIES.slice(-26).map((p) => p.balance);

  const kpis: Array<{
    label: string;
    value: number;
    decimals: number;
    prefix?: string;
    suffix?: string;
    note: string;
    accent: string;
    spark?: boolean;
  }> = [
    { label: "Family wallet", value: familyWallet / 1_000_000, decimals: 1, prefix: "KES ", suffix: "M", note: "All member wallets + Sacco pool", accent: "#1F4D3A", spark: true },
    { label: "Money in · 4 weeks", value: inflowMonth / 1_000_000, decimals: 2, prefix: "KES ", suffix: "M", note: "Received across every branch", accent: "#D4A437" },
    { label: "Chama rounds live", value: 1, decimals: 0, note: `${CHAMA.name} · you are #${CHAMA.position} of ${CHAMA.of}`, accent: "#3A7CA5" },
    { label: "Sacco shares value", value: saccoValue / 1_000_000, decimals: 2, prefix: "KES ", suffix: "M", note: `${totalShares} shares at KES ${SHARE_UNIT_VALUE_KES.toLocaleString("en-US")}`, accent: "#6A4C93" },
    { label: "Outstanding loans", value: activeLoans, decimals: 0, note: "1 instalment overdue · reminder queued", accent: "#C62828" },
    { label: "Events · next 30 days", value: EVENTS_NEXT_30_DAYS, decimals: 0, note: "Across all branches", accent: "#2E7D32" },
  ];

  return (
    <div className="page-dash-command-center space-y-10 pb-6">
      {/* Header */}
      <header className="grid gap-6 xl:grid-cols-[1.45fr_1fr] xl:items-center">
        <div className="min-w-0">
          <p className="ny-eyebrow">T-1 · Command center</p>
          <h1 className="ny-title mt-3 text-[2.6rem] leading-[1.02] sm:text-6xl">
            Welcome home, <span className="italic text-brand-primary">Brian</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
            Money is moving, a chama round turns on Wednesday, and three contributions need a second look. Here is the whole family at a glance.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/dashboard/lineage" className="ny-btn ny-btn-primary">
              <Crosshair className="size-4" aria-hidden />
              Open the 3D tree
            </Link>
            <Link href="/dashboard/finance-access" className="ny-btn ny-btn-gold">
              Send an elder receive link
            </Link>
            <Link href="/dashboard/events" className="ny-btn ny-btn-ghost">
              New family event
            </Link>
          </div>
        </div>

        <figure className="relative hidden overflow-hidden rounded-[28px] border border-hairline shadow-lift xl:block">
          <img src="/images/family/sunday-lunch.jpg" alt="A family sharing Sunday lunch around a table" className="h-64 w-full object-cover" decoding="async" />
          <figcaption className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-2xl bg-brand-deep/75 p-3 text-sm text-white backdrop-blur-md">
            <span>Sunday lunch · Nairobi branch</span>
            <span className="text-xs text-brand-accent">Illustrative photo</span>
          </figcaption>
        </figure>
      </header>

      {/* S1 — status ribbon */}
      <section aria-label="Family status" className="ny-card ny-scroll flex items-center gap-2 overflow-x-auto p-3">
        <span className="ny-chip ny-chip-solid shrink-0">Family Head · admin</span>
        <span className="ny-chip shrink-0">
          <span className="size-2 rounded-full bg-success" aria-hidden />
          <span className="ny-num">{graph.members.length}</span> members · <span className="ny-num">{graph.branches.length}</span> branches
        </span>
        <span className="ny-chip shrink-0">
          <span className="size-2 animate-ny-pulse rounded-full bg-brand-accent" aria-hidden />
          {CHAMA.name} · {CHAMA.cadence}
        </span>
        <span className="ny-chip shrink-0">Sacco · {kes(saccoValue, { compact: true })}</span>
        <span className="ny-chip ny-chip-warning shrink-0">3 pending contributions</span>
        <span className="ny-chip shrink-0">Elder Mode · {elder ? "ON" : "OFF"}</span>
        <span className="ny-chip ny-chip-gold shrink-0">Context · {contextLabel}</span>
        <span className="mx-1 hidden h-6 w-px shrink-0 bg-hairline sm:block" aria-hidden />
        {INTEGRATIONS.map((i) => (
          <span key={i.id} className="ny-chip shrink-0" title={`${i.detail} · last sync ${i.lastSync}`}>
            {i.name}
            <SimulatedBadge label="SIM" />
          </span>
        ))}
      </section>

      {/* S2 — KPI row */}
      <section aria-labelledby="kpi-title" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="ny-eyebrow" id="kpi-title">S2 · Key figures</p>
            <p className="mt-1 text-sm text-text-secondary">Counts animate on view. Money is shown in millions of KES.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <Link key={q.label} href={q.href} className="ny-btn ny-btn-ghost ny-btn-sm">
                <q.icon className="size-4" aria-hidden />
                {q.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid gap-4 perspective-[1200px] sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {kpis.map((kpi, index) => (
            <Reveal key={kpi.label} delay={index * 0.05}>
              <TiltCard className="h-full" max={4}>
                <article className={cn("ny-card transform-3d relative flex h-full flex-col overflow-hidden p-5 transition duration-300 ease-out hover:-rotate-y-2 hover:rotate-x-2", index === 1 && "ny-flash-received")}>
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ background: kpi.accent }} />
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">{kpi.label}</p>
                  <p className="ny-title mt-3 text-[1.9rem] leading-none">
                    <CountUp value={kpi.value} decimals={kpi.decimals} prefix={kpi.prefix} suffix={kpi.suffix} />
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-text-secondary">{kpi.note}</p>
                  {kpi.spark && (
                    <div className="mt-auto pt-4">
                      <Sparkline values={balanceSpark} color={kpi.accent} />
                    </div>
                  )}
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* S3 — finance curve */}
      <FinanceCurve />

      {/* S4 — live contributions */}
      <LiveContributions />

      {/* S5 — mini 3D lineage teaser */}
      <section className="ny-card grid overflow-hidden p-0 lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col justify-between gap-6 p-6 sm:p-9">
          <div>
            <p className="ny-eyebrow">S5 · Mini lineage</p>
            <h3 className="ny-title mt-2 text-3xl">The family, turning slowly</h3>
            <p className="mt-3 leading-relaxed text-text-secondary">
              A living preview of the tree. Open the full canvas to dolly into any branch, or ask where you appear across the family.
            </p>
            <dl className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-surface-0/80 p-3">
                <dt className="text-[11px] uppercase tracking-wide text-text-tertiary">Generations</dt>
                <dd className="ny-title mt-1 text-2xl">{graph.generations.length}</dd>
              </div>
              <div className="rounded-2xl bg-surface-0/80 p-3">
                <dt className="text-[11px] uppercase tracking-wide text-text-tertiary">Branches</dt>
                <dd className="ny-title mt-1 text-2xl">{graph.branches.length}</dd>
              </div>
              <div className="rounded-2xl bg-surface-0/80 p-3">
                <dt className="text-[11px] uppercase tracking-wide text-text-tertiary">People</dt>
                <dd className="ny-title mt-1 text-2xl">{graph.members.length}</dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/dashboard/lineage" className="ny-btn ny-btn-primary">
              Open the full tree
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/dashboard/lineage?where=1" className="ny-btn ny-btn-gold">
              <Crosshair className="size-4" aria-hidden />
              Where am I?
            </Link>
          </div>
        </div>

        <div className="ny-tree-teaser relative h-72 lg:h-auto lg:min-h-[24rem]">
          {calmMotion ? (
            <TreeFallback2D graph={graph} focusKey={null} visibleGens={null} visibleBranches={null} showWhere={false} mini />
          ) : (
            <MiniTree
              graph={graph}
              focusKey={null}
              visibleGens={null}
              visibleBranches={null}
              showWhere={false}
              autoRotate
              calm={false}
              mini
              command={null}
            />
          )}
        </div>
      </section>

      {/* S6 + S7 */}
      <section className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
        <AlertsCenter />
        <div className="space-y-5">
          <SectionHeader eyebrow="Calendar" title="Events and money on one week" className="md:flex-col md:items-start" />
          <EventsCalendar />
        </div>
      </section>
    </div>
  );
}
