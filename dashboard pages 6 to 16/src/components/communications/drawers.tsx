"use client";

import { useState } from "react";
import { ArrowRight, Check, MessageSquare, Send, UserRound, X } from "lucide-react";
import { Drawer } from "@/components/ui/overlay";
import { Tabs } from "@/components/ui/primitives";
import { fmt, kes } from "@/lib/format";
import {
  CHANNELS,
  CHANNEL_LABEL,
  people,
  personOf,
  type Broadcast,
  type Channel,
  replySeeds,
  type Delivery,
  type Person,
  type Reply,
  type Thread,
  type TemplateKind,
} from "@/data/dashboard/communications";

const DETAIL_TABS = [
  { id: "overview", label: "Overview" },
  { id: "recipients", label: "Recipients" },
  { id: "delivery", label: "Delivery" },
  { id: "replies", label: "Replies" },
];
const deliveryTone = { delivered: "ny-chip-ok", failed: "ny-chip-danger", pending: "ny-chip-warn" } as const;


/* ------------------------------------------------------------------ */
/* D1 — Broadcast detail, 4 tabs.                                        */
/* ------------------------------------------------------------------ */
export function BroadcastDrawer({
  broadcast,
  open,
  onClose,
  onResend,
  onDuplicate,
  onCancel,
  onReceipt,
  onReply,
}: {
  broadcast: Broadcast | null;
  open: boolean;
  onClose: () => void;
  onResend: (b: Broadcast) => void;
  onDuplicate: (b: Broadcast) => void;
  onCancel: (b: Broadcast) => void;
  onReceipt: (d: Delivery, p: Person) => void;
  onReply: (r: Reply, p: Person) => void;
}) {
  const [tab, setTab] = useState("overview");
  const b = broadcast;
  const isScheduled = b?.status === "scheduled";
  const deliveries = b?.deliveries ?? [];
  const replies = b?.id === "b1" ? replySeeds : replySeeds.slice(1, 3);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={b?.subject ?? "Broadcast"}
      sub={b ? `${b.ref} · ${b.audienceLabel} · ${b.audienceCount} recipients` : ""}
      width="max-w-[640px]"
      footer={
        b && (
          <>
            {isScheduled && <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onCancel(b)}><X className="h-3.5 w-3.5" /> Cancel schedule</button>}
            <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onDuplicate(b)}>Duplicate</button>
            <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => onResend(b)}><Send className="h-3.5 w-3.5" /> Re-simulate</button>
          </>
        )
      }
    >
      {b && (
        <>
          <Tabs tabs={DETAIL_TABS} active={tab} onChange={setTab} />
          <div className="pt-4">
            {tab === "overview" && (
              <div className="space-y-4">
                <div className="ny-inset flex items-center justify-between gap-3 px-4 py-3.5">
                  <div>
                    <p className="ny-hud">Broadcast status</p>
                    <p className="ny-display mt-1 text-lg">{b.status === "simulated" ? "SIMULATED fanout" : b.status}</p>
                    <p className="mt-1 text-sm text-text-secondary">{b.sentAt ? b.sentAt.replace("T", " · ").replace("+03:00", " EAT") : b.scheduledAt?.replace("T", " · ").replace("+03:00", " EAT") ?? "—"}</p>
                  </div>
                  <span className={`ny-chip ${b.status === "simulated" ? "ny-chip-sim" : b.status === "scheduled" ? "ny-chip-warn ny-pulse" : "ny-chip-neutral"}`}>{b.status}</span>
                </div>
                <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
                  {[
                    ["Audience", b.audienceLabel], ["Total members", String(b.audienceCount)], ["Delivered", String(b.delivered)],
                    ["Failed", String(b.failed)], ["Still pending", String(b.pending)], ["SMS cost estimate", `KES ${b.smsCost.toFixed(2)}`],
                    ["Channels", b.channels.map((c) => CHANNEL_LABEL[c]).join(", ")], ["Template", b.templateId ?? "Custom message"],
                  ].map(([k, v]) => <div key={k} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5"><dt className="ny-hud">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>)}
                </dl>
                {b.media && <img src={b.media} alt="Attached broadcast image" className="max-h-48 w-full rounded-xl object-cover" loading="lazy" />}
                <div className="rounded-xl border border-border-subtle bg-surface-1 p-3.5"><p className="ny-hud">Message</p><p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{b.body}</p></div>
                <p className="ny-chip ny-chip-sim">Every receipt is simulated · this broadcast did not leave the browser</p>
              </div>
            )}

            {tab === "recipients" && (
              <div className="space-y-2">
                <p className="ny-hud">Sample recipients · {deliveries.length} of {b.audienceCount}</p>
                {deliveries.map((d) => {
                  const p = personOf(d.personId);
                  if (!p) return null;
                  return <div key={`${d.personId}-${d.channel}`} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-primary text-xs font-bold text-on-brand">{p.initials}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{p.name}</span><span className="ny-hud block !text-[0.52rem]">{p.branch} · {p.address} · {CHANNEL_LABEL[d.channel]}</span></span><span className={`ny-chip ${deliveryTone[d.status]}`}>{d.status}</span></div>;
                })}
                <p className="ny-hud">+ {Math.max(0, b.audienceCount - deliveries.length)} more · receipts are simulated</p>
              </div>
            )}

            {tab === "delivery" && (
              <div className="space-y-2">
                {deliveries.map((d) => {
                  const p = personOf(d.personId);
                  if (!p) return null;
                  return <button key={`${d.personId}-${d.channel}`} type="button" onClick={() => onReceipt(d, p)} className="gd-section-item w-full text-left"><span className="min-w-0"><span className="block truncate text-sm font-semibold">{p.name}</span><span className="ny-hud block !text-[0.52rem]">{CHANNEL_LABEL[d.channel]} · {d.proof} · {d.at}</span></span><span className={`ny-chip ${deliveryTone[d.status]}`}>{d.status}</span></button>;
                })}
                <div className="ny-inset px-3.5 py-3"><p className="ny-hud">Delivery proof</p><p className="mt-1 text-sm text-text-secondary">Reference strings are marked SIMULATED. Real receipts come from Africa’s Talking and WhatsApp webhooks in Phase 2.</p></div>
              </div>
            )}

            {tab === "replies" && (
              <div className="space-y-2">
                {replies.map((r) => {
                  const p = personOf(r.personId);
                  if (!p) return null;
                  return <button key={r.id} type="button" onClick={() => onReply(r, p)} className="block w-full rounded-xl border border-border-subtle bg-surface-1 p-3 text-left transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-raise)]"><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{p.name}</span><span className="ny-hud !text-[0.52rem]">{CHANNEL_LABEL[r.via]} · {r.at}</span></div><p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{r.text}</p><span className={`ny-chip mt-2 ${r.routed ? "ny-chip-ok" : "ny-chip-warn"}`}>{r.routed ? "routed to thread" : "not yet routed"}</span></button>;
                })}
                <p className="ny-chip ny-chip-sim">Inbound replies shown from local mock data · webhook connects in Phase 2</p>
              </div>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* D2 — 1:1 member thread                                                */
/* ------------------------------------------------------------------ */
export function ThreadDrawer({ thread, person, onClose, onSend, onReveal }: { thread: Thread | null; person: Person | null; onClose: () => void; onSend: (text: string, ch: Channel) => void; onReveal: () => void }) {
  const [text, setText] = useState("");
  const [channel, setChannel] = useState<Channel>(thread?.channel ?? "whatsapp");
  if (!thread || !person) return null;
  return (
    <Drawer open onClose={onClose} title={person.name} sub={`${person.branch} · ${person.address} · ${CHANNEL_LABEL[thread.channel]} thread`} width="max-w-[560px]"
      footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onReveal}>Reveal contact</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={text.trim().length < 1} onClick={() => { onSend(text.trim(), channel); setText(""); }}><Send className="h-3.5 w-3.5" /> Send (SIMULATED)</button></>}
    >
      <div className="flex flex-wrap gap-1.5">{CHANNELS.map((c) => <button key={c} type="button" onClick={() => setChannel(c)} className={`ny-chip ny-touch ${channel === c ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>{CHANNEL_LABEL[c]}</button>)}</div>
      <div className="cm-thread mt-3">
        {thread.messages.map((m) => <div key={m.id} className={`cm-bubble ${m.from === "me" ? "is-me" : "is-them"}`}><p className="text-sm leading-relaxed">{m.text}</p><p className="ny-hud mt-1 text-right !text-[0.48rem]">{m.at} · {CHANNEL_LABEL[m.channel]} · {m.status}</p></div>)}
        <div className="cm-bubble is-them cm-typing" aria-label="Typing indicator preview"><span/><span/><span/></div>
      </div>
      <label className="ny-label mt-4" htmlFor="th-compose">Message</label>
      <textarea id="th-compose" className="ny-textarea" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${person.name.split(" ")[0]}…`} />
      <p className="ny-chip ny-chip-sim mt-3">1:1 messaging is SIMULATED · no message is sent</p>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* D3 — custom audience member picker                                    */
/* ------------------------------------------------------------------ */
export function AudiencePickerDrawer({ selected, onClose, onApply }: { selected: string[]; onClose: () => void; onApply: (ids: string[]) => void }) {
  const [ids, setIds] = useState<string[]>(selected);
  const [q, setQ] = useState("");
  const list = people.filter((p) => `${p.name} ${p.branch} ${p.address}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Drawer open onClose={onClose} title="Choose recipients" sub={`${ids.length} selected · 15 sample family members`} footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onApply(ids)}>Apply {ids.length} selected</button></>}>
      <input className="ny-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find by name, branch or town…" />
      <ul className="mt-3 space-y-1.5">{list.map((p) => { const on = ids.includes(p.id); return <li key={p.id}><button type="button" role="checkbox" aria-checked={on} onClick={() => setIds((prev) => on ? prev.filter((x) => x !== p.id) : [...prev, p.id])} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${on ? "border-brand-primary bg-[rgba(31,77,58,0.06)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}><span className={`grid h-5 w-5 shrink-0 place-items-center rounded border ${on ? "border-brand-primary bg-brand-primary text-on-brand" : "border-border-strong"}`}>{on ? <Check className="h-3 w-3"/> : null}</span><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-primary text-xs font-bold text-on-brand">{p.initials}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{p.name}</span><span className="ny-hud block !text-[0.52rem]">{p.branch} · {p.address}</span></span>{p.roles.includes("Elder") && <span className="ny-chip ny-chip-warn">elder</span>}</button></li>; })}</ul>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* D3 — Start a new 1:1 thread by picking a family member. */
export function ThreadPickerDrawer({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (p: Person) => void }) {
  const [q, setQ] = useState("");
  const list = people.filter((p) => `${p.name} ${p.branch} ${p.address}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Drawer open={open} onClose={onClose} title="Start a 1:1 conversation" sub="Pick a family member · all messages are SIMULATED" footer={<button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Close</button>}>
      <input className="ny-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a name, branch or town…" />
      <ul className="mt-3 space-y-1.5">{list.map((p) => <li key={p.id}><button type="button" className="flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-surface-1 px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-raise)]" onClick={() => { onPick(p); onClose(); }}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-primary text-xs font-bold text-on-brand">{p.initials}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{p.name}</span><span className="ny-hud block !text-[0.52rem]">{p.branch} · {p.address} · preferred {CHANNEL_LABEL[p.preferred]}</span></span></button></li>)}</ul>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* D4 — Broadcast filters                                                 */
/* ------------------------------------------------------------------ */
export type BroadcastFilters = { q: string; status: "all" | "simulated" | "scheduled" | "cancelled" | "draft"; channel: "all" | Channel; kind: "all" | TemplateKind };
export const emptyBroadcastFilters: BroadcastFilters = { q: "", status: "all", channel: "all", kind: "all" };


export function FiltersDrawer({ open, value, onChange, matched, onClose }: { open: boolean; value: BroadcastFilters; onChange: (v: BroadcastFilters) => void; matched: number; onClose: () => void }) {
  const set = <K extends keyof BroadcastFilters>(k: K, v: BroadcastFilters[K]) => onChange({ ...value, [k]: v });
  const chip = (on: boolean) => `ny-chip ny-touch ${on ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`;
  const n = (value.q ? 1 : 0) + (value.status !== "all" ? 1 : 0) + (value.channel !== "all" ? 1 : 0) + (value.kind !== "all" ? 1 : 0);
  return (
    <Drawer open={open} onClose={onClose} title="Filter broadcasts" sub={`${n} active · ${matched} match`} footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onChange(emptyBroadcastFilters)}>Clear all</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>Show {matched}</button></>}>
      <div className="space-y-4">
        <div><label className="ny-label" htmlFor="bf-q">Search subject or reference</label><input id="bf-q" className="ny-input" value={value.q} onChange={(e) => set("q", e.target.value)} placeholder="reunion, NY-BRD…" /></div>
        <div><span className="ny-label">Status</span><div className="flex flex-wrap gap-1.5">{(["all", "simulated", "scheduled", "draft", "cancelled"] as const).map((s) => <button key={s} type="button" className={chip(value.status === s)} onClick={() => set("status", s)}>{s === "all" ? "any" : s}</button>)}</div></div>
        <div><span className="ny-label">Channel</span><div className="flex flex-wrap gap-1.5">{(["all", "whatsapp", "sms", "email", "in-app"] as const).map((c) => <button key={c} type="button" className={chip(value.channel === c)} onClick={() => set("channel", c)}>{c === "all" ? "any" : CHANNEL_LABEL[c]}</button>)}</div></div>
        <div><span className="ny-label">Message type</span><div className="flex flex-wrap gap-1.5">{(["all", "event", "funeral", "harambee", "reminder", "alert", "general"] as const).map((k) => <button key={k} type="button" className={chip(value.kind === k)} onClick={() => set("kind", k)}>{k === "all" ? "any" : k}</button>)}</div></div>
      </div>
    </Drawer>
  );
}
