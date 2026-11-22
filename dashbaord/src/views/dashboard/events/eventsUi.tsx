"use client";

import {
  BookOpen,
  Cake,
  GraduationCap,
  Handshake,
  HandCoins,
  Flower2,
  Heart,
  Sparkles,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import { TODAY_ISO } from "@/lib/calendar";
import { cn } from "@/lib/format";
import { EVENT_KINDS, rsvpSummary, type EventKind, type EventStatus, type FamilyEvent } from "@/data/dashboard/events";

const ICONS: Record<string, LucideIcon> = {
  Users,
  Heart,
  Flower2,
  Cake,
  GraduationCap,
  Sparkles,
  HandCoins,
  Handshake,
  BookOpen,
  Stethoscope,
};

export function kindAccent(kind: EventKind): string {
  return EVENT_KINDS.find((k) => k.kind === kind)?.accent ?? "#1F4D3A";
}

export function KindIcon({ kind, className }: { kind: EventKind; className?: string }) {
  const meta = EVENT_KINDS.find((k) => k.kind === kind) ?? EVENT_KINDS[0];
  const Icon = ICONS[meta.icon];
  return <Icon className={cn("size-4", className)} aria-hidden />;
}

export function KindChip({ kind, className }: { kind: EventKind; className?: string }) {
  const accent = kindAccent(kind);
  return (
    <span
      className={cn("ny-chip gap-1.5", className)}
      style={{ color: accent, background: `${accent}1f`, borderColor: `${accent}55` }}
    >
      <KindIcon kind={kind} className="size-3.5" />
      {kind}
    </span>
  );
}

export function EventStatusChip({ status, date }: { status: EventStatus; date?: string }) {
  if (status === "scheduled" && date === TODAY_ISO) {
    return (
      <span className="ny-chip ny-chip-solid">
        <span className="size-2 animate-ny-pulse rounded-full bg-[#7be3a6]" aria-hidden />
        Today
      </span>
    );
  }
  const map: Record<EventStatus, { label: string; cls: string }> = {
    draft: { label: "Draft", cls: "" },
    scheduled: { label: "Scheduled", cls: "ny-chip-info" },
    cancelled: { label: "Cancelled", cls: "ny-chip-danger" },
    done: { label: "Held", cls: "ny-chip-success" },
  };
  return <span className={cn("ny-chip", map[status].cls)}>{map[status].label}</span>;
}

export function RsvpMeter({ event, className }: { event: FamilyEvent; className?: string }) {
  const s = rsvpSummary(event);
  const pct = Math.min(100, Math.round((s.expected / Math.max(1, event.capacity)) * 100));
  return (
    <div className={cn("min-w-[9rem]", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="ny-num font-semibold text-text-primary">
          {s.going}
          <span className="font-normal text-text-tertiary">
            {" "}/ {s.total} going
          </span>
        </span>
        {s.pending > 0 && <span className="ny-num text-[11px] text-brand-secondary">{s.pending} waiting</span>}
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2" role="meter" aria-valuenow={s.going} aria-valuemin={0} aria-valuemax={s.total} aria-label="RSVP progress">
        <div className="h-full rounded-full bg-brand-primary transition-[width] duration-700 ease-out" style={{ width: `${Math.max(4, pct)}%` }} />
      </div>
    </div>
  );
}

export function EventCover({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={cn("object-cover", className)} />;
}

export interface EventFilters {
  q: string;
  kind: string;
  status: string;
  branch: string;
}

export function filterEvents(events: FamilyEvent[], f: EventFilters): FamilyEvent[] {
  const q = f.q.trim().toLowerCase();
  return events.filter((e) => {
    if (f.kind !== "all" && e.kind !== f.kind) return false;
    if (f.status !== "all" && e.status !== f.status) return false;
    if (f.branch !== "all" && e.branchId !== f.branch) return false;
    if (q) {
      const hay = `${e.title} ${e.id} ${e.kind} ${e.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function NumberedLabel({ n, label }: { n: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
      <span className="grid size-5 place-items-center rounded-full bg-surface-2 font-mono text-[10px] text-text-primary">{n}</span>
      {label}
    </span>
  );
}
