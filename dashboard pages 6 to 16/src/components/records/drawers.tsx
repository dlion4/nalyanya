"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, StickyNote } from "lucide-react";
import { Drawer } from "@/components/ui/overlay";
import { Tabs } from "@/components/ui/primitives";
import { kes } from "@/lib/format";
import {
  AS_OF,
  BRANCHES,
  BUCKETS,
  SOURCE_LABEL,
  channelLabel,
  fmtDate,
  roster,
  type Channel,
  type Note,
  type Source,
  type Tx,
  type TxFilters,
  countActive,
  emptyFilters,
} from "@/data/dashboard/records";

/* ------------------------------------------------------------------ */
/* D1 — One ledger line: summary, double entry, linked lines, notes, audit */
/* ------------------------------------------------------------------ */
const TX_TABS = [
  { id: "summary", label: "Summary" },
  { id: "ledger", label: "Ledger" },
  { id: "linked", label: "Linked" },
  { id: "notes", label: "Notes" },
  { id: "audit", label: "Audit" },
];

export function TxDrawer({
  tx,
  initialTab,
  notes,
  sameLink,
  onNote,
  onOpenTx,
  onClose,
}: {
  tx: Tx;
  initialTab: string;
  notes: Note[];
  sameLink: Tx[];
  onNote: () => void;
  onOpenTx: (id: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const debit = tx.dir === "in" ? `${channelLabel[tx.channel]} clearing` : `${SOURCE_LABEL[tx.source]} pool`;
  const credit = tx.dir === "in" ? `${SOURCE_LABEL[tx.source]} pool` : `${channelLabel[tx.channel]} clearing`;
  const trail = [
    { at: fmtDate(tx.date), text: `Posted to the ledger as ${tx.ref}` },
    { at: fmtDate(tx.date), text: `${tx.label} · ${kes(tx.amount)} via ${channelLabel[tx.channel]}` },
    { at: AS_OF, text: tx.status === "pending" ? "Statement line not yet imported, so the status is pending" : "Matched to the channel statement" },
  ];

  return (
    <Drawer
      open
      onClose={onClose}
      title={tx.label}
      sub={`${tx.ref} · ${fmtDate(tx.date)} · ${tx.branch}`}
      width="max-w-[600px]"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={onNote}>
            <StickyNote className="h-3.5 w-3.5" /> Add a note
          </button>
          <Link href={tx.href} className="ny-btn ny-btn-accent ny-btn-sm">
            Open the source <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </>
      }
    >
      <Tabs tabs={TX_TABS} active={tab} onChange={setTab} />
      <div className="pt-4">
        {tab === "summary" && (
          <div className="space-y-4">
            <div className="ny-inset flex items-center justify-between gap-3 px-4 py-3.5">
              <div>
                <p className="ny-hud">Amount</p>
                <p className={`ny-num ny-display text-2xl ${tx.dir === "in" ? "text-success" : "text-danger"}`}>
                  {tx.dir === "in" ? "+" : "−"}
                  {kes(tx.amount)}
                </p>
              </div>
              <span className={`ny-chip ${tx.status === "pending" ? "ny-chip-warn ny-pulse" : "ny-chip-ok"}`}>{tx.status}</span>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {[
                ["Member", tx.memberName],
                ["Branch", tx.branch],
                ["Channel", channelLabel[tx.channel]],
                ["Account", tx.account],
                ["Source", SOURCE_LABEL[tx.source]],
                ["Balance after", kes(tx.balance)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                  <dt className="ny-hud">{k}</dt>
                  <dd className="mt-1 font-medium text-text-primary">{v}</dd>
                </div>
              ))}
            </dl>
            {tx.note && <p className="text-sm leading-relaxed text-text-secondary">{tx.note}</p>}
          </div>
        )}

        {tab === "ledger" && (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-xl border border-border-subtle text-sm">
              <div className="flex items-center justify-between gap-3 bg-surface-2 px-3.5 py-2.5">
                <span className="ny-hud">Debit</span>
                <span className="font-semibold">{debit}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-3.5 py-2.5">
                <span className="ny-hud">Credit</span>
                <span className="font-semibold">{credit}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-border-subtle bg-[rgba(31,77,58,0.06)] px-3.5 py-3">
                <span className="ny-hud">Amount</span>
                <span className="ny-num ny-display text-lg">{kes(tx.amount)}</span>
              </div>
            </div>
            <p className="ny-hud">Debits and credits stay balanced by construction</p>
          </div>
        )}

        {tab === "linked" && (
          <div className="space-y-2">
            <p className="ny-hud">Same module entity</p>
            {sameLink.length === 0 && <p className="ny-inset px-4 py-5 text-sm text-text-secondary">No other ledger lines point at this entity.</p>}
            {sameLink.map((t) => (
              <button key={t.id} type="button" onClick={() => onOpenTx(t.id)} className="gd-section-item w-full text-left">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{t.label} · {t.memberName}</span>
                  <span className="ny-hud block !text-[0.55rem]">{fmtDate(t.date)} · {t.ref}</span>
                </span>
                <span className="ny-num shrink-0 text-sm font-semibold">{kes(t.amount)}</span>
              </button>
            ))}
            <Link href={tx.href} className="ny-btn ny-btn-outline ny-btn-sm mt-2 w-full">
              Open the module record <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {tab === "notes" && (
          <div className="space-y-2">
            {notes.length === 0 && <p className="ny-inset px-4 py-6 text-center text-sm text-text-secondary">No notes on this line yet.</p>}
            {notes.map((n) => (
              <div key={n.id} className="rc-note rounded-lg border border-border-subtle bg-surface-1 px-3.5 py-3">
                <p className="text-sm leading-relaxed">{n.text}</p>
                <p className="ny-hud mt-2 !text-[0.52rem]">
                  {n.author} · {fmtDate(n.at)} · {n.tags.join(", ") || "untagged"}
                </p>
              </div>
            ))}
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm mt-2 w-full" onClick={onNote}>
              <StickyNote className="h-3.5 w-3.5" /> Add a note
            </button>
          </div>
        )}

        {tab === "audit" && (
          <ol className="space-y-3">
            {trail.map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-brand-primary" />
                <div className="min-w-0 flex-1">
                  <p className="ny-hud !text-[0.55rem]">{a.at}</p>
                  <p className="text-sm leading-relaxed text-text-secondary">{a.text}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* D2 — Filters for the unified history (type, date, member, channel, branch) */
/* ------------------------------------------------------------------ */
export function FiltersDrawer({
  value,
  matched,
  onChange,
  onClose,
}: {
  value: TxFilters;
  matched: number;
  onChange: (f: TxFilters) => void;
  onClose: () => void;
}) {
  const set = <K extends keyof TxFilters>(k: K, v: TxFilters[K]) => onChange({ ...value, [k]: v });
  const chip = (on: boolean) => `ny-chip ny-touch ${on ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`;
  const channels: (Channel | "all")[] = ["all", "mpesa", "bank", "airtel", "internal"];
  return (
    <Drawer
      open
      onClose={onClose}
      title="Filter the ledger"
      sub={`${countActive(value)} filter${countActive(value) === 1 ? "" : "s"} active · ${matched} lines match`}
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onChange(emptyFilters)}>
            Clear all
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
            Show {matched} lines
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="ny-label" htmlFor="rf-q">Search member, ref or note</label>
          <input id="rf-q" className="ny-input" value={value.q} onChange={(e) => set("q", e.target.value)} placeholder="Ruth, NY-LED, school…" />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
          <div>
            <label className="ny-label" htmlFor="rf-from">From</label>
            <input id="rf-from" type="date" className="ny-input" value={value.from} onChange={(e) => set("from", e.target.value)} />
          </div>
          <div>
            <label className="ny-label" htmlFor="rf-to">To</label>
            <input id="rf-to" type="date" className="ny-input" value={value.to} onChange={(e) => set("to", e.target.value)} />
          </div>
        </div>
        <div>
          <span className="ny-label">Type</span>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={chip(value.bucket === "all")} onClick={() => set("bucket", "all")}>any</button>
            {BUCKETS.map((b) => (
              <button key={b} type="button" className={chip(value.bucket === b)} onClick={() => set("bucket", b)}>
                {b}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="ny-label">Member</span>
          <select aria-label="Member" className="ny-select" value={value.member} onChange={(e) => set("member", e.target.value)}>
            <option value="all">Everyone</option>
            {roster.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="ny-label">Channel</span>
          <div className="flex flex-wrap gap-1.5">
            {channels.map((c) => (
              <button key={c} type="button" className={chip(value.channel === c)} onClick={() => set("channel", c)}>
                {c === "all" ? "any" : channelLabel[c]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="ny-label">Branch</span>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={chip(value.branch === "all")} onClick={() => set("branch", "all")}>any</button>
            {BRANCHES.map((b) => (
              <button key={b} type="button" className={chip(value.branch === b)} onClick={() => set("branch", b)}>
                {b}
              </button>
            ))}
          </div>
        </div>
        <div className="ny-inset px-3.5 py-3 text-xs leading-relaxed text-text-secondary">
          Filters apply to the table at once. A line you open stays deep-linked, so the back button closes it first.
        </div>
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* D3 — Attribution: who funded one source, and its latest lines          */
/* ------------------------------------------------------------------ */
export function AttributionDrawer({
  source,
  rows,
  onOpenTx,
  onClose,
}: {
  source: Source;
  rows: Tx[];
  onOpenTx: (id: string) => void;
  onClose: () => void;
}) {
  const list = rows.filter((t) => t.source === source);
  const total = list.reduce((s, t) => s + t.amount, 0);
  const people = Array.from(
    list.reduce((map, t) => {
      const cur = map.get(t.member);
      map.set(t.member, { id: t.member, name: t.memberName, total: (cur?.total ?? 0) + t.amount });
      return map;
    }, new Map<string, { id: string; name: string; total: number }>()).values(),
  ).sort((a, b) => b.total - a.total);
  const top = people[0]?.total ?? 1;

  return (
    <Drawer
      open
      onClose={onClose}
      title={`${SOURCE_LABEL[source]} · who funded it`}
      sub={`${list.length} lines · ${kes(total)} moved`}
      width="max-w-[560px]"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="ny-hud mb-2">Contributors, largest first</p>
          <ul className="space-y-2">
            {people.map((p, i) => (
              <li key={p.id} className="rounded-lg border border-border-subtle bg-surface-1 px-3.5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-semibold">
                    {i + 1}. {p.name}
                  </span>
                  <span className="ny-num shrink-0 text-sm font-semibold">{kes(p.total)}</span>
                </div>
                <div className="rc-meter mt-2">
                  <span className="rc-meter__bar" style={{ ["--p" as string]: p.total / top }} />
                </div>
              </li>
            ))}
            {people.length === 0 && <li className="ny-inset px-4 py-6 text-center text-sm text-text-secondary">No lines from this source yet.</li>}
          </ul>
        </div>
        <div>
          <p className="ny-hud mb-2">Latest lines</p>
          <ul className="space-y-1.5">
            {list.slice(-6).reverse().map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => onOpenTx(t.id)} className="gd-section-item w-full text-left">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{t.label}</span>
                    <span className="ny-hud block !text-[0.55rem]">{fmtDate(t.date)} · {t.ref}</span>
                  </span>
                  <span className="ny-num shrink-0 text-sm font-semibold">{kes(t.amount)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <p className="ny-chip ny-chip-sim">
          <Download className="mr-1 inline h-3 w-3" /> Attribution exports ride on the export center
        </p>
      </div>
    </Drawer>
  );
}

