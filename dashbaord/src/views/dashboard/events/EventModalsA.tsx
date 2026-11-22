"use client";

import { Bell, CalendarClock, Check, Copy, Download, MessageCircle, Send, Trash, XCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { SimulatedBadge } from "@/components/ui/Primitives";
import { CAUSES, EVENT_KINDS, REMINDER_OFFSETS, VENUES, rsvpSummary, venueById, type EventKind, type FamilyEvent, type ReminderOffset } from "@/data/dashboard/events";
import { buildIcs, downloadText, eatLabel, longDate, TODAY_ISO } from "@/lib/calendar";
import { cn } from "@/lib/format";
import { bulkRemind, cancelEvent, deleteDraft, rescheduleEvent, setReminders, updateEvent } from "@/services/eventsService";
import type { EventsActions } from "@/views/dashboard/events/types";

const inputCls = "ny-input";

/* ─── 1. Edit event (md) ─────────────────────────────────────────────── */

export function EditEventModal({ open, event, actions }: { open: boolean; event: FamilyEvent | null; actions: EventsActions }) {
  const [title, setTitle] = useState(event?.title ?? "");
  const [kind, setKind] = useState<EventKind>(event?.kind ?? "Reunion");
  const [venueId, setVenueId] = useState(event?.venueId ?? VENUES[0].id);
  const [dressCode, setDressCode] = useState(event?.dressCode ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!event) return;
    if (title.trim().length < 4) return setError("The name needs at least four letters.");
    if (reason.trim().length < 6) return setError("Add a short reason for the audit trail.");
    actions.run(
      () => updateEvent(event.id, { title: title.trim(), kind, venueId, dressCode: dressCode.trim() || "Any", description: description.trim() }, reason.trim()),
      { title: "Gathering updated", body: `Logged: “${reason.trim()}”.`, tone: "success" },
    );
    actions.closeAct();
  };

  return (
    <ModalDialog
      open={open && Boolean(event)}
      onClose={actions.closeAct}
      size="md"
      title="Edit gathering"
      description="Changes apply at once and are written to the event's audit trail."
      footer={
        <div className="flex items-center justify-between gap-3">
          <SimulatedBadge label="Audited locally" />
          <div className="flex gap-2">
            <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Cancel</button>
            <button type="submit" form="edit-event-form" className="ny-btn ny-btn-primary ny-btn-sm">Save changes</button>
          </div>
        </div>
      }
    >
      <form id="edit-event-form" onSubmit={submit} className="space-y-4">
        {error && <p role="alert" className="rounded-xl bg-[#fbe5e5] p-3 text-sm text-danger">{error}</p>}
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Name</span>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Type</span>
            <select className={inputCls} value={kind} onChange={(e) => setKind(e.target.value as EventKind)}>
              {EVENT_KINDS.map((k) => <option key={k.kind}>{k.kind}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Venue</span>
            <select className={inputCls} value={venueId} onChange={(e) => setVenueId(e.target.value)}>
              {VENUES.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Dress code</span>
          <input className={inputCls} value={dressCode} onChange={(e) => setDressCode(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Description</span>
          <textarea rows={3} className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Reason for the change *</span>
          <input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Venue moved to the bigger hall" />
        </label>
      </form>
    </ModalDialog>
  );
}

/* ─── 2. Reschedule (sm) ─────────────────────────────────────────────── */

export function RescheduleModal({ open, event, actions }: { open: boolean; event: FamilyEvent | null; actions: EventsActions }) {
  const [date, setDate] = useState(event?.date ?? TODAY_ISO);
  const [start, setStart] = useState(event?.startTime ?? "13:00");
  const [end, setEnd] = useState(event?.endTime ?? "16:00");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = () => {
    if (!event) return;
    if (date < TODAY_ISO) return setError("Choose today or a later date.");
    if (start >= end) return setError("The end time must be after the start time.");
    if (reason.trim().length < 4) return setError("Add a short reason so guests understand the change.");
    actions.run(
      () => rescheduleEvent(event.id, date, start, end, reason.trim()),
      { title: "Rescheduled", body: `Now ${longDate(date)} at ${eatLabel(start)}. Guests are told (SIMULATED).`, tone: "success" },
    );
    actions.closeAct();
  };

  return (
    <ModalDialog
      open={open && Boolean(event)}
      onClose={actions.closeAct}
      size="sm"
      title="Reschedule"
      description={event ? `Moving “${event.title}”. Guests are told by their preferred channel.` : undefined}
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Cancel</button>
          <button type="button" onClick={save} className="ny-btn ny-btn-primary ny-btn-sm"><CalendarClock className="size-4" aria-hidden /> Move gathering</button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && <p role="alert" className="rounded-xl bg-[#fbe5e5] p-3 text-sm text-danger">{error}</p>}
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">New date (EAT)</span>
          <input type="date" min={TODAY_ISO} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Starts</span>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Ends</span>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Reason</span>
          <input className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Hall booked for a funeral that day" />
        </label>
      </div>
    </ModalDialog>
  );
}

/* ─── 3. Cancel with confirm (sm) ────────────────────────────────────── */

export function CancelEventModal({ open, event, actions }: { open: boolean; event: FamilyEvent | null; actions: EventsActions }) {
  const [reason, setReason] = useState("");
  const [understood, setUnderstood] = useState(false);
  const summary = event ? rsvpSummary(event) : null;

  const confirm = () => {
    if (!event || !understood || reason.trim().length < 8) return;
    actions.run(
      () => cancelEvent(event.id, reason.trim()),
      { title: "Gathering cancelled", body: `${summary?.going ?? 0} going guests are told (SIMULATED).`, tone: "warning" },
    );
    actions.closeAct();
  };

  return (
    <ModalDialog
      open={open && Boolean(event)}
      onClose={actions.closeAct}
      size="sm"
      title="Cancel this gathering?"
      description="Cancelling keeps the record and the audit trail. It cannot be undone from here."
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Keep it</button>
          <button type="button" onClick={confirm} disabled={!understood || reason.trim().length < 8} className="ny-btn ny-btn-sm bg-danger text-white">
            <XCircle className="size-4" aria-hidden /> Cancel gathering
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="rounded-2xl bg-surface-0/80 p-3.5 text-sm text-text-secondary">
          <strong className="text-text-primary">{event?.title}</strong> · {summary?.going ?? 0} going, {summary?.pending ?? 0} still waiting.
        </p>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Reason guests will see *</span>
          <textarea rows={3} className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Heavy rain forecast; we will reschedule for July" />
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-hairline p-3.5 text-sm">
          <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} className="mt-1 size-4 accent-brand-primary" />
          <span>I understand guests are told by WhatsApp, SMS and email (SIMULATED until the backend is wired).</span>
        </label>
      </div>
    </ModalDialog>
  );
}

/* ─── 4. Delete a draft (sm) ─────────────────────────────────────────── */

export function DeleteDraftModal({ open, event, actions }: { open: boolean; event: FamilyEvent | null; actions: EventsActions }) {
  return (
    <ModalDialog
      open={open && Boolean(event)}
      onClose={actions.closeAct}
      size="sm"
      title="Delete this draft?"
      description="Only drafts can be deleted. Scheduled and held gatherings are cancelled instead, so the record survives."
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Keep draft</button>
          <button
            type="button"
            onClick={() => {
              if (!event) return;
              actions.run(() => deleteDraft(event.id), { title: "Draft deleted", tone: "info" });
              actions.closeAct();
            }}
            className="ny-btn ny-btn-sm bg-danger text-white"
          >
            <Trash className="size-4" aria-hidden /> Delete draft
          </button>
        </div>
      }
    >
      <p className="text-sm text-text-secondary">“{event?.title}” will be removed from the calendar.</p>
    </ModalDialog>
  );
}

/* ─── 5. Share (sm) ──────────────────────────────────────────────────── */

export function ShareEventModal({ open, event, actions }: { open: boolean; event: FamilyEvent | null; actions: EventsActions }) {
  const link = event ? `nalyanya.family/dashboard/events?event=${event.id}` : "";
  const text = event
    ? `${event.title}: ${longDate(event.date)} at ${eatLabel(event.startTime)}, ${venueById(event.venueId)?.name}. Open the family calendar to RSVP.`
    : "";

  return (
    <ModalDialog
      open={open && Boolean(event)}
      onClose={actions.closeAct}
      size="sm"
      title="Share this gathering"
      description="Share a link or open WhatsApp with the details ready. You choose the chat and send it yourself."
      footer={<div className="flex justify-end"><button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Done</button></div>}
    >
      <div className="space-y-3">
        <div className="rounded-2xl border border-hairline bg-surface-0/70 p-3.5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Deep link</p>
          <code className="mt-1.5 block break-all font-mono text-xs text-brand-primary">{link}</code>
        </div>
        <button
          type="button"
          onClick={() => {
            if (typeof navigator !== "undefined" && navigator.clipboard) void navigator.clipboard.writeText(link);
            actions.notify({ title: "Link copied", body: "Anyone with the link can open this gathering after signing in.", tone: "success" });
          }}
          className="ny-btn ny-btn-primary w-full"
        >
          <Copy className="size-4" aria-hidden /> Copy link
        </button>
        <button
          type="button"
          onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`, "_blank", "noopener,noreferrer")}
          className="ny-btn ny-btn-gold w-full"
        >
          <MessageCircle className="size-4" aria-hidden /> Open WhatsApp share sheet
        </button>
        <p className="text-xs leading-relaxed text-text-tertiary">Opening the share sheet does not send anything for you.</p>
      </div>
    </ModalDialog>
  );
}

/* ─── 6. Download .ics for chosen events (sm) ────────────────────────── */

export function IcsModal({ open, event, events, actions }: { open: boolean; event: FamilyEvent | null; events: FamilyEvent[]; actions: EventsActions }) {
  const exportable = events.filter((e) => e.status === "scheduled" || e.status === "done");
  const [picked, setPicked] = useState<string[]>(event ? [event.id] : []);
  const toggle = (id: string) => setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const download = () => {
    const chosen = exportable.filter((e) => picked.includes(e.id));
    if (chosen.length === 0) return;
    downloadText(
      chosen.length === 1 ? `${chosen[0].id}.ics` : "nalyanya-selected-events.ics",
      buildIcs(
        chosen.map((e) => ({ id: e.id, title: e.title, date: e.date, startTime: e.startTime, endTime: e.endTime, location: venueById(e.venueId)?.name ?? "To confirm", description: e.description })),
        "Nalyanya family events",
      ),
    );
    actions.notify({ title: `${chosen.length} event${chosen.length === 1 ? "" : "s"} exported`, body: "Open the file to add it to your calendar app.", tone: "success" });
    actions.closeAct();
  };

  return (
    <ModalDialog
      open={open}
      onClose={actions.closeAct}
      size="sm"
      title="Export to your calendar"
      description="Pick the gatherings to include. Times are written in East African Time."
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-tertiary">{picked.length} selected</span>
          <button type="button" onClick={download} disabled={picked.length === 0} className="ny-btn ny-btn-primary ny-btn-sm">
            <Download className="size-4" aria-hidden /> Download .ics
          </button>
        </div>
      }
    >
      <ul className="ny-scroll max-h-80 space-y-2 overflow-y-auto pr-1">
        {exportable.map((e) => (
          <li key={e.id}>
            <label className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-3", picked.includes(e.id) ? "border-brand-primary bg-brand-primary/[0.05]" : "border-hairline")}>
              <input type="checkbox" checked={picked.includes(e.id)} onChange={() => toggle(e.id)} className="size-4 accent-brand-primary" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-text-primary">{e.title}</span>
                <span className="block text-xs text-text-tertiary">{longDate(e.date).split(",")[0]} · {eatLabel(e.startTime)}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>
    </ModalDialog>
  );
}

/* ─── 7. Nudge pending RSVPs (sm) ────────────────────────────────────── */

export function NudgeModal({ open, event, actions }: { open: boolean; event: FamilyEvent | null; actions: EventsActions }) {
  const [channel, setChannel] = useState<"WhatsApp" | "SMS">("WhatsApp");
  const [scope, setScope] = useState<"pending" | "all">("pending");
  const pending = event ? rsvpSummary(event).pending : 0;
  const reach = scope === "pending" ? pending : event?.rsvps.length ?? 0;

  return (
    <ModalDialog
      open={open && Boolean(event)}
      onClose={actions.closeAct}
      size="sm"
      title="Nudge guests who have not answered"
      description="A short, friendly reminder with the RSVP link. Sent by the chosen channel once the backend is wired."
      footer={
        <div className="flex items-center justify-between gap-2">
          <SimulatedBadge label="Sending SIMULATED" />
          <button
            type="button"
            disabled={reach === 0}
            onClick={() => {
              if (!event) return;
              actions.run(
                () => bulkRemind(event.id, scope),
                { title: `${reach} nudges queued (SIMULATED)`, body: `Routed via ${channel}. No message has left the family office.`, tone: "info" },
              );
              actions.closeAct();
            }}
            className="ny-btn ny-btn-primary ny-btn-sm"
          >
            <Send className="size-4" aria-hidden /> Queue nudges
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {(["pending", "all"] as const).map((s) => (
            <button key={s} type="button" onClick={() => setScope(s)} aria-pressed={scope === s} className={cn("rounded-2xl border p-3 text-left text-sm", scope === s ? "border-brand-primary bg-brand-primary/[0.06]" : "border-hairline")}>
              <strong className="block">{s === "pending" ? "Only pending" : "Everyone invited"}</strong>
              <span className="text-xs text-text-tertiary">{s === "pending" ? `${pending} guests` : `${event?.rsvps.length ?? 0} guests`}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(["WhatsApp", "SMS"] as const).map((c) => (
            <button key={c} type="button" onClick={() => setChannel(c)} aria-pressed={channel === c} className={cn("ny-chip cursor-pointer justify-center py-2.5", channel === c && "ny-chip-solid")}>
              {c === "WhatsApp" ? <MessageCircle className="size-3.5" aria-hidden /> : <Bell className="size-3.5" aria-hidden />} {c}
            </button>
          ))}
        </div>
        <p className="rounded-2xl bg-surface-0/80 p-3.5 text-xs leading-relaxed text-text-secondary">
          “Jambo! A gentle reminder to answer for {event?.title}. Tap the link to say going, maybe or not this time.”
        </p>
      </div>
    </ModalDialog>
  );
}

/* ─── 8. Reminder rules (sm) ─────────────────────────────────────────── */

export function RemindersModal({ open, event, actions }: { open: boolean; event: FamilyEvent | null; actions: EventsActions }) {
  const [picked, setPicked] = useState<ReminderOffset[]>(event?.reminders ?? []);
  const toggle = (id: ReminderOffset) => setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <ModalDialog
      open={open && Boolean(event)}
      onClose={actions.closeAct}
      size="sm"
      title="Reminder rules"
      description="Automatic reminders go to every going and maybe guest."
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Cancel</button>
          <button
            type="button"
            onClick={() => {
              if (!event) return;
              actions.run(() => setReminders(event.id, picked), { title: "Reminder rules saved", body: picked.length ? picked.join(" + ") : "No automatic reminders.", tone: "success" });
              actions.closeAct();
            }}
            className="ny-btn ny-btn-primary ny-btn-sm"
          >
            <Check className="size-4" aria-hidden /> Save rules
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        {REMINDER_OFFSETS.map((r) => (
          <label key={r.id} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-4", picked.includes(r.id) ? "border-brand-primary bg-brand-primary/[0.05]" : "border-hairline")}>
            <input type="checkbox" checked={picked.includes(r.id)} onChange={() => toggle(r.id)} className="mt-1 size-4 accent-brand-primary" />
            <span className="text-sm">
              <strong className="block text-text-primary">{r.label}</strong>
              <span className="text-xs text-text-secondary">{r.hint}</span>
            </span>
          </label>
        ))}
        <p className="text-xs text-text-tertiary">Linked contribution: {CAUSES.find((c) => c.id === event?.causeId)?.title ?? "none"}</p>
      </div>
    </ModalDialog>
  );
}
