"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import Link from "next/link";
import { CalendarClock, Camera, Copy, Pencil, Share2, Upload, Users, XCircle } from "lucide-react";
import { useMemo } from "react";
import { BarMeter } from "@/components/ui/Charts";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { Avatar, BranchChip, SimulatedBadge } from "@/components/ui/Primitives";
import {
  CAUSES,
  causeById,
  memberById,
  REMINDER_OFFSETS,
  rsvpSummary,
  venueById,
  type FamilyEvent,
  type RsvpStatus,
} from "@/data/dashboard/events";
import { diffDays, eatLabel, longDate, TODAY_ISO } from "@/lib/calendar";
import { cn, kes } from "@/lib/format";
import { EventStatusChip, KindChip, RsvpMeter } from "@/views/dashboard/events/eventsUi";
import type { EventsActions, EventsParams } from "@/views/dashboard/events/types";

const TAB_KEYS = ["overview", "rsvps", "album", "contributions", "reminders", "audit"] as const;
const TAB_LABELS = ["Overview", "RSVPs", "Album", "Contributions", "Reminders", "Audit"];

const STATUS_CHIP: Record<RsvpStatus, string> = {
  going: "ny-chip-success",
  maybe: "ny-chip-gold",
  pending: "ny-chip-warning",
  declined: "ny-chip-danger",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-hairline py-2.5 last:border-0">
      <dt className="text-sm text-text-tertiary">{label}</dt>
      <dd className="text-right text-sm font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

interface Props {
  event: FamilyEvent | null;
  events: FamilyEvent[];
  params: EventsParams;
  actions: EventsActions;
}

/** S4 — Event detail drawer. Non-modal reading surface with six tabs, all deep-linkable via ?event=…&tab=… */
export function EventDrawer({ event, events, params, actions }: Props) {
  const tabIndex = Math.max(0, TAB_KEYS.indexOf((params.tab ?? "overview") as (typeof TAB_KEYS)[number]));
  const summary = useMemo(() => (event ? rsvpSummary(event) : null), [event]);

  if (!event || !summary) {
    return (
      <ModalDialog open={false} onClose={actions.closeDrawer} side="right" title="Event">
        <div />
      </ModalDialog>
    );
  }

  const venue = venueById(event.venueId);
  const host = memberById(event.host);
  const branchId = event.branchId;
  const cause = causeById(event.causeId);
  const days = diffDays(TODAY_ISO, event.date);
  const scheduled = event.status === "scheduled";
  const capacityPct = Math.min(100, Math.round((summary.expected / Math.max(1, event.capacity)) * 100));

  return (
    <ModalDialog
      open
      onClose={actions.closeDrawer}
      side="right"
      title={event.title}
      description={`${event.id} · ${longDate(event.date)} · ${eatLabel(event.startTime)}`}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {event.status !== "cancelled" && (
              <button type="button" onClick={() => actions.openAct("edit", { event: event.id, tab: params.tab })} className="ny-btn ny-btn-primary ny-btn-sm">
                <Pencil className="size-4" aria-hidden /> Edit
              </button>
            )}
            {scheduled && (
              <button type="button" onClick={() => actions.openAct("reschedule", { event: event.id, tab: params.tab })} className="ny-btn ny-btn-ghost ny-btn-sm">
                <CalendarClock className="size-4" aria-hidden /> Reschedule
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => actions.openAct("share", { event: event.id, tab: params.tab })} className="ny-btn ny-btn-ghost ny-btn-sm">
              <Share2 className="size-4" aria-hidden /> Share
            </button>
            {scheduled && (
              <button type="button" onClick={() => actions.openAct("cancel", { event: event.id, tab: params.tab })} className="ny-btn ny-btn-ghost ny-btn-sm text-danger">
                <XCircle className="size-4" aria-hidden /> Cancel…
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="relative overflow-hidden rounded-3xl">
          <img src={event.cover} alt={`Cover for ${event.title}`} className="h-44 w-full object-cover" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/85 via-brand-deep/15 to-transparent" aria-hidden />
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
            <KindChip kind={event.kind} className="!bg-black/45 !text-white !border-white/25" />
            <EventStatusChip status={event.status} date={event.date} />
            {scheduled && days >= 0 && (
              <span className="ny-chip !bg-brand-accent !text-brand-deep !border-transparent">
                {days === 0 ? "Today" : `In ${days} day${days === 1 ? "" : "s"}`}
              </span>
            )}
          </div>
        </div>

        {event.cancelReason && (
          <div role="status" className="rounded-2xl border border-danger/30 bg-[#fbe5e5] p-4 text-sm text-danger">
            <strong>Cancelled.</strong> {event.cancelReason}
          </div>
        )}

        <TabGroup selectedIndex={tabIndex} onChange={(i: number) => actions.setParams({ tab: TAB_KEYS[i] }, "replace")}>
          <TabList className="ny-scroll flex gap-1 overflow-x-auto border-b border-hairline pb-2">
            {TAB_LABELS.map((label) => (
              <Tab
                key={label}
                className="shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold text-text-secondary outline-none transition data-focus:ring-2 data-focus:ring-brand-accent data-selected:bg-brand-primary data-selected:text-white"
              >
                {label}
              </Tab>
            ))}
          </TabList>

          <TabPanels className="mt-5">
            {/* OVERVIEW */}
            <TabPanel className="space-y-5 focus:outline-none">
              <dl>
                <Row label="When" value={`${longDate(event.date)} · ${eatLabel(event.startTime)} – ${event.endTime}`} />
                <Row label="Venue" value={venue ? `${venue.name}, ${venue.town}` : "To be confirmed"} />
                <Row label="Dress code" value={event.dressCode} />
                <Row label="Capacity" value={event.capacity === 999 ? "Open online" : `${event.capacity} seats`} />
              </dl>

              <div className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface-0/70 p-4">
                {host && <Avatar member={host} size={46} />}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Host</p>
                  <p className="truncate font-semibold text-text-primary">{host ? `${host.preferredName} ${host.lastName}` : "Family office"}</p>
                  <div className="mt-1"><BranchChip branchId={branchId} /></div>
                </div>
              </div>

              <p className="rounded-2xl bg-surface-0/80 p-4 text-sm leading-relaxed text-text-secondary">{event.description}</p>

              {venue && (
                <div className="grid grid-cols-[6rem_1fr] items-center gap-4 rounded-2xl border border-hairline p-3">
                  <img src={venue.photo} alt="" loading="lazy" className="h-20 w-24 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-text-primary">{venue.name}</p>
                    <p className="text-xs text-text-tertiary">{venue.amenities.join(" · ")}</p>
                    <p className="mt-1 text-xs text-text-secondary">Contact {venue.contact}</p>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary">Seats filled</span>
                  <span className="ny-num font-semibold text-text-primary">{summary.expected} / {event.capacity === 999 ? "∞" : event.capacity}</span>
                </div>
                <BarMeter value={summary.expected} max={Math.max(1, event.capacity)} color="#1F4D3A" className="mt-2" />
                <p className="mt-1 text-xs text-text-tertiary">{capacityPct}% of capacity, including plus-ones.</p>
              </div>
            </TabPanel>

            {/* RSVPS */}
            <TabPanel className="space-y-4 focus:outline-none">
              {event.status === "draft" ? (
                <p className="rounded-2xl bg-surface-0/70 p-4 text-sm text-text-secondary">RSVPs open once the draft is scheduled.</p>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {(["going", "maybe", "pending", "declined"] as const).map((st) => (
                      <div key={st} className="rounded-2xl bg-surface-0/80 p-3">
                        <p className="capitalize text-text-tertiary">{st}</p>
                        <p className="ny-num mt-1 text-lg font-semibold text-text-primary">{st === "going" ? summary.going : st === "maybe" ? summary.maybe : st === "pending" ? summary.pending : summary.declined}</p>
                      </div>
                    ))}
                  </div>
                  <RsvpMeter event={event} />
                  <ul className="divide-y divide-hairline rounded-2xl border border-hairline">
                    {event.rsvps.slice(0, 8).map((r) => {
                      const m = memberById(r.memberId);
                      if (!m) return null;
                      return (
                        <li key={r.memberId} className="flex items-center gap-3 p-3">
                          <Avatar member={m} size={34} />
                          <span className="min-w-0 flex-1 truncate text-sm font-medium text-text-primary">{m.preferredName} {m.lastName}</span>
                          <span className={cn("ny-chip capitalize", STATUS_CHIP[r.status])}>{r.status}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => actions.openAct("rsvp", { event: event.id, tab: params.tab })} className="ny-btn ny-btn-primary ny-btn-sm">
                      <Users className="size-4" aria-hidden /> Open RSVP manager
                    </button>
                    {summary.pending > 0 && (
                      <button type="button" onClick={() => actions.openAct("nudge", { event: event.id, tab: params.tab })} className="ny-btn ny-btn-gold ny-btn-sm">
                        Remind {summary.pending} pending
                      </button>
                    )}
                  </div>
                </>
              )}
            </TabPanel>

            {/* ALBUM */}
            <TabPanel className="space-y-4 focus:outline-none">
              {event.album.length > 0 ? (
                <>
                  <p className="text-sm text-text-secondary">
                    <span className="font-semibold text-text-primary">{event.albumName ?? "Album"}</span> · {event.album.length} frames
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {event.album.slice(0, 6).map((shot, i) => (
                      <button key={`${shot.src}-${i}`} type="button" onClick={() => actions.openAct("album-view", { event: event.id, tab: params.tab })} className="group relative aspect-square overflow-hidden rounded-2xl">
                        <img src={shot.src} alt={shot.alt} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                        <span className="absolute inset-0 bg-brand-deep/0 transition group-hover:bg-brand-deep/30" aria-hidden />
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => actions.openAct("album-view", { event: event.id, tab: params.tab })} className="ny-btn ny-btn-primary ny-btn-sm">
                      <Camera className="size-4" aria-hidden /> Open the shutter reel
                    </button>
                    <button type="button" onClick={() => actions.openAct("upload", { event: event.id, tab: params.tab })} className="ny-btn ny-btn-ghost ny-btn-sm">
                      <Upload className="size-4" aria-hidden /> Add photos
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3 rounded-2xl border border-dashed border-hairline bg-surface-0/70 p-5 text-sm text-text-secondary">
                  <p>No album yet. Photos from the gathering will live here once they are uploaded.</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => actions.openAct("upload", { event: event.id, tab: params.tab })} className="ny-btn ny-btn-primary ny-btn-sm">
                      <Upload className="size-4" aria-hidden /> Upload photos
                    </button>
                    <button type="button" onClick={() => actions.openAct("album", { event: event.id, tab: params.tab })} className="ny-btn ny-btn-ghost ny-btn-sm">
                      Attach a Drive album
                    </button>
                  </div>
                  <SimulatedBadge label="Google Drive · SIMULATED" />
                </div>
              )}
            </TabPanel>

            {/* CONTRIBUTIONS */}
            <TabPanel className="space-y-4 focus:outline-none">
              {cause ? (
                <div className="space-y-4 rounded-2xl border border-hairline bg-surface-0/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Linked cause · {cause.id}</p>
                  <p className="ny-title text-xl">{cause.title}</p>
                  <p className="text-sm text-text-secondary">Beneficiary: {cause.beneficiary}</p>
                  <BarMeter value={cause.raised} max={cause.target} color="#D4A437" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="ny-num font-semibold text-text-primary">{kes(cause.raised)}</span>
                    <span className="ny-num text-text-tertiary">of {kes(cause.target)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/dashboard/contributions?cause=${cause.id}`} className="ny-btn ny-btn-primary ny-btn-sm">Open in contributions →</Link>
                    <button type="button" onClick={() => actions.openAct("cause", { event: event.id, tab: params.tab })} className="ny-btn ny-btn-ghost ny-btn-sm">Change cause</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl border border-dashed border-hairline bg-surface-0/70 p-5 text-sm text-text-secondary">
                  <p>No contribution is linked. Link a cause to collect pledges around this gathering.</p>
                  <button type="button" onClick={() => actions.openAct("cause", { event: event.id, tab: params.tab })} className="ny-btn ny-btn-gold ny-btn-sm">Link a contribution cause</button>
                </div>
              )}
              <p className="text-xs text-text-tertiary">{CAUSES.length} causes are open across the family. Pledges are simulated until M-Pesa is wired.</p>
            </TabPanel>

            {/* REMINDERS */}
            <TabPanel className="space-y-4 focus:outline-none">
              <ul className="space-y-2">
                {REMINDER_OFFSETS.map((r) => {
                  const on = event.reminders.includes(r.id);
                  return (
                    <li key={r.id} className="flex items-center justify-between gap-3 rounded-2xl border border-hairline p-4">
                      <div>
                        <p className="font-semibold text-text-primary">{r.label}</p>
                        <p className="text-xs text-text-tertiary">{r.hint}</p>
                      </div>
                      <span className={cn("ny-chip", on ? "ny-chip-success" : "")}>{on ? "On" : "Off"}</span>
                    </li>
                  );
                })}
              </ul>
              <button type="button" onClick={() => actions.openAct("reminders", { event: event.id, tab: params.tab })} className="ny-btn ny-btn-primary ny-btn-sm">
                Edit reminder rules
              </button>
            </TabPanel>

            {/* AUDIT */}
            <TabPanel className="focus:outline-none">
              <ol className="space-y-3 border-l-2 border-hairline pl-5">
                {event.log.map((line, i) => (
                  <li key={`${line}-${i}`} className="relative">
                    <span className="absolute -left-[27px] top-1.5 size-3 rounded-full border-2 border-brand-accent bg-surface-1" aria-hidden />
                    <p className="font-mono text-xs leading-relaxed text-text-secondary">{line}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-4 flex items-center gap-1.5 text-xs text-text-tertiary">
                <Copy className="size-3.5" aria-hidden /> Every change is appended here. Export the full trail from Records (T-12).
              </p>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </ModalDialog>
  );
}
