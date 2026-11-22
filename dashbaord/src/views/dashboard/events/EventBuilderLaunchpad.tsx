"use client";

import { CalendarPlus, Check } from "lucide-react";
import { Reveal, TiltCard } from "@/components/ui/motion";
import { SectionHeader } from "@/components/ui/Primitives";
import { EVENT_KINDS, type FamilyEvent } from "@/data/dashboard/events";
import { KindIcon } from "@/views/dashboard/events/eventsUi";
import type { EventsActions } from "@/views/dashboard/events/types";

const STEPS = [
  { title: "Type", hint: "What kind of gathering" },
  { title: "When & where", hint: "EAT date, time and venue" },
  { title: "Hosts", hint: "Host and branch" },
  { title: "Details", hint: "Story, dress and photo" },
  { title: "RSVP & reminders", hint: "Capacity, E-2d and E-1h" },
  { title: "Review", hint: "Venue check, then create" },
];

export function EventBuilderLaunchpad({ events, actions }: { events: FamilyEvent[]; actions: EventsActions }) {
  return (
    <section id="builder" aria-labelledby="builder-heading" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S5 · Event builder"
        title="Plan a gathering in six calm steps"
        description="Pick a type to start. The builder remembers it, checks the venue for clashes, and sets the reminders for you."
        actions={
          <button type="button" onClick={() => actions.openAct("create")} className="ny-btn ny-btn-primary">
            <CalendarPlus className="size-4" aria-hidden />
            Start a blank event
          </button>
        }
      />
      <h2 id="builder-heading" className="sr-only">Event builder launchpad</h2>

      <div className="perspective-[1200px] grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {EVENT_KINDS.map((meta, index) => {
          const count = events.filter((e) => e.kind === meta.kind && e.status !== "draft").length;
          return (
            <Reveal key={meta.kind} delay={index * 0.03}>
              <TiltCard max={5} className="h-full">
                <button
                  type="button"
                  onClick={() => actions.openAct("create", { type: meta.kind })}
                  className="group ny-card relative flex h-full w-full flex-col overflow-hidden p-5 text-left transition duration-300 hover:-translate-y-1 hover:shadow-lift"
                  aria-label={`Plan a ${meta.kind.toLowerCase()} event`}
                >
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 transition-all duration-500 group-hover:h-2" style={{ background: meta.accent }} />
                  <span className="grid size-12 place-items-center rounded-2xl" style={{ background: `${meta.accent}22`, color: meta.accent }}>
                    <KindIcon kind={meta.kind} className="size-5" />
                  </span>
                  <p className="ny-title mt-4 text-xl">{meta.kind}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">{meta.blurb}</p>
                  <p className="mt-auto pt-4 text-xs font-semibold text-text-tertiary">
                    <span className="ny-num text-text-primary">{count}</span> in the calendar
                  </p>
                </button>
              </TiltCard>
            </Reveal>
          );
        })}
      </div>

      <ol className="grid gap-3 rounded-[28px] border border-hairline bg-surface-1 p-4 sm:grid-cols-3 sm:p-5 xl:grid-cols-6" aria-label="The six builder steps">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex items-start gap-3 rounded-2xl bg-surface-0/70 p-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-primary font-mono text-xs font-bold text-white">
              {i === STEPS.length - 1 ? <Check className="size-4" aria-hidden /> : i + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-text-primary">{step.title}</span>
              <span className="block text-xs leading-snug text-text-tertiary">{step.hint}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
