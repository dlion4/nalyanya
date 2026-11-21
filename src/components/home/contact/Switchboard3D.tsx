/* ── H-7 · Where your note goes — full-bleed 3D canvas + glass HUD ───────────
   The 3D switchboard mounts once, near the viewport, and renders only while on
   screen. Reduced motion, Elder Mode, no WebGL or a narrow screen → a static
   diagram with the same numbered controls.                                 */

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { MousePointerClick, PenLine } from "lucide-react";
import { ROUTES, routeById, type Route } from "../../../data/home/contact";
import { useElderMode, usePrefersReducedMotion } from "../../../lib/hooks";
import { cn } from "../../../utils/cn";

const SwitchboardScene = lazy(() => import("./SwitchboardScene"));

function hasWebGL() {
  try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; }
}

const num = (i: number) => String(i + 1).padStart(2, "0");

function Details({ route, number, onWrite }: { route: Route; number: string; onWrite: (id: string) => void }) {
  return (
    <div className="ny-glass-dark rounded-2xl p-4 text-surface-0">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em]">
        <span className="ny-num grid size-5 place-items-center rounded-pill text-[11px] font-semibold text-[#0b1610]" style={{ background: route.color }}>{number}</span>
        {route.role}
      </p>
      <p className="mt-2 font-display text-lg font-semibold">{route.person}</p>
      <p className="mt-1 text-xs leading-relaxed text-surface-2/80">Reads notes about {route.handles.toLowerCase()}.</p>
      <p className="mt-2 text-xs font-bold text-brand-accent">First reply within {route.replyIn}</p>
      <button type="button" onClick={() => onWrite(route.id)} className="ny-btn-gold ny-touch mt-3 w-full text-sm">
        <PenLine className="size-4" aria-hidden="true" />Write about this
      </button>
    </div>
  );
}

function IdleHint() {
  return (
    <div className="ny-glass-dark rounded-2xl p-4 text-sm leading-relaxed text-surface-2/85">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-accent">
        <MousePointerClick className="size-3.5" aria-hidden="true" />Pick a number
      </p>
      <p className="mt-2">Tap a numbered person, or choose from the list. The camera flies to whoever reads your note.</p>
    </div>
  );
}

/* static fallback — same numbers, same selection */
function Diagram({ active, onPick }: { active: string; onPick: (id: string) => void }) {
  const cx = 200, cy = 150, rx = 138, ry = 104;
  const pos = (i: number): [number, number] => {
    const a = (i / ROUTES.length) * Math.PI * 2 + Math.PI / 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
  };
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="group" aria-label="Diagram of the six people a note can go to">
      {ROUTES.map((r, i) => {
        const [x, y] = pos(i);
        const on = r.id === active;
        return <line key={r.id} x1={cx} y1={cy} x2={x} y2={y} stroke={on ? r.color : "rgba(253,246,227,0.28)"} strokeWidth={on ? 2.5 : 1.2} />;
      })}
      <circle cx={cx} cy={cy} r="27" fill="#D4A437" />
      <text x={cx} y={cy - 1} textAnchor="middle" fontSize="9" fontWeight="700" fill="#143527" fontFamily="Inter, system-ui, sans-serif">FAMILY</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fontWeight="700" fill="#143527" fontFamily="Inter, system-ui, sans-serif">OFFICE</text>
      {ROUTES.map((r, i) => {
        const [x, y] = pos(i);
        const on = r.id === active;
        const anchor = i === 1 || i === 2 ? "end" : i === 4 || i === 5 ? "start" : "middle";
        const lx = anchor === "end" ? x - 14 : anchor === "start" ? x + 14 : x;
        const ly = i === 0 ? y + 25 : i === 3 ? y - 17 : y + 4;
        return (
          <g key={r.id} role="button" tabIndex={0} aria-pressed={on} aria-label={`${num(i)} ${r.role}`}
            onClick={() => onPick(on ? "" : r.id)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPick(on ? "" : r.id); } }}
            className="cursor-pointer outline-none focus-visible:opacity-100" style={{ opacity: active && !on ? 0.45 : 1 }}>
            <circle cx={x} cy={y} r={on ? 14 : 10} fill={r.color} stroke="#0b1610" strokeWidth="2" />
            <text x={x} y={y + 3.5} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#0b1610" fontFamily="Inter, system-ui, sans-serif">{num(i)}</text>
            <text x={lx} y={ly} textAnchor={anchor} fontSize="11" fontWeight="700" fill="#fdf6e3" fontFamily="Inter, system-ui, sans-serif" paintOrder="stroke" stroke="#0b1610" strokeWidth="2.5">{r.role}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Switchboard3D({ active, onPick, onWrite }: { active: string; onPick: (id: string) => void; onWrite: (id: string) => void }) {
  const reduced = usePrefersReducedMotion();
  const { mode: elder } = useElderMode();
  const hostRef = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const [ready, setReady] = useState(false);
  const [env, setEnv] = useState({ webgl: true, wide: false, shift: 0 });

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    const measure = () => {
      const w = el.offsetWidth;
      setEnv({
        webgl: hasWebGL(),
        wide: window.matchMedia("(min-width: 768px)").matches,
        shift: w >= 900 ? 172 / w : 0,   // room for the glass list on the right
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => { io.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  useEffect(() => {
    if (!onScreen || ready) return;
    const t = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(t);
  }, [onScreen, ready]);

  const use3D = ready && onScreen && env.webgl && env.wide && !reduced && !elder;
  const index = ROUTES.findIndex((r) => r.id === active);
  const current = index >= 0 ? routeById(active) : null;
  const toggle = (id: string) => onPick(id === active ? "" : id);

  const list = (compact: boolean) => ROUTES.map((r, i) => (
    <button key={r.id} type="button" aria-pressed={r.id === active} onClick={() => toggle(r.id)}
      className={cn("ny-ct-route ny-touch flex shrink-0 items-center rounded-xl border border-white/10 font-bold text-surface-2/90 hover:bg-white/10",
        compact ? "gap-1.5 px-2.5 py-2 text-xs" : "w-full gap-3 px-3 py-2 text-left text-sm")}>
      <span className="ny-num grid size-7 shrink-0 place-items-center rounded-pill font-display text-[11px] font-semibold text-[#0b1610]" style={{ background: r.color }}>{num(i)}</span>
      {!compact && (
        <span className="min-w-0 flex-1">
          <span className="block truncate">{r.role}</span>
          <span className="block text-[11px] font-medium text-surface-2/60">{r.person} · {r.replyIn}</span>
        </span>
      )}
      {compact && <span>{r.role}</span>}
      {!compact && <r.icon className="size-4 shrink-0" style={{ color: r.color }} aria-hidden="true" />}
    </button>
  ));

  return (
    <section id="routing" className="scroll-mt-24 px-4 py-6 sm:px-6 lg:px-8" aria-label="Where your note goes">
      <div ref={hostRef} className="ny-ct-stage-3d relative mx-auto h-[82vh] min-h-[580px] max-w-7xl overflow-hidden rounded-[2rem] shadow-panel">
        {use3D ? (
          <Suspense fallback={<div className="absolute inset-x-0 bottom-40 top-28 lg:bottom-24 lg:right-[22rem]"><Diagram active={active} onPick={toggle} /></div>}>
            <SwitchboardScene activeIndex={index} onSelect={(i) => onPick(i < 0 ? "" : ROUTES[i]?.id ?? "")} running={onScreen} shift={env.shift} />
          </Suspense>
        ) : (
          <div className="absolute inset-x-0 bottom-48 top-28 sm:bottom-44 lg:bottom-24 lg:right-[22rem]"><Diagram active={active} onPick={toggle} /></div>
        )}

        {/* large screens: glass list on the right */}
        <div className="absolute bottom-6 right-6 top-6 hidden w-80 flex-col gap-3 overflow-y-auto lg:flex">
          <div className="ny-glass-dark rounded-2xl p-4 text-surface-0">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent"><PenLine className="size-3.5" aria-hidden="true" />One inbox · six people</p>
            <h2 className="mt-2 font-display text-2xl font-semibold leading-tight">Where your <em className="font-medium text-brand-accent">note goes.</em></h2>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-surface-2/60">{use3D ? "WebGL · live" : "Static view"}</p>
          </div>
          <nav className="ny-glass-dark flex flex-col gap-1 rounded-2xl p-2" aria-label="Choose who reads your note">{list(false)}</nav>
          {current ? <Details route={current} number={num(index)} onWrite={onWrite} /> : <IdleHint />}
        </div>

        {/* small + medium screens */}
        <div className="ny-glass-dark pointer-events-none absolute inset-x-3 top-3 rounded-2xl p-4 text-surface-0 lg:hidden">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent"><PenLine className="size-3.5" aria-hidden="true" />One inbox · six people</p>
          <h2 className="mt-1.5 font-display text-xl font-semibold leading-tight sm:text-2xl">Where your <em className="font-medium text-brand-accent">note goes.</em></h2>
        </div>
        <div className="absolute inset-x-3 bottom-3 flex flex-col gap-2 lg:hidden">
          {current ? <Details route={current} number={num(index)} onWrite={onWrite} /> : <IdleHint />}
          <div className="ny-glass-dark flex gap-1.5 overflow-x-auto rounded-2xl p-2" role="group" aria-label="Choose who reads your note">{list(true)}</div>
        </div>

        <p className="pointer-events-none absolute bottom-6 left-6 hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-surface-2/55 lg:flex">
          {use3D ? "Move the pointer to look around · tap empty space to reset" : "Static view · motion is off for this device"}
        </p>
      </div>
    </section>
  );
}
