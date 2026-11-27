"use client";

import { useState } from "react";
import { Check, Download, FileText, Megaphone, Paperclip, Send, ShieldCheck, Upload } from "lucide-react";
import { Drawer } from "@/components/ui/overlay";
import { Ring, Tabs } from "@/components/ui/primitives";
import { kes } from "@/lib/format";
import {
  fmtDate,
  grantPct,
  pillarLabel,
  statusMeta,
  type AuditEntry,
  type Grant,
  type LedgerEntry,
} from "@/data/dashboard/foundation";
import { PillarMeter, channelMeta } from "./charts";

const GRANT_TABS = [
  { id: "overview", label: "Overview" },
  { id: "disbursements", label: "Disbursements" },
  { id: "documents", label: "Documents" },
  { id: "comms", label: "Comms" },
  { id: "audit", label: "Audit" },
];

/* ------------------------------------------------------------------ */
/* Grant detail drawer — five tabs, deep-linked ?o=grant&id=…&t=…        */
/* ------------------------------------------------------------------ */
export function GrantDrawer({
  open,
  onClose,
  grant,
  initialTab,
  ledger,
  audit,
  onDisburse,
  onDocuments,
  onComms,
  onLedger,
  onAudit,
  onExport,
}: {
  open: boolean;
  onClose: () => void;
  grant: Grant | null;
  initialTab: string;
  ledger: LedgerEntry[];
  audit: AuditEntry[];
  onDisburse: (g: Grant) => void;
  onDocuments: (g: Grant) => void;
  onComms: (g: Grant) => void;
  onLedger: (e: LedgerEntry) => void;
  onAudit: (e: AuditEntry) => void;
  onExport: (g: Grant) => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const g = grant;
  const rows = g ? ledger.filter((l) => l.source === g.ref) : [];
  const trail = g ? audit.filter((a) => a.entity === g.ref || a.entity.startsWith(g.ref.slice(0, 13))) : [];
  const meta = g ? statusMeta[g.status] : null;
  const released = g?.disbursed ?? 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={g?.title ?? "Grant"}
      sub={g ? `${g.ref} · ${pillarLabel[g.pillar]} · ${g.branch}` : ""}
      width="max-w-[640px]"
      footer={
        g && (
          <>
            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onDocuments(g)}>
              <Paperclip className="h-3.5 w-3.5" /> Documents
            </button>
            <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onExport(g)}>
              <Download className="h-3.5 w-3.5" /> Statement
            </button>
            {g.disbursed < g.amount && g.status !== "declined" && (
              <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => onDisburse(g)}>
                <ShieldCheck className="h-3.5 w-3.5" /> Release funds
              </button>
            )}
          </>
        )
      }
    >
      {g && meta && (
        <>
          <Tabs tabs={GRANT_TABS} active={tab} onChange={setTab} />
          <div className="pt-4">
            {tab === "overview" && (
              <div className="space-y-4">
                <div className="ny-inset flex items-center gap-4 px-4 py-3.5">
                  <Ring pct={grantPct(g)} size={76} stroke={7} gold={grantPct(g) >= 100} label={`${grantPct(g)}%`} />
                  <div className="min-w-0">
                    <p className="ny-hud">Released</p>
                    <p className="ny-num ny-display text-xl leading-none">{kes(released)}</p>
                    <p className="mt-1.5 text-sm text-text-secondary">of {kes(g.amount)} committed</p>
                    <span className={`ny-chip mt-2 ${meta.tone} ${g.status === "active" ? "ny-pulse" : ""}`}>{meta.label}</span>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-text-secondary">{g.purpose}</p>

                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["Beneficiary", g.beneficiary],
                    ["Guardian", g.guardian ?? "—"],
                    ["Pillar", pillarLabel[g.pillar]],
                    ["Branch", g.branch],
                    ["Starts", fmtDate(g.starts)],
                    ["Ends", fmtDate(g.ends)],
                    ["Paid to", g.destination],
                    ["Channel", channelMeta[g.channel].label],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                      <dt className="ny-hud">{k}</dt>
                      <dd className="mt-1 font-medium text-text-primary">{v}</dd>
                    </div>
                  ))}
                </dl>

                {g.minor && (
                  <div className="rounded-xl border border-dashed border-[rgba(212,164,55,0.6)] bg-[rgba(212,164,55,0.1)] px-4 py-3">
                    <p className="text-sm font-semibold text-[#7a5b12]">Minor · shown anonymised in public views</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#7a5b12]">
                      The full name and guardian stay inside the family dashboard and are never exposed on the public page.
                    </p>
                  </div>
                )}

                <p className="text-sm leading-relaxed text-text-secondary">{g.note}</p>
              </div>
            )}

            {tab === "disbursements" && (
              <div className="space-y-4">
                <div className="ny-inset px-4 py-3.5">
                  <p className="ny-hud">Schedule</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-sm text-text-secondary">
                      {g.schedule.filter((s) => s.paid).length} of {g.schedule.length} releases made
                    </p>
                    <p className="ny-num text-sm font-semibold">{kes(released)} / {kes(g.amount)}</p>
                  </div>
                  <div className="mt-2">
                    <PillarMeter released={released} committed={g.amount} />
                  </div>
                </div>

                <ol className="space-y-2">
                  {g.schedule.map((s) => (
                    <li key={s.no} className="fd-doc">
                      <span className={`fd-doc__mark ${s.paid ? "!bg-[rgba(46,125,50,0.16)] !text-success" : ""}`}>
                        {s.paid ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{s.no}</span>}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">Release {s.no} of {g.schedule.length}</span>
                        <span className="ny-hud block !text-[0.55rem]">
                          {fmtDate(s.date)} · {s.paid ? s.ref : "scheduled"}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="ny-num block text-sm font-semibold">{kes(s.amount)}</span>
                        <span className={`ny-chip mt-1 ${s.paid ? "ny-chip-ok" : "ny-chip-neutral"}`}>{s.paid ? "released" : "upcoming"}</span>
                      </span>
                    </li>
                  ))}
                </ol>

                {g.disbursed < g.amount && g.status !== "declined" && (
                  <button type="button" className="ny-btn ny-btn-accent w-full" onClick={() => onDisburse(g)}>
                    <ShieldCheck className="h-4 w-4" /> Release the next tranche
                  </button>
                )}
                <p className="ny-chip ny-chip-sim">Every release posts a double-entry ledger entry and an audit row</p>
              </div>
            )}

            {tab === "documents" && (
              <div className="space-y-2">
                {g.documents.map((d) => (
                  <div key={d.name} className="fd-doc">
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
                  </div>
                ))}
                <button type="button" className="ny-btn ny-btn-outline mt-2 w-full" onClick={() => onDocuments(g)}>
                  <Upload className="h-4 w-4" /> Attach more proof
                </button>
                <p className="ny-chip ny-chip-sim">Uploads SIMULATED · Drive-backed storage in Phase 2</p>
              </div>
            )}

            {tab === "comms" && (
              <div className="space-y-3">
                <div className="ny-inset px-4 py-3.5">
                  <p className="text-sm font-semibold">Tell the beneficiary about a release</p>
                  <p className="mt-1 text-sm text-text-secondary">
                    Messages go to {g.beneficiary.split(" · ")[0]}
                    {g.guardian ? ` and their guardian ${g.guardian}` : ""} on WhatsApp, SMS or email, with delivery receipts.
                  </p>
                  <button type="button" className="ny-btn ny-btn-primary ny-btn-sm mt-3" onClick={() => onComms(g)}>
                    <Megaphone className="h-3.5 w-3.5" /> Compose message
                  </button>
                </div>
                <ul className="space-y-2">
                  {[
                    { t: "Release 2 of 3 made", at: "16 Nov · 11:24", d: "1 delivered · 0 failed" },
                    { t: "Application approved", at: "10 Nov · 12:20", d: "2 delivered · 0 failed" },
                  ].map((m) => (
                    <li key={m.t} className="fd-doc">
                      <span className="fd-doc__mark">
                        <Send className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{m.t}</span>
                        <span className="ny-hud block !text-[0.55rem]">{m.at} · {m.d}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="ny-chip ny-chip-sim">Fanout SIMULATED · the broadcast centre (T-14) connects in Phase 2</p>
              </div>
            )}

            {tab === "audit" && (
              <div className="space-y-1.5">
                {rows.length > 0 && (
                  <>
                    <p className="ny-hud">Ledger posts</p>
                    {rows.map((l) => (
                      <button key={l.ref} type="button" className="gd-section-item w-full text-left" onClick={() => onLedger(l)}>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {l.debit} → {l.credit}
                          </span>
                          <span className="ny-hud block !text-[0.55rem]">{l.ref} · {l.at}</span>
                        </span>
                        <span className="ny-num shrink-0 text-sm font-semibold">{kes(l.amount)}</span>
                      </button>
                    ))}
                  </>
                )}
                <p className="ny-hud pt-2">Audit trail</p>
                {trail.length === 0 && (
                  <div className="ny-inset px-4 py-6 text-center text-sm text-text-secondary">
                    Nothing logged for this grant yet. Every decision, release and message lands here as it happens.
                  </div>
                )}
                {trail.map((a) => (
                  <button key={a.ref} type="button" className="cc-audit-row w-full rounded-lg border border-border-subtle text-left" onClick={() => onAudit(a)}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.tone === "gold" ? "bg-brand-accent" : a.tone === "red" ? "bg-danger" : "bg-text-tertiary"}`} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{a.action}</span>
                      <span className="block text-xs text-text-secondary">{a.detail}</span>
                      <span className="ny-hud mt-1 block !text-[0.55rem]">{a.at} · {a.actor}</span>
                    </span>
                    <span className="ny-hud shrink-0 !text-[0.55rem]">{a.ref}</span>
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

