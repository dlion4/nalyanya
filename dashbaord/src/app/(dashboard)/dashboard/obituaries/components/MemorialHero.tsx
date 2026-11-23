import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Archive, Flame, Plus } from "lucide-react";
import {
  OBITUARIES,
  REMEMBRANCE_STATEMENT,
  type MemorialPhoto,
  type Obituary,
} from "@/data/dashboard/obituaries";
import { PinholeStage } from "./PinholeStage";
import { Candle, MemorialChip } from "./PinholeStage";

/* ═══════════════════════════════════════════════════════════════════════
   S1 · IN MEMORIAM HEADER
   A quiet statement over a slow camera exposure. The stage changes frame
   the way a shutter does; the count below is the number of people the
   family is carrying today.
   ═══════════════════════════════════════════════════════════════════════ */

const HERO_FRAMES: MemorialPhoto[] = [
  {
    id: "hero-1",
    src: "/images/memorial/mzee-victor.jpg",
    alt: "Mzee Victor Wafula Nalyanya, the family patriarch",
    caption: "Mzee Victor — our patriarch, 1934–2019.",
    year: "2019",
    credit: "Family album",
  },
  {
    id: "hero-2",
    src: "/images/memorial/esther-nanjala.jpg",
    alt: "Esther Nanjala Nalyanya, the family matriarch",
    caption: "Mzee Esther — our matriarch, 1938–2014.",
    year: "2014",
    credit: "Family album",
  },
  {
    id: "hero-3",
    src: "/images/memorial/samuel-kipkoech.jpg",
    alt: "Samuel Wafula Nalyanya, farmer and family historian",
    caption: "Uncle Samuel — keeper of our histories, 1950–2025.",
    year: "2025",
    credit: "Ruth Wakoli",
  },
];

export function MemorialHero({
  obituaries,
  calm,
  onRemember,
  onCandle,
  onArchive,
}: {
  obituaries: Obituary[];
  calm: boolean;
  onRemember: () => void;
  onCandle: () => void;
  onArchive: () => void;
}) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (calm) return;
    const timer = window.setInterval(
      () => setFrame((f) => (f + 1) % HERO_FRAMES.length),
      6400,
    );
    return () => window.clearInterval(timer);
  }, [calm]);

  const totals = useMemo(() => {
    const published = obituaries.filter((o) => o.status === "published");
    const candles = published.reduce((sum, o) => sum + o.candlesLit, 0);
    const branches = new Set(published.map((o) => o.branchId)).size;
    const oldest = Math.min(...published.map((o) => o.birthYear));
    return { count: published.length, candles, branches, oldest };
  }, [obituaries]);

  return (
    <section className="ny-memorial-hero" aria-labelledby="memorial-title">
      <div className="ny-memorial-hero-stage">
        <PinholeStage
          photos={HERO_FRAMES}
          index={frame}
          onIndexChange={setFrame}
          calm={calm}
          priority
          focus={{ x: 52, y: 44 }}
          label="Photographs of those we remember"
        />
        <div className="ny-memorial-hero-veil" aria-hidden />
      </div>

      <div className="ny-memorial-hero-copy">
        <p className="ny-eyebrow">
          <span className="ny-memorial-rule" aria-hidden />
          IN MEMORIAM
        </p>
        <h1 id="memorial-title">
          The people we carry
          <em>with us</em>
        </h1>
        <p className="ny-memorial-statement">{REMEMBRANCE_STATEMENT}</p>

        <div className="ny-memorial-hero-stats">
          <div>
            <b className="ny-num">{totals.count}</b>
            <span>remembered</span>
          </div>
          <div>
            <b className="ny-num">{totals.branches}</b>
            <span>branches</span>
          </div>
          <div>
            <b className="ny-num">{totals.oldest}</b>
            <span>our earliest birth</span>
          </div>
          <div>
            <b className="ny-num">{totals.candles.toLocaleString("en-KE")}</b>
            <span>candles lit</span>
          </div>
        </div>

        <div className="ny-memorial-hero-actions">
          <button
            type="button"
            className="ny-btn ny-btn-primary"
            onClick={onRemember}
          >
            <Plus size={15} aria-hidden />
            Remember someone
          </button>
          <button type="button" className="ny-btn ny-btn-gold" onClick={onCandle}>
            <Flame size={15} aria-hidden />
            Light a candle
          </button>
          <button type="button" className="ny-btn ny-btn-ghost" onClick={onArchive}>
            <Archive size={15} aria-hidden />
            Open the archive
          </button>
        </div>

        <p className="ny-memorial-hero-note">
          <Candle />
          <span>
            Notices are written with the family and published only when the
            family agrees.
          </span>
        </p>
      </div>

      <motion.div
        className="ny-memorial-hero-candle"
        aria-hidden
        initial={calm ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2 }}
      >
        <MemorialChip tone="gold" icon={<Flame size={12} />}>
          {obituaries.filter((o) => o.status !== "published").length} in draft
        </MemorialChip>
      </motion.div>
    </section>
  );
}

/** The three portraits that open the page when a visitor has no filters. */
export const HERO_OBITUARIES = OBITUARIES.filter(
  (o) => o.status === "published",
).slice(0, 3);
