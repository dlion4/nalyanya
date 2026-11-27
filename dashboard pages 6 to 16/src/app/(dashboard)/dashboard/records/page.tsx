"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArrowRight, Check, Download, FileSpreadsheet, Filter, Landmark, Plus, RefreshCw, Scale, Sparkles, StickyNote, Table2, Upload } from "lucide-react";
import {
  AS_OF,
  BRANCHES,
  BUCKETS,
  MONTH_KEYS,
  OPENING_BALANCE,
  OPENING_DATE,
  balanceCheck,
  balanceNow,
  bucketTotals,
  channelLabel,
  channelSeeds,
  channelStatus,
  countActive,
  digestSeed,
  emptyFilters,
  exceptionSeeds,
  fmtDate,
  frames,
  heatMax,
  heatValue,
  jobSeeds,
  meShare,
  monthCount,
  monthKeyOf,
  monthly,
  monthLabel,
  netAll,
  noteSeeds,
  applyFilters,
  auditSeed,
  sourceTotals,
  topBucketOf,
  totalIn,
  totalOut,
  txs,
  type AuditEntry,
  type Branch,
  type Channel,
  type Currency,
  type Digest,
  type DirTab,
  type Exception,
  type Job,
  type JobFormat,
  type Note,
  type Source,
  type Tx,
  type TxFilters,
  FX,
} from "@/data/dashboard/records";
import { fmt, kes } from "@/lib/format";
import { CountUp, Reveal, Tabs } from "@/components/ui/primitives";
import { FrameStrip, ShutterLightbox, ShutterStage } from "@/components/contributions/shutter-gallery";
import { useOverlay, type RcOverlay } from "@/components/records/use-overlay";
import { downloadText, toCsv } from "@/components/records/csv";
import { Bar, CashflowCurve, ChannelCard, Donut, HeatTable, NetBars } from "@/components/records/charts";
import {
  AuditModal,
  BalanceModal,
  ChannelModal,
  DecisionModal,
  DigestModal,
  HeatModal,
  JobModal,
  KraModal,
  MonthModal,
  NoteDeleteModal,
  NoteModal,
  ResolveModal,
} from "@/components/records/modals";
import { AttributionDrawer, FiltersDrawer, TxDrawer } from "@/components/records/drawers";
import { ExportWizard, ImportWizard } from "@/components/records/wizards";

const sections = [
  { id: "s1", label: "S1 · Ledger KPIs" },
  { id: "s2", label: "S2 · Unified history" },
  { id: "s3", label: "S3 · Analytics" },
  { id: "s4", label: "S4 · Attribution" },
  { id: "s5", label: "S5 · Reconciliation" },
  { id: "s6", label: "S6 · Export center" },
  { id: "s7", label: "S7 · Journal & notes" },
  { id: "s8", label: "S8 · Stories" },
];

const heatMonths = MONTH_KEYS.map((k) => ({ key: k, label: monthLabel(k) }));

const typeTone = (dir: "in" | "out") => (dir === "in" ? "ny-chip-ok" : "ny-chip-neutral");

/* The member who moved the most money within one source (computed from the ledger). */
function topOf(source: Source): { name: string; total: number } | null {
  const map = new Map<string, { name: string; total: number }>();
  for (const t of txs) {
    if (t.source !== source) continue;
    const cur = map.get(t.member);
    map.set(t.member, { name: t.memberName, total: (cur?.total ?? 0) + t.amount });
  }
  let best: { name: string; total: number } | null = null;
  for (const v of map.values()) {
    if (!best || v.total > best.total) best = v;
  }
  return best;
}

function jumpTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function RecordsPage() {
  return <RecordsView />;
}

function RecordsView() {
  const ov = useOverlay();

  /* ---------- live state (local mock — nothing leaves the browser) ---------- */
  const [filters, setFilters] = useState<TxFilters>(emptyFilters);
  const [dirTab, setDirTab] = useState<DirTab>("all");
  const [currency, setCurrency] = useState<Currency>("KES");
  const [notes, setNotes] = useState<Note[]>(noteSeeds);
  const [exceptions] = useState<Exception[]>(exceptionSeeds);
  const [resolved, setResolved] = useState<Record<string, string>>({});
  const [syncs, setSyncs] = useState<Record<Channel, string>>(
    () => Object.fromEntries(channelSeeds.map((c) => [c.id, c.lastSync])) as Record<Channel, string>,
  );
  const [jobs, setJobs] = useState<Job[]>(jobSeeds);
  const [digest, setDigest] = useState<Digest>(digestSeed);
  const [audit, setAudit] = useState<AuditEntry[]>(auditSeed);
  const [decision, setDecision] = useState<{ title: string; body: string; tone: "ok" | "warn" } | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  /* ---------- derived ---------- */
  const openExceptions = exceptions.filter((e) => !resolved[e.id]);
  const openTotal = openExceptions.length;
  const chStates = channelSeeds.map((c) => {
    const open = openExceptions.filter((e) => e.channel === c.id).length;
    return { c, open, state: channelStatus(c, syncs[c.id], open) };
  });
  const filtered = useMemo(() => applyFilters(txs, filters, dirTab).slice().reverse(), [filters, dirTab]);
  const activeCount = countActive(filters);
  const jobsActive = jobs.some((j) => j.status !== "done");
  const maxSource = Math.max(1, ...sourceTotals.map((s) => s.total));
  const txById = (id: string): Tx | null => txs.find((t) => t.id === id) ?? null;
  const sameLinkOf = (t: Tx): Tx[] => (t.link ? txs.filter((x) => x.link === t.link && x.id !== t.id) : []);

  /* ---------- background progress for export jobs ---------- */
  useEffect(() => {
    if (!jobsActive) return;
    const id = window.setInterval(() => {
      setJobs((prev) => {
        const busy = prev.some((j) => j.status === "running");
        let promoted = false;
        return prev.map((j): Job => {
          if (j.status === "running") {
            return j.progress >= 100 ? { ...j, status: "done", progress: 100 } : { ...j, progress: Math.min(100, j.progress + 8) };
          }
          if (j.status === "queued" && !busy && !promoted) {
            promoted = true;
            return { ...j, status: "running", progress: 4 };
          }
          return j;
        });
      });
    }, 450);
    return () => window.clearInterval(id);
  }, [jobsActive]);

  /* ---------- overlay targets (read from the URL) ---------- */
  const txTarget = ov.key === "tx" && ov.id ? txById(ov.id) : null;
  const excTarget = ov.key === "resolve" ? exceptions.find((e) => e.id === ov.id) ?? null : null;
  const monthTarget = ov.key === "month" ? monthly.find((m) => m.key === ov.id) ?? null : null;
  const [heatBranch = "", heatKey = ""] = ov.key === "heat" && ov.id ? ov.id.split("~") : [];
  const heatRows = ov.key === "heat" ? txs.filter((t) => t.branch === heatBranch && monthKeyOf(t.date) === heatKey) : [];
  const chTarget = ov.key === "channel" ? channelSeeds.find((c) => c.id === ov.id) ?? null : null;
  const chState = chStates.find((x) => x.c.id === chTarget?.id) ?? null;
  const jobTarget = ov.key === "job" ? jobs.find((j) => j.id === ov.id) ?? null : null;
  const noteTarget = ov.key === "note-del" ? notes.find((n) => n.id === ov.id) ?? null : null;
  const auditTarget = ov.key === "audit" ? audit.find((a) => a.ref === ov.id) ?? null : null;
  const attrSource = ov.key === "attr" ? ((ov.id as Source | null) ?? null) : null;

  /* ---------- actions ---------- */
  const open = (k: RcOverlay, id?: string, t?: string) => ov.open(k, id || t ? { id, t } : undefined);

  const log = (action: string, entity: string, detail: string, tone: AuditEntry["tone"] = "plain") =>
    setAudit((prev) => [
      { ref: `NY-AUD-${String(1120 + prev.length).padStart(5, "0")}`, at: "18 Nov · 10:40", actor: "Peter Wanyama Nalyanya", action, entity, detail, tone },
      ...prev,
    ]);

  const exportNow = (list: Tx[], name: string) => downloadText(name, toCsv(list));

  const queueJob = (j: { format: JobFormat; label: string; scope: string }) => {
    setJobs((prev) => [
      { id: `j${prev.length + 1}`, label: j.label, format: j.format, scope: j.scope, status: "queued", progress: 0, created: AS_OF },
      ...prev,
    ]);
    log("export.queue", j.scope, `${j.format} · ${j.label} · queued`, j.format === "KRA" ? "plain" : "gold");
    setDecision({
      title: "Export queued",
      body: `${j.label} is in the export center. ${j.format === "CSV" ? "The CSV downloads for real when it finishes." : "The file is generated by the backend in Phase 2."}`,
      tone: "ok",
    });
  };

  const resolveException = (e: Exception, action: string, reason: string) => {
    setResolved((prev) => ({ ...prev, [e.id]: action }));
    log("reconcile.resolve", e.ref, `${action}${reason ? ` · ${reason}` : ""} · SIMULATED`, "gold");
    ov.close();
    setDecision({ title: "Exception resolved", body: `${e.ref}: ${action}. The audit trail records who, when and why.`, tone: "ok" });
  };

  const importStatement = (c: Channel) => {
    setSyncs((prev) => ({ ...prev, [c]: AS_OF }));
    log("statement.import", c, "Statement imported with the simulated importer", "gold");
    setDecision({ title: "Statement imported (SIMULATED)", body: `${channelLabel[c]} is marked synced as of today. Lines still open need resolving.`, tone: "ok" });
  };

  const addNote = (txId: string, text: string, tags: string[]) => {
    const t = txById(txId);
    setNotes((prev) => [{ id: `n${prev.length + 1}`, txId, text: text.trim(), tags, at: AS_OF, author: "Peter W." }, ...prev]);
    log("journal.note", t?.ref ?? txId, `Note added · tags: ${tags.join(", ") || "none"}`);
    ov.close();
    setDecision({ title: "Note saved", body: "The note sits with its ledger line and in the family journal.", tone: "ok" });
  };

  const deleteNote = (n: Note, reason: string) => {
    setNotes((prev) => prev.filter((x) => x.id !== n.id));
    log("journal.delete", n.id, `Note removed · ${reason}`, "red");
    ov.close();
  };

  const saveDigest = (d: Digest) => {
    setDigest(d);
    log("digest.edit", "NY-DIGEST", `${d.on ? "on" : "off"} · ${d.day} ${d.time} · SIMULATED`);
    ov.close();
    setDecision({ title: "Digest settings saved (SIMULATED)", body: `Recipients: ${d.recipients.join(", ") || "none"}. Delivery connects in Phase 2.`, tone: "ok" });
  };

  const pickMonth = (key: string) => open("month", key);

  /* ================================================================== */
  return (
    <div className="page-dash-records mx-auto max-w-[1500px]">
      {/* ================= HERO ================= */}
      <Reveal>
        <header className="rc-hero mb-6">
          <img src="/images/contrib-hero.jpg" alt="A family counting a harambee collection on a veranda" className="rc-hero__img" fetchPriority="high" />
          <div className="rc-hero__shade" />
          <div className="rc-hero__body grid grid-cols-[minmax(0,1fr)] gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
            <div className="min-w-0">
              <span className="gd-code">T-12 · Records</span>
              <h1 className="ny-display mt-3 max-w-[20ch] text-[clamp(1.9rem,4.6vw,3.3rem)] leading-[1.02] text-on-brand">
                Every shilling, one ledger.
              </h1>
              <p className="mt-2.5 max-w-[60ch] text-sm leading-relaxed text-on-brand/85 sm:text-base">
                Contributions, chamas, shares, loans, allocations and grants, unified, attributed, reconciled and exportable.
                The treasurer and the elders read the same numbers.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-accent" onClick={() => open("export")}>
                  <Download className="h-4 w-4" /> Export records
                </button>
                <button type="button" className="ny-btn ny-btn-outline !border-on-brand/50 !text-on-brand hover:!bg-on-brand/10" onClick={() => open("import")}>
                  <Upload className="h-4 w-4" /> Import a statement
                </button>
                <button type="button" className="ny-btn ny-btn-ghost !text-on-brand/90 hover:!bg-on-brand/10" onClick={() => open("balance")}>
                  <Scale className="h-4 w-4" /> Balance check
                </button>
              </div>
            </div>

            <div className="rc-glass p-4">
              <p className="ny-hud !text-on-brand/70">Balance now · ledger</p>
              <p className="ny-display mt-1 text-[clamp(1.6rem,3vw,2.2rem)] leading-none">
                <CountUp value={balanceNow} prefix="KES " />
              </p>
              <p className="mt-1.5 text-xs text-on-brand/75">
                Opened {fmtDate(OPENING_DATE)} at KES {fmt(OPENING_BALANCE)}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-on-brand/20 pt-3">
                <span className="ny-hud !text-on-brand/75">Balance check</span>
                <span className={`ny-chip ${balanceCheck ? "ny-chip-ok" : "ny-chip-danger"}`}>{balanceCheck ? "balanced" : "out of balance"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="ny-hud !text-on-brand/75">Open exceptions</span>
                <span className={`ny-chip ${openTotal ? "ny-chip-warn ny-pulse" : "ny-chip-ok"}`}>{openTotal}</span>
              </div>
            </div>
          </div>
        </header>
      </Reveal>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[210px_minmax(0,1fr)]">
        <nav className="cc-rail" aria-label="Section index">
          <p className="ny-hud px-2 pb-1">Sections</p>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.label}
            </a>
          ))}
          <span className="ny-hud mt-2 border-t border-border-subtle px-2 pt-2 !text-[0.56rem]">8 sections · 17 overlays</span>
        </nav>

        <div className="min-w-0">
          {/* ================= S1 KPIs ================= */}
          <section id="s1" className="mb-8 scroll-mt-24" aria-label="Ledger KPIs">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
              {[
                { label: "Total in · since Jun 2025", accent: "var(--color-success)", hint: `${txs.filter((t) => t.dir === "in").length} money-in lines`, value: <CountUp value={totalIn} prefix="KES " /> },
                { label: "Total out", accent: "var(--color-brand-secondary)", hint: `${txs.filter((t) => t.dir === "out").length} money-out lines`, value: <CountUp value={totalOut} prefix="KES " /> },
                { label: "Net", accent: "var(--color-brand-primary)", hint: "money in minus money out", value: <span>{netAll < 0 ? "−" : ""}KES {fmt(Math.abs(netAll))}</span> },
                { label: "Transactions this month", accent: "var(--color-brand-accent)", hint: "November 2025, EAT", value: <CountUp value={monthCount} /> },
                { label: "Pending reconciliation", accent: "var(--color-warning)", hint: "exceptions waiting on a person", value: <CountUp value={openTotal} /> },
                { label: "Your share of money in", accent: "var(--color-brand-primary)", hint: "Peter W. · of all money in", value: <CountUp value={meShare} suffix="%" /> },
              ].map((k, i) => (
                <Reveal key={k.label} delay={i * 60}>
                  <div className="rc-kpi" style={{ ["--kpi-accent" as string]: k.accent } as CSSProperties}>
                    <p className="ny-hud">{k.label}</p>
                    <p className="rc-kpi__value mt-1.5">{k.value}</p>
                    <p className="mt-1.5 text-xs text-text-tertiary">{k.hint}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ================= S2 UNIFIED HISTORY ================= */}
          <section id="s2" className="mb-8 scroll-mt-24" aria-label="Unified history">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Every money event</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Unified history</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="ny-hud">
                  {filtered.length} of {txs.length} lines
                </span>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => open("filters")}>
                  <Filter className="h-3.5 w-3.5" /> Filters
                  {activeCount > 0 && <span className="ny-chip ny-chip-brand !px-1.5">{activeCount}</span>}
                </button>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => exportNow(filtered, "nalyanya-ledger-filtered.csv")}>
                  <Download className="h-3.5 w-3.5" /> CSV now
                </button>
              </div>
            </div>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <Tabs
                tabs={[
                  { id: "all", label: "All" },
                  { id: "in", label: "Money in" },
                  { id: "out", label: "Money out" },
                ]}
                active={dirTab}
                onChange={(id) => setDirTab(id as DirTab)}
              />
              <div className="flex gap-1.5" role="group" aria-label="Display currency">
                {(["KES", "USD", "EUR"] as Currency[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={currency === c}
                    onClick={() => setCurrency(c)}
                    className={`ny-chip ny-touch transition ${currency === c ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="cc-table-wrap ny-scroll overflow-x-auto">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Ref</th>
                    <th>Member</th>
                    <th>Branch</th>
                    <th className="text-right">Amount</th>
                    <th className="text-right">Shown in {currency}</th>
                    <th>Channel</th>
                    <th className="text-right">Balance after</th>
                    <th>Source</th>
                    <th>Module</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} onClick={() => open("tx", t.id, "summary")}>
                      <td data-label="Date" className="ny-num whitespace-nowrap text-text-secondary">{fmtDate(t.date)}</td>
                      <td data-label="Type">
                        <span className={`ny-chip ${typeTone(t.dir)}`}>{t.label}</span>
                      </td>
                      <td data-label="Ref" className="ny-hud !text-[0.6rem]">{t.ref}</td>
                      <td data-label="Member" className="font-semibold">{t.memberName}</td>
                      <td data-label="Branch">{t.branch}</td>
                      <td data-label="Amount" className={`ny-num text-right font-semibold ${t.dir === "in" ? "text-success" : "text-danger"}`}>
                        {t.dir === "in" ? "+" : "−"}
                        {kes(t.amount)}
                      </td>
                      <td data-label={`Shown in ${currency}`} className="ny-num text-right text-text-secondary">
                        {currency === "KES" ? "—" : `${currency} ${(t.amount / FX[currency]).toFixed(2)}`}
                      </td>
                      <td data-label="Channel">
                        <span className="ny-chip ny-chip-neutral">{channelLabel[t.channel]}</span>
                        {t.status === "pending" && <span className="ny-chip ny-chip-warn ml-1">pending</span>}
                      </td>
                      <td data-label="Balance after" className="ny-num text-right">{kes(t.balance)}</td>
                      <td data-label="Source">
                        <span className="ny-chip ny-chip-brand">{t.source}</span>
                      </td>
                      <td data-label="Module" onClick={(e) => e.stopPropagation()}>
                        <Link href={t.href} className="ny-btn ny-btn-ghost ny-btn-sm">
                          Open <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={11} className="!py-10 text-center">
                        <p className="ny-display text-base">Nothing matches these filters</p>
                        <p className="mt-1 text-sm text-text-secondary">Clear them and the full ledger comes back.</p>
                        <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-3" onClick={() => { setFilters(emptyFilters); setDirTab("all"); }}>
                          Clear filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="ny-hud mt-2">Click a line for its double entry · pending means the statement line is not imported yet</p>
          </section>

          {/* ================= S3 ANALYTICS ================= */}
          <section id="s3" className="mb-8 scroll-mt-24" aria-label="Analytics">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S3 · Analytics</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Where the money moves</h2>
                <p className="mt-1 max-w-[62ch] text-sm text-text-secondary">
                  Every chart is clickable. A month opens its detail, a type filters the table, and a branch cell lists its lines.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
              <Reveal>
                <div className="rc-card">
                  <p className="ny-hud">Cumulative net</p>
                  <h3 className="ny-display text-lg">Family cash flow</h3>
                  <div className="mt-3">
                    <CashflowCurve months={monthly} onPick={pickMonth} />
                  </div>
                </div>
              </Reveal>
              <Reveal delay={70}>
                <div className="rc-card">
                  <p className="ny-hud">Monthly</p>
                  <h3 className="ny-display text-lg">Money in against money out</h3>
                  <div className="mt-3">
                    <NetBars months={monthly} onPick={pickMonth} />
                  </div>
                </div>
              </Reveal>
              <Reveal>
                <div className="rc-card">
                  <p className="ny-hud">By type</p>
                  <h3 className="ny-display text-lg">Where the money goes</h3>
                  <div className="mt-3">
                    <Donut
                      rows={bucketTotals}
                      onPick={(b) => {
                        setFilters((prev) => ({ ...prev, bucket: b }));
                        jumpTo("s2");
                      }}
                    />
                  </div>
                </div>
              </Reveal>
              <Reveal delay={70}>
                <div className="rc-card">
                  <p className="ny-hud">By branch</p>
                  <h3 className="ny-display text-lg">Heat by branch and month</h3>
                  <div className="mt-3">
                    <HeatTable
                      branches={BRANCHES}
                      months={heatMonths}
                      value={heatValue}
                      max={heatMax}
                      onPick={(b, k) => open("heat", `${b}~${k}`)}
                    />
                  </div>
                  <p className="ny-hud mt-3 !text-[0.52rem]">Darker means more money moved · {BUCKETS.length} types</p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ================= S4 ATTRIBUTION ================= */}
          <section id="s4" className="mb-8 scroll-mt-24" aria-label="Attribution analytics">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S4 · Attribution</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Who funds what</h2>
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {sourceTotals.map((s, i) => {
                const top = topOf(s.source);
                return (
                  <Reveal key={s.source} delay={i * 40} className="h-full">
                    <button type="button" className="rc-source" onClick={() => open("attr", s.source)}>
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{s.label}</span>
                        <span className="ny-hud !text-[0.52rem]">{s.count} lines</span>
                      </span>
                      <span className="ny-num ny-display text-xl leading-none">{kes(s.total)}</span>
                      <Bar value={s.total} max={maxSource} />
                      <span className="ny-hud mt-auto !text-[0.52rem]">Top: {top ? `${top.name.split(" ")[0]} ${top.name.split(" ")[1] ?? ""}` : "—"}</span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </section>

          {/* ================= S5 RECONCILIATION ================= */}
          <section id="s5" className="mb-8 scroll-mt-24" aria-label="Reconciliation">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S5 · Reconciliation</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Statements against the ledger</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => open("import")}>
                  <Upload className="h-3.5 w-3.5" /> Import a statement
                </button>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("balance")}>
                  <Scale className="h-3.5 w-3.5" /> Balance check
                </button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {chStates.map((x, i) => (
                <Reveal key={x.c.id} delay={i * 50} className="h-full">
                  <ChannelCard
                    label={x.c.label}
                    detail={x.c.detail}
                    state={x.state}
                    lastSync={fmtDate(syncs[x.c.id])}
                    openCount={x.open}
                    sim={x.c.sim}
                    onOpen={() => open("channel", x.c.id)}
                  />
                </Reveal>
              ))}
            </div>

            <div className="cc-table-wrap ny-scroll overflow-x-auto">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Channel</th>
                    <th>Statement line</th>
                    <th className="text-right">Amount</th>
                    <th>Issue</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {exceptions.map((e) => {
                    const done = !!resolved[e.id];
                    return (
                      <tr key={e.id}>
                        <td data-label="Ref" className="ny-hud !text-[0.6rem]">{e.ref}</td>
                        <td data-label="Channel">{channelLabel[e.channel]}</td>
                        <td data-label="Statement">
                          <span className="block font-medium">{e.statement}</span>
                          <span className="ny-hud !text-[0.52rem]">{e.detail}</span>
                        </td>
                        <td data-label="Amount" className="ny-num text-right font-semibold">{kes(e.amount)}</td>
                        <td data-label="Issue">
                          <span className={`ny-chip ${e.kind === "duplicate" ? "ny-chip-info" : e.kind === "mismatch" ? "ny-chip-warn" : "ny-chip-danger"}`}>{e.kind}</span>
                        </td>
                        <td data-label="Status">
                          <span className={`ny-chip ${done ? "ny-chip-ok" : "ny-chip-warn ny-pulse"}`}>{done ? "resolved" : "open"}</span>
                        </td>
                        <td data-label="Action">
                          {done ? (
                            <span className="ny-hud !text-[0.55rem]">{resolved[e.id]}</span>
                          ) : (
                            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("resolve", e.id)}>
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="ny-hud mt-2">Every resolve writes an audit row with the actor and the reason · SIMULATED importer</p>
          </section>

          {/* ================= S6 EXPORT CENTER ================= */}
          <section id="s6" className="mb-8 scroll-mt-24" aria-label="Export center">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S6 · Export center</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Statements, workbooks and tax</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("export")}>
                  <Plus className="h-3.5 w-3.5" /> New export
                </button>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => open("kra")}>
                  <Landmark className="h-3.5 w-3.5" /> KRA tax export
                </button>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12">
              <div className="flex flex-col gap-2 lg:col-span-7">
                {jobs.map((j) => (
                  <button key={j.id} type="button" className="rc-job" onClick={() => open("job", j.id)}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border-subtle bg-surface-2">
                      {j.status === "running" ? (
                        <RefreshCw className="rc-spin h-4 w-4 text-brand-primary" />
                      ) : j.status === "done" ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <FileSpreadsheet className="h-4 w-4 text-text-tertiary" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{j.label}</span>
                      <span className="ny-hud block !text-[0.52rem]">
                        {j.format} · {j.scope} · {fmtDate(j.created)}
                      </span>
                      <span className="mt-2 block">
                        <Bar value={j.progress} max={100} gold={j.status === "done"} />
                      </span>
                    </span>
                    <span className={`ny-chip shrink-0 ${j.status === "done" ? "ny-chip-ok" : j.status === "running" ? "ny-chip-info" : "ny-chip-neutral"}`}>{j.status}</span>
                  </button>
                ))}
              </div>

              <div className="rc-card flex flex-col gap-3 lg:col-span-5">
                <p className="ny-hud">Quick actions</p>
                <button type="button" className="ny-btn ny-btn-accent ny-btn-sm justify-start whitespace-normal text-left" onClick={() => exportNow(txs.slice().reverse(), "nalyanya-ledger.csv")}>
                  <Download className="h-3.5 w-3.5" /> Download the full ledger now (CSV)
                </button>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm justify-start whitespace-normal text-left" onClick={() => open("export")}>
                  <Table2 className="h-3.5 w-3.5" /> Statement for a member or branch
                </button>
                <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm justify-start whitespace-normal text-left" onClick={() => open("kra")}>
                  <Landmark className="h-3.5 w-3.5" /> Tax export for KRA (stub)
                </button>
                <p className="ny-hud mt-auto !text-[0.52rem]">
                  CSV is built in your browser from the local ledger. XLSX and PDF are queued and connect in Phase 2.
                </p>
              </div>
            </div>
          </section>

          {/* ================= S7 JOURNAL & NOTES ================= */}
          <section id="s7" className="mb-8 scroll-mt-24" aria-label="Journal and notes">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S7 · Journal</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Notes, tags and the weekly digest</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => open("digest")}>
                  <Sparkles className="h-3.5 w-3.5" /> Weekly digest
                </button>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("note-add", txs[txs.length - 1]?.id ?? "")}>
                  <StickyNote className="h-3.5 w-3.5" /> Add a note
                </button>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12">
              <div className="flex flex-col gap-3 lg:col-span-8">
                {notes.length === 0 && <p className="rc-card text-sm text-text-secondary">No notes yet. Add one to a ledger line to start the journal.</p>}
                {notes.map((n) => {
                  const t = txById(n.txId);
                  return (
                    <article key={n.id} className="rc-card rc-note">
                      <p className="text-sm leading-relaxed">{n.text}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {n.tags.map((tag) => (
                          <span key={tag} className="ny-chip ny-chip-brand">{tag}</span>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <span className="ny-hud !text-[0.52rem]">
                          {n.author} · {fmtDate(n.at)}
                          {t ? ` · ${t.label} · ${t.ref}` : ""}
                        </span>
                        <span className="flex gap-1.5">
                          {t && (
                            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => open("tx", t.id, "notes")}>
                              Open line
                            </button>
                          )}
                          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => open("note-del", n.id)}>
                            Delete
                          </button>
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>

              <aside className="rc-card flex flex-col gap-3 lg:col-span-4">
                <p className="ny-hud">Weekly digest</p>
                <span className={`ny-chip self-start ${digest.on ? "ny-chip-ok" : "ny-chip-neutral"}`}>{digest.on ? "on" : "off"}</span>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Every {digest.day} at {digest.time} EAT: the week&apos;s money in and out, open exceptions, and the notes you tagged for the tax return.
                </p>
                <div className="ny-inset px-3.5 py-3">
                  <p className="ny-hud !text-[0.52rem]">Recipients</p>
                  <p className="mt-1 text-sm">{digest.recipients.join(", ") || "none"}</p>
                </div>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm w-full" onClick={() => open("digest")}>
                  Edit digest settings
                </button>
                <p className="ny-chip ny-chip-sim mt-auto">SIMULATED · delivery connects in Phase 2</p>
              </aside>
            </div>
          </section>

          {/* ================= S8 STORIES (camera pinhole) ================= */}
          <section id="s8" className="mb-8 scroll-mt-24" aria-label="Stories behind the ledger">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S8 · Camera pinhole</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">The people behind the lines</h2>
                <p className="mt-1 max-w-[62ch] text-sm text-text-secondary">
                  The iris closes to a pinhole, the exposure flashes, and the next frame opens. Step through, or open the full contact sheet.
                </p>
              </div>
              <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => setLightbox(true)}>
                Full contact sheet
              </button>
            </div>
            <Reveal>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="min-w-0">
                  <ShutterStage frames={frames} index={frameIndex} onIndexChange={setFrameIndex} />
                  <div className="mt-3">
                    <FrameStrip frames={frames} index={frameIndex} onIndexChange={setFrameIndex} />
                  </div>
                </div>
                <aside className="ny-card p-4">
                  <p className="ny-hud">Frame notes</p>
                  <ul className="mt-2 space-y-2.5">
                    {[
                      { k: "Transition", v: "iris, pinhole, flash, open" },
                      { k: "Timing", v: "400ms close · 440ms open" },
                      { k: "Depth", v: "CSS 3D perspective 1400px" },
                      { k: "Accessibility", v: "reduced motion snaps instantly" },
                    ].map((n) => (
                      <li key={n.k} className="ny-inset px-3 py-2.5">
                        <span className="ny-hud block !text-[0.55rem]">{n.k}</span>
                        <span className="text-sm font-medium">{n.v}</span>
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-3 w-full" onClick={() => setLightbox(true)}>
                    <Sparkles className="h-3.5 w-3.5" /> Expand
                  </button>
                  <p className="ny-hud mt-3">Drive connector SIMULATED · Phase 2 pulls real albums</p>
                </aside>
              </div>
            </Reveal>
          </section>

          {/* ================= FOOTER ================= */}
          <Reveal>
            <footer className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Frontend-only Phase 1.</strong> Every statement rail and export format below renders fully and resolves honestly.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["M-Pesa statement", "Bank statement", "Airtel statement", "XLSX workbook", "PDF statement", "KRA iTax"].map((r) => (
                    <span key={r} className="ny-chip ny-chip-sim">{r}</span>
                  ))}
                </div>
              </div>
            </footer>
          </Reveal>
        </div>
      </div>

      {/* ================= URL-DRIVEN OVERLAYS ================= */}
      {ov.key === "tx" && txTarget && (
        <TxDrawer
          key={`tx-${ov.id}-${ov.nonce ?? "0"}`}
          tx={txTarget}
          initialTab={ov.t ?? "summary"}
          notes={notes.filter((n) => n.txId === txTarget.id)}
          sameLink={sameLinkOf(txTarget)}
          onNote={() => open("note-add", txTarget.id)}
          onOpenTx={(id) => open("tx", id, "summary")}
          onClose={ov.close}
        />
      )}

      {ov.key === "filters" && (
        <FiltersDrawer
          value={filters}
          matched={applyFilters(txs, filters, dirTab).length}
          onChange={setFilters}
          onClose={ov.close}
        />
      )}

      {attrSource && (
        <AttributionDrawer source={attrSource} rows={txs} onOpenTx={(id) => open("tx", id, "summary")} onClose={ov.close} />
      )}

      {/* ================= WIZARDS ================= */}
      {ov.key === "export" && <ExportWizard rows={txs} onQueue={queueJob} onDownload={exportNow} onClose={ov.close} />}

      {ov.key === "import" && (
        <ImportWizard
          rows={txs}
          initial={(ov.id as Channel | null) ?? null}
          openCountOf={(c) => openExceptions.filter((e) => e.channel === c).length}
          onImport={importStatement}
          onClose={ov.close}
        />
      )}

      {/* ================= MODALS ================= */}
      {excTarget && (
        <ResolveModal
          exc={excTarget}
          channelName={channelLabel[excTarget.channel]}
          onResolve={(action, reason) => resolveException(excTarget, action, reason)}
          onClose={ov.close}
        />
      )}

      {ov.key === "kra" && (
        <KraModal
          onQueue={(year) => {
            queueJob({ format: "KRA", label: `KRA iTax ${year} (stub)`, scope: "Family" });
            ov.close();
          }}
          onClose={ov.close}
        />
      )}

      {monthTarget && (
        <MonthModal
          row={monthTarget}
          topBucket={topBucketOf(monthTarget.key)}
          onView={() => {
            setFilters({ ...emptyFilters, from: `${monthTarget.key}-01`, to: `${monthTarget.key}-31` });
            setDirTab("all");
            ov.close();
            jumpTo("s2");
          }}
          onClose={ov.close}
        />
      )}

      {ov.key === "heat" && heatBranch && (
        <HeatModal
          branch={heatBranch as Branch}
          monthKey={heatKey}
          rows={heatRows}
          onOpenTx={(id) => open("tx", id, "summary")}
          onClose={ov.close}
        />
      )}

      {chTarget && chState && (
        <ChannelModal
          channel={chTarget}
          state={chState.state}
          openList={openExceptions.filter((e) => e.channel === chTarget.id)}
          onImport={() => open("import", chTarget.id)}
          onClose={ov.close}
        />
      )}

      {ov.key === "note-add" && (
        <NoteModal
          options={txs.slice().reverse().slice(0, 40)}
          preselect={ov.id}
          onSave={addNote}
          onClose={ov.close}
        />
      )}

      {noteTarget && <NoteDeleteModal note={noteTarget} onConfirm={(reason) => deleteNote(noteTarget, reason)} onClose={ov.close} />}

      {ov.key === "digest" && <DigestModal config={digest} onSave={saveDigest} onClose={ov.close} />}

      {jobTarget && (
        <JobModal job={jobTarget} onDownload={() => exportNow(txs.slice().reverse(), "nalyanya-ledger.csv")} onClose={ov.close} />
      )}

      {ov.key === "balance" && (
        <BalanceModal opening={OPENING_BALANCE} totalIn={totalIn} totalOut={totalOut} balanceNow={balanceNow} onClose={ov.close} />
      )}

      {auditTarget && <AuditModal entry={auditTarget} onClose={ov.close} />}

      {decision && <DecisionModal data={decision} onClose={() => setDecision(null)} />}

      <ShutterLightbox open={lightbox} onClose={() => setLightbox(false)} index={frameIndex} onIndexChange={setFrameIndex} frames={frames} />

    </div>
  );
}
