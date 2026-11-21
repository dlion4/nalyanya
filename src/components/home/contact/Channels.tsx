/* ── H-7 S3 · Channel cards — Call · WhatsApp · SMS · Email · Visit ───────────
   Every card is built in full. Email is a real mailto link plus copy. Call,
   WhatsApp, SMS and Visit open a designed panel that ends at the labeled
   "Ready — connects when the backend is wired" state — nothing is sent.    */

import { useState } from "react";
import { Check, Copy, ShieldAlert } from "lucide-react";
import ChannelModal from "./ChannelModal";
import Reveal from "../Reveal";
import { CHANNELS, OFFICE_EMAIL, type ChannelId } from "../../../data/home/contact";
import { cn } from "../../../utils/cn";

const MAILTO = `mailto:${OFFICE_EMAIL}?subject=${encodeURIComponent("Note for the family office")}`;

export default function Channels() {
  const [open, setOpen] = useState<ChannelId | null>(null);
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");

  const useForm = () => {
    setOpen(null);
    document.getElementById("write")?.scrollIntoView();
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(OFFICE_EMAIL);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
    window.setTimeout(() => setCopy("idle"), 2200);
  };

  return (
    <section id="channels" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24 lg:px-8" aria-label="Other ways to reach the family office">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="ny-section-label">Channels</span>
              <h2 className="ny-heading mt-3 text-4xl sm:text-5xl">Five ways in. <em className="font-medium text-brand-secondary">You choose.</em></h2>
            </div>
            <p className="max-w-sm text-sm text-text-tertiary">Phone lines are placeholders on this public page. Sign-in shows the live ones.</p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CHANNELS.map((c, i) => (
            <Reveal key={c.id} delay={(i % 5) * 0.05} className="h-full">
              <article className="ny-ct-channel ny-card flex h-full flex-col rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="ny-icon-chip"><c.icon className="size-5" aria-hidden="true" /></span>
                  <span className="ny-num text-[10px] font-bold uppercase tracking-[0.14em] text-text-tertiary">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold">{c.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">{c.lead}</p>
                <p className="ny-num mt-3 rounded-xl bg-surface-2/70 px-3 py-2 text-xs font-semibold break-all text-text-primary">{c.detail}</p>
                <div className="mt-4 flex flex-col gap-2 pt-1">
                  {c.id === "email" ? (
                    <>
                      <a href={MAILTO} className="ny-btn-primary text-sm">{c.action}</a>
                      <button type="button" onClick={copyEmail} className="ny-btn-ghost text-sm">
                        {copy === "copied" ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                        {copy === "copied" ? "Copied" : "Copy address"}
                      </button>
                      {copy === "failed" && <p className="text-xs font-semibold text-text-tertiary">Copy didn't work — the address is written above.</p>}
                    </>
                  ) : (
                    <button type="button" onClick={() => setOpen(c.id)} aria-haspopup="dialog"
                      className={cn("text-sm", c.id === "call" ? "ny-btn-gold" : "ny-btn-ghost")}>
                      {c.action}
                    </button>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-brand-danger/25 bg-brand-danger-tint/60 px-4 py-3 text-center text-sm font-semibold text-brand-primary">
            <ShieldAlert className="size-5 shrink-0 text-brand-danger" aria-hidden="true" />
            On any channel, no one from the family office will ever ask for your M-Pesa PIN, an OTP or your password.
          </p>
        </Reveal>
      </div>

      <ChannelModal id={open} onClose={() => setOpen(null)} onUseForm={useForm} />
    </section>
  );
}
