"use client";

import { CalendarPlus, CalendarRange, ClipboardCheck, Download, Sparkles } from "lucide-react";
import { CountUp, Reveal, TiltCard } from "@/components/ui/motion";
import { CURRENT_USER_ID } from "@/data/dashboard/lineage";
import { type FamilyEvent, rsvpSummary } from "@/data/dashboard/events";
import { DEFAULT_MONTH, diffDays, monthKeyOf, TODAY_ISO } from "@/lib/calendar";
import { cn } from "@/lib/format";
import type { EventsActions } from "@/views/dashboard/events/types";

export function EventsHero({ events, actions }: { events: FamilyEvent[]; actions: EventsActions }) {
  const live = events.filter((e) => e.status !== "draft");
  const upcoming30 = live.filter((e) => e.status === "scheduled" && diffDays(TODAY_ISO, e.date) >= 0 && diffDays(TODAY_ISO, e.date) <= 30).length;
  const thisMonth = live.filter((e) => monthKeyOf(e.date) === DEFAULT_MONTH).length;
  const rsvpPending = live
    .filter((e) => e.status === "scheduled" && e.date >= TODAY_ISO)
    .reduce((sum, e) => sum + rsvpSummary(e).pending, 0);
  const hosted = live.filter((e) => e.host === CURRENT_USER_ID).length;

  const kpis = [
    { label: "Upcoming · 30 days", value: upcoming30, note: "Scheduled gatherings across every branch", accent: "#1F4D3A", anchor: "#calendar" },
    { label: "This month", value: thisMonth, note: "May 2026 · weddings, harambees and meetings", accent: "#D4A437", anchor: "#calendar" },
    { label: "RSVPs pending", value: rsvpPending, note: "Guests who have not answered yet", accent: "#E0764A", anchor: "#invites" },
    { label: "Events you host", value: hosted, note: "Hosted by the Family Head this year", accent: "#6A4C93", anchor: "#table" },
  ];

  return (
    <section aria-labelledby="events-heading" className="space-y-6">
      <div className="relative overflow-hidden rounded-[32px] border border-hairline bg-surface-1 shadow-soft">
        <div aria-hidden className="absolute inset-0">
          <img src="/images/family/harambee.jpg" alt="" className="h-full w-full object-cover opacity-[0.16]" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-1 via-surface-1/94 to-surface-1/60" />
        </div>

        <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div className="min-w-0">
            <p className="ny-eyebrow">T-4 · Events &amp; activities</p>
            <h1 id="events-heading" className="ny-title mt-3 text-[2.5rem] leading-[1.02] sm:text-6xl">
              Gather the family, <span className="italic text-brand-primary">on time</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
              Plan weddings, memorials, birthdays and harambees in East African Time. Track every RSVP, send reminders on the channel each relative
              uses, and turn photos from every gathering into an album.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="ny-chip ny-chip-gold">
                <Sparkles className="size-3.5" aria-hidden />
                Times in EAT · Africa/Nairobi
              </span>
              <span className="ny-chip ny-chip-sim">Invites &amp; reminders · SIMULATED</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <button type="button" onClick={() => actions.openAct("create")} className="ny-btn ny-btn-primary">
                <CalendarPlus className="size-4" aria-hidden />
                Plan an event
              </button>
              <a href="#calendar" className="ny-btn ny-btn-ghost">
                <CalendarRange className="size-4" aria-hidden />
                Open the calendar
              </a>
              <a href="#checkin" className="ny-btn ny-btn-gold">
                <ClipboardCheck className="size-4" aria-hidden />
                Today&apos;s check-in
              </a>
              <a href="#export" className="ny-btn ny-btn-ghost">
                <Download className="size-4" aria-hidden />
                Export calendar
              </a>
            </div>
          </div>

          {/* 3D photo stack — Tailwind perspective + transform-3d */}
          <div className="perspective-[1200px] relative mx-auto h-[19rem] w-full max-w-md sm:h-[22rem]">
            <TiltCard max={5} className="absolute inset-0">
              <figure className="transform-3d absolute left-0 top-6 w-[62%] -rotate-y-6 translate-z-12 overflow-hidden rounded-3xl border-4 border-white bg-surface-2 shadow-lift">
                <img src="/images/family/birthday.jpg" alt="Family blowing out candles on a birthday cake" className="h-56 w-full object-cover sm:h-64" decoding="async" />
                <figcaption className="bg-surface-1 px-3 py-2 text-xs font-semibold text-text-primary">Birthday · Mzee Victor, 92</figcaption>
              </figure>
              <figure className="transform-3d absolute right-0 top-0 w-[56%] rotate-y-6 translate-z-24 overflow-hidden rounded-3xl border-4 border-white bg-surface-2 shadow-lift">
                <img src="/images/family/picnic.jpg" alt="A family picnic on the beach" className="h-44 w-full object-cover sm:h-52" decoding="async" />
                <figcaption className="bg-surface-1 px-3 py-2 text-xs font-semibold text-text-primary">Coastal picnic</figcaption>
              </figure>
              <figure className="transform-3d absolute bottom-0 right-6 w-[46%] rotate-y-3 translate-z-6 overflow-hidden rounded-3xl border-4 border-white bg-surface-2 shadow-lift">
                <img src="/images/family/graduation.jpg" alt="Graduates celebrating in gowns" className="h-32 w-full object-cover" decoding="async" />
                <figcaption className="bg-surface-1 px-3 py-1.5 text-[11px] font-semibold text-text-primary">Graduation · May 29</figcaption>
              </figure>
            </TiltCard>
          </div>
        </div>
      </div>

      {/* S1 — KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Reveal key={kpi.label} delay={index * 0.05}>
            <a
              href={kpi.anchor}
              className={cn("ny-card ny-card-3d relative flex h-full flex-col overflow-hidden p-5 transition hover:border-brand-primary")}
            >
              <span aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: kpi.accent }} />
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">{kpi.label}</p>
              <p className="ny-title mt-3 text-4xl leading-none">
                <CountUp value={kpi.value} />
              </p>
              <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">{kpi.note}</p>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
