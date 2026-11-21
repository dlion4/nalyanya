/* ── H-7 S4 · Family office address — town/county, map stub, working hours EAT ──
   The clock is real (Africa/Nairobi). The street, plot, box and phone line stay
   veiled until a visit is booked or a member signs in.                      */

import { useEffect, useState } from "react";
import { Lock, MapPin, Square, Volume2 } from "lucide-react";
import Reveal from "../Reveal";
import {
  BRANCH_TOWNS, DAY_NAMES, ELDER_SCRIPT, KENYA_PATH, OFFICE, OFFICE_HOURS, OFFICE_PIN, SUNDAY_NOTE, VEIL_FIELDS,
} from "../../../data/home/contact";
import { officeStatus, useEatClock } from "../../../lib/eat";
import { cn } from "../../../utils/cn";

const R = 56;
const C = 2 * Math.PI * R;

/* read the office details aloud — uses the browser's own voice, nothing downloaded */
function useReader() {
  const [state, setState] = useState<"idle" | "speaking" | "unsupported">("idle");
  useEffect(() => () => { try { window.speechSynthesis?.cancel(); } catch { /* nothing to stop */ } }, []);
  const toggle = () => {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") { setState("unsupported"); return; }
    const synth = window.speechSynthesis;
    if (state === "speaking") { synth.cancel(); setState("idle"); return; }
    const u = new SpeechSynthesisUtterance(ELDER_SCRIPT);
    u.rate = 0.92;
    u.lang = "en-KE";
    u.onend = () => setState("idle");
    u.onerror = () => setState("idle");
    synth.cancel();
    synth.speak(u);
    setState("speaking");
  };
  return { state, toggle };
}

export default function Office() {
  const now = useEatClock();
  const status = officeStatus(now, OFFICE_HOURS);
  const reader = useReader();
  const today = OFFICE_HOURS[now.weekday];
  const angle = (now.minutes / 1440) * Math.PI * 2 - Math.PI / 2;

  return (
    <section id="office" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="The family office">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-12">

        {/* left: where it is (town and county only) + read aloud */}
        <Reveal className="lg:col-span-5">
          <span className="ny-section-label">Family office</span>
          <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">One desk in <em className="font-medium text-brand-secondary">Bungoma.</em></h2>
          <p className="ny-prose mt-3 max-w-md">{OFFICE.note}</p>

          <address className="ny-card mt-6 block rounded-[1.75rem] p-5 not-italic">
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-brand-secondary" aria-hidden="true" />
              <span>
                <span className="block font-display text-xl font-semibold text-text-primary">{OFFICE.town}</span>
                <span className="block text-sm text-text-secondary">{OFFICE.county}, {OFFICE.country}</span>
              </span>
            </p>
            <dl className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {VEIL_FIELDS.slice(0, 3).map((f) => (
                <div key={f.label} className="rounded-xl border border-surface-3/70 bg-surface-0 px-3 py-2.5">
                  <dt className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-text-tertiary"><Lock className="size-3" aria-hidden="true" />{f.label}</dt>
                  <dd className="ny-num mt-1 truncate text-sm font-semibold text-text-secondary">{f.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs font-medium text-text-tertiary">Hidden on the public page. Shared after a visit is booked, or after sign-in.</p>
          </address>

          <button type="button" onClick={reader.toggle} aria-pressed={reader.state === "speaking"} className="ny-btn-ghost mt-4 text-sm">
            {reader.state === "speaking" ? <Square className="size-4" aria-hidden="true" /> : <Volume2 className="size-4" aria-hidden="true" />}
            {reader.state === "speaking" ? "Stop reading" : "Read the office details aloud"}
          </button>
          {reader.state === "unsupported" && (
            <p className="mt-2 text-xs font-semibold text-text-secondary">Read-aloud isn't available in this browser. Switch on Elder Mode (top right) for larger text instead.</p>
          )}
        </Reveal>

        {/* right: live EAT clock + the week */}
        <Reveal delay={0.08} className="lg:col-span-7">
          <div className="ny-card rounded-[1.75rem] p-5 sm:p-7">
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative shrink-0">
                <svg viewBox="0 0 140 140" className="size-44" role="img" aria-label={`Office hours ring. ${status.label}`}>
                  <circle cx="70" cy="70" r={R} fill="none" stroke="var(--color-surface-3)" strokeWidth="9" />
                  {today && (
                    <circle cx="70" cy="70" r={R} fill="none" stroke="var(--color-brand-accent)" strokeWidth="9" strokeLinecap="round"
                      strokeDasharray={`${((today.close - today.open) / 1440) * C} ${C}`} strokeDashoffset={-(today.open / 1440) * C}
                      transform="rotate(-90 70 70)" />
                  )}
                  {[0, 6, 12, 18].map((h) => {
                    const t = (h / 24) * Math.PI * 2 - Math.PI / 2;
                    return <circle key={h} cx={70 + 70 * Math.cos(t)} cy={70 + 70 * Math.sin(t)} r="1.6" fill="var(--color-text-tertiary)" />;
                  })}
                  <circle cx={70 + R * Math.cos(angle)} cy={70 + R * Math.sin(angle)} r="6" fill="var(--color-brand-secondary)" stroke="var(--color-surface-1)" strokeWidth="2.5" />
                </svg>
                <div className="absolute inset-0 grid place-items-center text-center">
                  <span>
                    <span className="ny-num block font-display text-2xl font-semibold text-text-primary">{now.clock}</span>
                    <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-text-tertiary">EAT</span>
                  </span>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <p className="font-display text-2xl font-semibold text-text-primary">{now.day}</p>
                <p className={cn("mt-2 inline-flex items-center gap-2 rounded-pill px-3.5 py-1.5 text-xs font-bold", status.open ? "bg-brand-success-tint text-brand-success" : "bg-surface-2 text-text-secondary")}>
                  <span className={cn("size-2 rounded-pill", status.open ? "ny-ct-live bg-brand-success" : "bg-text-tertiary")} aria-hidden="true" />
                  {status.label}
                </p>
                <p className="mt-2 text-sm text-text-secondary">{OFFICE.zone} · Kenya's time, all year.</p>
              </div>
            </div>

            <table className="mt-6 w-full border-separate border-spacing-y-1 text-sm">
              <caption className="sr-only">Family office working hours, East African Time</caption>
              <thead className="sr-only"><tr><th scope="col">Day</th><th scope="col">Hours</th><th scope="col">Notes</th></tr></thead>
              <tbody>
                {OFFICE_HOURS.map((w, d) => {
                  const isToday = d === now.weekday;
                  return (
                    <tr key={DAY_NAMES[d]}>
                      <th scope="row" className={cn("rounded-l-xl px-3 py-2 text-left text-text-primary", isToday && "bg-brand-primary-tint")}>
                        {DAY_NAMES[d]}
                        {isToday && <span className="ml-2 rounded-pill bg-brand-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-surface-0">Today</span>}
                      </th>
                      <td className={cn("ny-num px-3 py-2 text-text-secondary", isToday && "bg-brand-primary-tint")}>{w ? w.label : "Closed"}</td>
                      <td className={cn("rounded-r-xl px-3 py-2 text-xs leading-snug text-text-tertiary", isToday && "bg-brand-primary-tint")}>{w ? w.note : SUNDAY_NOTE}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* map embed stub — town and county only */}
          <div className="ny-card relative mt-4 overflow-hidden rounded-[1.75rem] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-tertiary">Stylised map · county level only</p>
              <span className="ny-sim-badge">Map embed · Phase 2</span>
            </div>
            <svg viewBox="-20 0 330 330" className="mx-auto mt-3 w-full max-w-md" role="img" aria-label="Stylised map of Kenya with the family office in Bungoma and branch towns">
              <path d={KENYA_PATH} fill="#E8EFE8" stroke="#1F4D3A" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M-20 175 Q -8 190 7 198 L7 230 L-20 230 Z" fill="#cfe0ea" opacity="0.8" />
              <text x="-14" y="222" fontSize="8" fill="#5A6B57" fontStyle="italic">L. Victoria</text>
              {BRANCH_TOWNS.map((t) => (
                <g key={t.name}>
                  <circle cx={t.x} cy={t.y} r="4" fill="#1F4D3A" stroke="#fff" strokeWidth="1.5" />
                  <text x={t.x + 8} y={t.y + t.dy} fontSize="8.5" fontWeight="600" fill="#5A6B57">{t.name}</text>
                </g>
              ))}
              <circle className="ny-map-pulse" cx={OFFICE_PIN.x} cy={OFFICE_PIN.y} r="9" fill="#D4A437" />
              <circle cx={OFFICE_PIN.x} cy={OFFICE_PIN.y} r="7" fill="#B5532A" stroke="#fff" strokeWidth="2.5" />
              <text x={OFFICE_PIN.x + 11} y={OFFICE_PIN.y - 4} fontSize="9.5" fontWeight="700" fill="#B5532A">Family office</text>
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
