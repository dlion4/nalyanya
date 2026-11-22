import { photoSrcSet } from "@/utils/photos";
import { ArrowRight, ArrowUpRight, MapPin, Plus } from "lucide-react";
import { useWorkspace } from "@/state/Workspace";
import { localDate } from "@/data/dashboard/command-center";
import { Avatar, EmptyState } from "@/components/shared/Primitives";

export function EventSpotlight() {
  const w = useWorkspace();
  const event = w.scopedEvents.find((e) => new Date(e.date) >= new Date());
  return (
    <section className="ny-panel ny-event-panel">
      <div className="ny-section-heading">
        <h2>Upcoming gathering</h2>
        <button
          aria-label="View all family events"
          className="ny-heading-arrow"
          onClick={() => w.go("/dashboard/events")}
        >
          <ArrowUpRight size={17} />
        </button>
      </div>
      {event ? (
        <>
          <button
            className="ny-event-photo"
            onClick={() => w.open("event", event.id)}
            title={`View ${event.title}`}
          >
            <img
              sizes="(max-width:640px) 89vw, 32vw"
              srcSet={photoSrcSet(event.image)}
              src={event.image}
              alt="A family sharing a joyful moment in traditional dress"
              loading="lazy"
            />
            <span className="ny-date-stamp">
              <small>{localDate(event.date, { month: "short" })}</small>
              <b>{localDate(event.date, { day: "2-digit" })}</b>
            </span>
            <span className="ny-photo-tag">
              <i />
              {event.type}
            </span>
          </button>
          <button
            className="ny-event-title"
            onClick={() => w.open("event", event.id)}
          >
            {event.title}
          </button>
          <p className="ny-place">
            <MapPin size={12} />
            {event.place} <span>&middot;</span>{" "}
            {localDate(event.date, {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }).toUpperCase()}{" "}
            EAT
          </p>
          <div className="ny-event-footer">
            <div className="ny-going">
              <span className="ny-avatar-stack">
                <Avatar name="Brian" image="/images/brian.webp" size={24} />
                <Avatar name="Faith" image="/images/faith.webp" size={24} />
                <Avatar name="Grace" image="/images/grace.webp" size={24} />
              </span>
              <span>
                {event.attending +
                  (w.local.rsvps[event.id] === "Going" ? 1 : 0)}{" "}
                going
              </span>
            </div>
            <button
              className="ny-text-link"
              onClick={() => w.open("event", event.id)}
            >
              {w.local.rsvps[event.id] === "Going" ? "Your RSVP" : "View event"}
              <ArrowRight size={13} />
            </button>
          </div>
        </>
      ) : (
        <>
          <EmptyState title="A little room in the calendar">
            No gatherings are scheduled for this branch yet.
          </EmptyState>
          <button
            className="ny-text-link mt-4"
            onClick={() => w.open("event-create")}
          >
            <Plus size={14} />
            Plan a gathering
          </button>
        </>
      )}
    </section>
  );
}
