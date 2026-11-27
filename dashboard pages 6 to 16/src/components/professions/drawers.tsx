"use client";

import { useState } from "react";
import { BadgeCheck, Eye, ImagePlus, MessageSquare, Pencil, Share2, ShieldCheck, Trash2, UserPlus, X } from "lucide-react";
import { Drawer } from "@/components/ui/overlay";
import { Tabs } from "@/components/ui/primitives";
import { kes } from "@/lib/format";
import {
  BRANCHES,
  UNIT_LABEL,
  countFilters,
  emptyFilters,
  fmtDate,
  maskPhone,
  type Branch,
  type Category,
  type Endorsement,
  type Filters,
  type Pro,
  type Review,
  type Shot,
} from "@/data/dashboard/professions";
import { Stars } from "./cards";
import type { PfOverlay } from "./use-overlay";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Services" },
  { id: "contact", label: "Contact" },
  { id: "reviews", label: "Reviews" },
  { id: "gallery", label: "Gallery" },
];

/* ------------------------------------------------------------------ */
/* D1 — Profile detail drawer (five tabs, deep-linked ?o=profile&id=…&t=…) */
/* ------------------------------------------------------------------ */
export function ProfileDrawer({
  pro,
  cat,
  rating,
  approved,
  reviews,
  endorsements,
  revealed,
  initialTab,
  onOpen,
  onClose,
}: {
  pro: Pro;
  cat: Category | undefined;
  rating: { avg: number; count: number };
  approved: number;
  reviews: Review[];
  endorsements: Endorsement[];
  revealed: boolean;
  initialTab: string;
  onOpen: (k: PfOverlay, id?: string, t?: string) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const off = cat ? !cat.enabled : false;
  const endorsed = endorsements.filter((e) => e.status === "approved");

  return (
    <Drawer
      open
      onClose={onClose}
      title={pro.name}
      sub={`${pro.ref} · ${pro.role} · ${pro.town}`}
      width="max-w-[620px]"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onOpen("remove", pro.id)}>
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </button>
          <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onOpen("endorse", pro.id)}>
            <BadgeCheck className="h-3.5 w-3.5" /> Endorse
          </button>
          <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={off} onClick={() => onOpen("contact", pro.id)}>
            <MessageSquare className="h-3.5 w-3.5" /> Ask for help
          </button>
        </>
      }
    >
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="pt-4">
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="ny-inset flex items-center gap-4 px-4 py-3.5">
              <span className="pf-avatar pf-avatar--lg">{pro.initials}</span>
              <div className="min-w-0">
                <p className="ny-display text-lg leading-tight">{pro.name}</p>
                <p className="text-sm text-text-secondary">{pro.role}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <Stars value={rating.avg} />
                  <span className="ny-hud !text-[0.55rem]">
                    {rating.count} review{rating.count === 1 ? "" : "s"} · {approved} endorsed
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className={`ny-chip ${pro.kind === "family" ? "ny-chip-ok" : "ny-chip-neutral"}`}>{pro.kind === "family" ? "Family member" : "Friend of the family"}</span>
              <span className="ny-chip ny-chip-brand">{cat?.name ?? "Uncategorised"}</span>
              {pro.verified ? (
                <span className="ny-chip ny-chip-ok pf-verified">
                  <BadgeCheck className="h-3 w-3" /> Verified by family
                </span>
              ) : (
                <span className="ny-chip ny-chip-neutral">Not yet verified</span>
              )}
              {off && <span className="ny-chip ny-chip-danger">Category switched off</span>}
            </div>

            <p className="text-sm leading-relaxed text-text-secondary">{pro.bio}</p>

            <dl className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
              {[
                ["Relationship", pro.relation],
                ["Town", pro.town],
                ["Branch", pro.branch],
                ["Experience", `${pro.years} years`],
                ["Languages", pro.languages.join(", ")],
                ["Availability", pro.availability],
                ["Working with us since", fmtDate(pro.since)],
                ["Rate", `${kes(pro.rateKes)} ${UNIT_LABEL[pro.rateUnit]}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                  <dt className="ny-hud">{k}</dt>
                  <dd className="mt-1 text-sm font-medium text-text-primary">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {tab === "services" && (
          <div className="space-y-4">
            <div>
              <p className="ny-hud mb-2">What they do</p>
              <ul className="flex flex-wrap gap-1.5">
                {pro.services.map((s) => (
                  <li key={s} className="ny-chip ny-chip-neutral">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="ny-card-flat grid grid-cols-2 gap-3 p-4">
              <div>
                <p className="ny-hud">Rate</p>
                <p className="ny-num ny-display text-xl">{kes(pro.rateKes)}</p>
                <p className="text-xs text-text-tertiary">{UNIT_LABEL[pro.rateUnit]}</p>
              </div>
              <div>
                <p className="ny-hud">Transport</p>
                <p className="ny-num ny-display text-xl">{pro.transportKes ? kes(pro.transportKes) : "None"}</p>
                <p className="text-xs text-text-tertiary">{pro.transportKes ? "added when travel is needed" : "work comes to you"}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onOpen("quote", pro.id)}>
                Get a rough quote
              </button>
              <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onOpen("edit", pro.id)}>
                <Pencil className="h-3.5 w-3.5" /> Edit listing
              </button>
            </div>
          </div>
        )}

        {tab === "contact" && (
          <div className="space-y-4">
            <div className="ny-inset px-4 py-3.5">
              <p className="ny-hud">Phone</p>
              <p className={`ny-num mt-1 text-lg font-semibold ${revealed ? "pf-reveal is-open" : "pf-reveal"}`} aria-label={revealed ? pro.phone : "Phone hidden until you confirm"}>
                {revealed ? pro.phone : maskPhone(pro.phone)}
              </p>
              {!revealed && (
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-3" onClick={() => onOpen("reveal", pro.id)}>
                  <Eye className="h-3.5 w-3.5" /> Show the number
                </button>
              )}
            </div>
            <dl className="grid grid-cols-[minmax(0,1fr)] gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                <dt className="ny-hud">WhatsApp</dt>
                <dd className="mt-1 font-medium">{pro.whatsapp ? "Available" : "Not on WhatsApp"}</dd>
              </div>
              <div className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                <dt className="ny-hud">Email</dt>
                <dd className={`mt-1 font-medium ${revealed ? "" : "pf-reveal"}`}>{pro.email || "Not given"}</dd>
              </div>
            </dl>
            <button type="button" className="ny-btn ny-btn-accent w-full" disabled={off} onClick={() => onOpen("contact", pro.id)}>
              <UserPlus className="h-4 w-4" /> Ask for help (logs a request)
            </button>
            <p className="ny-chip ny-chip-sim">SIMULATED · WhatsApp, SMS and email connect when the backend is wired</p>
          </div>
        )}

        {tab === "reviews" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Stars value={rating.avg} />
                <span className="ny-num text-sm font-semibold">{rating.avg ? rating.avg.toFixed(1) : "—"}</span>
              </div>
              <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onOpen("review", pro.id)}>
                Write a review
              </button>
            </div>
            {reviews.length === 0 && <p className="ny-inset px-4 py-6 text-center text-sm text-text-secondary">No reviews yet. Be the first to tell the family how it went.</p>}
            {reviews.map((r) => (
              <article key={r.id} className="pf-review">
                <div className="flex items-center justify-between gap-2">
                  <Stars value={r.stars} />
                  <span className="ny-hud !text-[0.52rem]">{fmtDate(r.at)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{r.text}</p>
                <p className="ny-hud mt-2 !text-[0.52rem]">{r.by}</p>
              </article>
            ))}
            <p className="ny-hud">Endorsed by {endorsed.length} family member{endorsed.length === 1 ? "" : "s"}</p>
          </div>
        )}

        {tab === "gallery" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {pro.portfolio.map((shot: Shot, i: number) => (
                <button key={shot.src + i} type="button" className="pf-thumb text-left" onClick={() => onOpen("photo", pro.id, String(i))} aria-label={`Open photo ${i + 1}: ${shot.caption}`}>
                  <img src={shot.src} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
            <button type="button" className="ny-btn ny-btn-outline ny-btn-sm w-full" onClick={() => onOpen("photo-add", pro.id)}>
              <ImagePlus className="h-3.5 w-3.5" /> Add portfolio photos (SIMULATED)
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-t border-border-subtle pt-4">
        <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onOpen("share", pro.id)}>
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
        {!pro.verified && (
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onOpen("verify", pro.id)}>
            <ShieldCheck className="h-3.5 w-3.5" /> Grant family badge
          </button>
        )}
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* D2 — Filters for the directory (branch, town, type, verified)           */
/* ------------------------------------------------------------------ */
export function FiltersDrawer({
  value,
  towns,
  matched,
  onChange,
  onClose,
}: {
  value: Filters;
  towns: string[];
  matched: number;
  onChange: (f: Filters) => void;
  onClose: () => void;
}) {
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => onChange({ ...value, [k]: v });
  const chip = (on: boolean) => `ny-chip ny-touch ${on ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`;
  return (
    <Drawer
      open
      onClose={onClose}
      title="Filter the directory"
      sub={`${countFilters(value)} filter${countFilters(value) === 1 ? "" : "s"} active · ${matched} people match`}
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onChange(emptyFilters)}>
            <X className="h-3.5 w-3.5" /> Clear all
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
            Show {matched} people
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <span className="ny-label">Who</span>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "family", "friend"] as const).map((k) => (
              <button key={k} type="button" className={chip(value.kind === k)} onClick={() => set("kind", k)}>
                {k === "all" ? "Everyone" : k === "family" ? "Family members" : "Friends of the family"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="ny-label">Branch</span>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={chip(value.branch === "all")} onClick={() => set("branch", "all")}>
              any
            </button>
            {BRANCHES.map((b: Branch) => (
              <button key={b} type="button" className={chip(value.branch === b)} onClick={() => set("branch", b)}>
                {b}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="ny-label" htmlFor="pf-town">Town</label>
          <select id="pf-town" className="ny-select" value={value.town} onChange={(e) => set("town", e.target.value)}>
            <option value="all">Any town</option>
            {towns.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3">
          <div>
            <p className="text-sm font-semibold">Verified by family only</p>
            <p className="ny-hud mt-0.5 !text-[0.52rem]">People an admin has vouched for</p>
          </div>
          <button type="button" role="switch" aria-checked={value.verified} aria-label="Verified only" className="pf-switch" onClick={() => set("verified", !value.verified)} />
        </div>
        <div className="ny-inset px-3.5 py-3 text-xs leading-relaxed text-text-secondary">
          Filters apply to the directory at once. The profile you open stays deep-linked, so the back button closes it first.
        </div>
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* D3 — Endorsement review queue (admin)                                     */
/* ------------------------------------------------------------------ */
export function ReviewQueueDrawer({
  endorsements,
  nameOf,
  onModerate,
  onClose,
}: {
  endorsements: Endorsement[];
  nameOf: (pid: string) => string;
  onModerate: (eid: string) => void;
  onClose: () => void;
}) {
  const pending = endorsements.filter((e) => e.status === "pending");
  const done = endorsements.filter((e) => e.status !== "pending");
  return (
    <Drawer
      open
      onClose={onClose}
      title="Endorsement queue"
      sub={`${pending.length} waiting · ${done.length} decided`}
      width="max-w-[580px]"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="space-y-5">
        <div>
          <p className="ny-hud mb-2">Waiting for an admin</p>
          <ul className="space-y-2">
            {pending.map((e) => (
              <li key={e.id} className="rounded-lg border border-border-subtle bg-surface-1 px-3.5 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{nameOf(e.pid)}</p>
                    <p className="ny-hud mt-0.5 !text-[0.52rem]">{e.by} · {fmtDate(e.at)}</p>
                  </div>
                  <span className="ny-chip ny-chip-warn ny-pulse">pending</span>
                </div>
                <p className="mt-2 text-sm italic text-text-secondary">&ldquo;{e.note}&rdquo;</p>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm mt-2" onClick={() => onModerate(e.id)}>
                  Moderate
                </button>
              </li>
            ))}
            {pending.length === 0 && <li className="ny-inset px-4 py-5 text-center text-sm text-text-secondary">Nothing waiting. The queue is clear.</li>}
          </ul>
        </div>
        <div>
          <p className="ny-hud mb-2">Decided</p>
          <ul className="space-y-1.5">
            {done.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle px-3 py-2 text-sm">
                <span className="min-w-0 truncate">
                  {nameOf(e.pid)} · {e.by}
                  {e.reason ? ` · ${e.reason}` : ""}
                </span>
                <span className={`ny-chip shrink-0 ${e.status === "approved" ? "ny-chip-ok" : "ny-chip-danger"}`}>{e.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Drawer>
  );
}

