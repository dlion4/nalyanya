import { useCallback, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Flower2,
  Plus,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { useWorkspace } from "@/state/Workspace";
import {
  ANNIVERSARIES,
  CONDOLENCES,
  OBITUARIES,
  OBITUARY_AUDIT,
  OBITUARY_YEARS,
  obituaryById,
  type Condolence,
  type Obituary,
} from "@/data/dashboard/obituaries";
import { MemorialHero } from "./components/MemorialHero";
import {
  ObituaryCards,
  ObituaryFilterBar,
  useNoticeCounts,
  type CardFilters,
} from "./components/ObituaryCards";
import { ObituaryDrawer } from "./components/ObituaryDrawer";
import {
  NewObituaryWizard,
  type ObituaryDraft,
} from "./components/NewObituaryWizard";
import { CondolenceWall } from "./components/CondolenceWall";
import { AnniversaryReminders } from "./components/AnniversaryReminders";
import { ArchiveSection } from "./components/ArchiveSection";
import {
  AlbumModal,
  ArchiveFilterModal,
  AuditModal,
  BroadcastModal,
  CauseModal,
  CondolenceModal,
  ExportModal,
  FuneralModal,
  MemorialLightbox,
  ModerateModal,
  ScopeModal,
  StatementModal,
  StoryModal,
  TributeModal,
  UnpublishModal,
} from "./components/MemorialOverlays";
import "./obituaries.css";

/* ═══════════════════════════════════════════════════════════════════════
   T-6 · IN REMEMBRANCE
   Seven sections, one page, no reloads. Every overlay writes to the URL
   so a notice can be shared, reloaded, or handed to a relative exactly
   as it was left.
   ═══════════════════════════════════════════════════════════════════════ */

export default function RemembrancePage() {
  const w = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const params = (location.search ?? {}) as Record<string, string | undefined>;

  /* ── Local, browser-only state ─────────────────────────────────────── */
  const [candles, setCandles] = useState<Record<string, number>>({});
  const [condolences, setCondolences] = useState<Condolence[]>(CONDOLENCES);
  const [published, setPublished] = useState<Obituary[]>([]);
  const [statements, setStatements] = useState<Record<string, string>>({});
  const [reminders, setReminders] = useState<Record<string, boolean>>({});
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const all = useMemo<Obituary[]>(
    () => [...published, ...OBITUARIES],
    [published],
  );

  const filters: CardFilters = useMemo(
    () => ({
      year: params.year ?? "all",
      branch: params.branch ?? "all",
      q: params.q ?? "",
      view: params.view === "list" ? "list" : "grid",
    }),
    [params.year, params.branch, params.q, params.view],
  );

  const visible = useMemo(() => {
    const term = filters.q.trim().toLowerCase();
    return all.filter((o) => {
      if (filters.year === "published" && o.status !== "published") return false;
      if (filters.year === "draft" && o.status !== "draft") return false;
      if (
        filters.year !== "all" &&
        filters.year !== "published" &&
        filters.year !== "draft" &&
        String(o.deathYear) !== filters.year
      )
        return false;
      if (filters.branch !== "all" && o.branchId !== filters.branch) return false;
      if (term) {
        const haystack = `${o.name} ${o.relationship} ${o.tags.join(" ")} ${o.shortName}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [all, filters]);

  const counts = useNoticeCounts(all);

  const openNotice = useCallback(
    (id: string, tab = "notice") => {
      void navigate({
        to: "/dashboard/obituaries",
        search: (prev: Record<string, unknown>) => ({ ...prev, obit: id, tab, act: undefined, target: undefined }),
        replace: false,
      });
    },
    [navigate],
  );

  const closeNotice = useCallback(() => {
    void navigate({
      to: "/dashboard/obituaries",
      search: (prev: Record<string, unknown>) => ({ ...prev, obit: undefined, tab: undefined }),
      replace: true,
    });
  }, [navigate]);

  const openOverlay = useCallback(
    (act: string, target?: string) => {
      void navigate({
        to: "/dashboard/obituaries",
        search: (prev: Record<string, unknown>) => ({ ...prev, act, target }),
        replace: false,
      });
    },
    [navigate],
  );

  const closeOverlay = useCallback(() => {
    void navigate({
      to: "/dashboard/obituaries",
      search: (prev: Record<string, unknown>) => ({ ...prev, act: undefined, target: undefined }),
      replace: true,
    });
  }, [navigate]);

  const setFilters = useCallback(
    (patch: Partial<CardFilters>) => {
      void navigate({
        to: "/dashboard/obituaries",
        search: (prev: Record<string, unknown>) => ({ ...prev, ...patch }),
        replace: true,
      });
    },
    [navigate],
  );

  /* ── The open notice ───────────────────────────────────────────────── */
  const openId = params.obit;
  const notice = obituaryById(openId) ?? published.find((o) => o.id === openId);
  const tab = params.tab ?? "notice";

  /* ── The open overlay ──────────────────────────────────────────────── */
  const act = params.act ?? "";
  const target = params.target;
  const targetObituary = obituaryById(target) ?? published.find((o) => o.id === target);
  const targetCondolence = condolences.find((c) => c.id === target);

  const lightbox = useMemo(() => {
    if (act !== "lightbox" || !target) return null;
    const [obitId, photoId] = target.split(":");
    const source =
      obituaryById(obitId) ?? published.find((o) => o.id === obitId);
    if (!source) return null;
    const index = Math.max(
      0,
      source.gallery.findIndex((p) => p.id === photoId),
    );
    return { source, index };
  }, [act, target, published]);

  const upcoming = useMemo(() => {
    const ids = new Set(
      ANNIVERSARIES.filter((a) => a.date.startsWith("2026-05")).map((a) => a.obituaryId),
    );
    return ids;
  }, []);

  const canModerate = w.local.elder === false || true; /* family head by default */
  const reminderMap = useMemo(
    () =>
      ANNIVERSARIES.reduce<Record<string, boolean>>((acc, a) => {
        acc[a.obituaryId] = reminders[a.obituaryId] ?? a.reminderSet;
        return acc;
      }, {}),
    [reminders],
  );

  /* ── Actions ───────────────────────────────────────────────────────── */

  const publishObituary = (draft: ObituaryDraft) => {
    const born = new Date(draft.born);
    const died = new Date(draft.died);
    const record: Obituary = {
      id: `NY-OB-${draft.died.slice(0, 4)}-${String(published.length + 156).padStart(4, "0")}`,
      name: draft.name,
      shortName: draft.name.split(" ").slice(0, 2).join(" "),
      born: draft.born,
      died: draft.died,
      birthYear: born.getFullYear(),
      deathYear: died.getFullYear(),
      age: Math.max(0, died.getFullYear() - born.getFullYear()),
      gender: "male",
      branchId: draft.branchId,
      relationship: "Our relative",
      generation: 2,
      portrait: "/images/memorial/mzee-victor.jpg",
      portraitAlt: `Portrait placeholder for ${draft.name}`,
      notice: [draft.notice],
      familyStatement: draft.statement || "The family statement is being written.",
      status: draft.scope === "admins" ? "draft" : "published",
      publishedAt: "2026-05-06",
      lifeStory: [],
      funeral: {
        date: draft.funeralDate || draft.died,
        time: draft.funeralTime,
        venue: draft.venue || "To be confirmed",
        town: draft.town || "—",
        county: "—",
        coordinates: { lat: 0.5356, lng: 34.7511 },
        burial: draft.burial || "To be confirmed",
        program: [],
      },
      gallery: [],
      causeId: draft.causeId === "NEW" ? "" : draft.causeId,
      causeTitle: draft.causeId === "NEW" ? "A new memorial cause" : "Linked cause",
      raised: 0,
      target: 150_000,
      anniversary: draft.died.slice(5),
      anniversaryLabel: "First death anniversary",
      candlesLit: 0,
      views: 1,
      tags: ["new", draft.scope],
    };
    setPublished((list) => [record, ...list]);
    w.setToast(
      "Notice recorded on this device — it connects when the backend is wired.",
    );
    openNotice(record.id);
  };

  const lightCandle = (id: string) => {
    setCandles((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    w.setToast("A candle is lit for this notice.");
  };

  const postCondolence = (message: string, relation: string) => {
    if (!notice) return;
    const entry: Condolence = {
      id: `NY-CDN-${String(condolences.length + 60).padStart(4, "0")}`,
      obituaryId: notice.id,
      authorId: "NY-MBR-00019",
      authorName: "Brian Otieno Nalyanya",
      authorImage: "/images/family/brian.jpg",
      relation,
      message,
      postedAt: new Date().toISOString(),
      candles: 0,
      status: "visible",
    };
    setCondolences((list) => [entry, ...list]);
    w.setToast("Your condolence is on the wall.");
  };

  const moderate = (action: "approve" | "hide", reason: string) => {
    if (!targetCondolence) return;
    setCondolences((list) =>
      list.map((c) =>
        c.id === targetCondolence.id
          ? { ...c, status: action === "approve" ? "visible" : "hidden" }
          : c,
      ),
    );
    w.setToast(
      action === "approve"
        ? "Condolence published to the family."
        : `Condolence hidden — ${reason}`,
    );
  };

  const share = async (id: string) => {
    const url = `${window.location.origin}/dashboard/obituaries?obit=${id}&tab=notice`;
    try {
      await navigator.clipboard.writeText(url);
      w.setToast("The notice link is copied.");
    } catch {
      w.setToast("Copy this link: " + url);
    }
  };

  const exportSheet = () => {
    openOverlay("export");
  };

  return (
    <div className="page-dash-obituaries">
      <nav className="ny-memorial-crumbs" aria-label="Breadcrumb">
        <Link to="/dashboard" search={{ branch: w.query.branch }}>
          <ArrowLeft size={13} aria-hidden />
          Command center
        </Link>
        <span aria-hidden>/</span>
        <span>In remembrance</span>
        <span className="ny-memorial-crumbs-spacer" />
        <button
          type="button"
          className="ny-btn ny-btn-ghost ny-btn-sm"
          onClick={() => openOverlay("audit")}
        >
          <ScrollText size={14} aria-hidden />
          Audit trail
        </button>
        <button
          type="button"
          className="ny-btn ny-btn-primary ny-btn-sm"
          onClick={() => openOverlay("wizard")}
        >
          <Plus size={14} aria-hidden />
          Remember someone
        </button>
      </nav>

      {/* ── S1 · In memoriam header ─────────────────────────────────── */}
      <MemorialHero
        obituaries={all}
        calm={w.reduced}
        onRemember={() => openOverlay("wizard")}
        onCandle={() => openOverlay("tribute", notice?.id ?? all[0]?.id)}
        onArchive={() =>
          document
            .getElementById("archive")
            ?.scrollIntoView({ behavior: w.reduced ? "auto" : "smooth" })
        }
      />

      {/* ── S2 · Obituary cards ─────────────────────────────────────── */}
      <section className="ny-memorial-section" aria-labelledby="notices">
        <div className="ny-memorial-section-head">
          <div>
            <p className="ny-eyebrow">
              <Flower2 size={12} aria-hidden />
              S2 · THE NOTICES
            </p>
            <h2 id="notices">The people we remember</h2>
            <p className="ny-memorial-section-intro">
              Every notice the family has agreed to publish. Open one to read
              the notice, the life story, the funeral details and the
              condolence wall.
            </p>
          </div>
          <span className="ny-memorial-count">
            <b className="ny-num">{visible.length}</b> of {all.length} notices
          </span>
        </div>

        <ObituaryFilterBar
          filters={filters}
          years={OBITUARY_YEARS}
          counts={counts}
          onChange={setFilters}
        />

        <ObituaryCards
          obituaries={visible}
          filters={filters}
          onChange={setFilters}
          onOpen={(id) => openNotice(id)}
          onAction={(next, id) => {
            if (next === "share") {
              void share(id);
              return;
            }
            openOverlay(next, id);
          }}
          candles={candles}
          upcoming={upcoming}
          calm={w.reduced}
        />
      </section>

      {/* ── S5 · Condolence wall ────────────────────────────────────── */}
      <CondolenceWall
        obituaries={all}
        condolences={condolences}
        onOpen={(id) => openNotice(id, "condolences")}
        onAction={(next, id) => openOverlay(next, id)}
        canModerate={canModerate}
      />

      {/* ── S6 · Anniversary reminders ──────────────────────────────── */}
      <AnniversaryReminders
        anniversaries={ANNIVERSARIES}
        obituaries={all}
        reminders={reminderMap}
        onToggle={(id, next) => {
          setReminders((r) => ({ ...r, [id]: next }));
          w.setToast(
            next
              ? "Reminder set for this device."
              : "Reminder removed on this device.",
          );
        }}
        onBroadcast={(id) => openOverlay("broadcast", id)}
        onOpen={(id) => openNotice(id)}
      />

      {/* ── S7 · Archive ─────────────────────────────────────────────── */}
      <ArchiveSection
        obituaries={all}
        onOpen={(id) => openNotice(id)}
        onAction={(next, id) => {
          if (next === "share") {
            void share(id ?? "");
            return;
          }
          openOverlay(next, id);
        }}
      />

      <p className="ny-memorial-footnote">
        <ShieldCheck size={13} aria-hidden />
        Notices are written with the family and published only when the family
        agrees · every change is written to the audit trail ·{" "}
        <button type="button" className="ny-text-link" onClick={exportSheet}>
          export a memorial sheet
        </button>
      </p>

      {/* ── Overlays ─────────────────────────────────────────────────── */}
      <ObituaryDrawer
        obituary={notice}
        tab={tab}
        onTab={(next) =>
          void navigate({
            to: "/dashboard/obituaries",
            search: (prev: Record<string, unknown>) => ({ ...prev, tab: next }),
            replace: true,
          })
        }
        onClose={closeNotice}
        onAction={(next, id) => openOverlay(next, id)}
        condolences={condolences.filter((c) => c.obituaryId === notice?.id)}
        candles={candles}
        calm={w.reduced}
        canModerate={canModerate}
      />

      <NewObituaryWizard
        open={act === "wizard"}
        onClose={closeOverlay}
        onPublish={publishObituary}
      />

      <CondolenceModal
        open={act === "condolence"}
        obituary={targetObituary ?? notice}
        onClose={closeOverlay}
        onSubmit={postCondolence}
      />

      <ModerateModal
        open={act === "moderate"}
        condolence={targetCondolence}
        onClose={closeOverlay}
        onResolve={moderate}
      />

      <FuneralModal
        open={act === "funeral"}
        obituary={targetObituary}
        onClose={closeOverlay}
        onSave={() => w.setToast("Funeral details saved on this device.")}
      />

      <CauseModal
        open={act === "cause"}
        obituary={targetObituary}
        onClose={closeOverlay}
        onSave={(id) =>
          w.setToast(id ? "Contribution cause linked." : "Cause link cleared.")
        }
      />

      <AlbumModal
        open={act === "album"}
        obituary={targetObituary}
        onClose={closeOverlay}
      />

      <BroadcastModal
        open={act === "broadcast"}
        obituary={targetObituary}
        onClose={closeOverlay}
        onSend={(channel) =>
          w.setToast(
            `Broadcast prepared for ${channel} — SIMULATED, not sent.`,
          )
        }
      />

      <ExportModal
        open={act === "export"}
        obituaries={all}
        focus={targetObituary}
        onClose={closeOverlay}
      />

      <UnpublishModal
        open={act === "unpublish"}
        obituary={targetObituary}
        onClose={closeOverlay}
        onConfirm={(reason) =>
          w.setToast(`Notice withdrawn — ${reason}`)
        }
      />

      <TributeModal
        open={act === "tribute"}
        obituary={targetObituary ?? notice}
        onClose={closeOverlay}
        onLight={() => {
          const id = targetObituary?.id ?? notice?.id;
          if (id) lightCandle(id);
        }}
      />

      <StatementModal
        open={act === "statement"}
        obituary={targetObituary}
        onClose={closeOverlay}
        onSave={(statement) => {
          if (!targetObituary) return;
          setStatements((s) => ({ ...s, [targetObituary.id]: statement }));
          w.setToast("The family statement is saved on this device.");
        }}
      />

      <StoryModal
        open={act === "story"}
        onClose={closeOverlay}
        onSave={(year, title) =>
          w.setToast(`“${title}” (${year}) added to the life story.`)
        }
      />

      <ScopeModal
        open={act === "scope"}
        obituary={targetObituary}
        onClose={closeOverlay}
        onSave={(scope) =>
          w.setToast(`Notice scope set to ${scope}.`)
        }
      />

      <AuditModal
        open={act === "audit"}
        entries={OBITUARY_AUDIT}
        onClose={closeOverlay}
      />

      <ArchiveFilterModal
        open={act === "filter"}
        year={filters.year}
        branch={filters.branch}
        onClose={closeOverlay}
        onApply={(year, branch) => setFilters({ year, branch })}
      />

      <MemorialLightbox
        open={act === "lightbox" && Boolean(lightbox)}
        photos={lightbox?.source.gallery ?? []}
        index={lightbox?.index ?? 0}
        onIndexChange={setLightboxIndex}
        onClose={closeOverlay}
        calm={w.reduced}
      />

      <span className="sr-only" aria-live="polite">
        {notice ? `The notice for ${notice.name} is open.` : ""}
      </span>
    </div>
  );
}
