"use client";

import { useState } from "react";
import { AlertTriangle, BadgeCheck, Check, Download, FileText, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import { kes } from "@/lib/format";
import {
  RECIPIENT_OPTIONS,
  TAGS,
  fmtDate,
  monthLabel,
  type AuditEntry,
  type ChannelSeed,
  type Digest,
  type Exception,
  type Job,
  type MonthRow,
  type Note,
  type SyncState,
  type Tx,
  type Branch,
} from "@/data/dashboard/records";
import { Bar } from "./charts";

/* ------------------------------------------------------------------ */
/* R1 — Resolve a reconciliation exception (medium)                      */
/* ------------------------------------------------------------------ */
type ResolveAction = "post" | "match" | "ignore";

export function ResolveModal({
  exc,
  channelName,
  onResolve,
  onClose,
}: {
  exc: Exception;
  channelName: string;
  onResolve: (action: string, reason: string) => void;
  onClose: () => void;
}) {
  const [pick, setPick] = useState<ResolveAction>("post");
  const [reason, setReason] = useState("");
  const needsReason = pick !== "post";
  const ok = !needsReason || reason.trim().length >= 6;
  const options: { id: ResolveAction; label: string; body: string }[] = [
    { id: "post", label: "Post to ledger", body: "Create the missing ledger entry now, with the statement line as its source." },
    { id: "match", label: "Match to a ledger post", body: "The money is already recorded under another ref. Link the two." },
    { id: "ignore", label: "Mark duplicate and ignore", body: "The same receipt was replayed. It will not be counted twice." },
  ];
  const picked = options.find((o) => o.id === pick) ?? options[0];

  return (
    <Modal
      open
      onClose={onClose}
      title="Resolve this exception"
      sub={`${exc.ref} · ${channelName} · ${kes(exc.amount)}`}
      size="md"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!ok} onClick={() => onResolve(picked.label, reason)}>
            <Check className="h-3.5 w-3.5" /> Resolve
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        {exc.statement}. {exc.detail}.
      </p>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setPick(o.id)}
            className={`rounded-xl border p-3 text-left transition ${pick === o.id ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}
          >
            <span className="block text-sm font-semibold">{o.label}</span>
            <span className="mt-1 block text-xs leading-relaxed text-text-secondary">{o.body}</span>
          </button>
        ))}
      </div>
      {needsReason && (
        <div className="mt-4">
          <label className="ny-label" htmlFor="rs-reason">
            Reason (logged)
          </label>
          <input id="rs-reason" className="ny-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Replayed receipt from the M-Pesa retry" />
        </div>
      )}
      <p className="ny-chip ny-chip-sim mt-4">SIMULATED · writes an audit row with the actor and the reason</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* R2 — KRA tax export stub (small)                                      */
/* ------------------------------------------------------------------ */
export function KraModal({ onQueue, onClose }: { onQueue: (year: number) => void; onClose: () => void }) {
  const [year, setYear] = useState(2025);
  return (
    <Modal
      open
      onClose={onClose}
      title="KRA-ready tax export"
      sub="Stub. The iTax layout connects in Phase 2."
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onQueue(year)}>
            <FileText className="h-3.5 w-3.5" /> Queue for {year}
          </button>
        </>
      }
    >
      <span className="ny-label">Tax year</span>
      <div className="flex flex-wrap gap-2">
        {[2024, 2025].map((y) => (
          <button key={y} type="button" onClick={() => setYear(y)} className={`ny-chip ny-touch ${year === y ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
            {y}
          </button>
        ))}
      </div>
      <div className="ny-inset mt-4 px-3.5 py-3 text-sm leading-relaxed text-text-secondary">
        Lists every money-in and money-out line for the year, grouped by source. Receipts and notes stay attached to each line.
      </div>
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · KRA submission is not connected in Phase 1</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* R3 — One month, opened from the cash-flow curve or the bars (small)    */
/* ------------------------------------------------------------------ */
export function MonthModal({ row, topBucket, onView, onClose }: { row: MonthRow; topBucket: string; onView: () => void; onClose: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      title={`${monthLabel(row.key)} 2025`}
      sub={`${row.count} ledger lines · largest type: ${topBucket}`}
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onView}>
            Show these lines in the table
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="ny-inset px-3 py-2.5">
          <p className="ny-hud !text-[0.5rem]">Money in</p>
          <p className="ny-num font-semibold text-success">{kes(row.inTotal)}</p>
        </div>
        <div className="ny-inset px-3 py-2.5">
          <p className="ny-hud !text-[0.5rem]">Money out</p>
          <p className="ny-num font-semibold text-danger">{kes(row.outTotal)}</p>
        </div>
        <div className="ny-inset px-3 py-2.5">
          <p className="ny-hud !text-[0.5rem]">Net for the month</p>
          <p className="ny-num font-semibold">{kes(row.net)}</p>
        </div>
        <div className="ny-inset px-3 py-2.5">
          <p className="ny-hud !text-[0.5rem]">Balance at month end</p>
          <p className="ny-num font-semibold">{kes(row.cumulative + 1250000)}</p>
        </div>
      </div>
      <div className="mt-4">
        <Bar value={row.inTotal} max={Math.max(1, row.inTotal, row.outTotal)} />
        <p className="ny-hud mt-1.5 !text-[0.52rem]">In is {kes(row.inTotal)} · out is {kes(row.outTotal)}</p>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* R4 — One branch in one month, from the heat table (small)              */
/* ------------------------------------------------------------------ */
export function HeatModal({
  branch,
  monthKey,
  rows,
  onOpenTx,
  onClose,
}: {
  branch: Branch;
  monthKey: string;
  rows: Tx[];
  onOpenTx: (id: string) => void;
  onClose: () => void;
}) {
  const total = rows.reduce((s, t) => s + t.amount, 0);
  return (
    <Modal open onClose={onClose} title={`${branch} · ${monthLabel(monthKey)}`} sub={`${rows.length} lines · ${kes(total)} moved`} size="sm"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Done
        </button>
      }
    >
      {rows.length === 0 && <p className="ny-inset px-4 py-6 text-center text-sm text-text-secondary">Nothing moved from this branch this month.</p>}
      <ul className="space-y-1.5">
        {rows.slice(0, 8).map((t) => (
          <li key={t.id}>
            <button type="button" onClick={() => onOpenTx(t.id)} className="gd-section-item w-full text-left">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{t.label} · {t.memberName}</span>
                <span className="ny-hud block !text-[0.55rem]">{fmtDate(t.date)} · {t.ref}</span>
              </span>
              <span className="ny-num shrink-0 text-sm font-semibold">{kes(t.amount)}</span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* R5 — One channel's sync state, explained (small)                       */
/* ------------------------------------------------------------------ */
const STATE_TEXT: Record<SyncState, string> = {
  SYNCED: "The statement and the ledger agree, and the statement was pulled recently.",
  DRIFT: "The statement and the ledger disagree on at least one line. Resolve them to get back to synced.",
  STALE: "No statement has been imported for more than two days. Import one to see current status.",
};

export function ChannelModal({
  channel,
  state,
  openList,
  onImport,
  onClose,
}: {
  channel: ChannelSeed;
  state: SyncState;
  openList: Exception[];
  onImport: () => void;
  onClose: () => void;
}) {
  const tone = state === "SYNCED" ? "ny-chip-ok" : state === "DRIFT" ? "ny-chip-warn" : "ny-chip-danger";
  return (
    <Modal
      open
      onClose={onClose}
      title={channel.label}
      sub={`Last sync ${fmtDate(channel.lastSync)} · ${channel.detail}`}
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          {channel.sim && (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onImport}>
              Import a statement
            </button>
          )}
        </>
      }
    >
      <span className={`ny-chip ${tone} ${state !== "SYNCED" ? "ny-pulse" : ""}`}>{state}</span>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">{STATE_TEXT[state]}</p>
      <p className="ny-hud mt-4">Open on this channel</p>
      <ul className="mt-2 space-y-1.5">
        {openList.map((e) => (
          <li key={e.id} className="ny-inset flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <span className="truncate">{e.statement}</span>
            <span className="ny-num shrink-0 font-semibold">{kes(e.amount)}</span>
          </li>
        ))}
        {openList.length === 0 && <li className="ny-inset px-3 py-3 text-sm text-text-secondary">Nothing open on this channel.</li>}
      </ul>
      {!channel.sim && <p className="ny-chip ny-chip-ok mt-4">Local ledger · always reconciled by construction</p>}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* R6 — Add a journal note to a transaction (medium)                     */
/* ------------------------------------------------------------------ */
export function NoteModal({
  options,
  preselect,
  onSave,
  onClose,
}: {
  options: Tx[];
  preselect: string | null;
  onSave: (txId: string, text: string, tags: string[]) => void;
  onClose: () => void;
}) {
  const [txId, setTxId] = useState(preselect ?? options[0]?.id ?? "");
  const [tags, setTags] = useState<string[]>([]);
  const [text, setText] = useState("");
  const ok = txId !== "" && text.trim().length >= 4;
  return (
    <Modal
      open
      onClose={onClose}
      title="Add a journal note"
      sub="Notes live with the transaction and show in the audit trail"
      size="md"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!ok} onClick={() => onSave(txId, text, tags)}>
            <Check className="h-3.5 w-3.5" /> Save note
          </button>
        </>
      }
    >
      <label className="ny-label" htmlFor="nt-tx">Transaction</label>
      <select id="nt-tx" className="ny-select" value={txId} onChange={(e) => setTxId(e.target.value)}>
        {options.map((t) => (
          <option key={t.id} value={t.id}>
            {fmtDate(t.date)} · {t.label} · {t.memberName} · {kes(t.amount)}
          </option>
        ))}
      </select>
      <span className="ny-label mt-4">Tags</span>
      <div className="flex flex-wrap gap-1.5">
        {TAGS.map((tag) => {
          const on = tags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={on}
              onClick={() => setTags((prev) => (on ? prev.filter((x) => x !== tag) : [...prev, tag]))}
              className={`ny-chip ny-touch transition ${on ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"}`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <label className="ny-label mt-4" htmlFor="nt-text">Note</label>
      <textarea id="nt-text" className="ny-textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="What should the treasurer or the tax return know about this line?" />
      <p className="ny-chip ny-chip-sim mt-3">Saved locally · the family sees it in the journal</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* R7 — Delete a note (small, danger, reason required)                   */
/* ------------------------------------------------------------------ */
export function NoteDeleteModal({ note, onConfirm, onClose }: { note: Note; onConfirm: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  return (
    <Modal
      open
      onClose={onClose}
      title="Delete this note?"
      sub="The note goes, the audit row stays"
      size="sm"
      tone="danger"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Keep it
          </button>
          <button type="button" className="ny-btn ny-btn-danger ny-btn-sm" disabled={reason.trim().length < 6} onClick={() => onConfirm(reason)}>
            <Trash2 className="h-3.5 w-3.5" /> Delete note
          </button>
        </>
      }
    >
      <p className="ny-inset px-3.5 py-3 text-sm italic text-text-secondary">&ldquo;{note.text}&rdquo;</p>
      <label className="ny-label mt-4" htmlFor="nd-reason">Reason (logged)</label>
      <input id="nd-reason" className="ny-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Duplicate of the reconciliation note" />
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* R8 — Weekly digest settings (small, SIMULATED delivery)               */
/* ------------------------------------------------------------------ */
export function DigestModal({ config, onSave, onClose }: { config: Digest; onSave: (d: Digest) => void; onClose: () => void }) {
  const [on, setOn] = useState(config.on);
  const [day, setDay] = useState(config.day);
  const [time, setTime] = useState(config.time);
  const [who, setWho] = useState<string[]>(config.recipients);
  return (
    <Modal
      open
      onClose={onClose}
      title="Weekly digest"
      sub="A short lesson-style summary of the week's money"
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onSave({ on, day, time, recipients: who })}>
            Save digest
          </button>
        </>
      }
    >
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3">
        <span className="text-sm font-semibold">Digest is {on ? "on" : "off"}</span>
        <button type="button" role="switch" aria-checked={on} aria-label="Weekly digest" className="rc-switch" onClick={() => setOn((v) => !v)} />
      </div>
      <span className="ny-label mt-4">Send on</span>
      <div className="flex flex-wrap gap-1.5">
        {["Mon", "Wed", "Fri", "Sun"].map((d) => (
          <button key={d} type="button" onClick={() => setDay(d)} className={`ny-chip ny-touch ${day === d ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
            {d}
          </button>
        ))}
      </div>
      <label className="ny-label mt-4" htmlFor="dg-time">Time (EAT)</label>
      <select id="dg-time" className="ny-select" value={time} onChange={(e) => setTime(e.target.value)}>
        {["07:00", "12:00", "18:00"].map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <span className="ny-label mt-4">To</span>
      <div className="flex flex-wrap gap-1.5">
        {RECIPIENT_OPTIONS.map((r) => {
          const on2 = who.includes(r);
          return (
            <button key={r} type="button" aria-pressed={on2} onClick={() => setWho((prev) => (on2 ? prev.filter((x) => x !== r) : [...prev, r]))} className={`ny-chip ny-touch ${on2 ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
              {r}
            </button>
          );
        })}
      </div>
      <p className="ny-chip ny-chip-sim mt-4">SIMULATED · delivery goes out with the messaging backend in Phase 2</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* R9 — One export job (small); CSV downloads for real, the rest stub      */
/* ------------------------------------------------------------------ */
export function JobModal({ job, onDownload, onClose }: { job: Job; onDownload: () => void; onClose: () => void }) {
  const canDownload = job.status === "done" && job.format === "CSV";
  return (
    <Modal
      open
      onClose={onClose}
      title={job.label}
      sub={`${job.id} · ${job.format} · created ${fmtDate(job.created)}`}
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          {canDownload && (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onDownload}>
              <Download className="h-3.5 w-3.5" /> Download CSV
            </button>
          )}
        </>
      }
    >
      <div className="flex items-center justify-between gap-3">
        <span className={`ny-chip ${job.status === "done" ? "ny-chip-ok" : job.status === "running" ? "ny-chip-info" : "ny-chip-neutral"}`}>{job.status}</span>
        <span className="ny-num text-sm font-semibold">{job.progress}%</span>
      </div>
      <div className="mt-3">
        <Bar value={job.progress} max={100} gold={job.status === "done"} />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-text-secondary">
        {job.format === "CSV" && "CSV is built in your browser from the local ledger, so the download is real and nothing leaves this device."}
        {job.format !== "CSV" && "This format is queued locally. The signed file is produced by the backend in Phase 2."}
      </p>
      {!canDownload && <p className="ny-chip ny-chip-sim mt-3">{job.format === "CSV" ? "Download opens when the job finishes" : "SIMULATED · file generation connects in Phase 2"}</p>}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* R10 — Ledger balance proof (small)                                    */
/* ------------------------------------------------------------------ */
export function BalanceModal({ opening, totalIn, totalOut, balanceNow, onClose }: { opening: number; totalIn: number; totalOut: number; balanceNow: number; onClose: () => void }) {
  const expected = opening + totalIn - totalOut;
  const ok = expected === balanceNow;
  return (
    <Modal open onClose={onClose} title="Ledger balance check" sub="Opening, plus money in, minus money out, must equal the balance now" size="sm"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
      <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
        {[
          ["Opening balance (1 Jun 2025)", kes(opening)],
          ["Plus money in", kes(totalIn)],
          ["Less money out", `− ${kes(totalOut)}`],
          ["Expected balance", kes(expected)],
          ["Balance now (ledger)", kes(balanceNow)],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <dt className="text-text-secondary">{k}</dt>
            <dd className="ny-num font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <p className={`ny-chip mt-3 ${ok ? "ny-chip-ok" : "ny-chip-danger"}`}>{ok ? "Balanced · every post has two sides" : "Out of balance · investigate before exporting"}</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* R11 — Audit row detail (small)                                        */
/* ------------------------------------------------------------------ */
export function AuditModal({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={`Audit · ${entry.action}`} sub={`${entry.ref} · ${entry.at}`} size="sm"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
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
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* R12 — Decision confirmation (small); the only feedback for many actions */
/* ------------------------------------------------------------------ */
export function DecisionModal({ data, onClose }: { data: { title: string; body: string; tone: "ok" | "warn" }; onClose: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      title={data.title}
      size="sm"
      tone={data.tone === "warn" ? "danger" : "gold"}
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="rounded-xl border border-border-subtle bg-surface-2 p-4 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[rgba(212,164,55,0.2)]">
          {data.tone === "ok" ? <BadgeCheck className="h-6 w-6 text-[#7a5b12]" /> : <AlertTriangle className="h-6 w-6 text-danger" />}
        </span>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{data.body}</p>
      </div>
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · no money moved in Phase 1</p>
    </Modal>
  );
}

