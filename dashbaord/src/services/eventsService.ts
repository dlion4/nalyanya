/* Events service — frontend-only mock with the exact signatures the REST API will expose.
   Every call resolves after realistic latency and returns immutable snapshots, so swapping in
   fetch() later changes this file only. Nothing here reaches a network or a payment rail. */

import { ALBUM_POOL, EVENTS_SEED, VENUES, type EventKind, type EventRsvp, type FamilyEvent, type ReminderOffset, type RsvpStatus, type AudienceId } from "@/data/dashboard/events";
import type { Channel } from "@/types/family";

let store: FamilyEvent[] = EVENTS_SEED.map((e) => ({
  ...e,
  rsvps: [...e.rsvps],
  album: [...e.album],
  log: [...e.log],
  reminders: [...e.reminders],
}));

let sequence = 60;

const wait = (ms = 420) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function stamp(): string {
  const d = new Date(Date.UTC(2026, 4, 6, 9, 0 + (sequence % 50)));
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} EAT`;
}

function replaceEvent(id: string, update: (event: FamilyEvent) => FamilyEvent): void {
  store = store.map((e) => (e.id === id ? update(e) : e));
}

function appendLog(event: FamilyEvent, line: string): string[] {
  sequence += 1;
  return [`${line} · ${stamp()}`, ...event.log];
}

/** Synchronous snapshot used to seed the query cache (identical on server and client). */
export function getEventsSnapshot(): FamilyEvent[] {
  return store;
}

export async function listEvents(): Promise<FamilyEvent[]> {
  await wait(380);
  return [...store];
}

export interface NewEventInput {
  title: string;
  kind: EventKind;
  date: string;
  startTime: string;
  endTime: string;
  venueId: string;
  host: string;
  branchId: string;
  description: string;
  dressCode: string;
  capacity: number;
  reminders: ReminderOffset[];
  causeId: string | null;
}

export async function createEvent(input: NewEventInput): Promise<FamilyEvent[]> {
  await wait(640);
  sequence += 1;
  const id = `EVT-2026-${String(sequence).padStart(3, "0")}`;
  const created: FamilyEvent = {
    id,
    title: input.title,
    kind: input.kind,
    status: "scheduled",
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    venueId: input.venueId,
    host: input.host,
    branchId: input.branchId,
    description: input.description,
    dressCode: input.dressCode || "Any",
    cover: ALBUM_POOL[sequence % ALBUM_POOL.length].src,
    capacity: input.capacity,
    causeId: input.causeId,
    album: [],
    albumName: null,
    reminders: input.reminders,
    rsvps: [],
    cancelReason: null,
    log: [`Created by the family office · ${stamp()}`],
  };
  store = [created, ...store];
  return [...store];
}

export async function updateEvent(
  id: string,
  patch: Partial<Pick<FamilyEvent, "title" | "description" | "dressCode" | "venueId" | "capacity" | "kind" | "host" | "branchId">>,
  reason: string,
): Promise<FamilyEvent[]> {
  await wait();
  replaceEvent(id, (e) => ({ ...e, ...patch, log: appendLog(e, `Edited · ${reason}`) }));
  return [...store];
}

export async function rescheduleEvent(id: string, date: string, startTime: string, endTime: string, reason: string): Promise<FamilyEvent[]> {
  await wait();
  replaceEvent(id, (e) => ({ ...e, date, startTime, endTime, log: appendLog(e, `Rescheduled to ${date} ${startTime} · ${reason}`) }));
  return [...store];
}

export async function cancelEvent(id: string, reason: string): Promise<FamilyEvent[]> {
  await wait(520);
  replaceEvent(id, (e) => ({
    ...e,
    status: "cancelled",
    cancelReason: reason,
    reminders: [],
    rsvps: e.rsvps.map((r) => ({ ...r, status: "declined" as RsvpStatus })),
    log: appendLog(e, "Cancelled · attendees notified (SIMULATED)"),
  }));
  return [...store];
}

export async function deleteDraft(id: string): Promise<FamilyEvent[]> {
  await wait();
  store = store.filter((e) => !(e.id === id && e.status === "draft"));
  return [...store];
}

export async function setRsvp(eventId: string, memberId: string, status: RsvpStatus): Promise<FamilyEvent[]> {
  await wait(260);
  replaceEvent(eventId, (e) => {
    const exists = e.rsvps.some((r) => r.memberId === memberId);
    const rsvps: EventRsvp[] = exists
      ? e.rsvps.map((r) => (r.memberId === memberId ? { ...r, status } : r))
      : [...e.rsvps, { memberId, status, plusOnes: 0, channel: "WhatsApp" as Channel, arrived: false }];
    return { ...e, rsvps, log: appendLog(e, `RSVP set to ${status} for ${memberId}`) };
  });
  return [...store];
}

export async function bulkRemind(eventId: string, scope: "pending" | "maybe" | "all"): Promise<FamilyEvent[]> {
  await wait(700);
  replaceEvent(eventId, (e) => ({ ...e, log: appendLog(e, `Reminder queued to ${scope} guests (SIMULATED)`) }));
  return [...store];
}

export async function setReminders(eventId: string, reminders: ReminderOffset[]): Promise<FamilyEvent[]> {
  await wait(300);
  replaceEvent(eventId, (e) => ({ ...e, reminders, log: appendLog(e, `Reminders set: ${reminders.join(", ") || "none"}`) }));
  return [...store];
}

export async function attachCause(eventId: string, causeId: string | null): Promise<FamilyEvent[]> {
  await wait(360);
  replaceEvent(eventId, (e) => ({ ...e, causeId, log: appendLog(e, causeId ? `Contribution cause linked: ${causeId}` : "Contribution cause unlinked") }));
  return [...store];
}

export async function attachAlbum(eventId: string, albumName: string): Promise<FamilyEvent[]> {
  await wait(420);
  replaceEvent(eventId, (e) => ({ ...e, albumName, log: appendLog(e, `Album attached: ${albumName} (Drive · SIMULATED)`) }));
  return [...store];
}

export async function uploadPhotos(eventId: string, count: number): Promise<FamilyEvent[]> {
  await wait(900);
  replaceEvent(eventId, (e) => {
    const start = e.album.length;
    const added = Array.from({ length: count }, (_, i) => ALBUM_POOL[(start + i + e.id.length) % ALBUM_POOL.length]);
    return { ...e, album: [...e.album, ...added], log: appendLog(e, `${count} photos uploaded (Drive · SIMULATED)`) };
  });
  return [...store];
}

export async function checkIn(eventId: string, memberId: string, arrived: boolean): Promise<FamilyEvent[]> {
  await wait(220);
  replaceEvent(eventId, (e) => ({
    ...e,
    rsvps: e.rsvps.map((r) => (r.memberId === memberId ? { ...r, arrived } : r)),
    log: appendLog(e, `${arrived ? "Checked in" : "Checked out"} ${memberId}`),
  }));
  return [...store];
}

export async function bookVenue(
  venueId: string,
  date: string,
  eventTitle: string,
): Promise<{ status: "booked" | "conflict"; ref: string; conflictWith?: string }> {
  await wait(640);
  const clash = store.find((e) => e.venueId === venueId && e.date === date && e.status !== "cancelled" && e.status !== "draft");
  if (clash) return { status: "conflict", ref: "", conflictWith: clash.title };
  const venue = VENUES.find((v) => v.id === venueId);
  return { status: "booked", ref: `NY-VEN-${venueId.replace("V-", "")}-${date.replace(/-/g, "")}-${eventTitle.length}` + (venue ? "" : "") };
}

export async function sendInvites(
  eventId: string,
  audience: AudienceId,
  channel: Channel,
  queued: number,
): Promise<{ ref: string; queued: number; events: FamilyEvent[] }> {
  await wait(820);
  replaceEvent(eventId, (e) => ({ ...e, log: appendLog(e, `${queued} invitations queued via ${channel} to ${audience} (SIMULATED)`) }));
  return { ref: `NY-INV-${eventId.slice(-3)}-${queued}`, queued, events: [...store] };
}
