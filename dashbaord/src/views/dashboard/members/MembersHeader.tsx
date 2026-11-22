"use client";

import Link from "next/link";
import {
  Camera,
  Download,
  GitBranch,
  Merge,
  Sparkles,
  TreeDeciduous,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import { CountUp, Reveal, TiltCard } from "@/components/ui/motion";
import { cn } from "@/lib/format";

interface Props {
  totalMembers: number;
  branchCount: number;
  generationCount: number;
  eldersCount: number;
  minorsCount: number;
  pendingRequests: number;
  canAdmin: boolean;
  onAddMember: () => void;
  onBulkImport: () => void;
  onMergeDuplicates: () => void;
  onExport: () => void;
  onQuickFilter: (kind: "elders" | "minors" | "all") => void;
}

const SECTION_JUMPS = [
  { href: "#directory", label: "Directory table" },
  { href: "#add-member", label: "Add member" },
  { href: "#roles", label: "Roles & RBAC" },
  { href: "#requests", label: "Requests queue" },
  { href: "#portraits", label: "Shutter studio" },
  { href: "#elders-wards", label: "Elders & wards" },
  { href: "#demographics", label: "Demographics" },
  { href: "#operations", label: "Import & merge" },
];

/** S1 — Heritage Hero + 5-KPI Row (total · branches · generations · elders 65+ · minors/wards). */
export function MembersHeader(props: Props) {
  const {
    totalMembers,
    branchCount,
    generationCount,
    eldersCount,
    minorsCount,
    pendingRequests,
    canAdmin,
    onAddMember,
    onBulkImport,
    onMergeDuplicates,
    onExport,
    onQuickFilter,
  } = props;

  const kpis: Array<{
    label: string;
    value: number;
    note: string;
    accent: string;
    onClick?: () => void;
  }> = [
    {
      label: "Total members",
      value: totalMembers,
      note: "Active directory across every household",
      accent: "#1F4D3A",
      onClick: () => onQuickFilter("all"),
    },
    {
      label: "Family branches",
      value: branchCount,
      note: "From Kimilili to London diaspora",
      accent: "#E0764A",
    },
    {
      label: "Generations",
      value: generationCount,
      note: "Rooted at Mzee Victor (Gen 1)",
      accent: "#D4A437",
    },
    {
      label: "Elders (65+)",
      value: eldersCount,
      note: "Elder Mode & PIN-only receive ready",
      accent: "#6A4C93",
      onClick: () => onQuickFilter("elders"),
    },
    {
      label: "Minors & wards",
      value: minorsCount,
      note: "Guardian-managed profiles & school tracking",
      accent: "#3A7CA5",
      onClick: () => onQuickFilter("minors"),
    },
  ];

  return (
    <section aria-labelledby="members-heading" className="space-y-6">
      <div className="relative overflow-hidden rounded-[32px] border border-hairline bg-surface-1 shadow-soft">
        <div aria-hidden className="absolute inset-0">
          <img
            src="/images/family/reunion-attire.jpg"
            alt=""
            className="h-full w-full object-cover opacity-[0.19]"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-1 via-surface-1/94 to-surface-1/55" />
        </div>

        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div className="min-w-0">
            <p className="ny-eyebrow">S1 · T-3 · Members Directory</p>
            <h1 id="members-heading" className="ny-title mt-3 text-[2.5rem] leading-[1.02] sm:text-6xl">
              Every face in the <span className="italic text-brand-primary">Nalyanya home</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
              The searchable table companion to the 3D tree. Filter by branch, generation or county, inspect any relative&apos;s relations and
              Sacco shares, assign roles, and approve family edit requests — all without leaving the page.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="ny-chip ny-chip-gold">
                <Sparkles className="size-3.5" aria-hidden />
                TanStack Table v8 · Zero-reload overlays
              </span>
              {pendingRequests > 0 && (
                <a href="#requests" className="ny-chip ny-chip-warning transition hover:opacity-90">
                  {pendingRequests} requests awaiting approval
                </a>
              )}
              <Link href="/dashboard/lineage" className="ny-chip transition hover:border-brand-primary hover:text-brand-primary">
                <TreeDeciduous className="size-3.5" aria-hidden />
                Companion to T-2 3D tree →
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {canAdmin && (
                <button type="button" onClick={onAddMember} className="ny-btn ny-btn-primary">
                  <UserPlus className="size-4" aria-hidden />
                  Add member wizard
                </button>
              )}
              {canAdmin && (
                <button type="button" onClick={onBulkImport} className="ny-btn ny-btn-gold">
                  <Upload className="size-4" aria-hidden />
                  Bulk CSV import
                </button>
              )}
              {canAdmin && (
                <button type="button" onClick={onMergeDuplicates} className="ny-btn ny-btn-ghost">
                  <Merge className="size-4" aria-hidden />
                  Check duplicates
                </button>
              )}
              <button type="button" onClick={onExport} className="ny-btn ny-btn-ghost">
                <Download className="size-4" aria-hidden />
                Export roster
              </button>
            </div>

            <nav aria-label="Jump to a section" className="mt-7 flex flex-wrap gap-2">
              {SECTION_JUMPS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="ny-chip transition hover:border-brand-primary hover:text-brand-primary"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* 3D Heritage Portrait Collage Card */}
          <div className="ny-stage-3d mx-auto w-full max-w-md">
            <TiltCard max={6}>
              <div className="ny-card overflow-hidden p-4">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { src: "/images/family/mzee-victor.jpg", name: "Mzee Victor", gen: "Gen 1" },
                    { src: "/images/family/ruth.jpg", name: "Ruth Nekesa", gen: "Gen 2" },
                    { src: "/images/family/brian.jpg", name: "Brian Otieno", gen: "Gen 3" },
                    { src: "/images/family/grace.jpg", name: "Grace", gen: "Gen 2" },
                    { src: "/images/family/faith.jpg", name: "Faith Chebet", gen: "Gen 3" },
                    { src: "/images/family/ethan.jpg", name: "Ethan", gen: "Gen 4" },
                  ].map((p) => (
                    <figure key={p.src} className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface-2">
                      <img
                        src={p.src}
                        alt={p.name}
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-2 pb-1.5 pt-5 text-[10px] font-semibold text-white">
                        <span className="block truncate">{p.name}</span>
                        <span className="text-[9px] text-brand-accent">{p.gen}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
                <div className="mt-3.5 flex items-center justify-between gap-2 rounded-2xl bg-surface-0/85 px-3.5 py-2.5 text-xs">
                  <span className="flex items-center gap-2 font-semibold text-text-primary">
                    <Camera className="size-4 text-brand-secondary" aria-hidden />
                    Five generations in real portraits
                  </span>
                  <a href="#portraits" className="font-semibold text-brand-primary hover:underline">
                    Open shutter reel →
                  </a>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </div>

      {/* S1 — 5-KPI Row */}
      <div className="ny-stage-3d grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpis.map((kpi, index) => {
          const clickable = Boolean(kpi.onClick);
          return (
            <Reveal key={kpi.label} delay={index * 0.05}>
              <article
                onClick={kpi.onClick}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onKeyDown={
                  clickable
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          kpi.onClick?.();
                        }
                      }
                    : undefined
                }
                className={cn(
                  "ny-card ny-card-3d relative flex h-full flex-col overflow-hidden p-5",
                  clickable && "cursor-pointer hover:border-brand-primary",
                )}
              >
                <span aria-hidden className="absolute inset-x-0 top-0 h-1.5" style={{ background: kpi.accent }} />
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">{kpi.label}</p>
                  {index === 0 ? (
                    <Users className="size-4 text-text-tertiary" aria-hidden />
                  ) : index === 1 ? (
                    <GitBranch className="size-4 text-text-tertiary" aria-hidden />
                  ) : null}
                </div>
                <p className="ny-title mt-3 text-4xl leading-none">
                  <CountUp value={kpi.value} />
                </p>
                <p className="mt-2.5 text-xs leading-relaxed text-text-secondary">{kpi.note}</p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
