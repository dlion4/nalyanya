"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  GitFork,
  HandHeart,
  Landmark,
  Megaphone,
  ScrollText,
  Sparkles,
} from "lucide-react";
import { activityFeed, shellKpis } from "@/data/dashboard/command-center";
import { CountUp, Reveal } from "@/components/ui/primitives";
import { Modal, useToast } from "@/components/ui/overlay";

const quickActions = [
  { label: "Open contributions", body: "Causes, tallies, payouts — T-7", href: "/dashboard/contributions", icon: HandHeart },
  { label: "Walk the 3D tree", body: "Five generations, 12 branches — T-2", href: "/dashboard/lineage", icon: GitFork },
  { label: "Send a broadcast", body: "WhatsApp · SMS · email — T-14", href: "/dashboard/communications", icon: Megaphone },
  { label: "Allocate to an elder", body: "No-login PIN + OTP link — T-9", href: "/dashboard/finance-access", icon: Landmark },
];

const queue = [
  { title: "3 contributions need verification", meta: "KES 24,500 · M-Pesa refs", href: "/dashboard/contributions" },
  { title: "Payout NY-PAY-2025-0079 ready to release", meta: "School fees · KES 180,000 · 2FA", href: "/dashboard/contributions" },
  { title: "2 lineage edit requests", meta: "gen-4 birth years", href: "/dashboard/lineage" },
  { title: "1 loan overdue by 6 days", meta: "NY-LON-2025-00114 · KES 12,000", href: "/dashboard/loans" },
];

const rails = [
  { name: "M-Pesa Daraja", state: "SIMULATED" },
  { name: "Airtel Money", state: "SIMULATED" },
  { name: "Bank EFT / RTGS", state: "SIMULATED" },
  { name: "Africa's Talking SMS", state: "SIMULATED" },
  { name: "WhatsApp Cloud", state: "SIMULATED" },
  { name: "Google Drive", state: "SIMULATED" },
  { name: "Internal ledger", state: "LIVE (local)" },
];

export default function CommandCenterPage() {
  const toast = useToast();
  const [feedOpen, setFeedOpen] = useState(false);

  return (
    <div className="page-dash-generic mx-auto max-w-[1500px]">
      <Reveal>
        <div className="gd-hero mb-5" style={{ ["--gd-accent" as string]: "#1f4d3a" }}>
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="gd-code">T-1 · Command center</span>
              <h1 className="ny-display mt-3 text-[clamp(1.7rem,3.6vw,2.7rem)] leading-[1.05]">
                Habari, Peter — here is the family today.
              </h1>
              <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-text-secondary sm:text-base">
                Nalyanya rooted at Mzee Victor Nalyanya · 243 members · 12 branches · 5 generations. Everything below is
                local mock data — no network calls, no reloads.
              </p>
            </div>
            <Link href="/dashboard/contributions" className="ny-btn ny-btn-accent">
              Go to contributions <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Reveal>

      {/* S1 KPI row */}
      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Family KPIs">
        {shellKpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 70}>
            <div className="gd-kpi">
              <p className="ny-hud">{k.label}</p>
              <p className="ny-display mt-1.5 text-[1.75rem] leading-none">
                <CountUp value={k.value} prefix={k.prefix ?? ""} suffix={k.suffix ?? ""} />
              </p>
              <p className="mt-1.5 text-xs text-text-tertiary">{k.hint}</p>
            </div>
          </Reveal>
        ))}
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
        {/* S2 queue */}
        <Reveal className="lg:col-span-2" delay={60}>
          <section className="ny-card p-4 sm:p-5" aria-label="Action queue">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="ny-hud">Needs you</p>
                <h2 className="ny-display text-lg">Action queue</h2>
              </div>
              <span className="ny-chip ny-chip-warn ny-pulse">{queue.length} open</span>
            </div>
            <ul className="gd-section-list">
              {queue.map((q) => (
                <li key={q.title}>
                  <Link href={q.href} className="gd-section-item w-full">
                    <span className="min-w-0">
                      <span className="block font-semibold text-text-primary">{q.title}</span>
                      <span className="block text-xs text-text-tertiary">{q.meta}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-brand-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        {/* S3 feed */}
        <Reveal delay={120}>
          <section className="ny-card h-full p-4 sm:p-5" aria-label="Activity feed">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="ny-hud">Live</p>
                <h2 className="ny-display text-lg">Activity</h2>
              </div>
              <Sparkles className="h-4 w-4 text-brand-accent" />
            </div>
            <ol className="space-y-3">
              {activityFeed.map((a) => (
                <li key={a.text} className="flex gap-3">
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      a.tone === "gold" ? "bg-brand-accent" : a.tone === "green" ? "bg-success" : a.tone === "red" ? "bg-danger" : "bg-text-tertiary"
                    }`}
                    aria-hidden
                  />
                  <span>
                    <span className="ny-hud block !text-[0.58rem]">{a.at}</span>
                    <span className="block text-sm leading-snug text-text-secondary">{a.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <button type="button" onClick={() => setFeedOpen(true)} className="ny-btn ny-btn-outline ny-btn-sm mt-4 w-full">
              View full audit trail
            </button>
          </section>
        </Reveal>
      </div>

      {/* S4 quick actions */}
      <section className="mt-6" aria-label="Quick actions">
        <div className="cc-sec-head">
          <div>
            <p className="ny-hud">Shortcuts</p>
            <h2 className="ny-display text-xl">Where do you want to go?</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((a, i) => (
            <Reveal key={a.label} delay={i * 60}>
              <Link
                href={a.href}
                className="ny-card ny-hover-lift block h-full p-4 transition"
                style={{ transformStyle: "preserve-3d" }}
              >
                <a.icon className="h-5 w-5 text-brand-primary" />
                <p className="ny-display mt-2.5 text-[0.98rem]">{a.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-text-secondary">{a.body}</p>
                <span className="ny-hud mt-3 inline-flex items-center gap-1 !text-brand-accent">
                  Open <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* S5 integration rails */}
      <Reveal delay={80}>
        <section className="ny-card mt-6 p-4 sm:p-5" aria-label="Integration rails">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="ny-hud">Integrations</p>
              <h2 className="ny-display text-lg">Rails — every one of them is honest about Phase 1</h2>
            </div>
            <Link href="/dashboard/settings" className="ny-btn ny-btn-outline ny-btn-sm">
              <ScrollText className="h-3.5 w-3.5" /> Capability matrix
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {rails.map((r) => (
              <span key={r.name} className="ny-chip ny-chip-neutral">
                {r.name}
                <span className={r.state === "SIMULATED" ? "ny-chip ny-chip-sim ml-1" : "ny-chip ny-chip-ok ml-1"}>
                  {r.state}
                </span>
              </span>
            ))}
          </div>
        </section>
      </Reveal>

      <Modal open={feedOpen} onClose={() => setFeedOpen(false)} title="Audit trail" sub="Append-only · actor · action · entity" size="lg">
        <ul className="space-y-2">
          {activityFeed.concat(activityFeed).map((a, i) => (
            <li key={i} className="ny-inset flex items-center gap-3 px-3 py-2.5 text-sm">
              <span className="ny-hud w-14 shrink-0">{a.at}</span>
              <span className="text-text-secondary">{a.text}</span>
            </li>
          ))}
        </ul>
        <p className="ny-chip ny-chip-sim mt-3">SIMULATED · backend Phase 2</p>
        <button
          type="button"
          className="ny-btn ny-btn-primary mt-4 w-full"
          onClick={() => {
            setFeedOpen(false);
            toast({ tone: "info", title: "Export queued", body: "HMAC-signed audit CSV — resolves when the backend is wired." });
          }}
        >
          Export audit CSV
        </button>
      </Modal>
    </div>
  );
}
