import { ArrowLeft, ArrowRight, Crosshair } from "lucide-react";
import Link from "next/link";
import { SimulatedBadge } from "@/components/ui/Primitives";
import { DASHBOARD_NAV, moduleBySlug } from "@/data/dashboard/navigation";

/* Designed module page for every route whose build step is queued. Each one keeps
   its own page stylesheet (page-dash-<slug>) and gains live sections in its turn. */
export function DashboardModulePage({ slug }: { slug: string }) {
  const mod = moduleBySlug(slug);
  if (!mod) return null;

  const index = DASHBOARD_NAV.findIndex((m) => m.slug === slug);
  const next = DASHBOARD_NAV[index + 1] ?? DASHBOARD_NAV[0];

  return (
    <div className={`page-dash-${slug} space-y-10 pb-6`}>
      <section className="relative overflow-hidden rounded-[32px] border border-hairline bg-surface-1 shadow-soft">
        <div className="ny-module-hero absolute inset-0">
          <img src={mod.image} alt="" className="h-full w-full object-cover opacity-[0.28]" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface-1 via-surface-1/92 to-surface-1/50" />
        </div>

        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <div className="min-w-0">
            <p className="ny-eyebrow ny-module-accent">
              {mod.code} · {mod.group}
            </p>
            <h1 className="ny-title mt-3 text-5xl leading-[1.02] sm:text-6xl">{mod.label}</h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-text-secondary">{mod.purpose}</p>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="ny-chip ny-chip-gold">Build step queued · {mod.code}</span>
              {mod.integrations.map((name) => (
                <span key={name} className="ny-chip">
                  {name}
                  <SimulatedBadge label="SIM" />
                </span>
              ))}
            </div>
          </div>

          <aside className="ny-card p-6">
            <p className="ny-eyebrow">Reach the rest of the family</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Every page in the console is linked from the sidebar. The live tree, the command center and the family directory are ready now.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link href="/dashboard" className="ny-btn ny-btn-ghost">
                <ArrowLeft className="size-4" aria-hidden />
                Command center
              </Link>
              <Link href="/dashboard/lineage" className="ny-btn ny-btn-primary">
                <Crosshair className="size-4" aria-hidden />
                Open the 3D tree
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="ny-eyebrow">Blueprint sections</p>
          <h2 className="ny-title mt-2 text-3xl">What this page will hold</h2>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mod.sections.map((section, i) => (
            <li key={section} className="ny-card ny-module-section flex items-start gap-4 p-5 transition duration-300 hover:-translate-y-0.5">
              <span className="ny-title grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-lg">S{i + 1}</span>
              <div className="min-w-0">
                <p className="font-semibold text-text-primary">{section}</p>
                <p className="mt-1 text-sm text-text-tertiary">Build step {mod.code}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="ny-card flex flex-wrap items-center justify-between gap-4 p-6 sm:p-7">
        <p className="text-sm text-text-secondary">
          Next in the console:{" "}
          <span className="font-semibold text-text-primary">
            {next.label} · {next.code}
          </span>
        </p>
        <Link href={next.href} className="ny-btn ny-btn-gold">
          Continue
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    </div>
  );
}
