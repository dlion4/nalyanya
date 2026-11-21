/* ── H-2 S3 · Five generations in 3D — full-bleed canvas + glass HUD overlays ──
   Lazy chunk mounts only when the section nears the viewport. Reduced
   motion, Elder Mode or no WebGL → static SVG rings with the same HUD.   */

import { Suspense, lazy, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Crosshair, Maximize2, Lock, Layers3 } from "lucide-react";
import { GENERATIONS } from "../../../data/home/about";
import { useElderMode, useInView, usePrefersReducedMotion } from "../../../lib/hooks";
import { cn } from "../../../utils/cn";

const GenerationsScene = lazy(() => import("./GenerationsScene"));

function hasWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

function RingsFallback({ focus, onSelect }: { focus: number | null; onSelect: (g: number) => void }) {
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" role="img" aria-label="Static generations diagram">
      {GENERATIONS.slice(1).map((g, i) => {
        const rx = 50 + i * 38, ry = 14 + i * 9, cy = 95 + i * 42;
        return (
          <g key={g.id} onClick={() => onSelect(g.id)} className="cursor-pointer">
            <ellipse cx="200" cy={cy} rx={rx} ry={ry} fill="none" stroke={g.color} strokeWidth={focus === g.id ? 3 : 1.5} opacity={focus === null || focus === g.id ? 0.95 : 0.3} />
            {Array.from({ length: 6 + i * 3 }).map((_, k, arr) => {
              const a = (k / arr.length) * Math.PI * 2;
              return <circle key={k} cx={200 + Math.cos(a) * rx} cy={cy + Math.sin(a) * ry} r={4 - i * 0.5} fill={g.color} />;
            })}
          </g>
        );
      })}
      <circle cx="200" cy="55" r="18" fill="#D4A437" onClick={() => onSelect(0)} className="cursor-pointer" />
      <circle cx="200" cy="55" r="27" fill="none" stroke="#D4A437" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
}

export default function Generations3D() {
  const [focus, setFocus] = useState<number | null>(null);
  const reduced = usePrefersReducedMotion();
  const { mode: elder } = useElderMode();
  const { ref, inView } = useInView<HTMLDivElement>(0.05);
  const [webgl, setWebgl] = useState(true);
  useEffect(() => setWebgl(hasWebGL()), []);

  const use3D = webgl && !reduced && !elder;
  const select = (g: number) => setFocus(g < 0 ? null : g);
  const current = focus === null ? null : GENERATIONS[focus];

  return (
    <section id="generations" className="scroll-mt-24 px-4 py-8 sm:px-6 lg:px-8" aria-label="Five generations in 3D">
      <div ref={ref} className="ny-gen-stage relative mx-auto h-[82vh] min-h-[560px] max-w-7xl overflow-hidden rounded-[2rem] shadow-panel">
        {use3D && inView ? (
          <Suspense fallback={<RingsFallback focus={focus} onSelect={select} />}>
            <GenerationsScene focus={focus} onSelect={select} reduced={reduced} />
          </Suspense>
        ) : (
          <RingsFallback focus={focus} onSelect={select} />
        )}

        {/* HUD · title */}
        <div className="ny-glass-dark pointer-events-none absolute left-4 right-4 top-4 rounded-2xl p-4 text-surface-0 sm:right-auto sm:max-w-sm sm:p-5">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent"><Layers3 className="size-3.5" aria-hidden="true" />The family today · in 3D</p>
          <h2 className="mt-2 font-display text-2xl font-semibold leading-tight sm:text-3xl">Five generations, <em className="font-medium text-brand-accent">one root.</em></h2>
          <p className="mt-2 hidden text-sm leading-relaxed text-surface-2/80 sm:block">Tap a ring or pick a generation — the camera flies to it.</p>
        </div>

        {/* HUD · status */}
        <div className="ny-glass-dark absolute right-4 top-4 hidden items-center gap-2 rounded-pill px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-surface-2 md:flex">
          <span className={cn("size-2 rounded-pill", use3D ? "bg-brand-success" : "bg-brand-accent")} />
          {use3D ? "WebGL · live" : elder ? "Static · Elder Mode" : "Static view"}
        </div>

        {/* HUD · generation picker */}
        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 lg:inset-x-auto lg:bottom-6 lg:left-6 lg:w-80">
          <AnimatePresence mode="wait">
            {current && (
              <motion.div key={current.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.3 }}
                className="ny-glass-dark rounded-2xl p-4 text-surface-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: current.color === "#1F4D3A" ? "#7fc39f" : current.color }}>{current.gen} generation</span>
                  <span className="ny-num font-display text-lg font-semibold">~{current.approx}</span>
                </div>
                <p className="mt-1 font-display text-lg font-semibold">{current.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-surface-2/80">{current.copy}</p>
                <Link to="/signin" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent hover:underline"><Lock className="size-3.5" aria-hidden="true" />Names visible after family sign-in</Link>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="ny-glass-dark flex flex-wrap gap-1.5 rounded-2xl p-2" role="group" aria-label="Choose a generation">
            {GENERATIONS.map((g) => (
              <button key={g.id} type="button" aria-pressed={focus === g.id} onClick={() => select(focus === g.id ? -1 : g.id)}
                className="ny-gen-btn ny-touch flex-1 rounded-xl border border-white/10 px-2.5 py-2 text-xs font-bold text-surface-2/85 hover:bg-white/10">
                <span className="mr-1 inline-block size-2 rounded-pill align-middle" style={{ background: g.color === "#1F4D3A" ? "#7fc39f" : g.color }} />{g.gen}
              </button>
            ))}
            <button type="button" onClick={() => select(-1)} aria-label="Fit whole family" className="ny-touch grid place-items-center rounded-xl border border-white/10 px-3 text-surface-2/85 hover:bg-white/10">
              <Maximize2 className="size-4" />
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 right-6 hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-surface-2/60 lg:flex">
          <Crosshair className="size-3.5" aria-hidden="true" /> Move your pointer to look around
        </div>
      </div>
    </section>
  );
}
