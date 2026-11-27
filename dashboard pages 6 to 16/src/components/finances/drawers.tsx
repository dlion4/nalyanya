"use client";

import { useState } from "react";
import { ArrowRight, Download, Fingerprint, RotateCw, Scale, ShieldCheck, UserMinus, X } from "lucide-react";
import { Drawer } from "@/components/ui/overlay";
import { Ring, Tabs } from "@/components/ui/primitives";
import {
  type AuditEntry,
  type Channel,
  type Chama,
  type Rules,
  type TxStatus,
  cycleLabel,
  dividends,
  nameOf,
  personById,
  sacco,
  skipLabel,
  typeLabel,
} from "@/data/dashboard/finances";
import { fmt, kes, kesShort, pct } from "@/lib/format";
import { channelMeta } from "./modals";
import { MgrRing3D } from "./charts";

const CHAMA_TABS = [
  { id: "overview", label: "Overview" },
  { id: "members", label: "Members" },
  { id: "cycle", label: "Cycle" },
  { id: "payouts", label: "Payouts" },
  { id: "statements", label: "Statements" },
  { id: "audit", label: "Audit" },
];

/* ------------------------------------------------------------------ */
/* S5 — Chama detail drawer (six tabs, deep-linked by ?o=chama&id=…)    */
/* ------------------------------------------------------------------ */
export function ChamaDrawer({
  chama,
  open,
  onClose,
  initialTab,
  audit,
  onContribute,
  onRotate,
  onStatements,
  onReorder,
  onWaive,
  onExport,
}: {
  chama: Chama | null;
  open: boolean;
  onClose: () => void;
  initialTab: string;
  audit: AuditEntry[];
  onContribute: (c: Chama) => void;
  onRotate: (c: Chama) => void;
  onStatements: (c: Chama) => void;
  onReorder: (c: Chama) => void;
  onWaive: (c: Chama, personId: string) => void;
  onExport: (c: Chama) => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const c = chama;
  const isMgr = c?.type === "merry-go-round";
  const p = c ? pct(c.pool, c.target) : 0;
  const recipient = c && isMgr ? c.orderIds[c.recipientIdx] : undefined;
  const trail = c ? audit.filter((a) => a.entity === c.ref) : [];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={c?.name ?? "Chama"}
      sub={c ? `${c.ref} · ${typeLabel[c.type]} · ${c.branch} branch` : ""}
      width="max-w-[640px]"
      footer={
        c && (
          <>
            {isMgr && (
              <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onRotate(c)}>
                <RotateCw className="h-3.5 w-3.5" /> Rotate now
              </button>
            )}
            <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => onContribute(c)}>
              Contribute <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </>
        )
      }
    >
      {c && (
        <>
          <Tabs tabs={CHAMA_TABS} active={tab} onChange={setTab} />
          <div className="pt-4">
            {tab === "overview" && (
              <div className="space-y-4">
                <div className="ny-inset flex items-center gap-4 px-4 py-3.5">
                  <Ring pct={p} size={76} stroke={7} gold={p >= 100} label={`${p}%`} />
                  <div className="min-w-0">
                    <p className="ny-num ny-display text-xl leading-none">{kes(c.pool)}</p>
                    <p className="ny-hud mt-1">of {kes(c.target)} · {c.targetLabel}</p>
                    <p className="mt-1.5 text-sm text-text-secondary">{c.paidIds.length} of {c.memberIds.length} paid in this {c.cycle === "weekly" ? "week" : "cycle"}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-text-secondary">{c.blurb}</p>
                <dl className="grid grid-cols-2 gap-2">
                  {[
                    ["Contribution", `${kes(c.contribution)} · ${cycleLabel[c.cycle].toLowerCase()}`],
                    ["Members", `${c.memberIds.length} people`],
                    ["Late penalty", `${kes(c.penalty)} after ${c.graceDays} grace days`],
                    ["Skip policy", skipLabel[c.skip]],
                    ["Opened", c.opened],
                    [c.roi ? "Target return" : "Next", c.roi ? `${c.roi}% a year` : c.nextLabel],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                      <dt className="ny-hud">{k}</dt>
                      <dd className="mt-1 text-sm font-medium text-text-primary">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {tab === "members" && (
              <ul className="space-y-2">
                {c.memberIds.map((id) => {
                  const person = personById(id);
                  const paid = c.paidIds.includes(id);
                  const isRecipient = recipient === id;
                  return (
                    <li key={id} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-primary text-[0.72rem] font-bold text-on-brand">
                        {person?.initials ?? "··"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{nameOf(id)}</p>
                        <p className="ny-hud !text-[0.55rem]">{person?.branch} · {person?.phone}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className={`ny-chip ${paid ? "ny-chip-ok" : "ny-chip-warn"}`}>{paid ? "paid" : "due"}</span>
                        {isRecipient && <span className="ny-chip ny-chip-brand ny-pulse">recipient</span>}
                        {!paid && (
                          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !min-h-0 !px-2 !py-1" onClick={() => onWaive(c, id)}>
                            <UserMinus className="h-3 w-3" /> Waive penalty
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {tab === "cycle" && (
              <div className="space-y-4">
                {isMgr ? (
                  <>
                    <MgrRing3D people={c.orderIds.map((id) => personById(id)).filter((x): x is NonNullable<typeof x> => !!x)} currentIdx={c.recipientIdx} paidIds={c.paidIds} radius={112} />
                    <div className="fin-track">
                      {c.orderIds.map((id, i) => (
                        <div key={`${id}-${i}`} className={`fin-track__seat ${i < c.recipientIdx ? "is-done" : ""} ${i === c.recipientIdx ? "is-current" : ""}`}>
                          <p className="ny-hud !text-[0.5rem]">Round {i + 1}</p>
                          <p className="mt-1 truncate text-xs font-semibold">{nameOf(id).split(" ")[0]}</p>
                          <p className="ny-hud mt-1 !text-[0.48rem]">{c.payoutLabels[i] ?? ""}</p>
                        </div>
                      ))}
                    </div>
                    <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onReorder(c)}>
                      <Scale className="h-3.5 w-3.5" /> Reorder the rotation
                    </button>
                  </>
                ) : (
                  <div className="ny-inset px-4 py-6 text-center">
                    <p className="ny-display text-base">{typeLabel[c.type]} doesn&apos;t rotate</p>
                    <p className="mt-1 text-sm text-text-secondary">The pool is held together until its goal or review date, then released by the trustees.</p>
                  </div>
                )}
              </div>
            )}

            {tab === "payouts" && (
              <div className="space-y-3">
                {isMgr && recipient ? (
                  <div className="ny-card-flat p-4">
                    <p className="ny-hud">Recipient this round</p>
                    <p className="ny-display mt-1 text-xl">{nameOf(recipient)}</p>
                    <p className="ny-num mt-1 text-sm text-text-secondary">{kes(c.pool)} · {c.payoutLabels[c.recipientIdx] ?? "this cycle"}</p>
                    <button type="button" className="ny-btn ny-btn-primary ny-btn-sm mt-3" onClick={() => onRotate(c)}>
                      <ShieldCheck className="h-3.5 w-3.5" /> Pay out now (2FA)
                    </button>
                    <p className="ny-chip ny-chip-sim mt-3">SIMULATED B2C · backend Phase 2</p>
                  </div>
                ) : (
                  <div className="ny-inset px-4 py-5 text-sm text-text-secondary">
                    Pool held: <span className="ny-num font-semibold text-text-primary">{kes(c.pool)}</span>. Releases to the trustees when {c.targetLabel.toLowerCase()} is reached.
                  </div>
                )}
                <p className="ny-hud">Payout history → statements tab</p>
              </div>
            )}

            {tab === "statements" && (
              <div className="space-y-2">
                {c.statements.map((s) => (
                  <div key={s.round} className="rounded-lg border border-border-subtle bg-surface-1 px-3.5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{s.round}</p>
                      <span className="ny-chip ny-chip-neutral">{s.status}</span>
                    </div>
                    <p className="ny-num mt-1 text-sm text-text-secondary">
                      {kes(s.collected)} collected · {s.late} late · {kes(s.penalties)} penalties · to {s.paidTo}
                    </p>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onStatements(c)}>
                    Open statements
                  </button>
                  <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onExport(c)}>
                    <Download className="h-3.5 w-3.5" /> Export statement
                  </button>
                </div>
              </div>
            )}

            {tab === "audit" && (
              <div className="space-y-1.5">
                {trail.length === 0 && <p className="ny-inset px-4 py-6 text-center text-sm text-text-secondary">No audit rows for this chama yet — actions appear here as they happen.</p>}
                {trail.map((a) => (
                  <div key={a.ref} className="cc-audit-row rounded-lg border border-border-subtle">
                    <span className={`mt-1.5 h-2 w-2 rounded-full ${a.tone === "gold" ? "bg-brand-accent" : a.tone === "red" ? "bg-danger" : "bg-text-tertiary"}`} />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{a.action}</span>
                      <span className="block text-xs text-text-secondary">{a.detail}</span>
                      <span className="ny-hud mt-1 block !text-[0.55rem]">{a.at} · {a.actor}</span>
                    </span>
                    <span className="ny-hud !text-[0.55rem]">{a.ref}</span>
                  </div>
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
/* Dividend declaration — admin, annual, 2FA, SIMULATED                 */
/* ------------------------------------------------------------------ */
export function DividendDrawer({
  open,
  onClose,
  shares,
  onDeclare,
}: {
  open: boolean;
  onClose: () => void;
  shares: number;
  onDeclare: (perShare: number) => void;
}) {
  const [perShare, setPerShare] = useState("100");
  const [code, setCode] = useState("");
  const ps = Number(perShare) || 0;
  const total = ps * sacco.sharesIssued;
  const reserve = Math.round((sacco.pool * sacco.reservePct) / 100);
  const ok = ps > 0 && code.length === 6;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Declare the annual dividend"
      sub={`${sacco.ref} · paid pro-rata to ${fmt(sacco.sharesIssued)} shares`}
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Not yet
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={!ok}
            onClick={() => {
              onDeclare(ps);
              setCode("");
              onClose();
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Declare (SIMULATED)
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="ny-inset px-4 py-3.5">
          <p className="ny-hud">Who it is for</p>
          <p className="mt-1 text-sm text-text-secondary">
            Every shareholder ({sacco.holders} holders) is paid per share held. Family head declares once a year, usually in {"April"}.
          </p>
        </div>

        <div>
          <label className="ny-label" htmlFor="div-ps">Dividend per share (KES)</label>
          <input id="div-ps" inputMode="numeric" className="ny-input ny-num" value={perShare} onChange={(e) => setPerShare(e.target.value.replace(/[^0-9]/g, ""))} />
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[75, 90, 100, 110, 125, 140].map((v) => (
              <button key={v} type="button" onClick={() => setPerShare(String(v))} className={`ny-num rounded-lg border px-2 py-2 text-sm font-semibold ${Number(perShare) === v ? "border-brand-primary bg-brand-primary text-on-brand" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
          {[
            ["Total to distribute", kes(total)],
            ["Your share of it", kes(ps * shares)],
            ["Reserve kept first", `${kesShort(reserve)} (${sacco.reservePct}%)`],
            ["Pool after payout", kesShort(sacco.pool - total)],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
              <dt className="text-text-secondary">{k}</dt>
              <dd className="ny-num font-semibold">{v}</dd>
            </div>
          ))}
        </dl>

        <div>
          <label className="ny-label" htmlFor="div-code"><Fingerprint className="mr-1 inline h-3.5 w-3.5" /> 2FA code (family head)</label>
          <input id="div-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
        </div>

        <div className="ny-inset px-3.5 py-3">
          <p className="ny-hud mb-2">Previous declarations</p>
          <ul className="space-y-1.5 text-sm">
            {dividends.slice(0, 4).map((d) => (
              <li key={d.year} className="flex justify-between gap-3">
                <span>{d.year}</span>
                <span className="ny-num">{kes(d.perShare)} / share</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="ny-chip ny-chip-sim">SIMULATED · ledger posts and member payouts connect in Phase 2</p>
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* Governance & audit — rules + append-only trail                       */
/* ------------------------------------------------------------------ */
export function GovernanceDrawer({
  open,
  onClose,
  rules,
  audit,
  onEdit,
  onExport,
  onOpenAudit,
}: {
  open: boolean;
  onClose: () => void;
  rules: Rules;
  audit: AuditEntry[];
  onEdit: () => void;
  onExport: () => void;
  onOpenAudit: (a: AuditEntry) => void;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Governance & audit"
      sub="Rules, approvals and every money-touching action"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={onExport}>
            <Download className="h-3.5 w-3.5" /> Export audit
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onEdit}>
            <Scale className="h-3.5 w-3.5" /> Edit rules (2FA)
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-2">
          {[
            ["Late penalty", kes(rules.penalty)],
            ["Grace period", `${rules.graceDays} days`],
            ["Skip policy", skipLabel[rules.skip]],
            ["Loan multiplier", `${rules.multiplier}× shares`],
            ["Reserve kept", `${rules.reservePct}%`],
            ["Dividend month", rules.dividendMonth],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
              <dt className="ny-hud">{k}</dt>
              <dd className="ny-num mt-1 text-sm font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="ny-chip ny-chip-sim">Rule edits need the family head&apos;s 2FA · SIMULATED</p>
        <div>
          <p className="ny-hud mb-2">Audit trail · append-only</p>
          <ul className="space-y-1.5">
            {audit.map((a) => (
              <li key={a.ref}>
                <button type="button" onClick={() => onOpenAudit(a)} className="cc-audit-row w-full rounded-lg border border-border-subtle text-left">
                  <span className={`mt-1.5 h-2 w-2 rounded-full ${a.tone === "gold" ? "bg-brand-accent" : a.tone === "red" ? "bg-danger" : "bg-text-tertiary"}`} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{a.action}</span>
                    <span className="block truncate text-xs text-text-secondary">{a.detail}</span>
                    <span className="ny-hud mt-1 block !text-[0.55rem]">{a.at} · {a.actor}</span>
                  </span>
                  <span className="ny-hud shrink-0 !text-[0.55rem]">{a.ref}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* Transaction filters — drawer                                         */
/* ------------------------------------------------------------------ */
export type TxFilters = { q: string; status: TxStatus | "all"; channel: Channel | "all"; group: string };
export const emptyTx: TxFilters = { q: "", status: "all", channel: "all", group: "all" };

export function TxFiltersDrawer({
  open,
  onClose,
  value,
  onChange,
  groups,
}: {
  open: boolean;
  onClose: () => void;
  value: TxFilters;
  onChange: (v: TxFilters) => void;
  groups: string[];
}) {
  const set = <K extends keyof TxFilters>(k: K, v: TxFilters[K]) => onChange({ ...value, [k]: v });
  const active = (value.q ? 1 : 0) + (value.status !== "all" ? 1 : 0) + (value.channel !== "all" ? 1 : 0) + (value.group !== "all" ? 1 : 0);
  const chip = (on: boolean) => `ny-chip ny-touch ${on ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`;
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter transactions"
      sub={`${active} filter${active === 1 ? "" : "s"} active`}
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onChange(emptyTx)}>
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
          <label className="ny-label" htmlFor="tx-q">Search member, ref or ledger</label>
          <input id="tx-q" className="ny-input" value={value.q} onChange={(e) => set("q", e.target.value)} placeholder="Faith, NY-SHR, LED-4526…" />
        </div>
        <div>
          <span className="ny-label">Status</span>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "confirmed", "pending", "scheduled", "failed"] as const).map((s) => (
              <button key={s} type="button" className={chip(value.status === s)} onClick={() => set("status", s)}>{s}</button>
            ))}
          </div>
        </div>
        <div>
          <span className="ny-label">Channel</span>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "mpesa", "airtel", "bank", "internal"] as const).map((c) => (
              <button key={c} type="button" className={chip(value.channel === c)} onClick={() => set("channel", c)}>
                {c === "all" ? "any" : channelMeta[c].label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="ny-label">Group</span>
          <div className="flex flex-col gap-1.5">
            {["all", ...groups].map((g) => (
              <button key={g} type="button" className={`rounded-lg border px-3 py-2 text-left text-sm transition ${value.group === g ? "border-brand-primary bg-[rgba(31,77,58,0.07)] font-semibold" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`} onClick={() => set("group", g)}>
                {g === "all" ? "Every chama, merry-go-round and the Sacco" : g}
              </button>
            ))}
          </div>
        </div>
        <div className="ny-inset flex items-center gap-2.5 px-3.5 py-3">
          <ArrowRight className="h-4 w-4 shrink-0 text-brand-primary" />
          <p className="text-xs leading-relaxed text-text-secondary">Filters apply instantly to the table in S4. Your signed-in row is always in the audit trail.</p>
        </div>
      </div>
    </Drawer>
  );
}
