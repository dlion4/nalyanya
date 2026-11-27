"use client";

import { type MouseEvent } from "react";
import { BadgeCheck, Star } from "lucide-react";
import { kes } from "@/lib/format";
import { UNIT_LABEL, type Category, type Pro } from "@/data/dashboard/professions";

/* Star row — fills by rounded average, with an accessible label. */
export function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={value ? `${value} out of 5` : "No reviews yet"}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`pf-star ${i <= full ? "is-on" : ""}`} />
      ))}
    </span>
  );
}

/* Shared pointer-tilt: writes --rx/--ry on the card face so the 3D follows the cursor. */
function tiltMove(e: MouseEvent<HTMLDivElement>) {
  const card = e.currentTarget.firstElementChild as HTMLElement | null;
  if (!card) return;
  const r = e.currentTarget.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width - 0.5;
  const py = (e.clientY - r.top) / r.height - 0.5;
  card.style.setProperty("--rx", `${(-py * 8).toFixed(2)}deg`);
  card.style.setProperty("--ry", `${(px * 11).toFixed(2)}deg`);
}

function tiltReset(e: MouseEvent<HTMLDivElement>) {
  const card = e.currentTarget.firstElementChild as HTMLElement | null;
  card?.style.setProperty("--rx", "0deg");
  card?.style.setProperty("--ry", "0deg");
}

/* ------------------------------------------------------------------ */
/* Profile card — image, name, role, stars, endorsement count, rate      */
/* ------------------------------------------------------------------ */
export function ProCard({
  pro,
  cat,
  rating,
  approved,
  flash,
  onOpen,
}: {
  pro: Pro;
  cat: Category | undefined;
  rating: { avg: number; count: number };
  approved: number;
  flash: boolean;
  onOpen: () => void;
}) {
  const off = cat ? !cat.enabled : false;
  return (
    <div className="perspective-[1050px] h-full" onMouseMove={tiltMove} onMouseLeave={tiltReset}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${pro.name}`}
        className={`pf-card w-full text-left ${off ? "is-off" : ""} ${flash ? "pf-flash-posted" : ""}`}
        style={{ transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" }}
      >
        <span className="pf-card__media">
          <img src={pro.image} alt="" className="pf-card__img" loading="lazy" decoding="async" />
          <span className="pf-card__sheen" aria-hidden />
        </span>
        <span className="flex flex-1 flex-col gap-2.5 p-4">
          <span className="flex items-start justify-between gap-3">
            <span className="min-w-0">
              <span className="ny-display block truncate text-[1.02rem] leading-tight">{pro.name}</span>
              <span className="mt-0.5 block truncate text-sm text-text-secondary">{pro.role}</span>
            </span>
            <span className="pf-avatar">{pro.initials}</span>
          </span>
          <span className="flex flex-wrap gap-1.5">
            <span className="ny-chip ny-chip-brand">{cat?.name ?? "Uncategorised"}</span>
            <span className={`ny-chip ${pro.kind === "family" ? "ny-chip-ok" : "ny-chip-neutral"}`}>{pro.kind === "family" ? "family" : "friend"}</span>
            {pro.verified && (
              <span className="ny-chip ny-chip-ok pf-verified">
                <BadgeCheck className="h-3 w-3" /> verified
              </span>
            )}
            {off && <span className="ny-chip ny-chip-danger">category off</span>}
          </span>
          <span className="flex items-center justify-between gap-2">
            <Stars value={rating.avg} />
            <span className="ny-hud !text-[0.55rem]">
              {rating.count} review{rating.count === 1 ? "" : "s"} · {approved} endorsed
            </span>
          </span>
          <span className="ny-hud !text-[0.55rem]">{pro.town}</span>
          <span className="mt-auto flex items-baseline justify-between gap-2 pt-1">
            <span className="ny-num font-semibold">{kes(pro.rateKes)}</span>
            <span className="text-xs text-text-tertiary">{UNIT_LABEL[pro.rateUnit]}</span>
          </span>
        </span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Category tile — 3D on hover, a switch that opens confirmation when turned off */
/* ------------------------------------------------------------------ */
export function CatTile({
  cat,
  count,
  onToggle,
  onRename,
}: {
  cat: Category;
  count: number;
  onToggle: () => void;
  onRename: () => void;
}) {
  return (
    <div className="h-full">
      <article className={`pf-cat ${cat.enabled ? "" : "is-off"}`}>
        <img src={cat.image} alt="" className="pf-cat__img" loading="lazy" decoding="async" />
        <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="ny-display truncate text-base leading-tight">{cat.name}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">{cat.blurb}</p>
            </div>
            <span className="ny-num shrink-0 text-lg font-semibold">{count}</span>
          </div>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <button type="button" role="switch" aria-checked={cat.enabled} aria-label={`Offer ${cat.name}`} className="pf-switch" onClick={onToggle} />
            <span className="ny-hud !text-[0.52rem]">{cat.enabled ? "open to listings" : "switched off"}</span>
            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={onRename}>
              Rename
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

/* A thin meter for endorsement counts. */
export function Meter({ value, max }: { value: number; max: number }) {
  const p = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
  return (
    <div className="pf-meter" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <span className="pf-meter__bar" style={{ ["--p" as string]: p }} />
    </div>
  );
}
