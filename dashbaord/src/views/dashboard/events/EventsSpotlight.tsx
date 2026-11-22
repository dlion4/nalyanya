"use client";

import { ArrowRight, CalendarClock, MapPin, Share2, UserPlus, Users } from "lucide-react";
import { TiltCard } from "@/components/ui/motion";
import { Avatar, SectionHeader } from "@/components/ui/Primitives";
import { type FamilyEvent, memberById, rsvpSummary, sortByStart, venueById } from "@/data/dashboard/events";
import { causeById } from "@/data/dashboard/events";
import { diffDays, eatLabel, longDate, TODAY_ISO } from "@/lib/calendar";
import { cn } from "@/lib/format";
import { EventStatusChip, KindChip } from "@/views/dashboard/events/eventsUi";
import type { EventsActions } from "@/views/dashboard/events/types";

export function EventsSpotlight({ events, actions }: { events: FamilyEvent[]; actions: EventsActions }) {
  const upcoming = sortByStart(events.filter((e) => e.status === "scheduled" && e.date >= TODAY_ISO));
  const next = upcoming[0];
  if (!next) return null;

  const s = rsvpSummary(next);
  const days = diffDays(TODAY_ISO, next.date);
  const host = memberById(next.host);
  const venue = venueById(next.venueId);
  const cause = causeById(next.causeId);
  const rail = upcoming.slice(1, 5);
  const total = Math.max(1, s.total);
  const segments = [
    { label: "Going", value: s.going, color: "#1F4D3A" },
    { label: "Maybe", value: s.maybe, color: "#D4A437" },
    { label: "Waiting", value: s.pending, color: "#E0764A" },
    { label: "Declined", value: s.declined, color: "#C9B8B8" },
  ];

  return (
    <section id="spotlight" aria-labelledby="spotlight-heading" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S4 · Next gathering"
        title="The one everyone is talking about"
        description="The next scheduled gathering, with its countdown, guest split and the quickest actions to get it right."
      />
      <h2 id="spotlight-heading" className="sr-only">Next gathering spotlight</h2>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <TiltCard max={4} className="perspective-[1400px]">
          <article className="ny-card group relative overflow-hidden p-0">
            <div className="relative aspect-[16/9] overflow-hidden">
              <img
                src={next.cover}
                alt={`Cover photo for ${next.title}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/90 via-brand-deep/25 to-transparent" aria-hidden />
              <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                <KindChip kind={next.kind} className="!bg-black/45 !text-white !border-white/25" />
                <EventStatusChip status={next.status} date={next.date} />
              </div>
              <div className="absolute right-4 top-4 grid size-24 place-items-center rounded-full border border-brand-accent/70 bg-brand-deep/70 text-center text-white shadow-gold backdrop-blur-md">
                <div>
                  <p className="ny-num font-display text-4xl font-semibold leading-none text-brand-accent">{days}</p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/80">{days === 0 ? "today" : days === 1 ? "day" : "days"}</p>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-accent">{longDate(next.date)} · {eatLabel(next.startTime)}</p>
                <h3 className="ny-title mt-2 text-3xl !text-white sm:text-4xl">{next.title}</h3>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-white/85">
                  <MapPin className="size-4" aria-hidden /> {venue?.name} · {venue?.town}, {venue?.county}
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-[1fr_auto] sm:items-end sm:p-7">
              <div className="min-w-0 space-y-4">
                <p className="text-sm leading-relaxed text-text-secondary">{next.description}</p>
                <div className="flex items-center gap-3">
                  {host && <Avatar member={host} size={40} />}
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold text-text-primary">Hosted by {host ? `${host.preferredName} ${host.lastName}` : "the family office"}</p>
                    <p className="text-xs text-text-tertiary">Dress: {next.dressCode}{cause ? ` · Linked cause: ${cause.title}` : ""}</p>
                  </div>
                </div>
                <div>
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-2" role="img" aria-label={segments.map((g) => `${g.value} ${g.label.toLowerCase()}`).join(", ")}>
                    {segments.map((g) => (
                      <span key={g.label} style={{ width: `${(g.value / total) * 100}%`, background: g.color }} className="h-full transition-[width] duration-700" />
                    ))}
                  </div>
                  <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
                    {segments.map((g) => (
                      <li key={g.label} className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full" style={{ background: g.color }} aria-hidden />
                        <span className="ny-num font-semibold text-text-primary">{g.value}</span> {g.label.toLowerCase()}
                      </li>
                    ))}
                    <li className="flex items-center gap-1.5">
                      <Users className="size-3.5" aria-hidden />
                      <span className="ny-num font-semibold text-text-primary">{s.expected}</span> expected incl. plus-ones
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-stretch">
                <button type="button" onClick={() => actions.openEvent(next.id)} className="ny-btn ny-btn-primary">
                  Open details <ArrowRight className="size-4" aria-hidden />
                </button>
                <button type="button" onClick={() => actions.openAct("rsvp", { event: next.id })} className="ny-btn ny-btn-ghost">
                  <Users className="size-4" aria-hidden /> RSVP manager
                </button>
                <button type="button" onClick={() => actions.openAct("invite", { event: next.id })} className="ny-btn ny-btn-gold">
                  <UserPlus className="size-4" aria-hidden /> Invite guests
                </button>
                <button type="button" onClick={() => actions.openAct("share", { event: next.id })} className="ny-btn ny-btn-ghost">
                  <Share2 className="size-4" aria-hidden /> Share
                </button>
              </div>
            </div>
          </article>
        </TiltCard>

        <aside className="ny-card flex flex-col gap-3 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="ny-eyebrow">Coming up next</p>
            <CalendarClock className="size-4 text-text-tertiary" aria-hidden />
          </div>
          {rail.length === 0 && <p className="text-sm text-text-secondary">No other gatherings are scheduled yet.</p>}
          <ul className="space-y-2.5">
            {rail.map((e, i) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => actions.openEvent(e.id)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-2xl border border-hairline bg-surface-0/60 p-2.5 text-left transition hover:-translate-y-0.5 hover:border-brand-primary hover:bg-surface-1",
                  )}
                >
                  <img src={e.cover} alt="" loading="lazy" decoding="async" className="size-14 shrink-0 rounded-xl object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-semibold text-brand-secondary">
                      {i === 0 ? "Then · " : ""}
                      {longDate(e.date).split(",")[0]} · {eatLabel(e.startTime)}
                    </span>
                    <span className="block truncate font-semibold text-text-primary">{e.title}</span>
                    <span className="block truncate text-xs text-text-tertiary">{venueById(e.venueId)?.town} · {rsvpSummary(e).going} going</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
