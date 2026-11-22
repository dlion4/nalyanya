"use client";

import { Building2, CalendarCheck, Users, Wallet } from "lucide-react";
import { Reveal, TiltCard } from "@/components/ui/motion";
import { SectionHeader } from "@/components/ui/Primitives";
import { type FamilyEvent, VENUES, sortByStart } from "@/data/dashboard/events";
import { dayMonth, TODAY_ISO } from "@/lib/calendar";
import { cn, kes } from "@/lib/format";
import type { EventsActions, EventsParams } from "@/views/dashboard/events/types";

export function VenuesSection({ events, params, actions }: { events: FamilyEvent[]; params: EventsParams; actions: EventsActions }) {
  return (
    <section id="venues" aria-labelledby="venues-heading" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S9 · Venues & bookings"
        title="Halls, compounds and a virtual room"
        description="Every venue the family uses, with capacity, amenities and its next booking. Booking checks the calendar for clashes before it confirms."
      />
      <h2 id="venues-heading" className="sr-only">Venues and bookings</h2>

      <div className="perspective-[1400px] grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {VENUES.map((venue, index) => {
          const next = sortByStart(events.filter((e) => e.venueId === venue.id && e.status === "scheduled" && e.date >= TODAY_ISO))[0];
          const highlighted = params.venue === venue.id;
          return (
            <Reveal key={venue.id} delay={(index % 3) * 0.05}>
              <TiltCard max={4} className="h-full">
                <article
                  className={cn(
                    "ny-card group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lift",
                    highlighted && "border-brand-primary ring-2 ring-brand-primary/25",
                  )}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img src={venue.photo} alt={`${venue.name}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/80 via-transparent to-transparent" aria-hidden />
                    <span className="absolute left-3 top-3 ny-chip !border-white/30 !bg-black/45 !text-white">
                      <Users className="size-3.5" aria-hidden /> {venue.capacity === 999 ? "Unlimited" : venue.capacity} seats
                    </span>
                    <p className="absolute bottom-3 left-4 right-4 truncate font-display text-lg font-semibold text-white">{venue.name}</p>
                  </div>

                  <div className="flex flex-1 flex-col gap-4 p-5">
                    <p className="flex items-center gap-1.5 text-sm text-text-secondary">
                      <Building2 className="size-4 text-text-tertiary" aria-hidden /> {venue.town} · {venue.county}
                    </p>
                    <ul className="flex flex-wrap gap-1.5">
                      {venue.amenities.map((a) => (
                        <li key={a} className="ny-chip py-0.5 text-[11px]">{a}</li>
                      ))}
                    </ul>
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-0/80 p-3 text-xs">
                      <div>
                        <p className="flex items-center gap-1 text-text-tertiary"><Wallet className="size-3.5" aria-hidden /> Day rate</p>
                        <p className="ny-num mt-0.5 font-semibold text-text-primary">{venue.rateKes === 0 ? "Free" : kes(venue.rateKes)}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1 text-text-tertiary"><CalendarCheck className="size-3.5" aria-hidden /> Next booking</p>
                        <p className="mt-0.5 font-semibold text-text-primary">{next ? dayMonth(next.date) : "Open"}</p>
                      </div>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                      <span className="truncate text-[11px] text-text-tertiary">{venue.contact}</span>
                      <button type="button" onClick={() => actions.openAct("venue", { venue: venue.id })} className="ny-btn ny-btn-primary ny-btn-sm">
                        Book this venue
                      </button>
                    </div>
                  </div>
                </article>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
