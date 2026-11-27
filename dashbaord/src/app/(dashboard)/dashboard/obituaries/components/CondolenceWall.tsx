import { useMemo, useState } from "react";
import {
  MessageSquareHeart,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Condolence, Obituary } from "@/data/dashboard/obituaries";
import { cn } from "@/lib/format";
import { Candle, MemorialChip } from "./PinholeStage";

/* ═══════════════════════════════════════════════════════════════════════
   S5 · CONDOLENCE WALL
   What the family has written, newest first, across every notice. Members
   post; the family head moderates anything that needs it.
   ═══════════════════════════════════════════════════════════════════════ */

type WallFilter = "all" | "visible" | "pending";

export function CondolenceWall({
  obituaries,
  condolences,
  onOpen,
  onAction,
  canModerate,
}: {
  obituaries: Obituary[];
  condolences: Condolence[];
  onOpen: (id: string) => void;
  onAction: (act: string, id?: string) => void;
  canModerate: boolean;
}) {
  const [filter, setFilter] = useState<WallFilter>("all");
  const [person, setPerson] = useState<string>("all");

  const shown = useMemo(() => {
    return condolences
      .filter((c) =>
        filter === "all"
          ? true
          : filter === "pending"
            ? c.status === "pending"
            : c.status === "visible",
      )
      .filter((c) => person === "all" || c.authorId === person)
      .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  }, [condolences, filter, person]);

  const authors = useMemo(() => {
    const map = new Map<string, { id: string; name: string; count: number }>();
    condolences.forEach((c) => {
      const entry = map.get(c.authorId) ?? {
        id: c.authorId,
        name: c.authorName,
        count: 0,
      };
      entry.count += 1;
      map.set(c.authorId, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [condolences]);

  const pendingCount = condolences.filter((c) => c.status === "pending").length;

  return (
    <section className="ny-memorial-section" aria-labelledby="condolence-wall">
      <div className="ny-memorial-section-head">
        <div>
          <p className="ny-eyebrow">
            <Sparkles size={12} aria-hidden />
            S5 · THE CONDOLENCE WALL
          </p>
          <h2 id="condolence-wall">What the family has written</h2>
          <p className="ny-memorial-section-intro">
            Words are the cheapest thing we can give and the hardest to
            replace. Leave one on a notice, or read what is already there.
          </p>
        </div>
        <button
          type="button"
          className="ny-btn ny-btn-primary ny-btn-sm"
          onClick={() => onAction("condolence", obituaries[0]?.id)}
        >
          <Plus size={14} aria-hidden />
          Write a condolence
        </button>
      </div>

      <div className="ny-memorial-wall-controls">
        <div className="ny-memorial-filter-chips" role="group" aria-label="Filter condolences">
          {(
            [
              { id: "all" as const, label: "All", count: condolences.length },
              {
                id: "visible" as const,
                label: "Published",
                count: condolences.filter((c) => c.status === "visible").length,
              },
              { id: "pending" as const, label: "Awaiting review", count: pendingCount },
            ] as const
          ).map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={cn(
                "ny-memorial-filter-chip",
                filter === chip.id && "is-active",
              )}
              aria-pressed={filter === chip.id}
              onClick={() => setFilter(chip.id)}
            >
              {chip.label}
              <span className="ny-num">{chip.count}</span>
            </button>
          ))}
        </div>

        <select
          className="ny-memorial-select"
          aria-label="Filter by author"
          value={person}
          onChange={(event) => setPerson(event.target.value)}
        >
          <option value="all">Everyone</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name} ({author.count})
            </option>
          ))}
        </select>
      </div>

      <div className="ny-memorial-wall">
        {shown.length === 0 && (
          <p className="ny-memorial-quiet">
            Nothing here yet — try another filter, or write the first condolence
            yourself.
          </p>
        )}
        {shown.map((c) => {
          const obituary = obituaries.find((o) => o.id === c.obituaryId);
          return (
            <article
              key={c.id}
              className={cn(
                "ny-memorial-wall-card",
                c.status === "pending" && "is-pending",
              )}
            >
              <span className="ny-memorial-wall-avatar">
                {c.authorImage ? (
                  <img src={c.authorImage} alt="" loading="lazy" />
                ) : (
                  c.authorName
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                )}
              </span>
              <div className="ny-memorial-wall-body">
                <p className="ny-memorial-wall-head">
                  <b>{c.authorName}</b>
                  <MemorialChip tone="quiet">{c.relation}</MemorialChip>
                  {c.status === "pending" && (
                    <MemorialChip tone="gold">Awaiting review</MemorialChip>
                  )}
                </p>
                <p className="ny-memorial-wall-message">{c.message}</p>
                <p className="ny-memorial-wall-foot">
                  <button
                    type="button"
                    className="ny-text-link"
                    onClick={() => onOpen(c.obituaryId)}
                  >
                    <MessageSquareHeart size={12} aria-hidden />
                    On the notice of {obituary?.shortName ?? "—"}
                  </button>
                  <span className="ny-memorial-candlecount">
                    <Candle />
                    <span className="ny-num">{c.candles}</span>
                  </span>
                  {canModerate && c.status !== "visible" && (
                    <button
                      type="button"
                      className="ny-text-link"
                      onClick={() => onAction("moderate", c.id)}
                    >
                      <ShieldCheck size={12} aria-hidden />
                      Moderate
                    </button>
                  )}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
