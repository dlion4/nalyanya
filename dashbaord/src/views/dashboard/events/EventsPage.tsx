"use client";

import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { usePrefs } from "@/components/shell/PrefsProvider";
import { useToast } from "@/components/ui/Toast";
import { VENUES, type FamilyEvent } from "@/data/dashboard/events";
import { DEFAULT_MONTH, TODAY_ISO } from "@/lib/calendar";
import { getEventsSnapshot, listEvents } from "@/services/eventsService";
import { AlbumReel } from "@/views/dashboard/events/AlbumReel";
import { EventsCalendar } from "@/views/dashboard/events/EventsCalendar";
import { EventsHero } from "@/views/dashboard/events/EventsHeader";
import { EventsTable } from "@/views/dashboard/events/EventsTable";
import { EventsSpotlight } from "@/views/dashboard/events/EventsSpotlight";
import { EventBuilderLaunchpad } from "@/views/dashboard/events/EventBuilderLaunchpad";
import { EventBuilderWizard, InviteWizard } from "@/views/dashboard/events/EventWizards";
import { InvitesReminders } from "@/views/dashboard/events/InvitesReminders";
import { PastArchive } from "@/views/dashboard/events/PastArchive";
import { TodayCheckIn } from "@/views/dashboard/events/TodayCheckIn";
import { VenuesSection } from "@/views/dashboard/events/VenuesSection";
import { ExportSection } from "@/views/dashboard/events/ExportSection";
import { EventDrawer } from "@/views/dashboard/events/EventDrawer";
import {
  CancelEventModal,
  DeleteDraftModal,
  EditEventModal,
  IcsModal,
  NudgeModal,
  RemindersModal,
  RescheduleModal,
  ShareEventModal,
} from "@/views/dashboard/events/EventModalsA";
import {
  AlbumAttachModal,
  AlbumViewModal,
  CauseModal,
  CheckInModal,
  RsvpManagerModal,
  UploadPhotosModal,
  VenueBookingModal,
} from "@/views/dashboard/events/EventModalsB";
import type { ActKind, EventsActions, EventsParams, ToastInput, UrlPatch } from "@/views/dashboard/events/types";

const EVENTS_KEY = ["events", "family"] as const;

const ACT_KINDS: ActKind[] = [
  "create", "edit", "reschedule", "cancel", "rsvp", "invite", "reminders", "cause", "album", "ics",
  "album-view", "checkin", "upload", "delete", "share", "venue", "nudge",
];

function EventsInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const { calmMotion } = usePrefs();

  /* Cached data: seeded synchronously (instant paint), then kept fresh by the query. */
  const { data } = useQuery({
    queryKey: EVENTS_KEY,
    queryFn: listEvents,
    initialData: getEventsSnapshot,
    staleTime: 60_000,
  });
  const events: FamilyEvent[] = data ?? [];

  /* One mutation runner for every write. Each service call returns the next list, which replaces the cache. */
  const mutation = useMutation({
    mutationFn: (job: () => Promise<FamilyEvent[]>) => job(),
    onSuccess: (list) => {
      queryClient.setQueryData(EVENTS_KEY, list);
    },
  });
  const runMutation = mutation.mutate;
  const pending = mutation.isPending;

  const run = useCallback(
    (job: () => Promise<FamilyEvent[]>, ok?: ToastInput, after?: (list: FamilyEvent[]) => void) => {
      runMutation(job, {
        onSuccess: (list) => {
          if (ok) notify(ok);
          after?.(list);
        },
        onError: () => notify({ title: "That didn't save", body: "Nothing changed. Please try again.", tone: "danger" }),
      });
    },
    [runMutation, notify],
  );

  /* URL state — every filter, overlay and tab is a search param. Client-side navigation: no reload. */
  const params = useMemo<EventsParams>(() => {
    const act = searchParams.get("act");
    const cv = searchParams.get("cv");
    return {
      q: searchParams.get("q") ?? "",
      kind: searchParams.get("kind") ?? "all",
      status: searchParams.get("status") ?? "all",
      branch: searchParams.get("branch") ?? "all",
      month: searchParams.get("month") ?? DEFAULT_MONTH,
      cv: cv === "week" || cv === "agenda" ? cv : "month",
      day: searchParams.get("day") ?? TODAY_ISO,
      year: searchParams.get("year") ?? "all",
      event: searchParams.get("event"),
      act: act && (ACT_KINDS as string[]).includes(act) ? (act as ActKind) : null,
      tab: searchParams.get("tab"),
      venue: searchParams.get("venue"),
      type: searchParams.get("type"),
      date: searchParams.get("date"),
    };
  }, [searchParams]);

  const setParams = useCallback(
    (patch: UrlPatch, mode: "push" | "replace" = "replace") => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === undefined || value === "" || value === "all") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (mode === "push") router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const actions = useMemo<EventsActions>(
    () => ({
      openEvent: (id) => setParams({ event: id, tab: null }, "push"),
      openAct: (act, extra) => setParams({ act, ...extra }, "push"),
      closeAct: () => setParams({ act: null, date: null, type: null, venue: null }, "replace"),
      closeDrawer: () => setParams({ event: null, tab: null, act: null }, "replace"),
      setParams,
      run,
      notify,
      pending,
    }),
    [setParams, run, notify, pending],
  );

  const selected = params.event ? events.find((e) => e.id === params.event) ?? null : null;
  const act = params.act;

  return (
    <div className="relative space-y-12 pb-8">
      {pending && (
        <div aria-hidden className="fixed inset-x-0 top-0 z-[80] h-1 overflow-hidden bg-brand-accent/20">
          <div className={calmMotion ? "h-full w-1/3 bg-brand-accent" : "ny-progress-bar h-full w-1/3 bg-brand-accent"} />
        </div>
      )}

      {/* S0 + S1 — Hero and KPI row */}
      <EventsHero events={events} actions={actions} />

      {/* S2 — Calendar: month, week and agenda in EAT */}
      <EventsCalendar events={events} params={params} actions={actions} />

      {/* S3 — Events table (TanStack Table) */}
      <EventsTable events={events} params={params} actions={actions} />

      {/* S4 — Next gathering spotlight */}
      <EventsSpotlight events={events} actions={actions} />

      {/* S5 — Event builder launchpad */}
      <EventBuilderLaunchpad events={events} actions={actions} />

      {/* S6 — Invites, reminders and delivery log */}
      <InvitesReminders events={events} actions={actions} />

      {/* S7 — Past events archive */}
      <PastArchive events={events} params={params} actions={actions} />

      {/* S8 — Camera-pinhole album reel */}
      <AlbumReel events={events} actions={actions} />

      {/* S9 — Venues and bookings */}
      <VenuesSection events={events} params={params} actions={actions} />

      {/* S10 — Live check-in for today's gathering */}
      <TodayCheckIn events={events} actions={actions} />

      {/* S11 — Calendar export and subscribe */}
      <ExportSection events={events} actions={actions} />

      {/* ─── Overlays: drawer, wizards and modals (zero page reload) ─── */}
      <EventDrawer event={selected} events={events} params={params} actions={actions} />

      <EventBuilderWizard
        open={act === "create"}
        events={events}
        presetType={params.type}
        presetDate={params.date}
        actions={actions}
      />

      <EditEventModal key={`edit-${selected?.id ?? "none"}`} open={act === "edit"} event={selected} actions={actions} />
      <RescheduleModal key={`resch-${selected?.id ?? "none"}`} open={act === "reschedule"} event={selected} actions={actions} />
      <CancelEventModal key={`cancel-${selected?.id ?? "none"}`} open={act === "cancel"} event={selected} actions={actions} />
      <DeleteDraftModal open={act === "delete"} event={selected} actions={actions} />
      <ShareEventModal open={act === "share"} event={selected} actions={actions} />
      <IcsModal open={act === "ics"} event={selected} events={events} actions={actions} />
      <NudgeModal key={`nudge-${selected?.id ?? "none"}`} open={act === "nudge"} event={selected} actions={actions} />
      <RemindersModal key={`rem-${selected?.id ?? "none"}`} open={act === "reminders"} event={selected} actions={actions} />

      <RsvpManagerModal key={`rsvp-${selected?.id ?? "none"}`} open={act === "rsvp"} event={selected} actions={actions} />
      <InviteWizard key={`inv-${selected?.id ?? "none"}`} open={act === "invite"} event={selected} actions={actions} />
      <CauseModal key={`cause-${selected?.id ?? "none"}`} open={act === "cause"} event={selected} actions={actions} />
      <AlbumAttachModal key={`album-${selected?.id ?? "none"}`} open={act === "album"} event={selected} actions={actions} />
      <AlbumViewModal open={act === "album-view"} event={selected} actions={actions} />
      <CheckInModal key={`checkin-${selected?.id ?? "none"}`} open={act === "checkin"} event={selected} actions={actions} />
      <UploadPhotosModal key={`upload-${selected?.id ?? "none"}`} open={act === "upload"} event={selected} actions={actions} />
      <VenueBookingModal
        key={`venue-${params.venue ?? "none"}`}
        open={act === "venue"}
        venue={VENUES.find((v) => v.id === params.venue) ?? null}
        events={events}
        actions={actions}
      />

      <span className="sr-only" aria-live="polite">
        {selected ? `Event ${selected.title} open.` : ""}
      </span>
    </div>
  );
}

/** T-4 · Events & Activities — client shell that owns the query cache. */
export function EventsPage() {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
          mutations: { retry: 0 },
        },
      }),
  );
  return (
    <QueryClientProvider client={client}>
      <EventsInner />
    </QueryClientProvider>
  );
}
