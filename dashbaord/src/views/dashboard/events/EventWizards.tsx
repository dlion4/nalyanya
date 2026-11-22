"use client";

import { ArrowLeft, ArrowRight, Check, CircleCheck, MessageCircle, Radio, Send, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { Avatar, SimulatedBadge } from "@/components/ui/Primitives";
import { BRANCHES } from "@/data/family/branches";
import { MEMBERS } from "@/data/family/people";
import {
  CAUSES,
  EVENT_KINDS,
  INVITE_AUDIENCES,
  REMINDER_OFFSETS,
  VENUES,
  memberById,
  venueById,
  type AudienceId,
  type EventKind,
  type FamilyEvent,
  type ReminderOffset,
} from "@/data/dashboard/events";
import { diffDays, eatLabel, longDate, shortDay, TODAY_ISO } from "@/lib/calendar";
import { cn } from "@/lib/format";
import { createEvent, sendInvites } from "@/services/eventsService";
import { KindIcon, kindAccent } from "@/views/dashboard/events/eventsUi";
import type { Channel } from "@/types/family";
import type { EventsActions } from "@/views/dashboard/events/types";

/* ─── Builder wizard (6 steps, lg modal) ─────────────────────────────── */

const BUILDER_STEPS = ["Type", "When & where", "Hosts", "Details", "RSVP & reminders", "Review"] as const;
const COVERS = [
  "/images/family/reunion.jpg",
  "/images/family/wedding.jpg",
  "/images/family/birthday.jpg",
  "/images/family/harambee.jpg",
  "/images/family/meeting.jpg",
  "/images/family/clinic.jpg",
  "/images/family/picnic.jpg",
  "/images/family/sunday-lunch.jpg",
];

interface BuilderForm {
  kind: EventKind;
  date: string;
  startTime: string;
  endTime: string;
  venueId: string;
  host: string;
  branchId: string;
  title: string;
  description: string;
  dressCode: string;
  cover: string;
  capacity: number;
  reminders: ReminderOffset[];
  causeId: string;
}

function initialForm(kind: EventKind | null, date: string | null): BuilderForm {
  return {
    kind: kind ?? "Reunion",
    date: date && date >= TODAY_ISO ? date : "2026-05-20",
    startTime: "13:00",
    endTime: "16:00",
    venueId: "V-KAS",
    host: "NY-MBR-00019",
    branchId: "nairobi-peter",
    title: "",
    description: "",
    dressCode: "Smart casual",
    cover: COVERS[0],
    capacity: 60,
    reminders: ["E-2d", "E-1h"],
    causeId: "",
  };
}

const HOST_OPTIONS = MEMBERS.filter((m) => m.deathYear === undefined).slice(0, 120);

export function EventBuilderWizard({
  open,
  events,
  presetType,
  presetDate,
  actions,
}: {
  open: boolean;
  events: FamilyEvent[];
  presetType: string | null;
  presetDate: string | null;
  actions: EventsActions;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BuilderForm>(() => initialForm(null, null));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const kind = EVENT_KINDS.find((k) => k.kind === presetType)?.kind ?? null;
    setForm(initialForm(kind, presetDate));
    setStep(1);
    setError(null);
  }, [open, presetType, presetDate]);

  const patch = <K extends keyof BuilderForm>(key: K, value: BuilderForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const venue = venueById(form.venueId);
  const clashes = useMemo(
    () => events.filter((e) => e.venueId === form.venueId && e.date === form.date && e.status !== "cancelled" && e.status !== "draft"),
    [events, form.venueId, form.date],
  );

  const validate = (s: number): string | null => {
    if (s === 2) {
      if (form.date < TODAY_ISO) return "Pick today or a date in the future. Past gatherings belong in the archive.";
      if (form.startTime >= form.endTime) return "The end time must come after the start time.";
    }
    if (s === 4) {
      if (form.title.trim().length < 4) return "Give the gathering a clear name of at least four letters.";
      if (form.description.trim().length < 10) return "Add a sentence or two so relatives know what to expect.";
    }
    if (s === 5 && form.capacity < 5) return "Capacity must be at least five guests.";
    return null;
  };

  const next = () => {
    const problem = validate(step);
    if (problem) {
      setError(problem);
      return;
    }
    setStep((s) => Math.min(6, s + 1));
  };

  const create = () => {
    actions.run(
      () =>
        createEvent({
          title: form.title.trim(),
          kind: form.kind,
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          venueId: form.venueId,
          host: form.host,
          branchId: form.branchId,
          description: form.description.trim(),
          dressCode: form.dressCode,
          capacity: form.capacity,
          reminders: form.reminders,
          causeId: form.causeId || null,
        }),
      { title: "Gathering created", body: `${form.title} is on the calendar for ${shortDay(form.date)}. Reminders are set.`, tone: "success" },
      (list) => actions.setParams({ act: null, event: list[0]?.id, type: null, date: null }, "push"),
    );
  };

  const hostMember = memberById(form.host);

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs font-semibold text-text-tertiary">Step {step} of 6 · {BUILDER_STEPS[step - 1]}</span>
      <div className="flex gap-2">
        {step > 1 ? (
          <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} className="ny-btn ny-btn-ghost ny-btn-sm">
            <ArrowLeft className="size-4" aria-hidden /> Back
          </button>
        ) : (
          <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Cancel</button>
        )}
        {step < 6 ? (
          <button type="button" onClick={next} className="ny-btn ny-btn-primary ny-btn-sm">
            Continue <ArrowRight className="size-4" aria-hidden />
          </button>
        ) : (
          <button type="button" onClick={create} disabled={actions.pending} className="ny-btn ny-btn-gold ny-btn-sm">
            <CircleCheck className="size-4" aria-hidden /> {actions.pending ? "Creating…" : "Create gathering"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <ModalDialog
      open={open}
      onClose={actions.closeAct}
      size="lg"
      title="Plan a gathering"
      description="Six calm steps. Times are East African Time, and the venue is checked for clashes before you create it."
      footer={footer}
    >
      <div className="space-y-6">
        <ol className="grid grid-cols-6 gap-1.5" aria-label="Builder steps">
          {BUILDER_STEPS.map((label, i) => {
            const idx = i + 1;
            const done = step > idx;
            const current = step === idx;
            return (
              <li
                key={label}
                className={cn(
                  "rounded-2xl border p-2 text-center transition",
                  current ? "border-brand-primary bg-brand-primary text-white" : done ? "border-brand-accent/60 bg-brand-accent-soft/50" : "border-hairline bg-surface-0/70 text-text-tertiary",
                )}
              >
                <span className="mx-auto grid size-6 place-items-center rounded-full bg-white/20 text-[11px] font-bold">{done ? <Check className="size-3.5" aria-hidden /> : idx}</span>
                <span className="mt-1 hidden truncate text-[10px] font-semibold sm:block">{label}</span>
              </li>
            );
          })}
        </ol>

        {error && (
          <div role="alert" className="rounded-2xl border border-danger/40 bg-[#fbe5e5] px-4 py-3 text-sm font-medium text-danger">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {EVENT_KINDS.map((k) => (
              <button
                key={k.kind}
                type="button"
                onClick={() => patch("kind", k.kind)}
                aria-pressed={form.kind === k.kind}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-left transition",
                  form.kind === k.kind ? "border-brand-primary bg-brand-primary/[0.06] shadow-soft" : "border-hairline bg-surface-0/60 hover:border-brand-primary/40",
                )}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ background: `${k.accent}22`, color: k.accent }}>
                  <KindIcon kind={k.kind} />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-text-primary">{k.kind}</span>
                  <span className="block text-xs leading-snug text-text-secondary">{k.blurb}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Date (EAT)</span>
                <input type="date" value={form.date} min={TODAY_ISO} onChange={(e) => patch("date", e.target.value)} className="ny-input" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Starts</span>
                <input type="time" value={form.startTime} onChange={(e) => patch("startTime", e.target.value)} className="ny-input" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Ends</span>
                <input type="time" value={form.endTime} onChange={(e) => patch("endTime", e.target.value)} className="ny-input" />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Venue</span>
              <select value={form.venueId} onChange={(e) => patch("venueId", e.target.value)} className="ny-input">
                {VENUES.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} · {v.town} ({v.capacity === 999 ? "online" : `${v.capacity} seats`})</option>
                ))}
              </select>
            </label>
            <div className={cn("flex items-start gap-3 rounded-2xl border p-4 text-sm", clashes.length ? "border-brand-accent/60 bg-brand-accent-soft/40" : "border-hairline bg-surface-0/70")}>
              {clashes.length ? <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[#8a5d00]" aria-hidden /> : <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />}
              <p className="text-text-secondary">
                {clashes.length
                  ? <>This venue already has <strong className="text-text-primary">{clashes.map((c) => c.title).join(", ")}</strong> on {shortDay(form.date)}. You can still create it; the venue team will confirm.</>
                  : <>{venue?.name} is free on {shortDay(form.date)}. Days ahead: {diffDays(TODAY_ISO, form.date)}.</>}
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Branch</span>
              <select value={form.branchId} onChange={(e) => patch("branchId", e.target.value)} className="ny-input">
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Host</span>
              <select value={form.host} onChange={(e) => patch("host", e.target.value)} className="ny-input">
                {HOST_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>{m.preferredName} {m.lastName} · Gen {m.generation}</option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface-0/70 p-4 sm:col-span-2">
              {hostMember && <Avatar member={hostMember} size={44} />}
              <div className="min-w-0">
                <p className="font-semibold text-text-primary">{hostMember ? `${hostMember.preferredName} ${hostMember.lastName}` : "Choose a host"}</p>
                <p className="text-xs text-text-tertiary">Hosts get a reminder and can edit the gathering. Co-hosts are added after creation.</p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Name of the gathering</span>
              <input value={form.title} onChange={(e) => patch("title", e.target.value)} className="ny-input" placeholder="e.g. Kimilili reunion committee" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">What to expect</span>
              <textarea rows={3} value={form.description} onChange={(e) => patch("description", e.target.value)} className="ny-input" placeholder="Plain words, so elders and young cousins both understand." />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Dress code</span>
                <input value={form.dressCode} onChange={(e) => patch("dressCode", e.target.value)} className="ny-input" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Linked contribution (optional)</span>
                <select value={form.causeId} onChange={(e) => patch("causeId", e.target.value)} className="ny-input">
                  <option value="">None for now</option>
                  {CAUSES.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Cover photo</p>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
                {COVERS.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => patch("cover", src)}
                    aria-pressed={form.cover === src}
                    aria-label={`Use cover ${src.split("/").pop()}`}
                    className={cn("aspect-square overflow-hidden rounded-xl border-2 transition", form.cover === src ? "border-brand-accent shadow-gold" : "border-transparent opacity-80 hover:opacity-100")}
                  >
                    <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Seats to plan for (guests + plus-ones)</span>
              <input type="number" min={5} max={999} value={form.capacity} onChange={(e) => patch("capacity", Number(e.target.value) || 0)} className="ny-input ny-num" />
            </label>
            <div className="space-y-2">
              <p className="text-sm font-semibold">Automatic reminders</p>
              {REMINDER_OFFSETS.map((r) => {
                const on = form.reminders.includes(r.id);
                return (
                  <label key={r.id} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-4", on ? "border-brand-primary bg-brand-primary/[0.05]" : "border-hairline bg-surface-0/60")}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => patch("reminders", on ? form.reminders.filter((x) => x !== r.id) : [...form.reminders, r.id])}
                      className="mt-1 size-4 accent-brand-primary"
                    />
                    <span className="text-sm">
                      <strong className="block text-text-primary">{r.label}</strong>
                      <span className="text-xs text-text-secondary">{r.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="flex items-center gap-2 text-xs text-text-tertiary">
              <MessageCircle className="size-3.5" aria-hidden /> Reminders route to WhatsApp, with SMS for basic phones. <SimulatedBadge label="Sending SIMULATED" />
            </p>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-brand-accent/50 bg-brand-accent-soft/30">
              <div className="grid gap-4 p-5 sm:grid-cols-[7rem_1fr]">
                <img src={form.cover} alt="" className="h-28 w-full rounded-2xl object-cover sm:h-full" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-secondary">{form.kind} · {longDate(form.date)}</p>
                  <p className="ny-title mt-1 text-2xl leading-snug">{form.title || "Untitled gathering"}</p>
                  <p className="mt-1 text-sm text-text-secondary">{eatLabel(form.startTime)} – {form.endTime} · {venue?.name}</p>
                  <p className="mt-2 text-sm text-text-secondary">Host: {hostMember ? `${hostMember.preferredName} ${hostMember.lastName}` : "Family office"} · {form.capacity} seats · dress: {form.dressCode}</p>
                </div>
              </div>
            </div>
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm"><dt className="text-xs text-text-tertiary">Reminders</dt><dd className="mt-0.5 font-semibold">{form.reminders.join(" + ") || "None"}</dd></div>
              <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm"><dt className="text-xs text-text-tertiary">Cause</dt><dd className="mt-0.5 font-semibold">{CAUSES.find((c) => c.id === form.causeId)?.title ?? "None"}</dd></div>
              <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm"><dt className="text-xs text-text-tertiary">Clash check</dt><dd className="mt-0.5 font-semibold">{clashes.length ? `${clashes.length} at venue` : "Clear"}</dd></div>
            </dl>
            <p className="text-xs leading-relaxed text-text-tertiary">
              Creating saves the gathering to the calendar and the audit trail. Invitations are a separate step (SIMULATED until the backend is wired).
            </p>
          </div>
        )}
      </div>
    </ModalDialog>
  );
}

/* ─── Invite wizard (3 steps, md modal) ──────────────────────────────── */

const CHANNELS: Array<{ id: Channel; label: string; hint: string; icon: typeof MessageCircle }> = [
  { id: "WhatsApp", label: "WhatsApp", hint: "Rich card with venue and time", icon: MessageCircle },
  { id: "SMS", label: "SMS", hint: "Works on basic phones", icon: Radio },
  { id: "Email", label: "Email", hint: "Long-form for the diaspora", icon: Send },
];

function audienceSize(id: AudienceId, branch: string, gen: number, event: FamilyEvent | null): number {
  const living = MEMBERS.filter((m) => m.deathYear === undefined);
  switch (id) {
    case "all":
      return living.filter((m) => m.phone || m.email).length;
    case "branch":
      return living.filter((m) => m.branchId === branch && (m.phone || m.email)).length;
    case "gen":
      return living.filter((m) => m.generation === gen && (m.phone || m.email)).length;
    case "elders":
      return living.filter((m) => 2026 - m.birthYear >= 60 && m.phone).length;
    case "pending":
      return event ? event.rsvps.filter((r) => r.status === "pending").length : 0;
  }
}

export function InviteWizard({ open, event, actions }: { open: boolean; event: FamilyEvent | null; actions: EventsActions }) {
  const [step, setStep] = useState(1);
  const [audience, setAudience] = useState<AudienceId>("all");
  const [branch, setBranch] = useState(BRANCHES[0].id);
  const [gen, setGen] = useState(3);
  const [channel, setChannel] = useState<Channel>("WhatsApp");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open || !event) return;
    setStep(1);
    setAudience(event.status === "scheduled" ? "all" : "pending");
    setMessage(`Jambo family! You are invited to “${event.title}” on ${longDate(event.date)} at ${eatLabel(event.startTime)} at ${venueById(event.venueId)?.name}. Reply YES to confirm, or NO if you cannot come.`);
  }, [open, event]);

  const count = event ? audienceSize(audience, branch, gen, event) : 0;
  const cost = channel === "SMS" ? count * 0.8 : 0;

  const send = () => {
    if (!event) return;
    actions.run(
      () => sendInvites(event.id, audience, channel, count).then((r) => r.events),
      { title: `${count} invitations queued (SIMULATED)`, body: `Routed via ${channel}. Delivery receipts appear in the invites log once the backend is wired.`, tone: "info" },
    );
    actions.closeAct();
  };

  return (
    <ModalDialog
      open={open && Boolean(event)}
      onClose={actions.closeAct}
      size="md"
      title={event ? `Invite guests · ${event.title}` : "Invite guests"}
      description="Choose who to invite, how to reach them, and what to say."
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-text-tertiary">Step {step} of 3</span>
          <div className="flex gap-2">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="ny-btn ny-btn-ghost ny-btn-sm"><ArrowLeft className="size-4" aria-hidden /> Back</button>
            ) : (
              <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Cancel</button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep((s) => s + 1)} disabled={step === 1 && count === 0} className="ny-btn ny-btn-primary ny-btn-sm">
                Continue <ArrowRight className="size-4" aria-hidden />
              </button>
            ) : (
              <button type="button" onClick={send} className="ny-btn ny-btn-gold ny-btn-sm"><Send className="size-4" aria-hidden /> Queue invitations</button>
            )}
          </div>
        </div>
      }
    >
      {event && (
        <div className="space-y-5">
          {step === 1 && (
            <div className="space-y-3">
              {INVITE_AUDIENCES.map((a) => (
                <label key={a.id} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-4", audience === a.id ? "border-brand-primary bg-brand-primary/[0.05]" : "border-hairline bg-surface-0/60")}>
                  <input type="radio" name="audience" checked={audience === a.id} onChange={() => setAudience(a.id)} className="mt-1 size-4 accent-brand-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-text-primary">{a.label}</span>
                    <span className="block text-xs text-text-secondary">{a.note}</span>
                  </span>
                  <span className="ny-num text-sm font-semibold text-text-primary">{audienceSize(a.id, branch, gen, event)}</span>
                </label>
              ))}
              {audience === "branch" && (
                <select value={branch} onChange={(e) => setBranch(e.target.value)} className="ny-input">
                  {BRANCHES.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              )}
              {audience === "gen" && (
                <select value={gen} onChange={(e) => setGen(Number(e.target.value))} className="ny-input">
                  {[1, 2, 3, 4, 5].map((g) => <option key={g} value={g}>Generation {g}</option>)}
                </select>
              )}
              {count === 0 && <p className="text-sm text-danger">Nobody matches this audience yet. Pick another one.</p>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {CHANNELS.map((c) => (
                  <button key={c.id} type="button" onClick={() => setChannel(c.id)} aria-pressed={channel === c.id} className={cn("rounded-2xl border p-3 text-left transition", channel === c.id ? "border-brand-primary bg-brand-primary/[0.06]" : "border-hairline bg-surface-0/60")}>
                    <c.icon className="size-4 text-brand-primary" aria-hidden />
                    <p className="mt-1.5 text-sm font-semibold text-text-primary">{c.label}</p>
                    <p className="text-[11px] leading-snug text-text-tertiary">{c.hint}</p>
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Message</span>
                <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="ny-input" />
              </label>
              <div className="rounded-2xl border border-hairline bg-surface-0/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Preview</p>
                <p className="mt-2 whitespace-pre-line rounded-2xl rounded-tl-sm bg-surface-1 p-3 text-sm leading-relaxed text-text-primary shadow-soft">{message}</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <dl className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-surface-0/80 p-3.5"><dt className="text-xs text-text-tertiary">Recipients</dt><dd className="ny-title mt-1 text-2xl">{count}</dd></div>
                <div className="rounded-2xl bg-surface-0/80 p-3.5"><dt className="text-xs text-text-tertiary">Channel</dt><dd className="mt-1 font-semibold">{channel}</dd></div>
                <div className="rounded-2xl bg-surface-0/80 p-3.5"><dt className="text-xs text-text-tertiary">Est. cost</dt><dd className="mt-1 font-semibold">KES {cost.toFixed(0)}</dd></div>
              </dl>
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-brand-secondary/50 p-4 text-sm text-text-secondary">
                <SimulatedBadge label="Ready — connects when the backend is wired" />
                Nothing is sent in this phase. The invitation is queued in the event log.
              </div>
            </div>
          )}
        </div>
      )}
    </ModalDialog>
  );
}


