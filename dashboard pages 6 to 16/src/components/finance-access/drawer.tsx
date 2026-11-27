"use client";

import { useState } from "react";
import { ArrowRight, Check, QrCode, Send, ShieldCheck, Smartphone, X } from "lucide-react";
import { Drawer } from "@/components/ui/overlay";
import { Tabs } from "@/components/ui/primitives";
import { kes, clock } from "@/lib/format";
import {
  type Allocation,
  type AuditEntry,
  type LedgerEntry,
  channelLabel,
  otpChannelLabel,
  purposeLabel,
  purposeTone,
  statusMeta,
} from "@/data/dashboard/finance-access";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "link", label: "Link" },
  { id: "timeline", label: "Timeline" },
  { id: "ledger", label: "Ledger" },
  { id: "audit", label: "Audit" },
];

function timelineFor(a: Allocation): { at: string; title: string; body: string; done: boolean }[] {
  const order = ["draft", "link-issued", "pin-entered", "otp-verified", "released", "settled"];
  const idx = order.indexOf(a.status);
  const dead = a.status === "expired" || a.status === "failed";
  return [
    { at: a.issuedAt, title: "Allocation created", body: `${kes(a.amount)} · ${purposeLabel[a.purpose]} · ${channelLabel[a.channel]}`, done: true },
    { at: a.issuedAt, title: "Link issued", body: `${a.token} · sent to ${a.phone} by ${otpChannelLabel[a.otpChannel].toLowerCase()}`, done: idx >= 1 || dead },
    { at: "—", title: "PIN entered", body: a.pinRequired ? "4-digit PIN, 3 tries then 15 minutes" : "Not required for this allocation", done: idx >= 2 || !a.pinRequired },
    { at: "—", title: "One-time code verified", body: `Code sent by ${otpChannelLabel[a.otpChannel]}`, done: idx >= 3 },
    { at: "—", title: "Payout released", body: `${channelLabel[a.channel]} · SIMULATED B2C`, done: idx >= 4 },
    { at: a.settledRef ?? "—", title: "Settled", body: a.settledRef ? `Confirmed · ${a.settledRef}` : "Waiting for the confirmation webhook", done: a.status === "settled" },
    ...(dead
      ? [{ at: a.expiresAt, title: a.status === "expired" ? "Link expired" : "Link locked", body: a.status === "expired" ? "Expiry passed before the elder opened it" : "3 wrong PIN attempts · 15 minute lock", done: true }]
      : []),
  ];
}

export function AllocationDrawer({
  allocation,
  open,
  onClose,
  initialTab,
  ledger,
  audit,
  onQr,
  onResend,
  onRevoke,
  onSettle,
  onPin,
  onElder,
  onLedger,
  onAudit,
}: {
  allocation: Allocation | null;
  open: boolean;
  onClose: () => void;
  initialTab: string;
  ledger: LedgerEntry[];
  audit: AuditEntry[];
  onQr: (a: Allocation) => void;
  onResend: (a: Allocation) => void;
  onRevoke: (a: Allocation) => void;
  onSettle: (a: Allocation) => void;
  onPin: () => void;
  onElder: (a: Allocation) => void;
  onLedger: (e: LedgerEntry) => void;
  onAudit: (e: AuditEntry) => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const a = allocation;
  const rows = a ? ledger.filter((l) => l.source === a.ref) : [];
  const trail = a ? audit.filter((x) => x.entity === a.ref) : [];
  const live = a && a.expiryInSec > 0 && ["link-issued", "pin-entered", "otp-verified", "released"].includes(a.status);
  const meta = a ? statusMeta[a.status] : null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={a?.recipient ?? "Allocation"}
      sub={a ? `${a.ref} · ${a.token} · ${kes(a.amount)}` : ""}
      width="max-w-[560px]"
      footer={
        a && (
          <>
            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onRevoke(a)}>
              <X className="h-3.5 w-3.5" /> Revoke
            </button>
            {a.status !== "settled" && (
              <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onSettle(a)}>
                <Check className="h-3.5 w-3.5" /> Mark settled
              </button>
            )}
            <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => onElder(a)}>
              <Smartphone className="h-3.5 w-3.5" /> Elder view
            </button>
          </>
        )
      }
    >
      {a && meta && (
        <>
          <Tabs tabs={TABS} active={tab} onChange={setTab} />
          <div className="pt-4">
            {tab === "overview" && (
              <div className="space-y-4">
                <div className="ny-inset flex items-center justify-between gap-3 px-4 py-3.5">
                  <div>
                    <p className="ny-hud">Status</p>
                    <p className="ny-display mt-1 text-xl leading-none">{meta.label}</p>
                    <p className="mt-1.5 text-sm text-text-secondary">{meta.hint}</p>
                  </div>
                  <span className={`ny-chip ${meta.tone} ${live ? "ny-pulse" : ""}`}>{live ? "active" : a.status}</span>
                </div>

                {live && (
                  <div className="rounded-xl border border-dashed border-[rgba(212,164,55,0.6)] bg-[rgba(212,164,55,0.1)] px-4 py-3">
                    <p className="text-sm font-semibold text-[#7a5b12]">
                      Link expires in <span className="ny-num">{clock(a.expiryInSec)}</span>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#7a5b12]">
                      If nobody opens it in time, the money simply stays in the family account — nothing is lost.
                    </p>
                  </div>
                )}

                <dl className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ["Recipient", a.recipient],
                    ["Phone", a.phone],
                    ["Amount", kes(a.amount)],
                    ["Purpose", purposeLabel[a.purpose]],
                    ["Payout channel", channelLabel[a.channel]],
                    ["One-time code", otpChannelLabel[a.otpChannel]],
                    ["PIN", a.pinRequired ? "Required · 3 tries" : "Not required"],
                    ["Expires", a.expiresAt],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                      <dt className="ny-hud">{k}</dt>
                      <dd className="mt-1 font-medium text-text-primary">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <p className="ny-hud mb-1.5">Purpose tag</p>
                  <span className={`ny-chip ${purposeTone[a.purpose]}`}>{purposeLabel[a.purpose]}</span>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{a.note}</p>
                </div>
              </div>
            )}

            {tab === "link" && (
              <div className="space-y-3">
                <div className="fa-qr-card p-4">
                  <p className="fa-token text-center text-sm font-semibold">nalyanya.app/r/{a.token.replace("NY-RCV-", "").toLowerCase()}</p>
                  <p className="ny-hud mt-1.5 text-center !text-[0.55rem]">{a.token} · PIN {a.pinRequired ? "required" : "off"} · {otpChannelLabel[a.otpChannel]}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onQr(a)}>
                    <QrCode className="h-3.5 w-3.5" /> Show QR
                  </button>
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onResend(a)}>
                    <Send className="h-3.5 w-3.5" /> Send again
                  </button>
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={onPin}>
                    <ShieldCheck className="h-3.5 w-3.5" /> Change PIN
                  </button>
                  <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onElder(a)}>
                    <Smartphone className="h-3.5 w-3.5" /> Preview
                  </button>
                </div>
                <p className="ny-chip ny-chip-sim">The link resolves to /r/:token · public, no login</p>
              </div>
            )}

            {tab === "timeline" && (
              <ol className="space-y-3">
                {timelineFor(a).map((t) => (
                  <li key={t.title} className="flex gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${t.done ? "bg-brand-primary" : "bg-surface-3"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-text-primary">{t.title}</p>
                        <span className="ny-hud !text-[0.55rem]">{t.at}</span>
                      </div>
                      <p className="mt-0.5 text-sm leading-relaxed text-text-secondary">{t.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {tab === "ledger" && (
              <div className="space-y-2">
                {rows.length === 0 && (
                  <div className="ny-inset px-4 py-8 text-center">
                    <p className="ny-display text-base">No ledger posts yet</p>
                    <p className="mt-1 text-sm text-text-secondary">
                      Money only moves after the elder finishes PIN + code. Nothing has left the clearing account.
                    </p>
                  </div>
                )}
                {rows.map((l) => (
                  <button key={l.ref} type="button" className="gd-section-item w-full text-left" onClick={() => onLedger(l)}>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {l.debit} → {l.credit}
                      </span>
                      <span className="ny-hud block !text-[0.55rem]">
                        {l.ref} · {l.at}
                      </span>
                    </span>
                    <span className="ny-num shrink-0 text-sm font-semibold">{kes(l.amount)}</span>
                  </button>
                ))}
                <p className="ny-hud">Double-entry · every allocation keeps the ledger balanced</p>
              </div>
            )}

            {tab === "audit" && (
              <div className="space-y-1.5">
                {trail.length === 0 && (
                  <div className="ny-inset px-4 py-8 text-center text-sm text-text-secondary">
                    Nothing has happened on this allocation yet — every action lands here as it occurs.
                  </div>
                )}
                {trail.map((x) => (
                  <button key={x.ref} type="button" className="cc-audit-row w-full rounded-lg border border-border-subtle text-left" onClick={() => onAudit(x)}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${x.tone === "gold" ? "bg-brand-accent" : x.tone === "red" ? "bg-danger" : "bg-text-tertiary"}`} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{x.action}</span>
                      <span className="block text-xs text-text-secondary">{x.detail}</span>
                      <span className="ny-hud mt-1 block !text-[0.55rem]">
                        {x.at} · {x.actor}
                      </span>
                    </span>
                    <span className="ny-hud shrink-0 !text-[0.55rem]">{x.ref}</span>
                  </button>
                ))}
                <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm w-full" onClick={() => a && onQr(a)}>
                  Back to the link <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}
