"use client";

import { Switch } from "@headlessui/react";
import { Keyboard, Quote, Volume2 } from "lucide-react";
import { usePrefs } from "@/components/shell/PrefsProvider";
import { Reveal } from "@/components/ui/motion";
import { SectionHeader } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { SAYINGS } from "@/data/dashboard/lineage";

/** S10 — Mzee's sayings, read aloud with the browser's voice. */
export function Sayings() {
  const { notify } = useToast();

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      notify({ title: "Read-aloud is not available here", body: "This browser has no speech voices.", tone: "info" });
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    notify({ title: "Reading aloud", tone: "info" });
  };

  return (
    <section id="sayings" className="scroll-mt-24 space-y-8">
      <SectionHeader
        eyebrow="S10 · Mzee's sayings"
        title="Words that hold the family together"
        description="Proverbs passed from one generation to the next. Each can be read aloud, in Swahili and English."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {SAYINGS.map((saying, index) => (
          <Reveal key={saying.sw} delay={index * 0.08}>
            <figure className="ny-card flex h-full flex-col p-7">
              <Quote className="size-8 text-brand-accent" aria-hidden />
              <blockquote className="ny-title mt-4 text-2xl leading-snug">“{saying.sw}”</blockquote>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{saying.en}</p>
              <figcaption className="mt-auto flex items-center justify-between gap-3 border-t border-hairline pt-5 pt-5 text-sm">
                <span className="font-semibold text-text-primary">{saying.by}</span>
                <button
                  type="button"
                  onClick={() => speak(`${saying.sw}. ${saying.en}`)}
                  aria-label={`Read aloud: ${saying.sw}`}
                  className="ny-btn ny-btn-quiet ny-btn-sm"
                >
                  <Volume2 className="size-4" aria-hidden />
                  Read aloud
                </button>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** S11 — accessibility & inclusion: Elder Mode, calmer motion, keyboard help. */
export function AccessPanel({ onHelp }: { onHelp: () => void }) {
  const { elder, setElder, calmMotion } = usePrefs();
  const { notify } = useToast();

  return (
    <section id="access" className="ny-card scroll-mt-24 grid gap-8 p-6 sm:p-9 lg:grid-cols-[1.25fr_1fr] lg:items-center">
      <div className="space-y-4">
        <p className="ny-eyebrow">S11 · Old and young, together</p>
        <h2 className="ny-title text-3xl sm:text-4xl">Made for every hand that holds a phone</h2>
        <p className="text-base leading-relaxed text-text-secondary">
          Elder Mode enlarges the type and every button, shows a calm 2D tree with the same navigation, and pauses the slow orbit. Every node is
          announced by name, role and generation, and the whole tree works with the keyboard.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button type="button" onClick={onHelp} className="ny-btn ny-btn-ghost ny-btn-sm">
            <Keyboard className="size-4" aria-hidden />
            Keyboard shortcuts
          </button>
          <span className="ny-chip">Motion: {calmMotion ? "calm" : "full"}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-hairline bg-surface-0/70 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-text-primary">Elder Mode</p>
            <p className="text-sm text-text-secondary">{elder ? "On · larger type, 2D tree" : "Off · standard view"}</p>
          </div>
          <Switch
            checked={elder}
            onChange={(value: boolean) => {
              setElder(value);
              notify({
                title: value ? "Elder Mode is on" : "Elder Mode is off",
                body: value ? "Larger type, 2D tree, calmer motion." : "Standard view restored.",
                tone: "success",
              });
            }}
            aria-label="Elder Mode"
            className="group relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full bg-surface-3 transition duration-200 data-checked:bg-brand-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
          >
            <span className="size-6 translate-x-0.5 rounded-full bg-white shadow transition duration-200 group-data-checked:translate-x-[30px]" />
          </Switch>
        </div>
        <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-text-secondary">
          <li>• 18px base type and 56px touch targets</li>
          <li>• 2D tree with identical clicks, search and filters</li>
          <li>• Slow orbit and 3D motion paused</li>
        </ul>
      </div>
    </section>
  );
}
