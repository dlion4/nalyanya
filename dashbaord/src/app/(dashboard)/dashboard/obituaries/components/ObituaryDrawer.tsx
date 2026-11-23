import {
  BookOpen,
  Camera,
  ExternalLink,
  Flame,
  HandCoins,
  Heart,
  MapPin,
  MessageSquareHeart,
  Pencil,
  Plus,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ModalDialog } from "@/components/ui/ModalDialog";
import type { Condolence, Obituary } from "@/data/dashboard/obituaries";
import { BRANCH_BY_ID } from "@/data/family/branches";
import { longDate } from "@/lib/calendar";
import { cn } from "@/lib/format";
import { Candle, MemorialChip, MemorialTabPanel, MemorialTabs } from "./PinholeStage";

/* ═══════════════════════════════════════════════════════════════════════
   S3 · OBITUARY DETAIL DRAWER
   Six tabs: Notice · Life Story · Funeral · Condolences · Contributions ·
   Gallery. Opening the drawer writes to the URL, so a notice can be
   shared or reloaded exactly as it was left.
   ═══════════════════════════════════════════════════════════════════════ */

export const OBITUARY_TABS = [
  { id: "notice", label: "Notice", icon: <BookOpen size={13} aria-hidden /> },
  { id: "story", label: "Life story", icon: <Sparkles size={13} aria-hidden /> },
  { id: "funeral", label: "Funeral", icon: <MapPin size={13} aria-hidden /> },
  { id: "condolences", label: "Condolences", icon: <MessageSquareHeart size={13} aria-hidden /> },
  { id: "contributions", label: "Contributions", icon: <HandCoins size={13} aria-hidden /> },
  { id: "gallery", label: "Gallery", icon: <Camera size={13} aria-hidden /> },
] as const;

export function ObituaryDrawer({
  obituary,
  tab,
  onTab,
  onClose,
  onAction,
  condolences,
  candles,
  calm,
  canModerate,
}: {
  obituary?: Obituary;
  tab: string;
  onTab: (tab: string) => void;
  onClose: () => void;
  onAction: (act: string, id?: string) => void;
  condolences: Condolence[];
  candles: Record<string, number>;
  calm: boolean;
  canModerate: boolean;
}) {
  const visible = condolences.filter((c) => c.status === "visible");
  const pending = condolences.filter((c) => c.status === "pending");
  const lit = obituary ? (candles[obituary.id] ?? 0) + obituary.candlesLit : 0;

  return (
    <ModalDialog
      open={Boolean(obituary)}
      onClose={onClose}
      side="right"
      title={obituary?.name ?? "Notice"}
      description={
        obituary
          ? `${obituary.birthYear} — ${obituary.deathYear} · ${obituary.relationship}`
          : undefined
      }
    >
      {obituary && (
        <div className="ny-memorial-drawer">
          <div className="ny-memorial-drawer-head">
            <img
              className="ny-memorial-drawer-portrait"
              src={obituary.portrait}
              alt={obituary.portraitAlt}
              loading="lazy"
            />
            <div className="ny-memorial-drawer-meta">
              <MemorialChip tone="sage">
                {BRANCH_BY_ID[obituary.branchId]?.shortName ??
                  obituary.branchId}
              </MemorialChip>
              <MemorialChip tone="quiet">Generation {obituary.generation}</MemorialChip>
              <MemorialChip tone="gold" icon={<Candle lit={lit > 0} />}>
                {lit.toLocaleString("en-KE")} candles
              </MemorialChip>
              <p className="ny-memorial-drawer-published">
                Published {longDate(obituary.publishedAt)}
              </p>
            </div>
          </div>

          <MemorialTabs
            items={OBITUARY_TABS.map((t) => ({
              ...t,
              count:
                t.id === "condolences"
                  ? visible.length
                  : t.id === "gallery"
                    ? obituary.gallery.length
                    : undefined,
            }))}
            value={tab}
            onChange={onTab}
            className="ny-memorial-drawer-tabs"
          />

          {/* ── Notice ─────────────────────────────────────────────── */}
          <MemorialTabPanel id="notice" active={tab}>
            <div className="ny-memorial-notice">
              {obituary.notice.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>

            <blockquote className="ny-memorial-statement-quote">
              <Heart size={14} aria-hidden />
              <p>{obituary.familyStatement}</p>
            </blockquote>

            <dl className="ny-memorial-facts">
              <div>
                <dt>Born</dt>
                <dd>
                  {longDate(obituary.born)} · {obituary.age} years
                </dd>
              </div>
              <div>
                <dt>Died</dt>
                <dd>{longDate(obituary.died)}</dd>
              </div>
              <div>
                <dt>Next anniversary</dt>
                <dd>
                  {obituary.anniversaryLabel} · {obituary.anniversary}
                </dd>
              </div>
              <div>
                <dt>Record</dt>
                <dd className="ny-num">{obituary.id}</dd>
              </div>
            </dl>

            <div className="ny-memorial-tagrow">
              {obituary.tags.map((tag) => (
                <MemorialChip key={tag} tone="quiet">
                  #{tag}
                </MemorialChip>
              ))}
            </div>

            <div className="ny-memorial-drawer-actions">
              <button
                type="button"
                className="ny-btn ny-btn-primary ny-btn-sm"
                onClick={() => onAction("tribute", obituary.id)}
              >
                <Flame size={14} aria-hidden />
                Light a candle
              </button>
              <button
                type="button"
                className="ny-btn ny-btn-ghost ny-btn-sm"
                onClick={() => onAction("condolence", obituary.id)}
              >
                <MessageSquareHeart size={14} aria-hidden />
                Write a condolence
              </button>
              <button
                type="button"
                className="ny-btn ny-btn-ghost ny-btn-sm"
                onClick={() => onAction("share", obituary.id)}
              >
                <Share2 size={14} aria-hidden />
                Copy the link
              </button>
              <button
                type="button"
                className="ny-btn ny-btn-ghost ny-btn-sm"
                onClick={() => onAction("statement", obituary.id)}
              >
                <Pencil size={14} aria-hidden />
                Edit the statement
              </button>
            </div>
          </MemorialTabPanel>

          {/* ── Life story ─────────────────────────────────────────── */}
          <MemorialTabPanel id="story" active={tab}>
            <ol className="ny-memorial-timeline">
              {obituary.lifeStory.map((moment) => (
                <li key={`${moment.year}-${moment.title}`}>
                  <span className="ny-memorial-timeline-year ny-num">
                    {moment.year}
                  </span>
                  <span className="ny-memorial-timeline-dot" aria-hidden />
                  <div>
                    <h4>{moment.title}</h4>
                    <p>{moment.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <button
              type="button"
              className="ny-btn ny-btn-ghost ny-btn-sm"
              onClick={() => onAction("story", obituary.id)}
            >
              <Pencil size={14} aria-hidden />
              Add a moment to the life story
            </button>
          </MemorialTabPanel>

          {/* ── Funeral ────────────────────────────────────────────── */}
          <MemorialTabPanel id="funeral" active={tab}>
            <div className="ny-memorial-funeral">
              <div className="ny-memorial-funeral-when">
                <span className="ny-memorial-funeral-day ny-num">
                  {obituary.funeral.date.slice(8, 10)}
                </span>
                <span>
                  <b>{longDate(obituary.funeral.date)}</b>
                  <small>
                    {obituary.funeral.time} EAT · {obituary.funeral.venue}
                  </small>
                </span>
              </div>

              <div className="ny-memorial-map" role="img" aria-label={`Map of ${obituary.funeral.venue}`}>
                <svg viewBox="0 0 320 150" aria-hidden>
                  <defs>
                    <pattern id="mem-grid" width="26" height="26" patternUnits="userSpaceOnUse">
                      <path
                        d="M26 0H0V26"
                        fill="none"
                        stroke="currentColor"
                        strokeOpacity=".12"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="320" height="150" fill="url(#mem-grid)" />
                  <path
                    d="M-10 118 C60 96, 96 128, 160 92 S258 44, 330 62"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity=".28"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M58 -10 C70 40, 46 78, 78 160"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity=".2"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <circle cx="176" cy="74" r="9" fill="#d4a437" />
                  <circle cx="176" cy="74" r="18" fill="none" stroke="#d4a437" strokeOpacity=".45" />
                </svg>
                <span className="ny-memorial-map-label">
                  <MapPin size={13} aria-hidden />
                  {obituary.funeral.venue}, {obituary.funeral.town}
                </span>
                <span className="ny-memorial-map-coords ny-num">
                  {obituary.funeral.coordinates.lat.toFixed(4)},{" "}
                  {obituary.funeral.coordinates.lng.toFixed(4)}
                </span>
              </div>

              <p className="ny-memorial-burial">
                <MapPin size={13} aria-hidden />
                {obituary.funeral.burial}
              </p>

              <a
                className="ny-btn ny-btn-ghost ny-btn-sm"
                href={`https://www.google.com/maps/search/?api=1&query=${obituary.funeral.coordinates.lat},${obituary.funeral.coordinates.lng}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                <ExternalLink size={14} aria-hidden />
                Open the venue in maps
              </a>

              <h4 className="ny-memorial-subhead">Order of service</h4>
              <ol className="ny-memorial-program">
                {obituary.funeral.program.map((item) => (
                  <li key={`${item.time}-${item.title}`}>
                    <span className="ny-memorial-program-time ny-num">
                      {item.time}
                    </span>
                    <span>
                      <b>{item.title}</b>
                      <small>{item.detail}</small>
                    </span>
                  </li>
                ))}
              </ol>

              <button
                type="button"
                className="ny-btn ny-btn-ghost ny-btn-sm"
                onClick={() => onAction("funeral", obituary.id)}
              >
                <Pencil size={14} aria-hidden />
                Edit the funeral details
              </button>
            </div>
          </MemorialTabPanel>

          {/* ── Condolences ────────────────────────────────────────── */}
          <MemorialTabPanel id="condolences" active={tab}>
            <div className="ny-memorial-condolences">
              {visible.length === 0 && (
                <p className="ny-memorial-quiet">
                  No condolences yet. Be the first to write one.
                </p>
              )}
              {visible.map((c) => (
                <article key={c.id} className="ny-memorial-condolence">
                  <span className="ny-memorial-condolence-avatar">
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
                  <div>
                    <p className="ny-memorial-condolence-head">
                      <b>{c.authorName}</b>
                      <span>{c.relation}</span>
                      <time dateTime={c.postedAt}>
                        {new Date(c.postedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "Africa/Nairobi",
                        })}
                      </time>
                    </p>
                    <p className="ny-memorial-condolence-body">{c.message}</p>
                    <p className="ny-memorial-condolence-foot">
                      <span className="ny-memorial-candlecount">
                        <Candle />
                        <span className="ny-num">{c.candles}</span>
                      </span>
                      {canModerate && (
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
              ))}

              {canModerate && pending.length > 0 && (
                <div className="ny-memorial-pending">
                  <p className="ny-eyebrow">AWAITING REVIEW · {pending.length}</p>
                  {pending.map((c) => (
                    <div key={c.id} className="ny-memorial-pending-row">
                      <span>
                        <b>{c.authorName}</b>
                        <small>{c.message}</small>
                      </span>
                      <span className="ny-memorial-pending-actions">
                        <button
                          type="button"
                          className="ny-btn ny-btn-ghost ny-btn-sm"
                          onClick={() => onAction("moderate", c.id)}
                        >
                          Review
                        </button>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="ny-btn ny-btn-primary ny-btn-sm"
                onClick={() => onAction("condolence", obituary.id)}
              >
                <Plus size={14} aria-hidden />
                Write a condolence
              </button>
            </div>
          </MemorialTabPanel>

          {/* ── Contributions ──────────────────────────────────────── */}
          <MemorialTabPanel id="contributions" active={tab}>
            {obituary.causeId ? (
              <div className="ny-memorial-cause">
                <div className="ny-memorial-cause-head">
                  <span className="ny-icon-box tone-gold">
                    <HandCoins size={16} strokeWidth={1.65} />
                  </span>
                  <span>
                    <b>{obituary.causeTitle}</b>
                    <small className="ny-num">{obituary.causeId}</small>
                  </span>
                </div>
                <div className="ny-memorial-cause-progress">
                  <span
                    className="ny-progress-track"
                    aria-hidden
                  >
                    <i
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round((obituary.raised / obituary.target) * 100),
                        )}%`,
                      }}
                    />
                  </span>
                  <p>
                    <b className="ny-num">
                      KES {obituary.raised.toLocaleString("en-KE")}
                    </b>{" "}
                    raised of{" "}
                    <span className="ny-num">
                      KES {obituary.target.toLocaleString("en-KE")}
                    </span>
                  </p>
                </div>
                <div className="ny-memorial-drawer-actions">
                  <Link
                    className="ny-btn ny-btn-primary ny-btn-sm"
                    to="/dashboard/contributions"
                    search={{ contribute: obituary.causeId }}
                  >
                    <Send size={14} aria-hidden />
                    Contribute to this cause
                  </Link>
                  <button
                    type="button"
                    className="ny-btn ny-btn-ghost ny-btn-sm"
                    onClick={() => onAction("cause", obituary.id)}
                  >
                    <HandCoins size={14} aria-hidden />
                    Link a contribution
                  </button>
                </div>
                <p className="ny-memorial-quiet">
                  Contributions post to the family ledger in the local
                  simulation. M-Pesa settlement connects when the backend is
                  wired.
                </p>
              </div>
            ) : (
              <div className="ny-memorial-cause is-empty">
                <p className="ny-memorial-quiet">
                  No contribution cause is linked to this notice yet.
                </p>
                <button
                  type="button"
                  className="ny-btn ny-btn-primary ny-btn-sm"
                  onClick={() => onAction("cause", obituary.id)}
                >
                  <HandCoins size={14} aria-hidden />
                  Link a contribution cause
                </button>
              </div>
            )}
          </MemorialTabPanel>

          {/* ── Gallery ────────────────────────────────────────────── */}
          <MemorialTabPanel id="gallery" active={tab}>
            <div className="ny-memorial-gallery">
              {obituary.gallery.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  className="ny-memorial-gallery-tile"
                  onClick={() => onAction("lightbox", `${obituary.id}:${photo.id}`)}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <span>
                    <b>{photo.caption}</b>
                    <small>
                      {photo.year} · {photo.credit}
                    </small>
                  </span>
                </button>
              ))}
              <Link
                className="ny-memorial-gallery-more"
                to="/dashboard/gallery"
                search={{ album: `memorial-${obituary.id}` }}
              >
                <Camera size={14} aria-hidden />
                Open the full memorial album
              </Link>
            </div>
          </MemorialTabPanel>
        </div>
      )}
    </ModalDialog>
  );
}

export const drawerTabId = (
  obituary: Obituary | undefined,
  photoId?: string,
): string => (photoId ? "gallery" : "notice");
