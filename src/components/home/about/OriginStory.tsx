/* ── H-2 S2 · Origin story — scrollytelling timeline + sticky aperture shutter ──
   Each chapter crossing the viewport centre becomes active → the shutter
   fires its iris to that chapter's photo. The gold rail draws as you read. */

import { useEffect, useRef, useState } from "react";
import ApertureShutter from "../ApertureShutter";
import Reveal from "../Reveal";
import { ORIGIN_CHAPTERS } from "../../../data/home/about";
import { cn } from "../../../utils/cn";

export default function OriginStory() {
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.idx));
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    itemRefs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const jump = (i: number) => {
    setActive(i);
    itemRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const slides = ORIGIN_CHAPTERS.map((c) => c.slide);
  const progress = (active + 1) / ORIGIN_CHAPTERS.length;

  return (
    <section id="origin" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8" aria-label="Origin story">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <span className="ny-section-label">Origin story · 1938 → today</span>
          <h2 className="ny-heading mt-3 max-w-2xl text-4xl sm:text-5xl">
            From one house <em className="font-medium text-brand-secondary">to one tree.</em>
          </h2>
          <p className="ny-prose mt-4 max-w-xl">Scroll the story — the archive camera changes frame with every chapter.</p>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* sticky shutter */}
          <div className="sticky top-20 z-10 self-start lg:order-2 lg:col-span-6 lg:top-28">
            <div className="rounded-[1.75rem] bg-brand-primary-deep p-2 shadow-panel">
              <ApertureShutter
                slides={slides}
                index={active}
                onIndexChange={jump}
                label="Origin story photos"
                exposure={`${ORIGIN_CHAPTERS[active].year} · archive`}
                className="aspect-[16/10] rounded-[1.4rem] lg:aspect-[4/4.2]"
              />
            </div>
          </div>

          {/* chapters + drawn rail */}
          <div className="relative lg:order-1 lg:col-span-6">
            <div className="absolute bottom-3 left-[11px] top-3 w-[2px] rounded-pill bg-surface-3" aria-hidden="true">
              <div className="ny-rail-fill h-full w-full rounded-pill bg-gradient-to-b from-brand-accent via-brand-primary to-brand-violet" style={{ transform: `scaleY(${progress})` }} />
            </div>
            <ol className="flex flex-col gap-14 py-2 lg:gap-24 lg:py-16">
              {ORIGIN_CHAPTERS.map((c, i) => (
                <li
                  key={c.year}
                  ref={(el) => { itemRefs.current[i] = el; }}
                  data-idx={i}
                  className={cn("ny-chapter relative pl-12", i === active && "is-active")}
                >
                  <button type="button" onClick={() => jump(i)} className="group block text-left" aria-current={i === active}>
                    <span className="ny-chapter-dot absolute left-0 top-1 grid size-6 place-items-center rounded-pill border-2 border-brand-primary bg-surface-0" aria-hidden="true" />
                    <span className="ny-num font-display text-2xl font-semibold text-brand-secondary">{c.year}</span>
                    <h3 className="mt-1 font-display text-xl font-semibold text-text-primary group-hover:text-brand-primary sm:text-2xl">{c.title}</h3>
                    <p className="mt-2 max-w-md leading-relaxed text-text-secondary">{c.copy}</p>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
