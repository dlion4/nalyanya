"use client";

import { useState } from "react";
import { AlertTriangle, BadgeCheck, Check, Download, Fingerprint, Megaphone, ShieldCheck, Trash2, UserRound, X } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import { fmt, kes, kesShort, pct } from "@/lib/format";
import {
  AS_OF,
  ceilingFor,
  fmtDate,
  productOf,
  unitValue,
  type AuditEntry,
  type Guarantor,
  type Member,
  type Policy,
  type Product,
  type ProductId,
  type Row,
  type Loan,
  type LoanView,
  type Channel,
  nameOf,
} from "@/data/dashboard/loans";
import { Calculator, channelMeta } from "./charts";

export type Receipt = {
  title: string;
  amount: number;
  ref: string;
  badge: string;
  badgeTone: string;
  lines: [string, string][];
};

/* ------------------------------------------------------------------ */
/* M1 — Guarantor picker (nested inside the application wizard)          */
/* ------------------------------------------------------------------ */
export function GuarantorPickerModal({
  open,
  onClose,
  candidates,
  selected,
  onChange,
  pledgePct,
  needed,
}: {
  open: boolean;
  onClose: () => void;
  candidates: Member[];
  selected: Guarantor[];
  onChange: (g: Guarantor[]) => void;
  pledgePct: number;
  needed: number;
}) {
  const total = selected.reduce((s, g) => s + g.shares, 0) * unitValue * (pledgePct / 100);
  const toggle = (m: Member) => {
    const on = selected.some((g) => g.id === m.id);
    onChange(on ? selected.filter((g) => g.id !== m.id) : [...selected, { id: m.id, shares: m.shares }]);
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choose guarantors"
      sub="Their shares back your loan. Only a share of each count, so the family is protected."
      size="md"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`ny-chip ${selected.length >= needed ? "ny-chip-ok" : "ny-chip-warn"}`}>
          {selected.length} of {needed} needed
        </span>
        <span className="ny-chip ny-chip-brand">Pledge counts: {kes(total)}</span>
      </div>
      <ul className="space-y-1.5">
        {candidates.map((m) => {
          const on = selected.some((g) => g.id === m.id);
          return (
            <li key={m.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => toggle(m)}
                disabled={m.shares === 0}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-40 ${on ? "border-brand-primary bg-[rgba(31,77,58,0.06)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}
              >
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${on ? "border-brand-primary bg-brand-primary text-on-brand" : "border-border-strong"}`}>
                  {on && <Check className="h-3.5 w-3.5" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{m.name}</span>
                  <span className="ny-hud block !text-[0.55rem]">
                    {m.branch} · {m.shares === 0 ? "no shares yet" : `${m.shares} shares`}
                  </span>
                </span>
                <span className="ny-num shrink-0 text-sm font-semibold">{kes((m.shares * unitValue * pledgePct) / 100)}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="ny-hud mt-3">A guarantor is never asked to pledge more than their own shares</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M2 — Product details                                                 */
/* ------------------------------------------------------------------ */
export function ProductDetailModal({ open, onClose, product, onApply }: { open: boolean; onClose: () => void; product: Product | null; onApply: (p: ProductId) => void }) {
  if (!product) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product.name}
      sub={product.blurb}
      size="md"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => onApply(product.id)}>
            Apply <ShieldCheck className="h-3.5 w-3.5" />
          </button>
        </>
      }
    >
      <div className="relative mb-4 h-36 overflow-hidden rounded-xl">
        <img src={product.image} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
        <div className="absolute inset-0 bg-linear-to-t from-[rgba(10,14,11,0.75)] to-transparent" />
        <span className={`ny-chip ${product.tone} absolute bottom-3 left-3`}>{product.chip}</span>
      </div>
      <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
        {[
          ["Amount", `${kes(product.min)} – ${kes(product.max)}`],
          ["Term", product.freq === "single" ? "One payday" : `${product.termMin} – ${product.termMax} months`],
          ["Interest", `${product.rate}% a year · ${product.method === "flat" ? "flat" : "reducing balance"}`],
          ["Repayment", product.freq === "single" ? "One instalment on payday" : "Monthly instalments"],
          ["Shares", product.shares ? `Required · up to ${product.sharesX || "policy"}× shares` : "Not required"],
          ["Guarantors", product.guarantors ? `${product.guarantors} needed` : "None needed"],
          ["Salary", product.salary ? "Capped at a share of net pay" : "Not required"],
          ["Collateral", product.collateral ? "Required" : "Not required"],
          ["Paid to", product.school ? "School paybill, direct" : product.scope === "group" ? "Chama account" : "Your account"],
          ["Speed", product.fast ? "Decision within 24 hours" : "Standard review"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-3 px-3.5 py-2.5">
            <dt className="text-text-secondary">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="ny-hud mt-3">Every term is computed from these rules — the schedule shown on apply is exact</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M3 — Eligibility breakdown (opened from the Sacco or the hero)        */
/* ------------------------------------------------------------------ */
export function EligibilityModal({
  open,
  onClose,
  me,
  obligations,
  rules,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  me: Member;
  obligations: number;
  rules: Policy;
  onApply: (p: ProductId, amount: number) => void;
}) {
  const [mult, setMult] = useState(rules.sharesMultiplier);
  const r = { ...rules, sharesMultiplier: mult };
  const sharesValue = me.shares * unitValue;
  const gross = sharesValue * mult;
  const sacco = ceilingFor(productOf("sacco"), [me], [], r, obligations);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="How much you can borrow"
      sub="In plain words, with every number visible"
      size="md"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => onApply("sacco", sacco.available)}>
            Apply up to {kesShort(sacco.available)}
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        Your <strong className="text-text-primary">{me.shares} shares</strong> are worth {kes(sharesValue)}. At {mult}× that is{" "}
        <strong className="text-text-primary">{kes(gross)}</strong>. Anything you already owe comes off the top.
      </p>
      <label className="ny-label mt-4" htmlFor="el-m">Multiplier for this view · {mult}×</label>
      <input id="el-m" type="range" min={2} max={4} step={1} value={mult} onChange={(e) => setMult(Number(e.target.value))} className="w-full accent-[var(--color-brand-primary)]" />
      <dl className="mt-4 divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
        {[
          ["Shares × unit value", kes(sharesValue)],
          [`× ${mult} multiplier`, kes(gross)],
          ["Less what you still owe", `− ${kes(obligations)}`],
          ["Available for a Sacco loan", kes(sacco.available)],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <dt className="text-text-secondary">{k}</dt>
            <dd className="ny-num font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="ny-hud mt-3">Salary advances cap at {rules.salaryCapPct}% of {kes(me.netSalary)} net pay · unsecured loans use the credit base plus pledges</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M4 — What-if calculator (full)                                       */
/* ------------------------------------------------------------------ */
export function WhatIfModal({ open, onClose, onApply }: { open: boolean; onClose: () => void; onApply: (p: ProductId, amount: number, term: number) => void }) {
  return (
    <Modal open={open} onClose={onClose} title="What-if calculator" sub="Slide the amount and term — the schedule redraws instantly" size="md">
      <Calculator start="long-term" onApply={(p, a, t) => onApply(p, a, t)} />
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M5 — Auto-collect (STK on due date, SIMULATED)                       */
/* ------------------------------------------------------------------ */
export function AutoCollectModal({
  open,
  onClose,
  auto,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  auto: { on: boolean; day: number; channel: Channel };
  onSave: (a: { on: boolean; day: number; channel: Channel }) => void;
}) {
  const [on, setOn] = useState(auto.on);
  const [day, setDay] = useState(auto.day);
  const [channel, setChannel] = useState<Channel>(auto.channel);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Auto-collect instalments"
      sub="An STK prompt goes to the borrower on the due date"
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            onClick={() => {
              onSave({ on, day, channel });
              onClose();
            }}
          >
            Save
          </button>
        </>
      }
    >
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3">
        <span className="text-sm font-semibold">Auto-collect is {on ? "on" : "off"}</span>
        <button type="button" role="switch" aria-checked={on} aria-label="Auto-collect" className="ln-switch" onClick={() => setOn((v) => !v)} />
      </div>
      <span className="ny-label mt-4">Due on the day of the month</span>
      <div className="flex flex-wrap gap-2">
        {[1, 5, 15, 25].map((d) => (
          <button key={d} type="button" onClick={() => setDay(d)} className={`ny-chip ny-touch ${day === d ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
            {d}
          </button>
        ))}
      </div>
      <span className="ny-label mt-4">Collect from</span>
      <div className="flex flex-wrap gap-2">
        {(["mpesa", "bank"] as Channel[]).map((c) => (
          <button key={c} type="button" onClick={() => setChannel(c)} className={`ny-btn ny-btn-sm ${channel === c ? "ny-btn-primary" : "ny-btn-outline"}`}>
            {channelMeta[c].label}
          </button>
        ))}
      </div>
      <p className="ny-chip ny-chip-sim mt-4">SIMULATED · STK prompts are not sent in Phase 1</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M6 — Write-off (admin: reason + 2FA, danger)                         */
/* ------------------------------------------------------------------ */
export function WriteOffModal({ open, onClose, view, onConfirm }: { open: boolean; onClose: () => void; view: LoanView | null; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const ok = reason.trim().length >= 8 && code.length === 6;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Write this loan off?"
      sub={view ? `${view.loan.ref} · ${kes(view.outstanding)} still owed` : ""}
      size="sm"
      tone="danger"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Keep chasing
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-danger ny-btn-sm"
            disabled={!ok}
            onClick={() => {
              onConfirm(reason);
              setReason("");
              setCode("");
              onClose();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Write off
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-xl border border-[rgba(198,40,40,0.3)] bg-[rgba(198,40,40,0.07)] px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
        <p className="text-sm leading-relaxed text-text-secondary">
          The debt is closed as a loss. The record, every repayment and the guarantor history stay in the ledger and the audit
          trail.
        </p>
      </div>
      <label className="ny-label mt-4" htmlFor="wo-reason">Reason (logged)</label>
      <input id="wo-reason" className="ny-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Borrower deceased — estate settlement in progress" />
      <label className="ny-label mt-3" htmlFor="wo-code"><Fingerprint className="mr-1 inline h-3.5 w-3.5" /> 2FA code</label>
      <input id="wo-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · dev mode accepts any 6 digits</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M7 — Cancel an application (borrower side)                           */
/* ------------------------------------------------------------------ */
export function CancelApplicationModal({ open, onClose, view, onConfirm }: { open: boolean; onClose: () => void; view: LoanView | null; onConfirm: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancel this application?"
      sub={view ? `${view.loan.ref} · ${kes(view.loan.amount)}` : ""}
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Keep it
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-danger ny-btn-sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <X className="h-3.5 w-3.5" /> Cancel application
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        Nothing has been paid out, so nothing needs reversing. Guarantors are told it was withdrawn and their shares are never pledged.
      </p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M8 — Receipt (after a payment, disbursement or restructure)          */
/* ------------------------------------------------------------------ */
export function ReceiptModal({ open, onClose, receipt }: { open: boolean; onClose: () => void; receipt: Receipt | null }) {
  return (
    <Modal open={open} onClose={onClose} title={receipt?.title ?? "Receipt"} sub={receipt ? `${receipt.ref} · posted to the ledger` : ""} size="sm" tone="gold"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Done
        </button>
      }
    >
      {receipt && (
        <>
          <div className={`rounded-xl border border-border-subtle bg-surface-2 p-4 text-center ${receipt.badgeTone === "ny-chip-danger" ? "ln-flash-overdue" : "ln-flash-posted"}`}>
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[rgba(212,164,55,0.2)]">
              <BadgeCheck className="h-6 w-6 text-[#7a5b12]" />
            </span>
            <p className="ny-num ny-display mt-3 text-3xl leading-none">{kes(receipt.amount)}</p>
            <span className={`ny-chip mt-3 ${receipt.badgeTone}`}>{receipt.badge}</span>
          </div>
          <dl className="mt-3 divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
            {receipt.lines.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="ny-num text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="ny-chip ny-chip-sim mt-3">SIMULATED · no money moved in Phase 1</p>
        </>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M9 — Broadcast to borrower(s) and guarantors (streams receipts)       */
/* ------------------------------------------------------------------ */
export function BroadcastModal({
  open,
  onClose,
  view,
  onSent,
}: {
  open: boolean;
  onClose: () => void;
  view: LoanView | null;
  onSent: (summary: string) => void;
}) {
  const [channel, setChannel] = useState<"whatsapp" | "sms" | "email" | "in-app">("whatsapp");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  if (!view) return null;
  const who = [...view.loan.borrowers, ...view.loan.guarantors.map((g) => g.id)];
  const names = who.map((id) => nameOf(id));
  return (
    <Modal
      open={open}
      onClose={() => {
        setSent(false);
        setBody("");
        onClose();
      }}
      title="Message the borrowers and guarantors"
      sub={`${view.loan.ref} · ${who.length} people`}
      size="md"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-accent ny-btn-sm"
            disabled={!body.trim() || sent}
            onClick={() => {
              setSent(true);
              onSent(`${who.length} recipients · ${channel.toUpperCase()} · SIMULATED`);
            }}
          >
            <Megaphone className="h-3.5 w-3.5" /> Send (SIMULATED)
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(["whatsapp", "sms", "email", "in-app"] as const).map((c) => (
          <button key={c} type="button" onClick={() => setChannel(c)} className={`rounded-lg border px-2 py-2.5 text-xs font-semibold capitalize transition ${channel === c ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
            {c}
          </button>
        ))}
      </div>
      <label className="ny-label mt-4" htmlFor="bc-body">Message · merge fields {"{first_name}"} {"{ref}"}</label>
      <textarea id="bc-body" className="ny-textarea" value={body} onChange={(e) => setBody(e.target.value)} placeholder={`Habari {first_name}, a short note on ${view.loan.ref}: ${kes(view.next?.instalment ?? 0)} is due on ${view.next ? fmtDate(view.next.due) : "—"}.`} />
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="ny-chip ny-chip-neutral">{who.length} recipients</span>
        <span className="ny-chip ny-chip-sim">SIMULATED fanout · T-14</span>
      </div>
      {sent && (
        <div className="ny-inset mt-4 px-3.5 py-3">
          <p className="ny-hud">Delivery receipts (streamed)</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {names.map((n, i) => (
              <li key={`${n}-${i}`} className="ln-row-in flex items-center justify-between gap-2" style={{ animationDelay: `${i * 200}ms` }}>
                <span className="truncate">{n}</span>
                <span className={`ny-chip ${i === names.length - 1 && names.length > 2 ? "ny-chip-warn" : "ny-chip-ok"}`}>
                  {i === names.length - 1 && names.length > 2 ? "pending" : "delivered"}
                </span>
              </li>
            ))}
          </ul>
          <p className="ny-hud mt-2">Proof references are SIMULATED until the messaging backend is wired</p>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M10 — Guarantor call-up (overdue loans)                              */
/* ------------------------------------------------------------------ */
export function CallUpModal({ open, onClose, view, onConfirm }: { open: boolean; onClose: () => void; view: LoanView | null; onConfirm: (guarantorId: string) => void }) {
  const [pick, setPick] = useState<string>(view?.loan.guarantors[0]?.id ?? "");
  if (!view) return null;
  const guarantor = view.loan.guarantors.find((g) => g.id === pick) ?? view.loan.guarantors[0];
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Call up a guarantor"
      sub={`${view.loan.ref} · ${kes(view.overdueAmt)} overdue · ${view.daysLate} days late`}
      size="sm"
      tone="danger"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Not yet
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={!guarantor}
            onClick={() => {
              if (guarantor) onConfirm(guarantor.id);
              onClose();
            }}
          >
            <UserRound className="h-3.5 w-3.5" /> Notify guarantor (SIMULATED)
          </button>
        </>
      }
    >
      {view.loan.guarantors.length === 0 ? (
        <p className="ny-inset px-4 py-5 text-sm text-text-secondary">This loan has no guarantors. The schedule and penalties still apply.</p>
      ) : (
        <>
          <span className="ny-label">Guarantor to call</span>
          <div className="flex flex-col gap-1.5">
            {view.loan.guarantors.map((g) => (
              <button key={g.id} type="button" onClick={() => setPick(g.id)} className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${pick === g.id ? "border-brand-primary bg-[rgba(31,77,58,0.07)] font-semibold" : "border-border-subtle bg-surface-1"}`}>
                {nameOf(g.id)} · {fmt(g.shares)} shares pledged
              </button>
            ))}
          </div>
          <p className="ny-hud mt-3">Call-up unlocks after {view.daysLate >= 14 ? "14 days — now due" : "14 days late"}. Their pledge is never taken without this step.</p>
        </>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M11 — Export (statement PDF per loan, portfolio CSV for admin)         */
/* ------------------------------------------------------------------ */
export function ExportModal({ open, onClose, scope, onQueue }: { open: boolean; onClose: () => void; scope: string; onQueue: (format: string) => void }) {
  const [format, setFormat] = useState("PDF");
  const formats = scope.startsWith("Portfolio") ? ["CSV", "XLSX"] : ["PDF", "CSV"];
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export"
      sub={`${scope} · queued locally · signed file arrives in Phase 2`}
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onQueue(format)}>
            <Download className="h-3.5 w-3.5" /> Queue {format}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        {formats.map((f) => (
          <button key={f} type="button" onClick={() => setFormat(f)} className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${format === f ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
            {f}
          </button>
        ))}
      </div>
      <p className="ny-chip ny-chip-sim mt-4">SIMULATED · KES amounts · EAT timestamps</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M12 — Bulk settle (admin, 2FA)                                       */
/* ------------------------------------------------------------------ */
export function BulkSettleModal({ open, onClose, count, total, onConfirm }: { open: boolean; onClose: () => void; count: number; total: number; onConfirm: () => void }) {
  const [code, setCode] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Mark ${count} loan${count === 1 ? "" : "s"} as settled?`}
      sub={`${kes(total)} written off the books as paid in full`}
      size="sm"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-accent ny-btn-sm"
            disabled={code.length !== 6}
            onClick={() => {
              onConfirm();
              setCode("");
              onClose();
            }}
          >
            <Check className="h-3.5 w-3.5" /> Settle {count}
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        Use this only when the money has been received in full. Each loan writes its own ledger entry and audit row.
      </p>
      <label className="ny-label mt-4" htmlFor="bs-code"><Fingerprint className="mr-1 inline h-3.5 w-3.5" /> 2FA code</label>
      <input id="bs-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · dev mode accepts any 6 digits</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M13 — Audit entry detail                                             */
/* ------------------------------------------------------------------ */
export function AuditDetailModal({ open, onClose, entry }: { open: boolean; onClose: () => void; entry: AuditEntry | null }) {
  return (
    <Modal open={open} onClose={onClose} title={entry ? `Audit · ${entry.action}` : "Audit"} sub={entry ? `${entry.ref} · ${entry.at}` : ""} size="sm"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
      {entry && (
        <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
          {[
            ["Actor", entry.actor],
            ["Entity", entry.entity],
            ["Detail", entry.detail],
            ["Timestamp", `${entry.at} EAT`],
            ["Integrity", "Append-only · HMAC export in Phase 2"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-3 px-3.5 py-2.5">
              <dt className="shrink-0 text-text-secondary">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M14 — One row of the amortization schedule                           */
/* ------------------------------------------------------------------ */
export function ScheduleRowModal({ open, onClose, row, paid, loan }: { open: boolean; onClose: () => void; row: Row | null; paid: boolean; loan: Loan | null }) {
  if (!row || !loan) return null;
  const pct0 = pct(row.principal, row.instalment);
  return (
    <Modal open={open} onClose={onClose} title={`Instalment ${row.no} of ${loan.freq === "single" ? 1 : loan.termMonths}`} sub={`Due ${fmtDate(row.due)} · ${loan.ref}`} size="sm"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
      <span className={`ny-chip ${paid ? "ny-chip-ok" : row.due <= AS_OF ? "ny-chip-danger" : "ny-chip-neutral"}`}>
        {paid ? "paid" : row.due <= AS_OF ? "due" : "upcoming"}
      </span>
      <p className="ny-num ny-display mt-3 text-3xl leading-none">{kes(row.instalment)}</p>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-surface-3">
        <span className="h-full bg-brand-primary" style={{ width: `${pct0}%` }} />
        <span className="h-full bg-brand-accent" style={{ width: `${100 - pct0}%` }} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {[
          ["Principal", kes(row.principal)],
          ["Interest", kes(row.interest)],
          ["Balance after", kes(row.balance)],
          ["Channel", channelMeta[loan.channel].label],
        ].map(([k, v]) => (
          <div key={k} className="ny-inset px-3 py-2.5">
            <dt className="ny-hud">{k}</dt>
            <dd className="ny-num mt-0.5 font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M15 — Confirm a policy change (2FA)                                   */
/* ------------------------------------------------------------------ */
export function ConfirmPolicyModal({ open, onClose, changes, onConfirm }: { open: boolean; onClose: () => void; changes: string[]; onConfirm: () => void }) {
  const [code, setCode] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Save these loan rules?"
      sub={changes.length ? `${changes.length} change${changes.length === 1 ? "" : "s"} · applies to every new application` : "No changes to save"}
      size="sm"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Back to edit
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={code.length !== 6 || changes.length === 0}
            onClick={() => {
              onConfirm();
              setCode("");
              onClose();
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Save policy
          </button>
        </>
      }
    >
      <ul className="space-y-1.5 text-sm">
        {changes.map((c) => (
          <li key={c} className="ny-inset px-3 py-2">{c}</li>
        ))}
      </ul>
      <label className="ny-label mt-4" htmlFor="cp-code"><Fingerprint className="mr-1 inline h-3.5 w-3.5" /> Family head’s 2FA code</label>
      <input id="cp-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · dev mode accepts any 6 digits</p>
    </Modal>
  );
}

