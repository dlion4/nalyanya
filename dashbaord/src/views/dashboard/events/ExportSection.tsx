"use client";

import { CalendarSync, Copy, Download, FileDown, Share2 } from "lucide-react";
import { TiltCard } from "@/components/ui/motion";
import { SectionHeader, SimulatedBadge } from "@/components/ui/Primitives";
import { type FamilyEvent, rsvpSummary, venueById } from "@/data/dashboard/events";
import { buildIcs, downloadText, eatLabel, longDate, TODAY_ISO } from "@/lib/calendar";
import type { EventsActions } from "@/views/dashboard/events/types";

export function ExportSection({ events, actions }: { events: FamilyEvent[]; actions: EventsActions }) {
  const exportable = events.filter((e) => e.status === "scheduled" || e.status === "done");
  const next = exportable.filter((e) => e.status === "scheduled" && e.date >= TODAY_ISO).sort((a, b) => a.date.localeCompare(b.date))[0];
  const subscribeUrl = "webcal://nalyanya.family/cal/family.ics";

  const downloadAll = () => {
    const ics = buildIcs(
      exportable.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        startTime: e.startTime,
        endTime: e.endTime,
        location: venueById(e.venueId)?.name ?? "To confirm",
        description: `${e.description} Dress: ${e.dressCode}.`,
      })),
      "Nalyanya family calendar",
    );
    downloadText("nalyanya-family-calendar.ics", ics);
    actions.notify({ title: "Family calendar downloaded", body: `${exportable.length} gatherings in one .ics file (EAT).`, tone: "success" });
  };

  const shareNext = () => {
    if (!next) return;
    const text = `${next.title}: ${longDate(next.date)} at ${eatLabel(next.startTime)}, ${venueById(next.venueId)?.name}. ${rsvpSummary(next).going} going so far. Reply to the family office to confirm.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    actions.notify({ title: "WhatsApp share sheet opened", body: "Nothing was sent for you. Choose a chat and tap send yourself.", tone: "info" });
  };

  const cards = [
    {
      key: "all",
      title: "Download the whole calendar",
      body: `One .ics file with ${exportable.length} gatherings in East African Time. Works with Google Calendar, Apple Calendar and Outlook.`,
      icon: Download,
      action: "Download .ics",
      onClick: downloadAll,
      simulated: false,
    },
    {
      key: "subscribe",
      title: "Subscribe so it keeps updating",
      body: "A live link that refreshes when the family adds a gathering. Subscriptions connect when the backend is wired.",
      icon: CalendarSync,
      action: "Copy subscribe link",
      onClick: () => {
        if (typeof navigator !== "undefined" && navigator.clipboard) void navigator.clipboard.writeText(subscribeUrl);
        actions.notify({ title: "Subscribe link copied", body: "Live subscriptions connect when the backend is wired (SIMULATED).", tone: "info" });
      },
      simulated: true,
    },
    {
      key: "share",
      title: "Share the next gathering",
      body: next ? `Opens WhatsApp with “${next.title}” ready to send. You choose the chat and send it yourself.` : "No upcoming gathering to share yet.",
      icon: Share2,
      action: "Open WhatsApp share",
      onClick: shareNext,
      simulated: false,
      disabled: !next,
    },
    {
      key: "pick",
      title: "Pick events to export",
      body: "Choose a few gatherings, for example just the reunion weekend, and export only those as a single file.",
      icon: FileDown,
      action: "Choose events",
      onClick: () => actions.openAct("ics"),
      simulated: false,
    },
  ];

  return (
    <section id="export" aria-labelledby="export-heading" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S11 · Calendar export"
        title="Take the family calendar with you"
        description="Download every gathering, subscribe so it stays current, or share the next one. Times are always written in East African Time."
      />
      <h2 id="export-heading" className="sr-only">Calendar export and subscribe</h2>

      <div className="perspective-[1200px] grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <TiltCard key={c.key} max={4} className="h-full">
            <article className="ny-card flex h-full flex-col p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <c.icon className="size-5" aria-hidden />
              </span>
              <h3 className="ny-title mt-4 text-xl leading-snug">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{c.body}</p>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
                <button type="button" onClick={c.onClick} disabled={c.disabled} className="ny-btn ny-btn-primary ny-btn-sm">
                  {c.key === "subscribe" ? <Copy className="size-4" aria-hidden /> : null}
                  {c.action}
                </button>
                {c.simulated && <SimulatedBadge label="Connects when wired" />}
              </div>
            </article>
          </TiltCard>
        ))}
      </div>

      <p className="rounded-2xl border border-hairline bg-surface-1 p-4 text-xs leading-relaxed text-text-tertiary">
        Subscribe URL (preview): <span className="font-mono text-text-secondary">{subscribeUrl}</span>. Phone numbers and RSVP answers are never included in calendar files.
      </p>
    </section>
  );
}
