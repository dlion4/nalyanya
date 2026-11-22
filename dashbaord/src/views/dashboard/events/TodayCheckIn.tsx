"use client";

import { CheckCircle2, Circle, QrCode, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { BarMeter } from "@/components/ui/Charts";
import { Avatar, SectionHeader, SimulatedBadge } from "@/components/ui/Primitives";
import { type FamilyEvent, memberById, rsvpSummary, sortByStart } from "@/data/dashboard/events";
import { eatLabel, longDate, TODAY_ISO } from "@/lib/calendar";
import { cn } from "@/lib/format";
import { checkIn } from "@/services/eventsService";
import type { EventsActions } from "@/views/dashboard/events/types";

export function TodayCheckIn({ events, actions }: { events: FamilyEvent[]; actions: EventsActions }) {
  const target = useMemo(
    () =>
      events.find((e) => e.status === "scheduled" && e.date === TODAY_ISO) ??
      sortByStart(events.filter((e) => e.status === "scheduled" && e.date >= TODAY_ISO))[0],
    [events],
  );
  const [showAll, setShowAll] = useState(false);

  if (!target) {
    return (
      <section id="checkin" className="scroll-mt-24 ny-card p-8 text-sm text-text-secondary">
        No gathering is scheduled for check-in right now.
      </section>
    );
  }

  const s = rsvpSummary(target);
  const going = target.rsvps.filter((r) => r.status === "going");
  const visible = showAll ? going : going.slice(0, 10);
  const isToday = target.date === TODAY_ISO;

  return (
    <section id="checkin" aria-labelledby="checkin-heading" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S10 · Check-in"
        title={isToday ? "Who has arrived today" : "Check-in opens on the day"}
        description="Tick guests off as they arrive. The meter updates for the whole family to see. Walk-ins and relatives without a phone can be added on the spot."
        actions={
          <button type="button" onClick={() => actions.openAct("checkin", { event: target.id })} className="ny-btn ny-btn-primary">
            <QrCode className="size-4" aria-hidden /> Scan or add a walk-in
          </button>
        }
      />
      <h2 id="checkin-heading" className="sr-only">Check-in for {target.title}</h2>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <aside className="ny-card space-y-5 p-6">
          <div className="flex items-start gap-4">
            <img src={target.cover} alt="" loading="lazy" decoding="async" className="size-20 shrink-0 rounded-2xl object-cover" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-secondary">
                {isToday ? "Today" : longDate(target.date).split(",")[0]} · {eatLabel(target.startTime)}
              </p>
              <p className="ny-title mt-1 text-xl leading-snug">{target.title}</p>
              {isToday && (
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-white">
                  <span className="size-2 animate-ny-pulse rounded-full bg-[#7be3a6]" aria-hidden /> Live check-in
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between">
              <p className="text-sm text-text-secondary">Arrived</p>
              <p className="ny-num font-display text-3xl font-semibold text-text-primary">
                {s.arrived}
                <span className="text-lg text-text-tertiary"> / {s.expected}</span>
              </p>
            </div>
            <BarMeter value={s.arrived} max={Math.max(1, s.expected)} color="#1F4D3A" className="mt-3" />
            <p className="mt-2 text-xs text-text-tertiary">Expected includes {s.plusOnes} plus-ones who came with a going guest.</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-2xl bg-surface-0/80 p-3"><p className="text-text-tertiary">Going</p><p className="ny-num mt-1 text-lg font-semibold">{s.going}</p></div>
            <div className="rounded-2xl bg-surface-0/80 p-3"><p className="text-text-tertiary">Maybe</p><p className="ny-num mt-1 text-lg font-semibold">{s.maybe}</p></div>
            <div className="rounded-2xl bg-surface-0/80 p-3"><p className="text-text-tertiary">Waiting</p><p className="ny-num mt-1 text-lg font-semibold">{s.pending}</p></div>
          </div>

          <p className="flex items-center gap-2 text-xs text-text-tertiary">
            <SimulatedBadge label="QR scan SIMULATED" /> Real QR scanning arrives with the mobile check-in build.
          </p>
        </aside>

        <div className="ny-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-hairline p-4 sm:p-5">
            <p className="font-semibold text-text-primary">Guests who said they are going</p>
            <button type="button" onClick={() => actions.openAct("rsvp", { event: target.id })} className="ny-btn ny-btn-ghost ny-btn-sm">
              <UserPlus className="size-4" aria-hidden /> RSVP manager
            </button>
          </div>
          <ul className="divide-y divide-hairline">
            {visible.map((r) => {
              const m = memberById(r.memberId);
              if (!m) return null;
              return (
                <li key={r.memberId} className="flex items-center gap-3 p-3.5 sm:px-5">
                  <Avatar member={m} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text-primary">{m.preferredName} {m.lastName}</p>
                    <p className="truncate text-xs text-text-tertiary">
                      {m.homeTown} · Gen {m.generation}{r.plusOnes > 0 ? ` · +${r.plusOnes} guest${r.plusOnes > 1 ? "s" : ""}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={r.arrived}
                    onClick={() => actions.run(() => checkIn(target.id, r.memberId, !r.arrived))}
                    className={cn(
                      "inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3.5 text-xs font-semibold transition",
                      r.arrived ? "border-brand-primary bg-brand-primary text-white" : "border-hairline bg-surface-0 text-text-secondary hover:border-brand-primary hover:text-brand-primary",
                    )}
                  >
                    {r.arrived ? <CheckCircle2 className="size-4" aria-hidden /> : <Circle className="size-4" aria-hidden />}
                    {r.arrived ? "Arrived" : "Mark arrived"}
                  </button>
                </li>
              );
            })}
          </ul>
          {going.length > 10 && (
            <button type="button" onClick={() => setShowAll((v) => !v)} className="w-full border-t border-hairline p-3.5 text-sm font-semibold text-brand-primary hover:bg-surface-0/70">
              {showAll ? "Show fewer guests" : `Show all ${going.length} guests`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
