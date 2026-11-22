"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AreaChart, Sparkline } from "@/components/ui/Charts";
import { Reveal } from "@/components/ui/motion";
import { BranchChip, SectionHeader, SimulatedBadge } from "@/components/ui/Primitives";
import {
  ALERTS,
  BRANCH_SPARKS,
  CALENDAR_WEEK,
  FINANCE_SERIES,
  LIVE_CONTRIBUTIONS,
  RANGES,
  UPCOMING_EVENTS,
  type RangeKey,
} from "@/data/dashboard/command-center";
import { BRANCH_BY_ID } from "@/data/family/branches";
import { cn, kes } from "@/lib/format";

/* ─── S3 · Finance curve + per-branch pulse ───────────────────────────── */

export function FinanceCurve() {
  const [range, setRange] = useState<RangeKey>("1Y");
  const [view, setView] = useState<"balance" | "net">("balance");

  const points = RANGES.find((r) => r.key === range)?.points ?? 52;
  const slice = FINANCE_SERIES.slice(-points);
  const values = view === "balance" ? slice.map((p) => p.balance) : slice.map((p) => p.inflow - p.outflow);
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const change = first === 0 ? 0 : ((last - first) / Math.abs(first)) * 100;

  let peak = -Infinity;
  let drawdown = 0;
  for (const p of slice) {
    peak = Math.max(peak, p.balance);
    drawdown = Math.min(drawdown, p.balance - peak);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.75fr_1fr]">
      <section className="ny-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="ny-eyebrow">S3 · Family finance curve</p>
            <h3 className="ny-title mt-2 text-2xl">Family wallet and Sacco pool</h3>
            <p className="mt-1 text-sm text-text-secondary">Weekly, across every branch. Drawdown shows the deepest dip from a high.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="inline-flex rounded-full border border-hairline bg-surface-0 p-1" role="group" aria-label="Chart view">
              {(["balance", "net"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={cn("rounded-full px-3.5 py-1.5 text-xs font-semibold transition", view === v ? "bg-brand-primary text-white" : "text-text-secondary")}
                >
                  {v === "balance" ? "Balance" : "Net flow"}
                </button>
              ))}
            </div>
            <div className="inline-flex rounded-full border border-hairline bg-surface-0 p-1" role="group" aria-label="Time range">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRange(r.key)}
                  aria-pressed={range === r.key}
                  className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition", range === r.key ? "bg-brand-accent text-brand-deep" : "text-text-secondary")}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 h-64 sm:h-72">
          <AreaChart
            values={values}
            height={288}
            color={view === "balance" ? "#1F4D3A" : "#B5532A"}
            label={`${view === "balance" ? "Balance" : "Net flow"} over the last ${range === "ALL" ? "two years" : range}`}
          />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl bg-surface-0/80 p-4">
            <dt className="text-xs text-text-tertiary">Start</dt>
            <dd className="ny-num mt-1 text-sm font-semibold">{kes(first, { compact: true })}</dd>
          </div>
          <div className="rounded-2xl bg-surface-0/80 p-4">
            <dt className="text-xs text-text-tertiary">Latest</dt>
            <dd className="ny-num mt-1 text-sm font-semibold">{kes(last, { compact: true })}</dd>
          </div>
          <div className="rounded-2xl bg-surface-0/80 p-4">
            <dt className="text-xs text-text-tertiary">Change</dt>
            <dd className={cn("ny-num mt-1 text-sm font-semibold", change >= 0 ? "text-success" : "text-danger")}>
              {change >= 0 ? "+" : ""}
              {change.toFixed(1)}%
            </dd>
          </div>
          <div className="rounded-2xl bg-surface-0/80 p-4">
            <dt className="text-xs text-text-tertiary">Max drawdown</dt>
            <dd className="ny-num mt-1 text-sm font-semibold text-danger">{kes(drawdown, { compact: true })}</dd>
          </div>
        </dl>
      </section>

      <aside className="ny-card p-6 sm:p-7">
        <p className="ny-eyebrow">Per-branch pulse</p>
        <h3 className="ny-title mt-2 text-xl">This month, branch by branch</h3>
        <ul className="mt-5 space-y-2">
          {BRANCH_SPARKS.map((spark) => {
            const branch = BRANCH_BY_ID[spark.branchId];
            return (
              <li key={spark.branchId}>
                <Link
                  href={`/dashboard/finances?branch=${spark.branchId}`}
                  className="group grid grid-cols-[1fr_6.5rem] items-center gap-3 rounded-2xl p-3 transition hover:bg-surface-0 sm:grid-cols-[1fr_7.5rem_auto]"
                >
                  <span className="min-w-0">
                    {branch && <BranchChip branchId={branch.id} />}
                    <span className="mt-1 block truncate text-xs text-text-tertiary">{branch?.tagline}</span>
                  </span>
                  <span className="hidden sm:block">
                    <Sparkline values={spark.series} color={branch?.color ?? "#1F4D3A"} />
                  </span>
                  <span className={cn("ny-num text-right text-sm font-semibold", spark.net >= 0 ? "text-success" : "text-danger")}>
                    {spark.net >= 0 ? "+" : "−"}
                    {kes(Math.abs(spark.net), { compact: true })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}

/* ─── S4 · Live contributions ─────────────────────────────────────────── */

const PURPOSE_STYLE: Record<string, string> = {
  Wedding: "ny-chip-violet",
  Medical: "ny-chip-danger",
  Funeral: "ny-chip",
  Harambee: "ny-chip-gold",
  Project: "ny-chip-info",
  Education: "ny-chip-success",
};

export function LiveContributions() {
  return (
    <section className="ny-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline p-5 sm:p-6">
        <div>
          <p className="ny-eyebrow">S4 · Live contributions</p>
          <h3 className="ny-title mt-1.5 text-2xl">Latest from the family</h3>
        </div>
        <span className="ny-chip">
          <span className="size-2 animate-ny-pulse rounded-full bg-success" aria-hidden />
          Live feed <SimulatedBadge label="SIMULATED" />
        </span>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <caption className="sr-only">Latest contributions from family members</caption>
          <thead className="bg-surface-0/70 text-xs uppercase tracking-[0.1em] text-text-tertiary">
            <tr>
              <th scope="col" className="px-5 py-3 font-semibold">Contributor</th>
              <th scope="col" className="px-3 py-3 font-semibold">Purpose</th>
              <th scope="col" className="px-3 py-3 text-right font-semibold">Amount</th>
              <th scope="col" className="px-3 py-3 font-semibold">Cause</th>
              <th scope="col" className="px-3 py-3 font-semibold">When</th>
              <th scope="col" className="px-3 py-3 font-semibold">Status</th>
              <th scope="col" className="px-5 py-3 text-right font-semibold"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody>
            {LIVE_CONTRIBUTIONS.map((c) => (
              <tr key={c.id} className="border-t border-hairline transition hover:bg-surface-0/70">
                <td className="px-5 py-3.5 font-semibold text-text-primary">{c.contributor}</td>
                <td className="px-3 py-3.5"><span className={cn("ny-chip", PURPOSE_STYLE[c.purpose])}>{c.purpose}</span></td>
                <td className="ny-num px-3 py-3.5 text-right font-mono font-semibold">{kes(c.amountKes)}</td>
                <td className="px-3 py-3.5 text-text-secondary">{c.cause}</td>
                <td className="px-3 py-3.5 text-text-tertiary">{c.when}</td>
                <td className="px-3 py-3.5">
                  <span className={cn("ny-chip", c.status === "received" ? "ny-chip-success" : c.status === "pending" ? "ny-chip-warning" : "ny-chip-danger")}>{c.status}</span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/dashboard/contributions?con=${c.id}`} className="font-semibold text-brand-primary hover:underline">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-hairline md:hidden">
        {LIVE_CONTRIBUTIONS.map((c) => (
          <li key={c.id} className="flex items-start justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate font-semibold text-text-primary">{c.contributor}</p>
              <p className="mt-0.5 truncate text-xs text-text-tertiary">
                {c.cause} · {c.when}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className={cn("ny-chip", PURPOSE_STYLE[c.purpose])}>{c.purpose}</span>
                <span className={cn("ny-chip", c.status === "received" ? "ny-chip-success" : c.status === "pending" ? "ny-chip-warning" : "ny-chip-danger")}>{c.status}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="ny-num font-mono text-sm font-semibold">{kes(c.amountKes)}</p>
              <Link href={`/dashboard/contributions?con=${c.id}`} className="mt-2 inline-block text-sm font-semibold text-brand-primary">
                View →
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-end border-t border-hairline p-4">
        <Link href="/dashboard/contributions" className="ny-btn ny-btn-quiet ny-btn-sm">
          All contributions → T-7
        </Link>
      </div>
    </section>
  );
}

/* ─── S6 · Alerts & action center ─────────────────────────────────────── */

const TONE: Record<string, string> = {
  warning: "bg-[#fbf0d6] text-[#8a5d00]",
  info: "bg-[#e3eef6] text-[#245a80]",
  danger: "bg-[#fbe5e5] text-danger",
  success: "bg-[#e4f1e5] text-success",
};

export function AlertsCenter() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const open = ALERTS.filter((a) => !dismissed.includes(a.id));

  return (
    <section className="ny-card flex h-full flex-col p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="ny-eyebrow">S6 · Alerts & action center</p>
          <h3 className="ny-title mt-2 text-xl">What needs you today</h3>
        </div>
        <span className="ny-chip ny-chip-solid">{open.length} open</span>
      </div>

      <ul className="mt-5 space-y-3">
        {open.map((alert) => (
          <li
            key={alert.id}
            className={cn("relative flex items-start gap-3 rounded-2xl border border-hairline bg-surface-0/60 p-4", alert.critical && "ny-alert-critical border-danger/30")}
          >
            <span className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold", TONE[alert.tone])} aria-hidden>
              {alert.tone === "success" ? "✓" : alert.tone === "danger" ? "!" : alert.tone === "info" ? "i" : "•"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-snug text-text-primary">
                {alert.critical && <span className="mr-1.5 ny-chip ny-chip-danger py-0 text-[10px]">Critical</span>}
                {alert.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">{alert.body}</p>
              <Link href={alert.href} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-primary">
                {alert.cta}
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
            {!alert.critical && (
              <button
                type="button"
                onClick={() => setDismissed((prev) => [...prev, alert.id])}
                aria-label={`Dismiss: ${alert.title}`}
                className="ny-btn ny-btn-quiet ny-btn-sm size-8 shrink-0 p-0"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </li>
        ))}
      </ul>

      {open.length === 0 && <p className="mt-6 text-sm text-text-secondary">All clear. New alerts appear here as the family moves.</p>}
      {dismissed.length > 0 && (
        <button type="button" onClick={() => setDismissed([])} className="ny-btn ny-btn-ghost ny-btn-sm mt-5 w-fit">
          Restore {dismissed.length} dismissed on this device
        </button>
      )}
    </section>
  );
}

/* ─── S7 · Upcoming events + the econ / chama calendar strip ──────────── */

const KIND_STYLE: Record<string, string> = {
  chama: "ny-chip-gold",
  event: "ny-chip-violet",
  loan: "ny-chip-danger",
  deadline: "ny-chip-info",
};

function Panel({ children }: { children: ReactNode }) {
  return <div className="ny-card p-6 sm:p-7">{children}</div>;
}

export function EventsCalendar() {
  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_1.15fr]">
      <Panel>
        <SectionHeader eyebrow="S7 · Upcoming events" title="Next five gatherings" className="md:flex-col md:items-start" />
        <ul className="mt-5 divide-y divide-hairline">
          {UPCOMING_EVENTS.map((event) => (
            <li key={event.id}>
              <Link href={event.href} className="group flex items-center gap-4 py-4 transition hover:bg-surface-0/60 sm:px-2">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-surface-2 text-center">
                  <span className="block font-display text-lg font-semibold leading-none">{event.date.split(" ")[1]}</span>
                  <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-text-tertiary">{event.date.split(" ")[0]}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-text-primary">{event.title}</span>
                  <span className="block truncate text-xs text-text-tertiary">
                    {event.time} · host {event.host} · {event.kind}
                  </span>
                </span>
                <span className="ny-chip hidden sm:inline-flex">{event.rsvp}</span>
                <ArrowRight className="size-4 text-text-tertiary transition group-hover:translate-x-1 group-hover:text-brand-primary" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/dashboard/events" className="ny-btn ny-btn-ghost ny-btn-sm mt-4">
          <CalendarDays className="size-4" aria-hidden />
          Open the events calendar
        </Link>
      </Panel>

      <Panel>
        <SectionHeader eyebrow="Chama & economy" title="The week ahead" className="md:flex-col md:items-start" />
        <ol className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
          {CALENDAR_WEEK.map((day) => (
            <li key={day.day + day.date} className="rounded-2xl border border-hairline bg-surface-0/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                {day.day} <span className="font-display text-base text-text-primary">{day.date}</span>
              </p>
              <ul className="mt-2 space-y-1.5">
                {day.items.length === 0 && <li className="text-xs text-text-tertiary">Clear</li>}
                {day.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={cn("ny-chip w-full justify-start truncate", KIND_STYLE[item.kind])}>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <Reveal>
          <p className="mt-4 text-xs leading-relaxed text-text-tertiary">
            Chama payouts, loan instalments and contribution deadlines land here in EAT. Tap any item to open the page it belongs to.
          </p>
        </Reveal>
      </Panel>
    </section>
  );
}
