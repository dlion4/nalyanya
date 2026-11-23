import { BellRing, CalendarHeart, Check, Megaphone } from "lucide-react";
import type { Anniversary, Obituary } from "@/data/dashboard/obituaries";
import { cn } from "@/lib/format";
import { Candle, MemorialChip } from "./PinholeStage";

/* ═══════════════════════════════════════════════════════════════════════
   S6 · ANNIVERSARY REMINDERS
   Passing anniversaries surface themselves. A reminder can be set quietly
   for yourself, or the family can be reminded together.
   ═══════════════════════════════════════════════════════════════════════ */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function AnniversaryReminders({
  anniversaries,
  obituaries,
  reminders,
  onToggle,
  onBroadcast,
  onOpen,
}: {
  anniversaries: Anniversary[];
  obituaries: Obituary[];
  reminders: Record<string, boolean>;
  onToggle: (id: string, next: boolean) => void;
  onBroadcast: (id: string) => void;
  onOpen: (id: string) => void;
}) {
  const upcoming = [...anniversaries].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  return (
    <section className="ny-memorial-section" aria-labelledby="anniversaries">
      <div className="ny-memorial-section-head">
        <div>
          <p className="ny-eyebrow">
            <CalendarHeart size={12} aria-hidden />
            S6 · ANNIVERSARY REMINDERS
          </p>
          <h2 id="anniversaries">The days that come back</h2>
          <p className="ny-memorial-section-intro">
            The anniversaries of the people we remember. Set a quiet reminder
            for yourself, or bring the whole family back to the story.
          </p>
        </div>
        <button
          type="button"
          className="ny-btn ny-btn-ghost ny-btn-sm"
          onClick={() => upcoming[0] && onBroadcast(upcoming[0].obituaryId)}
        >
          <Megaphone size={14} aria-hidden />
          Plan a remembrance broadcast
        </button>
      </div>

      <div className="ny-memorial-anniversaries">
        {upcoming.map((a) => {
          const obituary = obituaries.find((o) => o.id === a.obituaryId);
          const [, month, day] = a.date.split("-");
          const on = reminders[a.obituaryId] ?? a.reminderSet;
          return (
            <article key={a.obituaryId} className="ny-memorial-anniversary">
              <div className="ny-memorial-anniversary-date">
                <span className="ny-memorial-anniversary-day ny-num">
                  {day}
                </span>
                <span className="ny-memorial-anniversary-month">
                  {MONTHS[Number(month) - 1]}
                </span>
                <span className="ny-memorial-anniversary-candle">
                  <Candle />
                </span>
              </div>
              <div className="ny-memorial-anniversary-body">
                <MemorialChip tone="gold">
                  {a.kind === "death" ? `${a.years} years since` : "Birthday"}
                </MemorialChip>
                <h3>{a.label}</h3>
                <p>
                  {obituary?.anniversaryLabel ?? "Remembrance"} ·{" "}
                  {a.date}
                </p>
                <div className="ny-memorial-anniversary-actions">
                  <button
                    type="button"
                    className={cn(
                      "ny-btn ny-btn-sm",
                      on ? "ny-btn-gold" : "ny-btn-ghost",
                    )}
                    aria-pressed={on}
                    onClick={() => onToggle(a.obituaryId, !on)}
                  >
                    {on ? (
                      <>
                        <Check size={13} aria-hidden />
                        Reminder set
                      </>
                    ) : (
                      <>
                        <BellRing size={13} aria-hidden />
                        Remind me
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="ny-btn ny-btn-ghost ny-btn-sm"
                    onClick={() => onOpen(a.obituaryId)}
                  >
                    Open the notice
                  </button>
                  <button
                    type="button"
                    className="ny-btn ny-btn-quiet ny-btn-sm"
                    onClick={() => onBroadcast(a.obituaryId)}
                  >
                    <Megaphone size={13} aria-hidden />
                    Tell the family
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
