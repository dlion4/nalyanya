"use client";

import { useState } from "react";
import { ArrowRight, Check, Download, Megaphone, Receipt as ReceiptIcon, RotateCcw, Scale, ShieldCheck, Trash2, UserRound, Wallet, X } from "lucide-react";
import { Drawer } from "@/components/ui/overlay";
import { Ring, Tabs } from "@/components/ui/primitives";
import { fmt, kes, kesShort } from "@/lib/format";
import {
  AS_OF,
  activeStatuses,
  fmtDate,
  nameOf,
  pendingStatuses,
  policyLabels,
  productOf,
  products,
  statusMeta,
  type AuditEntry,
  type Policy,
  type ProductId,
  type Repayment,
  type Row,
  type Status,
  type LoanView,
} from "@/data/dashboard/loans";
import { AmortChart, channelMeta } from "./charts";

const LOAN_TABS = [
  { id: "summary", label: "Summary" },
  { id: "schedule", label: "Amortization" },
  { id: "repayments", label: "Repayments" },
  { id: "guarantors", label: "Guarantors" },
  { id: "comms", label: "Comms" },
  { id: "audit", label: "Audit" },
];

/* ------------------------------------------------------------------ */
/* D1 — Loan detail drawer (six tabs, deep-linked ?o=loan&id=…&t=…)      */
/* ------------------------------------------------------------------ */
export function LoanDrawer({
  open,
  onClose,
  view,
  initialTab,
  reps,
  audit,
  onPay,
  onRestructure,
  onApprove,
  onCancel,
  onBroadcast,
  onCallUp,
  onWriteOff,
  onStatement,
  onRow,
  onAuditOpen,
}: {
  open: boolean;
  onClose: () => void;
  view: LoanView | null;
  initialTab: string;
  reps: Repayment[];
  audit: AuditEntry[];
  onPay: (v: LoanView) => void;
  onRestructure: (v: LoanView) => void;
  onApprove: (v: LoanView) => void;
  onCancel: (v: LoanView) => void;
  onBroadcast: (v: LoanView) => void;
  onCallUp: (v: LoanView) => void;
  onWriteOff: (v: LoanView) => void;
  onStatement: (v: LoanView) => void;
  onRow: (row: Row, paid: boolean, v: LoanView) => void;
  onAuditOpen: (e: AuditEntry) => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const [pickRow, setPickRow] = useState<number | null>(null);
  const v = view;
  const p = v ? productOf(v.loan.product) : null;
  const meta = v ? statusMeta[v.status] : null;
  const isPending = v ? pendingStatuses.includes(v.status) : false;
  const isActive = v ? activeStatuses.includes(v.status) : false;
  const isOverdue = v?.status === "overdue";
  const history = v ? reps.filter((r) => r.loanId === v.loan.id).sort((a, b) => (a.date < b.date ? 1 : -1)) : [];
  const trail = v ? audit.filter((e) => e.entity === v.loan.ref) : [];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={v && p ? p.name : "Loan"}
      sub={v ? `${v.loan.ref} · ${v.loan.borrowers.map((b) => nameOf(b).split(" ")[0]).join(" + ")} · ${v.loan.branch}` : ""}
      width="max-w-[640px]"
      footer={
        v && (
          <>
            {isPending && (
              <>
                <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onCancel(v)}>
                  <X className="h-3.5 w-3.5" /> Cancel application
                </button>
                <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => onApprove(v)}>
                  <ShieldCheck className="h-3.5 w-3.5" /> Review decision
                </button>
              </>
            )}
            {isActive && (
              <>
                {v.loan.freq === "monthly" && (
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onRestructure(v)}>
                    <RotateCcw className="h-3.5 w-3.5" /> Restructure
                  </button>
                )}
                <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => onPay(v)}>
                  <Wallet className="h-3.5 w-3.5" /> Make a payment
                </button>
              </>
            )}
            {isOverdue && (
              <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onCallUp(v)}>
                <UserRound className="h-3.5 w-3.5" /> Call up guarantor
              </button>
            )}
            {!isPending && (
              <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onStatement(v)}>
                <Download className="h-3.5 w-3.5" /> Statement
              </button>
            )}
          </>
        )
      }
    >
      {v && p && meta && (
        <>
          <Tabs tabs={LOAN_TABS} active={tab} onChange={setTab} />
          <div className="pt-4">
            {tab === "summary" && (
              <div className="space-y-4">
                <div className="ny-inset flex items-center gap-4 px-4 py-3.5">
                  <Ring pct={v.pct} size={76} stroke={7} gold={v.pct >= 100} label={`${v.pct}%`} />
                  <div className="min-w-0">
                    <p className="ny-hud">Status</p>
                    <p className="ny-display mt-0.5 text-lg leading-tight">{meta.label}</p>
                    <p className="mt-1 text-sm text-text-secondary">{meta.hint}</p>
                    <span className={`ny-chip mt-2 ${meta.tone} ${isOverdue ? "ny-pulse" : ""}`}>{v.status}</span>
                  </div>
                </div>

                {isOverdue && (
                  <div className="rounded-xl border border-dashed border-[rgba(198,40,40,0.5)] bg-[rgba(198,40,40,0.06)] px-4 py-3">
                    <p className="text-sm font-semibold text-danger">
                      {v.daysLate} days late · {kes(v.overdueAmt)} overdue
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                      {v.penalty > 0
                        ? `Penalty ${kes(v.penalty)} has started after the grace period.`
                        : "Still inside the grace period — no penalty yet."}
                    </p>
                  </div>
                )}

                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["Amount borrowed", kes(v.loan.amount)],
                    ["Interest", `${p.rate}% · ${v.loan.method === "flat" ? "flat" : "reducing"}`],
                    ["Term", v.loan.freq === "single" ? "One payday" : `${v.loan.termMonths} months`],
                    ["Each instalment", kes(v.instalment)],
                    ["Total repayable", kes(v.total)],
                    ["Paid so far", kes(v.loan.paid)],
                    ["Left to repay", kes(v.outstanding)],
                    ["Principal left", kes(v.principalLeft)],
                    ["Next due", v.next ? fmtDate(v.next.due) : "—"],
                    ["Paid to", v.loan.destination],
                    ["Channel", channelMeta[v.loan.channel].label],
                    ["Applied", fmtDate(v.loan.applied)],
                  ].map(([k, val]) => (
                    <div key={k} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                      <dt className="ny-hud">{k}</dt>
                      <dd className="ny-num mt-1 font-medium text-text-primary">{val}</dd>
                    </div>
                  ))}
                </dl>

                {v.loan.school && (
                  <div className="ny-inset px-3.5 py-3 text-sm">
                    <p className="ny-hud">Paid direct to school</p>
                    <p className="mt-1 font-semibold">{v.loan.school.name}</p>
                    <p className="ny-num text-text-secondary">{v.loan.school.paybill}</p>
                  </div>
                )}
                {v.loan.collateral && (
                  <div className="ny-inset px-3.5 py-3 text-sm">
                    <p className="ny-hud">Collateral · {kes(v.loan.collateral.value)}</p>
                    <p className="mt-1">{v.loan.collateral.desc}</p>
                  </div>
                )}
                {v.loan.restructures > 0 && (
                  <p className="ny-chip ny-chip-warn">Restructured {v.loan.restructures}× · {kes(v.loan.priorPaid)} paid before the restructure</p>
                )}
                <p className="text-sm leading-relaxed text-text-secondary">{v.loan.note}</p>
              </div>
            )}

            {tab === "schedule" && (
              <div className="space-y-4">
                <AmortChart rows={v.rows} amount={v.loan.amount} height={170} active={pickRow} onPick={(i) => {
                  setPickRow(i);
                  onRow(v.rows[i], i < v.k, v);
                }} />
                <div className="cc-table-wrap ny-scroll max-h-[46vh] overflow-auto">
                  <table className="cc-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Due</th>
                        <th className="text-right">Principal</th>
                        <th className="text-right">Interest</th>
                        <th className="text-right">Instalment</th>
                        <th className="text-right">Balance</th>
                        <th>State</th>
                      </tr>
                    </thead>
                    <tbody>
                      {v.rows.map((r, i) => {
                        const paid = i < v.k;
                        return (
                          <tr key={r.no} onClick={() => onRow(r, paid, v)}>
                            <td data-label="No.">{r.no}</td>
                            <td data-label="Due" className="ny-num whitespace-nowrap">{fmtDate(r.due)}</td>
                            <td data-label="Principal" className="ny-num text-right">{fmt(r.principal)}</td>
                            <td data-label="Interest" className="ny-num text-right">{fmt(r.interest)}</td>
                            <td data-label="Instalment" className="ny-num text-right font-semibold">{fmt(r.instalment)}</td>
                            <td data-label="Balance" className="ny-num text-right">{fmt(r.balance)}</td>
                            <td data-label="State">
                              <span className={`ny-chip ${paid ? "ny-chip-ok" : r.due <= AS_OF ? "ny-chip-danger" : "ny-chip-neutral"}`}>
                                {paid ? "paid" : r.due <= AS_OF ? "due" : "upcoming"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="ny-hud">Tap a bar or a row for that instalment · the last row absorbs rounding</p>
              </div>
            )}

            {tab === "repayments" && (
              <div className="space-y-2">
                {history.length === 0 && (
                  <div className="ny-inset px-4 py-8 text-center">
                    <p className="ny-display text-base">No repayments yet</p>
                    <p className="mt-1 text-sm text-text-secondary">The first instalment will appear here the moment it is paid.</p>
                  </div>
                )}
                {history.map((r) => (
                  <div key={r.ref} className="gd-section-item">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">Instalment {r.no} · {channelMeta[r.channel].label}</span>
                      <span className="ny-hud block !text-[0.55rem]">{r.ref} · {fmtDate(r.date)} · {r.ledger}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <span className="ny-num text-sm font-semibold">{kes(r.amount)}</span>
                      <span className={`ny-chip ${r.status === "confirmed" ? "ny-chip-ok" : "ny-chip-warn"}`}>{r.status}</span>
                    </span>
                  </div>
                ))}
                {isActive && (
                  <button type="button" className="ny-btn ny-btn-primary ny-btn-sm mt-2 w-full" onClick={() => onPay(v)}>
                    <Wallet className="h-3.5 w-3.5" /> Make a payment
                  </button>
                )}
              </div>
            )}

            {tab === "guarantors" && (
              <div className="space-y-3">
                {v.loan.guarantors.length === 0 && (
                  <div className="ny-inset px-4 py-6 text-center text-sm text-text-secondary">
                    No guarantors on this loan.{" "}
                    {v.loan.collateral ? "It is secured by collateral instead." : "It is secured by shares or salary."}
                  </div>
                )}
                {v.loan.guarantors.map((g) => (
                  <div key={g.id} className="rounded-lg border border-border-subtle bg-surface-1 px-3.5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{nameOf(g.id)}</p>
                      <span className={`ny-chip ${v.status === "settled" ? "ny-chip-ok" : "ny-chip-brand"}`}>
                        {v.status === "settled" ? "released" : "pledged"}
                      </span>
                    </div>
                    <p className="ny-num mt-1 text-sm text-text-secondary">{fmt(g.shares)} shares · counts toward this loan</p>
                    {isOverdue && (
                      <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-2" onClick={() => onCallUp(v)}>
                        Call up
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === "comms" && (
              <div className="space-y-3">
                <div className="ny-inset px-4 py-3.5">
                  <p className="text-sm font-semibold">Talk to the borrower and guarantors</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Reminders, thank-yous and call-ups go out on WhatsApp, SMS or email, with delivery receipts.
                  </p>
                  <button type="button" className="ny-btn ny-btn-primary ny-btn-sm mt-3" onClick={() => onBroadcast(v)}>
                    <Megaphone className="h-3.5 w-3.5" /> Compose message
                  </button>
                </div>
                <p className="ny-chip ny-chip-sim">Fanout SIMULATED · the broadcast centre (T-14) connects in Phase 2</p>
              </div>
            )}

            {tab === "audit" && (
              <div className="space-y-1.5">
                {trail.length === 0 && (
                  <div className="ny-inset px-4 py-8 text-center text-sm text-text-secondary">
                    Nothing logged for this loan yet. Every application, approval, payment and change lands here.
                  </div>
                )}
                {trail.map((e) => (
                  <button key={e.ref} type="button" className="cc-audit-row w-full rounded-lg border border-border-subtle text-left" onClick={() => onAuditOpen(e)}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.tone === "gold" ? "bg-brand-accent" : e.tone === "red" ? "bg-danger" : "bg-text-tertiary"}`} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{e.action}</span>
                      <span className="block text-xs text-text-secondary">{e.detail}</span>
                      <span className="ny-hud mt-1 block !text-[0.55rem]">{e.at} · {e.actor}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* D2 — Table filters                                                   */
/* ------------------------------------------------------------------ */
export type LnFilters = { q: string; product: ProductId | "all"; status: Status | "all" };
export const emptyLnFilters: LnFilters = { q: "", product: "all", status: "all" };

export function FiltersDrawer({ open, onClose, value, onChange }: { open: boolean; onClose: () => void; value: LnFilters; onChange: (f: LnFilters) => void }) {
  const set = <K extends keyof LnFilters>(k: K, v: LnFilters[K]) => onChange({ ...value, [k]: v });
  const active = (value.q ? 1 : 0) + (value.product !== "all" ? 1 : 0) + (value.status !== "all" ? 1 : 0);
  const chip = (on: boolean) => `ny-chip ny-touch ${on ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`;
  const statuses: (Status | "all")[] = ["all", "under-review", "approved", "disbursed", "repaying", "overdue", "restructured", "settled", "declined", "written-off"];
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter loans"
      sub={`${active} filter${active === 1 ? "" : "s"} active`}
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onChange(emptyLnFilters)}>
            <X className="h-3.5 w-3.5" /> Clear all
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
            Show results
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="ny-label" htmlFor="lf-q">Search borrower, ref or purpose</label>
          <input id="lf-q" className="ny-input" value={value.q} onChange={(e) => set("q", e.target.value)} placeholder="Dennis, NY-LON, school fees…" />
        </div>
        <div>
          <span className="ny-label">Product</span>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={chip(value.product === "all")} onClick={() => set("product", "all")}>any</button>
            {products.map((p) => (
              <button key={p.id} type="button" className={chip(value.product === p.id)} onClick={() => set("product", p.id)}>
                {p.chip}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="ny-label">Status</span>
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((s) => (
              <button key={s} type="button" className={chip(value.status === s)} onClick={() => set("status", s)}>
                {s === "all" ? "any" : statusMeta[s].label}
              </button>
            ))}
          </div>
        </div>
        <div className="ny-inset flex items-start gap-2.5 px-3.5 py-3">
          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
          <p className="text-xs leading-relaxed text-text-secondary">Filters apply to the table instantly. The loan you open stays deep-linked, so back closes it first.</p>
        </div>
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* D3 — Loan policy editor (admin, changes need 2FA via a confirm step)   */
/* ------------------------------------------------------------------ */
export function PolicyDrawer({
  open,
  onClose,
  rules,
  enabled,
  onReview,
}: {
  open: boolean;
  onClose: () => void;
  rules: Policy;
  enabled: Record<ProductId, boolean>;
  onReview: (rules: Policy, enabled: Record<ProductId, boolean>, changes: string[]) => void;
}) {
  const [draft, setDraft] = useState<Policy>(rules);
  const [flags, setFlags] = useState<Record<ProductId, boolean>>(enabled);
  const keys = Object.keys(rules) as (keyof Policy)[];
  const changes = [
    ...keys.filter((k) => draft[k] !== rules[k]).map((k) => `${policyLabels[k]}: ${fmt(rules[k])} → ${fmt(draft[k])}`),
    ...products.filter((p) => flags[p.id] !== enabled[p.id]).map((p) => `${p.name}: ${enabled[p.id] ? "on" : "off"} → ${flags[p.id] ? "on" : "off"}`),
  ];
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Loan policy"
      sub="Family-wide rules · every change is 2FA-checked and audited"
      width="max-w-[600px]"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => { setDraft(rules); setFlags(enabled); }}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={changes.length === 0} onClick={() => onReview(draft, flags, changes)}>
            <Scale className="h-3.5 w-3.5" /> Review {changes.length || ""} change{changes.length === 1 ? "" : "s"}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {keys.map((k) => (
            <div key={k}>
              <label className="ny-label" htmlFor={`pol-${k}`}>{policyLabels[k]}</label>
              <input
                id={`pol-${k}`}
                inputMode="numeric"
                className={`ny-input ny-num ${draft[k] !== rules[k] ? "!border-brand-accent" : ""}`}
                value={draft[k]}
                onChange={(e) => setDraft({ ...draft, [k]: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 })}
              />
            </div>
          ))}
        </div>

        <div>
          <p className="ny-hud mb-2">Products on the shelf</p>
          <ul className="space-y-1.5">
            {products.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{p.name}</span>
                  <span className="ny-hud block !text-[0.5rem]">{p.rate}% · {p.termMin}–{p.termMax} months</span>
                </span>
                <button type="button" role="switch" aria-checked={flags[p.id]} aria-label={`Offer ${p.name}`} className="ln-switch" onClick={() => setFlags({ ...flags, [p.id]: !flags[p.id] })} />
              </li>
            ))}
          </ul>
        </div>

        <div className="ny-inset px-3.5 py-3 text-xs leading-relaxed text-text-secondary">
          Raising the multiplier or the penalty affects every new application. Existing loans keep the terms they were signed on.
        </div>
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* D4 — Portfolio health: the book ranked by risk, with actions          */
/* ------------------------------------------------------------------ */
export function PortfolioDrawer({
  open,
  onClose,
  views,
  onPay,
  onCallUp,
  onRestructure,
  onWriteOff,
}: {
  open: boolean;
  onClose: () => void;
  views: LoanView[];
  onPay: (v: LoanView) => void;
  onCallUp: (v: LoanView) => void;
  onRestructure: (v: LoanView) => void;
  onWriteOff: (v: LoanView) => void;
}) {
  const sorted = [...views].sort((a, b) => (b.daysLate - a.daysLate) || (b.outstanding - a.outstanding));
  const exposure = views.reduce((s, v) => s + v.outstanding, 0);
  const atRisk = views.filter((v) => v.status === "overdue").reduce((s, v) => s + v.outstanding, 0);
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Portfolio health"
      sub={`${views.length} live loans · ${kesShort(exposure)} still owed`}
      width="max-w-[600px]"
      footer={
        <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={onClose}>
          <Check className="h-3.5 w-3.5" /> Done
        </button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="ny-inset px-3.5 py-3">
            <p className="ny-hud">At risk (overdue)</p>
            <p className="ny-num ny-display mt-1 text-xl text-danger">{kesShort(atRisk)}</p>
          </div>
          <div className="ny-inset px-3.5 py-3">
            <p className="ny-hud">Share at risk</p>
            <p className="ny-num ny-display mt-1 text-xl">{exposure ? Math.round((atRisk / exposure) * 100) : 0}%</p>
          </div>
        </div>
        <ul className="space-y-2">
          {sorted.map((v) => (
            <li key={v.loan.id} className={`rounded-xl border bg-surface-1 px-3.5 py-3 ${v.status === "overdue" ? "border-[rgba(198,40,40,0.4)]" : "border-border-subtle"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{v.loan.title}</p>
                  <p className="ny-hud mt-0.5 !text-[0.55rem]">{v.loan.ref} · {v.loan.borrowers.map((b) => nameOf(b).split(" ")[0]).join(" + ")}</p>
                </div>
                <span className={`ny-chip shrink-0 ${statusMeta[v.status].tone}`}>{statusMeta[v.status].label}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                <span className="ny-num font-semibold">{kes(v.outstanding)} left</span>
                <span className="ny-hud !text-[0.55rem]">{v.daysLate > 0 ? `${v.daysLate} days late` : v.next ? `next ${fmtDate(v.next.due)}` : "closed"}</span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onPay(v)}>
                  <ReceiptIcon className="h-3.5 w-3.5" /> Record payment
                </button>
                {v.status === "overdue" && (
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onCallUp(v)}>
                    <UserRound className="h-3.5 w-3.5" /> Call up
                  </button>
                )}
                {v.loan.freq === "monthly" && (
                  <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onRestructure(v)}>
                    <RotateCcw className="h-3.5 w-3.5" /> Restructure
                  </button>
                )}
                <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onWriteOff(v)}>
                  <Trash2 className="h-3.5 w-3.5" /> Write off
                </button>
              </div>
            </li>
          ))}
          {sorted.length === 0 && <li className="ny-inset px-4 py-8 text-center text-sm text-text-secondary">Nothing is live right now.</li>}
        </ul>
        <p className="ny-hud">Write-offs unlock after 180 days overdue · each action needs a reason</p>
      </div>
    </Drawer>
  );
}

