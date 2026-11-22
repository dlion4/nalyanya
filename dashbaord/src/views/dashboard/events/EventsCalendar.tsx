"use client";

import { CalendarPlus, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type DragEvent } from "react";
import { type FamilyEvent, rsvpSummary, sortByStart, venueById } from "@/data/dashboard/events";
import { addDays, diffDays, dayMonth, eatLabel, isWeekend, longDate, monthGrid, monthKeyOf, monthLabel, shiftMonth, shortDay, TODAY_ISO, weekOf } from "@/lib/calendar";
import { cn } from "@/lib/format";
import { rescheduleEvent } from "@/services/eventsService";
import { EventStatusChip, kindAccent, KindChip } from "@/views/dashboard/events/eventsUi";
import type { EventsActions, EventsParams } from "@/views/dashboard/events/types";

/** Kenyan public holidays inside the calendar window (fixed dates only). */
const HOLIDAYS: Record<string, string> = {
  "2026-05-01": "Labour Day",
  "2026-06-01": "Madaraka Day",
  "2026-10-20": "Mashujaa Day",
  "2026-12-12": "Jamhuri Day",
  "2026-12-25": "Christmas Day",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const VIEWS: Array<{ key: EventsParams["cv"]; label: string }> = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "agenda", label: "Agenda" },
];

export function EventsCalendar({ events, params, actions }: { events: FamilyEvent[]; params: EventsParams; actions: EventsActions }) {
  const [dragOver, setDragOver] = useState<string | null>(null);
  const byDate = useMemo(() => {
    const map = new Map<string, FamilyEvent[]>();
    for (const e of sortByStart(events)) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [events]);

  const cells = useMemo(() => monthGrid(params.month), [params.month]);
  const week = useMemo(() => weekOf(params.day), [params.day]);
  const dayEvents = byDate.get(params.day) ?? [];
  const monthEvents = sortByStart(events.filter((e) => monthKeyOf(e.date) === params.month));

  const selectDay = (iso: string) => actions.setParams({ day: iso }, "replace");

  const onDropTo = (iso: string) => (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(null);
    const id = event.dataTransfer.getData("text/plain");
    const moving = events.find((e) => e.id === id);
    if (!moving || moving.date === iso || moving.status !== "scheduled") return;
    actions.run(
      () => rescheduleEvent(moving.id, iso, moving.startTime, moving.endTime, "Moved by drag on the week view"),
      { title: `${moving.title} moved`, body: `Now on ${shortDay(iso)} at ${eatLabel(moving.startTime)} · guests notified (SIMULATED).`, tone: "success" },
    );
  };

  const onDragStart = (id: string) => (event: DragEvent<HTMLElement>) => {
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <section id="calendar" aria-labelledby="calendar-heading" className="scroll-mt-24 space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="ny-eyebrow">S2 · Calendar</p>
          <h2 id="calendar-heading" className="ny-title mt-2 text-3xl sm:text-4xl">Month, week and agenda in EAT</h2>
          <p className="mt-2 max-w-2xl text-text-secondary">
            Weekends are shaded and Kenyan public holidays are marked. On the week view, drag a scheduled event onto another day to reschedule it.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-hairline bg-surface-1 p-1" role="group" aria-label="Calendar view">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => actions.setParams({ cv: v.key }, "replace")}
                aria-pressed={params.cv === v.key}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold transition",
                  params.cv === v.key ? "bg-brand-primary text-white shadow-soft" : "text-text-secondary hover:text-text-primary",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-1 p-1">
            <button
              type="button"
              onClick={() => actions.setParams({ month: shiftMonth(params.month, -1) }, "replace")}
              aria-label="Previous month"
              className="grid size-8 place-items-center rounded-full text-text-secondary transition hover:bg-surface-2 hover:text-text-primary"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <span className="min-w-[8.5rem] text-center font-display text-base font-semibold text-text-primary" aria-live="polite">
              {monthLabel(params.month)}
            </span>
            <button
              type="button"
              onClick={() => actions.setParams({ month: shiftMonth(params.month, 1) }, "replace")}
              aria-label="Next month"
              className="grid size-8 place-items-center rounded-full text-text-secondary transition hover:bg-surface-2 hover:text-text-primary"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            onClick={() => actions.setParams({ month: monthKeyOf(TODAY_ISO), day: TODAY_ISO }, "replace")}
            className="ny-btn ny-btn-ghost ny-btn-sm"
          >
            Today
          </button>
          <button type="button" onClick={() => actions.openAct("create", { date: params.day })} className="ny-btn ny-btn-primary ny-btn-sm">
            <CalendarPlus className="size-4" aria-hidden />
            New on {dayMonth(params.day)}
          </button>
        </div>
      </div>

      {params.cv === "month" && (
        <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
          <div className="ny-card overflow-hidden p-3 sm:p-4">
            <div className="grid grid-cols-7 gap-1 px-1 pb-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary">
              {WEEKDAYS.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell) => {
                const list = byDate.get(cell.iso) ?? [];
                const holiday = HOLIDAYS[cell.iso];
                const selected = cell.iso === params.day;
                const today = cell.iso === TODAY_ISO;
                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => selectDay(cell.iso)}
                    aria-label={`${longDate(cell.iso)}. ${list.length} ${list.length === 1 ? "event" : "events"}${holiday ? `, ${holiday}` : ""}`}
                    aria-pressed={selected}
                    className={cn(
                      "ny-cal-cell relative flex min-h-[4.6rem] flex-col rounded-2xl border p-1.5 text-left transition sm:min-h-[6.2rem] sm:p-2",
                      cell.inMonth ? "border-hairline bg-surface-1" : "border-transparent bg-surface-0/40 text-text-tertiary",
                      cell.inMonth && isWeekend(cell.iso) && "bg-surface-0/80",
                      selected && "border-brand-primary ring-2 ring-brand-primary/25",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-7 place-items-center rounded-full font-display text-sm font-semibold",
                        today ? "bg-brand-accent text-brand-deep" : cell.inMonth ? "text-text-primary" : "text-text-tertiary",
                      )}
                    >
                      {cell.day}
                    </span>
                    {holiday && cell.inMonth && (
                      <span className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-wide text-brand-secondary">{holiday}</span>
                    )}
                    <span className="mt-auto flex flex-wrap items-center gap-1 pt-1">
                      {list.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={cn("ny-dot-pop size-2 rounded-full", e.status === "draft" && "ring-1 ring-offset-1")}
                          style={{ background: e.status === "cancelled" ? "#c9b8b8" : kindAccent(e.kind) }}
                          aria-hidden
                        />
                      ))}
                      {list.length > 3 && <span className="text-[10px] font-semibold text-text-tertiary">+{list.length - 3}</span>}
                    </span>
                    {list[0] && (
                      <span className="mt-1 hidden truncate text-[10px] font-medium text-text-secondary xl:block">{list[0].title}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-1 text-[11px] text-text-tertiary">
              <span>Shaded: weekends</span>
              <span>Gold date: today (6 May)</span>
              <span>Grey dot: cancelled</span>
            </p>
          </div>

          <aside className="ny-card flex flex-col gap-4 p-5 sm:p-6" aria-live="polite">
            <div>
              <p className="ny-eyebrow">Selected day</p>
              <h3 className="ny-title mt-1.5 text-2xl">{longDate(params.day)}</h3>
              {HOLIDAYS[params.day] && <p className="mt-1 text-sm font-semibold text-brand-secondary">Public holiday · {HOLIDAYS[params.day]}</p>}
            </div>
            {dayEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-hairline bg-surface-0/70 p-5 text-sm text-text-secondary">
                Nothing planned yet. Start a gathering on this day with one tap.
              </div>
            ) : (
              <ul className="space-y-3">
                {dayEvents.map((e) => (
                  <li key={e.id} className="rounded-2xl border border-hairline bg-surface-0/60 p-4 transition hover:border-brand-primary/40">
                    <div className="flex items-start justify-between gap-3">
                      <KindChip kind={e.kind} />
                      <EventStatusChip status={e.status} date={e.date} />
                    </div>
                    <p className="mt-2 font-semibold leading-snug text-text-primary">{e.title}</p>
                    <p className="mt-1 text-xs text-text-tertiary">
                      {eatLabel(e.startTime)} – {e.endTime} · {venueById(e.venueId)?.name}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="ny-num text-xs text-text-secondary">{rsvpSummary(e).going} going</span>
                      <button type="button" onClick={() => actions.openEvent(e.id)} className="ny-btn ny-btn-quiet ny-btn-sm">
                        Open details →
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/dashboard/lineage" className="mt-auto text-xs font-semibold text-brand-primary hover:underline">
              Need a relative&apos;s branch? Open the 3D tree →
            </Link>
          </aside>
        </div>
      )}

      {params.cv === "week" && (
        <div className="ny-card overflow-hidden p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
            <p className="text-sm font-semibold text-text-primary">
              Week of {dayMonth(week[0])} – {dayMonth(week[6])}
            </p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => actions.setParams({ day: addDays(params.day, -7) }, "replace")} className="ny-btn ny-btn-ghost ny-btn-sm">
                <ChevronLeft className="size-4" aria-hidden /> Prev week
              </button>
              <button type="button" onClick={() => actions.setParams({ day: addDays(params.day, 7) }, "replace")} className="ny-btn ny-btn-ghost ny-btn-sm">
                Next week <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
            {week.map((iso, idx) => {
              const list = byDate.get(iso) ?? [];
              return (
                <div
                  key={iso}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(iso);
                  }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={onDropTo(iso)}
                  className={cn(
                    "flex min-h-[12rem] flex-col gap-2 rounded-2xl border p-2.5 transition",
                    dragOver === iso ? "border-brand-accent bg-brand-accent-soft/50" : "border-hairline bg-surface-0/60",
                    iso === TODAY_ISO && "ring-2 ring-brand-accent/60",
                  )}
                >
                  <button type="button" onClick={() => selectDay(iso)} className="flex items-baseline justify-between px-1 text-left">
                    <span className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">{WEEKDAYS[idx]}</span>
                    <span className="font-display text-lg font-semibold text-text-primary">{dayMonth(iso).split(" ")[0]}</span>
                  </button>
                  {HOLIDAYS[iso] && <span className="rounded-full bg-brand-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-brand-secondary">{HOLIDAYS[iso]}</span>}
                  {list.length === 0 && <p className="px-1 text-xs text-text-tertiary">Free</p>}
                  {list.map((e) => (
                    <article
                      key={e.id}
                      draggable={e.status === "scheduled"}
                      onDragStart={onDragStart(e.id)}
                      className={cn(
                        "group cursor-pointer rounded-xl border border-hairline bg-surface-1 p-2.5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift",
                        e.status === "cancelled" && "opacity-60",
                      )}
                      style={{ borderLeft: `4px solid ${kindAccent(e.kind)}` }}
                    >
                      <button type="button" onClick={() => actions.openEvent(e.id)} className="block w-full text-left">
                        <span className="block text-[11px] font-semibold text-text-tertiary">{eatLabel(e.startTime)}</span>
                        <span className={cn("mt-0.5 block text-sm font-semibold leading-snug text-text-primary", e.status === "cancelled" && "line-through")}>
                          {e.title}
                        </span>
                        <span className="mt-1 block truncate text-[11px] text-text-tertiary">{venueById(e.venueId)?.town}</span>
                      </button>
                      {e.status === "scheduled" && (
                        <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-text-tertiary">
                          <GripVertical className="size-3" aria-hidden /> Drag to reschedule
                        </span>
                      )}
                    </article>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {params.cv === "agenda" && (
        <div className="ny-card divide-y divide-hairline overflow-hidden">
          {monthEvents.length === 0 && <p className="p-6 text-sm text-text-secondary">No gatherings in {monthLabel(params.month)} yet.</p>}
          {Array.from(new Set(monthEvents.map((e) => e.date))).map((iso) => (
            <div key={iso} className="grid gap-3 p-4 sm:grid-cols-[9rem_1fr] sm:p-5">
              <div>
                <p className="font-display text-xl font-semibold text-text-primary">{shortDay(iso)}</p>
                <p className="text-xs text-text-tertiary">{diffDays(TODAY_ISO, iso) === 0 ? "Today" : diffDays(TODAY_ISO, iso) > 0 ? `In ${diffDays(TODAY_ISO, iso)} days` : `${-diffDays(TODAY_ISO, iso)} days ago`}</p>
              </div>
              <ul className="space-y-2">
                {(byDate.get(iso) ?? []).filter((e) => monthKeyOf(e.date) === params.month).map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => actions.openEvent(e.id)}
                      className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-0/60 p-3.5 text-left transition hover:border-brand-primary hover:bg-surface-1"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="size-3 shrink-0 rounded-full" style={{ background: kindAccent(e.kind) }} aria-hidden />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-text-primary">{e.title}</span>
                          <span className="block text-xs text-text-tertiary">
                            {eatLabel(e.startTime)} · {venueById(e.venueId)?.name}
                          </span>
                        </span>
                      </span>
                      <EventStatusChip status={e.status} date={e.date} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
