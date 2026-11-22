"use client";

import {
  Aperture,
  Cloud,
  CloudOff,
  FolderInput,
  HardDrive,
  ImagePlus,
  Lock,
  LoaderCircle,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Avatar } from "@/components/ui/Primitives";
import { ALBUMS, type AlbumVisibility, type PhotoSource, type SourceKind, type SyncState } from "@/data/dashboard/gallery";
import { dayMonth, longDate } from "@/lib/calendar";
import { cn } from "@/lib/format";

/* ─── Source icons & state ───────────────────────────────────────────── */

const SOURCE_ICON: Record<SourceKind, LucideIcon> = {
  "google-drive": Cloud,
  "direct-upload": ImagePlus,
  contributor: Users,
  scan: ScanLine,
};

export function SourceIcon({ kind, className }: { kind: SourceKind; className?: string }) {
  const Icon = SOURCE_ICON[kind] ?? Cloud;
  return <Icon className={cn("size-4", className)} aria-hidden />;
}

const SYNC_LABEL: Record<SyncState, { label: string; cls: string }> = {
  synced: { label: "Synced", cls: "ny-chip-success" },
  syncing: { label: "Syncing", cls: "ny-chip-info" },
  paused: { label: "Paused", cls: "" },
  error: { label: "Needs attention", cls: "ny-chip-danger" },
};

export function SyncChip({ state, className }: { state: SyncState; className?: string }) {
  const meta = SYNC_LABEL[state] ?? SYNC_LABEL.synced;
  return (
    <span className={cn("ny-chip", meta.cls, className)}>
      {state === "syncing" ? (
        <LoaderCircle className="size-3 animate-spin" aria-hidden />
      ) : state === "paused" || state === "error" ? (
        <CloudOff className="size-3" aria-hidden />
      ) : (
        <span className="size-1.5 rounded-full bg-success" aria-hidden />
      )}
      {meta.label}
    </span>
  );
}

/** "4 minutes ago", "2 hours ago", "3 days ago" from a minute count. */
export function ago(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.round(minutes / 60)} h ago`;
  return `${Math.round(minutes / 1440)} day${Math.round(minutes / 1440) === 1 ? "" : "s"} ago`;
}

export function bytesLabel(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
  return `${Math.round(mb)} MB`;
}

/* ─── Album & photo metadata ─────────────────────────────────────────── */

const VISIBILITY: Record<AlbumVisibility, { label: string; icon: LucideIcon; cls: string; hint: string }> = {
  "all-family": { label: "Whole family", icon: Users, cls: "ny-chip-success", hint: "Every signed-in relative can view" },
  branch: { label: "Branch only", icon: FolderInput, cls: "ny-chip-info", hint: "Only members of this branch can view" },
  "admins-only": { label: "Admins only", icon: Lock, cls: "ny-chip-violet", hint: "Family Head and admins only" },
};

export function VisibilityChip({ visibility, className }: { visibility: AlbumVisibility; className?: string }) {
  const meta = VISIBILITY[visibility] ?? VISIBILITY["all-family"];
  return (
    <span className={cn("ny-chip", meta.cls, className)} title={meta.hint}>
      <meta.icon className="size-3.5" aria-hidden />
      {meta.label}
    </span>
  );
}

export function visibilityHint(visibility: AlbumVisibility): string {
  return (VISIBILITY[visibility] ?? VISIBILITY["all-family"]).hint;
}

export function albumName(id: string): string {
  return ALBUMS.find((a) => a.id === id)?.name ?? "Unsorted";
}

/** "12 May 2025" from an ISO date, with the year. */
export function photoDate(iso: string): string {
  return longDate(iso).split(", ").slice(1).join(", ");
}

/** "12 May" without the year, for tight tile overlays. */
export function shortPhotoDate(iso: string): string {
  return dayMonth(iso);
}

/** Tile height class keyed by the crop ratio, so the box is reserved before load. */
export function ratioClass(ratio: number): string {
  if (ratio >= 1.5) return "aspect-[3/2]";
  if (ratio >= 1.4) return "aspect-[10/7]";
  if (ratio >= 1.0) return "aspect-square";
  if (ratio >= 0.8) return "aspect-[4/5]";
  if (ratio >= 0.72) return "aspect-[3/4]";
  return "aspect-[2/3]";
}

/** Small contributor chip used on tiles and in the uploader list. */
export function ContributorChip({ memberId, members, compact }: { memberId: string; members: Map<string, { preferredName: string; lastName: string; photo?: string; generation: number }>; compact?: boolean }) {
  const m = members.get(memberId);
  if (!m) return null;
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-text-secondary">
      <Avatar member={m} size={compact ? 20 : 24} className="!rounded-full" />
      <span className="truncate">{m.preferredName}</span>
    </span>
  );
}

export function SourceCount({ source }: { source: PhotoSource }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary">
      <HardDrive className="size-3.5" aria-hidden />
      <span className="ny-num">{source.photoCount}</span> photo{source.photoCount === 1 ? "" : "s"}
    </span>
  );
}

export function RetakeBadge({ className }: { className?: string }) {
  return (
    <span className={cn("ny-chip", className)}>
      <Aperture className="size-3.5" aria-hidden />
      Camera archive
    </span>
  );
}

export { RefreshCw, ShieldCheck };
