"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Filter, LayoutGrid, Plus, Search, ShieldCheck, Sparkles, Table2, Users } from "lucide-react";
import {
  AS_OF,
  applyFilters,
  approvedOf,
  auditSeed,
  categories as seedCategories,
  countFilters,
  emptyFilters,
  endorsements as seedEndorsements,
  fmtDate,
  frames,
  monthApproved,
  pendingCount,
  pros as seedPeople,
  ratingOf,
  reviews as seedReviews,
  tickets as seedTickets,
  towns,
  type AuditEntry,
  type Category,
  type Endorsement,
  type Filters,
  type Pro,
  type Review,
  type Shot,
  type Ticket,
  type Urgency,
  type Reach,
  maskPhone,
  URGENCY_LABEL,
  REACH_LABEL,
} from "@/data/dashboard/professions";
import { CountUp, Reveal } from "@/components/ui/primitives";
import { FrameStrip, ShutterLightbox, ShutterStage } from "@/components/contributions/shutter-gallery";
import { useOverlay, type PfOverlay } from "@/components/professions/use-overlay";
import { CatTile, Meter, ProCard, Stars } from "@/components/professions/cards";
import {
  AuditModal,
  CatDisableModal,
  CatEditModal,
  DecisionModal,
  EditModal,
  EndorseModal,
  ModerateModal,
  PhotoAddModal,
  PhotoModal,
  QuoteModal,
  RemoveModal,
  RevealModal,
  ReviewModal,
  ShareModal,
  TicketModal,
  VerifyModal,
  type ListingPatch,
} from "@/components/professions/modals";
import { FiltersDrawer, ProfileDrawer, ReviewQueueDrawer } from "@/components/professions/drawers";
import { AddListingWizard, ContactWizard, type NewListing } from "@/components/professions/wizards";

const ME = "Peter Wanyama Nalyanya";
const HERO_IMG = "/images/cause-wedding.jpg";

const sections = [
  { id: "s1", label: "S1 · KPIs" },
  { id: "s2", label: "S2 · Find someone" },
  { id: "s3", label: "S3 · Directory" },
  { id: "s4", label: "S4 · Profile drawer" },
  { id: "s5", label: "S5 · Add & ask" },
  { id: "s6", label: "S6 · Endorsements" },
  { id: "s7", label: "S7 · Categories" },
  { id: "s8", label: "S8 · Stories" },
];

type Decision = { title: string; body: string; tone: "ok" | "warn" };
type View = "table" | "cards";
type Sort = "rating" | "name" | "newest";

export default function ProfessionsPage() {
  return <ProfessionsView />;
}

function ProfessionsView() {
  const ov = useOverlay();

  /* ---------- live state (local mock, nothing leaves the browser) ---------- */
  const [people, setPeople] = useState<Pro[]>(seedPeople);
  const [reviews, setReviews] = useState<Review[]>(seedReviews);
  const [endorsements, setEndorsements] = useState<Endorsement[]>(seedEndorsements);
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [cats, setCats] = useState<Category[]>(seedCategories);
  const [removed, setRemoved] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<string[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>(auditSeed);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [view, setView] = useState<View>("table");
  const [sort, setSort] = useState<Sort>("rating");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [lastTicket, setLastTicket] = useState<Ticket | null>(null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [askId, setAskId] = useState<string>(seedPeople[0]?.id ?? "");
  const [frameIndex, setFrameIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  /* ---------- derived: every figure is computed here ---------- */
  const live = useMemo(() => people.filter((p) => !removed[p.id]), [people, removed]);
  const shown = useMemo(() => {
    const list = applyFilters(live, filters);
    return [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "newest") return a.since < b.since ? 1 : a.since > b.since ? -1 : 0;
      const diff = ratingOf(b.id, reviews).avg - ratingOf(a.id, reviews).avg;
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });
  }, [live, filters, sort, reviews]);

  const familyCount = live.filter((p) => p.kind === "family").length;
  const friendCount = live.length - familyCount;
  const enabledCats = cats.filter((c) => c.enabled);
  const topRated = [...live].sort((a, b) => ratingOf(b.id, reviews).avg - ratingOf(a.id, reviews).avg).slice(0, 3);
  const topEndorsed = [...live]
    .map((p) => ({ p, n: approvedOf(p.id, endorsements) }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 5);
  const maxEndorsed = Math.max(1, ...topEndorsed.map((x) => x.n));
  const latestReviews = [...reviews]
    .filter((r) => !removed[r.pid])
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 4);
  const activeFilters = countFilters(filters);
  const nextRef = `NY-PRO-${String(people.length + 1).padStart(4, "0")}`;

  const catOf = (id: string): Category | undefined => cats.find((c) => c.id === id);
  const nameOfPro = (pid: string): string => people.find((p) => p.id === pid)?.name ?? "—";

  /* ---------- overlay targets: read from the URL, never from local state ---------- */
  const target = ov.id ? live.find((p) => p.id === ov.id) ?? null : null;
  const targetReviews = target ? reviews.filter((r) => r.pid === target.id) : [];
  const targetEndorsements = target ? endorsements.filter((e) => e.pid === target.id) : [];
  const targetCat = ov.id ? cats.find((c) => c.id === ov.id) ?? null : null;
  const targetEndorsement = ov.id ? endorsements.find((e) => e.id === ov.id) ?? null : null;
  const targetAudit = ov.id ? audit.find((a) => a.ref === ov.id) ?? null : null;
  const photoIndex = Math.max(0, Number(ov.t ?? 0) || 0);

  /* ---------- actions ---------- */
  const open = (k: PfOverlay, id?: string, t?: string) => ov.open(k, id || t ? { id, t } : undefined);

  const log = (action: string, entity: string, detail: string, tone: AuditEntry["tone"] = "plain") =>
    setAudit((prev) => [
      { ref: `NY-AUD-${String(1161 + prev.length).padStart(5, "0")}`, at: "18 Nov · 10:40", actor: ME, action, entity, detail, tone },
      ...prev,
    ]);

  const flash = (id: string) => {
    setFlashId(id);
    window.setTimeout(() => setFlashId(null), 1000);
  };

  const reveal = (pid: string) => {
    const p = people.find((x) => x.id === pid);
    setRevealed((prev) => (prev.includes(pid) ? prev : [...prev, pid]));
    log("contact.reveal", p?.ref ?? pid, `Phone shown to ${ME} after consent · SIMULATED`, "gold");
    ov.close();
  };

  const endorse = (pid: string, note: string) => {
    const id = `e${String(endorsements.length + 1).padStart(2, "0")}`;
    setEndorsements((prev) => [{ id, pid, by: ME, at: AS_OF, note, status: "pending", reason: "" }, ...prev]);
    log("endorsement.submit", id, `Endorsement for ${nameOfPro(pid)} awaiting moderation`);
    ov.close();
    setDecision({ title: "Endorsement sent", body: "It is waiting for an admin to approve it. Approved endorsements show on the listing.", tone: "ok" });
  };

  const review = (pid: string, stars: number, text: string) => {
    setReviews((prev) => [{ id: `r${prev.length + 1}`, pid, by: ME, stars, text, at: AS_OF }, ...prev]);
    log("review.post", nameOfPro(pid), `${stars}-star review posted`);
    flash(pid);
    ov.close();
    setDecision({ title: "Review posted", body: "Your review is now part of the family’s record for this listing.", tone: "ok" });
  };

  const remove = (pid: string, reason: string) => {
    setRemoved((prev) => ({ ...prev, [pid]: reason }));
    log("listing.archive", people.find((p) => p.id === pid)?.ref ?? pid, `Archived · ${reason}`, "red");
    ov.close();
    setDecision({ title: "Listing archived", body: "Its reviews and endorsements stay in the audit trail. An admin can restore it.", tone: "warn" });
  };

  const edit = (pid: string, patch: ListingPatch) => {
    setPeople((prev) => prev.map((p) => (p.id === pid ? { ...p, ...patch } : p)));
    log("listing.edit", people.find((p) => p.id === pid)?.ref ?? pid, "Listing details changed");
    flash(pid);
    ov.close();
    setDecision({ title: "Listing saved", body: "The changes show on the directory straight away.", tone: "ok" });
  };

  const verify = (pid: string) => {
    setPeople((prev) => prev.map((p) => (p.id === pid ? { ...p, verified: true } : p)));
    log("verify.grant", people.find((p) => p.id === pid)?.ref ?? pid, "Verified-by-family badge granted · 2FA verified", "gold");
    flash(pid);
    ov.close();
    setDecision({ title: "Family badge granted", body: "This person now shows as verified by the family.", tone: "ok" });
  };

  const moderate = (eid: string, status: "approved" | "rejected", reason: string) => {
    setEndorsements((prev) => prev.map((e) => (e.id === eid ? { ...e, status, reason } : e)));
    log(status === "approved" ? "endorsement.approve" : "endorsement.reject", eid, status === "approved" ? "Approved" : `Rejected · ${reason}`, status === "approved" ? "gold" : "red");
    ov.close();
    setDecision({ title: status === "approved" ? "Endorsement approved" : "Endorsement rejected", body: status === "approved" ? "It now shows on the listing." : "The endorser can see the reason in their history.", tone: status === "approved" ? "ok" : "warn" });
  };

  const catSave = (id: string | null, name: string, blurb: string) => {
    if (id) {
      setCats((prev) => prev.map((c) => (c.id === id ? { ...c, name, blurb } : c)));
      log("category.rename", id, `Renamed to ${name}`);
    } else {
      const newId = `cat-${Date.now().toString(36)}`;
      setCats((prev) => [...prev, { id: newId, name, blurb, image: "/images/contrib-hero.jpg", enabled: true }]);
      log("category.add", newId, `Added ${name}`, "gold");
    }
    ov.close();
    setDecision({ title: "Category saved", body: `${name} is now in the list of things families can offer.`, tone: "ok" });
  };

  const toggleCat = (c: Category) => {
    if (c.enabled) {
      open("cat-disable", c.id);
      return;
    }
    setCats((prev) => prev.map((x) => (x.id === c.id ? { ...x, enabled: true } : x)));
    log("category.enable", c.id, `${c.name} switched back on`, "gold");
    setDecision({ title: `${c.name} is open again`, body: "Listings in this category can be contacted again.", tone: "ok" });
  };

  const catDisable = (cid: string, reason: string) => {
    const c = cats.find((x) => x.id === cid);
    setCats((prev) => prev.map((x) => (x.id === cid ? { ...x, enabled: false } : x)));
    log("category.disable", cid, `Switched off · ${reason}`, "red");
    ov.close();
    setDecision({ title: `${c?.name ?? "Category"} switched off`, body: "New contact requests in this category are paused. Existing listings are kept.", tone: "warn" });
  };

  const addPhotos = (pid: string, shots: Shot[]) => {
    setPeople((prev) => prev.map((p) => (p.id === pid ? { ...p, portfolio: [...p.portfolio, ...shots] } : p)));
    log("portfolio.add", people.find((p) => p.id === pid)?.ref ?? pid, `${shots.length} photo${shots.length === 1 ? "" : "s"} added · SIMULATED`);
    ov.close();
    setDecision({ title: "Photos added (SIMULATED)", body: "They are stored with the listing. Real photo storage connects in Phase 2.", tone: "ok" });
  };

  const ticket = (pid: string, d: { need: string; urgency: Urgency; reach: Reach }) => {
    const t: Ticket = {
      id: `t${String(tickets.length + 1).padStart(2, "0")}`,
      ref: `NY-CTC-2025-${String(tickets.length + 1).padStart(5, "0")}`,
      pid,
      need: d.need,
      urgency: d.urgency,
      reach: d.reach,
      at: AS_OF,
      requester: ME,
    };
    setTickets((prev) => [t, ...prev]);
    setLastTicket(t);
    log("contact.ticket", t.ref, `${REACH_LABEL[d.reach]} · ${URGENCY_LABEL[d.urgency]} · queued, SIMULATED`, "gold");
    ov.close();
  };

  const addListing = (input: NewListing) => {
    const id = `p${String(people.length + 1).padStart(2, "0")}`;
    const ref = `NY-PRO-${String(people.length + 1).padStart(4, "0")}`;
    setPeople((prev) => [{ ...input, id, ref, verified: false, since: AS_OF }, ...prev]);
    log("listing.create", ref, `${input.name} · ${input.role} · unverified`, "gold");
    flash(id);
    ov.close();
    setDecision({ title: "Listing published", body: `${input.name} is in the directory. An admin can grant the family badge once they have checked them.`, tone: "ok" });
  };

  const copyLink = (pid: string) => {
    navigator.clipboard?.writeText(`nalyanya.app/pro/${pid}`).catch(() => undefined);
    ov.close();
    setDecision({ title: "Link copied (SIMULATED)", body: "Family members can open this profile. Nothing has been published to the public page.", tone: "ok" });
  };

  /* ================================================================== */
  return (
    <div className="page-dash-professions mx-auto max-w-[1500px]">
      {/* ================= HERO ================= */}
      <Reveal>
        <header className="pf-hero mb-6">
          <img src={HERO_IMG} alt="A family celebration with music and string lights" className="pf-hero__img" fetchPriority="high" />
          <div className="pf-hero__shade" />
          <div className="pf-hero__body grid grid-cols-[minmax(0,1fr)] gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
            <div className="min-w-0">
              <span className="gd-code">T-13 · Professions &amp; expertise</span>
              <h1 className="ny-display mt-3 max-w-[20ch] text-[clamp(1.9rem,4.6vw,3.3rem)] leading-[1.02] text-on-brand">
                Family helps family, first.
              </h1>
              <p className="mt-2.5 max-w-[60ch] text-sm leading-relaxed text-on-brand/85 sm:text-base">
                A doctor, a plumber, an advocate, a caterer, a tutor. Family members and the friends we trust, with what they do,
                what they charge, and what the family has said about them.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-accent" onClick={() => open("add")}>
                  <Plus className="h-4 w-4" /> Add a listing
                </button>
                <button type="button" className="ny-btn ny-btn-outline !border-on-brand/50 !text-on-brand hover:!bg-on-brand/10" onClick={() => open("filters")}>
                  <Filter className="h-4 w-4" /> Filter the directory
                </button>
                <button type="button" className="ny-btn ny-btn-ghost !text-on-brand/90 hover:!bg-on-brand/10" onClick={() => open("queue")}>
                  <ShieldCheck className="h-4 w-4" /> Endorsement queue
                </button>
              </div>
            </div>

            <div className="pf-glass p-4">
              <p className="ny-hud !text-on-brand/70">Listed professionals</p>
              <p className="ny-display mt-1 text-[clamp(1.6rem,3vw,2.2rem)] leading-none">
                <CountUp value={live.length} />
              </p>
              <p className="mt-1.5 text-xs text-on-brand/75">
                {familyCount} family · {friendCount} friends of the family
              </p>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-on-brand/20 pt-3">
                <span className="ny-hud !text-on-brand/75">Verified by family</span>
                <span className="ny-chip ny-chip-ok">{live.filter((p) => p.verified).length}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="ny-hud !text-on-brand/75">Waiting for moderation</span>
                <span className={`ny-chip ${pendingCount(endorsements) ? "ny-chip-warn ny-pulse" : "ny-chip-ok"}`}>{pendingCount(endorsements)}</span>
              </div>
            </div>
          </div>
        </header>
      </Reveal>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[210px_minmax(0,1fr)]">
        <nav className="cc-rail" aria-label="Section index">
          <p className="ny-hud px-2 pb-1">Sections</p>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.label}
            </a>
          ))}
          <span className="ny-hud mt-2 border-t border-border-subtle px-2 pt-2 !text-[0.56rem]">8 sections · 20 overlays</span>
        </nav>

        <div className="min-w-0">
          {/* ================= S1 KPIs ================= */}
          <section id="s1" className="mb-8 scroll-mt-24" aria-label="Professions KPIs">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "Listed professionals", accent: "var(--color-brand-primary)", hint: `${familyCount} family · ${friendCount} friends`, value: <CountUp value={live.length} /> },
                { label: "Categories open", accent: "var(--color-brand-accent)", hint: `of ${cats.length} · ${cats.length - enabledCats.length} switched off`, value: <CountUp value={enabledCats.length} /> },
                { label: "Friends of the family", accent: "var(--color-purple)", hint: "trusted by someone in the family", value: <CountUp value={friendCount} /> },
                { label: "Endorsements this month", accent: "var(--color-success)", hint: `${pendingCount(endorsements)} waiting for moderation`, value: <CountUp value={monthApproved(endorsements)} /> },
              ].map((k, i) => (
                <Reveal key={k.label} delay={i * 60}>
                  <div className="pf-kpi" style={{ ["--kpi-accent" as string]: k.accent } as CSSProperties}>
                    <p className="ny-hud">{k.label}</p>
                    <p className="pf-kpi__value mt-1.5">{k.value}</p>
                    <p className="mt-1.5 text-xs text-text-tertiary">{k.hint}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ================= S2 FIND SOMEONE ================= */}
          <section id="s2" className="mb-8 scroll-mt-24" aria-label="Find someone">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S2 · Find someone</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Who can help with this?</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => open("filters")}>
                  <Filter className="h-3.5 w-3.5" /> More filters
                  {activeFilters > 0 && <span className="ny-chip ny-chip-brand !px-1.5">{activeFilters}</span>}
                </button>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("add")}>
                  <Plus className="h-3.5 w-3.5" /> Add a listing
                </button>
              </div>
            </div>

            <div className="ny-card mb-4 grid grid-cols-[minmax(0,1fr)] gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_200px_auto] lg:items-end">
              <div>
                <label className="ny-label" htmlFor="pf-q">Search by name, service or town</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                  <input id="pf-q" className="ny-input pl-9" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Plumber, Kitale, school fees…" />
                </div>
              </div>
              <div>
                <label className="ny-label" htmlFor="pf-sort">Sort by</label>
                <select id="pf-sort" className="ny-select" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
                  <option value="rating">Best rated</option>
                  <option value="name">Name, A to Z</option>
                  <option value="newest">Newest in the family</option>
                </select>
              </div>
              <div className="flex gap-1.5" role="group" aria-label="View">
                <button type="button" aria-pressed={view === "table"} onClick={() => setView("table")} className={`ny-btn ny-btn-sm ${view === "table" ? "ny-btn-primary" : "ny-btn-outline"}`}>
                  <Table2 className="h-3.5 w-3.5" /> Table
                </button>
                <button type="button" aria-pressed={view === "cards"} onClick={() => setView("cards")} className={`ny-btn ny-btn-sm ${view === "cards" ? "ny-btn-primary" : "ny-btn-outline"}`}>
                  <LayoutGrid className="h-3.5 w-3.5" /> Cards
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button type="button" aria-pressed={filters.cat === "all"} onClick={() => setFilters({ ...filters, cat: "all" })} className={`ny-chip ny-touch transition ${filters.cat === "all" ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"}`}>
                Everything
              </button>
              {enabledCats.map((c) => (
                <button key={c.id} type="button" aria-pressed={filters.cat === c.id} onClick={() => setFilters({ ...filters, cat: c.id })} className={`ny-chip ny-touch transition ${filters.cat === c.id ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </section>

          {/* ================= S3 DIRECTORY ================= */}
          <section id="s3" className="mb-8 scroll-mt-24" aria-label="Directory">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S3 · Directory</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">The family directory</h2>
              </div>
              <span className="ny-hud">
                Showing {shown.length} of {live.length}
              </span>
            </div>

            {shown.length === 0 && (
              <div className="ny-inset px-6 py-12 text-center">
                <p className="ny-display text-lg">Nobody matches those filters</p>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-text-secondary">Clear a filter, or add someone the family already trusts.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => setFilters(emptyFilters)}>
                    Clear filters
                  </button>
                  <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => open("add")}>
                    <Plus className="h-3.5 w-3.5" /> Add a listing
                  </button>
                </div>
              </div>
            )}

            {shown.length > 0 && view === "table" && (
              <div className="cc-table-wrap ny-scroll overflow-x-auto">
                <table className="cc-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Category</th>
                      <th>Town</th>
                      <th>Phone</th>
                      <th>Family?</th>
                      <th>Verified</th>
                      <th>Rating</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((p) => {
                      const r = ratingOf(p.id, reviews);
                      const c = catOf(p.categoryId);
                      const off = c ? !c.enabled : false;
                      const isRevealed = revealed.includes(p.id);
                      return (
                        <tr key={p.id} onClick={() => open("profile", p.id, "overview")}>
                          <td data-label="Name">
                            <span className="flex items-center gap-2.5">
                              <span className="pf-avatar">{p.initials}</span>
                              <span className="min-w-0">
                                <span className="block truncate font-semibold">{p.name}</span>
                                <span className="ny-hud block !text-[0.52rem]">{p.ref}</span>
                              </span>
                            </span>
                          </td>
                          <td data-label="Role" className="max-w-[200px] text-text-secondary">{p.role}</td>
                          <td data-label="Category">
                            <span className={`ny-chip ${off ? "ny-chip-danger" : "ny-chip-brand"}`}>{c?.name ?? "—"}</span>
                          </td>
                          <td data-label="Town">{p.town}</td>
                          <td data-label="Phone" className="ny-num whitespace-nowrap">
                            <span className={isRevealed ? "" : "pf-reveal"}>{isRevealed ? p.phone : maskPhone(p.phone)}</span>
                          </td>
                          <td data-label="Family?">
                            <span className={`ny-chip ${p.kind === "family" ? "ny-chip-ok" : "ny-chip-neutral"}`}>{p.kind === "family" ? "family" : "friend"}</span>
                          </td>
                          <td data-label="Verified">
                            {p.verified ? (
                              <span className="ny-chip ny-chip-ok pf-verified">
                                <BadgeCheck className="h-3 w-3" /> by family
                              </span>
                            ) : (
                              <span className="ny-chip ny-chip-neutral">not yet</span>
                            )}
                          </td>
                          <td data-label="Rating">
                            <span className="flex items-center gap-1.5">
                              <Stars value={r.avg} />
                              <span className="ny-num text-xs text-text-secondary">{r.avg ? r.avg.toFixed(1) : "new"}</span>
                            </span>
                          </td>
                          <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                            <span className="flex flex-wrap gap-1">
                              <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={() => open("profile", p.id, "overview")} aria-label={`View ${p.name}`}>
                                View
                              </button>
                              <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" disabled={off} onClick={() => open("contact", p.id)} aria-label={`Contact ${p.name}`}>
                                Contact
                              </button>
                              <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={() => open("endorse", p.id)} aria-label={`Endorse ${p.name}`}>
                                Endorse
                              </button>
                              <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={() => open("edit", p.id)} aria-label={`Edit ${p.name}`}>
                                Edit
                              </button>
                              <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={() => open("remove", p.id)} aria-label={`Remove ${p.name}`}>
                                Remove
                              </button>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {shown.length > 0 && view === "cards" && (
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i, 8) * 45} className="h-full">
                    <ProCard
                      pro={p}
                      cat={catOf(p.categoryId)}
                      rating={ratingOf(p.id, reviews)}
                      approved={approvedOf(p.id, endorsements)}
                      flash={flashId === p.id}
                      onOpen={() => open("profile", p.id, "overview")}
                    />
                  </Reveal>
                ))}
              </div>
            )}
            <p className="ny-hud mt-2">Click a row or a card for the full profile · phone numbers stay masked until a member confirms a reveal</p>
          </section>

          {/* ================= S4 PROFILE DRAWER ================= */}
          <section id="s4" className="mb-8 scroll-mt-24" aria-label="Profile drawer">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S4 · Profile</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Five tabs for every person</h2>
                <p className="mt-1 max-w-[64ch] text-sm text-text-secondary">
                  Overview, services, contact, reviews and gallery. The contact tab hides the phone number until a member confirms
                  they need it. The drawer is deep-linked, so reload restores it and back closes it.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12">
              {topRated.map((p, i) => (
                <Reveal key={p.id} delay={i * 70} className="lg:col-span-4">
                  <ProCard
                    pro={p}
                    cat={catOf(p.categoryId)}
                    rating={ratingOf(p.id, reviews)}
                    approved={approvedOf(p.id, endorsements)}
                    flash={flashId === p.id}
                    onOpen={() => open("profile", p.id, "overview")}
                  />
                </Reveal>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Overview", "Services", "Contact", "Reviews", "Gallery"].map((t) => (
                <span key={t} className="ny-chip ny-chip-neutral">
                  {t}
                </span>
              ))}
            </div>
          </section>

          {/* ================= S5 ADD & ASK ================= */}
          <section id="s5" className="mb-8 scroll-mt-24" aria-label="Add a listing and ask for help">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S5 · Two wizards</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Add someone, or ask for help</h2>
              </div>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
              <Reveal>
                <div className="ny-card flex h-full flex-col gap-3 p-5">
                  <p className="ny-hud">Six steps · admin or self</p>
                  <p className="ny-display text-lg">Add a listing</p>
                  <ol className="space-y-1.5 text-sm text-text-secondary">
                    {["Person: family or friend", "Work: what they do and their category", "Where: town and branch", "Contact: phone, email, WhatsApp", "Portfolio: up to three photographs", "Rates and publish"].map((s, i) => (
                      <li key={s} className="flex items-center gap-2.5">
                        <span className="ny-num grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-primary text-[0.7rem] font-bold text-on-brand">{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                  <button type="button" className="ny-btn ny-btn-accent mt-auto w-full" onClick={() => open("add")}>
                    <Plus className="h-4 w-4" /> Start a listing
                  </button>
                </div>
              </Reveal>
              <Reveal delay={80}>
                <div className="ny-card flex h-full flex-col gap-3 p-5">
                  <p className="ny-hud">Three steps · logged, not sent</p>
                  <p className="ny-display text-lg">Ask for help</p>
                  <div>
                    <label className="ny-label" htmlFor="pf-ask">Who do you want to ask?</label>
                    <select id="pf-ask" className="ny-select" value={askId} onChange={(e) => setAskId(e.target.value)}>
                      {live.map((p) => (
                        <option key={p.id} value={p.id} disabled={catOf(p.categoryId)?.enabled === false}>
                          {p.name} · {p.role}
                          {catOf(p.categoryId)?.enabled === false ? " (switched off)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary">
                    You say what you need, how soon, and how they should reach you. Only the ways the person has agreed to are offered.
                  </p>
                  <button type="button" className="ny-btn ny-btn-primary mt-auto w-full" disabled={!askId} onClick={() => open("contact", askId)}>
                    <ArrowRight className="h-4 w-4" /> Ask for help
                  </button>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ================= S6 ENDORSEMENTS & REVIEWS ================= */}
          <section id="s6" className="mb-8 scroll-mt-24" aria-label="Endorsements and reviews">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S6 · Trust</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Endorsements and reviews</h2>
              </div>
              <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("queue")}>
                <ShieldCheck className="h-3.5 w-3.5" /> Open the queue ({pendingCount(endorsements)})
              </button>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12">
              <div className="ny-card p-4 sm:p-5 lg:col-span-6">
                <p className="ny-hud">Most endorsed</p>
                <ul className="mt-3 space-y-3">
                  {topEndorsed.map(({ p, n }) => (
                    <li key={p.id}>
                      <button type="button" className="w-full text-left" onClick={() => open("profile", p.id, "reviews")}>
                        <span className="flex items-center justify-between gap-2 text-sm">
                          <span className="truncate font-semibold">{p.name}</span>
                          <span className="ny-num shrink-0">{n} endorsed</span>
                        </span>
                        <span className="mt-1.5 block">
                          <Meter value={n} max={maxEndorsed} />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3 lg:col-span-6">
                <p className="ny-hud">Latest reviews</p>
                {latestReviews.map((r) => (
                  <button key={r.id} type="button" onClick={() => open("profile", r.pid, "reviews")} className="pf-review text-left transition hover:-translate-y-0.5">
                    <span className="flex items-center justify-between gap-2">
                      <Stars value={r.stars} />
                      <span className="ny-hud !text-[0.52rem]">{fmtDate(r.at)}</span>
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed">{r.text}</span>
                    <span className="ny-hud mt-2 block !text-[0.52rem]">
                      {r.by} · about {nameOfPro(r.pid)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ================= S7 CATEGORIES ================= */}
          <section id="s7" className="mb-8 scroll-mt-24" aria-label="Categories manager">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S7 · Admin</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Categories</h2>
                <p className="mt-1 max-w-[64ch] text-sm text-text-secondary">
                  Switching a category off pauses new contact requests in it. Its listings and history are kept.
                </p>
              </div>
              <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => open("cat-edit", "new")}>
                <Plus className="h-3.5 w-3.5" /> Add a category
              </button>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {cats.map((c, i) => (
                <Reveal key={c.id} delay={Math.min(i, 8) * 40} className="h-full">
                  <CatTile
                    cat={c}
                    count={live.filter((p) => p.categoryId === c.id).length}
                    onToggle={() => toggleCat(c)}
                    onRename={() => open("cat-edit", c.id)}
                  />
                </Reveal>
              ))}
            </div>
          </section>

          {/* ================= S8 STORIES (camera pinhole) ================= */}
          <section id="s8" className="mb-8 scroll-mt-24" aria-label="Stories behind the directory">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S8 · Camera pinhole</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">The work behind the listings</h2>
                <p className="mt-1 max-w-[62ch] text-sm text-text-secondary">
                  The iris closes to a pinhole, the exposure flashes, and the next frame opens. Step through, or open the full contact sheet.
                </p>
              </div>
              <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => setLightbox(true)}>
                Full contact sheet
              </button>
            </div>
            <Reveal>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="min-w-0">
                  <ShutterStage frames={frames} index={frameIndex} onIndexChange={setFrameIndex} />
                  <div className="mt-3">
                    <FrameStrip frames={frames} index={frameIndex} onIndexChange={setFrameIndex} />
                  </div>
                </div>
                <aside className="ny-card p-4">
                  <p className="ny-hud">Frame notes</p>
                  <ul className="mt-2 space-y-2.5">
                    {[
                      { k: "Transition", v: "iris, pinhole, flash, open" },
                      { k: "Timing", v: "400ms close · 440ms open" },
                      { k: "Depth", v: "CSS 3D perspective 1400px" },
                      { k: "Accessibility", v: "reduced motion snaps instantly" },
                    ].map((n) => (
                      <li key={n.k} className="ny-inset px-3 py-2.5">
                        <span className="ny-hud block !text-[0.55rem]">{n.k}</span>
                        <span className="text-sm font-medium">{n.v}</span>
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-3 w-full" onClick={() => setLightbox(true)}>
                    <Sparkles className="h-3.5 w-3.5" /> Expand
                  </button>
                  <p className="ny-hud mt-3">Photo storage SIMULATED · Phase 2 keeps the real portfolios</p>
                </aside>
              </div>
            </Reveal>
          </section>

          {/* ================= FOOTER ================= */}
          <Reveal>
            <footer className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Frontend-only Phase 1.</strong> Every contact channel below renders fully and resolves honestly.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["WhatsApp requests", "SMS", "Phone calls", "Email", "Family badge", "Photo storage"].map((r) => (
                    <span key={r} className="ny-chip ny-chip-sim">{r}</span>
                  ))}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 border-t border-border-subtle pt-3 text-sm">
                <Link href="/dashboard/members" className="inline-flex items-center gap-1 text-brand-primary hover:underline">
                  <Users className="h-3.5 w-3.5" /> Members directory (T-3)
                </Link>
                <Link href="/dashboard/communications" className="inline-flex items-center gap-1 text-brand-primary hover:underline">
                  Broadcast a request (T-14) <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </footer>
          </Reveal>
        </div>
      </div>

      {/* ================= URL-DRIVEN OVERLAYS ================= */}
      {ov.key === "profile" && target && (
        <ProfileDrawer
          key={`pf-${target.id}-${ov.nonce ?? "0"}`}
          pro={target}
          cat={catOf(target.categoryId)}
          rating={ratingOf(target.id, reviews)}
          approved={approvedOf(target.id, endorsements)}
          reviews={targetReviews}
          endorsements={targetEndorsements}
          revealed={revealed.includes(target.id)}
          initialTab={ov.t ?? "overview"}
          onOpen={open}
          onClose={ov.close}
        />
      )}

      {ov.key === "filters" && (
        <FiltersDrawer value={filters} towns={towns(live)} matched={shown.length} onChange={setFilters} onClose={ov.close} />
      )}

      {ov.key === "queue" && (
        <ReviewQueueDrawer endorsements={endorsements} nameOf={nameOfPro} onModerate={(eid) => open("moderate", eid)} onClose={ov.close} />
      )}

      {ov.key === "add" && (
        <AddListingWizard cats={enabledCats} nextRef={nextRef} onPublish={addListing} onClose={ov.close} />
      )}

      {ov.key === "contact" && target && (
        <ContactWizard pro={target} onSubmit={(d) => ticket(target.id, d)} onClose={ov.close} />
      )}

      {ov.key === "reveal" && target && <RevealModal pro={target} onConfirm={() => reveal(target.id)} onClose={ov.close} />}

      {ov.key === "endorse" && target && (
        <EndorseModal pro={target} by={ME} onSubmit={(note) => endorse(target.id, note)} onClose={ov.close} />
      )}

      {ov.key === "review" && target && (
        <ReviewModal pro={target} by={ME} onSubmit={(stars, text) => review(target.id, stars, text)} onClose={ov.close} />
      )}

      {ov.key === "remove" && target && (
        <RemoveModal pro={target} onConfirm={(reason) => remove(target.id, reason)} onClose={ov.close} />
      )}

      {ov.key === "edit" && target && <EditModal pro={target} onSave={(patch) => edit(target.id, patch)} onClose={ov.close} />}

      {ov.key === "verify" && target && <VerifyModal pro={target} onConfirm={() => verify(target.id)} onClose={ov.close} />}

      {ov.key === "moderate" && targetEndorsement && (
        <ModerateModal
          endorsement={targetEndorsement}
          proName={nameOfPro(targetEndorsement.pid)}
          onDecide={(status, reason) => moderate(targetEndorsement.id, status, reason)}
          onClose={ov.close}
        />
      )}

      {ov.key === "cat-edit" && (
        <CatEditModal cat={targetCat} onSave={(name, blurb) => catSave(targetCat?.id ?? null, name, blurb)} onClose={ov.close} />
      )}

      {ov.key === "cat-disable" && targetCat && (
        <CatDisableModal
          cat={targetCat}
          affected={live.filter((p) => p.categoryId === targetCat.id).length}
          onConfirm={(reason) => catDisable(targetCat.id, reason)}
          onClose={ov.close}
        />
      )}

      {ov.key === "photo" && target && target.portfolio.length > 0 && (
        <PhotoModal
          pro={target}
          index={photoIndex}
          onStep={(d) => open("photo", target.id, String((photoIndex + d + target.portfolio.length) % target.portfolio.length))}
          onClose={ov.close}
        />
      )}

      {ov.key === "photo-add" && target && (
        <PhotoAddModal pro={target} onSave={(shots) => addPhotos(target.id, shots)} onClose={ov.close} />
      )}

      {ov.key === "share" && target && <ShareModal pro={target} onCopy={() => copyLink(target.id)} onClose={ov.close} />}

      {ov.key === "quote" && target && <QuoteModal pro={target} onClose={ov.close} />}

      {ov.key === "audit" && targetAudit && <AuditModal entry={targetAudit} onClose={ov.close} />}

      {lastTicket && (
        <TicketModal ticket={lastTicket} pro={people.find((p) => p.id === lastTicket.pid)} onClose={() => setLastTicket(null)} />
      )}

      {decision && <DecisionModal data={decision} onClose={() => setDecision(null)} />}

      <ShutterLightbox open={lightbox} onClose={() => setLightbox(false)} index={frameIndex} onIndexChange={setFrameIndex} frames={frames} />
    </div>
  );
}
