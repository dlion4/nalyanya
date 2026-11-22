"use client";

import { useAnimate, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  Aperture,
  ArrowRight,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileSpreadsheet,
  Heart,
  KeyRound,
  Merge,
  MessageCircle,
  Plus,
  ShieldCheck,
  Upload,
  UserCog,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BarMeter } from "@/components/ui/Charts";
import { irisPolygon } from "@/components/ui/IrisReel";
import { Reveal, TiltCard } from "@/components/ui/motion";
import { Avatar, BranchChip, GEN_HEX, GenChip, SectionHeader, SimulatedBadge, StatusChip } from "@/components/ui/Primitives";
import {
  FAMILY_ROLES,
  PORTRAIT_SPOTLIGHTS,
  type FamilyRole,
  type MemberRequest,
  type RequestStatus,
} from "@/data/dashboard/members";
import { ageOf, cn, kes } from "@/lib/format";
import type { Member } from "@/types/family";

/* ─── S6 · Roles & Access Panel (RBAC Matrix) ─────────────────────────── */

export function RolesAccessPanel({
  members,
  roleOf,
  previewRole,
  onChangePreviewRole,
  canAssignRole,
  onAssignForMember,
}: {
  members: Member[];
  roleOf: (m: Member) => FamilyRole;
  previewRole: FamilyRole;
  onChangePreviewRole: (role: FamilyRole) => void;
  canAssignRole: boolean;
  onAssignForMember: (memberId: string) => void;
}) {
  const counts = new Map<FamilyRole, number>();
  for (const m of members) {
    const r = roleOf(m);
    counts.set(r, (counts.get(r) ?? 0) + 1);
  }

  const keyStewards = members.filter((m) => {
    const r = roleOf(m);
    return r === "Family Head" || r === "Co-Admin / Elder" || r === "Finance Officer";
  });

  return (
    <section id="roles" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S6 · Roles & access (RBAC)"
        title="Clear stewardship, hidden where not your job"
        description="Permissions follow the Nalyanya RBAC rules: actions you are not authorized for stay hidden rather than disabled. Switch the role preview pill to test how the page adapts live."
        actions={
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-hairline bg-surface-1 px-3.5 py-2">
            <span className="text-xs font-semibold text-text-tertiary">Preview as:</span>
            <select
              aria-label="Preview page RBAC permissions as role"
              value={previewRole}
              onChange={(e) => onChangePreviewRole(e.target.value as FamilyRole)}
              className="rounded-xl border border-hairline bg-surface-0 px-2.5 py-1 text-xs font-semibold text-brand-primary"
            >
              {FAMILY_ROLES.map((r) => (
                <option key={r.role} value={r.role}>
                  {r.role}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="ny-stage-3d grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {FAMILY_ROLES.map((def, index) => (
          <Reveal key={def.role} delay={index * 0.05}>
            <article className="ny-card ny-card-3d relative flex h-full flex-col overflow-hidden p-5">
              <span aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: def.accent }} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="ny-title text-xl">{def.role}</h3>
                  <p className="mt-0.5 text-xs font-semibold text-text-tertiary">{def.scope}</p>
                </div>
                <span className="ny-chip ny-num">{counts.get(def.role) ?? 0} people</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{def.summary}</p>
              <ul className="mt-4 grid grid-cols-2 gap-1.5 border-t border-hairline pt-3 text-xs">
                {[
                  ["Edit profiles", def.canEditMembers],
                  ["Approve edits", def.canApproveRequests],
                  ["Assign roles", def.canAssignRoles],
                  ["Elder links", def.canSendReceiveLinks],
                ].map(([label, allowed]) => (
                  <li key={String(label)} className={cn("flex items-center gap-1.5", allowed ? "text-text-primary font-medium" : "text-text-tertiary line-through")}>
                    <Check className={cn("size-3.5", allowed ? "text-success" : "opacity-30")} aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Stewards quick-assign strip */}
      <div className="ny-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="ny-eyebrow">Council & finance stewards</p>
            <h3 className="ny-title mt-1 text-xl">Active privileged roles ({keyStewards.length})</h3>
          </div>
          {canAssignRole && (
            <span className="ny-chip ny-chip-gold">
              <ShieldCheck className="size-3.5" aria-hidden />
              2FA gate required on role upgrades
            </span>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {keyStewards.slice(0, 8).map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-hairline bg-surface-0/70 p-3">
              <Avatar member={m} size={42} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text-primary">{m.preferredName} {m.lastName}</p>
                <p className="truncate text-xs text-text-tertiary">{roleOf(m)}</p>
              </div>
              {canAssignRole && (
                <button
                  type="button"
                  onClick={() => onAssignForMember(m.id)}
                  aria-label={`Change role for ${m.preferredName}`}
                  className="ny-btn ny-btn-ghost ny-btn-sm size-9 shrink-0 p-0"
                >
                  <UserCog className="size-4" aria-hidden />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── S7 · Member Requests Queue ──────────────────────────────────────── */

export function RequestsQueuePanel({
  requests,
  canApprove,
  onReview,
  onNewRequest,
}: {
  requests: MemberRequest[];
  canApprove: boolean;
  onReview: (req: MemberRequest) => void;
  onNewRequest: () => void;
}) {
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");
  const list = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <section id="requests" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S7 · Requests queue"
        title="Member-suggested edits & approvals"
        description="Relatives can suggest relation links, branch transfers or payout phone updates. Nothing sensitive changes silently — every request waits here with before/after proof."
        actions={
          <button type="button" onClick={onNewRequest} className="ny-btn ny-btn-primary">
            <Plus className="size-4" aria-hidden />
            Submit edit request
          </button>
        }
      />

      <div className="ny-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline p-4">
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                aria-pressed={filter === status}
                className={cn("ny-chip cursor-pointer capitalize", filter === status && "ny-chip-solid")}
              >
                {status}
                <span className="ny-num opacity-75">
                  {status === "all" ? requests.length : requests.filter((r) => r.status === status).length}
                </span>
              </button>
            ))}
          </div>
          {pendingCount > 0 && (
            <span className="ny-chip ny-chip-warning">
              <Clock className="size-3.5" aria-hidden />
              {pendingCount} waiting for {canApprove ? "your review" : "Family Head"}
            </span>
          )}
        </div>

        <ul className="divide-y divide-hairline">
          {list.map((req) => (
            <li key={req.id}>
              <button
                type="button"
                onClick={() => onReview(req)}
                className="grid w-full gap-3 p-4 text-left transition hover:bg-surface-0/75 sm:p-5 md:grid-cols-[9.5rem_7.5rem_1fr_auto] md:items-center"
              >
                <span className="font-mono text-xs text-text-tertiary">{req.submittedAt}</span>
                <span className={cn("ny-chip w-fit capitalize", req.requiresOtp ? "ny-chip-danger" : "ny-chip-info")}>
                  {req.category.replace("-", " ")}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-text-primary">
                    {req.title} — {req.memberName}
                  </span>
                  <span className="block truncate text-xs text-text-tertiary">
                    {req.before} → <strong className="text-text-secondary">{req.after}</strong>
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <StatusChip status={req.status === "approved" ? "applied" : req.status} />
                  <ArrowRight className="size-4 text-text-tertiary" aria-hidden />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ─── S8 · Camera Pinhole Portrait Studio (6-blade shutter transition) ── */

const APERTURE_OPEN = irisPolygon(115, 0);
const APERTURE_PINHOLE = irisPolygon(0, 32);

export function PortraitShutterStudio({ onInspectMember }: { onInspectMember: (id: string) => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fStopMode, setFStopMode] = useState<"f/1.4" | "f/2.8" | "f/8">("f/2.8");
  const indexRef = useRef(0);
  const busyRef = useRef(false);
  const flashRef = useRef<HTMLDivElement>(null);
  const [scope, animateEl] = useAnimate<HTMLDivElement>();
  const reduced = useReducedMotion();

  const total = PORTRAIT_SPOTLIGHTS.length;

  const shutterTo = useCallback(
    async (target: number) => {
      const next = ((target % total) + total) % total;
      if (busyRef.current || next === indexRef.current) return;
      busyRef.current = true;
      const frame = scope.current;
      const closeDuration = fStopMode === "f/1.4" ? 0.3 : fStopMode === "f/2.8" ? 0.42 : 0.56;
      const openDuration = fStopMode === "f/1.4" ? 0.55 : fStopMode === "f/2.8" ? 0.78 : 0.95;

      if (reduced || !frame) {
        indexRef.current = next;
        setIndex(next);
        busyRef.current = false;
        return;
      }

      // Close six-blade camera iris to pinhole
      await animateEl(frame, { clipPath: [APERTURE_OPEN, APERTURE_PINHOLE] }, { duration: closeDuration, ease: [0.65, 0, 0.35, 1] });
      indexRef.current = next;
      setIndex(next);

      // Brief optical shutter flash as the new exposure lands
      if (flashRef.current) {
        void animateEl(flashRef.current, { opacity: [0, 0.75, 0] }, { duration: 0.45, ease: "easeOut" });
      }

      // Re-open iris onto the next family portrait
      await animateEl(frame, { clipPath: [APERTURE_PINHOLE, APERTURE_OPEN] }, { duration: openDuration, ease: [0.16, 1, 0.3, 1] });
      busyRef.current = false;
    },
    [animateEl, fStopMode, reduced, scope, total],
  );

  useEffect(() => {
    if (paused || reduced) return;
    const id = window.setInterval(() => {
      if (!document.hidden) void shutterTo(indexRef.current + 1);
    }, 5600);
    return () => window.clearInterval(id);
  }, [paused, reduced, shutterTo]);

  const current = PORTRAIT_SPOTLIGHTS[index];

  return (
    <section id="portraits" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S8 · Camera pinhole portrait studio"
        title="Faces of the family, one shutter at a time"
        description="Click any thumbnail or press Shutter to watch the six-blade aperture close into a pinhole and open onto the next family member. Click the portrait to open their full 6-tab drawer."
        actions={
          <div className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-1 p-1">
            <span className="px-2.5 text-xs font-semibold text-text-tertiary">Aperture:</span>
            {(["f/1.4", "f/2.8", "f/8"] as const).map((stop) => (
              <button
                key={stop}
                type="button"
                onClick={() => setFStopMode(stop)}
                aria-pressed={fStopMode === stop}
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-xs font-semibold transition",
                  fStopMode === stop ? "bg-brand-primary text-white" : "text-text-secondary hover:text-text-primary",
                )}
              >
                {stop}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        {/* Pinhole Shutter Stage */}
        <div>
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="ny-shutter-frame aspect-[16/10] w-full rounded-[28px]"
          >
            <div ref={scope} className="absolute inset-0" style={{ clipPath: APERTURE_OPEN }}>
              <img
                key={current.src}
                src={current.src}
                alt={current.alt}
                decoding="async"
                className="ny-shutter-photo h-full w-full object-cover object-top"
              />
            </div>

            <div ref={flashRef} aria-hidden className="pointer-events-none absolute inset-0 bg-white opacity-0" />

            {/* Camera Viewfinder Brackets + HUD */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <span className="ny-vf-corner ny-vf-tl" />
              <span className="ny-vf-corner ny-vf-tr" />
              <span className="ny-vf-corner ny-vf-bl" />
              <span className="ny-vf-corner ny-vf-br" />
            </div>

            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              <span className="size-2 animate-ny-rec rounded-full bg-[#ff5c4d]" aria-hidden />
              PINHOLE · {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </div>

            <div className="absolute right-4 top-4 hidden rounded-full bg-black/45 px-3 py-1.5 font-mono text-[11px] text-white/90 backdrop-blur-md sm:block">
              {fStopMode} · {current.shutter} · {current.lens}
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-5 pt-20 text-white sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-lg">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-accent">
                    Born {current.year} · {current.place} · Gen {current.generation}
                  </p>
                  <h3 className="ny-title mt-1 text-2xl !text-white sm:text-3xl">{current.caption}</h3>
                  <p className="mt-2 text-sm italic text-white/85">“{current.quote}”</p>
                </div>
                <button
                  type="button"
                  onClick={() => onInspectMember(current.memberId)}
                  className="ny-btn ny-btn-gold ny-btn-sm shrink-0"
                >
                  Open profile drawer →
                </button>
              </div>
            </div>
          </div>

          {/* Shutter Controls & Contact Strip */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void shutterTo(indexRef.current - 1)}
                aria-label="Previous portrait"
                className="ny-btn ny-btn-ghost ny-btn-sm size-10 !p-0"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => void shutterTo(indexRef.current + 1)}
                className="ny-btn ny-btn-primary ny-btn-sm"
              >
                <Aperture className="size-4" aria-hidden />
                Fire shutter
              </button>
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                className="ny-btn ny-btn-ghost ny-btn-sm"
              >
                {paused ? "Resume reel" : "Pause"}
              </button>
              <button
                type="button"
                onClick={() => void shutterTo(indexRef.current + 1)}
                aria-label="Next portrait"
                className="ny-btn ny-btn-ghost ny-btn-sm size-10 !p-0"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {PORTRAIT_SPOTLIGHTS.map((item, i) => (
                <button
                  key={item.memberId}
                  type="button"
                  onClick={() => void shutterTo(i)}
                  aria-label={`Focus portrait of ${item.caption}`}
                  aria-current={i === index}
                  className={cn(
                    "size-11 overflow-hidden rounded-xl border-2 transition",
                    i === index ? "scale-105 border-brand-accent shadow-gold" : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <img src={item.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-top" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Sheet Roll */}
        <aside className="ny-card flex flex-col gap-3 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <p className="ny-eyebrow flex items-center gap-1.5">
              <Camera className="size-3.5" aria-hidden />
              35mm Contact Sheet
            </p>
            <SimulatedBadge label="Drive sync Phase 2" />
          </div>
          <ol className="ny-scroll max-h-[26rem] space-y-2.5 overflow-y-auto pr-1">
            {PORTRAIT_SPOTLIGHTS.map((item, i) => (
              <li key={item.memberId}>
                <button
                  type="button"
                  onClick={() => void shutterTo(i)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition",
                    i === index
                      ? "border-brand-primary bg-brand-primary/8"
                      : "border-hairline bg-surface-0/65 hover:border-brand-primary/40",
                  )}
                >
                  <img
                    src={item.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="size-14 shrink-0 rounded-xl object-cover object-top"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[10px] font-semibold text-brand-secondary">
                      EXP #{String(i + 1).padStart(2, "0")} · {item.lens}
                    </span>
                    <span className="mt-0.5 block truncate text-sm font-semibold text-text-primary">{item.caption}</span>
                    <span className="block truncate text-xs text-text-tertiary">{item.place}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}

/* ─── S9 · Elders Council (65+) & Minors/Wards Roster ─────────────────── */

export function EldersAndWardsSection({
  members,
  canSendLink,
  onInspect,
  onReceiveLink,
  onMessage,
}: {
  members: Member[];
  canSendLink: boolean;
  onInspect: (id: string) => void;
  onReceiveLink: (id: string) => void;
  onMessage: (id: string) => void;
}) {
  const elders = members
    .filter((m) => m.deathYear === undefined && ageOf(m.birthYear) >= 60)
    .sort((a, b) => a.birthYear - b.birthYear)
    .slice(0, 6);

  const wards = members
    .filter((m) => m.ward || ageOf(m.birthYear, m.deathYear) < 18)
    .slice(0, 6);

  const byId = new Map(members.map((m) => [m.id, m]));

  return (
    <section id="elders-wards" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S9 · Old and young together"
        title="Our Elders Council & next-generation wards"
        description="Elders receive money with a 4-digit PIN and OTP link — no login required. Minors and wards stay linked to their guardians and school-fee plans."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Elders 60+/65+ */}
        <div className="ny-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="ny-eyebrow">Council of Elders</p>
              <h3 className="ny-title mt-1 text-2xl">Senior household heads</h3>
            </div>
            <span className="ny-chip ny-chip-gold">
              <Heart className="size-3.5" aria-hidden />
              PIN receive ready
            </span>
          </div>

          <ul className="mt-5 space-y-3">
            {elders.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-0/70 p-3.5"
              >
                <button type="button" onClick={() => onInspect(e.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <Avatar member={e} size={48} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-text-primary">
                      {e.preferredName} {e.lastName}
                    </span>
                    <span className="block truncate text-xs text-text-tertiary">
                      Age {ageOf(e.birthYear)} · {e.homeTown}, {e.county} · {e.preferredChannel}
                    </span>
                  </span>
                </button>
                <div className="flex items-center gap-1.5">
                  {canSendLink && (
                    <button
                      type="button"
                      onClick={() => onReceiveLink(e.id)}
                      className="ny-btn ny-btn-gold ny-btn-sm"
                    >
                      <KeyRound className="size-3.5" aria-hidden />
                      Send link
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onMessage(e.id)}
                    aria-label={`Message ${e.preferredName}`}
                    className="ny-btn ny-btn-ghost ny-btn-sm size-9 p-0"
                  >
                    <MessageCircle className="size-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Minors & Wards */}
        <div className="ny-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="ny-eyebrow">Minors & guardianship</p>
              <h3 className="ny-title mt-1 text-2xl">Wards & school learners</h3>
            </div>
            <Link href="/dashboard/foundation" className="ny-chip ny-chip-violet hover:opacity-90">
              Foundation bursaries →
            </Link>
          </div>

          <ul className="mt-5 space-y-3">
            {wards.map((w) => {
              const guardian = w.parentId ? byId.get(w.parentId) : undefined;
              return (
                <li
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-surface-0/70 p-3.5"
                >
                  <button type="button" onClick={() => onInspect(w.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <Avatar member={w} size={46} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-semibold text-text-primary">
                        <span className="truncate">{w.preferredName} {w.lastName}</span>
                        {w.adopted && <span className="ny-chip ny-chip-violet py-0 text-[10px]">Adopted</span>}
                      </span>
                      <span className="block truncate text-xs text-text-tertiary">
                        Age {ageOf(w.birthYear)} · {w.profession} · Guardian: {guardian?.preferredName ?? "Family council"}
                      </span>
                    </span>
                  </button>
                  <BranchChip branchId={w.branchId} />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─── S10 · Demographics Explorer (clickable county & generation bars) ── */

export function DemographicsSection({
  members,
  onFilterCounty,
  onFilterGen,
}: {
  members: Member[];
  onFilterCounty: (county: string) => void;
  onFilterGen: (gen: number) => void;
}) {
  const genCounts = new Map<number, number>();
  const countyCounts = new Map<string, number>();
  let totalWallet = 0;
  let totalShares = 0;

  for (const m of members) {
    genCounts.set(m.generation, (genCounts.get(m.generation) ?? 0) + 1);
    countyCounts.set(m.county, (countyCounts.get(m.county) ?? 0) + 1);
    totalWallet += m.walletKes;
    totalShares += m.saccoShares;
  }

  const gens = Array.from(genCounts.entries()).sort((a, b) => a[0] - b[0]);
  const maxGen = Math.max(...gens.map((g) => g[1]), 1);

  const counties = Array.from(countyCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const maxCounty = Math.max(...counties.map((c) => c[1]), 1);

  return (
    <section id="demographics" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S10 · Family demographics"
        title="Counties, generations & Sacco participation"
        description="Click any county or generation bar below to immediately filter the directory table above — zero page reload."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="ny-card space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="ny-title text-xl">By generation</h3>
            <span className="ny-chip">Total Sacco shares: {totalShares}</span>
          </div>
          <ul className="space-y-3.5">
            {gens.map(([gen, count]) => (
              <li key={gen}>
                <button
                  type="button"
                  onClick={() => onFilterGen(gen)}
                  className="grid w-full grid-cols-[5.5rem_1fr_3rem] items-center gap-4 rounded-xl p-1.5 text-left transition hover:bg-surface-0"
                >
                  <GenChip generation={gen} />
                  <BarMeter value={count} max={maxGen} color={GEN_HEX[(gen - 1) % GEN_HEX.length]} />
                  <span className="ny-num text-right text-sm font-semibold">{count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="ny-card space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="ny-title text-xl">Top counties & diaspora</h3>
            <span className="ny-chip ny-chip-gold">Combined wallets: {kes(totalWallet, { compact: true })}</span>
          </div>
          <ul className="space-y-3">
            {counties.map(([county, count]) => (
              <li key={county}>
                <button
                  type="button"
                  onClick={() => onFilterCounty(county)}
                  className="grid w-full grid-cols-[8rem_1fr_3rem] items-center gap-4 rounded-xl p-1.5 text-left transition hover:bg-surface-0"
                >
                  <span className="truncate text-sm font-semibold text-text-secondary">{county}</span>
                  <BarMeter value={count} max={maxCounty} color="#1F4D3A" />
                  <span className="ny-num text-right text-sm font-semibold">{count}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ─── S11 · Directory Operations Hub (Import · Merge · Export · Activity) ─ */

export function OperationsHub({
  canAdmin,
  activityLog,
  onBulkImport,
  onMergeDuplicates,
  onExport,
  onNewRequest,
}: {
  canAdmin: boolean;
  activityLog: Array<{ id: string; at: string; text: string }>;
  onBulkImport: () => void;
  onMergeDuplicates: () => void;
  onExport: () => void;
  onNewRequest: () => void;
}) {
  return (
    <section id="operations" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S11 · Directory operations"
        title="Keep the Nalyanya roll clean & portable"
        description="Import a branch spreadsheet, resolve duplicate entries safely, export a printable elder book, or trace every action taken in this session."
      />

      <div className="ny-stage-3d grid gap-4 md:grid-cols-3">
        <TiltCard max={4}>
          <article className="ny-card flex h-full flex-col p-6">
            <span className="grid size-11 place-items-center rounded-2xl bg-brand-primary/10 text-brand-primary">
              <FileSpreadsheet className="size-5" aria-hidden />
            </span>
            <h3 className="ny-title mt-4 text-xl">Bulk CSV import wizard</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Paste or upload a branch spreadsheet, map columns, validate Kenyan +254 numbers, and insert rows live.
            </p>
            <div className="mt-auto pt-5">
              {canAdmin ? (
                <button type="button" onClick={onBulkImport} className="ny-btn ny-btn-primary ny-btn-sm">
                  <Upload className="size-4" aria-hidden />
                  Open import wizard
                </button>
              ) : (
                <button type="button" onClick={onNewRequest} className="ny-btn ny-btn-ghost ny-btn-sm">
                  Request admin import
                </button>
              )}
            </div>
          </article>
        </TiltCard>

        <TiltCard max={4}>
          <article className="ny-card flex h-full flex-col p-6">
            <span className="grid size-11 place-items-center rounded-2xl bg-brand-accent-soft text-[#7a5a12]">
              <Merge className="size-5" aria-hidden />
            </span>
            <h3 className="ny-title mt-4 text-xl">Merge duplicate records</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Two possible duplicate profiles flagged across Kitale and Nakuru. Compare fields side-by-side before merging.
            </p>
            <div className="mt-auto pt-5">
              {canAdmin ? (
                <button type="button" onClick={onMergeDuplicates} className="ny-btn ny-btn-gold ny-btn-sm">
                  <Merge className="size-4" aria-hidden />
                  Open merge wizard
                </button>
              ) : (
                <span className="ny-chip">Admin-only stewardship</span>
              )}
            </div>
          </article>
        </TiltCard>

        <TiltCard max={4}>
          <article className="ny-card flex h-full flex-col p-6">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#ece5f5] text-foundation">
              <Download className="size-5" aria-hidden />
            </span>
            <h3 className="ny-title mt-4 text-xl">Export & elder large-print</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Download the filtered directory as CSV or JSON, or prepare a clean reunion attendance roll for elders.
            </p>
            <div className="mt-auto pt-5">
              <button type="button" onClick={onExport} className="ny-btn ny-btn-ghost ny-btn-sm">
                <Download className="size-4" aria-hidden />
                Open export options
              </button>
            </div>
          </article>
        </TiltCard>
      </div>

      {/* Session activity log */}
      <div className="ny-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="ny-eyebrow">Live directory journal</p>
          <span className="ny-chip ny-chip-sim">Audit trail · local phase</span>
        </div>
        <ul className="mt-3 divide-y divide-hairline text-sm">
          {activityLog.slice(0, 6).map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <span className="text-text-primary">{item.text}</span>
              <span className="font-mono text-xs text-text-tertiary">{item.at}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
