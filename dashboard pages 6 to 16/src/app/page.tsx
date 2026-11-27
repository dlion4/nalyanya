import Link from "next/link";
import { ArrowRight, Camera, GitFork, HandHeart, Landmark } from "lucide-react";

const entries = [
  {
    href: "/dashboard/contributions",
    code: "T-7",
    title: "Contributions",
    body: "Causes, live tallies, the five-step give wizard, payouts with 2FA and reconciliation — plus the camera-pinhole photo gallery.",
    icon: HandHeart,
  },
  {
    href: "/dashboard",
    code: "T-1",
    title: "Command center",
    body: "The family cockpit: KPIs, action queue, activity feed, integration rails and the ⌘K palette.",
    icon: Landmark,
  },
  {
    href: "/dashboard/lineage",
    code: "T-2",
    title: "3D lineage tree",
    body: "Five generations, twelve branches, rooted at Mzee Victor Nalyanya — walk where you belong.",
    icon: GitFork,
  },
];

export default function LandingPage() {
  return (
    <main className="page-dash-generic min-h-screen bg-surface-0">
      <header className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-5 py-5">
        <div className="flex items-center gap-2.5 text-brand-primary">
          <svg viewBox="0 0 48 48" className="h-9 w-9" role="img" aria-label="Nalyanya">
            <path
              d="M24 44V24M24 24 12 14M24 24l12-10M24 30l-8-6M24 30l8-6M24 16l-5-6M24 16l5-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            <circle cx="24" cy="9" r="4" fill="var(--color-brand-accent)" />
            <path d="M8 44h32" stroke="var(--color-brand-accent)" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          <span>
            <span className="ny-display block text-lg leading-none text-text-primary">Nalyanya</span>
            <span className="ny-hud !text-[0.58rem]">lineage · money · memories</span>
          </span>
        </div>
        <Link href="/dashboard" className="ny-btn ny-btn-primary ny-btn-sm">
          Open dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="mx-auto max-w-[1200px] px-5 pb-4">
        <div className="gd-hero" style={{ ["--gd-accent" as string]: "#1f4d3a" }}>
          <div className="relative z-10 max-w-[62ch]">
            <span className="gd-code">Warm heritage · one family</span>
            <h1 className="ny-display mt-4 text-[clamp(2rem,6vw,4rem)] leading-[1.02]">
              Our roots. Our people.
              <br />
              One home.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-text-secondary">
              From Mzee Victor Nalyanya to the newest grandchild — every branch, every memory, every shilling in one
              place. Built so grandma can use it too. This build is frontend-only: local typed data, honest{" "}
              <span className="ny-chip ny-chip-sim">SIMULATED</span> integration rails, zero network calls.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/dashboard/contributions" className="ny-btn ny-btn-accent">
                <HandHeart className="h-4 w-4" /> Go to contributions
              </Link>
              <Link href="/dashboard" className="ny-btn ny-btn-outline">
                Command center <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] gap-4 px-5 pb-16 pt-4 md:grid-cols-3">
        {entries.map((e) => (
          <Link key={e.href} href={e.href} className="gd-kpi block h-full">
            <div className="flex items-center justify-between">
              <e.icon className="h-5 w-5 text-brand-primary" />
              <span className="ny-hud">{e.code}</span>
            </div>
            <h2 className="ny-display mt-3 text-lg">{e.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{e.body}</p>
            <span className="ny-hud mt-3 inline-flex items-center gap-1 !text-brand-accent">
              Open <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        ))}
      </section>

      <footer className="border-t border-border-subtle bg-surface-1">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-text-secondary">
          <p className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-brand-accent" /> Nalyanya · Bungoma, Kenya · hello@nalyanya.app
          </p>
          <nav className="flex flex-wrap gap-4">
            <Link href="/dashboard" className="transition hover:text-text-primary">Dashboard</Link>
            <Link href="/dashboard/contributions" className="transition hover:text-text-primary">Contributions</Link>
            <Link href="/dashboard/finances" className="transition hover:text-text-primary">Chama & Sacco</Link>
            <Link href="/dashboard/gallery" className="transition hover:text-text-primary">Gallery</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
