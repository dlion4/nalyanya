/* ── H-1 Landing · composition of all sections ───────────────────────────── */

import { useEffect } from "react";
import Navbar from "../../components/home/Navbar";
import Hero from "../../components/home/Hero";
import TrustBar from "../../components/home/TrustBar";
import StatsStrip from "../../components/home/StatsStrip";
import Features from "../../components/home/Features";
import Heritage from "../../components/home/Heritage";
import Memories from "../../components/home/Memories";
import ElderStrip from "../../components/home/ElderStrip";
import Finance from "../../components/home/Finance";
import Foundation from "../../components/home/Foundation";
import Voices from "../../components/home/Voices";
import Integrations from "../../components/home/Integrations";
import CtaFooter from "../../components/home/CtaFooter";
import { useElderMode } from "../../lib/hooks";
import { usePageStyles } from "../../lib/usePageStyles";
import landingCss from "../../styles/pages/landing.css?inline";

export default function Landing() {
  usePageStyles("landing", landingCss);
  useEffect(() => { document.title = "Nalyanya — Our roots. Our people. One home."; }, []);
  const { mode } = useElderMode();
  return (
    <main className="page-landing">
      <Navbar />
      <Hero elderMode={mode} />
      <TrustBar />
      <StatsStrip />
      <Features />
      <Heritage />
      <Memories />
      <ElderStrip />
      <Finance />
      <Foundation />
      <Voices />
      <Integrations />
      <CtaFooter />
    </main>
  );
}
