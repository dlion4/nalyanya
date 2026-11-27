"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ArrowRight, Check, Download, Filter, Landmark, Plus, RotateCcw, Scale, Settings2, ShieldCheck, Sparkles, Trash2, Wallet, X, FileText } from "lucide-react";
import {
  AS_OF,
  ME_ID,
  activeCountOf,
  activeStatuses,
  auditSeed,
  ceilingFor,
  closedStatuses,
  fmtDate,
  members,
  memberOf,
  nameOf,
  obligationsOf,
  pendingStatuses,
  policy,
  productOf,
  products,
  schedule,
  seedLoans,
  seedRepayments,
  statusMeta,
  totalOf,
  unitValue,
  viewOf,
  type AuditEntry,
  type Channel,
  type Loan,
  type LoanView,
  type Policy,
  type ProductId,
  type Repayment,
  type Status,
} from "@/data/dashboard/loans";
import { CountUp, Reveal, Tabs } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlay";
import { fmt, kes, kesShort } from "@/lib/format";
import { useOverlay } from "@/components/loans/use-overlay";
import { Calculator, channelMeta, LoanTicket } from "@/components/loans/charts";
import { ApplyWizard, ApproveWizard, PaymentWizard, RestructureWizard } from "@/components/loans/wizards";
import {
  AuditDetailModal,
  AutoCollectModal,
  BroadcastModal,
  BulkSettleModal,
  CallUpModal,
  CancelApplicationModal,
  ConfirmPolicyModal,
  EligibilityModal,
  ExportModal,
  ProductDetailModal,
  ReceiptModal,
  ScheduleRowModal,
  WhatIfModal,
  WriteOffModal,
  type Receipt,
} from "@/components/loans/modals";
import { FiltersDrawer, LoanDrawer, PolicyDrawer, PortfolioDrawer, emptyLnFilters, type LnFilters } from "@/components/loans/drawers";

type DlgKind =
  | "pay"
  | "restructure"
  | "approve"
  | "cancel"
  | "writeoff"
  | "broadcast"
  | "callup"
  | "export"
  | "bulk"
  | "schedule"
  | "whatif"
  | "elig"
  | "product"
  | "auto"
  | "confirm-policy"
  | "receipt"
  | "audit";

type PolicyDraft = { rules: Policy; enabled: Record<ProductId, boolean>; changes: string[] };
type Dlg = { kind: DlgKind; id?: string; row?: number; paid?: boolean; scope?: string; pending?: PolicyDraft; n: number };
type TabId = "all" | "decide" | "active" | "overdue" | "closed";

const sections = [
  { id: "s1", label: "S1 · Loan KPIs" },
  { id: "s2", label: "S2 · Products" },
  { id: "s3", label: "S3 · Apply & calculate" },
  { id: "s4", label: "S4 · Loans table" },
  { id: "s5", label: "S5 · Open a loan" },
  { id: "s6", label: "S6 · Collections" },
  { id: "s7", label: "S7 · Governance & audit" },
];

const kpiAccent: Record<string, string> = {
  brand: "#1f4d3a",
  gold: "#d4a437",
  ok: "#2e7d32",
  warn: "#e0a82e",
  danger: "#c62828",
};

const tabOk = (s: Status, t: TabId) =>
  t === "all" ||
  (t === "decide" && pendingStatuses.includes(s)) ||
  (t === "active" && activeStatuses.includes(s)) ||
  (t === "overdue" && s === "overdue") ||
  (t === "closed" && closedStatuses.includes(s));

const filterOk = (v: LoanView, f: LnFilters) => {
  if (f.product !== "all" && v.loan.product !== f.product) return false;
  if (f.status !== "all" && v.status !== f.status) return false;
  const q = f.q.trim().toLowerCase();
  if (!q) return true;
  const hay = `${v.loan.ref} ${v.loan.title} ${v.loan.purpose} ${v.loan.borrowers.map((b) => nameOf(b)).join(" ")}`.toLowerCase();
  return hay.includes(q);
};

export default function LoansPage() {
  return <LoansView />;
}

function LoansView() {
  const toast = useToast();
  const ov = useOverlay();

  /* ---------- live state (local mock — nothing leaves the browser) ---------- */
  const [loans, setLoans] = useState<Loan[]>(seedLoans);
  const [reps, setReps] = useState<Repayment[]>(seedRepayments);
  const [audit, setAudit] = useState<AuditEntry[]>(auditSeed);
  const [rules, setRules] = useState<Policy>(policy);
  const [enabled, setEnabled] = useState<Record<ProductId, boolean>>(
    () => Object.fromEntries(products.map((p) => [p.id, true])) as Record<ProductId, boolean>,
  );
  const [auto, setAuto] = useState<{ on: boolean; day: number; channel: Channel }>({ on: true, day: 5, channel: "mpesa" });
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [dlg, setDlg] = useState<Dlg | null>(null);
  const [session, setSession] = useState(0);
  const [tab, setTab] = useState<TabId>("all");
  const [fl, setFl] = useState<LnFilters>(emptyLnFilters);
  const [picked, setPicked] = useState<string[]>([]);
  const [payPick, setPayPick] = useState<string>("");
  const [flash, setFlash] = useState<{ id: string; tone: "posted" | "overdue" } | null>(null);

  /* ---------- derived (every number computed from the terms) ---------- */
  const me = memberOf(ME_ID) ?? members[0];
  const views = useMemo(() => loans.map((l) => viewOf(l, rules)), [loans, rules]);
  const byId = useMemo(() => new Map(views.map((v) => [v.loan.id, v] as const)), [views]);
  const obligations = obligationsOf(ME_ID, loans, rules);
  const activeMine = activeCountOf(ME_ID, loans, rules);
  const saccoCap = ceilingFor(productOf("sacco"), [me], [], rules, obligations);
  const grossShares = me.shares * unitValue * rules.sharesMultiplier;
  const live = views.filter((v) => activeStatuses.includes(v.status));
  const liveMine = live.filter((v) => v.loan.borrowers.includes(ME_ID));
  const myOutstanding = liveMine.reduce((s, v) => s + v.outstanding, 0);
  const liveOwed = live.reduce((s, v) => s + v.outstanding, 0);
  const nextMine = liveMine.reduce<LoanView | null>((best, v) => (v.next && (!best || !best.next || v.next.due < best.next.due) ? v : best), null);
  const overdue = views.filter((v) => v.status === "overdue");
  const overdueSum = overdue.reduce((s, v) => s + v.overdueAmt, 0);
  const dueRows = views.filter((v) => v.due > 0);
  const onTime = dueRows.length
    ? Math.round((100 * dueRows.reduce((s, v) => s + v.k, 0)) / dueRows.reduce((s, v) => s + v.due, 0))
    : 100;
  const payId = payPick && byId.has(payPick) ? payPick : live[0]?.loan.id ?? "";
  const nextNo = Math.max(...loans.map((l) => Number(l.ref.slice(-5)))) + 1;
  const nextRef = `NY-LON-2025-${String(nextNo).padStart(5, "0")}`;
  const visible = views
    .filter((v) => tabOk(v.status, tab) && filterOk(v, fl))
    .sort((a, b) => (a.loan.applied < b.loan.applied ? 1 : -1));
  const activeFilters = (fl.q ? 1 : 0) + (fl.product !== "all" ? 1 : 0) + (fl.status !== "all" ? 1 : 0);
  const visibleProducts = products.filter((p) => enabled[p.id]);
  const pickedViews = picked.map((id) => byId.get(id)).filter((v): v is LoanView => !!v);
  const pickedOwed = pickedViews.reduce((s, v) => s + v.outstanding, 0);

  const is = (k: DlgKind) => dlg?.kind === k;
  const dv = dlg?.id ? byId.get(dlg.id) ?? null : null;
  const drawerView = ov.id ? byId.get(ov.id) ?? null : null;
  const closeDlg = () => setDlg(null);

  /* ---------- helpers ---------- */
  const openDlg = (kind: DlgKind, id?: string, extra?: Partial<Dlg>) => {
    setSession((s) => s + 1);
    setDlg({ kind, id, n: session + 1, ...extra });
  };

  const log = (action: string, entity: string, detail: string, tone: AuditEntry["tone"] = "plain") =>
    setAudit((prev) => [
      { ref: `NY-AUD-${String(1072 + prev.length).padStart(5, "0")}`, at: "18 Nov · 09:58", actor: me.name, action, entity, detail, tone },
      ...prev,
    ]);

  const flashNow = (id: string, tone: "posted" | "overdue") => {
    setFlash({ id, tone });
    window.setTimeout(() => setFlash(null), 900);
  };

  /* ---------- actions ---------- */
  const submitApp = (loan: Loan) => {
    setLoans((prev) => [loan, ...prev]);
    const v = viewOf(loan, rules);
    log("loan.apply", loan.ref, `${kes(loan.amount)} · ${productOf(loan.product).name} · waiting for review`, "gold");
    setReceipt({
      title: "Application received",
      amount: loan.amount,
      ref: loan.ref,
      badge: "Under review",
      badgeTone: "ny-chip-info",
      lines: [
        ["Product", productOf(loan.product).name],
        ["Term", loan.freq === "single" ? "One payday" : `${loan.termMonths} months`],
        ["Each instalment", kes(v.instalment)],
        ["Status", "Under review"],
      ],
    });
    openDlg("receipt");
    toast({ tone: "ok", title: "Application submitted", body: `${loan.ref} · under review · SIMULATED` });
  };

  const pay = (v: LoanView, amt: number, ch: Channel) => {
    const pending = ch === "bank";
    const ref = `NY-RPY-2025-${String(901 + reps.length)}`;
    const ledger = `NY-LED-00047${String(10 + reps.length).padStart(2, "0")}`;
    setReps((prev) => [
      { ref, loanId: v.loan.id, date: AS_OF, amount: amt, channel: ch, status: pending ? "pending" : "confirmed", ledger: pending ? "—" : ledger, no: v.k + 1 },
      ...prev,
    ]);
    if (!pending) setLoans((prev) => prev.map((l) => (l.id === v.loan.id ? { ...l, paid: l.paid + amt } : l)));
    const after = viewOf({ ...v.loan, paid: pending ? v.loan.paid : v.loan.paid + amt }, rules);
    log("repayment.posted", v.loan.ref, `${kes(amt)} via ${channelMeta[ch].label} · ${pending ? "pending reference" : "confirmed"} · SIMULATED`, pending ? "plain" : "gold");
    if (!pending) flashNow(v.loan.id, "posted");
    setReceipt({
      title: pending ? "Payment pending" : "Payment received",
      amount: amt,
      ref,
      badge: pending ? "Pending" : after.status === "settled" ? "Settled in full" : "Confirmed",
      badgeTone: pending ? "ny-chip-warn" : "ny-chip-ok",
      lines: [
        ["Loan", v.loan.ref],
        ["Channel", channelMeta[ch].label],
        ["Left after", kes(after.outstanding)],
        ["Ledger", pending ? "On confirmation" : ledger],
      ],
    });
    openDlg("receipt");
    toast({ tone: pending ? "warn" : "ok", title: pending ? "Bank payment pending" : `${kes(amt)} posted`, body: `${v.loan.ref} · ${pending ? "counts once the reference lands" : "ledger entry written"}` });
  };

  const approve = (id: string, channel: Channel) => {
    const v = byId.get(id);
    if (!v) return;
    setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, stored: null, start: AS_OF, note: "Approved and disbursed on 18 Nov 2025." } : l)));
    const ref = `NY-DSB-2025-${String(v.loan.ref.slice(-5))}`;
    log("loan.disburse", v.loan.ref, `${kes(v.loan.amount)} → ${channelMeta[channel].label} · SIMULATED`, "gold");
    flashNow(id, "posted");
    setReceipt({
      title: "Loan disbursed",
      amount: v.loan.amount,
      ref,
      badge: "Disbursed",
      badgeTone: "ny-chip-ok",
      lines: [
        ["Borrower", nameOf(v.loan.borrowers[0])],
        ["Channel", channelMeta[channel].label],
        ["First instalment", fmtDate(viewOf({ ...v.loan, stored: null, start: AS_OF }, rules).rows[0]?.due ?? AS_OF)],
        ["Status", "Disbursed"],
      ],
    });
    openDlg("receipt");
    toast({ tone: "ok", title: "Disbursed (SIMULATED)", body: `${kes(v.loan.amount)} · ${v.loan.ref} · ledger posted` });
  };

  const decline = (id: string, reason: string) => {
    const v = byId.get(id);
    setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, stored: "declined", note: `Declined: ${reason}` } : l)));
    log("loan.decline", v?.loan.ref ?? id, `Reason: ${reason}`, "red");
    setDlg(null);
    toast({ tone: "warn", title: "Application declined", body: "The borrower sees the reason in the app." });
  };

  const restructure = (id: string, term: number, reason: string) => {
    const v = byId.get(id);
    if (!v) return;
    setLoans((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, amount: v.principalLeft, termMonths: term, start: AS_OF, priorPaid: l.priorPaid + l.paid, paid: 0, restructures: l.restructures + 1, note: `Restructured 18 Nov 2025: ${reason}` }
          : l,
      ),
    );
    log("loan.restructure", v.loan.ref, `${kes(v.principalLeft)} re-scheduled over ${term} months · ${reason}`, "gold");
    setReceipt({
      title: "Restructured",
      amount: v.principalLeft,
      ref: v.loan.ref,
      badge: "Restructured",
      badgeTone: "ny-chip-warn",
      lines: [
        ["New term", `${term} months`],
        ["Instalment now", kes(viewOf({ ...v.loan, amount: v.principalLeft, termMonths: term, start: AS_OF, paid: 0, restructures: 1 }, rules).instalment)],
        ["Reason", reason],
      ],
    });
    openDlg("receipt");
    toast({ tone: "ok", title: "Loan restructured (SIMULATED)", body: `${v.loan.ref} · new schedule from today` });
  };

  const writeOff = (id: string, reason: string) => {
    const v = byId.get(id);
    setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, stored: "written-off", note: `Written off: ${reason}` } : l)));
    log("loan.writeoff", v?.loan.ref ?? id, `${kes(v?.outstanding ?? 0)} closed as a loss · ${reason} · 2FA verified`, "red");
    toast({ tone: "warn", title: "Written off", body: "Recorded with reason and 2FA. History stays in the ledger." });
  };

  const cancel = (id: string) => {
    const v = byId.get(id);
    setLoans((prev) => prev.map((l) => (l.id === id ? { ...l, stored: "declined", note: "Cancelled by the borrower." } : l)));
    log("loan.cancel", v?.loan.ref ?? id, "Application withdrawn by the borrower", "plain");
    toast({ tone: "info", title: "Application cancelled", body: "Nothing was paid out, so nothing needs reversing." });
  };

  const callUp = (id: string, guarantorId: string) => {
    const v = byId.get(id);
    log("guarantor.callup", v?.loan.ref ?? id, `${nameOf(guarantorId)} notified · SIMULATED`, "red");
    flashNow(id, "overdue");
    toast({ tone: "info", title: "Guarantor notified (SIMULATED)", body: `${nameOf(guarantorId)} · ${v?.loan.ref ?? ""}` });
  };

  const bulkSettle = () => {
    const ids = picked;
    setLoans((prev) => prev.map((l) => (ids.includes(l.id) ? { ...l, paid: totalOf(schedule(l)) } : l)));
    ids.forEach((id) => log("loan.settle", byId.get(id)?.loan.ref ?? id, "Marked settled in bulk · ledger posted · 2FA verified", "gold"));
    setPicked([]);
    toast({ tone: "ok", title: `${ids.length} loan${ids.length === 1 ? "" : "s"} settled`, body: "Guarantor shares released · each has its own audit row" });
  };

  const saveAuto = (a: { on: boolean; day: number; channel: Channel }) => {
    setAuto(a);
    log("autocollect.edit", "NY-LON-COLLECT", `${a.on ? "on" : "off"} · day ${a.day} · ${channelMeta[a.channel].label} · SIMULATED`);
    toast({ tone: "info", title: `Auto-collect ${a.on ? "on" : "off"}`, body: `Day ${a.day} · STK prompts SIMULATED` });
  };

  const savePolicy = (draft: PolicyDraft) => {
    setRules(draft.rules);
    setEnabled(draft.enabled);
    log("policy.edit", "NY-LON-POLICY", draft.changes.slice(0, 3).join(" · ") + " · 2FA verified", "gold");
    toast({ tone: "ok", title: "Loan policy saved (SIMULATED)", body: `${draft.changes.length} change${draft.changes.length === 1 ? "" : "s"} · new applications only` });
  };

  const routeToDecision = (id: string) => openDlg("approve", id);

  /* ================================================================== */
  return (
    <div className="page-dash-loans mx-auto max-w-[1500px]">
      {/* ================= HERO ================= */}
      <Reveal>
        <header className="ln-hero mb-6">
          <img src="/images/fin-sacco.jpg" alt="Shilling notes counted beside a savings passbook" className="ln-hero__img" fetchPriority="high" />
          <div className="ln-hero__shade" />
          <div className="ln-hero__body grid grid-cols-[minmax(0,1fr)] gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
            <div className="min-w-0">
              <span className="gd-code">T-10 · Loans</span>
              <h1 className="ny-display mt-3 max-w-[20ch] text-[clamp(1.9rem,4.6vw,3.3rem)] leading-[1.02] text-on-brand">
                Borrow with a plan. Repay with pride.
              </h1>
              <p className="mt-2.5 max-w-[60ch] text-sm leading-relaxed text-on-brand/85 sm:text-base">
                Personal, family, school, emergency and Sacco-backed loans — every schedule computed from its terms, every
                guarantor visible, every shilling on the ledger.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-accent" onClick={() => ov.open("apply")}>
                  <Plus className="h-4 w-4" /> Apply for a loan
                </button>
                <button type="button" className="ny-btn ny-btn-outline !border-on-brand/50 !text-on-brand hover:!bg-on-brand/10" onClick={() => openDlg("whatif")}>
                  <Sparkles className="h-4 w-4" /> What-if calculator
                </button>
                <button type="button" className="ny-btn ny-btn-ghost !text-on-brand/90 hover:!bg-on-brand/10" onClick={() => openDlg("elig")}>
                  <Landmark className="h-4 w-4" /> My eligibility
                </button>
              </div>
            </div>

            <div className="ln-glass p-4">
              <p className="ny-hud !text-on-brand/70">You can borrow up to</p>
              <p className="ny-display mt-1 text-[clamp(1.6rem,3vw,2.2rem)] leading-none">
                <CountUp value={saccoCap.available} prefix="KES " />
              </p>
              <p className="mt-1.5 text-xs text-on-brand/75">
                {fmt(me.shares)} shares × {rules.sharesMultiplier} · after what you already owe
              </p>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-on-brand/20 pt-3">
                <span className="ny-hud !text-on-brand/75">Next instalment</span>
                <span className="ny-chip ny-chip-warn">
                  {nextMine?.next ? `${kes(nextMine.next.instalment)} · ${fmtDate(nextMine.next.due)}` : "nothing due"}
                </span>
              </div>
            </div>
          </div>
        </header>
      </Reveal>

      {ov.params.get("src") === "sacco" && Number(ov.params.get("amount")) > 0 && (
        <Reveal>
          <div className="ny-card-flat mb-5 flex flex-wrap items-center justify-between gap-3 border-brand-accent px-4 py-3">
            <p className="text-sm text-text-secondary">
              You came from your Sacco eligibility: up to <strong className="text-text-primary">{kes(Number(ov.params.get("amount")))}</strong> is available against your shares.
            </p>
            <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => ov.open("apply", { t: "sacco", a: Number(ov.params.get("amount")) })}>
              Apply with this amount <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </Reveal>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[210px_minmax(0,1fr)]">
        <nav className="cc-rail" aria-label="Section index">
          <p className="ny-hud px-2 pb-1">Sections</p>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.label}
            </a>
          ))}
          <span className="ny-hud mt-2 border-t border-border-subtle px-2 pt-2 !text-[0.56rem]">7 sections · 20+ overlays</span>
        </nav>

        <div className="min-w-0">
          {/* ================= S1 KPIs ================= */}
          <section id="s1" className="mb-8 scroll-mt-24" aria-label="Loan KPIs">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
              {[
                { label: "Active loans", accent: kpiAccent.brand, hint: `${kes(liveOwed)} still owed family-wide`, value: <CountUp value={live.length} />, alert: false },
                { label: "Your outstanding", accent: kpiAccent.gold, hint: `${liveMine.length} live loan${liveMine.length === 1 ? "" : "s"} in your name`, value: <CountUp value={myOutstanding} prefix="KES " />, alert: false },
                { label: "Eligible (3× shares)", accent: kpiAccent.ok, hint: `${kesShort(saccoCap.available)} free after what you owe`, value: <CountUp value={grossShares} prefix="KES " />, alert: false },
                { label: "Next instalment", accent: kpiAccent.brand, hint: nextMine?.next ? `${fmtDate(nextMine.next.due)} · ${productOf(nextMine.loan.product).chip}` : "Nothing due", value: <CountUp value={nextMine?.next?.instalment ?? 0} prefix="KES " />, alert: false },
                { label: "Overdue", accent: kpiAccent.danger, hint: `${kes(overdueSum)} past due`, value: <CountUp value={overdue.length} />, alert: overdue.length > 0 },
                { label: "Repayment rate", accent: kpiAccent.warn, hint: "on-time instalments paid", value: <CountUp value={onTime} suffix="%" />, alert: false },
              ].map((k, i) => (
                <Reveal key={k.label} delay={i * 60}>
                  <div className={`ln-kpi ${k.alert ? "is-alert" : ""}`} style={{ ["--kpi-accent" as string]: k.accent } as CSSProperties}>
                    <p className="ny-hud">{k.label}</p>
                    <p className="ln-kpi__value mt-1.5">{k.value}</p>
                    <p className="mt-1.5 text-xs text-text-tertiary">{k.hint}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ================= S2 PRODUCTS ================= */}
          <section id="s2" className="mb-8 scroll-mt-24" aria-label="Loan products">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">The catalogue</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Nine ways to borrow</h2>
              </div>
              <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("policy")}>
                <Settings2 className="h-3.5 w-3.5" /> Shelf &amp; rules
              </button>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((p, i) => {
                const needs = [
                  p.shares ? `${p.id === "sacco" || p.id === "chama" ? rules.sharesMultiplier : p.sharesX}× shares` : null,
                  p.guarantors ? `${p.guarantors} guarantor${p.guarantors > 1 ? "s" : ""}` : null,
                  p.salary ? "net-pay cap" : null,
                  p.collateral ? "collateral" : null,
                  p.school ? "school paybill" : null,
                ].filter(Boolean) as string[];
                return (
                  <Reveal key={p.id} delay={i * 50} className="h-full">
                    <article className="ln-prod">
                      <div className="ln-prod__media">
                        <img src={p.image} alt="" className="ln-prod__img" loading="lazy" decoding="async" />
                        <div className="ln-prod__shade" />
                        <span className="ln-prod__sheen" aria-hidden />
                        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                          <span className={`ny-chip ${p.tone}`}>{p.chip}</span>
                          {p.fast && <span className="ny-chip ny-chip-warn">24-hour decision</span>}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-4">
                        <div>
                          <h3 className="ny-display text-[1.05rem] leading-tight">{p.name}</h3>
                          <p className="mt-1 text-xs leading-relaxed text-text-secondary">{p.blurb}</p>
                        </div>
                        <div className="ln-prod__spec text-sm">
                          <div>
                            <p className="ny-hud !text-[0.5rem]">Amount</p>
                            <p className="ny-num font-semibold">{kesShort(p.min)} – {kesShort(p.max)}</p>
                          </div>
                          <div>
                            <p className="ny-hud !text-[0.5rem]">Term</p>
                            <p className="ny-num font-semibold">{p.freq === "single" ? "One payday" : `${p.termMin}–${p.termMax} months`}</p>
                          </div>
                          <div>
                            <p className="ny-hud !text-[0.5rem]">Interest</p>
                            <p className="ny-num font-semibold">{p.rate}% · {p.method === "flat" ? "flat" : "reducing"}</p>
                          </div>
                          <div>
                            <p className="ny-hud !text-[0.5rem]">Needs</p>
                            <p className="font-semibold">{needs.length ? needs.join(", ") : "No security"}</p>
                          </div>
                        </div>
                        <div className="mt-auto flex gap-2 pt-1">
                          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm flex-1" onClick={() => ov.open("apply", { t: p.id })}>
                            Apply <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => openDlg("product", p.id)}>
                            Details
                          </button>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </section>

          {/* ================= S3 APPLY & CALCULATE ================= */}
          <section id="s3" className="mb-8 scroll-mt-24" aria-label="Apply and calculate">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Six steps, no surprises</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Apply and see the schedule first</h2>
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12">
              <Reveal className="lg:col-span-5">
                <div className="ny-card h-full p-5">
                  <p className="ny-hud">The application wizard</p>
                  <ol className="mt-3 space-y-2">
                    {["Choose the product and co-borrowers", "Set the amount and term — live ceiling", "Read the terms and the schedule", "Pick guarantors or collateral", "Choose where the money goes", "Review, declare and submit"].map((s, i) => (
                      <li key={s} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2 text-sm">
                        <span className="ny-num grid grid-cols-[minmax(0,1fr)] h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-primary text-[0.7rem] font-bold text-on-brand">{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                  <p className="ny-hud mt-4">Quick start</p>
                  <div className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    {[
                      { t: "salary", label: "Salary advance" },
                      { t: "school", label: "School fees" },
                      { t: "sacco", label: "Sacco-backed" },
                    ].map((q) => (
                      <button key={q.t} type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("apply", { t: q.t })}>
                        {q.label}
                      </button>
                    ))}
                  </div>
                  <button type="button" className="ny-btn ny-btn-accent mt-4 w-full" onClick={() => ov.open("apply")}>
                    <Plus className="h-4 w-4" /> Start a full application
                  </button>
                </div>
              </Reveal>

              <Reveal className="lg:col-span-7" delay={80}>
                <Calculator start="sacco" compact onApply={(p, a, t) => ov.open("apply", { t: p, a })} />
              </Reveal>
            </div>
          </section>

          {/* ================= S4 LOANS TABLE ================= */}
          <section id="s4" className="mb-8 scroll-mt-24" aria-label="Loans table">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Every loan</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Loans table</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="ny-hud">{visible.length} of {views.length} loans</span>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("filters")}>
                  <Filter className="h-3.5 w-3.5" /> Filters
                  {activeFilters > 0 && <span className="ny-chip ny-chip-brand !px-1.5">{activeFilters}</span>}
                </button>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => openDlg("export", undefined, { scope: "Portfolio (all live loans)" })}>
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
              </div>
            </div>

            <Tabs
              tabs={[
                { id: "all", label: "All" },
                { id: "decide", label: `Awaiting decision (${views.filter((v) => pendingStatuses.includes(v.status)).length})` },
                { id: "active", label: `Active (${live.length})` },
                { id: "overdue", label: `Overdue (${overdue.length})` },
                { id: "closed", label: "Closed" },
              ]}
              active={tab}
              onChange={(id) => setTab(id as TabId)}
            />

            {picked.length > 0 && (
              <div className="ny-card-flat mt-3 flex flex-wrap items-center justify-between gap-2 border-brand-accent px-4 py-2.5">
                <p className="text-sm">
                  <strong>{picked.length} selected</strong> · {kes(pickedOwed)} still owed
                </p>
                <div className="flex gap-2">
                  <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => setPicked([])}>
                    <X className="h-3.5 w-3.5" /> Clear
                  </button>
                  <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => openDlg("bulk")}>
                    <Check className="h-3.5 w-3.5" /> Mark settled (admin)
                  </button>
                </div>
              </div>
            )}

            <div className="cc-table-wrap ny-scroll mt-3 overflow-x-auto">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th aria-label="Select" />
                    <th>Ref</th>
                    <th>Borrowers</th>
                    <th>Product</th>
                    <th className="text-right">Amount</th>
                    <th>Term</th>
                    <th className="text-right">Instalment</th>
                    <th>Next due</th>
                    <th className="text-right">Left</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((v) => {
                    const isActive = activeStatuses.includes(v.status);
                    const isPending = pendingStatuses.includes(v.status);
                    const p = productOf(v.loan.product);
                    const who = v.loan.borrowers.map((b) => nameOf(b).split(" ")[0]).join(" + ");
                    return (
                      <tr key={v.loan.id} className={flash?.id === v.loan.id ? (flash.tone === "overdue" ? "ln-flash-overdue" : "ln-flash-posted") : ""} onClick={() => ov.open("loan", { id: v.loan.id, t: "summary" })}>
                        <td data-label="Select" onClick={(e) => e.stopPropagation()}>
                          {isActive && (
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-[var(--color-brand-primary)]"
                              aria-label={`Select ${v.loan.ref}`}
                              checked={picked.includes(v.loan.id)}
                              onChange={() => setPicked((prev) => (prev.includes(v.loan.id) ? prev.filter((x) => x !== v.loan.id) : [...prev, v.loan.id]))}
                            />
                          )}
                        </td>
                        <td data-label="Ref">
                          <span className="block font-semibold">{v.loan.ref}</span>
                          <span className="ny-hud !text-[0.55rem]">{v.loan.branch}</span>
                        </td>
                        <td data-label="Borrowers">
                          <span className="block max-w-[190px] truncate font-semibold">{who}</span>
                          <span className="ny-hud !text-[0.55rem]">{v.loan.purpose.slice(0, 34)}</span>
                        </td>
                        <td data-label="Product">
                          <span className={`ny-chip ${p.tone}`}>{p.chip}</span>
                        </td>
                        <td data-label="Amount" className="ny-num text-right font-semibold">{kes(v.loan.amount)}</td>
                        <td data-label="Term" className="ny-num">{v.loan.freq === "single" ? "1 payday" : `${v.loan.termMonths} mo`}</td>
                        <td data-label="Instalment" className="ny-num text-right">{v.instalment ? kes(v.instalment) : "—"}</td>
                        <td data-label="Next due" className="ny-num whitespace-nowrap">{v.next ? fmtDate(v.next.due) : "—"}</td>
                        <td data-label="Left" className="ny-num text-right font-semibold">{kes(v.outstanding)}</td>
                        <td data-label="Status">
                          <span className={`ny-chip ${statusMeta[v.status].tone} ${v.status === "overdue" ? "ny-pulse" : ""}`}>{statusMeta[v.status].label}</span>
                        </td>
                        <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                          <span className="flex flex-wrap gap-1.5">
                            {isPending && (
                              <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => routeToDecision(v.loan.id)}>
                                Review
                              </button>
                            )}
                            {isActive && (
                              <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => openDlg("pay", v.loan.id)}>
                                <Wallet className="h-3.5 w-3.5" /> Repay
                              </button>
                            )}
                            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => openDlg("export", v.loan.id, { scope: `Statement ${v.loan.ref}` })} aria-label={`Statement for ${v.loan.ref}`}>
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {visible.length === 0 && (
                    <tr>
                      <td colSpan={11} className="!py-10 text-center">
                        <p className="ny-display text-base">Nothing in this view</p>
                        <p className="mt-1 text-sm text-text-secondary">Try another tab, or start a new application.</p>
                        <button type="button" className="ny-btn ny-btn-accent ny-btn-sm mt-3" onClick={() => ov.open("apply")}>
                          <Plus className="h-3.5 w-3.5" /> New application
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="ny-hud mt-2">Click any row for the full drawer · tick live loans to settle them in bulk (admin)</p>
          </section>

          {/* ================= S5 OPEN A LOAN (passbook tickets) ================= */}
          <section id="s5" className="mb-8 scroll-mt-24" aria-label="Open a loan">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Live loans</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Open a passbook</h2>
                <p className="mt-1 max-w-[60ch] text-sm text-text-secondary">
                  Each loan is a passbook: tilt it with your pointer. The drawer has six tabs — summary, amortization, repayments, guarantors, comms and audit.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 xl:grid-cols-3">
              {live.map((v, i) => (
                <Reveal key={v.loan.id} delay={i * 60} className="h-full">
                  <LoanTicket view={v} who={v.loan.borrowers.map((b) => nameOf(b).split(" ").slice(0, 2).join(" ")).join(" + ")} onOpen={() => ov.open("loan", { id: v.loan.id, t: "summary" })} />
                </Reveal>
              ))}
            </div>
          </section>

          {/* ================= S6 COLLECTIONS ================= */}
          <section id="s6" className="mb-8 scroll-mt-24" aria-label="Repayment and collections">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Repay, collect, recover</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Repayments &amp; collections</h2>
              </div>
              <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("portfolio")}>
                <ShieldCheck className="h-3.5 w-3.5" /> Portfolio health
              </button>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-7">
                <Reveal>
                  <div className="ny-card p-4 sm:p-5">
                    <p className="ny-hud">Make a payment</p>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <select aria-label="Choose a live loan to pay" className="ny-select flex-1" value={payId} onChange={(e) => setPayPick(e.target.value)}>
                        {live.map((v) => (
                          <option key={v.loan.id} value={v.loan.id}>
                            {v.loan.ref} · {productOf(v.loan.product).chip} · {kes(v.outstanding)} left
                          </option>
                        ))}
                      </select>
                      <button type="button" className="ny-btn ny-btn-primary" disabled={!payId} onClick={() => openDlg("pay", payId)}>
                        <Wallet className="h-4 w-4" /> Continue
                      </button>
                    </div>
                    <p className="ny-hud mt-2">Three steps · instalment, overdue or full balance · M-Pesa is SIMULATED</p>
                  </div>
                </Reveal>

                <Reveal delay={60}>
                  <div className="ny-card flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                    <div>
                      <p className="ny-hud">Auto-collect</p>
                      <p className="mt-1 text-sm text-text-secondary">
                        {auto.on ? `STK prompt on day ${auto.day} via ${channelMeta[auto.channel].label}` : "Off — borrowers pay by hand"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" role="switch" aria-checked={auto.on} aria-label="Auto-collect" className="ln-switch" onClick={() => saveAuto({ ...auto, on: !auto.on })} />
                      <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => openDlg("auto")}>
                        Change
                      </button>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <div className="ny-card p-4 sm:p-5">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="ny-hud">Overdue handling</p>
                        <h3 className="ny-display text-lg">{overdue.length ? `${overdue.length} loan${overdue.length === 1 ? "" : "s"} past due` : "Nothing overdue"}</h3>
                      </div>
                      <span className={`ny-chip ${overdue.length ? "ny-chip-danger ny-pulse" : "ny-chip-ok"}`}>
                        {overdue.length ? kes(overdueSum) : "clear"}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {overdue.map((v) => (
                        <li key={v.loan.id} className="ln-check is-fail flex-col !items-stretch">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">{v.loan.title}</p>
                              <p className="ny-hud !text-[0.55rem]">
                                {v.loan.ref} · {v.daysLate} days late · {kes(v.overdueAmt)} overdue
                                {v.penalty > 0 ? ` · penalty ${kes(v.penalty)}` : " · inside grace"}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => openDlg("pay", v.loan.id)}>
                              <Wallet className="h-3.5 w-3.5" /> Record payment
                            </button>
                            <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => openDlg("callup", v.loan.id)}>
                              Call up guarantor
                            </button>
                            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => openDlg("writeoff", v.loan.id)}>
                              <Trash2 className="h-3.5 w-3.5" /> Write off
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {overdue.length === 0 && (
                      <div className="ny-inset px-4 py-6 text-center text-sm text-text-secondary">Every instalment is on time. The grace period is {rules.graceDays} days.</div>
                    )}
                  </div>
                </Reveal>

                <Reveal delay={140}>
                  <div className="ny-card p-4 sm:p-5">
                    <p className="ny-hud">Restructure</p>
                    <p className="mt-1 text-sm text-text-secondary">Lower the instalment by extending the term. Admin only, with a reason and 2FA.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {live.filter((v) => v.loan.freq === "monthly").slice(0, 3).map((v) => (
                        <button key={v.loan.id} type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => openDlg("restructure", v.loan.id)}>
                          <RotateCcw className="h-3.5 w-3.5" /> {v.loan.ref.slice(-5)} · {productOf(v.loan.product).chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>

              <Reveal className="lg:col-span-5" delay={80}>
                <div className="ny-card h-full p-4 sm:p-5">
                  <p className="ny-hud">Ledger · latest posts</p>
                  <h3 className="ny-display text-lg">Recent repayments</h3>
                  <ol className="mt-3 space-y-2.5">
                    {reps.slice(0, 8).map((r) => (
                      <li key={r.ref} className="flex gap-3">
                        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${r.status === "confirmed" ? "bg-brand-primary" : "bg-brand-accent"}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold">{nameOf(byId.get(r.loanId)?.loan.borrowers[0] ?? "")}</p>
                            <span className="ny-num shrink-0 text-sm font-semibold">{kes(r.amount)}</span>
                          </div>
                          <p className="ny-hud mt-0.5 !text-[0.55rem]">
                            {byId.get(r.loanId)?.loan.ref} · instalment {r.no} · {fmtDate(r.date)} · {channelMeta[r.channel].label}
                          </p>
                          <p className="ny-hud !text-[0.5rem]">
                            {r.ref} · {r.ledger} · <span className={r.status === "confirmed" ? "text-success" : "text-[#7a5b12]"}>{r.status}</span>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="ny-chip ny-chip-sim mt-4">Auto-collect and bank references SIMULATED</p>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ================= S7 GOVERNANCE & AUDIT ================= */}
          <section id="s7" className="mb-8 scroll-mt-24" aria-label="Governance and audit">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Governance</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Policy, audit and exports</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => ov.open("policy")}>
                  <Scale className="h-3.5 w-3.5" /> Edit policy (2FA)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { k: "Sacco multiplier", v: `${rules.sharesMultiplier}× shares` },
                { k: "Guarantor pledge", v: `${rules.pledgePct}% counts` },
                { k: "Active loans allowed", v: `${rules.maxActive} per member` },
                { k: "Auto-approve below", v: kesShort(rules.autoApproveUnder) },
                { k: "2FA above", v: kesShort(rules.twoFactorAbove) },
                { k: "Grace before penalty", v: `${rules.graceDays} days` },
                { k: "Late penalty", v: `${rules.penaltyPct}% of instalment` },
                { k: "Guarantor call-up", v: `after ${rules.callUpAfterDays} days` },
              ].map((r) => (
                <div key={r.k} className="gd-kpi">
                  <p className="ny-hud">{r.k}</p>
                  <p className="ny-display mt-1.5 text-base leading-tight">{r.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12">
              <div className="cc-table-wrap lg:col-span-8">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle px-4 py-3">
                  <p className="ny-hud">Append-only · latest {Math.min(8, audit.length)}</p>
                  <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => openDlg("export", undefined, { scope: "Audit trail" })}>
                    <Download className="h-3.5 w-3.5" /> Export audit
                  </button>
                </div>
                <ul>
                  {audit.slice(0, 8).map((a) => (
                    <li key={a.ref}>
                      <button type="button" className="cc-audit-row w-full text-left" onClick={() => openDlg("audit", a.ref)}>
                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.tone === "gold" ? "bg-brand-accent" : a.tone === "red" ? "bg-danger" : "bg-text-tertiary"}`} />
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

              <div className="ny-card flex flex-col gap-3 p-4 lg:col-span-4">
                <p className="ny-hud">Exports</p>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm justify-start !whitespace-normal !text-left" onClick={() => openDlg("export", payId, { scope: `Statement ${byId.get(payId)?.loan.ref ?? ""}` })}>
                  <FileText className="h-3.5 w-3.5" /> Statement PDF · selected loan
                </button>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm justify-start !whitespace-normal !text-left" onClick={() => openDlg("export", undefined, { scope: "Portfolio (all live loans)" })}>
                  <Download className="h-3.5 w-3.5" /> Portfolio CSV · admin
                </button>
                <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm justify-start !whitespace-normal !text-left" onClick={() => openDlg("product", "sacco")}>
                  <Landmark className="h-3.5 w-3.5" /> How Sacco loans work
                </button>
                <p className="ny-chip ny-chip-sim mt-auto">Exports queue locally · signed files in Phase 2</p>
              </div>
            </div>
          </section>

          {/* ================= FOOTER ================= */}
          <Reveal>
            <footer className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Frontend-only Phase 1.</strong> Repayment rails, guarantor call-ups and credit checks render fully and resolve honestly.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["M-Pesa STK", "Bank EFT", "Guarantor SMS", "Credit bureau", "Payroll deduction", "Sacco ledger"].map((r) => (
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
          initialProduct={(ov.t as ProductId | null) ?? null}
          initialAmount={ov.a ? Number(ov.a) : null}
          members={members}
          me={me}
          rules={rules}
          enabled={enabled}
          obligations={obligations}
          activeCount={activeMine}
          nextRef={nextRef}
          onSubmit={(loan) => {
            ov.close();
            submitApp(loan);
          }}
        />
      )}

      <LoanDrawer
        key={`loan-${ov.id ?? "none"}-${ov.nonce ?? "0"}`}
        open={ov.key === "loan" && !!drawerView}
        onClose={ov.close}
        view={drawerView}
        initialTab={ov.t ?? "summary"}
        reps={reps}
        audit={audit}
        onPay={(v) => openDlg("pay", v.loan.id)}
        onRestructure={(v) => openDlg("restructure", v.loan.id)}
        onApprove={(v) => openDlg("approve", v.loan.id)}
        onCancel={(v) => openDlg("cancel", v.loan.id)}
        onBroadcast={(v) => openDlg("broadcast", v.loan.id)}
        onCallUp={(v) => openDlg("callup", v.loan.id)}
        onWriteOff={(v) => openDlg("writeoff", v.loan.id)}
        onStatement={(v) => openDlg("export", v.loan.id, { scope: `Statement ${v.loan.ref}` })}
        onRow={(row, paid, v) => openDlg("schedule", v.loan.id, { row: v.rows.findIndex((r) => r.no === row.no), paid })}
        onAuditOpen={(e) => openDlg("audit", e.ref)}
      />

      <FiltersDrawer open={ov.key === "filters"} onClose={ov.close} value={fl} onChange={setFl} />

      <PolicyDrawer
        key={`policy-${ov.nonce ?? "0"}`}
        open={ov.key === "policy"}
        onClose={ov.close}
        rules={rules}
        enabled={enabled}
        onReview={(draftRules, draftEnabled, changes) => openDlg("confirm-policy", undefined, { pending: { rules: draftRules, enabled: draftEnabled, changes } })}
      />

      <PortfolioDrawer
        open={ov.key === "portfolio"}
        onClose={ov.close}
        views={live}
        onPay={(v) => openDlg("pay", v.loan.id)}
        onCallUp={(v) => openDlg("callup", v.loan.id)}
        onRestructure={(v) => openDlg("restructure", v.loan.id)}
        onWriteOff={(v) => openDlg("writeoff", v.loan.id)}
      />

      {/* ================= LOCAL OVERLAYS ================= */}
      {is("pay") && dv && (
        <PaymentWizard
          key={`pay-${dlg?.n}`}
          view={dv}
          onClose={closeDlg}
          onPay={(amt, ch) => pay(dv, amt, ch)}
        />
      )}

      {is("restructure") && dv && (
        <RestructureWizard
          key={`rs-${dlg?.n}`}
          view={dv}
          onClose={closeDlg}
          onApply={(term, reason) => {
            restructure(dv.loan.id, term, reason);
          }}
        />
      )}

      {is("approve") && dv && (
        <ApproveWizard
          key={`ap-${dlg?.n}`}
          view={dv}
          available={ceilingFor(productOf(dv.loan.product), dv.loan.borrowers.map((b) => memberOf(b)).filter((m): m is NonNullable<typeof m> => !!m), dv.loan.guarantors, rules, obligationsOf(dv.loan.borrowers[0] ?? ME_ID, loans.filter((l) => l.id !== dv.loan.id), rules)).available}
          activeOK={activeCountOf(dv.loan.borrowers[0] ?? ME_ID, loans.filter((l) => l.id !== dv.loan.id), rules) < rules.maxActive}
          rules={rules}
          onClose={closeDlg}
          onDecide={(d) => {
            if (d.decision === "decline") decline(dv.loan.id, d.reason);
            else approve(dv.loan.id, d.channel);
          }}
        />
      )}

      <CancelApplicationModal key={`cn-${dlg?.n}`} open={is("cancel")} onClose={closeDlg} view={dv} onConfirm={() => dv && cancel(dv.loan.id)} />

      <WriteOffModal key={`wo-${dlg?.n}`} open={is("writeoff")} onClose={closeDlg} view={dv} onConfirm={(reason) => dv && writeOff(dv.loan.id, reason)} />

      <BroadcastModal
        key={`bc-${dlg?.n}`}
        open={is("broadcast")}
        onClose={closeDlg}
        view={dv}
        onSent={(summary) => toast({ tone: "info", title: "Message sent (SIMULATED)", body: summary })}
      />

      <CallUpModal key={`cu-${dlg?.n}`} open={is("callup")} onClose={closeDlg} view={dv} onConfirm={(gid) => dv && callUp(dv.loan.id, gid)} />

      <ExportModal
        key={`ex-${dlg?.n}`}
        open={is("export")}
        onClose={closeDlg}
        scope={dlg?.scope ?? "Loans"}
        onQueue={(format) => {
          setDlg(null);
          toast({ tone: "ok", title: `${format} export queued`, body: `${dlg?.scope ?? "Loans"} · signed file arrives in Phase 2` });
        }}
      />

      <BulkSettleModal
        key={`bs-${dlg?.n}`}
        open={is("bulk")}
        onClose={closeDlg}
        count={picked.length}
        total={pickedOwed}
        onConfirm={() => {
          bulkSettle();
          setDlg(null);
        }}
      />

      <ScheduleRowModal
        key={`sr-${dlg?.n}`}
        open={is("schedule")}
        onClose={closeDlg}
        row={dv && dlg?.row !== undefined ? dv.rows[dlg.row] ?? null : null}
        paid={!!dlg?.paid}
        loan={dv?.loan ?? null}
      />

      <WhatIfModal
        key={`wi-${dlg?.n}`}
        open={is("whatif")}
        onClose={closeDlg}
        onApply={(p, a) => {
          setDlg(null);
          ov.open("apply", { t: p, a });
        }}
      />

      <EligibilityModal
        key={`el-${dlg?.n}`}
        open={is("elig")}
        onClose={closeDlg}
        me={me}
        obligations={obligations}
        rules={rules}
        onApply={(p, a) => {
          setDlg(null);
          ov.open("apply", { t: p, a });
        }}
      />

      <ProductDetailModal
        key={`pd-${dlg?.n}`}
        open={is("product")}
        onClose={closeDlg}
        product={dlg?.id ? productOf(dlg.id as ProductId) : null}
        onApply={(p) => {
          setDlg(null);
          ov.open("apply", { t: p });
        }}
      />

      <AutoCollectModal key={`au-${dlg?.n}`} open={is("auto")} onClose={closeDlg} auto={auto} onSave={saveAuto} />

      <ConfirmPolicyModal
        key={`cp-${dlg?.n}`}
        open={is("confirm-policy")}
        onClose={closeDlg}
        changes={dlg?.pending?.changes ?? []}
        onConfirm={() => {
          if (dlg?.pending) savePolicy(dlg.pending);
          ov.close();
        }}
      />

      <ReceiptModal open={is("receipt")} onClose={closeDlg} receipt={receipt} />

      <AuditDetailModal open={is("audit")} onClose={closeDlg} entry={audit.find((a) => a.ref === dlg?.id) ?? null} />
    </div>
  );
}

