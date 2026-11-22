"use client";

import { Camera, CircleCheck, FolderInput, Images, Link2, Search, TriangleAlert, Upload, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { BarMeter } from "@/components/ui/Charts";
import { IrisReel, type ReelSlide } from "@/components/ui/IrisReel";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { Avatar, SimulatedBadge } from "@/components/ui/Primitives";
import { CAUSES, memberById, rsvpSummary, type EventVenue, type FamilyEvent, type RsvpStatus, venueById } from "@/data/dashboard/events";
import { MEMBERS } from "@/data/family/people";
import { dayMonth, longDate, TODAY_ISO } from "@/lib/calendar";
import { cn, kes } from "@/lib/format";
import { attachAlbum, attachCause, bookVenue, checkIn, setRsvp, uploadPhotos } from "@/services/eventsService";
import type { EventsActions } from "@/views/dashboard/events/types";

const inputCls = "ny-input";
const STATUS_OPTIONS: RsvpStatus[] = ["going", "maybe", "pending", "declined"];
const STATUS_TONE: Record<RsvpStatus, string> = {
  going: "ny-chip-success",
  maybe: "ny-chip-gold",
  pending: "ny-chip-warning",
  declined: "ny-chip-danger",
};

/* ─── 1. RSVP manager (lg) ───────────────────────────────────────────── */

export function RsvpManagerModal({ open, event, actions }: { open: boolean; event: FamilyEvent | null; actions: EventsActions }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<RsvpStatus | "all">("all");
  const [adding, setAdding] = useState("");
  const summary = event ? rsvpSummary(event) : null;

  const rows = useMemo(() => {
    if (!event) return [];
    const q = query.trim().toLowerCase();
    return event.rsvps
      .filter((r) => (filter === "all" ? true : r.status === filter))
      .map((r) => ({ r, m: memberById(r.memberId) }))
      .filter(({ m }) => (q ? `${m?.preferredName} ${m?.lastName} ${m?.homeTown}`.toLowerCase().includes(q) : true))
      .slice(0, 60);
  }, [event, query, filter]);

  const addable = useMemo(() => {
    if (!event) return [];
    const taken = new Set(event.rsvps.map((r) => r.memberId));
    return MEMBERS.filter((m) => !taken.has(m.id)).slice(0, 80);
  }, [event]);

  const setStatus = (memberId: string, status: RsvpStatus) => {
    if (!event) return;
    actions.run(() => setRsvp(event.id, memberId, status));
  };

  return (
    <ModalDialog
      open={open && Boolean(event)}
      onClose={actions.closeAct}
      size="lg"
      title={event ? `RSVP manager · ${event.title}` : "RSVP manager"}
      description="Change any answer, add a guest who called in, or nudge the people still waiting."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="ny-num text-xs text-text-tertiary">{summary?.going ?? 0} going · {summary?.expected ?? 0} seats incl. plus-ones</p>
          <div className="flex gap-2">
            {(summary?.pending ?? 0) > 0 && (
              <button type="button" onClick={() => actions.openAct("nudge", { event: event?.id })} className="ny-btn ny-btn-gold ny-btn-sm">
                Nudge {summary?.pending} waiting
              </button>
            )}
            <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Done</button>
          </div>
        </div>
      }
    >
      {event && summary && (
        <div className="space-y-5">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {STATUS_OPTIONS.map((st) => (
              <button key={st} type="button" onClick={() => setFilter(filter === st ? "all" : st)} aria-pressed={filter === st} className={cn("rounded-2xl border p-3 transition", filter === st ? "border-brand-primary bg-brand-primary/[0.06]" : "border-hairline bg-surface-0/70")}>
                <span className="block capitalize text-text-tertiary">{st}</span>
                <span className="ny-num mt-1 block text-xl font-semibold text-text-primary">{st === "going" ? summary.going : st === "maybe" ? summary.maybe : st === "pending" ? summary.pending : summary.declined}</span>
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="relative">
              <span className="sr-only">Search guests</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a guest by name or town" className={cn(inputCls, "pl-11")} />
            </label>
            <div className="flex gap-2">
              <select value={adding} onChange={(e) => setAdding(e.target.value)} aria-label="Add a guest who is not on the list" className={cn(inputCls, "!min-h-[44px] text-sm")}>
                <option value="">Add a guest…</option>
                {addable.map((m) => (
                  <option key={m.id} value={m.id}>{m.preferredName} {m.lastName}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={!adding}
                onClick={() => {
                  if (!event || !adding) return;
                  actions.run(() => setRsvp(event.id, adding, "going"), { title: "Guest added", body: "Marked as going.", tone: "success" });
                  setAdding("");
                }}
                className="ny-btn ny-btn-primary ny-btn-sm"
              >
                <UserPlus className="size-4" aria-hidden /> Add
              </button>
            </div>
          </div>

          <ul className="ny-scroll max-h-[22rem] divide-y divide-hairline overflow-y-auto rounded-2xl border border-hairline">
            {rows.map(({ r, m }) =>
              m ? (
                <li key={r.memberId} className="flex flex-wrap items-center gap-3 p-3.5">
                  <Avatar member={m} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">{m.preferredName} {m.lastName}</p>
                    <p className="truncate text-xs text-text-tertiary">{m.homeTown} · {r.channel}{r.plusOnes ? ` · +${r.plusOnes}` : ""}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Answer for ${m.preferredName}`}>
                    {STATUS_OPTIONS.map((st) => (
                      <button key={st} type="button" onClick={() => setStatus(r.memberId, st)} aria-pressed={r.status === st} className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize transition", r.status === st ? cn(STATUS_TONE[st], "border-transparent") : "border-hairline bg-surface-0 text-text-tertiary hover:text-text-primary")}>
                        {st}
                      </button>
                    ))}
                  </div>
                </li>
              ) : null,
            )}
            {rows.length === 0 && <li className="p-6 text-center text-sm text-text-secondary">No guest matches that search.</li>}
          </ul>
        </div>
      )}
    </ModalDialog>
  );
}

/* ─── 2. Link a contribution cause (md) ──────────────────────────────── */

export function CauseModal({ open, event, actions }: { open: boolean; event: FamilyEvent | null; actions: EventsActions }) {
  const [picked, setPicked] = useState<string>(event?.causeId ?? "");
  return (
    <ModalDialog
      open={open && Boolean(event)}
      onClose={actions.closeAct}
      size="md"
      title="Link a contribution cause"
      description="Pledges made around this gathering flow into the cause, and the progress shows here and in T-7."
      footer={
        <div className="flex items-center justify-between gap-2">
          <SimulatedBadge label="M-Pesa collection SIMULATED" />
          <div className="flex gap-2">
            <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Cancel</button>
            <button
              type="button"
              onClick={() => {
                if (!event) return;
                actions.run(() => attachCause(event.id, picked || null), { title: picked ? "Cause linked" : "Cause unlinked", tone: "success" });
                actions.closeAct();
              }}
              className="ny-btn ny-btn-primary ny-btn-sm"
            >
              <Link2 className="size-4" aria-hidden /> Save link
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {[{ id: "", title: "No contribution for this gathering", beneficiary: "", raised: 0, target: 0 }, ...CAUSES].map((c) => (
          <label key={c.id || "none"} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-4", picked === c.id ? "border-brand-primary bg-brand-primary/[0.05]" : "border-hairline bg-surface-0/60")}>
            <input type="radio" name="cause" checked={picked === c.id} onChange={() => setPicked(c.id)} className="mt-1 size-4 accent-brand-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-text-primary">{c.title}</span>
              {c.target > 0 && (
                <>
                  <span className="block text-xs text-text-tertiary">{c.beneficiary} · {c.id}</span>
                  <BarMeter value={c.raised} max={c.target} color="#D4A437" className="mt-2" />
                  <span className="ny-num mt-1 block text-[11px] text-text-tertiary">{kes(c.raised)} of {kes(c.target)}</span>
                </>
              )}
            </span>
          </label>
        ))}
      </div>
    </ModalDialog>
  );
}

/* ─── 3. Attach a Drive album (sm) ───────────────────────────────────── */

export function AlbumAttachModal({ open, event, actions }: { open: boolean; event: FamilyEvent | null; actions: EventsActions }) {
  const [name, setName] = useState(event ? `${event.title} · album` : "");
  const [folder, setFolder] = useState("");
  return (
    <ModalDialog
      open={open && Boolean(event)}
      onClose={actions.closeAct}
      size="sm"
      title="Attach a photo album"
      description="Point the gathering at a Google Drive folder. The sync runs in Phase 2; the link is recorded now."
      footer={
        <div className="flex items-center justify-between gap-2">
          <SimulatedBadge label="Drive sync SIMULATED" />
          <button
            type="button"
            disabled={name.trim().length < 3}
            onClick={() => {
              if (!event) return;
              actions.run(() => attachAlbum(event.id, name.trim()), { title: "Album attached", body: `${name.trim()} is linked (SIMULATED).`, tone: "success" });
              actions.closeAct();
            }}
            className="ny-btn ny-btn-primary ny-btn-sm"
          >
            <FolderInput className="size-4" aria-hidden /> Attach album
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Album name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Drive folder link (optional)</span>
          <input value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="https://drive.google.com/…" className={inputCls} />
        </label>
      </div>
    </ModalDialog>
  );
}

/* ─── 4. Full-screen album reel (lg, camera shutter) ─────────────────── */

export function AlbumViewModal({ open, event, actions }: { open: boolean; event: FamilyEvent | null; actions: EventsActions }) {
  const slides: ReelSlide[] = (event?.album ?? []).map((shot) => ({
    src: shot.src,
    alt: shot.alt,
    caption: shot.caption,
    year: event?.date.slice(0, 4) ?? "2026",
    place: venueById(event?.venueId ?? "")?.town ?? "Kenya",
  }));
  return (
    <ModalDialog
      open={open && Boolean(event)}
      onClose={actions.closeAct}
      size="lg"
      title={event ? `${event.albumName ?? "Album"} · ${dayMonth(event.date)}` : "Album"}
      description="Frames open through the camera shutter. Use the arrows or the keyboard to move through the roll."
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-text-tertiary">{slides.length} frames · illustrative photographs</span>
          <button type="button" onClick={() => actions.openAct("upload", { event: event?.id })} className="ny-btn ny-btn-ghost ny-btn-sm">
            <Upload className="size-4" aria-hidden /> Add more photos
          </button>
        </div>
      }
    >
      {slides.length > 0 ? (
        <div className="page-dash-events">
          <IrisReel key={event?.id} slides={slides} interval={4800} />
        </div>
      ) : (
        <div className="grid place-items-center gap-3 rounded-3xl border border-dashed border-hairline p-10 text-center">
          <Images className="size-10 text-brand-primary" aria-hidden />
          <p className="text-sm text-text-secondary">No frames yet. Add photos from the gathering to start the roll.</p>
        </div>
      )}
    </ModalDialog>
  );
}

/* ─── 5. Check-in / walk-in (md) ─────────────────────────────────────── */

export function CheckInModal({ open, event, actions }: { open: boolean; event: FamilyEvent | null; actions: EventsActions }) {
  const [query, setQuery] = useState("");
  const [scanned, setScanned] = useState(false);
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MEMBERS.filter((m) => `${m.preferredName} ${m.lastName} ${m.id}`.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const checkInMember = (memberId: string) => {
    if (!event) return;
    const isGoing = event.rsvps.some((r) => r.memberId === memberId);
    actions.run(
      async () => {
        if (!isGoing) await setRsvp(event.id, memberId, "going");
        return checkIn(event.id, memberId, true);
      },
      { title: "Checked in", body: `${memberById(memberId)?.preferredName ?? "Guest"} has arrived.`, tone: "success" },
    );
    setQuery("");
  };

  return (
    <ModalDialog
      open={open && Boolean(event)}
      onClose={actions.closeAct}
      size="md"
      title="Walk-in and QR check-in"
      description="Find a relative by name or NY-MBR ID, or scan a member's digital card. Walk-ins are added as going and marked arrived."
      footer={
        <div className="flex items-center justify-between gap-2">
          <SimulatedBadge label="QR scanner SIMULATED" />
          <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Done</button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid place-items-center gap-3 rounded-3xl border-2 border-dashed border-brand-primary/40 bg-surface-0/70 p-6 text-center">
          <Camera className="size-8 text-brand-primary" aria-hidden />
          <p className="text-sm text-text-secondary">Point the camera at a member card to check them in.</p>
          <button type="button" onClick={() => setScanned(true)} className="ny-btn ny-btn-primary ny-btn-sm">Simulate a scan</button>
          {scanned && <p className="flex items-center gap-1.5 text-xs font-semibold text-success"><CircleCheck className="size-4" aria-hidden /> Scan received: NY-MBR-00014 (demo)</p>}
        </div>
        <label className="relative block">
          <span className="sr-only">Find a guest</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-tertiary" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Type a name or NY-MBR ID" className={cn(inputCls, "pl-11")} />
        </label>
        <ul className="divide-y divide-hairline rounded-2xl border border-hairline">
          {matches.map((m) => {
            const row = event?.rsvps.find((r) => r.memberId === m.id);
            return (
              <li key={m.id} className="flex items-center gap-3 p-3">
                <Avatar member={m} size={36} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-text-primary">{m.preferredName} {m.lastName}</span>
                  <span className="block text-xs text-text-tertiary">{row ? `RSVP: ${row.status}${row.arrived ? " · arrived" : ""}` : "Not on the RSVP list (walk-in)"}</span>
                </span>
                <button type="button" disabled={row?.arrived} onClick={() => checkInMember(m.id)} className="ny-btn ny-btn-primary ny-btn-sm">
                  {row?.arrived ? "Arrived" : "Check in"}
                </button>
              </li>
            );
          })}
          {query && matches.length === 0 && <li className="p-4 text-sm text-text-secondary">No relative matches that yet.</li>}
        </ul>
      </div>
    </ModalDialog>
  );
}

/* ─── 6. Upload photos to the album (md, SIMULATED Drive) ────────────── */

export function UploadPhotosModal({ open, event, actions }: { open: boolean; event: FamilyEvent | null; actions: EventsActions }) {
  const [count, setCount] = useState(4);
  const [drag, setDrag] = useState(false);
  return (
    <ModalDialog
      open={open && Boolean(event)}
      onClose={actions.closeAct}
      size="md"
      title="Add photos to the album"
      description="Drop photos here, or pick them from your phone. Uploads go to the gathering's Drive folder once the backend is wired."
      footer={
        <div className="flex items-center justify-between gap-2">
          <SimulatedBadge label="Upload SIMULATED" />
          <button
            type="button"
            onClick={() => {
              if (!event) return;
              actions.run(() => uploadPhotos(event.id, count), { title: `${count} photos added (SIMULATED)`, body: "They appear in the album reel and the archive.", tone: "success" });
              actions.closeAct();
            }}
            className="ny-btn ny-btn-primary ny-btn-sm"
          >
            <Upload className="size-4" aria-hidden /> Upload {count} photos
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            setCount(Math.min(12, Math.max(1, e.dataTransfer.files.length || 4)));
          }}
          className={cn("grid place-items-center gap-2 rounded-3xl border-2 border-dashed p-8 text-center transition", drag ? "border-brand-accent bg-brand-accent-soft/40" : "border-hairline bg-surface-0/70")}
        >
          <Images className="size-9 text-brand-primary" aria-hidden />
          <p className="text-sm font-semibold text-text-primary">Drop photos here</p>
          <p className="text-xs text-text-tertiary">JPG, PNG or HEIC · up to 12 at a time</p>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">How many photos are you adding?</span>
          <input type="range" min={1} max={12} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full accent-brand-primary" />
          <span className="ny-num text-sm font-semibold text-text-primary">{count} photos</span>
        </label>
      </div>
    </ModalDialog>
  );
}

/* ─── 7. Venue booking — 2 steps with a clash check (md) ─────────────── */

export function VenueBookingModal({
  open,
  venue,
  events,
  actions,
}: {
  open: boolean;
  venue: EventVenue | null;
  events: FamilyEvent[];
  actions: EventsActions;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [date, setDate] = useState("2026-06-06");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ status: "booked" | "conflict"; ref: string; conflictWith?: string } | null>(null);

  const localClash = venue ? events.find((e) => e.venueId === venue.id && e.date === date && e.status !== "cancelled" && e.status !== "draft") : undefined;

  const confirm = async () => {
    if (!venue) return;
    setBusy(true);
    const res = await bookVenue(venue.id, date, title.trim() || "Family gathering");
    setBusy(false);
    setResult(res);
    if (res.status === "booked") {
      actions.notify({ title: "Venue booked", body: `${venue.name} · ref ${res.ref} (SIMULATED)`, tone: "success" });
    }
  };

  return (
    <ModalDialog
      open={open && Boolean(venue)}
      onClose={() => {
        setStep(1);
        setResult(null);
        actions.closeAct();
      }}
      size="md"
      title={venue ? `Book · ${venue.name}` : "Book a venue"}
      description="Check the date, then confirm. The booking is simulated until the venue calendar is connected."
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-text-tertiary">Step {step} of 2</span>
          <div className="flex gap-2">
            {step === 2 && !result && (
              <button type="button" onClick={() => setStep(1)} className="ny-btn ny-btn-ghost ny-btn-sm">Back</button>
            )}
            {step === 1 ? (
              <button type="button" disabled={date < TODAY_ISO} onClick={() => setStep(2)} className="ny-btn ny-btn-primary ny-btn-sm">Review →</button>
            ) : result ? (
              <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-primary ny-btn-sm">Done</button>
            ) : (
              <button type="button" disabled={busy} onClick={confirm} className="ny-btn ny-btn-gold ny-btn-sm">
                {busy ? "Checking the calendar…" : "Confirm booking"}
              </button>
            )}
          </div>
        </div>
      }
    >
      {venue && (
        <div className="space-y-5">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-[6rem_1fr] items-center gap-4 rounded-2xl border border-hairline p-3">
                <img src={venue.photo} alt="" className="h-16 w-24 rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-text-primary">{venue.name}</p>
                  <p className="text-xs text-text-tertiary">{venue.town} · {venue.capacity === 999 ? "Online" : `${venue.capacity} seats`} · {venue.rateKes ? `${kes(venue.rateKes)} a day` : "Free"}</p>
                </div>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Date you need (EAT)</span>
                <input type="date" min={TODAY_ISO} value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">What is it for?</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Kimilili reunion committee" className={inputCls} />
              </label>
              {localClash && (
                <p className="flex items-start gap-2 rounded-2xl bg-brand-accent-soft/50 p-3 text-sm text-text-secondary">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[#8a5d00]" aria-hidden />
                  {localClash.title} already holds this venue on {dayMonth(date)}. Pick another day or confirm anyway.
                </p>
              )}
            </div>
          )}

          {step === 2 && !result && (
            <div className="space-y-4">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm"><dt className="text-xs text-text-tertiary">Date</dt><dd className="mt-0.5 font-semibold">{longDate(date)}</dd></div>
                <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm"><dt className="text-xs text-text-tertiary">Purpose</dt><dd className="mt-0.5 font-semibold">{title || "Family gathering"}</dd></div>
                <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm"><dt className="text-xs text-text-tertiary">Day rate</dt><dd className="mt-0.5 font-semibold">{venue.rateKes ? kes(venue.rateKes) : "Free"}</dd></div>
                <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm"><dt className="text-xs text-text-tertiary">Contact</dt><dd className="mt-0.5 font-semibold">{venue.contact}</dd></div>
              </dl>
              <p className="text-xs text-text-tertiary">Payment to the venue is handled by M-Pesa once the backend is wired. Nothing is charged in this phase.</p>
            </div>
          )}

          {result && result.status === "booked" && (
            <div className="grid place-items-center gap-3 rounded-3xl bg-brand-primary p-8 text-center text-white">
              <CircleCheck className="size-10 text-brand-accent" aria-hidden />
              <p className="ny-title text-2xl !text-white">Booked for {dayMonth(date)}</p>
              <p className="font-mono text-sm text-white/80">{result.ref}</p>
              <SimulatedBadge label="SIMULATED booking" />
            </div>
          )}

          {result && result.status === "conflict" && (
            <div role="alert" className="grid place-items-center gap-3 rounded-3xl border border-danger/40 bg-[#fbe5e5] p-8 text-center text-danger">
              <TriangleAlert className="size-10" aria-hidden />
              <p className="font-semibold">Already held by “{result.conflictWith}”</p>
              <button type="button" onClick={() => { setResult(null); setStep(1); }} className="ny-btn ny-btn-ghost ny-btn-sm">Pick another date</button>
            </div>
          )}

          {!result && busy && <BarMeter value={60} max={100} color="#D4A437" />}
        </div>
      )}
    </ModalDialog>
  );
}
