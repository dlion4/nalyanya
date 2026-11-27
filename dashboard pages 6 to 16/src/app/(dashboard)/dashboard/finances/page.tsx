"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowRight, Download, Filter, Landmark, Plus, RotateCw, Scale, Sparkles, Users, Wallet } from "lucide-react";
import {
  type AuditEntry,
  type AutoDebit,
  type Chama,
  type ChamaType,
  type Person,
  type ProductId,
  type Rules,
  type Tx,
  type TxKind,
  auditSeed,
  advanceRound,
  chamas,
  cycleLabel,
  dividends,
  eligibleAmount,
  kindOf,
  ME_ID,
  nameOf,
  personById,
  productTypes,
  rules,
  sacco,
  transactions,
  typeLabel,
} from "@/data/dashboard/finances";
import { fmt, kes, kesShort, pct } from "@/lib/format";
import { useToast } from "@/components/ui/overlay";
import { CountUp, Reveal, Tabs } from "@/components/ui/primitives";
import { useOverlay } from "@/components/finances/use-overlay";
import { Countdown, Meter, MgrRing3D, ShareCertificate3D, ShareCurve, Spark } from "@/components/finances/charts";
import {
  AutoDebitModal,
  channelMeta,
  ContributeChamaModal,
  DividendHistoryModal,
  EligibilityModal,
  ExportModal,
  JoinChamaModal,
  RotateNowModal,
  ShareMonthModal,
  ShareReceiptModal,
  ShareUnitModal,
  StatementsModal,
  type PostedContribution,
  type ShareReceipt,
} from "@/components/finances/modals";
import { ChamaDrawer, DividendDrawer, emptyTx, GovernanceDrawer, TxFiltersDrawer, type TxFilters } from "@/components/finances/drawers";
import { BuySharesWizard, CreateProductWizard } from "@/components/finances/wizards";
import {
  AuditDetailModal,
  BulkRotateModal,
  EditRulesModal,
  PenaltyWaiveModal,
  ReorderCycleModal,
  TransactionDetailModal,
} from "@/components/finances/ops-modals";

const HERO_IMG = "/images/fin-chama-hero.jpg";

const sections = [
  { id: "s1", label: "S1 · Finance KPIs" },
  { id: "s2", label: "S2 · Chamas & rounds" },
  { id: "s3", label: "S3 · Sacco engine" },
  { id: "s4", label: "S4 · Transactions" },
  { id: "s5", label: "S5 · Chama drawer" },
  { id: "s6", label: "S6 · Create product" },
  { id: "s7", label: "S7 · Governance & audit" },
];

const typeTone: Record<ChamaType, string> = {
  savings: "ny-chip-info",
  "merry-go-round": "ny-chip-warn",
  investment: "ny-chip-brand",
};

const txTypeChip: Record<Tx["type"], { label: string; cls: string }> = {
  "share-buy": { label: "Share purchase", cls: "ny-chip-brand" },
  "auto-debit": { label: "Auto-debit", cls: "ny-chip-info" },
  chama: { label: "Chama contribution", cls: "ny-chip-neutral" },
  "mgr-payout": { label: "Round payout", cls: "ny-chip-ok" },
  dividend: { label: "Dividend", cls: "ny-chip-warn" },
  penalty: { label: "Late penalty", cls: "ny-chip-danger" },
};

const statusChip: Record<Tx["status"], string> = {
  confirmed: "ny-chip-ok",
  pending: "ny-chip-warn",
  scheduled: "ny-chip-info",
  failed: "ny-chip-danger",
};

const txTabs: { id: "all" | TxKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "shares", label: "Shares" },
  { id: "chama", label: "Chama" },
  { id: "mgr", label: "Merry-go-round" },
  { id: "dividends", label: "Dividends" },
];

const ledgerRef = () => `NY-LED-00045${Math.floor(Math.random() * 90 + 10)}`;

export default function FinancesPage() {
  return <FinancesView />;
}

function KpiCard({ label, accent, hint, children }: { label: string; accent: string; hint: string; children: ReactNode }) {
  return (
    <div className="fin-kpi" style={{ ["--kpi-accent" as string]: accent } as CSSProperties}>
      <p className="ny-hud">{label}</p>
      <div className="fin-kpi__value mt-1.5">{children}</div>
      <p className="mt-1.5 text-xs text-text-tertiary">{hint}</p>
    </div>
  );
}

type ChamaCardProps = {
  c: Chama;
  index: number;
  flash: boolean;
  onContribute: (c: Chama) => void;
  onDetails: (c: Chama, tab: string) => void;
  onRotate: (c: Chama) => void;
  onStatements: (c: Chama) => void;
};

function ChamaCard({ c, index, flash, onContribute, onDetails, onRotate, onStatements }: ChamaCardProps) {
  const p = pct(c.pool, c.target);
  const isMgr = c.type === "merry-go-round";
  const members = c.memberIds.map((id) => personById(id)).filter((x): x is Person => !!x);
  return (
    <Reveal delay={index * 60} className="h-full">
      <article className={`fin-chama h-full ${flash ? "fin-flash-posted" : ""}`}>
        <div className="fin-chama__media">
          <img src={c.image} alt="" className="fin-chama__img" loading="lazy" decoding="async" />
          <div className="fin-shade" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <span className={`ny-chip ${typeTone[c.type]}`}>{typeLabel[c.type]}</span>
            <span className="ny-chip ny-chip-neutral">{c.branch}</span>
          </div>
          <span className="fin-glass ny-hud absolute bottom-2 right-2 px-2 py-0.5 !text-[0.55rem]">{c.ref}</span>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="ny-display truncate text-[1.05rem] leading-tight">{c.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-secondary">{c.blurb}</p>
            </div>
            <p className="ny-num shrink-0 text-right text-lg font-semibold leading-none">
              {p}%
              <span className="ny-hud mt-1 block !text-[0.5rem]">funded</span>
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg bg-surface-2 px-2.5 py-2">
              <dt className="ny-hud !text-[0.5rem]">Members</dt>
              <dd className="ny-num mt-0.5 font-semibold">{c.memberIds.length}</dd>
            </div>
            <div className="rounded-lg bg-surface-2 px-2.5 py-2">
              <dt className="ny-hud !text-[0.5rem]">Each {c.cycle === "weekly" ? "week" : c.cycle === "monthly" ? "month" : "fortnight"}</dt>
              <dd className="ny-num mt-0.5 font-semibold">{kesShort(c.contribution)}</dd>
            </div>
            <div className="rounded-lg bg-surface-2 px-2.5 py-2">
              <dt className="ny-hud !text-[0.5rem]">Cycle</dt>
              <dd className="mt-0.5 font-semibold">{cycleLabel[c.cycle]}</dd>
            </div>
          </dl>

          {isMgr ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2">
              <div className="min-w-0">
                <p className="ny-hud !text-[0.5rem]">Takes the pot · round {c.round} of {c.totalRounds}</p>
                <p className="truncate text-sm font-semibold">{nameOf(c.orderIds[c.recipientIdx] ?? "")}</p>
              </div>
              <span className="ny-chip ny-chip-warn ny-pulse shrink-0">active</span>
            </div>
          ) : (
            <div className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2">
              <p className="ny-hud !text-[0.5rem]">Goal</p>
              <p className="truncate text-sm font-semibold">{c.targetLabel}</p>
            </div>
          )}

          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="ny-num font-semibold">{kes(c.pool)}</span>
              <span className="text-text-tertiary">of {kesShort(c.target)}</span>
            </div>
            <Meter value={c.pool} max={c.target} gold={p >= 100} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="ny-hud !text-[0.56rem]">{c.nextLabel}</span>
            <span className="ny-chip ny-chip-brand">
              <Countdown key={`${c.id}-${c.round}`} seconds={c.nextInSec} />
            </span>
          </div>

          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm flex-1" onClick={() => onContribute(c)}>
              Contribute
            </button>
            <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onDetails(c, isMgr ? "cycle" : "overview")}>
              {isMgr ? "View cycle" : "Details"}
            </button>
            {isMgr && (
              <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onRotate(c)}>
                <RotateCw className="h-3.5 w-3.5" /> Rotate
              </button>
            )}
            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onStatements(c)}>
              Statements
            </button>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex -space-x-2" aria-label={`${members.length} members`}>
              {members.slice(0, 6).map((m) => (
                <span key={m.id} title={m.name} className="grid grid-cols-[minmax(0,1fr)] h-7 w-7 place-items-center rounded-full border-2 border-surface-1 bg-brand-primary text-[0.58rem] font-bold text-on-brand">
                  {m.initials}
                </span>
              ))}
            </div>
            {members.length > 6 && <span className="ny-hud !text-[0.56rem]">+{members.length - 6} more</span>}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function FinancesView() {
  const toast = useToast();
  const ov = useOverlay();

  /* ---------- live state (mock, local only) ---------- */
  const [list, setList] = useState<Chama[]>(chamas);
  const [txs, setTxs] = useState<Tx[]>(transactions);
  const [audit, setAudit] = useState<AuditEntry[]>(auditSeed);
  const [curve, setCurve] = useState<number[]>(sacco.myShares);
  const [live, setLive] = useState({ pool: 0, issued: 0, month: 0 });
  const [auto, setAuto] = useState<AutoDebit>(sacco.auto);
  const [ruleset, setRuleset] = useState<Rules>(rules);
  const [declared, setDeclared] = useState<number | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [typeTab, setTypeTab] = useState<"all" | ChamaType>("all");
  const [ringId, setRingId] = useState("ch1");
  const [spotId, setSpotId] = useState("ch1");
  const [curveRange, setCurveRange] = useState("12m");
  const [txTab, setTxTab] = useState<"all" | TxKind>("all");
  const [txFilter, setTxFilter] = useState<TxFilters>(emptyTx);
  const [session, setSession] = useState(0);

  /* ---------- local overlay state (keyed by session for clean remounts) ---------- */
  const [contribOpen, setContribOpen] = useState(false);
  const [contribFor, setContribFor] = useState<Chama | null>(null);
  const [rotateOpen, setRotateOpen] = useState(false);
  const [rotateFor, setRotateFor] = useState<Chama | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [stmtOpen, setStmtOpen] = useState(false);
  const [stmtFor, setStmtFor] = useState<Chama | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportScope, setExportScope] = useState("All transactions");
  const [eligOpen, setEligOpen] = useState(false);
  const [divHistOpen, setDivHistOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receipt, setReceipt] = useState<ShareReceipt | null>(null);
  const [autoOpen, setAutoOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const [monthIdx, setMonthIdx] = useState(0);
  const [reorderOpen, setReorderOpen] = useState(false);
  const [reorderFor, setReorderFor] = useState<Chama | null>(null);
  const [waiveOpen, setWaiveOpen] = useState(false);
  const [waiveFor, setWaiveFor] = useState<{ chama: Chama; personId: string } | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [txOpen, setTxOpen] = useState(false);
  const [txFor, setTxFor] = useState<Tx | null>(null);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditFor, setAuditFor] = useState<AuditEntry | null>(null);

  /* ---------- derived ---------- */
  const owned = curve[curve.length - 1];
  const unit = sacco.unitValue;
  const poolNow = sacco.pool + live.pool;
  const issuedNow = sacco.sharesIssued + live.issued;
  const eligible = eligibleAmount(owned, unit, ruleset.multiplier);
  const monthNow = sacco.thisMonthTotal + live.month;
  const mgrs = list.filter((c) => c.type === "merry-go-round");
  const hero = mgrs[0];
  const activeMgr = mgrs.find((c) => c.id === ringId) ?? mgrs[0];
  const spot = list.find((c) => c.id === spotId) ?? list[0];
  const visibleChamas = typeTab === "all" ? list : list.filter((c) => c.type === typeTab);
  const curveVals = curveRange === "6m" ? curve.slice(-6) : curve;
  const curveLabels = curveRange === "6m" ? sacco.months.slice(-6) : sacco.months;
  const groups = useMemo(() => Array.from(new Set(txs.map((t) => t.group))), [txs]);
  const txActive =
    (txFilter.q ? 1 : 0) + (txFilter.status !== "all" ? 1 : 0) + (txFilter.channel !== "all" ? 1 : 0) + (txFilter.group !== "all" ? 1 : 0);

  const filteredTx = useMemo(
    () =>
      txs.filter((t) => {
        if (txTab !== "all" && kindOf(t.type) !== txTab) return false;
        if (txFilter.status !== "all" && t.status !== txFilter.status) return false;
        if (txFilter.channel !== "all" && t.channel !== txFilter.channel) return false;
        if (txFilter.group !== "all" && t.group !== txFilter.group) return false;
        const q = txFilter.q.trim().toLowerCase();
        if (q && !`${t.who} ${t.ref} ${t.ledger}`.toLowerCase().includes(q)) return false;
        return true;
      }),
    [txs, txTab, txFilter],
  );

  const ovChama = ov.key === "chama" ? list.find((c) => c.id === ov.id) ?? null : null;
  const newType = (ov.t as ProductId | null) ?? "merry-go-round";
  const nextRef = `NY-CHM-${String(list.length + 1).padStart(4, "0")}`;

  /* ---------- helpers ---------- */
  const bump = () => setSession((s) => s + 1);

  const logAudit = (action: string, entity: string, detail: string, tone: AuditEntry["tone"] = "plain") => {
    setAudit((prev) => [
      { ref: `NY-AUD-${String(1012 + prev.length).padStart(5, "0")}`, at: "18 Nov · 09:40", actor: nameOf(ME_ID), action, entity, detail, tone },
      ...prev,
    ]);
  };

  const flashOnce = (id: string) => {
    setFlashId(id);
    window.setTimeout(() => setFlashId(null), 1200);
  };

  const openContribute = (c: Chama) => {
    bump();
    setContribFor(c);
    setContribOpen(true);
  };
  const openRotate = (c: Chama) => {
    bump();
    setRotateFor(c);
    setRotateOpen(true);
  };
  const openStatements = (c: Chama) => {
    bump();
    setStmtFor(c);
    setStmtOpen(true);
  };
  const openReorder = (c: Chama) => {
    bump();
    setReorderFor(c);
    setReorderOpen(true);
  };
  const openWaive = (c: Chama, personId: string) => {
    bump();
    setWaiveFor({ chama: c, personId });
    setWaiveOpen(true);
  };
  const openExport = (scope: string) => {
    bump();
    setExportScope(scope);
    setExportOpen(true);
  };

  /* ---------- domain actions (local simulation) ---------- */
  const postContribution = (r: PostedContribution) => {
    const c = list.find((x) => x.id === r.chamaId);
    setList((prev) =>
      prev.map((x) =>
        x.id === r.chamaId
          ? { ...x, pool: x.pool + r.amount, paidIds: x.paidIds.includes(ME_ID) ? x.paidIds : [...x.paidIds, ME_ID] }
          : x,
      ),
    );
    setLive((l) => ({ ...l, month: l.month + r.amount }));
    setTxs((prev) => [
      {
        id: `t${Date.now().toString(36)}`,
        ref: r.ref,
        at: "18 Nov · 09:40",
        type: "chama",
        who: nameOf(ME_ID),
        group: `${c?.ref ?? "NY-CHM"} · ${c?.name ?? "Chama"}`,
        amount: r.amount,
        channel: r.channel,
        status: r.channel === "bank" ? "pending" : "confirmed",
        ledger: r.channel === "bank" ? "—" : ledgerRef(),
      },
      ...prev,
    ]);
    flashOnce(r.chamaId);
    logAudit("chama.contribute", c?.ref ?? r.chamaId, `${kes(r.amount)} via ${channelMeta[r.channel].label} · SIMULATED`, "gold");
    toast({
      tone: "ok",
      title: `${kes(r.amount)} posted to ${c?.name ?? "the chama"}`,
      body: `${r.ref} · ${r.channel === "bank" ? "bank reference pending" : "no money moved in Phase 1"}`,
    });
  };

  const buyShares = (r: ShareReceipt) => {
    setCurve((prev) => [...prev.slice(0, -1), prev[prev.length - 1] + r.shares]);
    setLive((l) => ({ pool: l.pool + r.amount, issued: l.issued + r.shares, month: l.month + r.amount }));
    setTxs((prev) => [
      {
        id: `t${Date.now().toString(36)}`,
        ref: r.ref,
        at: "18 Nov · 09:40",
        type: "share-buy",
        who: nameOf(ME_ID),
        group: `${sacco.ref} · Sacco`,
        amount: r.amount,
        channel: r.channel,
        status: "confirmed",
        ledger: r.ledger,
      },
      ...prev,
    ]);
    if (r.monthly) setAuto({ enabled: true, amount: r.amount, day: r.day, channel: r.channel });
    setReceipt(r);
    bump();
    setReceiptOpen(true);
    flashOnce("shares");
    logAudit("share.issue", sacco.ref, `${r.shares} shares at ${kes(unit)} · ${r.ledger}`, "gold");
    toast({ tone: "ok", title: `+${r.shares} shares posted`, body: `${r.ref} · local share ledger · money leg SIMULATED` });
  };

  const rotateMany = (ids: string[], note: string) => {
    let nextList = list;
    const rows: Tx[] = [];
    ids.forEach((id) => {
      const c = nextList.find((x) => x.id === id);
      if (!c || c.type !== "merry-go-round") return;
      const res = advanceRound(c, "18 Nov");
      nextList = nextList.map((x) => (x.id === id ? res.chama : x));
      rows.push({
        id: `t${Date.now().toString(36)}${rows.length}`,
        ref: `NY-PAY-2025-${String(81 + rows.length).padStart(4, "0")}`,
        at: "18 Nov · 09:41",
        type: "mgr-payout",
        who: res.paidTo,
        group: `${c.ref} · Round ${c.round}`,
        amount: c.pool,
        channel: "mpesa",
        status: "confirmed",
        ledger: ledgerRef(),
      });
      logAudit("mgr.payout", c.ref, `${kes(c.pool)} → ${res.paidTo} (Round ${c.round}) · ${note} · SIMULATED B2C`, "gold");
    });
    if (rows.length === 0) return;
    setList(nextList);
    setTxs((prev) => [...rows, ...prev]);
    setRingId(ids[0] ?? ringId);
    bump();
    toast({
      tone: "ok",
      title: rows.length > 1 ? `${rows.length} rounds rotated (SIMULATED)` : "Round paid out (SIMULATED)",
      body: `${rows[0].who} · ${kes(rows[0].amount)} · each payout writes its own ledger post`,
    });
  };

  const saveOrder = (id: string, order: string[]) => {
    const c = list.find((x) => x.id === id);
    setList((prev) => prev.map((x) => (x.id === id ? { ...x, orderIds: order } : x)));
    logAudit("rotation.reorder", c?.ref ?? id, `New order for ${order.length} rounds · 2FA verified`);
    toast({ tone: "ok", title: "Rotation order saved", body: "Paid rounds stay fixed; upcoming rounds moved." });
  };

  const waive = (c: Chama, personId: string, reason: string) => {
    logAudit("penalty.waive", c.ref, `${kes(c.penalty)} waived for ${nameOf(personId)} · ${reason}`, "red");
    toast({ tone: "info", title: "Penalty waived", body: `${nameOf(personId).split(" ")[0]} · recorded in the audit trail` });
  };

  const saveRules = (r: Rules) => {
    setRuleset(r);
    logAudit("rules.edit", sacco.ref, `penalty ${kes(r.penalty)} · grace ${r.graceDays} days · multiplier ${r.multiplier}× · 2FA verified`);
    toast({ tone: "ok", title: "Family rules saved (SIMULATED)", body: `Loan multiplier now ${r.multiplier}× shares.` });
  };

  const declare = (perShare: number) => {
    setDeclared(perShare);
    logAudit("dividend.declare", sacco.ref, `${kes(perShare)} per share · ${fmt(sacco.sharesIssued)} shares · SIMULATED`, "gold");
    toast({ tone: "ok", title: "Dividend declared (SIMULATED)", body: `${kes(perShare)} per share · paid pro-rata when the backend is wired` });
  };

  const createProduct = (c: Chama) => {
    setList((prev) => [c, ...prev]);
    setSpotId(c.id);
    if (c.type === "merry-go-round") setRingId(c.id);
    logAudit("product.create", c.ref, `${typeLabel[c.type]} · ${c.name} · ${c.memberIds.length} members`, "gold");
    flashOnce(c.id);
    toast({ tone: "ok", title: "Product saved", body: `${c.ref} · ${c.name} · 2FA verified (SIMULATED)` });
  };

  const saveAuto = (a: AutoDebit) => {
    setAuto(a);
    logAudit("auto-debit.edit", sacco.ref, `${kes(a.amount)} on day ${a.day} · ${a.enabled ? "on" : "off"} · SIMULATED`);
    toast({ tone: "info", title: `Auto-debit ${a.enabled ? "on" : "off"}`, body: `${kes(a.amount)} on day ${a.day} · standing order SIMULATED` });
  };

  const joinRequest = (chamaId: string, reason: string) => {
    const c = list.find((x) => x.id === chamaId);
    logAudit("membership.request", c?.ref ?? chamaId, `${nameOf(ME_ID)} asked to join · ${reason}`);
    toast({ tone: "info", title: "Request queued", body: "Ready — connects when the backend is wired. An admin of the chama approves it." });
  };

  const exportQueue = (format: string) => {
    setExportOpen(false);
    toast({ tone: "ok", title: `${format} export queued`, body: `${exportScope} · HMAC-signed file arrives in Phase 2` });
  };

  const pickMonth = (i: number) => {
    setMonthIdx(curveRange === "6m" ? curve.length - 6 + i : i);
    setMonthOpen(true);
  };

  const mIdx = monthIdx;
  const monthDelta = mIdx > 0 ? curve[mIdx] - curve[mIdx - 1] : 0;

  return (
    <div className="page-dash-finances mx-auto max-w-[1500px]">
      {/* ================= HERO ================= */}
      <Reveal>
        <header className="fin-hero mb-6">
          <img src={HERO_IMG} alt="A chama savings group counting shillings under a mango tree" className="fin-hero__img" fetchPriority="high" />
          <div className="fin-hero__shade" />
          <div className="fin-hero__body grid grid-cols-[minmax(0,1fr)] gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
            <div className="min-w-0">
              <span className="gd-code">T-8 · Chamas, merry-go-round &amp; Sacco</span>
              <h1 className="ny-display mt-3 max-w-[20ch] text-[clamp(1.9rem,4.6vw,3.3rem)] leading-[1.02] text-on-brand">
                Money that goes round — and grows.
              </h1>
              <p className="mt-2.5 max-w-[58ch] text-sm leading-relaxed text-on-brand/85 sm:text-base">
                Chamas save together, a merry-go-round pays one member each round, and the family Sacco turns shares into
                loan access. One control room, every shilling reconciled.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-accent" onClick={() => ov.open("buy")}>
                  <Wallet className="h-4 w-4" /> Buy shares
                </button>
                <button type="button" className="ny-btn ny-btn-outline !border-on-brand/50 !text-on-brand hover:!bg-on-brand/10" onClick={() => ov.open("new", { t: "merry-go-round" })}>
                  <Plus className="h-4 w-4" /> Start a circle
                </button>
                <button type="button" className="ny-btn ny-btn-ghost !text-on-brand/90 hover:!bg-on-brand/10" onClick={() => setBulkOpen(true)}>
                  <RotateCw className="h-4 w-4" /> Bulk rotate
                </button>
              </div>
            </div>

            <div className="fin-glass p-4">
              <p className="ny-hud !text-on-brand/70">Sacco pool · live</p>
              <p className="ny-display mt-1 text-[clamp(1.6rem,3vw,2.2rem)] leading-none">
                <CountUp value={poolNow} prefix="KES " />
              </p>
              <p className="mt-1.5 text-xs text-on-brand/75">
                {fmt(issuedNow)} shares · {sacco.holders} holders · reserve {sacco.reservePct}%
              </p>
              {hero && (
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-on-brand/20 pt-3">
                  <span className="ny-hud !text-on-brand/75">
                    {hero.name.split(" ").slice(0, 2).join(" ")} · round {hero.round}/{hero.totalRounds}
                  </span>
                  <span className="ny-chip ny-chip-warn">
                    <Countdown key={`hero-${hero.round}`} seconds={hero.nextInSec} />
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>
      </Reveal>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[210px_minmax(0,1fr)]">
        {/* film-rail section index */}
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
          <section id="s1" className="mb-8 scroll-mt-24" aria-label="Finance KPIs">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
              <Reveal delay={0}>
                <KpiCard label="Sacco total pool" accent="var(--color-brand-primary)" hint={`${fmt(issuedNow)} shares · ${sacco.holders} holders`}>
                  <CountUp value={poolNow} prefix="KES " />
                </KpiCard>
              </Reveal>
              <Reveal delay={60}>
                <KpiCard label="Your shares" accent="var(--color-brand-accent)" hint={`${kesShort(owned * unit)} at ${kes(unit)} a share`}>
                  <span className="flex items-end justify-between gap-2">
                    <CountUp value={owned} />
                    <Spark values={curve} />
                  </span>
                </KpiCard>
              </Reveal>
              <Reveal delay={120}>
                <KpiCard label="Active chama rounds" accent="var(--color-brand-primary)" hint={`${mgrs.length} merry-go-round · ${list.length - mgrs.length} savings & investment`}>
                  <CountUp value={list.length} />
                </KpiCard>
              </Reveal>
              <Reveal delay={180}>
                <KpiCard label="Merry-go-round cycle" accent="var(--color-brand-accent)" hint={hero ? `${hero.name} · ${hero.nextLabel}` : "No active rounds"}>
                  <span className="text-[1.25rem]">{hero ? `Round ${hero.round} of ${hero.totalRounds}` : "—"}</span>
                </KpiCard>
              </Reveal>
              <Reveal delay={240}>
                <KpiCard label="Your loan-eligible amount" accent="var(--color-success)" hint={`${ruleset.multiplier}× your shares · nothing owed yet`}>
                  <CountUp value={eligible} prefix="KES " />
                </KpiCard>
              </Reveal>
              <Reveal delay={300}>
                <KpiCard label="This month's contributions" accent="var(--color-brand-secondary)" hint="shares + chamas · November 2025">
                  <CountUp value={monthNow} prefix="KES " />
                </KpiCard>
              </Reveal>
            </div>
          </section>

          {/* ================= S2 CHAMAS & ROUNDS ================= */}
          <section id="s2" className="mb-8 scroll-mt-24" aria-label="Chamas and merry-go-rounds">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Circles &amp; rounds</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Chamas and merry-go-rounds</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => { bump(); setJoinOpen(true); }}>
                  <Users className="h-3.5 w-3.5" /> Ask to join
                </button>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => ov.open("new", { t: "savings" })}>
                  <Plus className="h-3.5 w-3.5" /> New chama
                </button>
              </div>
            </div>

            <Tabs
              tabs={[
                { id: "all", label: "All circles" },
                { id: "merry-go-round", label: "Merry-go-round" },
                { id: "savings", label: "Savings" },
                { id: "investment", label: "Investment" },
              ]}
              active={typeTab}
              onChange={(id) => setTypeTab(id as "all" | ChamaType)}
            />

            <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2">
                {visibleChamas.map((c, i) => (
                  <ChamaCard
                    key={c.id}
                    c={c}
                    index={i}
                    flash={flashId === c.id}
                    onContribute={openContribute}
                    onDetails={(chama, tab) => ov.open("chama", { id: chama.id, t: tab })}
                    onRotate={openRotate}
                    onStatements={openStatements}
                  />
                ))}
                {visibleChamas.length === 0 && (
                  <div className="ny-inset col-span-full px-6 py-12 text-center">
                    <p className="ny-display text-lg">No {typeTab === "all" ? "" : typeLabel[typeTab as ChamaType].toLowerCase()} circles yet</p>
                    <p className="mx-auto mt-1.5 max-w-sm text-sm text-text-secondary">Start one — it takes six steps and an audit row.</p>
                    <button type="button" className="ny-btn ny-btn-accent ny-btn-sm mt-4" onClick={() => ov.open("new", { t: typeTab === "all" ? "savings" : typeTab })}>
                      <Plus className="h-3.5 w-3.5" /> Start a circle
                    </button>
                  </div>
                )}
              </div>

              <aside className="ny-card self-start p-4 sm:p-5 xl:sticky xl:top-28">
                <div className="flex items-center justify-between gap-2">
                  <p className="ny-hud">3D rotation</p>
                  <select aria-label="Choose a merry-go-round" className="ny-select !min-h-0 !w-auto !py-1 text-xs" value={activeMgr?.id ?? ""} onChange={(e) => setRingId(e.target.value)}>
                    {mgrs.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                {activeMgr ? (
                  <>
                    <h3 className="ny-display mt-1 text-lg leading-tight">{activeMgr.name}</h3>
                    <p className="ny-hud mt-1 !text-[0.56rem]">
                      {kes(activeMgr.contribution)} {cycleLabel[activeMgr.cycle].toLowerCase()} · {activeMgr.memberIds.length} seats
                    </p>
                    <MgrRing3D
                      people={activeMgr.orderIds.map((id) => personById(id)).filter((x): x is Person => !!x)}
                      currentIdx={activeMgr.recipientIdx}
                      paidIds={activeMgr.paidIds}
                    />
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div className="ny-inset px-3 py-2.5">
                        <p className="ny-hud !text-[0.5rem]">Pot this round</p>
                        <p className="ny-num font-semibold">{kes(activeMgr.pool)}</p>
                      </div>
                      <div className="ny-inset px-3 py-2.5">
                        <p className="ny-hud !text-[0.5rem]">Paid in</p>
                        <p className="ny-num font-semibold">
                          {activeMgr.paidIds.length} / {activeMgr.memberIds.length}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("chama", { id: activeMgr.id, t: "cycle" })}>
                        Cycle detail
                      </button>
                      <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => openReorder(activeMgr)}>
                        <Scale className="h-3.5 w-3.5" /> Reorder
                      </button>
                      <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => openRotate(activeMgr)}>
                        <RotateCw className="h-3.5 w-3.5" /> Rotate now
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-text-secondary">No merry-go-round yet.</p>
                )}
              </aside>
            </div>
          </section>

          {/* ================= S3 SACCO ENGINE ================= */}
          <section id="s3" className="mb-8 scroll-mt-24" aria-label="Sacco share engine">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Share engine</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Sacco: shares unlock loan access</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => setUnitOpen(true)}>
                  How the price moves
                </button>
                <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => ov.open("buy")}>
                  <Wallet className="h-3.5 w-3.5" /> Buy shares
                </button>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12">
              <Reveal className="lg:col-span-5">
                <div className="perspective-[1200px]">
                  <div className="fin-vault">
                    <img src={sacco.image} alt="A Sacco counter with share certificates and shilling notes" className="fin-vault__img h-[290px] sm:h-[320px]" loading="lazy" decoding="async" />
                    <div className="fin-shade" />
                    <div className="fin-glass absolute inset-x-3 bottom-3 grid grid-cols-3 gap-3 p-3.5">
                      <div>
                        <p className="ny-hud !text-[0.5rem] !text-on-brand/70">Unit value</p>
                        <p className="ny-num text-sm font-semibold">{kes(unit)}</p>
                        <p className="ny-hud !text-[0.5rem] !text-on-brand/70">+{sacco.unitDeltaPct}% this month</p>
                      </div>
                      <div>
                        <p className="ny-hud !text-[0.5rem] !text-on-brand/70">Shares issued</p>
                        <p className="ny-num text-sm font-semibold">{fmt(issuedNow)}</p>
                      </div>
                      <div>
                        <p className="ny-hud !text-[0.5rem] !text-on-brand/70">Reserve kept</p>
                        <p className="ny-num text-sm font-semibold">{sacco.reservePct}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal className="lg:col-span-4" delay={70}>
                <div className="space-y-3">
                  <ShareCertificate3D
                    holder={nameOf(ME_ID)}
                    shares={owned}
                    value={owned * unit}
                    contributed={sacco.myContributed}
                    reference={`${sacco.ref} · your member certificate`}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => { bump(); setDivHistOpen(true); }}>
                      Dividend history
                    </button>
                    <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => { bump(); setEligOpen(true); }}>
                      Borrowing breakdown
                    </button>
                  </div>
                </div>
              </Reveal>

              <Reveal className="lg:col-span-3" delay={120}>
                <div className="ny-card flex h-full flex-col gap-3 p-4">
                  <p className="ny-hud">Loan eligibility</p>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    With <strong className="text-text-primary">{owned} shares</strong> you can borrow up to
                  </p>
                  <p className="ny-num ny-display text-[1.7rem] leading-none">
                    <CountUp value={eligible} prefix="KES " />
                  </p>
                  <Meter value={eligible} max={1_000_000} />
                  <p className="ny-hud !text-[0.55rem]">{ruleset.multiplier}× shares · product cap KES 1,000,000</p>
                  <Link href={`/dashboard/loans?amount=${eligible}&src=sacco&shares=${owned}`} className="ny-btn ny-btn-accent ny-btn-sm mt-auto">
                    Apply on loans (T-10) <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <div className="ny-inset flex items-center justify-between gap-3 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold">Monthly auto-debit</p>
                      <p className="ny-hud !text-[0.52rem]">
                        {kes(auto.amount)} · day {auto.day} · {channelMeta[auto.channel].label}
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={auto.enabled}
                      aria-label="Monthly auto-debit"
                      className="fin-switch"
                      onClick={() => {
                        bump();
                        setAutoOpen(true);
                      }}
                    />
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12">
              <Reveal className="lg:col-span-8">
                <div className="ny-card p-4 sm:p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="ny-hud">Your shares over time</p>
                      <h3 className="ny-display text-lg">Share curve · tap a month</h3>
                    </div>
                    <Tabs
                      tabs={[
                        { id: "6m", label: "6 months" },
                        { id: "12m", label: "12 months" },
                      ]}
                      active={curveRange}
                      onChange={setCurveRange}
                    />
                  </div>
                  <ShareCurve values={curveVals} labels={curveLabels} onPick={pickMonth} />
                </div>
              </Reveal>
              <Reveal className="lg:col-span-4" delay={80}>
                <div className="ny-card h-full p-4 sm:p-5">
                  <p className="ny-hud">Dividends</p>
                  <h3 className="ny-display text-lg">Pro-rata to shares held</h3>
                  <ul className="mt-3 space-y-2">
                    {dividends.slice(-3).map((d) => (
                      <li key={d.year} className="ny-inset flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                        <span>
                          <span className="block font-semibold">{d.year}</span>
                          <span className="ny-hud !text-[0.52rem]">{kes(d.perShare)} / share</span>
                        </span>
                        <span className="ny-num font-semibold">{kes(d.yourTotal)}</span>
                      </li>
                    ))}
                  </ul>
                  {declared !== null && (
                    <p className="ny-chip ny-chip-ok mt-3 fin-flash-posted">2025 declared at {kes(declared)} / share (SIMULATED)</p>
                  )}
                  <button type="button" className="ny-btn ny-btn-primary ny-btn-sm mt-4 w-full" onClick={() => ov.open("dividend")}>
                    <Landmark className="h-3.5 w-3.5" /> Declare dividend (family head)
                  </button>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ================= S4 TRANSACTIONS ================= */}
          <section id="s4" className="mb-8 scroll-mt-24" aria-label="Transactions">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Every movement</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Shares, chamas and rounds</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="ny-hud">
                  {filteredTx.length} of {txs.length} rows
                </span>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("filters")}>
                  <Filter className="h-3.5 w-3.5" /> Filters
                  {txActive > 0 && <span className="ny-chip ny-chip-brand !px-1.5">{txActive}</span>}
                </button>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => openExport("All transactions")}>
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
              </div>
            </div>

            <Tabs tabs={txTabs} active={txTab} onChange={(id) => setTxTab(id as "all" | TxKind)} />

            <div className="cc-table-wrap ny-scroll mt-3 overflow-x-auto">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Member</th>
                    <th>Group</th>
                    <th className="text-right">Amount</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Ledger</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => {
                        bump();
                        setTxFor(t);
                        setTxOpen(true);
                      }}
                    >
                      <td data-label="Date" className="ny-num whitespace-nowrap text-text-secondary">{t.at}</td>
                      <td data-label="Type">
                        <span className={`ny-chip ${txTypeChip[t.type].cls}`}>{txTypeChip[t.type].label}</span>
                      </td>
                      <td data-label="Member" className="font-semibold">{t.who}</td>
                      <td data-label="Group" className="max-w-[240px] truncate text-text-secondary">{t.group}</td>
                      <td data-label="Amount" className="ny-num text-right font-semibold">{kes(t.amount)}</td>
                      <td data-label="Channel">
                        <span className="ny-chip ny-chip-neutral">{channelMeta[t.channel].label}</span>
                      </td>
                      <td data-label="Status">
                        <span className={`ny-chip ${statusChip[t.status]}`}>{t.status}</span>
                      </td>
                      <td data-label="Ledger" className="ny-hud !text-[0.6rem]">{t.ledger}</td>
                    </tr>
                  ))}
                  {filteredTx.length === 0 && (
                    <tr>
                      <td colSpan={8} className="!py-10 text-center">
                        <p className="ny-display text-base">Nothing matches these filters</p>
                        <p className="mt-1 text-sm text-text-secondary">Clear them and the full ledger comes back.</p>
                        <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-3" onClick={() => { setTxFilter(emptyTx); setTxTab("all"); }}>
                          Clear filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="ny-hud mt-2">Tap any row for its double-entry view · statuses: confirmed · pending · scheduled · failed</p>
          </section>

          {/* ================= S5 CHAMA DRAWER LAUNCHER ================= */}
          <section id="s5" className="mb-8 scroll-mt-24" aria-label="Chama detail drawer">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Chama drawer</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">One circle, every detail</h2>
              </div>
              <p className="ny-hud max-w-[46ch] text-right">Six tabs · overview, members, cycle, payouts, statements, audit</p>
            </div>

            {spot && (
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12">
                <Reveal className="lg:col-span-5">
                  <div className="ny-card overflow-hidden">
                    <div className="relative h-52">
                      <img src={spot.image} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                      <div className="fin-shade" />
                      <div className="absolute inset-x-3 bottom-3">
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`ny-chip ${typeTone[spot.type]}`}>{typeLabel[spot.type]}</span>
                          <span className="ny-chip ny-chip-neutral">{spot.branch}</span>
                        </div>
                        <p className="ny-display mt-2 text-lg leading-tight text-on-brand">{spot.name}</p>
                      </div>
                    </div>
                    <div className="space-y-3 p-4">
                      <p className="text-sm leading-relaxed text-text-secondary">{spot.blurb}</p>
                      <Meter value={spot.pool} max={spot.target} gold={pct(spot.pool, spot.target) >= 100} />
                      <p className="ny-num text-sm font-semibold">
                        {kes(spot.pool)} <span className="font-normal text-text-tertiary">of {kes(spot.target)}</span>
                      </p>
                      <button type="button" className="ny-btn ny-btn-primary w-full" onClick={() => ov.open("chama", { id: spot.id, t: "overview" })}>
                        Open the full drawer <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </Reveal>

                <Reveal className="lg:col-span-7" delay={70}>
                  <div className="ny-card h-full p-4 sm:p-5">
                    <p className="ny-hud">Pick a circle</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {list.map((c) => (
                        <button key={c.id} type="button" onClick={() => setSpotId(c.id)} className={`ny-chip ny-touch transition ${spot.id === c.id ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"}`}>
                          {c.name}
                        </button>
                      ))}
                    </div>

                    {spot.type === "merry-go-round" ? (
                      <div className="mt-4">
                        <p className="ny-hud mb-2">Rotation · who receives when</p>
                        <div className="fin-track">
                          {spot.orderIds.map((id, i) => (
                            <div key={`${id}-${i}`} className={`fin-track__seat ${i < spot.recipientIdx ? "is-done" : ""} ${i === spot.recipientIdx ? "is-current" : ""}`}>
                              <p className="ny-hud !text-[0.5rem]">Round {i + 1}</p>
                              <p className="mt-1 truncate text-xs font-semibold">{nameOf(id).split(" ")[0]}</p>
                              <p className="ny-hud mt-1 !text-[0.46rem]">{spot.payoutLabels[i] ?? ""}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="ny-inset mt-4 px-4 py-4 text-sm text-text-secondary">
                        {typeLabel[spot.type]} holds its pool until <strong className="text-text-primary">{spot.targetLabel.toLowerCase()}</strong>. {spot.nextLabel}.
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("chama", { id: spot.id, t: "members" })}>
                        <Users className="h-3.5 w-3.5" /> Members
                      </button>
                      <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("chama", { id: spot.id, t: "payouts" })}>
                        Payouts
                      </button>
                      <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => openStatements(spot)}>
                        Statements
                      </button>
                      <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => ov.open("chama", { id: spot.id, t: "audit" })}>
                        Audit
                      </button>
                    </div>
                  </div>
                </Reveal>
              </div>
            )}
          </section>

          {/* ================= S6 CREATE PRODUCT ================= */}
          <section id="s6" className="mb-8 scroll-mt-24" aria-label="Create a product">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Products</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Start a circle or a Sacco product</h2>
              </div>
              <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => ov.open("new", { t: "merry-go-round" })}>
                <Plus className="h-3.5 w-3.5" /> Start the wizard
              </button>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {productTypes.map((t, i) => {
                const icons = { "merry-go-round": RotateCw, savings: Wallet, investment: Sparkles, sacco: Landmark } as const;
                const Icon = icons[t.id];
                return (
                  <Reveal key={t.id} delay={i * 60} className="h-full">
                    <button type="button" className="fin-type h-full w-full" onClick={() => ov.open("new", { t: t.id })}>
                      <span className="grid grid-cols-[minmax(0,1fr)] h-9 w-9 place-items-center rounded-lg border border-border-subtle bg-surface-2">
                        <Icon className="h-4 w-4 text-brand-primary" />
                      </span>
                      <span className="ny-display mt-3 block text-base">{t.label}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-text-secondary">{t.blurb}</span>
                      <span className="ny-hud mt-3 inline-flex items-center gap-1 !text-brand-accent">
                        Start <ArrowRight className="h-3 w-3" />
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
            <div className="ny-inset mt-3 flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <p className="text-sm text-text-secondary">Six steps: type, money, members, rules, rotation order and review. Saved with 2FA and an audit row.</p>
              <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => { bump(); setBulkOpen(true); }}>
                <RotateCw className="h-3.5 w-3.5" /> Bulk rotate
              </button>
            </div>
          </section>

          {/* ================= S7 GOVERNANCE & AUDIT ================= */}
          <section id="s7" className="mb-8 scroll-mt-24" aria-label="Governance and audit">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Governance</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Rules, approvals and the audit trail</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("governance")}>
                  Governance drawer
                </button>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => { bump(); setRulesOpen(true); }}>
                  <Scale className="h-3.5 w-3.5" /> Edit rules (2FA)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {[
                { k: "Late penalty", v: kes(ruleset.penalty) },
                { k: "Grace period", v: `${ruleset.graceDays} days` },
                { k: "Skip policy", v: ruleset.skip === "none" ? "No skips" : ruleset.skip === "once-a-year" ? "One a year" : "Admin approval" },
                { k: "Loan multiplier", v: `${ruleset.multiplier}× shares` },
                { k: "Reserve kept", v: `${ruleset.reservePct}%` },
                { k: "Dividend month", v: ruleset.dividendMonth },
              ].map((r) => (
                <div key={r.k} className="gd-kpi">
                  <p className="ny-hud">{r.k}</p>
                  <p className="ny-display mt-1.5 text-lg leading-none">{r.v}</p>
                </div>
              ))}
            </div>

            <div className="cc-table-wrap mt-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle px-4 py-3">
                <p className="ny-hud">Append-only · latest {Math.min(8, audit.length)}</p>
                <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => openExport("Audit trail")}>
                  <Download className="h-3.5 w-3.5" /> Export audit
                </button>
              </div>
              <ul>
                {audit.slice(0, 8).map((a) => (
                  <li key={a.ref}>
                    <button
                      type="button"
                      className="cc-audit-row w-full text-left"
                      onClick={() => {
                        bump();
                        setAuditFor(a);
                        setAuditOpen(true);
                      }}
                    >
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
          </section>

          {/* ================= FOOTER ================= */}
          <Reveal>
            <footer className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Frontend-only Phase 1.</strong> Every rail below renders fully and resolves honestly.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["M-Pesa standing order", "STK prompts", "Bank EFT", "SMS reminders", "WhatsApp notices", "Dividend payouts"].map((r) => (
                    <span key={r} className="ny-chip ny-chip-sim">{r}</span>
                  ))}
                </div>
              </div>
            </footer>
          </Reveal>
        </div>
      </div>

      {/* ================= URL-DRIVEN OVERLAYS ================= */}
      <ChamaDrawer
        key={`${ov.id ?? "none"}-${ov.nonce ?? "0"}`}
        chama={ovChama}
        open={ov.key === "chama"}
        onClose={ov.close}
        initialTab={ov.t ?? "overview"}
        audit={audit}
        onContribute={openContribute}
        onRotate={openRotate}
        onStatements={openStatements}
        onReorder={openReorder}
        onWaive={openWaive}
        onExport={(c) => openExport(`${c.name} statement`)}
      />

      <BuySharesWizard
        key={`buy-${ov.nonce ?? "0"}`}
        open={ov.key === "buy"}
        onClose={ov.close}
        unitValue={unit}
        owned={owned}
        multiplier={ruleset.multiplier}
        onDone={buyShares}
      />

      <CreateProductWizard
        key={`new-${ov.nonce ?? "0"}`}
        open={ov.key === "new"}
        onClose={ov.close}
        preType={newType}
        nextRef={nextRef}
        onSave={createProduct}
      />

      <DividendDrawer key={`div-${ov.nonce ?? "0"}`} open={ov.key === "dividend"} onClose={ov.close} shares={owned} onDeclare={declare} />

      <GovernanceDrawer
        open={ov.key === "governance"}
        onClose={ov.close}
        rules={ruleset}
        audit={audit}
        onEdit={() => {
          bump();
          setRulesOpen(true);
        }}
        onExport={() => openExport("Audit trail")}
        onOpenAudit={(a) => {
          bump();
          setAuditFor(a);
          setAuditOpen(true);
        }}
      />

      <TxFiltersDrawer open={ov.key === "filters"} onClose={ov.close} value={txFilter} onChange={setTxFilter} groups={groups} />

      {/* ================= LOCAL MODALS ================= */}
      <ContributeChamaModal key={`c-${session}`} open={contribOpen} onClose={() => setContribOpen(false)} chama={contribFor} onPosted={postContribution} />

      <RotateNowModal
        key={`r-${session}`}
        open={rotateOpen}
        onClose={() => setRotateOpen(false)}
        chama={rotateFor}
        onConfirm={(reason) => {
          if (rotateFor) rotateMany([rotateFor.id], `admin: ${reason}`);
        }}
      />

      <BulkRotateModal
        key={`b-${session}`}
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        chamas={mgrs}
        onConfirm={(ids) => rotateMany(ids, "bulk round")}
      />

      <StatementsModal
        key={`s-${session}`}
        open={stmtOpen}
        onClose={() => setStmtOpen(false)}
        chama={stmtFor}
        onExport={() => openExport(`${stmtFor?.name ?? "Chama"} statement`)}
      />

      <ExportModal key={`e-${session}`} open={exportOpen} onClose={() => setExportOpen(false)} onQueue={exportQueue} scope={exportScope} />

      <EligibilityModal
        key={`el-${session}`}
        open={eligOpen}
        onClose={() => setEligOpen(false)}
        shares={owned}
        unitValue={unit}
        multiplier={ruleset.multiplier}
      />

      <DividendHistoryModal key={`dh-${session}`} open={divHistOpen} onClose={() => setDivHistOpen(false)} shares={owned} />

      <ShareReceiptModal open={receiptOpen} onClose={() => setReceiptOpen(false)} receipt={receipt} />

      <AutoDebitModal key={`ad-${session}`} open={autoOpen} onClose={() => setAutoOpen(false)} auto={auto} unitValue={unit} onSave={saveAuto} />

      <JoinChamaModal key={`j-${session}`} open={joinOpen} onClose={() => setJoinOpen(false)} chamas={list} onRequest={joinRequest} />

      <ShareUnitModal open={unitOpen} onClose={() => setUnitOpen(false)} unitValue={unit} history={sacco.unitHistory} months={sacco.months} />

      <ShareMonthModal
        open={monthOpen}
        onClose={() => setMonthOpen(false)}
        label={sacco.months[mIdx] ?? ""}
        shares={curve[mIdx] ?? owned}
        unit={sacco.unitHistory[mIdx] ?? unit}
        delta={monthDelta}
      />

      <ReorderCycleModal
        key={`ro-${session}`}
        open={reorderOpen}
        onClose={() => setReorderOpen(false)}
        chama={reorderFor}
        onSave={(order) => {
          if (reorderFor) saveOrder(reorderFor.id, order);
        }}
      />

      <PenaltyWaiveModal
        key={`w-${session}`}
        open={waiveOpen}
        onClose={() => setWaiveOpen(false)}
        chama={waiveFor?.chama ?? null}
        personId={waiveFor?.personId ?? ""}
        onConfirm={(reason) => {
          if (waiveFor) waive(waiveFor.chama, waiveFor.personId, reason);
        }}
      />

      <EditRulesModal key={`rl-${session}`} open={rulesOpen} onClose={() => setRulesOpen(false)} rules={ruleset} onSave={saveRules} />

      <TransactionDetailModal open={txOpen} onClose={() => setTxOpen(false)} tx={txFor} />

      <AuditDetailModal open={auditOpen} onClose={() => setAuditOpen(false)} entry={auditFor} />
    </div>
  );
}
