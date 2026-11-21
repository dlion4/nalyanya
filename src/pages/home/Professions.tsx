/* ── H-3 Professions · page composition (route: /professions) ───────────────
   Stylesheet: src/styles/pages/professions-home.css
   Data:       src/data/home/professions.ts                                  */

import { useEffect, useState } from "react";
import Navbar from "../../components/home/Navbar";
import CtaFooter from "../../components/home/CtaFooter";
import ProfessionsHeader from "../../components/home/professions/ProfessionsHeader";
import TradeStats from "../../components/home/professions/TradeStats";
import CategoryGrid from "../../components/home/professions/CategoryGrid";
import Trades3D from "../../components/home/professions/Trades3D";
import FeaturedProfiles from "../../components/home/professions/FeaturedProfiles";
import Directory from "../../components/home/professions/Directory";
import FriendsPanel from "../../components/home/professions/FriendsPanel";
import HireFlow from "../../components/home/professions/HireFlow";
import ContactShield from "../../components/home/professions/ContactShield";
import Endorsements from "../../components/home/professions/Endorsements";
import Coverage from "../../components/home/professions/Coverage";
import ListSkill from "../../components/home/professions/ListSkill";
import { PROFESSIONS_CTA } from "../../data/home/professions";
import { usePageStyles } from "../../lib/usePageStyles";
import professionsCss from "../../styles/pages/professions-home.css?inline";
import { cn } from "../../utils/cn";

const RAIL = [
  { id: "trades", label: "Trades" },
  { id: "constellation", label: "3D" },
  { id: "featured", label: "Featured" },
  { id: "directory", label: "Directory" },
  { id: "friends", label: "Friends" },
  { id: "hire", label: "How it works" },
  { id: "shield", label: "Hidden" },
  { id: "voices", label: "Voices" },
  { id: "coverage", label: "Coverage" },
  { id: "list-skill", label: "List a skill" },
];

function Rail() {
  const [active, setActive] = useState("");
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
            <button type="button" onClick={() => document.getElementById(r.id)?.scrollIntoView({ behavior: "smooth" })} aria-current={active === r.id}
              className={cn("group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left text-[11px] font-bold transition-colors",
                active === r.id ? "bg-brand-primary text-surface-0" : "text-text-tertiary hover:text-brand-primary")}>
              <span className={cn("size-1.5 rounded-pill", active === r.id ? "scale-125 bg-brand-accent" : "bg-surface-3 group-hover:bg-brand-primary")} />
              {r.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function Professions() {
  usePageStyles("professions-home", professionsCss);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => { document.title = "Professions — Nalyanya · Family helping family"; }, []);

  const pickAndGo = (id: string) => {
    setCategory(id);
    document.getElementById("directory")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="page-professions-home">
      <Navbar />
      <Rail />
      <ProfessionsHeader query={query} category={category} onQuery={setQuery} onPick={pickAndGo} />
      <TradeStats />
      <CategoryGrid active={category} onPick={pickAndGo} />
      <Trades3D active={category} onPick={setCategory} />
      <FeaturedProfiles />
      <Directory query={query} category={category} onClear={() => { setQuery(""); setCategory("all"); }} />
      <FriendsPanel />
      <HireFlow />
      <ContactShield />
      <Endorsements />
      <Coverage />
      <ListSkill />
      <CtaFooter
        eyebrow={PROFESSIONS_CTA.eyebrow}
        title={PROFESSIONS_CTA.title}
        titleAccent={PROFESSIONS_CTA.titleAccent}
        copy={PROFESSIONS_CTA.copy}
        primary={{ label: "Join the directory", to: "/contact" }}
        secondary={{ label: "Sign in to be listed", to: "/signin" }}
      />
    </main>
  );
}
