"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Fingerprint, Shuffle, Users } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import {
  type AuditEntry,
  type Chama,
  type Rules,
  type SkipPolicy,
  type Tx,
  nameOf,
  personById,
  skipLabel,
} from "@/data/dashboard/finances";
import { kes, kesShort } from "@/lib/format";
import { channelMeta } from "./modals";

/* ------------------------------------------------------------------ */
/* Bulk rotate — pick several merry-go-rounds, one confirm (medium)     */
/* ------------------------------------------------------------------ */
export function BulkRotateModal({
  open,
  onClose,
  chamas,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  chamas: Chama[];
  onConfirm: (ids: string[]) => void;
}) {
  const [picked, setPicked] = useState<string[]>(chamas.map((c) => c.id));
  const total = chamas.filter((c) => picked.includes(c.id)).reduce((s, c) => s + c.pool, 0);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bulk rotate"
      sub="Pay out the current round across several circles at once"
      size="md"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-accent ny-btn-sm"
            disabled={picked.length === 0}
            onClick={() => {
              onConfirm(picked);
              onClose();
            }}
          >
            <Check className="h-3.5 w-3.5" /> Rotate {picked.length} · {kesShort(total)}
          </button>
        </>
      }
    >
      {chamas.length === 0 ? (
        <p className="ny-inset px-4 py-6 text-center text-sm text-text-secondary">No merry-go-round is rotating right now.</p>
      ) : (
        <ul className="space-y-2">
          {chamas.map((c) => {
            const on = picked.includes(c.id);
            return (
              <li key={c.id}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => setPicked((prev) => (on ? prev.filter((x) => x !== c.id) : [...prev, c.id]))}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${on ? "border-brand-primary bg-[rgba(31,77,58,0.06)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}
                >
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${on ? "border-brand-primary bg-brand-primary text-on-brand" : "border-border-strong"}`}>
                    {on && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{c.name}</span>
                    <span className="ny-hud mt-0.5 block !text-[0.56rem]">
                      Round {c.round}/{c.totalRounds} · pays {nameOf(c.orderIds[c.recipientIdx] ?? "")}
                    </span>
                  </span>
                  <span className="ny-num shrink-0 text-sm font-semibold">{kes(c.pool)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <p className="ny-chip ny-chip-sim mt-4">SIMULATED B2C per recipient · each round writes its own audit row</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Reorder the rotation — admin, every move audited (medium)            */
/* ------------------------------------------------------------------ */
export function ReorderCycleModal({
  open,
  onClose,
  chama,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  chama: Chama | null;
  onSave: (order: string[]) => void;
}) {
  const [order, setOrder] = useState<string[]>(chama?.orderIds ?? []);
  const move = (i: number, dir: -1 | 1) =>
    setOrder((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const changed = chama ? order.some((id, i) => id !== chama.orderIds[i]) : false;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reorder the rotation"
      sub={chama ? `${chama.name} · rounds already paid stay fixed` : ""}
      size="md"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={!changed}
            onClick={() => {
              onSave(order);
              onClose();
            }}
          >
            <Check className="h-3.5 w-3.5" /> Save order (2FA)
          </button>
        </>
      }
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="ny-hud">{changed ? "Unsaved changes" : "Current order"}</p>
        <button
          type="button"
          className="ny-btn ny-btn-outline ny-btn-sm"
          onClick={() => {
            const base = chama?.orderIds ?? [];
            const upcoming = base.slice(chama?.recipientIdx ?? 0);
            setOrder([...base.slice(0, chama?.recipientIdx ?? 0), ...[...upcoming].sort(() => Math.random() - 0.5)]);
          }}
        >
          <Shuffle className="h-3.5 w-3.5" /> Shuffle upcoming (SIMULATED)
        </button>
      </div>
      <ol className="space-y-1.5">
        {order.map((id, i) => {
          const done = chama ? i < chama.recipientIdx : false;
          const current = chama ? i === chama.recipientIdx : false;
          return (
            <li
              key={`${id}-${i}`}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${current ? "border-brand-accent bg-[rgba(212,164,55,0.1)]" : "border-border-subtle bg-surface-1"} ${done ? "opacity-60" : ""}`}
            >
              <span className="ny-hud w-16 shrink-0">Round {i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{nameOf(id)}</span>
              <span className="ny-hud hidden !text-[0.55rem] sm:inline">{done ? "paid" : current ? "current" : "upcoming"}</span>
              <button type="button" disabled={done || i === 0 || (chama ? i - 1 < chama.recipientIdx : false)} aria-label={`Move ${nameOf(id)} up`} className="ny-btn ny-btn-ghost ny-btn-sm !px-2 disabled:opacity-30" onClick={() => move(i, -1)}>
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" disabled={done || i === order.length - 1} aria-label={`Move ${nameOf(id)} down`} className="ny-btn ny-btn-ghost ny-btn-sm !px-2 disabled:opacity-30" onClick={() => move(i, 1)}>
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </li>
          );
        })}
      </ol>
      <p className="ny-chip ny-chip-sim mt-4">Every move writes an audit row with before/after · SIMULATED</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Waive a late penalty — admin, reason required (small)                */
/* ------------------------------------------------------------------ */
export function PenaltyWaiveModal({
  open,
  onClose,
  chama,
  personId,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  chama: Chama | null;
  personId: string;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const person = personById(personId);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Waive the late penalty?"
      sub={chama ? `${chama.name} · ${kes(chama.penalty)} for ${person?.name.split(" ")[0] ?? "this member"}` : ""}
      size="sm"
      tone="danger"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Keep the fee
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={reason.trim().length < 6}
            onClick={() => {
              onConfirm(reason);
              setReason("");
              onClose();
            }}
          >
            <Users className="h-3.5 w-3.5" /> Waive (audited)
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        Waiving removes the fee from this member&apos;s statement. The original penalty and the waiver both stay in the audit trail.
      </p>
      <label className="ny-label mt-4" htmlFor="waive-reason">Reason (required)</label>
      <input id="waive-reason" className="ny-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Bereavement in the family — pay on the 26th" />
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Edit rules — family head, 2FA, money-touching (medium)               */
/* ------------------------------------------------------------------ */
export function EditRulesModal({
  open,
  onClose,
  rules,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  rules: Rules;
  onSave: (r: Rules) => void;
}) {
  const [penalty, setPenalty] = useState(String(rules.penalty));
  const [grace, setGrace] = useState(rules.graceDays);
  const [skip, setSkip] = useState<SkipPolicy>(rules.skip);
  const [multiplier, setMultiplier] = useState(rules.multiplier);
  const [code, setCode] = useState("");
  const ok = code.length === 6 && Number(penalty) >= 0;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit family rules"
      sub="Changing these affects every chama and the Sacco · 2FA required"
      size="md"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={!ok}
            onClick={() => {
              onSave({ ...rules, penalty: Number(penalty) || 0, graceDays: grace, skip, multiplier });
              setCode("");
              onClose();
            }}
          >
            <Check className="h-3.5 w-3.5" /> Save rules (SIMULATED)
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="ny-label" htmlFor="r-pen">Late penalty (KES)</label>
          <input id="r-pen" inputMode="numeric" className="ny-input ny-num" value={penalty} onChange={(e) => setPenalty(e.target.value.replace(/[^0-9]/g, ""))} />
        </div>
        <div>
          <span className="ny-label">Grace period · {grace} days</span>
          <input type="range" min={0} max={7} value={grace} onChange={(e) => setGrace(Number(e.target.value))} className="w-full accent-[var(--color-brand-primary)]" aria-label="Grace period in days" />
        </div>
        <div className="sm:col-span-2">
          <span className="ny-label">Skip policy</span>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.keys(skipLabel) as SkipPolicy[]).map((s) => (
              <button key={s} type="button" onClick={() => setSkip(s)} className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${skip === s ? "border-brand-primary bg-[rgba(31,77,58,0.07)] font-semibold" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                {skipLabel[s]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="ny-label">Loan multiplier · {multiplier}× shares</span>
          <input type="range" min={2} max={4} value={multiplier} onChange={(e) => setMultiplier(Number(e.target.value))} className="w-full accent-[var(--color-brand-primary)]" aria-label="Loan multiplier" />
          <p className="ny-hud mt-1 !text-[0.55rem]">2× to 4× · a 3× default keeps loans safe</p>
        </div>
        <div>
          <label className="ny-label" htmlFor="r-code"><Fingerprint className="mr-1 inline h-3.5 w-3.5" /> 2FA code</label>
          <input id="r-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
        </div>
      </div>
      <p className="ny-chip ny-chip-sim mt-4">SIMULATED · dev mode accepts any 6 digits</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Transaction detail — double-entry view (small)                       */
/* ------------------------------------------------------------------ */
export function TransactionDetailModal({ open, onClose, tx }: { open: boolean; onClose: () => void; tx: Tx | null }) {
  return (
    <Modal open={open} onClose={onClose} title="Transaction" sub={tx ? `${tx.ref} · ${tx.at}` : ""} size="sm"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
      {tx && (
        <>
          <div className="overflow-hidden rounded-xl border border-border-subtle text-sm">
            <div className="flex items-center justify-between gap-3 bg-surface-2 px-3.5 py-2.5">
              <span className="ny-hud">Debit</span>
              <span className="font-semibold">{tx.type === "mgr-payout" || tx.type === "dividend" ? "Pool / Sacco capital" : `${channelMeta[tx.channel].label} clearing`}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-3.5 py-2.5">
              <span className="ny-hud">Credit</span>
              <span className="font-semibold">{tx.who}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border-subtle bg-[rgba(31,77,58,0.06)] px-3.5 py-3">
              <span className="ny-hud">Amount</span>
              <span className="ny-num ny-display text-lg">{kes(tx.amount)}</span>
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-border-subtle px-3 py-2"><dt className="ny-hud">Group</dt><dd className="mt-0.5 font-medium">{tx.group}</dd></div>
            <div className="rounded-lg border border-border-subtle px-3 py-2"><dt className="ny-hud">Status</dt><dd className="mt-0.5 font-medium">{tx.status}</dd></div>
            <div className="rounded-lg border border-border-subtle px-3 py-2"><dt className="ny-hud">Ledger</dt><dd className="ny-num mt-0.5 font-medium">{tx.ledger}</dd></div>
            <div className="rounded-lg border border-border-subtle px-3 py-2"><dt className="ny-hud">Channel</dt><dd className="mt-0.5 font-medium">{channelMeta[tx.channel].label}</dd></div>
          </dl>
          <p className="ny-hud mt-3">Balanced by construction · every post links back to its group</p>
        </>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Audit detail — append-only row (small)                               */
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
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED trail · backend Phase 2</p>
    </Modal>
  );
}
