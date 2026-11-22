import { photoSrcSet } from "@/utils/photos";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  MapPin,
  Network,
  Search,
  UsersRound,
} from "lucide-react";
import {
  alerts,
  branches,
  chamas,
  dateFromToday,
  family,
  localDate,
  members,
  memories,
} from "@/data/dashboard/command-center";
import { allNav, dashPath } from "@/data/dashboard/navigation";
import { Avatar, EmptyState, IconBox } from "@/components/shared/Primitives";
import { IrisPhoto } from "@/components/media/IrisPhoto";
import { alertIcons } from "@/components/dashboard/DashboardSections";
import { BrandMark } from "@/components/shared/Brand";
import { useWorkspace } from "@/state/Workspace";

export function FamilyPicker() {
  const w = useWorkspace();
  return (
    <>
      <div className="ny-family-intro">
        <BrandMark size={42} />
        <div>
          <strong>The Nalyanya family</strong>
          <p>Rooted in Mzee Victor Nalyanya</p>
        </div>
      </div>
      <p className="ny-modal-intro">
        Choose a branch to focus the figures, people, and gatherings in your
        workspace.
      </p>
      <button
        className={`ny-select-row ${!w.branch ? "selected" : ""}`}
        onClick={() => w.chooseBranch()}
      >
        <IconBox icon={Network} />
        <span>
          <strong>All family branches</strong>
          <small>248 members across 12 branches</small>
        </span>
        {!w.branch && <Check size={16} />}
      </button>
      <div className="ny-branch-choices">
        {branches.map((b) => (
          <button
            key={b.id}
            className={`ny-select-row ${w.branch?.id === b.id ? "selected" : ""}`}
            onClick={() => w.chooseBranch(b.id)}
          >
            <i style={{ background: b.color }} />
            <span>
              <strong>{b.name}</strong>
              <small>{b.members} family members</small>
            </span>
            {w.branch?.id === b.id ? (
              <Check size={15} />
            ) : (
              <ChevronRight size={13} />
            )}
          </button>
        ))}
      </div>
    </>
  );
}
export function MemberDirectory({
  professions = false,
}: {
  professions?: boolean;
}) {
  const w = useWorkspace();
  const [q, setQ] = useState("");
  const filtered = members.filter(
    (m) =>
      (!w.branch || m.branch === w.branch.id) &&
      `${m.name} ${m.profession} ${m.branch}`
        .toLowerCase()
        .includes(q.toLowerCase()),
  );
  return (
    <div>
      <label className="ny-search-input">
        <Search size={17} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            professions
              ? "Search names or professions..."
              : "Find a family member..."
          }
          aria-label="Search family members"
        />
      </label>
      <p className="ny-list-caption">
        {filtered.length} featured profiles <span>&middot;</span>{" "}
        {w.branch?.name || "All branches"}
      </p>
      <div className="ny-member-list">
        {filtered.map((m, i) => (
          <button
            key={m.id}
            className="ny-directory-row"
            onClick={() => w.open("member", m.id)}
          >
            <Avatar name={m.name} image={m.image} color={i} size={39} />
            <span>
              <strong>{m.name}</strong>
              <small>
                {professions ? m.profession : `Generation ${m.generation}`}{" "}
                &middot; {branches.find((b) => b.id === m.branch)?.name}
              </small>
            </span>
            <ArrowUpRight size={14} />
          </button>
        ))}
      </div>
      {!filtered.length && (
        <EmptyState title="No matching profiles">
          Try another name, profession, or family branch.
        </EmptyState>
      )}
    </div>
  );
}
export function EventsList({ calendar = false }: { calendar?: boolean }) {
  const w = useWorkspace();
  const [filter, setFilter] = useState("All gatherings");
  const list = w.scopedEvents.filter(
    (e) => filter !== "My RSVPs" || !!w.local.rsvps[e.id],
  );
  return (
    <>
      <div className="ny-tab-strip">
        {["All gatherings", "My RSVPs"].map((f) => (
          <button
            className={filter === f ? "active" : ""}
            key={f}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      {list.map((e) => (
        <button
          className="ny-event-list-row"
          key={e.id}
          onClick={() => w.open("event", e.id)}
        >
          <span className="ny-list-date">
            <small>{localDate(e.date, { month: "short" })}</small>
            <b>{localDate(e.date, { day: "2-digit" })}</b>
          </span>
          <span>
            <strong>{e.title}</strong>
            <small>
              <MapPin size={11} />
              {e.place}
            </small>
            <em>
              {localDate(e.date, { hour: "2-digit", minute: "2-digit" })} EAT
              &middot; Hosted by {e.host}
            </em>
          </span>
          {w.local.rsvps[e.id] && <i>{w.local.rsvps[e.id]}</i>}
          <ChevronRight size={14} />
        </button>
      ))}
      {!list.length && (
        <EmptyState
          title={
            filter === "My RSVPs"
              ? "Your calendar is open"
              : "No gatherings for this branch"
          }
        >
          Open a family gathering to save your RSVP, or plan a new one.
        </EmptyState>
      )}
      {calendar && (
        <>
          <h3 className="ny-subheading">Savings circle dates</h3>
          {chamas.map((c) => (
            <button
              key={c.id}
              className="ny-list-row"
              onClick={() => w.open("chama", c.id)}
            >
              <IconBox icon={Clock3} tone="gold" />
              <span className="ny-row-copy">
                <strong>{c.name} rotation</strong>
                <small>
                  {localDate(dateFromToday(c.days), {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  &middot; {c.next}
                </small>
              </span>
              <ChevronRight size={14} />
            </button>
          ))}
        </>
      )}
    </>
  );
}
export function MemoryViewer({ id }: { id?: string }) {
  const w = useWorkspace();
  const idx = Math.max(
    0,
    memories.findIndex((m) => m.id === id),
  );
  const memory = memories[idx];
  return (
    <div className="ny-memory-viewer">
      <IrisPhoto
        slides={memories}
        initial={idx}
        onChange={(i) => w.updateQuery({ id: memories[i].id }, true)}
        className="ny-memory-lightbox"
        priority
      />
      <div className="ny-memory-view-meta">
        <span>
          <MapPin size={12} />
          {memory.place} &middot; {memory.year}
        </span>
        <button
          aria-pressed={w.local.saved.includes(memory.id)}
          onClick={() => w.toggleSaved(memory.id)}
        >
          <Bookmark
            size={15}
            fill={w.local.saved.includes(memory.id) ? "currentColor" : "none"}
          />
          {w.local.saved.includes(memory.id) ? "Saved" : "Save memory"}
        </button>
      </div>
      <h3>{memory.title}</h3>
      <p>{memory.caption}</p>
      <p className="ny-photo-credit">
        Illustrative family photograph &middot; {memory.credit}
      </p>
    </div>
  );
}
export function GalleryGrid() {
  const w = useWorkspace();
  const [saved, setSaved] = useState(false);
  const list = memories.filter((m) => !saved || w.local.saved.includes(m.id));
  return (
    <>
      <div className="ny-tab-strip">
        <button
          className={!saved ? "active" : ""}
          onClick={() => setSaved(false)}
        >
          All photographs
        </button>
        <button
          className={saved ? "active" : ""}
          onClick={() => setSaved(true)}
        >
          Saved memories ({w.local.saved.length})
        </button>
      </div>
      <div className="ny-gallery-grid">
        {list.map((m) => (
          <button key={m.id} onClick={() => w.open("memory", m.id)}>
            <img
              sizes="(max-width:640px) 72vw, 29vw"
              srcSet={photoSrcSet(m.image)}
              src={m.image}
              alt={m.alt}
              loading="lazy"
            />
            <span>
              <strong>{m.title}</strong>
              <small>
                {m.place} &middot; {m.year}
              </small>
            </span>
          </button>
        ))}
      </div>
      {!list.length && (
        <EmptyState title="Keep a favourite moment">
          Open any photograph and choose Save memory to find it here.
        </EmptyState>
      )}
    </>
  );
}
export function NotificationsList() {
  const w = useWorkspace();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const visible = alerts.filter(
    (a) =>
      !w.local.dismissed.includes(a.id) &&
      (!onlyUnread || !w.local.read.includes(a.id)),
  );
  return (
    <>
      <div className="ny-notification-controls">
        <button
          className="ny-text-link"
          onClick={() => setOnlyUnread(!onlyUnread)}
        >
          {onlyUnread ? "Show all updates" : "Show unread only"}
        </button>
        <button
          className="ny-text-link"
          onClick={() => w.markRead(alerts.map((a) => a.id))}
        >
          <CheckCheck size={14} />
          Mark all read
        </button>
      </div>
      {visible.map((a) => (
        <button
          className={`ny-notification-item ${w.local.read.includes(a.id) ? "is-read" : ""}`}
          key={a.id}
          onClick={() => {
            w.markRead([a.id]);
            w.open("alert", a.id);
          }}
        >
          <IconBox
            icon={alertIcons[a.kind]}
            tone={a.critical ? "clay" : "sage"}
          />
          <span>
            <strong>{a.title}</strong>
            <p>{a.text}</p>
            <small>
              {a.time}
              {a.critical ? " / Needs attention" : ""}
            </small>
          </span>
          {!w.local.read.includes(a.id) && <i />}
        </button>
      ))}
      {!visible.length && (
        <EmptyState title="You are all caught up">
          There are no unread updates in this view.
        </EmptyState>
      )}
    </>
  );
}
export function WorkspaceSearch() {
  const w = useWorkspace();
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const areas = allNav
    .filter((a) => a.label.toLowerCase().includes(needle))
    .slice(0, needle ? 6 : 5);
  const people = members
    .filter((m) => `${m.name} ${m.profession}`.toLowerCase().includes(needle))
    .slice(0, 3);
  const gatherings = w.allEvents
    .filter((e) => e.title.toLowerCase().includes(needle))
    .slice(0, 2);
  const photos = memories
    .filter((m) => m.title.toLowerCase().includes(needle))
    .slice(0, 2);
  return (
    <div className="ny-search-results">
      <label className="ny-search-input">
        <Search size={18} />
        <input
          data-autofocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search people, pages, events, memories..."
          aria-label="Search everything"
        />
        <kbd>ESC</kbd>
      </label>
      {areas.length > 0 && (
        <>
          <h3>{needle ? "Workspace pages" : "Go to a page"}</h3>
          {areas.map((a) => (
            <button key={a.slug} onClick={() => w.go(dashPath(a.slug))}>
              <a.icon size={16} />
              <span>{a.label}</span>
              <ArrowRight size={13} />
            </button>
          ))}
        </>
      )}
      {needle && people.length > 0 && (
        <>
          <h3>Family members</h3>
          {people.map((m) => (
            <button key={m.id} onClick={() => w.open("member", m.id)}>
              <UsersRound size={16} />
              <span>{m.name}</span>
              <ArrowRight size={13} />
            </button>
          ))}
        </>
      )}
      {needle && gatherings.length > 0 && (
        <>
          <h3>Gatherings</h3>
          {gatherings.map((e) => (
            <button key={e.id} onClick={() => w.open("event", e.id)}>
              <CalendarDays size={16} />
              <span>{e.title}</span>
              <ArrowRight size={13} />
            </button>
          ))}
        </>
      )}
      {needle && photos.length > 0 && (
        <>
          <h3>Photographs</h3>
          {photos.map((m) => (
            <button key={m.id} onClick={() => w.open("memory", m.id)}>
              <Bookmark size={16} />
              <span>{m.title}</span>
              <ArrowRight size={13} />
            </button>
          ))}
        </>
      )}
      {!areas.length &&
        !people.length &&
        !gatherings.length &&
        !photos.length && (
          <EmptyState title="No matches just yet">
            Try a surname, a gathering name, or a workspace page.
          </EmptyState>
        )}
      <p className="ny-search-footnote">
        Searches this local family workspace. {family.branches} branches, one
        home.
      </p>
    </div>
  );
}
