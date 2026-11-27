"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ArrowRight, BadgeCheck, Check, Download, FileText, Filter, HeartHandshake, Megaphone, Plus, RefreshCw, Send, ShieldCheck, Sparkles, Upload, Users } from "lucide-react";
import {
  AS_OF,
  activeBeneficiaries,
  applications as seedApplications,
  audit as seedAudit,
  donorCount,
  frames,
  donors as seedDonors,
  fmtDate,
  fundedThisYear,
  grantPct,
  governance,
  grants as seedGrants,
  ledger as seedLedger,
  monthsLeft,
  pendingApplications,
  pillarImage,
  pillarLabel,
  pillarStats,
  pillarTone,
  reconciliation,
  totalCommitted,
  totalDisbursed,
  appStatusMeta,
  type AppStatus,
  type Application,
  type AuditEntry,
  type Channel,
  type Grant,
  type LedgerEntry,
  type Pillar,
} from "@/data/dashboard/foundation";
import { CountUp, Reveal, Tabs } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlay";
import { fmt, kes, kesShort } from "@/lib/format";
import { useOverlay } from "@/components/foundation/use-overlay";
import { BigRing, DisbursementTimeline, GrantCard, PillarMeter, Spark, channelMeta } from "@/components/foundation/charts";
import { ApplyWizard, CommsModal, DecisionModal, DisburseWizard, DocumentsModal, DonorModal, ExportModal, AuditDetailModal, GovernanceModal, LedgerModal, ReconcileModal, emptyAppFilters, FiltersDrawer, ReviewDrawer, type AppFilters } from "@/components/foundation/modals";
import { GrantDrawer } from "@/components/foundation/drawers";
import { FrameStrip, ShutterLightbox, ShutterStage } from "@/components/contributions/shutter-gallery";

const sections = [
  { id: "s1", label: "S1 · KPIs" },
  { id: "s2", label: "S2 · Pillars" },
  { id: "s3", label: "S3 · Grants" },
  { id: "s4", label: "S4 · Grant drawer" },
  { id: "s5", label: "S5 · Intake" },
  { id: "s6", label: "S6 · Disbursement" },
  { id: "s7", label: "S7 · Governance" },
  { id: "s8", label: "S8 · Stories" },
];

const kpiAccent: Record<string, string> = {
  purple: "#6a4c93",
  gold: "#d4a437",
  ok: "#2e7d32",
  warn: "#e0a82e",
};

type QueueTab = "all" | "review" | "approved" | "paid";

export default function FoundationPage() {
  return <FoundationView />;
}

function FoundationView() {
  const toast = useToast();
  const ov = useOverlay();

  /* ---------- live state (local mock, nothing leaves the browser) ---------- */
  const [grants, setGrants] = useState<Grant[]>(seedGrants);
  const [apps, setApps] = useState<Application[]>(seedApplications);
  const [audit, setAudit] = useState<AuditEntry[]>(seedAudit);
  const [ledgerRows, setLedgerRows] = useState<LedgerEntry[]>(seedLedger);
  const [grantPillar, setGrantPillar] = useState<Pillar | "all">("all");
  const [queueTab, setQueueTab] = useState<QueueTab>("all");
  const [filters, setFilters] = useState<AppFilters>(emptyAppFilters);
  const [session, setSession] = useState(0);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [decision, setDecision] = useState<{ title: string; body: string; tone: "ok" | "warn" } | null>(null);

  /* ---------- derived ---------- */
  const stats = useMemo(() => pillarStats(grants), [grants]);
  const released = totalDisbursed(grants);
  const committed = totalCommitted(grants);
  const openGrants = grants.filter((g) => g.status !== "declined");
  const visibleGrants = grantPillar === "all" ? openGrants : openGrants.filter((g) => g.pillar === grantPillar);

  const queue = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return apps.filter((a) => {
      if (queueTab === "review" && !(a.status === "submitted" || a.status === "under-review")) return false;
      if (queueTab === "approved" && !(a.status === "approved" || a.status === "declined")) return false;
      if (queueTab === "paid" && a.status !== "paid") return false;
      if (filters.status !== "all" && a.status !== filters.status) return false;
      if (filters.pillar !== "all" && a.pillar !== filters.pillar) return false;
      if (q && !`${a.applicant} ${a.ref} ${a.purpose}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [apps, queueTab, filters]);

  const activeFilters = (filters.q ? 1 : 0) + (filters.status !== "all" ? 1 : 0) + (filters.pillar !== "all" ? 1 : 0);
  const targetGrant = ov.id ? grants.find((g) => g.id === ov.id) ?? null : null;
  const targetApp = ov.id ? apps.find((a) => a.id === ov.id) ?? null : null;
  const nextAppRef = `NY-APP-2025-${String(59 + apps.length - seedApplications.length).padStart(5, "0")}`;

  const openDlg = (kind: string, id?: string, t?: string) => {
    setSession((s) => s + 1);
    ov.open(kind as never, id ? { id, t } : undefined);
  };

  const log = (action: string, entity: string, detail: string, tone: AuditEntry["tone"] = "plain") =>
    setAudit((prev) => [
      { ref: `NY-AUD-${String(1092 + prev.length).padStart(5, "0")}`, at: "18 Nov · 10:14", actor: "Peter Wanyama Nalyanya", action, entity, detail, tone },
      ...prev,
    ]);

  const flash = (id: string) => {
    setFlashId(id);
    window.setTimeout(() => setFlashId(null), 1000);
  };

  /* ---------- actions ---------- */
  const submitApplication = (a: Application) => {
    setApps((prev) => [a, ...prev]);
    log("application.submit", a.ref, `${kes(a.amount)} · ${pillarLabel[a.pillar]} · ${a.documents.length} documents attached`, "gold");
    toast({ tone: "ok", title: "Application submitted", body: `${a.ref} · now in the council's queue` });
  };

  const decide = (decision: "approve" | "decline", reason: string) => {
    if (!targetApp) return;
    setApps((prev) =>
      prev.map((x) => (x.id === targetApp.id ? { ...x, status: decision === "approve" ? "approved" : "declined", reviewer: "Peter Wanyama Nalyanya" } : x)),
    );
    log(
      decision === "approve" ? "application.approve" : "application.decline",
      targetApp.ref,
      decision === "approve" ? `${kes(targetApp.amount)} approved · release via the disburse wizard` : `Reason: ${reason}`,
      decision === "approve" ? "gold" : "red",
    );
    ov.close();
    setDecision({
      title: decision === "approve" ? "Application approved" : "Application declined",
      body:
        decision === "approve"
          ? `${targetApp.ref} · ${kes(targetApp.amount)} is ready to release through the disburse wizard.`
          : `${targetApp.ref} · your reason was recorded and sent to the applicant.`,
      tone: decision === "approve" ? "ok" : "warn",
    });
    toast({
      tone: decision === "approve" ? "ok" : "warn",
      title: decision === "approve" ? "Application approved" : "Application declined",
      body: decision === "approve" ? `${targetApp.ref} · ${kes(targetApp.amount)} ready to release` : "Reason recorded and sent to the applicant",
    });
  };

  const release = (amount: number, channel: Channel) => {
    if (!targetGrant) return;
    const id = targetGrant.id;
    const nextDisbursed = Math.min(targetGrant.amount, targetGrant.disbursed + amount);
    setGrants((prev) =>
      prev.map((g) =>
        g.id === id
          ? {
              ...g,
              disbursed: nextDisbursed,
              status: nextDisbursed >= g.amount ? "completed" : "active",
              schedule: g.schedule.map((s) => (s.paid ? s : { ...s, paid: true })),
            }
          : g,
      ),
    );
    const ref = `NY-LED-00046${String(ledgerRows.length + 10)}`;
    setLedgerRows((prev) => [
      { ref, at: "18 Nov · 10:16", debit: "Foundation pool", credit: targetGrant.destination, amount, source: targetGrant.ref },
      ...prev,
    ]);
    log("grant.disburse", targetGrant.ref, `${kes(amount)} → ${channelMeta[channel].label} · ${targetGrant.destination} · SIMULATED`, "gold");
    flash(id);
    ov.close();
    toast({ tone: "ok", title: `${kes(amount)} released (SIMULATED)`, body: `${targetGrant.ref} · ledger ${ref} posted` });
  };

  const queueDecision = (decision: "approve" | "decline", reason: string) => decide(decision, reason);

  return (
    <div className="page-dash-foundation mx-auto max-w-[1500px]">
      {/* ================= HERO ================= */}
      <Reveal>
        <header className="fd-hero mb-6">
          <img src="/images/frame-reunion.jpg" alt="Five generations of the Nalyanya family on the homestead steps" className="fd-hero__img" fetchPriority="high" />
          <div className="fd-hero__shade" />
          <div className="fd-hero__body grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
            <div className="min-w-0">
              <span className="gd-code">T-11 · Nalyanya Foundation</span>
              <h1 className="ny-display mt-3 max-w-[20ch] text-[clamp(1.9rem,4.6vw,3.3rem)] leading-[1.02] text-on-brand">
                Nobody here pays alone.
              </h1>
              <p className="mt-2.5 max-w-[60ch] text-sm leading-relaxed text-on-brand/85 sm:text-base">
                School fees, medicine, storm damage and the quiet emergencies — funded by the family, released on a schedule
                the whole family can read, with every shilling on the ledger.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-accent" onClick={() => openDlg("apply")}>
                  <Plus className="h-4 w-4" /> Apply for help
                </button>
                <button type="button" className="ny-btn ny-btn-outline !border-on-brand/50 !text-on-brand hover:!bg-on-brand/10" onClick={() => openDlg("donors")}>
                  <HeartHandshake className="h-4 w-4" /> Who gives
                </button>
                <button type="button" className="ny-btn ny-btn-ghost !text-on-brand/90 hover:!bg-on-brand/10" onClick={() => openDlg("governance")}>
                  <ShieldCheck className="h-4 w-4" /> Governance
                </button>
              </div>
            </div>

            <div className="fd-glass p-4">
              <p className="ny-hud !text-on-brand/70">Released to date</p>
              <p className="ny-display mt-1 text-[clamp(1.6rem,3vw,2.2rem)] leading-none">
                <CountUp value={released} prefix="KES " />
              </p>
              <p className="mt-1.5 text-xs text-on-brand/75">
                of {kes(committed)} committed · {grants.length} grants
              </p>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-on-brand/20 pt-3">
                <span className="ny-hud !text-on-brand/75">Council waiting on</span>
                <span className="ny-chip ny-chip-warn ny-pulse">{pendingApplications(apps)} applications</span>
              </div>
            </div>
          </div>
        </header>
      </Reveal>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[210px_minmax(0,1fr)]">
        <nav className="cc-rail" aria-label="Section index">
          <p className="ny-hud px-2 pb-1">Sections</p>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.label}
            </a>
          ))}
          <span className="ny-hud mt-2 border-t border-border-subtle px-2 pt-2 !text-[0.56rem]">8 sections · 15 overlays</span>
        </nav>

        <div className="min-w-0">
          {/* ================= S1 KPIs ================= */}
          <section id="s1" className="mb-8 scroll-mt-24" aria-label="Foundation KPIs">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-5">
              {[
                { label: "Total disbursed", accent: kpiAccent.purple, hint: `${grants.length} grants since 2021`, value: <CountUp value={released} prefix="KES " /> },
                { label: "Active beneficiaries", accent: kpiAccent.ok, hint: "grants releasing now", value: <CountUp value={activeBeneficiaries(grants)} /> },
                { label: "Applications pending", accent: kpiAccent.warn, hint: "waiting on the council", value: <CountUp value={pendingApplications(apps)} /> },
                { label: "Funded this year", accent: kpiAccent.gold, hint: "2025 releases", value: <CountUp value={fundedThisYear(grants)} prefix="KES " /> },
                { label: "Donors", accent: kpiAccent.purple, hint: "branches, circles and individuals", value: <CountUp value={donorCount(seedDonors)} /> },
              ].map((k, i) => (
                <Reveal key={k.label} delay={i * 60}>
                  <div className="fd-kpi" style={{ ["--kpi-accent" as string]: k.accent } as CSSProperties}>
                    <p className="ny-hud">{k.label}</p>
                    <p className="fd-kpi__value mt-1.5">{k.value}</p>
                    <p className="mt-1.5 text-xs text-text-tertiary">{k.hint}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ================= S2 PILLARS ================= */}
          <section id="s2" className="mb-8 scroll-mt-24" aria-label="The three pillars">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Where it goes</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Three pillars</h2>
              </div>
              <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => openDlg("export", undefined, "Foundation totals")}>
                <Download className="h-3.5 w-3.5" /> Export totals
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {(["education", "medical", "emergency"] as Pillar[]).map((p, i) => {
                const s = stats[p];
                return (
                  <Reveal key={p} delay={i * 70} className="h-full">
                    <article className="fd-pillar">
                      <div className="fd-pillar__media">
                        <img src={pillarImage[p]} alt="" className="fd-pillar__img" loading="lazy" decoding="async" />
                        <div className="fd-pillar__shade" />
                        <span className="fd-pillar__sheen" aria-hidden />
                        <span className={`ny-chip ${pillarTone[p]} absolute bottom-3 left-3`}>{pillarLabel[p]}</span>
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="ny-hud">Released</p>
                            <p className="ny-num ny-display text-xl leading-none">{kes(s.disbursed)}</p>
                          </div>
                          <Spark values={[Math.round(s.disbursed * 0.4), Math.round(s.disbursed * 0.6), Math.round(s.disbursed * 0.8), s.disbursed]} />
                        </div>
                        <PillarMeter released={s.disbursed} committed={s.committed} gold={p === "medical"} />
                        <div className="mt-auto grid grid-cols-2 gap-2">
                          <div className="rounded-lg bg-surface-2 px-2.5 py-2">
                            <p className="ny-hud !text-[0.5rem]">Grants</p>
                            <p className="ny-num mt-0.5 font-semibold">{s.count}</p>
                          </div>
                          <div className="rounded-lg bg-surface-2 px-2.5 py-2">
                            <p className="ny-hud !text-[0.5rem]">Active now</p>
                            <p className="ny-num mt-0.5 font-semibold">{s.active}</p>
                          </div>
                        </div>
                        <button type="button" className="ny-btn ny-btn-outline ny-btn-sm w-full" onClick={() => setGrantPillar(p)}>
                          See these grants <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </section>

          {/* ================= S3 GRANTS ================= */}
          <section id="s3" className="mb-8 scroll-mt-24" aria-label="Active grants">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Money on the move</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Grants in flight</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => setGrantPillar("all")}>
                  All pillars
                </button>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => openDlg("apply")}>
                  <Plus className="h-3.5 w-3.5" /> New application
                </button>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-1.5">
              {(["all", "education", "medical", "emergency"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setGrantPillar(p)}
                  className={`ny-chip ny-touch transition ${grantPillar === p ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"}`}
                >
                  {p === "all" ? "All pillars" : pillarLabel[p]}
                </button>
              ))}
            </div>

            {visibleGrants.length === 0 ? (
              <div className="ny-inset px-6 py-12 text-center">
                <p className="ny-display text-lg">No grants in this pillar</p>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-text-secondary">Every committed shilling here is already released or still under review.</p>
                <button type="button" className="ny-btn ny-btn-accent ny-btn-sm mt-4" onClick={() => setGrantPillar("all")}>
                  Show every grant
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleGrants.map((g, i) => (
                  <Reveal key={g.id} delay={i * 55} className="h-full">
                    <GrantCard grant={g} flash={flashId === g.id} onOpen={() => openDlg("grant", g.id, "overview")} />
                  </Reveal>
                ))}
              </div>
            )}
          </section>

          {/* ================= S4 DRAWER EXPLAINER ================= */}
          <section id="s4" className="mb-8 scroll-mt-24" aria-label="Grant detail drawer">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S4 · Grant detail</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Five tabs per grant</h2>
                <p className="mt-1 max-w-[64ch] text-sm text-text-secondary">
                  Overview, disbursements, documents, comms and audit. The drawer is deep-linked, so a reload restores it and
                  the back button closes it.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <Reveal className="lg:col-span-7">
                <div className="ny-card h-full p-5">
                  <div className="flex flex-wrap gap-1.5">
                    {["Overview", "Disbursements", "Documents", "Comms", "Audit"].map((t) => (
                      <span key={t} className="ny-chip ny-chip-neutral">{t}</span>
                    ))}
                  </div>
                  <ul className="mt-4 space-y-1.5">
                    {openGrants.slice(0, 3).map((g) => (
                      <li key={g.id}>
                        <button type="button" className="gd-section-item w-full text-left" onClick={() => openDlg("grant", g.id, "overview")}>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{g.title}</span>
                            <span className="ny-hud block !text-[0.55rem]">
                              {g.ref} · {kes(g.disbursed)} of {kes(g.amount)}
                            </span>
                          </span>
                          <span className="ny-num shrink-0 text-sm font-semibold">{grantPct(g)}%</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal className="lg:col-span-5" delay={70}>
                <div className="ny-card h-full p-5">
                  <p className="ny-hud">Committed vs released</p>
                  <div className="mt-3">
                    <BigRing released={released} committed={committed} label="Foundation pool" />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                    Funds sit in the foundation pool until the council releases them against a schedule — never all at once,
                    always with a document behind it.
                  </p>
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-4 w-full" onClick={() => openDlg("grant", openGrants[0]?.id ?? "", "disbursements")}>
                    Open a disbursement schedule <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ================= S5 INTAKE ================= */}
          <section id="s5" className="mb-8 scroll-mt-24" aria-label="Application intake">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S5 · Intake</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Applications from the family</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="ny-hud">{queue.length} of {apps.length}</span>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => openDlg("filters")}>
                  <Filter className="h-3.5 w-3.5" /> Filters
                  {activeFilters > 0 && <span className="ny-chip ny-chip-brand !px-1.5">{activeFilters}</span>}
                </button>
                <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => openDlg("apply")}>
                  <Plus className="h-3.5 w-3.5" /> Apply
                </button>
              </div>
            </div>

            <Tabs
              tabs={[
                { id: "all", label: "All" },
                { id: "review", label: `Needs review (${apps.filter((a) => a.status === "submitted" || a.status === "under-review").length})` },
                { id: "approved", label: "Decided" },
                { id: "paid", label: "Paid" },
              ]}
              active={queueTab}
              onChange={(id) => setQueueTab(id as QueueTab)}
            />

            <div className="cc-table-wrap ny-scroll mt-3 overflow-x-auto">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Applicant</th>
                    <th>Pillar</th>
                    <th className="text-right">Amount</th>
                    <th>Purpose</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((a) => (
                    <tr key={a.id} onClick={() => openDlg("review", a.id)}>
                      <td data-label="Ref" className="ny-hud !text-[0.6rem]">{a.ref}</td>
                      <td data-label="Applicant">
                        <span className="block font-semibold">{a.applicant}</span>
                        <span className="ny-hud !text-[0.55rem]">{a.documents.length} docs</span>
                      </td>
                      <td data-label="Pillar">
                        <span className={`ny-chip ${pillarTone[a.pillar]}`}>{pillarLabel[a.pillar]}</span>
                      </td>
                      <td data-label="Amount" className="ny-num text-right font-semibold">{kes(a.amount)}</td>
                      <td data-label="Purpose" className="max-w-[240px] truncate text-text-secondary">{a.purpose}</td>
                      <td data-label="Submitted" className="ny-num whitespace-nowrap text-text-secondary">{fmtDate(a.submitted)}</td>
                      <td data-label="Status">
                        <span className={`ny-chip ${appStatusMeta[a.status].tone} ${a.status === "submitted" ? "ny-pulse" : ""}`}>{appStatusMeta[a.status].label}</span>
                      </td>
                      <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => openDlg("review", a.id)}>
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                  {queue.length === 0 && (
                    <tr>
                      <td colSpan={8} className="!py-10 text-center">
                        <p className="ny-display text-base">Nothing in this view</p>
                        <p className="mt-1 text-sm text-text-secondary">Try another tab, or start a fresh application.</p>
                        <button type="button" className="ny-btn ny-btn-accent ny-btn-sm mt-3" onClick={() => openDlg("apply")}>
                          <Plus className="h-3.5 w-3.5" /> Apply for help
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="ny-hud mt-2">Click any row to review it · every decision needs a reason and lands in the audit trail</p>
          </section>

          {/* ================= S6 DISBURSEMENT & RECONCILIATION ================= */}
          <section id="s6" className="mb-8 scroll-mt-24" aria-label="Disbursement and reconciliation">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S6 · Release &amp; balance</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Disbursement &amp; reconciliation</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => openDlg("reconcile")}>
                  <RefreshCw className="h-3.5 w-3.5" /> Reconcile (SIMULATED)
                </button>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => openDlg("disburse", openGrants.find((g) => g.disbursed < g.amount)?.id ?? "")}>
                  <BadgeCheck className="h-3.5 w-3.5" /> Release funds
                </button>
              </div>
            </div>

            <Reveal>
              <div className="ny-card mb-4 p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="ny-hud">Releases over time</p>
                    <h3 className="ny-display text-lg">Disbursement timeline</h3>
                  </div>
                  <span className="ny-chip ny-chip-brand">{kes(released)} released</span>
                </div>
                <DisbursementTimeline grants={grants} />
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <Reveal className="lg:col-span-7">
                <div className="ny-card h-full p-4 sm:p-5">
                  <p className="ny-hud">Double-entry ledger</p>
                  <h3 className="ny-display text-lg">Recent posts</h3>
                  <ul className="mt-3 space-y-1.5">
                    {ledgerRows.slice(0, 6).map((l) => (
                      <li key={l.ref}>
                        <button type="button" className="gd-section-item w-full text-left" onClick={() => openDlg("ledger", l.ref)}>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{l.debit} → {l.credit}</span>
                            <span className="ny-hud block !text-[0.55rem]">{l.ref} · {l.at} · {l.source}</span>
                          </span>
                          <span className="ny-num shrink-0 text-sm font-semibold">{kes(l.amount)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="ny-chip ny-chip-sim mt-3">Every release posts debit and credit together — imbalance is impossible</p>
                </div>
              </Reveal>

              <Reveal className="lg:col-span-5" delay={70}>
                <div className="ny-card h-full p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="ny-hud">Statements</p>
                      <h3 className="ny-display text-lg">Reconciliation</h3>
                    </div>
                    <span className="ny-chip ny-chip-danger ny-pulse">
                      {reconciliation.filter((r) => r.match !== "matched").length} exceptions
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {reconciliation.slice(0, 4).map((r, i) => (
                      <li key={`${r.ref}-${i}`} className="ny-inset flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{r.statement}</span>
                          <span className="ny-hud block !text-[0.55rem]">{r.at} · {r.ref}</span>
                        </span>
                        <span className={`ny-chip shrink-0 ${r.match === "matched" ? "ny-chip-ok" : r.match === "missing" ? "ny-chip-danger" : "ny-chip-warn"}`}>{r.match}</span>
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="ny-btn ny-btn-primary ny-btn-sm mt-3 w-full" onClick={() => openDlg("reconcile")}>
                    Open the full reconciliation
                  </button>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ================= S7 GOVERNANCE ================= */}
          <section id="s7" className="mb-8 scroll-mt-24" aria-label="Governance and transparency">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S7 · Transparency</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Governance &amp; transparency</h2>
              </div>
              <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => openDlg("governance")}>
                <ShieldCheck className="h-3.5 w-3.5" /> Open governance panel
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <Reveal className="lg:col-span-4">
                <div className="ny-card h-full p-4 sm:p-5">
                  <p className="ny-hud">Officers</p>
                  <ul className="mt-2 space-y-2 text-sm">
                    {[
                      ["Chair", governance.chair],
                      ["Treasurer", governance.treasurer],
                      ["Secretary", governance.secretary],
                    ].map(([k, v]) => (
                      <li key={k} className="ny-inset px-3 py-2.5">
                        <span className="ny-hud block !text-[0.55rem]">{k}</span>
                        <span className="mt-0.5 block font-semibold">{v}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="ny-hud mt-4">Council of elders</p>
                  <ul className="mt-2 space-y-1.5">
                    {governance.elders.map((e) => (
                      <li key={e.name} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate">{e.name}</span>
                        <span className="ny-hud shrink-0 !text-[0.55rem]">{e.since}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal className="lg:col-span-4" delay={70}>
                <div className="ny-card h-full p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="ny-hud">Donors</p>
                    <span className="ny-chip ny-chip-brand">{seedDonors.length}</span>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {seedDonors.slice(0, 4).map((d) => (
                      <li key={d.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate">{d.anonymous ? "Anonymous family member" : d.name}</span>
                        <span className="ny-num shrink-0 font-semibold">{kesShort(d.total)}</span>
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-4 w-full" onClick={() => openDlg("donors")}>
                    <Users className="h-3.5 w-3.5" /> All donors
                  </button>
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3">
                    <div>
                      <p className="text-sm font-semibold">Public totals on H-4</p>
                      <p className="ny-hud mt-0.5 !text-[0.55rem]">Names never shown</p>
                    </div>
                    <span className={`ny-chip ${governance.publicSync ? "ny-chip-ok" : "ny-chip-neutral"}`}>{governance.publicSync ? "on" : "off"}</span>
                  </div>
                </div>
              </Reveal>

              <Reveal className="lg:col-span-4" delay={120}>
                <div className="ny-card h-full p-4 sm:p-5">
                  <p className="ny-hud">Annual reports</p>
                  <ul className="mt-3 space-y-1.5">
                    {governance.reports.map((r) => (
                      <li key={r.year}>
                        <button type="button" className="gd-section-item w-full text-left" onClick={() => openDlg("export", undefined, `Annual report ${r.year}`)}>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold">{r.year} report</span>
                            <span className="ny-hud block !text-[0.55rem]">{r.pages} pages · {kes(r.disbursed)} disbursed</span>
                          </span>
                          <FileText className="h-4 w-4 shrink-0 text-text-tertiary" />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="ny-inset mt-4 px-3.5 py-3">
                    <p className="ny-hud">Sync</p>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      The public foundation page (H-4) reads these same totals — one source, no drift.
                    </p>
                  </div>
                  <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm mt-3 w-full" onClick={() => openDlg("governance")}>
                    Report stubs &amp; sync settings
                  </button>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ================= S8 STORIES (camera pinhole) ================= */}
          <section id="s8" className="mb-8 scroll-mt-24" aria-label="Stories behind the grants">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S8 · Camera pinhole</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Where the money actually went</h2>
                <p className="mt-1 max-w-[64ch] text-sm text-text-secondary">
                  Step through the photographs the way a camera does — the iris slams to a pinhole, the exposure flashes, and
                  the next frame opens up.
                </p>
              </div>
              <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => setLightbox(true)}>
                Full contact sheet
              </button>
            </div>

            <Reveal>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="min-w-0">
                  <ShutterStage index={frameIndex} onIndexChange={setFrameIndex} frames={frames} />
                  <div className="mt-3">
                    <FrameStrip index={frameIndex} onIndexChange={setFrameIndex} frames={frames} />
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
                  <p className="ny-hud mt-3">Drive connector SIMULATED · Phase 2 pulls the real albums</p>
                </aside>
              </div>
            </Reveal>
          </section>

          {/* ================= FOOTER ================= */}
          <Reveal>
            <footer className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Frontend-only Phase 1.</strong> Every rail below renders fully and resolves honestly.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["School paybills", "Hospital EFT", "M-Pesa B2C", "WhatsApp notices", "Drive uploads", "PDF reports"].map((r) => (
                    <span key={r} className="ny-chip ny-chip-sim">{r}</span>
                  ))}
                </div>
              </div>
            </footer>
          </Reveal>
        </div>
      </div>

      {/* ================= URL-DRIVEN OVERLAYS ================= */}
      {ov.key === "apply" && (
        <ApplyWizard
          key={`apply-${ov.nonce ?? "0"}`}
          onClose={ov.close}
          nextRef={nextAppRef}
          onSubmit={(a) => {
            ov.close();
            submitApplication(a);
          }}
        />
      )}

      <GrantDrawer
        key={`grant-${ov.id ?? "none"}-${ov.nonce ?? "0"}`}
        open={ov.key === "grant" && !!targetGrant}
        onClose={ov.close}
        grant={targetGrant}
        initialTab={ov.t ?? "overview"}
        ledger={ledgerRows}
        audit={audit}
        onDisburse={(g) => openDlg("disburse", g.id)}
        onDocuments={(g) => openDlg("docs", g.id)}
        onComms={(g) => openDlg("comms", g.id)}
        onLedger={(e) => openDlg("ledger", e.ref)}
        onAudit={(e) => openDlg("audit", e.ref)}
        onExport={(g) => openDlg("export", g.id, `Statement ${g.ref}`)}
      />

      <ReviewDrawer
        key={`review-${ov.id ?? "none"}-${ov.nonce ?? "0"}`}
        app={ov.key === "review" ? targetApp : null}
        onClose={ov.close}
        onDecide={queueDecision}
      />

      <FiltersDrawer open={ov.key === "filters"} onClose={ov.close} value={filters} onChange={setFilters} />

      {/* ================= LOCAL MODALS ================= */}
      <DisburseWizard
        key={`dis-${ov.nonce ?? "0"}`}
        grant={ov.key === "disburse" ? targetGrant : null}
        onClose={ov.close}
        onRelease={release}
      />

      <DocumentsModal
        key={`doc-${ov.nonce ?? "0"}`}
        grant={ov.key === "docs" ? targetGrant : null}
        onClose={ov.close}
        onUpload={(name) => {
          setDecision({
            title: "Attachment added (SIMULATED)",
            body: `${name} is now filed with this grant. Real uploads go to Google Drive in Phase 2.`,
            tone: "ok",
          });
        }}
      />

      <CommsModal
        key={`com-${ov.nonce ?? "0"}`}
        grant={ov.key === "comms" ? targetGrant : null}
        onClose={ov.close}
        onSent={(summary) => toast({ tone: "info", title: "Message sent (SIMULATED)", body: summary })}
      />

      {ov.key === "reconcile" && (
        <ReconcileModal
          key={`rec-${ov.nonce ?? "0"}`}
          lines={reconciliation}
          onClose={ov.close}
          onResolve={(label) => {
            ov.close();
            toast({ tone: "info", title: "Exception resolved (SIMULATED)", body: `${label} · audit row written` });
          }}
        />
      )}

      {ov.key === "export" && (
        <ExportModal
          key={`exp-${ov.nonce ?? "0"}`}
          scope={ov.t ?? "Foundation totals"}
          onClose={ov.close}
          onQueue={(f) => {
            ov.close();
            toast({ tone: "ok", title: `${f} export queued`, body: `${ov.t ?? "Foundation totals"} · signed file in Phase 2` });
          }}
        />
      )}

      {ov.key === "donors" && (
        <DonorModal donors={seedDonors} onClose={ov.close} onExport={() => openDlg("export", undefined, "Donor list")} />
      )}

      {ov.key === "governance" && (
        <GovernanceModal
          key={`gov-${ov.nonce ?? "0"}`}
          data={governance}
          onClose={ov.close}
          onReport={(year) => openDlg("export", undefined, `Annual report ${year}`)}
        />
      )}

      <AuditDetailModal entry={audit.find((a) => a.ref === ov.id) ?? null} onClose={ov.close} />
      <LedgerModal entry={ledgerRows.find((l) => l.ref === ov.id) ?? null} onClose={ov.close} />

      <DecisionModal data={decision} onClose={() => setDecision(null)} />

      <ShutterLightbox open={lightbox} onClose={() => setLightbox(false)} index={frameIndex} onIndexChange={setFrameIndex} frames={frames} />
    </div>
  );
}
