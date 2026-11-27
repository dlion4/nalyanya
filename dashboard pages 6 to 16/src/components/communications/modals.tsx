"use client";

import { useState } from "react";
import { AlertTriangle, Check, Clock3, Copy, Download, Fingerprint, ImagePlus, Megaphone, RefreshCw, Send, ShieldCheck, Trash2, X } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import { kes } from "@/lib/format";
import { AS_OF, CHANNELS, CHANNEL_CAPABILITY, CHANNEL_DETAIL, CHANNEL_LABEL, SMS_COST_KES, templates, type Broadcast, type Channel, type Delivery, type Person, type Settings, type Template, type TemplateKind } from "@/data/dashboard/communications";

/* M1 — Test-send to one recipient, with a local proof string only. */
export function TestSendModal({ channel, onClose, onComplete }: { channel: Channel; onClose: () => void; onComplete: (proof: string) => void }) {
  const [to, setTo] = useState(channel === "email" ? "peter.wanyama@example.com" : "+254722 123 456");
  const [body, setBody] = useState("Habari Peter, this is a test from the Nalyanya family dashboard.");
  const [done, setDone] = useState(false);
  const proof = `SIM-${channel.toUpperCase().replace("-", "")}-TEST-0042`;
  return (
    <Modal open onClose={onClose} title={`Test ${CHANNEL_LABEL[channel]}`} sub="Preview only · nothing leaves this device in Phase 1" size="sm" tone="gold"
      footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Close</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={to.trim().length < 5 || done} onClick={() => { setDone(true); onComplete(proof); }}><Send className="h-3.5 w-3.5"/> Run test (SIMULATED)</button></>}
    >
      <label className="ny-label" htmlFor="ts-to">Test recipient</label>
      <input id="ts-to" className="ny-input" value={to} onChange={(e) => setTo(e.target.value)} />
      <label className="ny-label mt-3" htmlFor="ts-body">Message preview</label>
      <textarea id="ts-body" className="ny-textarea" value={body} onChange={(e) => setBody(e.target.value)} />
      {done && <div className="ny-inset mt-4 px-3.5 py-3"><p className="text-sm font-semibold">Local test preview ready</p><p className="ny-hud mt-1 !text-[0.52rem]">{proof} · {to} · SIMULATED</p></div>}
      <p className="ny-chip ny-chip-sim mt-3">{CHANNEL_CAPABILITY[channel]}</p>
    </Modal>
  );
}

/* M2 — Create/edit a saved template. */
export function TemplateEditorModal({ template, onClose, onSave }: { template: Template | null; onClose: () => void; onSave: (t: Omit<Template, "id"> & { id?: string }) => void }) {
  const [title, setTitle] = useState(template?.title ?? "");
  const [kind, setKind] = useState<TemplateKind>(template?.kind ?? "general");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [channels, setChannels] = useState<Channel[]>(template?.channels ?? ["whatsapp", "in-app"]);
  const [media, setMedia] = useState<string | undefined>(template?.media);
  const toggle = (c: Channel) => setChannels((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  const ok = title.trim().length >= 3 && subject.trim().length >= 3 && body.trim().length >= 10 && channels.length > 0;
  return (
    <Modal open onClose={onClose} title={template ? "Edit template" : "New message template"} sub="Saved locally · merge fields {first_name} and {branch} fill at send time" size="lg"
      footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!ok} onClick={() => onSave({ id: template?.id, title: title.trim(), kind, subject: subject.trim(), body: body.trim(), channels, media, hint: "Saved by the family" })}><Check className="h-3.5 w-3.5"/> Save template</button></>}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div><label className="ny-label" htmlFor="te-title">Template name</label><input id="te-title" className="ny-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nairobi dinner RSVP"/></div>
        <div><label className="ny-label" htmlFor="te-kind">Message type</label><select id="te-kind" className="ny-select" value={kind} onChange={(e) => setKind(e.target.value as TemplateKind)}>{(["event","funeral","harambee","reminder","alert","general"] as TemplateKind[]).map((k) => <option key={k}>{k}</option>)}</select></div>
        <div className="sm:col-span-2"><label className="ny-label" htmlFor="te-sub">Subject</label><input id="te-sub" className="ny-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="A note from the family"/></div>
        <div className="sm:col-span-2"><label className="ny-label" htmlFor="te-body">Message</label><textarea id="te-body" className="ny-textarea min-h-[150px]" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Habari {first_name}, …"/></div>
      </div>
      <div className="mt-3"><span className="ny-label">Channels</span><div className="flex flex-wrap gap-1.5">{CHANNELS.map((c) => <button key={c} type="button" aria-pressed={channels.includes(c)} onClick={() => toggle(c)} className={`ny-chip ny-touch ${channels.includes(c) ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>{CHANNEL_LABEL[c]}</button>)}</div></div>
      {channels.includes("whatsapp") && <div className="mt-3"><span className="ny-label">WhatsApp image</span><div className="flex flex-wrap gap-1.5">{["/images/frame-reunion.jpg","/images/cause-water.jpg","/images/cause-school.jpg","/images/cause-medical.jpg",""] .map((src,i)=><button key={src||"none"} type="button" onClick={()=>setMedia(src||undefined)} className={`overflow-hidden rounded-lg border-2 ${media===(src||undefined)?"border-brand-accent":"border-transparent opacity-75"}`}>{src?<img src={src} alt="" className="h-12 w-16 object-cover"/>:<span className="grid h-12 w-16 place-items-center bg-surface-2 text-[0.58rem]">No image</span>}</button>)}</div></div>}
      <p className="ny-chip ny-chip-sim mt-3">Template saves locally · no server calls</p>
    </Modal>
  );
}

/* M3 — Preview one template. */
export function TemplatePreviewModal({ template, onUse, onClose }: { template: Template; onUse: () => void; onClose: () => void }) {
  return <Modal open onClose={onClose} title={template.title} sub={`${template.kind} · ${template.hint}`} size="md" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Close</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onUse}>Use this template</button></>}><div className="cm-preview">{template.media&&<img src={template.media} alt="" className="cm-preview__image"/>}<div className="cm-preview__body"><span className="ny-chip ny-chip-ok mb-2">{template.channels.map((c)=>CHANNEL_LABEL[c]).join(" · ")}</span><p className="ny-display text-base">{template.subject}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{template.body}</p></div></div><p className="ny-chip ny-chip-sim mt-3">Merge fields fill per recipient · preview only</p></Modal>;
}

/* M4 — Confirm cancel for a scheduled broadcast. */
export function CancelBroadcastModal({ broadcast, onConfirm, onClose }: { broadcast: Broadcast; onConfirm: () => void; onClose: () => void }) {
  return <Modal open onClose={onClose} title="Cancel this scheduled broadcast?" sub={`${broadcast.ref} · ${broadcast.subject}`} size="sm" tone="danger" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Keep schedule</button><button type="button" className="ny-btn ny-btn-danger ny-btn-sm" onClick={onConfirm}><X className="h-3.5 w-3.5"/> Cancel schedule</button></>}><p className="text-sm leading-relaxed text-text-secondary">The planned message is removed from this local queue. It will not be sent.</p><p className="ny-chip ny-chip-sim mt-3">SIMULATED · cancellation is recorded in the audit trail</p></Modal>;
}

/* M5 — Duplicate, as a new local draft. */
export function DuplicateModal({ broadcast, onDuplicate, onClose }: { broadcast: Broadcast; onDuplicate: (audience: number) => void; onClose: () => void }) {
  const [same, setSame] = useState(true);
  const [all, setAll] = useState(false);
  return <Modal open onClose={onClose} title="Duplicate broadcast" sub={`${broadcast.ref} · ${broadcast.subject}`} size="sm" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onDuplicate(all ? 243 : broadcast.audienceCount)}><Copy className="h-3.5 w-3.5"/> Open as draft</button></>}><label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5 text-sm"><input type="checkbox" checked={same} onChange={()=>setSame(v=>!v)} className="mt-0.5 h-4 w-4 accent-[var(--color-brand-primary)]"/><span>Keep the same message and channels</span></label><label className="mt-2 flex cursor-pointer items-start gap-2.5 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5 text-sm"><input type="checkbox" checked={all} onChange={()=>setAll(v=>!v)} className="mt-0.5 h-4 w-4 accent-[var(--color-brand-primary)]"/><span>Expand the audience to all 243 members</span></label><p className="ny-chip ny-chip-sim mt-3">Opens a local draft · nothing is sent</p></Modal>;
}

/* M6 — Retry failed recipients. */
export function RetryModal({ broadcast, onRetry, onClose }: { broadcast: Broadcast; onRetry: () => void; onClose: () => void }) {
  return <Modal open onClose={onClose} title="Retry failed recipients?" sub={`${broadcast.ref} · ${broadcast.failed} failed`} size="sm" tone="gold" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Not now</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!broadcast.failed} onClick={onRetry}><RefreshCw className="h-3.5 w-3.5"/> Retry (SIMULATED)</button></>}><p className="text-sm leading-relaxed text-text-secondary">Failed recipients get up to two retries, at least ten minutes apart. The SMS daily budget is checked again.</p><p className="ny-chip ny-chip-sim mt-3">SIMULATED · retries create local delivery receipts only</p></Modal>;
}

/* M7 — Test-send proof. */
export function ProofModal({ channel, to, proof, onClose }: { channel: Channel; to: string; proof: string; onClose: () => void }) {
  return <Modal open onClose={onClose} title="Test-send preview" sub={`${CHANNEL_LABEL[channel]} · ${proof}`} size="sm" tone="gold" footer={<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>Done</button>}><div className="ny-inset flex items-center justify-between gap-3 px-3.5 py-3"><span className="ny-hud">Recipient</span><span className="ny-num font-semibold">{to}</span></div><div className="ny-inset mt-2 px-3.5 py-3"><p className="ny-hud">Local proof</p><p className="ny-num mt-1 text-sm font-semibold">{proof}</p></div><p className="ny-chip ny-chip-sim mt-3">SIMULATED · nothing was transmitted</p></Modal>;
}

/* M8 — Channel capability table. */
export function ChannelGuideModal({ onTest, onClose }: { onTest: (c: Channel) => void; onClose: () => void }) {
  return <Modal open onClose={onClose} title="Channel capabilities" sub="What each adapter can do when the backend is wired" size="md" footer={<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>Close</button>}><div className="space-y-2">{CHANNELS.map((c)=><div key={c} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-1 px-3.5 py-3"><div className="min-w-0"><p className="text-sm font-semibold">{CHANNEL_LABEL[c]}</p><p className="ny-hud mt-0.5 !text-[0.52rem]">{CHANNEL_DETAIL[c]}</p><p className="ny-hud !text-[0.5rem]">{CHANNEL_CAPABILITY[c]}</p></div><button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={()=>onTest(c)}>Test</button></div>)}</div><p className="ny-chip ny-chip-sim mt-4">SIMULATED · zero API calls · test creates a local proof string</p></Modal>;
}

/* M9 — Delivery proof for one person. */
export function DeliveryProofModal({ broadcast, delivery, person, onClose }: { broadcast: Broadcast; delivery: Delivery; person: Person; onClose: () => void }) {
  return <Modal open onClose={onClose} title="Delivery proof" sub={`${broadcast.ref} · ${delivery.proof}`} size="sm" footer={<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>Close</button>}><div className="ny-inset space-y-2 px-3.5 py-3 text-sm">{[["Person",person.name],["Channel",CHANNEL_LABEL[delivery.channel]],["Status",delivery.status],["Receipt",delivery.proof],["Time",delivery.at],["Broadcast",broadcast.subject]].map(([k,v])=><div key={k} className="flex justify-between gap-3"><span className="text-text-secondary">{k}</span><span className="text-right font-semibold">{v}</span></div>)}</div><p className="ny-chip ny-chip-sim mt-3">Local simulated reference, not a provider receipt</p></Modal>;
}

/* M10 — Inbound reply detail. */
export function ReplyModal({ reply, person, onOpenThread, onClose }: { reply: { id: string; at: string; text: string; via: "sms" | "whatsapp"; routed: boolean }; person: Person; onOpenThread: () => void; onClose: () => void }) {
  return <Modal open onClose={onClose} title={`Reply from ${person.name}`} sub={`${CHANNEL_LABEL[reply.via]} · ${reply.at}`} size="sm" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Close</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onOpenThread}>Open 1:1 thread</button></>}><blockquote className="rounded-xl border border-border-subtle bg-surface-2 p-4 text-sm leading-relaxed text-text-secondary">“{reply.text}”</blockquote><p className={`ny-chip mt-3 ${reply.routed ? "ny-chip-ok" : "ny-chip-warn"}`}>{reply.routed ? "Routed to the member thread" : "Needs routing in Phase 2"}</p><p className="ny-chip ny-chip-sim mt-2">Inbound replies are local mock data</p></Modal>;
}

/* M11 — Quiet hours, critical bypass, retry and SMS budget (family-wide, 2FA). */
export function SettingsModal({ settings, onSave, onClose }: { settings: Settings; onSave: (s: Settings) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(settings);
  const [code, setCode] = useState("");
  const update = <K extends keyof Settings>(k: K, v: Settings[K]) => setDraft((p) => ({ ...p, [k]: v }));
  const changed = JSON.stringify(draft) !== JSON.stringify(settings);
  return <Modal open onClose={onClose} title="Quiet hours & rate limits" sub="Family-wide controls · SMS budget changes need 2FA" size="lg" tone="gold" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!changed || code.length !== 6} onClick={() => onSave(draft)}><ShieldCheck className="h-3.5 w-3.5"/> Save settings</button></>}>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <SwitchRow label="Quiet hours" hint="EAT · non-critical waits until morning" value={draft.quietOn} onChange={(v)=>update("quietOn",v)}/>
      <SwitchRow label="Critical alert bypass" hint="Funeral or safety can break quiet hours" value={draft.criticalBypass} onChange={(v)=>update("criticalBypass",v)}/>
      <div><label className="ny-label" htmlFor="st-qf">Quiet starts</label><input id="st-qf" type="time" className="ny-input" value={draft.quietFrom} onChange={(e)=>update("quietFrom",e.target.value)}/></div>
      <div><label className="ny-label" htmlFor="st-qt">Quiet ends</label><input id="st-qt" type="time" className="ny-input" value={draft.quietTo} onChange={(e)=>update("quietTo",e.target.value)}/></div>
      <div><label className="ny-label" htmlFor="st-cap">SMS budget per day (KES)</label><input id="st-cap" inputMode="decimal" className="ny-input ny-num" value={draft.smsDailyCap} onChange={(e)=>update("smsDailyCap",Number(e.target.value.replace(/[^0-9.]/g, ""))||0)}/></div>
      <div><label className="ny-label" htmlFor="st-spent">Used today (KES)</label><input id="st-spent" inputMode="decimal" className="ny-input ny-num" value={draft.smsSpentToday} onChange={(e)=>update("smsSpentToday",Number(e.target.value.replace(/[^0-9.]/g, ""))||0)}/></div>
      <div><label className="ny-label" htmlFor="st-retry">Retry attempts · {draft.retryCount}</label><input id="st-retry" type="range" min={0} max={3} value={draft.retryCount} onChange={(e)=>update("retryCount",Number(e.target.value))} className="w-full accent-[var(--color-brand-primary)]"/><p className="ny-hud">Wait {draft.retryAfterMin} minutes between tries</p></div>
      <SwitchRow label="Push → SMS fallback" hint="If an important alert is unread for ten minutes" value={draft.fallback} onChange={(v)=>update("fallback",v)}/>
    </div>
    {draft.smsSpentToday >= draft.smsDailyCap && <p className="ny-chip ny-chip-danger mt-3">SMS budget is exhausted. SMS sends are blocked until tomorrow.</p>}
    <label className="ny-label mt-4" htmlFor="st-2fa"><Fingerprint className="mr-1 inline h-3.5 w-3.5"/> Family head’s 2FA code</label>
    <input id="st-2fa" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={(e)=>setCode(e.target.value.replace(/\D/g, "").slice(0,6))}/>
    <p className="ny-chip ny-chip-sim mt-3">SIMULATED · dev mode accepts any 6 digits</p>
  </Modal>;
}

function SwitchRow({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  return <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3"><div><p className="text-sm font-semibold">{label}</p><p className="ny-hud mt-0.5 !text-[0.52rem]">{hint}</p></div><button type="button" role="switch" aria-checked={value} aria-label={label} className="cm-switch" onClick={()=>onChange(!value)}/></div>;
}

/* M12 — Edit a scheduled EAT date/time. */
export function ScheduleModal({ broadcast, onSave, onClose }: { broadcast: Broadcast; onSave: (when: string) => void; onClose: () => void }) {
  const [date, setDate] = useState((broadcast.scheduledAt ?? "2025-11-20T08:30:00+03:00").slice(0,10));
  const [time, setTime] = useState((broadcast.scheduledAt ?? "2025-11-20T08:30:00+03:00").slice(11,16));
  return <Modal open onClose={onClose} title="Change schedule" sub={`${broadcast.ref} · EAT`} size="sm" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={()=>onSave(`${date}T${time}:00+03:00`)}>Save schedule</button></>}><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className="ny-label" htmlFor="sc-date">Date</label><input id="sc-date" type="date" min={AS_OF} className="ny-input" value={date} onChange={(e)=>setDate(e.target.value)}/></div><div><label className="ny-label" htmlFor="sc-time">Time · EAT</label><input id="sc-time" type="time" className="ny-input" value={time} onChange={(e)=>setTime(e.target.value)}/></div></div><p className="ny-chip ny-chip-sim mt-4">Saved locally · a scheduled broadcast will not send in Phase 1</p></Modal>;
}

/* M13 — Choose media from local family photographs. */
export function MediaPickerModal({ onPick, onClose }: { onPick: (src: string | undefined) => void; onClose: () => void }) {
  const images = ["/images/frame-reunion.jpg", "/images/cause-water.jpg", "/images/cause-school.jpg", "/images/cause-medical.jpg", "/images/cause-memorial.jpg", ""];
  return <Modal open onClose={onClose} title="Choose a WhatsApp image" sub="Local family-story photographs, not an upload" size="md" footer={<button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Close</button>}><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{images.map((src,i)=><button key={src||"none"} type="button" onClick={()=>{onPick(src||undefined);onClose();}} className="overflow-hidden rounded-lg border border-border-subtle text-left hover:-translate-y-0.5">{src?<img src={src} alt="" className="h-24 w-full object-cover"/>:<span className="grid h-24 place-items-center bg-surface-2 text-xs">No image</span>}<span className="block truncate px-2 py-1.5 text-xs">{src.split("/").pop()?.replace(".jpg","")||"No image"}</span></button>)}</div><p className="ny-chip ny-chip-sim mt-3">SIMULATED media attach · no upload</p></Modal>;
}

/* M14 — SMS budget details. */
export function BudgetModal({ settings, onSettings, onClose }: { settings: Settings; onSettings: () => void; onClose: () => void }) {
  const remaining = Math.max(0, settings.smsDailyCap - settings.smsSpentToday);
  return <Modal open onClose={onClose} title="SMS budget guard" sub="Per-day limit prevents unexpected family costs" size="sm" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Close</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onSettings}>Edit limits</button></>}><div className="ny-inset grid grid-cols-2 gap-3 px-3.5 py-3"><span><span className="ny-hud block">Daily cap</span><span className="ny-num font-semibold">{kes(settings.smsDailyCap)}</span></span><span><span className="ny-hud block">Spent today</span><span className="ny-num font-semibold">{kes(settings.smsSpentToday)}</span></span><span><span className="ny-hud block">Remaining</span><span className="ny-num font-semibold">{kes(remaining)}</span></span><span><span className="ny-hud block">Rate estimate</span><span className="ny-num font-semibold">KES {SMS_COST_KES.toFixed(2)} / SMS</span></span></div><p className="mt-3 text-sm leading-relaxed text-text-secondary">A long SMS can use more than one segment. The composer counts segments before you simulate the send.</p><p className="ny-chip ny-chip-sim mt-3">Budget check is local and simulated</p></Modal>;
}

/* M15 — Broadcast action confirm. */
export function BroadcastActionModal({ kind, broadcast, onConfirm, onClose }: { kind: "cancel"|"resend"|"duplicate"; broadcast: Broadcast; onConfirm: () => void; onClose: () => void }) {
  const title = kind === "cancel" ? "Cancel the schedule?" : kind === "resend" ? "Re-simulate this broadcast?" : "Duplicate this broadcast?";
  const body = kind === "cancel" ? "The scheduled broadcast is cancelled locally. Nothing is sent." : kind === "resend" ? "This creates a fresh set of local simulated receipts. No messages are sent." : "This opens a new draft with the same subject and audience. Review it before simulating.";
  const btn = kind === "cancel" ? "Cancel schedule" : kind === "resend" ? "Re-simulate" : "Open draft";
  return <Modal open onClose={onClose} title={title} sub={`${broadcast.ref} · ${broadcast.subject}`} size="sm" tone={kind === "cancel" ? "danger" : "gold"} footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Back</button><button type="button" className={`ny-btn ny-btn-sm ${kind === "cancel" ? "ny-btn-danger" : "ny-btn-primary"}`} onClick={onConfirm}>{btn}</button></>}><p className="text-sm leading-relaxed text-text-secondary">{body}</p><p className="ny-chip ny-chip-sim mt-3">SIMULATED · no external rail is called</p></Modal>;
}

export function ContactRevealModal({ person, onReveal, onClose }: { person: Person; onReveal: () => void; onClose: () => void }) {
  const [consent, setConsent] = useState(false);
  return (
    <Modal open onClose={onClose} title="Reveal this contact?" sub={`${person.name} · ${person.branch} · ${person.address}`} size="sm" tone="gold" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Not now</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!consent} onClick={onReveal}><ShieldCheck className="h-3.5 w-3.5"/> Reveal phone</button></>}>
      <p className="text-sm leading-relaxed text-text-secondary">The number is hidden until you need it. Every reveal is recorded under your name in the audit trail.</p>
      <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--color-brand-primary)]" checked={consent} onChange={() => setConsent((v) => !v)}/><span>I need to contact this person about family help and will not share the number outside the family.</span></label>
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · no call or message is placed</p>
    </Modal>
  );
}
