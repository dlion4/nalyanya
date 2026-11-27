"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Upload } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import { Stepper } from "@/components/ui/primitives";
import { kes } from "@/lib/format";
import {
  ME_ID,
  applyFilters,
  channelLabel,
  channelSeeds,
  emptyFilters,
  roster,
  type Branch,
  type Channel,
  type JobFormat,
  type Tx,
} from "@/data/dashboard/records";

/* ------------------------------------------------------------------ */
/* W1 — Export wizard (scope → period → format → review), 4 steps          */
/* ------------------------------------------------------------------ */
const EXPORT_STEPS = ["Scope", "Period", "Format", "Review"];

export function ExportWizard({
  rows,
  onQueue,
  onDownload,
  onClose,
}: {
  rows: Tx[];
  onQueue: (job: { format: JobFormat; label: string; scope: string }) => void;
  onDownload: (list: Tx[], filename: string) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState<"family" | "branch" | "member">("family");
  const [branch, setBranch] = useState<Branch>("Nairobi");
  const [member, setMember] = useState(ME_ID);
  const [period, setPeriod] = useState<"all" | "quarter" | "month" | "custom">("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [format, setFormat] = useState<JobFormat>("CSV");
  const [alsoNow, setAlsoNow] = useState(true);

  const periodFrom = period === "quarter" ? "2025-09-01" : period === "month" ? "2025-11-01" : period === "custom" ? from : "";
  const periodTo = period === "custom" ? to : "";
  const scopeLabel = scope === "family" ? "Family" : scope === "branch" ? `${branch} branch` : roster.find((p) => p.id === member)?.name ?? "Member";
  const periodLabel =
    period === "all" ? "Jun–Nov 2025" : period === "quarter" ? "Last three months" : period === "month" ? "November 2025" : `${from || "start"} to ${to || "today"}`;
  const selected = applyFilters(
    rows,
    { ...emptyFilters, branch: scope === "branch" ? branch : "all", member: scope === "member" ? member : "all", from: periodFrom, to: periodTo },
    "all",
  );
  const canNext = step === 1 && period === "custom" ? from !== "" && to !== "" && from <= to : true;

  const queue = () => {
    onQueue({ format, label: `${scopeLabel} · ${periodLabel}`, scope: scopeLabel });
    if (alsoNow && format === "CSV") onDownload(selected, `nalyanya-${scopeLabel.toLowerCase().replace(/\s+/g, "-")}.csv`);
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Export records"
      sub="Four steps · CSV is real, the other formats queue for Phase 2"
      size="lg"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < EXPORT_STEPS.length - 1 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={queue}>
              <Check className="h-3.5 w-3.5" /> Queue export
            </button>
          )}
        </>
      }
    >
      <Stepper total={EXPORT_STEPS.length} current={step} labels={EXPORT_STEPS} />

      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-3">
            {(["family", "branch", "member"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setScope(s)} className={`rounded-xl border p-3.5 text-left transition ${scope === s ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                <span className="block text-sm font-semibold capitalize">{s === "family" ? "The whole family" : s === "branch" ? "One branch" : "One member"}</span>
                <span className="mt-1 block text-xs text-text-secondary">{s === "family" ? "Every ledger line" : s === "branch" ? "Lines from one branch" : "Lines for one person"}</span>
              </button>
            ))}
          </div>
          {scope === "branch" && (
            <div>
              <label className="ny-label" htmlFor="ew-branch">Branch</label>
              <select id="ew-branch" className="ny-select" value={branch} onChange={(e) => setBranch(e.target.value as Branch)}>
                {["Nairobi", "Bungoma", "Kakamega", "Trans-Nzoia", "Diaspora"].map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>
          )}
          {scope === "member" && (
            <div>
              <label className="ny-label" htmlFor="ew-member">Member</label>
              <select id="ew-member" className="ny-select" value={member} onChange={(e) => setMember(e.target.value)}>
                {roster.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "Jun–Nov 2025"],
                ["quarter", "Last three months"],
                ["month", "November 2025"],
                ["custom", "Custom dates"],
              ] as const
            ).map(([k, label]) => (
              <button key={k} type="button" onClick={() => setPeriod(k)} className={`ny-chip ny-touch ${period === k ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                {label}
              </button>
            ))}
          </div>
          {period === "custom" && (
            <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
              <div>
                <label className="ny-label" htmlFor="ew-from">From</label>
                <input id="ew-from" type="date" className="ny-input" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div>
                <label className="ny-label" htmlFor="ew-to">To</label>
                <input id="ew-to" type="date" className="ny-input" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </div>
          )}
          <p className="ny-inset px-3.5 py-3 text-sm text-text-secondary">
            <span className="font-semibold text-text-primary">{selected.length}</span> ledger lines match this scope and period.
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-3">
            {(["CSV", "XLSX", "PDF"] as const).map((f) => (
              <button key={f} type="button" onClick={() => setFormat(f)} className={`rounded-xl border p-3.5 text-left transition ${format === f ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                <span className="block text-sm font-semibold">{f}</span>
                <span className="ny-hud mt-1.5 block !text-[0.52rem]">{f === "CSV" ? "Real download" : f === "XLSX" ? "Workbook · queued" : "Statement · queued"}</span>
              </button>
            ))}
          </div>
          {format === "CSV" && (
            <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-[var(--color-brand-primary)]" checked={alsoNow} onChange={() => setAlsoNow((v) => !v)} />
              <span>Also download this CSV now</span>
            </label>
          )}
          {format !== "CSV" && <p className="ny-chip ny-chip-sim">SIMULATED · {format} generation connects in Phase 2</p>}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
            {[
              ["Scope", scopeLabel],
              ["Period", periodLabel],
              ["Lines", String(selected.length)],
              ["Money in", kes(selected.filter((t) => t.dir === "in").reduce((s, t) => s + t.amount, 0))],
              ["Money out", kes(selected.filter((t) => t.dir === "out").reduce((s, t) => s + t.amount, 0))],
              ["Format", format],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="ny-num text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="ny-hud">Queued jobs show progress in the export center and can be opened for details</p>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* W2 — Import a bank or M-Pesa statement (channel → file → preview → import) */
/* ------------------------------------------------------------------ */
const IMPORT_STEPS = ["Channel", "Statement", "Preview", "Import"];
const FILES: Partial<Record<Channel, string>> = {
  mpesa: "paybill-4471-nov-2025.csv",
  bank: "equity-coop-nov-2025.csv",
  airtel: "airtel-diaspora-nov-2025.csv",
};

export function ImportWizard({
  rows,
  initial,
  openCountOf,
  onImport,
  onClose,
}: {
  rows: Tx[];
  initial: Channel | null;
  openCountOf: (c: Channel) => number;
  onImport: (c: Channel) => void;
  onClose: () => void;
}) {
  const importable = channelSeeds.filter((c) => c.sim);
  const [step, setStep] = useState(0);
  const [channel, setChannel] = useState<Channel>(initial && initial !== "internal" ? initial : "mpesa");
  const [picked, setPicked] = useState(false);
  const [busy, setBusy] = useState(false);
  const ledgerLines = rows.filter((t) => t.channel === channel).length;
  const open = openCountOf(channel);
  const matched = Math.max(0, ledgerLines - open);
  const canNext = step === 1 ? picked : true;

  const run = () => {
    setBusy(true);
    window.setTimeout(() => {
      onImport(channel);
      setBusy(false);
      onClose();
    }, 700);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Import a statement"
      sub="The importer is simulated in Phase 1. Nothing is read from a bank."
      size="lg"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < IMPORT_STEPS.length - 1 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={busy} onClick={run}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Import (SIMULATED)
            </button>
          )}
        </>
      }
    >
      <Stepper total={IMPORT_STEPS.length} current={step} labels={IMPORT_STEPS} />

      {step === 0 && (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-3">
          {importable.map((c) => (
            <button key={c.id} type="button" onClick={() => { setChannel(c.id); setPicked(false); }} className={`rounded-xl border p-3.5 text-left transition ${channel === c.id ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
              <span className="block text-sm font-semibold">{c.label}</span>
              <span className="ny-hud mt-1.5 block !text-[0.52rem]">{c.detail}</span>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <div className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-4 py-6 text-center">
            <Upload className="mx-auto h-5 w-5 text-text-tertiary" />
            <p className="mt-2 text-sm font-semibold">{channelLabel[channel]} statement</p>
            <p className="mt-1 text-xs text-text-secondary">Phase 1 shows a file name only. Nothing is uploaded.</p>
            <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-3" onClick={() => setPicked(true)}>
              Choose {FILES[channel] ?? "file"} (SIMULATED)
            </button>
          </div>
          {picked && <p className="ny-chip ny-chip-ok">{FILES[channel]} selected</p>}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="ny-inset px-3.5 py-3">
              <p className="ny-hud">Matched to the ledger</p>
              <p className="ny-num ny-display text-2xl">{matched}</p>
            </div>
            <div className="ny-inset px-3.5 py-3">
              <p className="ny-hud">To review</p>
              <p className="ny-num ny-display text-2xl">{open}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-text-secondary">
            Lines that match are marked synced. Lines to review stay open in the exceptions table until someone resolves them.
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
            {[
              ["Channel", channelLabel[channel]],
              ["File", FILES[channel] ?? "—"],
              ["Matched", String(matched)],
              ["Left open", String(open)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="ny-num text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="ny-chip ny-chip-sim">SIMULATED · the channel is marked as synced today, and an audit row is written</p>
        </div>
      )}
    </Modal>
  );
}
