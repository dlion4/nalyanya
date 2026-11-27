"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, Download, FileText, Fingerprint, Paperclip, RefreshCw, Send, ShieldCheck, Upload, Users, X } from "lucide-react";
import { Modal, Drawer } from "@/components/ui/overlay";
import { Stepper, Ring } from "@/components/ui/primitives";
import { fmt, kes, kesShort } from "@/lib/format";
import {
  AS_OF,
  appStatusMeta,
  channels,
  fmtDate,
  pillarImage,
  pillarLabel,
  pillarTone,
  type AppStatus,
  type Application,
  type AuditEntry,
  type Channel,
  type Grant,
  type Pillar,
} from "@/data/dashboard/foundation";
import { PillarMeter, channelMeta } from "./charts";

const intakeSteps = ["Type", "Beneficiary", "Amount", "Justification", "Documents", "Review"];

/* ------------------------------------------------------------------ */
/* S5 — Application intake wizard (six steps)                           */
/* ------------------------------------------------------------------ */
export function ApplyWizard({
  onClose,
  onSubmit,
  nextRef,
}: {
  onClose: () => void;
  onSubmit: (a: Application) => void;
  nextRef: string;
}) {
  const [step, setStep] = useState(0);
  const [pillar, setPillar] = useState<Pillar>("education");
  const [beneficiary, setBeneficiary] = useState("Grace Kwamboka Nalyanya");
  const [amount, setAmount] = useState("60000");
  const [purpose, setPurpose] = useState("");
  const [justification, setJustification] = useState("");
  const [docs, setDocs] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const amt = Number(amount.replace(/\D/g, "")) || 0;
  const library = ["School invoice", "Hospital invoice", "Fee statement", "Payslip", "Quotation", "Photographs", "ID / birth certificate", "Guardian consent"];
  const canNext = step === 1 ? beneficiary.trim().length > 3 : step === 2 ? amt >= 1000 : step === 3 ? justification.trim().length > 20 : true;

  const submit = () => {
    setBusy(true);
    window.setTimeout(() => {
      onSubmit({
        id: `a-${Date.now().toString(36)}`,
        ref: nextRef,
        applicant: beneficiary.trim(),
        applicantId: "m12",
        pillar,
        amount: amt,
        purpose: purpose.trim() || pillarLabel[pillar],
        justification: justification.trim(),
        status: "submitted",
        submitted: AS_OF,
        reviewer: "—",
        documents: docs,
      });
      setBusy(false);
      onClose();
    }, 800);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Apply for foundation help"
      sub="Six steps · goes straight to the grant council's review queue"
      size="lg"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < intakeSteps.length - 1 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={busy} onClick={submit}>
              {busy ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-on-brand/40 border-t-on-brand" /> : <Check className="h-3.5 w-3.5" />} Submit application
            </button>
          )}
        </>
      }
    >
      <Stepper total={intakeSteps.length} current={step} labels={intakeSteps} />

      {step === 0 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {(["education", "medical", "emergency"] as Pillar[]).map((p) => (
            <button key={p} type="button" onClick={() => setPillar(p)} className={`rounded-xl border p-4 text-left transition ${pillar === p ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
              <span className="block h-20 overflow-hidden rounded-lg">
                <img src={pillarImage[p]} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
              </span>
              <span className="mt-2.5 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{pillarLabel[p]}</span>
                <span className={`ny-chip ${pillarTone[p]}`}>{p === "education" ? "terms" : p === "medical" ? "48h" : "24h"}</span>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-text-secondary">
                {p === "education" && "Tuition, exam fees and bursary top-ups, paid to the school."}
                {p === "medical" && "Treatment, medicine and transport to appointments."}
                {p === "emergency" && "Fire, storm, bereavement and urgent household needs."}
              </span>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <label className="ny-label" htmlFor="wz-ben">Who is the help for</label>
          <input id="wz-ben" className="ny-input" value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} placeholder="Name, or a guardian if it is a child" />
          <div className="flex flex-wrap gap-1.5">
            {["Self", "My child", "A parent", "Another family member", "The community"].map((q) => (
              <button key={q} type="button" onClick={() => setBeneficiary(q === "Self" ? "Peter Wanyama Nalyanya" : q === "My child" ? "Brian Otieno Nalyanya (Jnr)" : q)} className="ny-chip ny-chip-neutral ny-touch hover:-translate-y-0.5">
                {q}
              </button>
            ))}
          </div>
          <p className="ny-hud">Children are shown to the family as “minor · guardian on file”, never by full name in public views.</p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <label className="ny-label" htmlFor="wz-amt">How much (KES)</label>
          <input id="wz-amt" inputMode="numeric" className="ny-input ny-num" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} />
          <div className="flex flex-wrap gap-1.5">
            {[10000, 25000, 50000, 84000, 120000].map((v) => (
              <button key={v} type="button" onClick={() => setAmount(String(v))} className={`ny-chip ny-touch ${amt === v ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                {fmt(v)}
              </button>
            ))}
          </div>
          <label className="ny-label mt-2" htmlFor="wz-purpose">What is it for</label>
          <input id="wz-purpose" className="ny-input" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Term 2 school fees · dialysis sessions · roof repair" />
          <p className="ny-hud">Education is capped per term · medical and emergency are assessed case by case</p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <label className="ny-label" htmlFor="wz-just">Tell the council what happened</label>
          <textarea id="wz-just" className="ny-textarea" value={justification} onChange={(e) => setJustification(e.target.value)} placeholder="What has already been paid, what is left, and what happens if it is not covered." />
          <p className="ny-hud text-right !text-[0.58rem]">{justification.length}/600 · plain words, the elders read every one</p>
          <label className="ny-label" htmlFor="wz-notes">Reviewer notes (optional)</label>
          <textarea id="wz-notes" className="ny-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything the reviewer should know — a phone call, a branch visit." />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <p className="ny-hud">Attach proof · {docs.length} selected</p>
          <div className="flex flex-wrap gap-1.5">
            {library.map((d) => {
              const on = docs.includes(d);
              return (
                <button key={d} type="button" onClick={() => setDocs((prev) => (on ? prev.filter((x) => x !== d) : [...prev, d]))} className={`ny-chip ny-touch transition ${on ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"}`}>
                  <Paperclip className="h-3 w-3" /> {d}
                </button>
              );
            })}
          </div>
          <div className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-4 py-6 text-center">
            <Upload className="mx-auto h-5 w-5 text-text-tertiary" />
            <p className="mt-2 text-sm font-semibold">Drop files here</p>
            <p className="mt-1 text-xs text-text-secondary">PDF, JPG or PNG · Phase 1 stores the names only and shows them as attached</p>
            <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-3" onClick={() => setDocs((prev) => (prev.length ? prev : ["Photographs"]))}>
              Choose a file (SIMULATED)
            </button>
          </div>
          {docs.length === 0 && <p className="ny-chip ny-chip-warn">Applications without proof take longer to review</p>}
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
            {[
              ["Pillar", pillarLabel[pillar]],
              ["Beneficiary", beneficiary],
              ["Amount", kes(amt)],
              ["Purpose", purpose || pillarLabel[pillar]],
              ["Proof", docs.length ? docs.join(", ") : "none attached"],
              ["Reference", nextRef],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="ny-inset px-3.5 py-3">
            <p className="ny-hud">What happens next</p>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
              The council (chair, treasurer and the elders) sees it in the review queue. You will be told either way, and every
              decision is written to the audit trail with a reason.
            </p>
          </div>
          <p className="ny-chip ny-chip-sim">Submitting is SIMULATED · no message leaves this device</p>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* S6 — Disburse (admin, 2FA, three steps)                               */
/* ------------------------------------------------------------------ */
export function DisburseWizard({
  grant,
  onClose,
  onRelease,
}: {
  grant: Grant | null;
  onClose: () => void;
  onRelease: (amount: number, channel: Channel) => void;
}) {
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState("");
  const [channel, setChannel] = useState<Channel>(grant?.channel ?? "bank");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  if (!grant) return null;

  const remaining = grant.amount - grant.disbursed;
  const suggested = grant.schedule.find((s) => !s.paid)?.amount ?? remaining;
  const amt = Number(amount.replace(/\D/g, "")) || suggested;
  const canNext = step === 0 ? amt > 0 && amt <= remaining : step === 1 ? true : code.length === 6;
  const labels = ["Amount", "Channel", "Authorise"];

  return (
    <Modal
      open
      onClose={onClose}
      title="Release funds"
      sub={`${grant.ref} · ${grant.beneficiary} · ${kes(remaining)} remaining`}
      size="md"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < 2 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              className="ny-btn ny-btn-accent ny-btn-sm"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                window.setTimeout(() => onRelease(amt, channel), 700);
              }}
            >
              {busy ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-on-brand/40 border-t-on-brand" /> : <Check className="h-3.5 w-3.5" />} Release {kes(amt)}
            </button>
          )}
        </>
      }
    >
      <Stepper total={3} current={step} labels={labels} />

      {step === 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {[suggested, Math.round(remaining / 2), remaining].filter((v) => v > 0 && v <= remaining).map((v, i) => (
              <button key={`${v}-${i}`} type="button" onClick={() => setAmount(String(v))} className={`ny-chip ny-touch ${amt === v ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                {i === 0 ? "Next scheduled · " : i === 2 ? "Full remaining · " : ""}{fmt(v)}
              </button>
            ))}
          </div>
          <label className="ny-label" htmlFor="dz-amt">Amount (KES)</label>
          <input id="dz-amt" inputMode="numeric" className="ny-input ny-num" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} placeholder={String(suggested)} />
          <div className="ny-inset grid grid-cols-3 gap-3 px-3.5 py-3 text-sm">
            <span>
              <span className="ny-hud block">Remaining</span>
              <span className="ny-num font-semibold">{kesShort(remaining)}</span>
            </span>
            <span>
              <span className="ny-hud block">Released so far</span>
              <span className="ny-num font-semibold">{kesShort(grant.disbursed)}</span>
            </span>
            <span>
              <span className="ny-hud block">After this</span>
              <span className="ny-num font-semibold">{kesShort(Math.max(0, remaining - amt))}</span>
            </span>
          </div>
          {amt > remaining && <p className="text-sm text-danger">More than the {kes(remaining)} left on this grant.</p>}
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {channels.map((c) => {
            const m = channelMeta[c.id];
            return (
              <button key={c.id} type="button" onClick={() => setChannel(c.id)} className={`rounded-xl border p-3.5 text-left transition ${channel === c.id ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                <span className="block text-sm font-semibold">{m.label}</span>
                <span className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="ny-hud !text-[0.55rem]">settles {m.eta}</span>
                  {m.sim ? <span className="ny-chip ny-chip-sim">SIMULATED</span> : <span className="ny-chip ny-chip-ok">local</span>}
                </span>
              </button>
            );
          })}
          <p className="ny-inset px-3.5 py-3 text-sm text-text-secondary sm:col-span-3">
            Destination on file: <span className="font-semibold text-text-primary">{grant.destination}</span>. Changing it needs an
            admin change request and 2FA — payouts cannot be silently redirected.
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
            {[
              ["Grant", grant.ref],
              ["Releases", kes(amt)],
              ["Channel", channelMeta[channel].label],
              ["To", grant.destination],
              ["Leaves", `${kes(Math.max(0, remaining - amt))} remaining`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="ny-num text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <label className="ny-label" htmlFor="dz-code">
            <Fingerprint className="mr-1 inline h-3.5 w-3.5" /> Treasurer&apos;s 2FA code
          </label>
          <input id="dz-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
          <p className="ny-chip ny-chip-sim">SIMULATED B2C · dev mode accepts any 6 digits</p>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Documents — proof uploads (SIMULATED)                                 */
/* ------------------------------------------------------------------ */
export function DocumentsModal({ grant, onClose, onUpload }: { grant: Grant | null; onClose: () => void; onUpload: (name: string) => void }) {
  if (!grant) return null;
  return (
    <Modal
      open
      onClose={onClose}
      title="Supporting documents"
      sub={`${grant.ref} · ${grant.documents.length} on file`}
      size="md"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onUpload("Additional proof")}>
            <Upload className="h-3.5 w-3.5" /> Attach a file (SIMULATED)
          </button>
        </>
      }
    >
      <ul className="space-y-2">
        {grant.documents.map((d) => (
          <li key={d.name} className="fd-doc">
            <span className="fd-doc__mark">
              <FileText className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{d.name}</span>
              <span className="ny-hud block !text-[0.55rem]">
                {d.kind} · uploaded {fmtDate(d.uploaded)}
              </span>
            </span>
            <span className={`ny-chip shrink-0 ${d.verified ? "ny-chip-ok" : "ny-chip-warn"}`}>{d.verified ? "verified" : "checking"}</span>
          </li>
        ))}
      </ul>
      <div className="ny-inset mt-4 flex items-start gap-2.5 px-3.5 py-3">
        <Paperclip className="mt-0.5 h-4 w-4 shrink-0 text-purple" />
        <p className="text-xs leading-relaxed text-text-secondary">
          Phase 1 stores the file names and shows them as attached. Real uploads go to Google Drive in Phase 2 and stay private
          to the family.
        </p>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Comms — message to beneficiary/guardian (streams receipts)            */
/* ------------------------------------------------------------------ */
export function CommsModal({
  grant,
  onClose,
  onSent,
}: {
  grant: Grant | null;
  onClose: () => void;
  onSent: (summary: string) => void;
}) {
  const [channel, setChannel] = useState<"whatsapp" | "sms" | "email" | "in-app">("whatsapp");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  if (!grant) return null;
  const who = [grant.beneficiary, grant.guardian].filter(Boolean) as string[];
  return (
    <Modal
      open
      onClose={() => {
        setSent(false);
        setBody("");
        onClose();
      }}
      title="Tell the beneficiary"
      sub={`${grant.ref} · ${who.length} recipient${who.length === 1 ? "" : "s"}`}
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
            <Send className="h-3.5 w-3.5" /> Send (SIMULATED)
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
      <label className="ny-label mt-4" htmlFor="cm-body">Message · merge fields {"{first_name}"} {"{amount}"}</label>
      <textarea id="cm-body" className="ny-textarea" value={body} onChange={(e) => setBody(e.target.value)} placeholder={`Habari ${grant.beneficiary.split(" ")[0]}, ${kes(grant.amount - grant.disbursed)} remains on ${grant.ref}. The next release is on ${fmtDate(grant.schedule.find((s) => !s.paid)?.date ?? AS_OF)}.`} />
      <div className="mt-2 flex flex-wrap gap-2">
        {who.map((w) => (
          <span key={w} className="ny-chip ny-chip-neutral">{w}</span>
        ))}
        <span className="ny-chip ny-chip-sim">SIMULATED fanout · T-14</span>
      </div>
      {sent && (
        <div className="ny-inset mt-4 px-3.5 py-3">
          <p className="ny-hud">Delivery receipts (streamed)</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {who.map((w, i) => (
              <li key={w} className="fd-row-in flex items-center justify-between gap-2" style={{ animationDelay: `${i * 240}ms` }}>
                <span className="truncate">{w}</span>
                <span className={`ny-chip ${i === who.length - 1 && who.length > 1 ? "ny-chip-warn" : "ny-chip-ok"}`}>
                  {i === who.length - 1 && who.length > 1 ? "pending" : "delivered"}
                </span>
              </li>
            ))}
          </ul>
          <p className="ny-hud mt-2">Proof references are SIMULATED until messaging is wired</p>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Reconciliation                                                       */
/* ------------------------------------------------------------------ */
export function ReconcileModal({
  lines,
  onClose,
  onResolve,
}: {
  lines: { ref: string; at: string; statement: string; ledgerSide: string; amount: number; match: "matched" | "missing" | "mismatch" | "duplicate" }[];
  onClose: () => void;
  onResolve: (label: string) => void;
}) {
  const tone = { matched: "ny-chip-ok", missing: "ny-chip-danger", mismatch: "ny-chip-warn", duplicate: "ny-chip-info" } as const;
  const issues = lines.filter((l) => l.match !== "matched").length;
  return (
    <Modal
      open
      onClose={onClose}
      title="Reconciliation"
      sub="Foundation statements vs the ledger · SIMULATED pull"
      size="lg"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onResolve("Re-pull statements (SIMULATED)")}>
            <RefreshCw className="h-3.5 w-3.5" /> Re-pull
          </button>
        </>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="ny-chip ny-chip-ok">{lines.length - issues} matched</span>
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
            {lines.map((l, i) => (
              <tr key={`${l.ref}-${i}`}>
                <td data-label="Ref" className="ny-hud !text-[0.6rem]">{l.ref}</td>
                <td data-label="Statement">
                  <span className="block font-medium">{l.statement}</span>
                  <span className="ny-hud !text-[0.56rem]">{l.at}</span>
                </td>
                <td data-label="Ledger" className={l.ledgerSide.startsWith("—") ? "text-danger" : ""}>{l.ledgerSide}</td>
                <td data-label="Amount" className="ny-num text-right font-semibold">{kes(l.amount)}</td>
                <td data-label="Match">
                  <span className={`ny-chip ${tone[l.match]}`}>{l.match}</span>
                </td>
                <td data-label="" className="text-right">
                  {l.match !== "matched" && (
                    <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onResolve(`${l.ref} · ${l.match}`)}>
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ny-hud mt-3">Every resolve writes an audit row · exports land in T-12 records</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Export                                                               */
/* ------------------------------------------------------------------ */
export function ExportModal({ scope, onClose, onQueue }: { scope: string; onClose: () => void; onQueue: (format: string) => void }) {
  const [format, setFormat] = useState("PDF");
  return (
    <Modal
      open
      onClose={onClose}
      title="Export"
      sub={`${scope} · queued locally · signed file in Phase 2`}
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
      <div className="grid grid-cols-3 gap-2">
        {["PDF", "CSV", "XLSX"].map((f) => (
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
/* Donors                                                               */
/* ------------------------------------------------------------------ */
export function DonorModal({
  donors,
  onClose,
  onExport,
}: {
  donors: { id: string; name: string; since: string; total: number; count: number; anonymous: boolean }[];
  onClose: () => void;
  onExport: () => void;
}) {
  const total = donors.reduce((s, d) => s + d.total, 0);
  return (
    <Modal
      open
      onClose={onClose}
      title="Who funds the foundation"
      sub={`${donors.length} donors · ${kes(total)} since 2021`}
      size="md"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onExport}>
            <Download className="h-3.5 w-3.5" /> Export donor list
          </button>
        </>
      }
    >
      <ul className="space-y-2">
        {donors.map((d) => (
          <li key={d.id} className="fd-doc">
            <span className="fd-doc__mark">
              <Users className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{d.anonymous ? "Anonymous family member" : d.name}</span>
              <span className="ny-hud block !text-[0.55rem]">
                since {d.since} · {d.count} gift{d.count === 1 ? "" : "s"}
              </span>
            </span>
            <span className="ny-num shrink-0 text-sm font-semibold">{kes(d.total)}</span>
          </li>
        ))}
      </ul>
      <p className="ny-hud mt-3">Anonymous donors stay anonymous in every view, including the public page</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Governance + annual report                                            */
/* ------------------------------------------------------------------ */
export function GovernanceModal({
  data,
  onClose,
  onReport,
}: {
  data: {
    chair: string;
    treasurer: string;
    secretary: string;
    elders: { name: string; role: string; since: string }[];
    publicSync: boolean;
    reports: { year: number; pages: number; published: string; disbursed: number }[];
  };
  onClose: () => void;
  onReport: (year: number) => void;
}) {
  const [sync, setSync] = useState(data.publicSync);
  return (
    <Modal
      open
      onClose={onClose}
      title="Governance & transparency"
      sub="Who runs it, and what the family can see"
      size="md"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
      <div className="space-y-3">
        <div className="ny-inset px-3.5 py-3">
          <p className="ny-hud">Officers</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {[
              ["Chair", data.chair],
              ["Treasurer", data.treasurer],
              ["Secretary", data.secretary],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between gap-3">
                <span className="text-text-secondary">{k}</span>
                <span className="font-semibold">{v}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="ny-hud mb-2">Council of elders</p>
          <ul className="space-y-1.5">
            {data.elders.map((e) => (
              <li key={e.name} className="fd-doc">
                <span className="fd-doc__mark">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{e.name}</span>
                  <span className="ny-hud block !text-[0.55rem]">{e.role} · since {e.since}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="ny-hud mb-2">Annual reports</p>
          <ul className="space-y-1.5">
            {data.reports.map((r) => (
              <li key={r.year} className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                <span>
                  <span className="block text-sm font-semibold">{r.year} report</span>
                  <span className="ny-hud block !text-[0.55rem]">{r.pages} pages · published {fmtDate(r.published)} · {kes(r.disbursed)} disbursed</span>
                </span>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onReport(r.year)}>
                  <FileText className="h-3.5 w-3.5" /> PDF
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3">
          <div>
            <p className="text-sm font-semibold">Show totals on the public H-4 page</p>
            <p className="ny-hud mt-0.5 !text-[0.55rem]">Donor names stay hidden either way</p>
          </div>
          <button type="button" role="switch" aria-checked={sync} aria-label="Public sync" className="fd-switch" onClick={() => setSync((v) => !v)} />
        </div>
        <p className="ny-chip ny-chip-sim">Public sync SIMULATED · H-4 renders the same totals</p>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Audit + ledger detail                                                */
/* ------------------------------------------------------------------ */
export function AuditDetailModal({ entry, onClose }: { entry: AuditEntry | null; onClose: () => void }) {
  return (
    <Modal
      open={!!entry}
      onClose={onClose}
      title={entry ? `Audit · ${entry.action}` : "Audit"}
      sub={entry ? `${entry.ref} · ${entry.at}` : ""}
      size="sm"
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

export function LedgerModal({ entry, onClose }: { entry: { ref: string; at: string; debit: string; credit: string; amount: number; source: string } | null; onClose: () => void }) {
  return (
    <Modal
      open={!!entry}
      onClose={onClose}
      title="Double-entry post"
      sub={entry ? `${entry.ref} · ${entry.at}` : ""}
      size="sm"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
      {entry && (
        <>
          <div className="overflow-hidden rounded-xl border border-border-subtle text-sm">
            <div className="flex items-center justify-between gap-3 bg-surface-2 px-3.5 py-2.5">
              <span className="ny-hud">Debit</span>
              <span className="font-semibold">{entry.debit}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-3.5 py-2.5">
              <span className="ny-hud">Credit</span>
              <span className="font-semibold">{entry.credit}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border-subtle bg-[rgba(106,76,147,0.08)] px-3.5 py-3">
              <span className="ny-hud">Amount</span>
              <span className="ny-num ny-display text-lg">{kes(entry.amount)}</span>
            </div>
          </div>
          <p className="ny-hud mt-3">Source {entry.source} · debits and credits stay balanced by construction</p>
        </>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Application review — approve / decline with reason (drawer)           */
/* ------------------------------------------------------------------ */
export function ReviewDrawer({
  app,
  onClose,
  onDecide,
}: {
  app: Application | null;
  onClose: () => void;
  onDecide: (decision: "approve" | "decline", reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [decision, setDecision] = useState<"approve" | "decline">("approve");
  if (!app) return null;
  const done = app.status === "approved" || app.status === "declined" || app.status === "paid";
  return (
    <Drawer
      open
      onClose={onClose}
      title={app.applicant}
      sub={`${app.ref} · ${pillarLabel[app.pillar]} · ${kes(app.amount)}`}
      width="max-w-[560px]"
      footer={
        done ? (
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
            Close
          </button>
        ) : (
          <>
            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
              Later
            </button>
            <button
              type="button"
              className={`ny-btn ny-btn-sm ${decision === "approve" ? "ny-btn-accent" : "ny-btn-danger"}`}
              disabled={decision === "decline" && reason.trim().length < 6}
              onClick={() => onDecide(decision, reason)}
            >
              {decision === "approve" ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              {decision === "approve" ? "Approve" : "Decline"}
            </button>
          </>
        )
      }
    >
      <div className="space-y-4">
        <div className={`ny-inset flex items-center justify-between gap-3 px-4 py-3.5 ${app.status === "approved" ? "fd-flash-posted" : ""}`}>
          <div>
            <p className="ny-hud">Status</p>
            <p className="ny-display mt-1 text-lg leading-none">{appStatusMeta[app.status].label}</p>
            <p className="mt-1.5 text-sm text-text-secondary">
              Submitted {fmtDate(app.submitted)} · reviewer {app.reviewer}
            </p>
          </div>
          <span className={`ny-chip ${appStatusMeta[app.status].tone}`}>{app.status}</span>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface-1 px-4 py-3">
          <p className="ny-hud">What they asked for</p>
          <p className="mt-1 text-sm font-semibold">{app.purpose}</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{app.justification}</p>
        </div>

        <div>
          <p className="ny-hud mb-2">Proof attached</p>
          {app.documents.length ? (
            <ul className="space-y-1.5">
              {app.documents.map((d) => (
                <li key={d} className="fd-doc">
                  <span className="fd-doc__mark">
                    <Paperclip className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-medium">{d}</span>
                  <span className="ny-chip ny-chip-ok">on file</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="ny-inset px-3.5 py-4 text-sm text-text-secondary">No proof attached — ask for it before deciding.</p>
          )}
        </div>

        {!done && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setDecision("approve")} className={`rounded-xl border p-3 text-left transition ${decision === "approve" ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1"}`}>
                <span className="block text-sm font-semibold">Approve</span>
                <span className="ny-hud mt-1 block !text-[0.55rem]">Release via the disburse wizard</span>
              </button>
              <button type="button" onClick={() => setDecision("decline")} className={`rounded-xl border p-3 text-left transition ${decision === "decline" ? "border-danger bg-[rgba(198,40,40,0.06)]" : "border-border-subtle bg-surface-1"}`}>
                <span className="block text-sm font-semibold">Decline</span>
                <span className="ny-hud mt-1 block !text-[0.55rem]">Needs a reason they can read</span>
              </button>
            </div>
            {decision === "decline" && (
              <div>
                <label className="ny-label" htmlFor="rv-reason">Reason</label>
                <textarea id="rv-reason" className="ny-textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ask again with the full invoice — the amount is above this round's cap." />
              </div>
            )}
            <p className="ny-chip ny-chip-sim">Decisions are SIMULATED · every one is written to the audit trail</p>
          </div>
        )}
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* Filters drawer for the intake queue                                   */
/* ------------------------------------------------------------------ */
export type AppFilters = { q: string; status: AppStatus | "all"; pillar: Pillar | "all" };
export const emptyAppFilters: AppFilters = { q: "", status: "all", pillar: "all" };

export function FiltersDrawer({
  open,
  onClose,
  value,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  value: AppFilters;
  onChange: (f: AppFilters) => void;
}) {
  const set = <K extends keyof AppFilters>(k: K, v: AppFilters[K]) => onChange({ ...value, [k]: v });
  const chip = (on: boolean) => `ny-chip ny-touch ${on ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`;
  const active = (value.q ? 1 : 0) + (value.status !== "all" ? 1 : 0) + (value.pillar !== "all" ? 1 : 0);
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter applications"
      sub={`${active} filter${active === 1 ? "" : "s"} active`}
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onChange(emptyAppFilters)}>
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
          <label className="ny-label" htmlFor="af-q">Search applicant, ref or purpose</label>
          <input id="af-q" className="ny-input" value={value.q} onChange={(e) => set("q", e.target.value)} placeholder="Grace, NY-APP, dialysis…" />
        </div>
        <div>
          <span className="ny-label">Status</span>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "submitted", "under-review", "approved", "declined", "paid"] as const).map((s) => (
              <button key={s} type="button" className={chip(value.status === s)} onClick={() => set("status", s)}>
                {s === "all" ? "any" : appStatusMeta[s].label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="ny-label">Pillar</span>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={chip(value.pillar === "all")} onClick={() => set("pillar", "all")}>any</button>
            {(["education", "medical", "emergency"] as Pillar[]).map((p) => (
              <button key={p} type="button" className={chip(value.pillar === p)} onClick={() => set("pillar", p)}>
                {pillarLabel[p]}
              </button>
            ))}
          </div>
        </div>
        <div className="ny-inset px-3.5 py-3 text-xs leading-relaxed text-text-secondary">
          Filters apply to the queue instantly. Opening an application is deep-linked, so the back button closes it first.
        </div>
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* Confirmation — a grant decision is settled                            */
/* ------------------------------------------------------------------ */
export function DecisionModal({
  data,
  onClose,
}: {
  data: { title: string; body: string; tone: "ok" | "warn" } | null;
  onClose: () => void;
}) {
  return (
    <Modal
      open={!!data}
      onClose={onClose}
      title={data?.title ?? ""}
      size="sm"
      tone={data?.tone === "warn" ? "danger" : "gold"}
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Done
        </button>
      }
    >
      {data && (
        <>
          <div className={`rounded-xl border border-border-subtle p-4 text-center ${data.tone === "ok" ? "fd-flash-posted bg-surface-2" : "bg-surface-2"}`}>
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[rgba(106,76,147,0.16)]">
              <BadgeCheck className="h-6 w-6 text-purple" />
            </span>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{data.body}</p>
          </div>
          <p className="ny-chip ny-chip-sim mt-3">SIMULATED · no money moved in Phase 1</p>
        </>
      )}
    </Modal>
  );
}

