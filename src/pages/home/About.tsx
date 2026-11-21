/* ── H-2 About · page composition (route: /about) ───────────────────────────
   Stylesheet: src/styles/pages/about.css (injected on enter, removed on leave)
   Data:       src/data/home/about.ts                                        */

import { useEffect, useState } from "react";
import Navbar from "../../components/home/Navbar";
import AboutHeader, { MottoRibbon } from "../../components/home/about/AboutHeader";
import OriginStory from "../../components/home/about/OriginStory";
import Generations3D from "../../components/home/about/Generations3D";
import ValuesFlip from "../../components/home/about/ValuesFlip";
import FamilyToday, { BranchesGrid } from "../../components/home/about/FamilyToday";
import Gatherings from "../../components/home/about/Gatherings";
import Membership from "../../components/home/about/Membership";
import Leadership from "../../components/home/about/Leadership";
import PrivacyPromise from "../../components/home/about/PrivacyPromise";
import CtaFooter from "../../components/home/CtaFooter";
import { ABOUT_CTA } from "../../data/home/about";
import { usePageStyles } from "../../lib/usePageStyles";
import aboutCss from "../../styles/pages/about.css?inline";
import { cn } from "../../utils/cn";

const RAIL = [
  { id: "origin", label: "Origin" },
  { id: "generations", label: "Generations" },
  { id: "values", label: "Values" },
  { id: "today", label: "Today" },
  { id: "branches", label: "Branches" },
  { id: "gatherings", label: "Gatherings" },
  { id: "membership", label: "Membership" },
  { id: "leadership", label: "Leadership" },
  { id: "privacy", label: "Privacy" },
];

function SectionRail() {
  const [active, setActive] = useState<string>("");
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" }
    );
    RAIL.forEach((r) => { const el = document.getElementById(r.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <nav aria-label="On this page" className="ny-glass fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 rounded-2xl p-2 xl:block">
      <ul className="flex flex-col gap-0.5">
        {RAIL.map((r) => (
          <li key={r.id}>
            <button type="button" onClick={() => document.getElementById(r.id)?.scrollIntoView({ behavior: "smooth" })}
              aria-current={active === r.id}
              className={cn("group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left text-[11px] font-bold transition-colors",
                active === r.id ? "bg-brand-primary text-surface-0" : "text-text-tertiary hover:text-brand-primary")}>
              <span className={cn("size-1.5 rounded-pill transition-all", active === r.id ? "scale-125 bg-brand-accent" : "bg-surface-3 group-hover:bg-brand-primary")} />
              {r.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function About() {
  usePageStyles("about", aboutCss);
  useEffect(() => { document.title = "About us — Nalyanya · Our roots run deep"; }, []);

  return (
    <main className="page-about">
      <Navbar />
      <SectionRail />
      <AboutHeader />
      <MottoRibbon />
      <OriginStory />
      <Generations3D />
      <ValuesFlip />
      <FamilyToday />
      <BranchesGrid />
      <Gatherings />
      <Membership />
      <Leadership />
      <PrivacyPromise />
      <CtaFooter
        eyebrow={ABOUT_CTA.eyebrow}
        title={ABOUT_CTA.title}
        titleAccent={ABOUT_CTA.titleAccent}
        copy={ABOUT_CTA.copy}
        primary={{ label: "See yourself in the tree", to: "/signin" }}
        secondary={{ label: "Back to the 3D teaser", to: "/" }}
      />
    </main>
  );
}
