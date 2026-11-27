"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Check, Download, Fingerprint, Loader2, Megaphone, Smartphone, Wallet, type LucideIcon } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import { Meter, Spark } from "./charts";
import {
  type AutoDebit,
  type Channel,
  type Chama,
  type Dividend,
  dividends,
  eligibleAmount,
  nameOf,
  type Statement,
  sacco,
  skipLabel,
  typeLabel,
} from "@/data/dashboard/finances";
import { fmt, kes, kesShort, pct } from "@/lib/format";

export const channelMeta: Record<Channel, { label: string; icon: LucideIcon; sim: boolean; eta: string }> = {
  mpesa: { label: "M-Pesa Daraja", icon: Smartphone, sim: true, eta: "seconds" },
  airtel: { label: "Airtel Money", icon: Smartphone, sim: true, eta: "seconds" },
  bank: { label: "Bank EFT / RTGS", icon: Building2, sim: true, eta: "same day" },
  internal: { label: "Internal wallet", icon: Wallet, sim: false, eta: "instant" },
};

export type PostedContribution = { chamaId: string; amount: number; channel: Channel; ref: string };

export type ShareReceipt = {
  ref: string;
  shares: number;
  amount: number;
  channel: Channel;
  monthly: boolean;
  day: number;
  newTotal: number;
  ledger: string;
};

/* ------------------------------------------------------------------ */
/* M-Pesa STK prompt preview — nested inside money flows, SIMULATED     */
/* ------------------------------------------------------------------ */
export function StkPromptModal({
  open,
  onClose,
  onApprove,
  amount,
  label,
  phone,
}: {
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
  amount: number;
  label: string;
  phone: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="M-Pesa prompt preview"
      sub="What the contributor's phone would show"
      size="sm"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel prompt
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onApprove}>
            Approve (SIMULATED)
          </button>
        </>
      }
    >
      <div className="fin-phone mx-auto">
        <div className="fin-phone__hdr">
          <span>Safaricom</span>
          <span className="ny-num">09:14</span>
        </div>
        <div className="fin-phone__screen">
          <p className="text-[0.7rem] font-bold uppercase tracking-wide">M-Pesa</p>
          <p className="mt-1.5 text-[0.78rem] leading-snug">
            {kes(amount)} to <strong>Nalyanya Family</strong> · {label.slice(0, 28)}
          </p>
          <p className="mt-1.5 text-[0.72rem] opacity-70">Account: {phone}</p>
          <p className="mt-2 text-[0.72rem] font-semibold">Enter M-Pesa PIN</p>
          <div className="fin-phone__pin">
            {[0, 1, 2, 3].map((i) => (
              <span key={i}>•</span>
            ))}
          </div>
          <p className="fin-phone__note">SIMULATED prompt — no STK request leaves this device in Phase 1.</p>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Contribute to a chama — small/medium modal with channel + amount     */
/* ------------------------------------------------------------------ */
export function ContributeChamaModal({
  open,
  onClose,
  chama,
  onPosted,
}: {
  open: boolean;
  onClose: () => void;
  chama: Chama | null;
  onPosted: (r: PostedContribution) => void;
}) {
  const [amount, setAmount] = useState(String(chama?.contribution ?? 0));
  const [channel, setChannel] = useState<Channel>("mpesa");
  const [stkOpen, setStkOpen] = useState(false);
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const amt = Number(amount) || 0;
  const needsStk = channel === "mpesa" || channel === "airtel";
  const canPost = amt > 0 && (!needsStk || approved) && !busy;
  const chips = [500, 1000, 2000, 5000, 10000, 20000];

  const post = () => {
    if (!chama) return;
    setBusy(true);
    window.setTimeout(() => {
      onPosted({
        chamaId: chama.id,
        amount: amt,
        channel,
        ref: `NY-CHM-2025-${String(Math.floor(Math.random() * 90000) + 10000)}`,
      });
      setBusy(false);
      onClose();
    }, 800);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Contribute to this chama"
        sub={chama ? `${chama.name} · ${chama.ref}` : ""}
        size="md"
        footer={
          <>
            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={!canPost} onClick={post}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Post {kes(amt)} (SIMULATED)
            </button>
          </>
        }
      >
        <p className="ny-hud">Amount · KES</p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {chips.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAmount(String(v))}
              className={`ny-num rounded-lg border px-2 py-2.5 text-sm font-semibold transition ${
                Number(amount) === v ? "border-brand-primary bg-brand-primary text-on-brand" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"
              }`}
            >
              {fmt(v)}
            </button>
          ))}
        </div>
        <label className="ny-label mt-4" htmlFor="ch-amount">
          Or type an amount
        </label>
        <input id="ch-amount" inputMode="numeric" className="ny-input ny-num" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} />

        <span className="ny-label mt-4">Channel</span>
        <div className="grid gap-2 sm:grid-cols-2">
          {(Object.keys(channelMeta) as Channel[]).map((c) => {
            const m = channelMeta[c];
            const Icon = m.icon;
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setChannel(c);
                  setApproved(false);
                }}
                className={`rounded-xl border p-3 text-left transition ${
                  channel === c ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-brand-primary" /> {m.label}
                  </span>
                  {m.sim ? <span className="ny-chip ny-chip-sim">SIMULATED</span> : <span className="ny-chip ny-chip-ok">local</span>}
                </span>
                <span className="ny-hud mt-1.5 block !text-[0.56rem]">settles in {m.eta}</span>
              </button>
            );
          })}
        </div>

        {needsStk && (
          <div className="ny-inset mt-4 flex flex-wrap items-center justify-between gap-3 px-3.5 py-3">
            <div>
              <p className="text-sm font-semibold">{approved ? "STK prompt approved (SIMULATED)" : "Approve the M-Pesa prompt first"}</p>
              <p className="ny-hud mt-1 !text-[0.56rem]">Account +2547 ··· 2210 · from your profile</p>
            </div>
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => setStkOpen(true)} disabled={amt <= 0}>
              <Smartphone className="h-3.5 w-3.5" /> {approved ? "Preview again" : "Send STK prompt"}
            </button>
          </div>
        )}
        {chama && (
          <p className="ny-hud mt-3">
            Pool after this: {kes(chama.pool + amt)} of {kes(chama.target)} · no money moves in Phase 1
          </p>
        )}
      </Modal>

      <StkPromptModal
        open={stkOpen}
        onClose={() => setStkOpen(false)}
        onApprove={() => {
          setApproved(true);
          setStkOpen(false);
        }}
        amount={amt}
        label={chama?.name ?? ""}
        phone="+2547 ··· 2210"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Rotate now — admin, 2FA + reason (small)                             */
/* ------------------------------------------------------------------ */
export function RotateNowModal({
  open,
  onClose,
  chama,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  chama: Chama | null;
  onConfirm: (reason: string) => void;
}) {
  const [code, setCode] = useState("");
  const [reason, setReason] = useState("");
  const recipient = chama ? nameOf(chama.orderIds[chama.recipientIdx] ?? "") : "—";
  const pot = chama?.pool ?? 0;
  const ok = code.length === 6 && reason.trim().length >= 4;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rotate the pot now?"
      sub={chama ? `${chama.name} · round ${chama.round} of ${chama.totalRounds}` : ""}
      size="sm"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Keep the schedule
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-accent ny-btn-sm"
            disabled={!ok}
            onClick={() => {
              onConfirm(reason);
              setCode("");
              setReason("");
              onClose();
            }}
          >
            <Check className="h-3.5 w-3.5" /> Pay out {kesShort(pot)}
          </button>
        </>
      }
    >
      <div className="ny-inset px-4 py-3.5">
        <p className="ny-hud">Recipient this round</p>
        <p className="ny-display mt-1 text-lg">{recipient}</p>
        <p className="ny-num mt-1 text-sm text-text-secondary">
          {kes(pot)} pot · {chama ? chama.paidIds.length : 0} of {chama?.memberIds.length ?? 0} paid in
        </p>
      </div>
      <label className="ny-label mt-4" htmlFor="rot-code">
        <Fingerprint className="mr-1 inline h-3.5 w-3.5" /> 6-digit authenticator code
      </label>
      <input id="rot-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
      <label className="ny-label mt-3" htmlFor="rot-reason">
        Reason (logged)
      </label>
      <input id="rot-reason" className="ny-input" placeholder="Round complete — pay out early for the school term" value={reason} onChange={(e) => setReason(e.target.value)} />
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED B2C · dev mode accepts any 6 digits</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Statements — per-cycle summary (medium)                              */
/* ------------------------------------------------------------------ */
export function StatementsModal({
  open,
  onClose,
  chama,
  onExport,
}: {
  open: boolean;
  onClose: () => void;
  chama: Chama | null;
  onExport: () => void;
}) {
  const rows: Statement[] = chama?.statements ?? [];
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Statements"
      sub={chama ? `${chama.name} · last ${rows.length} closed cycles` : ""}
      size="md"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onExport}>
            <Download className="h-3.5 w-3.5" /> Export statement
          </button>
        </>
      }
    >
      <div className="cc-table-wrap">
        <table className="cc-table">
          <thead>
            <tr>
              <th>Cycle</th>
              <th className="text-right">Collected</th>
              <th className="text-right">Paid out</th>
              <th className="text-right">Late</th>
              <th>Recipient</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.round}>
                <td data-label="Cycle" className="font-semibold">{s.round}</td>
                <td data-label="Collected" className="ny-num text-right">{kes(s.collected)}</td>
                <td data-label="Paid out" className="ny-num text-right">{kes(s.paidOut)}</td>
                <td data-label="Late" className="ny-num text-right">
                  {s.late} · {kes(s.penalties)}
                </td>
                <td data-label="Recipient">{s.paidTo}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="!py-8 text-center text-text-secondary">No closed cycles yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="ny-hud mt-3">Statements are generated locally · PDF and CSV stubs until Phase 2</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Export — CSV / XLSX / PDF stub (small)                               */
/* ------------------------------------------------------------------ */
export function ExportModal({
  open,
  onClose,
  onQueue,
  scope,
}: {
  open: boolean;
  onClose: () => void;
  onQueue: (format: string) => void;
  scope: string;
}) {
  const [format, setFormat] = useState("CSV");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export"
      sub={`${scope} · queued locally, signed file arrives in Phase 2`}
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
      <span className="ny-label">Format</span>
      <div className="grid grid-cols-3 gap-2">
        {["CSV", "XLSX", "PDF"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFormat(f)}
            className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
              format === f ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <p className="ny-chip ny-chip-sim mt-4">SIMULATED · KES amounts · EAT timestamps</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Loan eligibility breakdown — medium, deep-links to T-10              */
/* ------------------------------------------------------------------ */
export function EligibilityModal({
  open,
  onClose,
  shares,
  unitValue,
  multiplier,
}: {
  open: boolean;
  onClose: () => void;
  shares: number;
  unitValue: number;
  multiplier: number;
}) {
  const [m, setM] = useState(multiplier);
  const gross = shares * unitValue * m;
  const amount = eligibleAmount(shares, unitValue, m);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Loan eligibility"
      sub="How much you can borrow from the Sacco, in plain words"
      size="md"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <Link
            href={`/dashboard/loans?amount=${amount}&src=sacco&shares=${shares}`}
            onClick={onClose}
            className="ny-btn ny-btn-accent ny-btn-sm"
          >
            Apply for up to {kesShort(amount)} <span aria-hidden>→</span>
          </Link>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        With <strong className="text-text-primary">{shares} shares</strong> you can borrow up to{" "}
        <strong className="text-text-primary">{kes(amount)}</strong>. That is {m}× your shares at today&apos;s unit value,
        with nothing else owed against them.
      </p>
      <label className="ny-label mt-4" htmlFor="elig-m">
        Multiplier for this view · {m}×
      </label>
      <input id="elig-m" type="range" min={2} max={4} step={1} value={m} onChange={(e) => setM(Number(e.target.value))} className="w-full accent-[var(--color-brand-primary)]" />
      <dl className="mt-4 divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
        {[
          ["Your shares", fmt(shares)],
          ["Unit value", kes(unitValue)],
          ["Shares × value", kes(shares * unitValue)],
          [`× ${m} multiplier`, kes(gross)],
          ["Less obligations", "KES 0"],
          ["Eligible to borrow", kes(amount)],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <dt className="text-text-secondary">{k}</dt>
            <dd className="ny-num font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="ny-hud mt-3">The multiplier is set by the family head for everyone — changing it is a 2FA governance change (T-8 S7)</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Dividend history — small                                             */
/* ------------------------------------------------------------------ */
export function DividendHistoryModal({ open, onClose, shares }: { open: boolean; onClose: () => void; shares: number }) {
  const rows: Dividend[] = dividends;
  return (
    <Modal open={open} onClose={onClose} title="Dividend history" sub={`Pro-rata to shares held · you hold ${shares}`} size="sm">
      <ul className="space-y-2">
        {rows.map((d) => (
          <li key={d.year} className="ny-inset flex items-center justify-between gap-3 px-3.5 py-3">
            <div>
              <p className="ny-display text-base">{d.year}</p>
              <p className="ny-hud mt-0.5 !text-[0.56rem]">
                {kes(d.perShare)} / share · {d.date}
              </p>
            </div>
            <div className="text-right">
              <p className="ny-num font-semibold">{kes(d.yourTotal)}</p>
              <span className={`ny-chip mt-1 ${d.status === "paid" ? "ny-chip-ok" : "ny-chip-warn"}`}>{d.status}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="ny-chip ny-chip-sim mt-3">Proposed 2025 dividend is SIMULATED until declared</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Share receipt — after buying shares (small, flash on post)           */
/* ------------------------------------------------------------------ */
export function ShareReceiptModal({ open, onClose, receipt }: { open: boolean; onClose: () => void; receipt: ShareReceipt | null }) {
  return (
    <Modal open={open} onClose={onClose} title="Shares posted" sub={receipt ? `${receipt.ref} · ledger ${receipt.ledger}` : ""} size="sm" tone="gold"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className={`ny-inset rounded-xl px-4 py-4 text-center ${open ? "fin-flash-posted" : ""}`}>
        <span className="ny-hud">+{receipt?.shares ?? 0} shares</span>
        <p className="ny-num ny-display mt-1 text-3xl leading-none">{receipt ? kes(receipt.amount) : "—"}</p>
        <p className="mt-2 text-sm text-text-secondary">
          You now hold <strong className="text-text-primary">{receipt ? fmt(receipt.newTotal) : "—"}</strong> shares
        </p>
      </div>
      <dl className="mt-3 divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
        {[
          ["Plan", receipt?.monthly ? `Monthly auto-debit on day ${receipt.day}` : "One-off top-up"],
          ["Channel", receipt ? channelMeta[receipt.channel].label : "—"],
          ["Ledger", receipt?.ledger ?? "—"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <dt className="text-text-secondary">{k}</dt>
            <dd className="ny-num text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · local share ledger posted, no money moved</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Auto-debit — monthly standing order (small)                          */
/* ------------------------------------------------------------------ */
export function AutoDebitModal({
  open,
  onClose,
  auto,
  unitValue,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  auto: AutoDebit;
  unitValue: number;
  onSave: (a: AutoDebit) => void;
}) {
  const [enabled, setEnabled] = useState(auto.enabled);
  const [amount, setAmount] = useState(String(auto.amount));
  const [day, setDay] = useState(auto.day);
  const [channel, setChannel] = useState<Channel>(auto.channel);
  const amt = Number(amount) || 0;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Monthly auto-debit"
      sub="Buys whole shares every month at today's unit value"
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
              onSave({ enabled, amount: amt, day, channel });
              onClose();
            }}
          >
            Save standing order
          </button>
        </>
      }
    >
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3">
        <span className="text-sm font-semibold">Auto-debit is {enabled ? "on" : "off"}</span>
        <button type="button" role="switch" aria-checked={enabled} aria-label="Toggle auto-debit" className="fin-switch" onClick={() => setEnabled((v) => !v)} />
      </div>
      <label className="ny-label mt-4" htmlFor="ad-amt">Monthly amount (KES)</label>
      <input id="ad-amt" inputMode="numeric" className="ny-input ny-num" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} />
      <p className="ny-hud mt-1.5">= {Math.floor(amt / unitValue)} whole shares at {kes(unitValue)}</p>
      <span className="ny-label mt-4">Day of the month</span>
      <div className="flex flex-wrap gap-2">
        {[1, 5, 15, 25].map((d) => (
          <button key={d} type="button" onClick={() => setDay(d)} className={`ny-chip ny-touch ${day === d ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
            {d}
          </button>
        ))}
      </div>
      <span className="ny-label mt-4">Pays from</span>
      <div className="flex flex-wrap gap-2">
        {(["mpesa", "bank", "internal"] as Channel[]).map((c) => (
          <button key={c} type="button" onClick={() => setChannel(c)} className={`ny-btn ny-btn-sm ${channel === c ? "ny-btn-primary" : "ny-btn-outline"}`}>
            {channelMeta[c].label}
          </button>
        ))}
      </div>
      <p className="ny-chip ny-chip-sim mt-4">SIMULATED standing order · backend Phase 2</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Join a chama — request, admin-approved (small)                       */
/* ------------------------------------------------------------------ */
export function JoinChamaModal({
  open,
  onClose,
  chamas,
  onRequest,
}: {
  open: boolean;
  onClose: () => void;
  chamas: Chama[];
  onRequest: (chamaId: string, reason: string) => void;
}) {
  const [pick, setPick] = useState(chamas[0]?.id ?? "");
  const [reason, setReason] = useState("");
  const chosen = chamas.find((c) => c.id === pick);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ask to join a chama"
      sub="An admin of the chama approves every new member"
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={!chosen || reason.trim().length < 6}
            onClick={() => {
              if (chosen) onRequest(chosen.id, reason);
              onClose();
            }}
          >
            <Megaphone className="h-3.5 w-3.5" /> Send request (SIMULATED)
          </button>
        </>
      }
    >
      <label className="ny-label" htmlFor="join-pick">Chama</label>
      <select id="join-pick" className="ny-select" value={pick} onChange={(e) => setPick(e.target.value)}>
        {chamas.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} · {typeLabel[c.type]}
          </option>
        ))}
      </select>
      {chosen && (
        <p className="ny-hud mt-2">
          {kes(chosen.contribution)} · {chosen.memberIds.length} members · {skipLabel[chosen.skip]}
        </p>
      )}
      <label className="ny-label mt-4" htmlFor="join-reason">Why you want in</label>
      <textarea id="join-reason" className="ny-textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="I'm in Nairobi and can pay on the 5th each month." />
      <p className="ny-chip ny-chip-sim mt-3">Ready — connects when the backend is wired</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Unit value explainer — small, with live sparkline                    */
/* ------------------------------------------------------------------ */
export function ShareUnitModal({
  open,
  onClose,
  unitValue,
  history,
  months,
}: {
  open: boolean;
  onClose: () => void;
  unitValue: number;
  history: number[];
  months: string[];
}) {
  return (
    <Modal open={open} onClose={onClose} title="How the share price moves" sub="Unit value floats with pool ÷ shares issued" size="sm">
      <div className="ny-inset flex items-center justify-between gap-3 px-4 py-3.5">
        <div>
          <p className="ny-hud">Unit value now</p>
          <p className="ny-num ny-display text-2xl">{kes(unitValue)}</p>
          <p className="ny-hud mt-1 !text-[0.56rem]">+{sacco.unitDeltaPct}% this month</p>
        </div>
        <Spark values={history} />
      </div>
      <ul className="mt-3 space-y-2 text-sm text-text-secondary">
        <li>• The Sacco pool is {kesShort(sacco.pool)} across {fmt(sacco.sharesIssued)} shares.</li>
        <li>• {sacco.reservePct}% is kept in reserve before any dividend is declared.</li>
        <li>• The price is revalued quarterly by the treasurer, and the change is posted to the ledger.</li>
      </ul>
      <p className="ny-hud mt-3">Last 12 months: {months[0]} → {months[months.length - 1]}</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Month detail — opened by tapping the share curve (small)             */
/* ------------------------------------------------------------------ */
export function ShareMonthModal({
  open,
  onClose,
  label,
  shares,
  unit,
  delta,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  shares: number;
  unit: number;
  delta: number;
}) {
  return (
    <Modal open={open} onClose={onClose} title={`${label} · your shares`} sub="Snapshot at month end" size="sm">
      <div className="grid grid-cols-2 gap-3">
        <div className="ny-inset px-3.5 py-3">
          <p className="ny-hud">Shares held</p>
          <p className="ny-num ny-display text-2xl">{fmt(shares)}</p>
        </div>
        <div className="ny-inset px-3.5 py-3">
          <p className="ny-hud">Value that month</p>
          <p className="ny-num ny-display text-2xl">{kesShort(shares * unit)}</p>
        </div>
      </div>
      <div className="mt-3">
        <p className="ny-hud mb-1.5">Share of the Sacco</p>
        <Meter value={shares} max={sacco.sharesIssued} />
        <p className="ny-hud mt-1.5 !text-[0.56rem]">{pct(shares, sacco.sharesIssued)}% of {fmt(sacco.sharesIssued)} issued</p>
      </div>
      <p className="ny-chip ny-chip-brand mt-3">{delta >= 0 ? "+" : ""}{delta} shares vs previous month</p>
    </Modal>
  );
}
