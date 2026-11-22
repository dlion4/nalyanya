"use client";

import type { ReactNode } from "react";
import { BRANCH_BY_ID } from "@/data/family/branches";
import { cn, initials } from "@/lib/format";
import type { Member } from "@/types/family";

/** Generation palette — mirrors --color-gen-* in tokens.css (for inline SVG / canvas). */
export const GEN_HEX = ["#D4A437", "#4FAE86", "#E0764A", "#A284DC", "#4FC1B0", "#6FA8DC"];

export function genColor(generation: number): string {
  return GEN_HEX[(generation - 1) % GEN_HEX.length];
}

export function SimulatedBadge({ label = "SIMULATED", className }: { label?: string; className?: string }) {
  return (
    <span className={cn("ny-chip ny-chip-sim", className)} title="Connects when the backend is wired">
      <span className="size-1.5 rounded-full bg-brand-secondary" aria-hidden />
      {label}
    </span>
  );
}

export function GenChip({ generation, className }: { generation: number; className?: string }) {
  const color = genColor(generation);
  return (
    <span className={cn("ny-chip", className)} style={{ color, background: `${color}1f`, borderColor: `${color}55` }}>
      Gen {generation}
    </span>
  );
}

export function BranchChip({ branchId, className }: { branchId: string; className?: string }) {
  const branch = BRANCH_BY_ID[branchId];
  if (!branch) return null;
  return (
    <span className={cn("ny-chip", className)} style={{ borderColor: `${branch.color}66` }}>
      <span className="size-2 rounded-full" style={{ background: branch.color }} aria-hidden />
      {branch.shortName}
    </span>
  );
}

export function Avatar({
  member,
  size = 40,
  className,
}: {
  member: Pick<Member, "preferredName" | "photo" | "generation">;
  size?: number;
  className?: string;
}) {
  const color = genColor(member.generation);
  const style = { width: size, height: size };
  if (member.photo) {
    return (
      <img
        src={member.photo}
        alt={`Photo of ${member.preferredName}`}
        loading="lazy"
        decoding="async"
        style={style}
        className={cn("rounded-2xl object-cover ring-2 ring-white", className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{ ...style, background: `${color}22`, color, borderColor: `${color}66` }}
      className={cn("grid shrink-0 place-items-center rounded-2xl border font-display text-sm font-semibold", className)}
    >
      {initials(member.preferredName)}
    </span>
  );
}

export function StatusChip({ status }: { status: "received" | "pending" | "quarantined" | "applied" | "rejected" }) {
  const map = {
    received: "ny-chip-success",
    applied: "ny-chip-success",
    pending: "ny-chip-warning",
    quarantined: "ny-chip-danger",
    rejected: "ny-chip-danger",
  } as const;
  return <span className={cn("ny-chip", map[status])}>{status}</span>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow && <p className="ny-eyebrow">{eyebrow}</p>}
        <h2 className="ny-title mt-2 text-3xl sm:text-[2.6rem] sm:leading-[1.05]">{title}</h2>
        {description && <p className="mt-3 text-base leading-relaxed text-text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
