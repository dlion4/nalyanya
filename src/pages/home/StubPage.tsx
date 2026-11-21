/* ── Stub page — home pages not yet built still resolve to something designed ── */

import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Crest } from "../../components/home/Logo";

export default function StubPage({ title, blurb }: { title: string; blurb?: string }) {
  return (
    <main className="page-landing flex min-h-svh items-center justify-center bg-surface-0 px-4 py-24">
      <div className="ny-grid-paper pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative w-full max-w-lg">
        <div className="ny-card rounded-3xl p-8 text-center shadow-lift sm:p-10">
          <Crest className="mx-auto h-14 w-14" />
          <span className="ny-eyebrow mt-5 inline-flex">H-1 · lands first</span>
          <h1 className="ny-heading mt-4 text-3xl sm:text-4xl">{title}</h1>
          <p className="ny-prose mt-4 text-sm leading-relaxed">
            {blurb ?? "This page is designed but not built yet — the landing page ships first, with its sections, images and 3D teaser."}
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/" className="ny-btn-primary ny-touch">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to the landing page
            </Link>
            <Link to="/" className="ny-btn-ghost ny-touch inline-flex items-center gap-2">
              <Compass className="size-4" aria-hidden="true" />
              See the tree first
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
