"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CircleUserRound,
  FileSpreadsheet,
  Flower2,
  GitFork,
  HandCoins,
  HeartHandshake,
  Images,
  Landmark,
  Link2,
  Megaphone,
  Settings2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { pageBySlug, type DashboardPageMeta } from "@/data/dashboard/page-map";
import { CountUp, Reveal } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlay";

const icons: Record<string, LucideIcon> = {
  "git-fork": GitFork,
  users: Users,
  "calendar-days": CalendarDays,
  images: Images,
  "flower-2": Flower2,
  landmark: Landmark,
  "link-2": Link2,
  "hand-coins": HandCoins,
  "heart-handshake": HeartHandshake,
  "file-spreadsheet": FileSpreadsheet,
  "briefcase-business": BriefcaseBusiness,
  megaphone: Megaphone,
  "circle-user-round": CircleUserRound,
  "settings-2": Settings2,
};

const accentHex: Record<DashboardPageMeta["accent"], string> = {
  brand: "#1f4d3a",
  gold: "#d4a437",
  terra: "#b5532a",
  violet: "#6a4c93",
  ocean: "#1e6091",
};

export default function DashboardPageRoute() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const meta = pageBySlug(slug);
  const toast = useToast();
  const [section, setSection] = useState<string | null>(null);

  if (!meta) {
    return (
      <div className="page-dash-generic mx-auto max-w-3xl">
        <div className="ny-card p-8 text-center">
          <p className="ny-hud">Route not found</p>
          <h1 className="ny-display mt-2 text-2xl">No page lives at /dashboard/{slug}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            The dashboard has 16 pages — every one of them is linked from the sidebar. Jump back to the command center.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link href="/dashboard" className="ny-btn ny-btn-primary">
              Command center
            </Link>
            <Link href="/dashboard/contributions" className="ny-btn ny-btn-outline">
              Contributions (T-7)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const Icon = icons[meta.icon] ?? Landmark;
  const accent = accentHex[meta.accent];

  return (
    <div className="page-dash-generic mx-auto max-w-[1500px]" style={{ ["--gd-accent" as string]: accent }}>
      <Reveal>
        <div className="gd-hero mb-5">
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-5">
            <div className="flex gap-4">
              <span className="grid grid-cols-[minmax(0,1fr)] h-12 w-12 shrink-0 place-items-center rounded-xl border border-border-subtle bg-surface-1 shadow-[var(--shadow-raise)]">
                <Icon className="h-6 w-6" style={{ color: accent }} />
              </span>
              <div>
                <span className="gd-code">{meta.code}</span>
                <h1 className="ny-display mt-2.5 text-[clamp(1.6rem,3.4vw,2.5rem)] leading-[1.06]">{meta.title}</h1>
                <p className="mt-2 max-w-[56ch] text-sm leading-relaxed text-text-secondary sm:text-base">{meta.tagline}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/contributions" className="ny-btn ny-btn-primary">
                Open the built page (T-7) <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                className="ny-btn ny-btn-outline"
                onClick={() =>
                  toast({
                    tone: "info",
                    title: `${meta.title} — next in line`,
                    body: `${meta.code} is scaffolded with its real section index; the full build ships one page per turn.`,
                  })
                }
              >
                Page status
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label={`${meta.title} KPIs`}>
        {meta.kpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 60}>
            <div className="gd-kpi">
              <p className="ny-hud">{k.label}</p>
              <p className="ny-display mt-1.5 text-[1.6rem] leading-none">
                <CountUp value={Number(k.value.replace(/[^0-9]/g, "")) || 0} prefix={k.value.replace(/[0-9,]/g, "")} />
              </p>
              <p className="mt-1.5 text-xs text-text-tertiary">{k.hint}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-5">
        <Reveal className="lg:col-span-3" delay={80}>
          <section className="ny-card p-4 sm:p-5" aria-label="Section index">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="ny-hud">Blueprint</p>
                <h2 className="ny-display text-lg">Section index — 7+ sections</h2>
              </div>
              <span className="ny-chip ny-chip-brand">{meta.sections.length} sections</span>
            </div>
            <ul className="gd-section-list">
              {meta.sections.map((s) => (
                <li key={s}>
                  <button type="button" className="gd-section-item w-full text-left" onClick={() => setSection(s)}>
                    <span className="font-medium text-text-primary">{s}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-text-tertiary" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={140}>
          <section className="ny-card h-full p-4 sm:p-5" aria-label="How this page connects">
            <p className="ny-hud">Wiring</p>
            <h2 className="ny-display mt-1 text-lg">Zero dead ends</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Every navigation in this shell is client-side: the sidebar, the ⌘K palette, the bell and all deep links
              swap the view without a full page load, and the back button restores whatever overlay was open.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { label: "Deep-linkable overlays", note: "search params, reload restores" },
                { label: "Elder Mode verified", note: "56px targets, cards over tables" },
                { label: "Reduced motion", note: "snaps count-ups, no auto-rotate" },
                { label: "SIMULATED rails", note: "M-Pesa · WhatsApp · SMS · Drive" },
              ].map((r) => (
                <li key={r.label} className="ny-inset flex items-center justify-between gap-3 px-3 py-2.5">
                  <span className="font-medium">{r.label}</span>
                  <span className="ny-hud !text-[0.58rem] text-right">{r.note}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dashboard" className="ny-btn ny-btn-outline ny-btn-sm">
                Command center
              </Link>
              <Link href="/dashboard/contributions" className="ny-btn ny-btn-accent ny-btn-sm">
                Contributions
              </Link>
            </div>
          </section>
        </Reveal>
      </div>

      <Modal
        open={section !== null}
        onClose={() => setSection(null)}
        title={section ?? ""}
        sub={`${meta.code} · ${meta.title}`}
        size="md"
        footer={
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => setSection(null)}>
            Got it
          </button>
        }
      >
        <p className="text-sm leading-relaxed text-text-secondary">
          This section is specified in <span className="font-semibold text-text-primary">nalyanyaMO.md</span> for{" "}
          {meta.code} and will ship with the full build of this page. Until then, the working implementation you can
          explore end-to-end is T-7 Contributions — same shell, same overlays, same SIMULATED integration rules.
        </p>
        <div className="ny-inset mt-4 px-3.5 py-3">
          <p className="ny-hud">On this page</p>
          <p className="mt-1.5 text-sm text-text-primary">{meta.tagline}</p>
        </div>
        <Link href="/dashboard/contributions" className="ny-btn ny-btn-accent mt-4 w-full">
          Open T-7 Contributions <ArrowRight className="h-4 w-4" />
        </Link>
      </Modal>
    </div>
  );
}
