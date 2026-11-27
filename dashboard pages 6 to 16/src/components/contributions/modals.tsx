"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  FileDown,
  Filter,
  Fingerprint,
  Megaphone,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import {
  audit as allAudit,
  channelLabel,
  channels,
  contributors as topContributors,
  causes as seedCauses,
  kes,
  ledger as allLedger,
  pct,
  purposeLabel,
  purposeTone,
  reconciliation,
  statusTone,
  type AuditEntry,
  type Cause,
  type Channel,
  type ConStatus,
  type Contribution,
  type LedgerEntry,
  type Payout,
} from "@/data/dashboard/contributions";
import { Drawer, Modal } from "@/components/ui/overlay";
import { Ring, Tabs } from "@/components/ui/primitives";

/* ------------------------------------------------------------------ */
/* S5 — Cause detail drawer (tabs)                                      */
/* ------------------------------------------------------------------ */
export function CauseDrawer({
  cause,
  open,
  onClose,
  contributions,
  payouts,
  onContribute,
  onBroadcast,
  onRelease,
  onDelete,
  onAudit,
}: {
  cause: Cause | null;
  open: boolean;
  onClose: () => void;
  contributions: Contribution[];
  payouts: Payout[];
  onContribute: (id: string) => void;
  onBroadcast: (c: Cause) => void;
  onRelease: (p: Payout) => void;
  onDelete: (c: Cause) => void;
  onAudit: (a: AuditEntry) => void;
}) {
  const [tab, setTab] = useState("overview");
  if (!cause) return null;

  const rows = contributions.filter((c) => c.causeId === cause.id);
  const pays = payouts.filter((p) => p.causeId === cause.id);
  const audits = allAudit.filter((a) => a.entity === cause.ref || rows.some((r) => r.ref === a.entity));
  const p = pct(cause.raised, cause.goal);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={cause.title}
      sub={`${cause.ref} · ${purposeLabel[cause.purpose]} · ${cause.branch} branch`}
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onDelete(cause)}>
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
          <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onBroadcast(cause)}>
            <Megaphone className="h-3.5 w-3.5" /> Tell contributors
          </button>
          <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => onContribute(cause.id)}>
            Contribute <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </>
      }
    >
      <Tabs
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "contributors", label: `Contributors ${rows.length ? `(${rows.length})` : ""}` },
          { id: "payouts", label: `Payouts ${pays.length ? `(${pays.length})` : ""}` },
          { id: "comms", label: "Comms" },
          { id: "audit", label: "Audit" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="pt-4">
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="ny-inset flex items-center gap-4 px-4 py-3.5">
              <Ring pct={p} size={72} stroke={7} gold={p >= 100} label={`${p}%`} />
              <div className="min-w-0">
                <p className="ny-num ny-display text-xl leading-none">{kes(cause.raised)}</p>
                <p className="ny-hud mt-1">of {kes(cause.goal)} goal</p>
                <p className="mt-1.5 text-sm text-text-secondary">
                  {cause.contributors} contributors · {kes(Math.max(0, cause.goal - cause.raised))} to go
                </p>
              </div>
              <span className={`ny-chip ${cause.status === "met" || cause.status === "paid-out" ? "ny-chip-ok" : cause.status === "closing" ? "ny-chip-warn" : "ny-chip-brand"} ml-auto ny-pulse`}>
                {cause.status}
              </span>
            </div>

            <p className="text-sm leading-relaxed text-text-secondary">{cause.blurb}</p>

            <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                ["Beneficiary", cause.beneficiary + (cause.beneficiaryNote ? ` (${cause.beneficiaryNote})` : "")],
                ["Organizer", cause.organizer],
                ["Deadline", cause.deadline],
                ["Scope", cause.scope],
                ["Pays out to", cause.payoutTo],
                ["Branch", cause.branch],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                  <dt className="ny-hud">{k}</dt>
                  <dd className="mt-1 text-sm font-medium text-text-primary">{v}</dd>
                </div>
              ))}
            </dl>

            {p >= 100 && (
              <div className="rounded-xl border border-dashed border-[rgba(212,164,55,0.65)] bg-[rgba(212,164,55,0.1)] px-4 py-3">
                <p className="text-sm font-semibold text-[#7a5b12]">Goal met — payout is ready</p>
                <p className="mt-1 text-xs leading-relaxed text-[#7a5b12]">
                  Release {kes(cause.raised)} to {cause.payoutTo}. Requires a 6-digit 2FA code and writes a double-entry
                  ledger post + audit row.
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "contributors" && (
          <div className="space-y-2">
            {rows.length === 0 && (
              <div className="ny-inset px-4 py-8 text-center">
                <p className="ny-display text-base">No contributions yet on this cause</p>
                <p className="mt-1 text-sm text-text-secondary">Be the first — the tally updates live.</p>
                <button type="button" className="ny-btn ny-btn-accent ny-btn-sm mt-3" onClick={() => onContribute(cause.id)}>
                  Contribute now
                </button>
              </div>
            )}
            {rows.map((r) => (
              <div key={r.ref} className="flex items-start gap-3 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-primary text-[0.7rem] font-bold text-on-brand">
                  {r.contributor.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.contributor}</p>
                  <p className="ny-hud !text-[0.56rem]">
                    {r.date} · {channelLabel[r.channel]}
                  </p>
                  {r.message && <p className="mt-1 text-xs italic text-text-secondary">“{r.message}”</p>}
                </div>
                <div className="shrink-0 text-right">
                  <p className="ny-num text-sm font-semibold">{kes(r.amount)}</p>
                  <span className={`ny-chip mt-1 ${statusTone[r.status]}`}>{r.status}</span>
                </div>
              </div>
            ))}
            <p className="ny-hud pt-1">Full directory → T-3 members · receipts → T-12 records</p>
          </div>
        )}

        {tab === "payouts" && (
          <div className="space-y-2">
            {pays.length === 0 && (
              <div className="ny-inset px-4 py-8 text-center">
                <p className="ny-display text-base">No payouts scheduled</p>
                <p className="mt-1 text-sm text-text-secondary">A payout unlocks when the goal is met or an admin triggers it.</p>
              </div>
            )}
            {pays.map((pay) => (
              <div key={pay.ref} className="rounded-lg border border-border-subtle bg-surface-1 px-3.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="ny-num ny-display text-lg">{kes(pay.amount)}</p>
                  <span className={`ny-chip ${pay.status === "settled" ? "ny-chip-ok" : pay.status === "ready" ? "ny-chip-warn" : "ny-chip-danger"}`}>
                    {pay.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">{pay.destination}</p>
                <p className="ny-hud mt-1">
                  {pay.ref} · {pay.at} · {pay.ledgerRef}
                </p>
                {pay.status === "ready" && (
                  <button type="button" className="ny-btn ny-btn-primary ny-btn-sm mt-2.5" onClick={() => onRelease(pay)}>
                    <ShieldCheck className="h-3.5 w-3.5" /> Release payout
                  </button>
                )}
              </div>
            ))}
            <div className="ny-inset px-3.5 py-3">
              <p className="ny-hud">Double-entry preview</p>
              <p className="mt-1.5 text-sm text-text-secondary">
                Debit <span className="font-semibold text-text-primary">Cause escrow</span> → Credit{" "}
                <span className="font-semibold text-text-primary">M-Pesa B2C / bank clearing</span>. Imbalance is
                structurally impossible; an alarm banner surfaces if debits ≠ credits.
              </p>
            </div>
          </div>
        )}

        {tab === "comms" && (
          <div className="space-y-3">
            <div className="ny-inset px-4 py-3.5">
              <p className="text-sm font-semibold">Tell the {cause.contributors} contributors about this cause</p>
              <p className="mt-1 text-sm text-text-secondary">
                Resolves to a per-recipient fanout with delivery receipts — WhatsApp where capable, SMS otherwise.
              </p>
              <button type="button" className="ny-btn ny-btn-primary ny-btn-sm mt-3" onClick={() => onBroadcast(cause)}>
                <Megaphone className="h-3.5 w-3.5" /> Compose broadcast
              </button>
            </div>
            <ul className="space-y-2">
              {[
                { t: "Goal reached — thank you", at: "12 Nov · 18:00", d: "243 in-app · 61 WhatsApp · 0 failed" },
                { t: "Deadline in 7 days", at: "23 Nov · 08:00", d: "scheduled · SIMULATED" },
              ].map((b) => (
                <li key={b.t} className="rounded-lg border border-border-subtle bg-surface-1 px-3.5 py-3">
                  <p className="text-sm font-semibold">{b.t}</p>
                  <p className="ny-hud mt-1">
                    {b.at} · {b.d}
                  </p>
                </li>
              ))}
            </ul>
            <p className="ny-chip ny-chip-sim">Broadcast fanout SIMULATED · Phase 2 wires T-14</p>
          </div>
        )}

        {tab === "audit" && (
          <div className="space-y-1.5">
            {(audits.length ? audits : allAudit.slice(0, 4)).map((a) => (
              <button key={a.ref} type="button" className="cc-audit-row w-full rounded-lg border border-border-subtle text-left" onClick={() => onAudit(a)}>
                <span className={`h-2 w-2 shrink-0 rounded-full ${a.tone === "gold" ? "bg-brand-accent" : a.tone === "red" ? "bg-danger" : "bg-text-tertiary"} mt-1.5`} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-text-primary">{a.action}</span>
                  <span className="block text-xs text-text-secondary">{a.detail}</span>
                  <span className="ny-hud mt-1 block !text-[0.56rem]">{a.at} · {a.actor}</span>
                </span>
                <span className="ny-hud !text-[0.55rem]">{a.ref}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* Receipt — issued after a SIMULATED contribution                      */
/* ------------------------------------------------------------------ */
export function ReceiptModal({
  data,
  causeTitle,
  onClose,
}: {
  data: (Contribution & { note?: string }) | null;
  causeTitle: string;
  onClose: () => void;
}) {
  if (!data) return null;
  return (
    <Modal
      open={!!data}
      onClose={onClose}
      title="Contribution receipt"
      sub={`${data.ref} · posted to the escrow ledger`}
      size="sm"
      tone="gold"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="rounded-xl border border-border-subtle bg-surface-2 p-4 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[rgba(212,164,55,0.2)]">
          <BadgeCheck className="h-6 w-6 text-[#7a5b12]" />
        </span>
        <p className="ny-num ny-display mt-3 text-3xl leading-none">{kes(data.amount)}</p>
        <p className="mt-1.5 text-sm text-text-secondary">to {causeTitle}</p>
        <span className={`ny-chip mt-3 ${statusTone[data.status as ConStatus]}`}>{data.status}</span>
      </div>
      <dl className="mt-3 divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
        {[
          ["Receipt", data.receipt],
          ["Ledger", data.ledgerRef],
          ["Channel", channelLabel[data.channel as Channel]],
          ["Date", data.date],
          ["Contributor", data.contributor],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <dt className="text-text-secondary">{k}</dt>
            <dd className="ny-num text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · no money moved · backend Phase 2</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Payout release — 2FA + 4-eyes                                        */
/* ------------------------------------------------------------------ */
export function PayoutReleaseModal({
  payout,
  causeTitle,
  onClose,
  onRelease,
}: {
  payout: Payout | null;
  causeTitle: string;
  onClose: () => void;
  onRelease: (p: Payout) => void;
}) {
  const [code, setCode] = useState("");
  const [reason, setReason] = useState("");
  if (!payout) return null;
  const ok = code.replace(/\D/g, "").length === 6;

  return (
    <Modal
      open={!!payout}
      onClose={onClose}
      title="Release payout"
      sub={`${payout.ref} · ${kes(payout.amount)} → ${payout.destination}`}
      size="md"
      tone="danger"
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
              onRelease(payout);
              setCode("");
              onClose();
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Confirm release
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-xl border border-[rgba(198,40,40,0.3)] bg-[rgba(198,40,40,0.07)] px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
        <p className="text-sm leading-relaxed text-text-secondary">
          Money-touching action — requires <strong className="text-text-primary">2FA</strong> and writes an audit entry
          with actor, before/after and reason. In Phase 1 the transfer resolves SIMULATED.
        </p>
      </div>

      <dl className="mt-3 divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
        {[
          ["Cause", causeTitle],
          ["Amount", kes(payout.amount)],
          ["Destination", payout.destination],
          ["Channel", channelLabel[payout.channel]],
          ["Ledger", payout.ledgerRef],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
            <dt className="text-text-secondary">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <label className="ny-label" htmlFor="pay-code">
          6-digit authenticator code
        </label>
        <div className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5 text-brand-primary" />
          <input
            id="pay-code"
            inputMode="numeric"
            className="ny-input ny-num tracking-[0.4em]"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          />
        </div>
        <p className="ny-hud mt-1.5">Dev mode: any 6 digits pass · real TOTP lands in Phase 2</p>
      </div>

      <div className="mt-3">
        <label className="ny-label" htmlFor="pay-reason">Reason (logged)</label>
        <input id="pay-reason" className="ny-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Goal met — release to organizer" />
      </div>
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED B2C · backend Phase 2</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Reconciliation — M-Pesa statement diff                               */
/* ------------------------------------------------------------------ */
export function ReconcileModal({
  open,
  onClose,
  onResolve,
}: {
  open: boolean;
  onClose: () => void;
  onResolve: (label: string) => void;
}) {
  const tone = { matched: "ny-chip-ok", missing: "ny-chip-danger", mismatch: "ny-chip-warn", duplicate: "ny-chip-info" } as const;
  const issues = reconciliation.filter((r) => r.match !== "matched").length;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reconciliation"
      sub="M-Pesa statement vs ledger · SIMULATED pull"
      size="lg"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onResolve("Re-run pull (SIMULATED)")}>
            Re-pull statement
          </button>
        </>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="ny-chip ny-chip-ok">{reconciliation.length - issues} matched</span>
        <span className="ny-chip ny-chip-danger ny-pulse">{issues} exceptions</span>
        <span className="ny-chip ny-chip-sim">SIMULATED statement feed</span>
      </div>
      <div className="cc-table-wrap ny-scroll max-h-[46vh] overflow-auto">
        <table className="cc-table">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Statement line</th>
              <th>Ledger side</th>
              <th className="text-right">Amount</th>
              <th>Match</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {reconciliation.map((r, i) => (
              <tr key={`${r.ref}-${i}`}>
                <td data-label="Ref" className="ny-hud !text-[0.6rem]">{r.ref}</td>
                <td data-label="Statement">
                  <span className="block font-medium">{r.statement}</span>
                  <span className="ny-hud !text-[0.56rem]">{r.at}</span>
                </td>
                <td data-label="Ledger" className={r.ledgerSide.startsWith("—") ? "text-danger" : ""}>
                  {r.ledgerSide}
                </td>
                <td data-label="Amount" className="ny-num text-right font-semibold">{kes(r.amount)}</td>
                <td data-label="Match">
                  <span className={`ny-chip ${tone[r.match]}`}>{r.match}</span>
                </td>
                <td data-label="" className="text-right">
                  {r.match !== "matched" && (
                    <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onResolve(`${r.ref} · ${r.match}`)}>
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ny-hud mt-3">Every resolve writes an audit row · export lands in T-12 records</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Export                                                               */
/* ------------------------------------------------------------------ */
export function ExportModal({ open, onClose, onExport }: { open: boolean; onClose: () => void; onExport: (f: string) => void }) {
  const [format, setFormat] = useState("CSV");
  const [cols, setCols] = useState<string[]>(["ref", "date", "contributor", "amount", "channel", "status"]);
  const all = ["ref", "date", "contributor", "cause", "amount", "channel", "status", "receipt", "ledgerRef", "message"];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export contributions"
      sub="Queued locally · HMAC-signed file lands in Phase 2"
      size="md"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onExport(format)}>
            <FileDown className="h-3.5 w-3.5" /> Generate {format}
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

      <span className="ny-label mt-4">Columns</span>
      <div className="flex flex-wrap gap-1.5">
        {all.map((c) => {
          const on = cols.includes(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCols((prev) => (on ? prev.filter((x) => x !== c) : [...prev, c]))}
              className={`ny-chip ${on ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}
            >
              {c}
            </button>
          );
        })}
      </div>
      <div className="ny-inset mt-4 px-3.5 py-3 text-sm text-text-secondary">
        {cols.length} columns · {format} · KES amounts · EAT timestamps. KRA-ready layout is a stub until the backend
        exists.
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Capability matrix                                                    */
/* ------------------------------------------------------------------ */
export function ChannelMatrixModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const caps: { id: Channel; read: boolean; write: boolean; transfer: boolean }[] = [
    { id: "mpesa", read: true, write: true, transfer: true },
    { id: "airtel", read: true, write: true, transfer: false },
    { id: "bank", read: false, write: true, transfer: true },
    { id: "internal", read: true, write: true, transfer: true },
  ];
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Channel capability matrix"
      sub="What each rail allows when the backend is wired"
      size="md"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
      <div className="cc-table-wrap">
        <table className="cc-table">
          <thead>
            <tr>
              <th>Rail</th>
              <th>Read</th>
              <th>Money in</th>
              <th>Transfer</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {caps.map((c) => (
              <tr key={c.id}>
                <td data-label="Rail" className="font-semibold">{channelLabel[c.id]}</td>
                <td data-label="Read">{c.read ? "✓" : "—"}</td>
                <td data-label="Money in">{c.write ? "✓" : "—"}</td>
                <td data-label="Transfer">{c.transfer ? "✓" : "—"}</td>
                <td data-label="Status">
                  <span className="ny-chip ny-chip-sim">SIMULATED</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ny-inset mt-3 px-3.5 py-3 text-sm text-text-secondary">
        Every ✓ is a section that renders fully today and resolves to “Ready — connects when the backend is wired”.
        Nothing here ever claims a real send.
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Broadcast to contributors                                            */
/* ------------------------------------------------------------------ */
export function BroadcastModal({
  cause,
  onClose,
  onSent,
}: {
  cause: Cause | null;
  onClose: () => void;
  onSent: (summary: string) => void;
}) {
  const [channel, setChannel] = useState<"whatsapp" | "sms" | "email" | "in-app">("whatsapp");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  if (!cause) return null;
  const audience = cause.contributors;
  const cost = channel === "sms" ? Math.ceil((audience * 1.2) * 100) / 100 : 0;

  return (
    <Modal
      open={!!cause}
      onClose={() => {
        setSent(false);
        setBody("");
        onClose();
      }}
      title="Tell the contributors"
      sub={`${cause.title} · audience ${audience} people`}
      size="md"
      footer={
        <>
          <button
            type="button"
            className="ny-btn ny-btn-ghost ny-btn-sm"
            onClick={() => {
              setSent(false);
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-accent ny-btn-sm"
            disabled={!body.trim()}
            onClick={() => {
              setSent(true);
              onSent(`${audience} recipients · ${channel.toUpperCase()} · SIMULATED`);
            }}
          >
            <Megaphone className="h-3.5 w-3.5" /> Send (SIMULATED)
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(["whatsapp", "sms", "email", "in-app"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChannel(c)}
            className={`rounded-lg border px-2 py-2.5 text-xs font-semibold capitalize transition ${
              channel === c ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <label className="ny-label mt-4" htmlFor="bc-body">
        Message · merge fields work: {"{first_name}"} {"{branch}"}
      </label>
      <textarea
        id="bc-body"
        className="ny-textarea"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={`Habari {first_name} — ${cause.title} is at ${pct(cause.raised, cause.goal)}%. Karibu kuunga mkono.`}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="ny-chip ny-chip-neutral">audience {audience}</span>
        {channel === "sms" && <span className="ny-chip ny-chip-warn">cost ≈ KES {cost.toFixed(2)}</span>}
        <span className="ny-chip ny-chip-sim">SIMULATED fanout</span>
      </div>

      {sent && (
        <div className="ny-inset mt-4 px-3.5 py-3">
          <p className="ny-hud">Delivery receipts (streamed)</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {topContributors.slice(0, 4).map((c, i) => (
              <li key={c.id} className="ny-row-in flex items-center justify-between gap-2" style={{ animationDelay: `${i * 220}ms` }}>
                <span className="truncate">{c.name}</span>
                <span className={`ny-chip ${i === 3 ? "ny-chip-warn" : "ny-chip-ok"}`}>{i === 3 ? "pending" : "delivered"}</span>
              </li>
            ))}
          </ul>
          <p className="ny-hud mt-2">+{Math.max(0, audience - 4)} more · proof refs are SIMULATED</p>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Contributor mini-profile                                             */
/* ------------------------------------------------------------------ */
export function ContributorModal({
  person,
  onClose,
}: {
  person: { name: string; branch: string; total: number; count: number; phone: string } | null;
  onClose: () => void;
}) {
  if (!person) return null;
  return (
    <Modal
      open={!!person}
      onClose={onClose}
      title={person.name}
      sub={`${person.branch} branch · ${person.phone}`}
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={onClose}>
            Open in members (T-3)
          </button>
        </>
      }
    >
      <div className="ny-inset grid grid-cols-2 gap-3 px-4 py-3.5">
        <span>
          <span className="ny-hud block">Lifetime giving</span>
          <span className="ny-num ny-display text-xl">{kes(person.total)}</span>
        </span>
        <span>
          <span className="ny-hud block">Contributions</span>
          <span className="ny-num ny-display text-xl">{person.count}</span>
        </span>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {seedCauses.slice(0, 3).map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle px-3 py-2.5">
            <span className="truncate">{c.title}</span>
            <span className="ny-chip ny-chip-brand shrink-0">{purposeLabel[c.purpose]}</span>
          </li>
        ))}
      </ul>
      <p className="ny-hud mt-3">Admin-gated fields (mobile, bank, PIN) cannot be self-edited — T-15</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Audit detail + ledger detail                                         */
/* ------------------------------------------------------------------ */
export function AuditDetailModal({ entry, onClose }: { entry: AuditEntry | null; onClose: () => void }) {
  if (!entry) return null;
  return (
    <Modal
      open={!!entry}
      onClose={onClose}
      title={`Audit · ${entry.action}`}
      sub={`${entry.ref} · ${entry.at}`}
      size="sm"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
      <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
        {[
          ["Actor", entry.actor],
          ["Action", entry.action],
          ["Entity", entry.entity],
          ["Detail", entry.detail],
          ["Timestamp", entry.at + " EAT"],
          ["IP / UA", "stub · append-only"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-3 px-3.5 py-2.5">
            <dt className="shrink-0 text-text-secondary">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="ny-chip ny-chip-sim mt-3">Append-only · HMAC export in Phase 2</p>
    </Modal>
  );
}

export function LedgerModal({ entry, onClose }: { entry: LedgerEntry | null; onClose: () => void }) {
  if (!entry) return null;
  return (
    <Modal
      open={!!entry}
      onClose={onClose}
      title="Double-entry post"
      sub={`${entry.ref} · ${entry.at}`}
      size="sm"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
      <div className="rounded-xl border border-border-subtle overflow-hidden text-sm">
        <div className="flex items-center justify-between gap-3 bg-surface-2 px-3.5 py-2.5">
          <span className="ny-hud">Debit</span>
          <span className="font-semibold">{entry.debit}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-3.5 py-2.5">
          <span className="ny-hud">Credit</span>
          <span className="font-semibold">{entry.credit}</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border-subtle bg-[rgba(31,77,58,0.06)] px-3.5 py-3">
          <span className="ny-hud">Amount</span>
          <span className="ny-num ny-display text-lg">{kes(entry.amount)}</span>
        </div>
      </div>
      <p className="ny-hud mt-3">Source {entry.source} · balance stays balanced by construction</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Delete cause — confirm with reason                                   */
/* ------------------------------------------------------------------ */
export function DeleteCauseModal({
  cause,
  onClose,
  onConfirm,
}: {
  cause: Cause | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  if (!cause) return null;
  return (
    <Modal
      open={!!cause}
      onClose={onClose}
      title="Remove this cause?"
      sub={cause.ref}
      size="sm"
      tone="danger"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Keep it
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-danger ny-btn-sm"
            disabled={reason.trim().length < 4}
            onClick={() => {
              onConfirm(reason);
              setReason("");
              onClose();
            }}
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove cause
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        {cause.contributors} people have given to <strong className="text-text-primary">{cause.title}</strong>. Removing
        hides it from the grid but keeps every ledger entry and audit row — money is never deleted, only archived.
      </p>
      <label className="ny-label mt-4" htmlFor="del-reason">
        Reason (required, logged)
      </label>
      <input
        id="del-reason"
        className="ny-input"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Raised elsewhere, duplicate of NY-CON-2025-00431"
      />
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Table filters drawer                                                 */
/* ------------------------------------------------------------------ */
export type Filters = { status: ConStatus | "all"; channel: Channel | "all"; purpose: string; q: string };

export function FiltersDrawer({
  open,
  onClose,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  value: Filters;
  onChange: (f: Filters) => void;
}) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...value, [k]: v });
  const active = Object.entries(value).filter(([, v]) => v !== "all" && v !== "").length;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter contributions"
      sub={`${active} filter${active === 1 ? "" : "s"} active`}
      footer={
        <>
          <button
            type="button"
            className="ny-btn ny-btn-ghost ny-btn-sm"
            onClick={() => onChange({ status: "all", channel: "all", purpose: "all", q: "" })}
          >
            Clear all
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
            Show results
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="ny-label" htmlFor="f-q">Search contributor, ref or receipt</label>
          <input id="f-q" className="ny-input" value={value.q} onChange={(e) => set("q", e.target.value)} placeholder="Faith, RKX7, NY-CON…" />
        </div>

        <div>
          <span className="ny-label">Status</span>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "initiated", "pending", "confirmed", "failed"] as const).map((s) => (
              <button key={s} type="button" onClick={() => set("status", s)} className={`ny-chip ny-touch ${value.status === s ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="ny-label">Channel</span>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "mpesa", "airtel", "bank", "internal"] as const).map((c) => (
              <button key={c} type="button" onClick={() => set("channel", c)} className={`ny-chip ny-touch ${value.channel === c ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                {c === "all" ? "any" : channelLabel[c]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="ny-label">Purpose</span>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => set("purpose", "all")} className={`ny-chip ny-touch ${value.purpose === "all" ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
              any
            </button>
            {Object.entries(purposeLabel).map(([k, v]) => (
              <button key={k} type="button" onClick={() => set("purpose", k)} className={`ny-chip ny-touch ${value.purpose === k ? "!bg-brand-primary !text-on-brand !border-transparent" : purposeTone[k as keyof typeof purposeTone]}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="ny-inset flex items-center gap-2.5 px-3.5 py-3">
          <Filter className="h-4 w-4 shrink-0 text-brand-primary" />
          <p className="text-xs leading-relaxed text-text-secondary">
            Filters apply instantly to the table behind this drawer. The drawer itself is deep-linked, so the back button
            closes it first and reload restores whichever cause or receipt you had open.
          </p>
        </div>

        <button type="button" className="ny-btn ny-btn-outline ny-btn-sm w-full" onClick={() => onChange({ status: "all", channel: "all", purpose: "all", q: "" })}>
          <X className="h-3.5 w-3.5" /> Reset everything
        </button>
      </div>
    </Drawer>
  );
}

export const emptyFilters: Filters = { status: "all", channel: "all", purpose: "all", q: "" };

/* Capability badge helper used in S7 */
export function SimBadge() {
  return <span className="ny-chip ny-chip-sim">SIMULATED · backend Phase 2</span>;
}

export const channelList = channels;
