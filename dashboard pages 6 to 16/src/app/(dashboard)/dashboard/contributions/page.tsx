"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CircleDollarSign,
  Download,
  Filter,
  LayoutGrid,
  Megaphone,
  Plus,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Table2,
  Users,
} from "lucide-react";
import {
  causes as seedCauses,
  channelLabel,
  contributions as seedContributions,
  contributors as topContributors,
  kpis,
  kes,
  ledger as seedLedger,
  payouts as seedPayouts,
  pct,
  purposeLabel,
  purposeTone,
  statusTone,
  audit as seedAudit,
  type AuditEntry,
  type Cause,
  type Channel,
  type ConStatus,
  type Contribution,
  type LedgerEntry,
  type Payout,
} from "@/data/dashboard/contributions";
import { CountUp, Reveal, Ring } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlay";
import { CreateCauseWizard, ContributeWizard, type ContributeResult } from "@/components/contributions/wizards";
import {
  AuditDetailModal,
  BroadcastModal,
  CauseDrawer,
  ChannelMatrixModal,
  ContributorModal,
  DeleteCauseModal,
  ExportModal,
  FiltersDrawer,
  emptyFilters,
  LedgerModal,
  PayoutReleaseModal,
  ReceiptModal,
  ReconcileModal,
  type Filters,
} from "@/components/contributions/modals";
import { FrameStrip, ShutterLightbox, ShutterStage } from "@/components/contributions/shutter-gallery";

const sections = [
  { id: "s1", label: "S1 · KPIs" },
  { id: "s2", label: "S2 · Causes" },
  { id: "s3", label: "S3 · Contribute" },
  { id: "s4", label: "S4 · Ledger table" },
  { id: "s5", label: "S5 · Detail drawer" },
  { id: "s6", label: "S6 · Create cause" },
  { id: "s7", label: "S7 · Payouts" },
  { id: "s8", label: "S8 · Frames" },
  { id: "s9", label: "S9 · Audit" },
];

const purposeFilters = ["all", "education", "medical", "funeral", "project", "wedding", "emergency", "harambee", "merry-go-round"] as const;

export default function ContributionsPage() {
  const toast = useToast();

  const [causes, setCauses] = useState<Cause[]>(seedCauses);
  const [rows, setRows] = useState<Contribution[]>(seedContributions);
  const [payouts, setPayouts] = useState<Payout[]>(seedPayouts);
  const [flashRef, setFlashRef] = useState<string | null>(null);

  const [purpose, setPurpose] = useState<string>("all");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [contributeOpen, setContributeOpen] = useState(false);
  const [preselect, setPreselect] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [drawerCause, setDrawerCause] = useState<Cause | null>(null);
  const [receipt, setReceipt] = useState<(Contribution & { note?: string }) | null>(null);
  const [payout, setPayout] = useState<Payout | null>(null);
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [broadcastCause, setBroadcastCause] = useState<Cause | null>(null);
  const [contributor, setContributor] = useState<(typeof topContributors)[number] | null>(null);
  const [auditEntry, setAuditEntry] = useState<AuditEntry | null>(null);
  const [ledgerEntry, setLedgerEntry] = useState<LedgerEntry | null>(null);
  const [deleteCause, setDeleteCause] = useState<Cause | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [activeSec, setActiveSec] = useState("s1");
  const [tabView, setTabView] = useState<"cards" | "table">("cards");

  /* scroll spy for the film rail */
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSec(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.15, 0.5] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const filteredCauses = useMemo(
    () => (purpose === "all" ? causes : causes.filter((c) => c.purpose === purpose)),
    [causes, purpose],
  );

  const filteredRows = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (filters.channel !== "all" && r.channel !== filters.channel) return false;
      if (filters.purpose !== "all") {
        const c = causes.find((x) => x.id === r.causeId);
        if (!c || c.purpose !== filters.purpose) return false;
      }
      if (q && !(`${r.contributor} ${r.ref} ${r.receipt}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, filters, causes]);

  const activeFilters =
    (filters.status !== "all" ? 1 : 0) + (filters.channel !== "all" ? 1 : 0) + (filters.purpose !== "all" ? 1 : 0) + (filters.q ? 1 : 0);

  const causeTitle = (id: string) => causes.find((c) => c.id === id)?.title ?? "a cause";

  const openContribute = (id?: string) => {
    setPreselect(id ?? null);
    setContributeOpen(true);
  };

  const handleDone = (r: ContributeResult) => {
    const row: Contribution = {
      ref: r.ref,
      date: "Just now · EAT",
      contributor: "Peter Wanyama Nalyanya",
      contributorId: "m05",
      causeId: r.causeId,
      amount: r.amount,
      channel: r.channel,
      status: r.channel === "bank" ? "pending" : "confirmed",
      receipt: r.receipt,
      ledgerRef: r.ledgerRef,
      message: r.message || undefined,
    };
    setRows((prev) => [row, ...prev]);
    setCauses((prev) => prev.map((c) => (c.id === r.causeId ? { ...c, raised: c.raised + r.amount, contributors: c.contributors + 1 } : c)));
    setFlashRef(r.ref);
    window.setTimeout(() => setFlashRef(null), 1200);
    setReceipt(row);
    toast({
      tone: "ok",
      title: `${kes(r.amount)} posted to the tally`,
      body: `${r.ref} · ${channelLabel[r.channel]} · SIMULATED — no money moved.`,
    });
  };

  const handlePublish = (c: { title: string; purpose: Cause["purpose"]; beneficiary: string; goal: number; deadline: string; scope: string; payout: string }) => {
    const next: Cause = {
      id: `c${causes.length + 1}`,
      ref: `NY-CON-2025-004${50 + causes.length}`,
      title: c.title,
      purpose: c.purpose,
      beneficiary: c.beneficiary,
      goal: c.goal,
      raised: 0,
      contributors: 0,
      deadline: c.deadline,
      status: "open",
      branch: "Nairobi",
      organizer: "Peter Wanyama Nalyanya",
      image: "/images/contrib-hero.jpg",
      blurb: `Newly published by Peter Wanyama — ${c.scope.toLowerCase()}.`,
      payoutTo: c.payout,
      scope: c.scope as Cause["scope"],
    };
    setCauses((prev) => [next, ...prev]);
    toast({ tone: "ok", title: "Cause published", body: `${next.ref} · visible to ${c.scope.toLowerCase()}.` });
  };

  const handleRelease = (p: Payout) => {
    setPayouts((prev) => prev.map((x) => (x.ref === p.ref ? { ...x, status: "settled", at: "Just now · SIMULATED" } : x)));
    setFlashRef(p.ref);
    window.setTimeout(() => setFlashRef(null), 1200);
    toast({ tone: "ok", title: "Payout released (SIMULATED)", body: `${p.ref} · ${kes(p.amount)} → ${p.destination}` });
  };

  const totalRaised = causes.reduce((s, c) => s + c.raised, 0);

  return (
    <div className="page-dash-contributions mx-auto max-w-[1500px]">
      {/* ================= HEADER / HERO ================= */}
      <Reveal>
        <header className="cc-hero mb-5">
          <img src="/images/contrib-hero.jpg" alt="Family counting a harambee collection on a Bungoma veranda" className="cc-hero__img" fetchPriority="high" />
          <div className="cc-hero__body flex flex-wrap items-end justify-between gap-5 p-5 sm:p-7">
            <div className="min-w-0">
              <span className="gd-code">T-7 · Contributions</span>
              <h1 className="ny-display mt-3 max-w-[18ch] text-[clamp(1.8rem,4.4vw,3.2rem)] leading-[1.02] text-[#faf6ee]">
                The giving hub — every shilling, one ledger.
              </h1>
              <p className="mt-2.5 max-w-[54ch] text-sm leading-relaxed text-[rgba(250,246,238,0.86)] sm:text-base">
                Weddings, sickness, funerals, harambees, projects, education, emergencies and merry-go-rounds — live
                tallies, payouts to organizers, full reconciliation. Built so grandma can give in two taps.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-accent" onClick={() => openContribute()}>
                  <Banknote className="h-4 w-4" /> Contribute now
                </button>
                <button type="button" className="ny-btn ny-btn-outline !border-[rgba(250,246,238,0.5)] !text-[#faf6ee] hover:!bg-[rgba(250,246,238,0.14)]" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4" /> Create a cause
                </button>
                <button type="button" className="ny-btn ny-btn-ghost !text-[rgba(250,246,238,0.9)] hover:!bg-[rgba(250,246,238,0.14)]" onClick={() => setMatrixOpen(true)}>
                  <ShieldCheck className="h-4 w-4" /> Channel matrix
                </button>
              </div>
            </div>
            <div className="ny-num rounded-xl border border-[rgba(250,246,238,0.28)] bg-[rgba(10,14,11,0.42)] px-4 py-3 text-[#faf6ee] backdrop-blur">
              <p className="ny-hud !text-[rgba(250,246,238,0.7)]">Raised across all causes</p>
              <p className="ny-display mt-1 text-[clamp(1.4rem,3vw,2.1rem)] leading-none">
                <CountUp value={totalRaised} prefix="KES " />
              </p>
              <p className="mt-1.5 text-xs text-[rgba(250,246,238,0.75)]">
                {causes.reduce((s, c) => s + c.contributors, 0)} contributions · {causes.length} causes
              </p>
            </div>
          </div>
        </header>
      </Reveal>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[210px_minmax(0,1fr)]">
        {/* film rail */}
        <nav className="cc-rail" aria-label="Section index">
          <p className="ny-hud px-2 pb-1">Sections</p>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={activeSec === s.id ? "is-active" : ""}>
              {s.label}
            </a>
          ))}
          <span className="ny-hud mt-2 border-t border-border-subtle px-2 pt-2 !text-[0.56rem]">
            9 sections · 15+ overlays
          </span>
        </nav>

        <div className="min-w-0">
          {/* ================= S1 KPI ROW ================= */}
          <section id="s1" className="mb-6 scroll-mt-24" aria-label="KPI row">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {kpis.map((k, i) => (
                <Reveal key={k.label} delay={i * 60}>
                  <div
                    className="cc-kpi"
                    style={
                      {
                        ["--kpi-accent" as string]:
                          k.tone === "gold" ? "#d4a437" : k.tone === "warn" ? "#e0a82e" : k.tone === "ok" ? "#2e7d32" : "#1f4d3a",
                      } as React.CSSProperties
                    }
                  >
                    <p className="ny-hud">{k.label}</p>
                    <p className="cc-kpi__value mt-1.5">
                      <CountUp value={k.value} prefix={k.prefix ?? ""} />
                    </p>
                    <p className="mt-1.5 text-xs text-text-tertiary">{k.hint}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ================= S2 CAUSES GRID ================= */}
          <section id="s2" className="mb-7 scroll-mt-24" aria-label="Causes">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Contact sheet</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Causes open to the family</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1 rounded-lg border border-border-subtle bg-surface-1 p-1">
                  <button
                    type="button"
                    onClick={() => setTabView("cards")}
                    aria-pressed={tabView === "cards"}
                    className={`ny-btn ny-btn-sm ${tabView === "cards" ? "ny-btn-primary" : "ny-btn-ghost"}`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" /> Frames
                  </button>
                  <button
                    type="button"
                    onClick={() => setTabView("table")}
                    aria-pressed={tabView === "table"}
                    className={`ny-btn ny-btn-sm ${tabView === "table" ? "ny-btn-primary" : "ny-btn-ghost"}`}
                  >
                    <Table2 className="h-3.5 w-3.5" /> Compact
                  </button>
                </div>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> New cause
                </button>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-1.5">
              {purposeFilters.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(p)}
                  className={`ny-chip ny-touch transition ${
                    purpose === p ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"
                  }`}
                >
                  {p === "all" ? "All purposes" : purposeLabel[p as keyof typeof purposeLabel]}
                </button>
              ))}
            </div>

            {filteredCauses.length === 0 ? (
              <div className="ny-inset px-6 py-12 text-center">
                <p className="ny-display text-lg">No {purposeLabel[purpose as keyof typeof purposeLabel] ?? purpose} causes right now</p>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-text-secondary">
                  Try another purpose, or start one — it reaches all 243 members in seconds.
                </p>
                <button type="button" className="ny-btn ny-btn-accent ny-btn-sm mt-4" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> Create a cause
                </button>
              </div>
            ) : tabView === "cards" ? (
              <div className="cc-sheet">
                {filteredCauses.map((c, i) => {
                  const p = pct(c.raised, c.goal);
                  return (
                    <Reveal key={c.id} delay={i * 55}>
                      <article className="cc-cause">
                        <div className="cc-cause__frame">
                          <div className="cc-cause__notch">
                            <span className={`ny-chip ${purposeTone[c.purpose]}`}>{purposeLabel[c.purpose]}</span>
                            {c.status === "closing" && <span className="ny-chip ny-chip-warn ny-pulse">closing</span>}
                            {c.status === "met" && <span className="ny-chip ny-chip-ok">goal met</span>}
                          </div>
                          <img src={c.image} alt="" className="cc-cause__img" loading="lazy" decoding="async" />
                          <span className="cc-cause__sweep" aria-hidden />
                          <span className="absolute bottom-2 right-2 rounded bg-[rgba(10,14,11,0.55)] px-1.5 py-0.5 ny-hud !text-[0.55rem] !text-[rgba(250,246,238,0.9)] backdrop-blur">
                            {c.ref}
                          </span>
                        </div>
                        <div className="cc-cause__body">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="cc-cause__title">{c.title}</h3>
                            <Ring pct={p} size={52} stroke={5.5} gold={p >= 100} label={`${p}%`} />
                          </div>
                          <p className="text-xs leading-relaxed text-text-secondary">
                            {c.beneficiary}
                            {c.beneficiaryNote ? ` · ${c.beneficiaryNote}` : ""}
                          </p>
                          <p className="ny-num text-sm font-semibold text-text-primary">
                            {kes(c.raised)} <span className="font-normal text-text-tertiary">of {kes(c.goal)}</span>
                          </p>
                          <div className="ny-hud flex flex-wrap gap-x-3 gap-y-1 !text-[0.58rem]">
                            <span className="inline-flex items-center gap-1">
                              <Users className="h-3 w-3" /> {c.contributors}
                            </span>
                            <span>by {c.deadline}</span>
                            <span>{c.branch}</span>
                          </div>
                          <div className="mt-auto flex gap-2 pt-1">
                            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm flex-1" onClick={() => openContribute(c.id)}>
                              Contribute <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => { setDrawerCause(c); }}>
                              Details
                            </button>
                          </div>
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            ) : (
              <div className="cc-table-wrap">
                <table className="cc-table">
                  <thead>
                    <tr>
                      <th>Cause</th>
                      <th>Purpose</th>
                      <th className="text-right">Raised</th>
                      <th className="text-right">Goal</th>
                      <th className="text-right">%</th>
                      <th>Deadline</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCauses.map((c) => (
                      <tr key={c.id} onClick={() => setDrawerCause(c)}>
                        <td data-label="Cause">
                          <span className="block font-semibold">{c.title}</span>
                          <span className="ny-hud !text-[0.55rem]">{c.ref}</span>
                        </td>
                        <td data-label="Purpose">
                          <span className={`ny-chip ${purposeTone[c.purpose]}`}>{purposeLabel[c.purpose]}</span>
                        </td>
                        <td data-label="Raised" className="ny-num text-right font-semibold">{kes(c.raised)}</td>
                        <td data-label="Goal" className="ny-num text-right">{kes(c.goal)}</td>
                        <td data-label="%" className="ny-num text-right font-semibold">{pct(c.raised, c.goal)}%</td>
                        <td data-label="Deadline" className="ny-num">{c.deadline}</td>
                        <td data-label="" className="text-right">
                          <button
                            type="button"
                            className="ny-btn ny-btn-primary ny-btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              openContribute(c.id);
                            }}
                          >
                            Contribute
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ================= S3 CONTRIBUTE STRIP ================= */}
          <section id="s3" className="mb-7 scroll-mt-24" aria-label="Contribute">
            <Reveal>
              <div className="ny-card overflow-hidden">
                <div className="grid grid-cols-[minmax(0,1fr)] gap-0 md:grid-cols-[1.15fr_1fr]">
                  <div className="p-5 sm:p-6">
                    <p className="ny-hud">S3 · Multi-step wizard</p>
                    <h2 className="ny-display mt-1.5 text-[1.35rem] leading-tight">Give in five taps — cause, amount, rail, message, review.</h2>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      The wizard prefills your phone from your profile, shows the fee and settle time before you commit,
                      and issues receipt <span className="ny-num font-semibold text-text-primary">NY-CON-2025-…</span>{" "}
                      the moment the local ledger posts.
                    </p>
                    <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-1.5 text-sm sm:grid-cols-2">
                      {["Cause picker with live %", "Amount chips + custom", "4 rails with SIMULATED badges", "Quick messages (Swahili)", "Fee & ETA before confirm", "Receipt + ledger ref"].map((f) => (
                        <li key={f} className="flex items-center gap-2 text-text-secondary">
                          <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-success" /> {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" className="ny-btn ny-btn-accent" onClick={() => openContribute()}>
                        Open the wizard <ArrowRight className="h-4 w-4" />
                      </button>
                      <button type="button" className="ny-btn ny-btn-outline" onClick={() => setExportOpen(true)}>
                        <Download className="h-4 w-4" /> Export table
                      </button>
                    </div>
                  </div>
                  <div className="relative min-h-[220px] border-t border-border-subtle md:border-l md:border-t-0">
                    <img src="/images/frame-elder.jpg" alt="An elder's hands on the family giving ledger" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,14,11,0.85)] via-[rgba(10,14,11,0.25)] to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="ny-hud !text-[rgba(250,246,238,0.75)]">Mzee Victor&apos;s giving book</p>
                      <p className="mt-1 text-sm leading-snug text-[#faf6ee]">
                        The ledger this page recreates — handwritten since 1961, now double-entry and reconcilable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </section>

          {/* ================= S4 CONTRIBUTIONS TABLE ================= */}
          <section id="s4" className="mb-7 scroll-mt-24" aria-label="Contributions table">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Every contribution</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Ledger table</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="ny-hud">{filteredRows.length} of {rows.length} rows</span>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => setFiltersOpen(true)}>
                  <Filter className="h-3.5 w-3.5" /> Filters
                  {activeFilters > 0 && <span className="ny-chip ny-chip-brand !px-1.5">{activeFilters}</span>}
                </button>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => setExportOpen(true)}>
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
              </div>
            </div>

            <div className="cc-table-wrap ny-scroll overflow-x-auto">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Contributor</th>
                    <th>Cause</th>
                    <th className="text-right">Amount</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Receipt</th>
                    <th>Ledger</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r) => (
                    <tr
                      key={r.ref}
                      onClick={() => setReceipt(r)}
                      className={flashRef === r.ref ? "ny-flash ny-row-in" : r.ref === rows[0]?.ref ? "ny-row-in" : ""}
                    >
                      <td data-label="Date" className="ny-num whitespace-nowrap text-text-secondary">{r.date}</td>
                      <td data-label="Contributor">
                        <span className="block font-semibold text-text-primary">{r.contributor}</span>
                        <span className="ny-hud !text-[0.55rem]">{r.ref}</span>
                      </td>
                      <td data-label="Cause" className="max-w-[220px] truncate">{causeTitle(r.causeId)}</td>
                      <td data-label="Amount" className="ny-num text-right font-semibold">{kes(r.amount)}</td>
                      <td data-label="Channel">
                        <span className="ny-chip ny-chip-neutral">{channelLabel[r.channel as Channel]}</span>
                      </td>
                      <td data-label="Status">
                        <span className={`ny-chip ${statusTone[r.status as ConStatus]} ${r.status === "pending" ? "ny-pulse" : ""}`}>
                          {r.status}
                        </span>
                      </td>
                      <td data-label="Receipt" className="ny-hud !text-[0.6rem]">{r.receipt}</td>
                      <td data-label="Ledger" className="ny-hud !text-[0.6rem]">{r.ledgerRef}</td>
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="!py-10 text-center">
                        <p className="ny-display text-base">Nothing matches those filters</p>
                        <p className="mt-1 text-sm text-text-secondary">Clear them and the full ledger comes back.</p>
                        <button
                          type="button"
                          className="ny-btn ny-btn-outline ny-btn-sm mt-3"
                          onClick={() => setFilters(emptyFilters)}
                        >
                          Clear filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="ny-hud mt-2">Click any row for its receipt · statuses: initiated → pending → confirmed / failed</p>
          </section>

          {/* ================= S5 + S6 two-up ================= */}
          <div className="mb-7 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
            <section id="s5" className="scroll-mt-24" aria-label="Cause detail drawer">
              <Reveal>
                <div className="ny-card h-full p-5">
                  <p className="ny-hud">S5 · Detail drawer</p>
                  <h2 className="ny-display mt-1.5 text-[1.3rem] leading-tight">Five tabs per cause</h2>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    Overview, Contributors, Payouts, Comms and Audit — the drawer deep-links from any card or table row
                    and closes with the back button.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["Overview", "Contributors", "Payouts", "Comms", "Audit"].map((t) => (
                      <span key={t} className="ny-chip ny-chip-neutral">{t}</span>
                    ))}
                  </div>
                  <div className="mt-4 space-y-1.5">
                    {causes.slice(0, 3).map((c) => (
                      <button key={c.id} type="button" className="gd-section-item w-full text-left" onClick={() => setDrawerCause(c)}>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{c.title}</span>
                          <span className="ny-hud !text-[0.55rem]">{c.ref} · {c.contributors} contributors</span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-brand-primary" />
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal>
            </section>

            <section id="s6" className="scroll-mt-24" aria-label="Create cause wizard">
              <Reveal delay={70}>
                <div className="ny-card h-full p-5">
                  <p className="ny-hud">S6 · Create cause wizard</p>
                  <h2 className="ny-display mt-1.5 text-[1.3rem] leading-tight">Publish to the family in four steps</h2>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    Details → goal & deadline → scope and payout destination → review. Admin or beneficiary; every
                    publish writes an audit row.
                  </p>
                  <ol className="mt-3 space-y-1.5">
                    {["Details — title, purpose, beneficiary", "Goal — amount + deadline", "Scope & payout — who can give, where it lands", "Publish — review and confirm"].map((s, i) => (
                      <li key={s} className="gd-section-item">
                        <span className="flex items-center gap-2.5">
                          <span className="ny-hud">{i + 1}</span>
                          <span className="font-medium">{s}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                  <button type="button" className="ny-btn ny-btn-accent mt-4 w-full" onClick={() => setCreateOpen(true)}>
                    <Plus className="h-4 w-4" /> Start the wizard
                  </button>
                </div>
              </Reveal>
            </section>
          </div>

          {/* ================= S7 PAYOUTS & RECONCILIATION ================= */}
          <section id="s7" className="mb-7 scroll-mt-24" aria-label="Payouts and reconciliation">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Release & balance</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Payouts & reconciliation</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => setReconcileOpen(true)}>
                  <RefreshCw className="h-3.5 w-3.5" /> Reconcile (SIMULATED)
                </button>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => setLedgerEntry(seedLedger[0])}>
                  <Banknote className="h-3.5 w-3.5" /> View a ledger post
                </button>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
              <Reveal>
                <div className="ny-card h-full p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="ny-hud">Payouts to organizers</p>
                    <span className="ny-chip ny-chip-warn ny-pulse">{payouts.filter((p) => p.status === "ready").length} ready</span>
                  </div>
                  <ul className="space-y-2">
                    {payouts.map((p) => (
                      <li key={p.ref} className={`rounded-xl border border-border-subtle bg-surface-1 px-3.5 py-3 ${flashRef === p.ref ? "ny-flash" : ""}`}>
                        <div className="flex items-center justify-between gap-2">
                          <p className="ny-num ny-display text-lg leading-none">{kes(p.amount)}</p>
                          <span
                            className={`ny-chip ${p.status === "settled" ? "ny-chip-ok" : p.status === "ready" ? "ny-chip-warn" : "ny-chip-danger"}`}
                          >
                            {p.status}
                          </span>
                        </div>
                        <p className="mt-1.5 truncate text-sm text-text-secondary">{p.destination}</p>
                        <p className="ny-hud mt-1">{p.ref} · {p.at}</p>
                        <div className="mt-2.5 flex flex-wrap gap-2">
                          {p.status === "ready" && (
                            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => setPayout(p)}>
                              <ShieldCheck className="h-3.5 w-3.5" /> Release (2FA)
                            </button>
                          )}
                          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => setLedgerEntry(seedLedger.find((l) => l.ref === p.ledgerRef) ?? seedLedger[3])}>
                            Ledger entry
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={70}>
                <div className="ny-card h-full p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="ny-hud">Double-entry ledger</p>
                    <span className="ny-chip ny-chip-ok">balanced</span>
                  </div>
                  <ul className="space-y-1.5">
                    {seedLedger.map((l) => (
                      <li key={l.ref}>
                        <button type="button" className="gd-section-item w-full text-left" onClick={() => setLedgerEntry(l)}>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{l.debit} → {l.credit}</span>
                            <span className="ny-hud !text-[0.55rem]">{l.ref} · {l.at} · {l.source}</span>
                          </span>
                          <span className="ny-num shrink-0 text-sm font-semibold">{kes(l.amount)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 rounded-xl border border-dashed border-border-strong bg-surface-2 px-3.5 py-3">
                    <p className="text-xs leading-relaxed text-text-secondary">
                      Reconcile pulls the M-Pesa statement, diffs it against these posts and raises missing / mismatch /
                      duplicate exceptions with one-tap resolve —{" "}
                      <span className="ny-chip ny-chip-sim">SIMULATED</span>
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ================= S8 SHUTTER GALLERY ================= */}
          <section id="s8" className="mb-7 scroll-mt-24" aria-label="Frames behind the causes">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S8 · Camera pinhole</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">The frames behind the causes</h2>
                <p className="mt-1 max-w-[62ch] text-sm text-text-secondary">
                  Step through the family&apos;s photographs the way a camera does — the iris slams to a pinhole, the
                  exposure flashes, and the next frame opens up. Hover for depth, click the strip to switch.
                </p>
              </div>
              <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => setLightbox(true)}>
                Full contact sheet
              </button>
            </div>

            <Reveal>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div>
                  <ShutterStage index={frameIndex} onIndexChange={setFrameIndex} />
                  <div className="mt-3">
                    <FrameStrip index={frameIndex} onIndexChange={setFrameIndex} />
                  </div>
                </div>
                <aside className="ny-card p-4">
                  <p className="ny-hud">Frame notes</p>
                  <ul className="mt-2 space-y-2.5">
                    {[
                      { k: "Transition", v: "iris → pinhole → flash → open" },
                      { k: "Timing", v: "400ms close · 440ms open" },
                      { k: "Depth", v: "CSS 3D perspective 1400px" },
                      { k: "A11y", v: "reduced-motion snaps instantly" },
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

          {/* ================= S9 AUDIT ================= */}
          <section id="s9" className="scroll-mt-24" aria-label="Audit trail">
            <Reveal>
              <div className="ny-card overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
                  <div>
                    <p className="ny-hud">S9 · Append-only</p>
                    <h2 className="ny-display text-[1.3rem]">Audit trail</h2>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => setExportOpen(true)}>
                      <Download className="h-3.5 w-3.5" /> Export
                    </button>
                    <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => setBroadcastCause(causes[1])}>
                      <Megaphone className="h-3.5 w-3.5" /> Broadcast
                    </button>
                  </div>
                </div>
                <ul>
                  {seedAudit.map((a) => (
                    <li key={a.ref}>
                      <button type="button" className="cc-audit-row w-full text-left" onClick={() => setAuditEntry(a)}>
                        <span className={`h-2 w-2 shrink-0 rounded-full mt-1.5 ${a.tone === "gold" ? "bg-brand-accent" : a.tone === "red" ? "bg-danger" : "bg-text-tertiary"}`} />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-text-primary">
                            {a.action} <span className="font-normal text-text-secondary">· {a.entity}</span>
                          </span>
                          <span className="block text-sm text-text-secondary">{a.detail}</span>
                          <span className="ny-hud mt-1 block !text-[0.55rem]">{a.at} · {a.actor}</span>
                        </span>
                        <span className="ny-hud !text-[0.55rem]">{a.ref}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </section>

          {/* ================= FOOTER STRIP ================= */}
          <Reveal>
            <footer className="mt-7 rounded-xl border border-dashed border-border-strong bg-surface-2 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CircleDollarSign className="h-4 w-4 text-brand-primary" />
                  <p className="text-sm text-text-secondary">
                    <strong className="text-text-primary">Frontend-only Phase 1.</strong> Every rail below renders fully
                    and resolves honest.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["M-Pesa", "Airtel", "Bank EFT", "SMS", "WhatsApp", "Drive"].map((r) => (
                    <span key={r} className="ny-chip ny-chip-sim">{r}</span>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-border-subtle pt-3">
                <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => setMatrixOpen(true)}>
                  <ShieldCheck className="h-3.5 w-3.5" /> Capability matrix
                </button>
                <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => setReconcileOpen(true)}>
                  <RefreshCw className="h-3.5 w-3.5" /> Reconciliation
                </button>
                <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => setContributor(topContributors[0])}>
                  <Users className="h-3.5 w-3.5" /> Top contributor
                </button>
                <Receipt className="hidden h-3.5 w-3.5 self-center text-text-tertiary sm:block" />
              </div>
            </footer>
          </Reveal>
        </div>
      </div>

      {/* ================= OVERLAYS ================= */}
      <ContributeWizard open={contributeOpen} onClose={() => setContributeOpen(false)} preselect={preselect} onDone={handleDone} />
      <CreateCauseWizard open={createOpen} onClose={() => setCreateOpen(false)} onPublish={handlePublish} />

      <CauseDrawer
        cause={drawerCause}
        open={!!drawerCause}
        onClose={() => setDrawerCause(null)}
        contributions={rows}
        payouts={payouts}
        onContribute={(id) => {
          setDrawerCause(null);
          openContribute(id);
        }}
        onBroadcast={(c) => {
          setDrawerCause(null);
          setBroadcastCause(c);
        }}
        onRelease={(p) => {
          setDrawerCause(null);
          setPayout(p);
        }}
        onDelete={(c) => {
          setDrawerCause(null);
          setDeleteCause(c);
        }}
        onAudit={(a) => setAuditEntry(a)}
      />

      <ReceiptModal data={receipt} causeTitle={receipt ? causeTitle(receipt.causeId) : ""} onClose={() => setReceipt(null)} />
      <PayoutReleaseModal payout={payout} causeTitle={payout ? causeTitle(payout.causeId) : ""} onClose={() => setPayout(null)} onRelease={handleRelease} />
      <ReconcileModal
        open={reconcileOpen}
        onClose={() => setReconcileOpen(false)}
        onResolve={(label) => {
          setReconcileOpen(false);
          toast({ tone: "info", title: "Exception resolved (SIMULATED)", body: `${label} · audit row written` });
        }}
      />
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={(f) => {
          setExportOpen(false);
          toast({ tone: "ok", title: `${f} export queued`, body: "Local stub — HMAC-signed file arrives with Phase 2." });
        }}
      />
      <ChannelMatrixModal open={matrixOpen} onClose={() => setMatrixOpen(false)} />
      <BroadcastModal
        cause={broadcastCause}
        onClose={() => setBroadcastCause(null)}
        onSent={(summary) => toast({ tone: "info", title: "Broadcast sent (SIMULATED)", body: summary })}
      />
      <ContributorModal person={contributor} onClose={() => setContributor(null)} />
      <AuditDetailModal entry={auditEntry} onClose={() => setAuditEntry(null)} />
      <LedgerModal entry={ledgerEntry} onClose={() => setLedgerEntry(null)} />
      <DeleteCauseModal
        cause={deleteCause}
        onClose={() => setDeleteCause(null)}
        onConfirm={(reason) => {
          setCauses((prev) => prev.filter((c) => c.id !== deleteCause?.id));
          toast({ tone: "warn", title: "Cause archived", body: `Reason logged: “${reason}” · ledger kept` });
        }}
      />
      <FiltersDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} value={filters} onChange={setFilters} />

      <ShutterLightbox open={lightbox} onClose={() => setLightbox(false)} index={frameIndex} onIndexChange={setFrameIndex} />
    </div>
  );
}
