/* ── H-7 Contact · page composition (route: /contact) ────────────────────────
   Stylesheet: src/styles/pages/contact.css (injected on enter, removed on leave)
   Data:       src/data/home/contact.ts                                         */

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import Navbar from "../../components/home/Navbar";
import SectionRail from "../../components/home/SectionRail";
import CtaFooter from "../../components/home/CtaFooter";
import ContactHeader from "../../components/home/contact/ContactHeader";
import ContactForm, { type FormPreset } from "../../components/home/contact/ContactForm";
import Journey from "../../components/home/contact/Journey";
import Tracker from "../../components/home/contact/Tracker";
import Switchboard3D from "../../components/home/contact/Switchboard3D";
import People from "../../components/home/contact/People";
import Channels from "../../components/home/contact/Channels";
import Office from "../../components/home/contact/Office";
import Support from "../../components/home/contact/Support";
import Faq from "../../components/home/contact/Faq";
import Emergency from "../../components/home/contact/Emergency";
import { CONTACT_CTA, ROUTES } from "../../data/home/contact";
import { usePageStyles } from "../../lib/usePageStyles";
import contactCss from "../../styles/pages/contact.css?inline";

const RAIL = [
  { id: "write", label: "Write" },
  { id: "journey", label: "Journey" },
  { id: "follow", label: "Follow" },
  { id: "routing", label: "Routing" },
  { id: "people", label: "People" },
  { id: "channels", label: "Channels" },
  { id: "office", label: "Office" },
  { id: "support", label: "Support" },
  { id: "faq", label: "Questions" },
  { id: "emergency", label: "Emergency" },
];

/* ONE toast — shown once, when a note gets its ticket reference */
function Toast({ message, onClear }: { message: string; onClear: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onClear, 6500);
    return () => window.clearTimeout(t);
  }, [message, onClear]);
  return (
    <AnimatePresence>
      {message && (
        <motion.div key={message} role="status" aria-live="polite"
          initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-4 bottom-4 z-[85] mx-auto flex max-w-lg items-start gap-3 rounded-2xl border border-brand-success/40 bg-surface-1 p-4 shadow-panel">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-success" aria-hidden="true" />
          <p className="flex-1 text-sm font-semibold leading-relaxed text-text-primary">{message}</p>
          <button type="button" onClick={onClear} aria-label="Dismiss" className="ny-touch grid size-9 shrink-0 place-items-center rounded-pill hover:bg-surface-2">
            <X className="size-4" aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Contact() {
  usePageStyles("contact", contactCss);
  useEffect(() => { document.title = "Contact — Nalyanya · The family office"; }, []);

  const [topic, setTopic] = useState(ROUTES[0].id);
  const [preset, setPreset] = useState<FormPreset | null>(null);
  const [ticket, setTicket] = useState("");
  const [toast, setToast] = useState("");
  const clearToast = useCallback(() => setToast(""), []);

  // "Write" on a person or in the 3D scene pre-selects that topic in the form
  const writeAbout = (id: string) => {
    setPreset({ topic: id, urgent: "normal", key: Date.now() });
    document.getElementById("write")?.scrollIntoView();
  };

  return (
    <main className="page-contact">
      <Navbar />
      <SectionRail items={RAIL} />
      <ContactHeader />
      <ContactForm topic={topic} onTopic={setTopic} preset={preset} onSent={setTicket} onToast={setToast} />
      <Journey />
      <Tracker ticket={ticket} />
      <Switchboard3D active={topic} onPick={(id) => setTopic(id || ROUTES[0].id)} onWrite={writeAbout} />
      <People onWrite={writeAbout} />
      <Channels />
      <Office />
      <Support />
      <Faq />
      <Emergency />
      <CtaFooter
        eyebrow={CONTACT_CTA.eyebrow}
        title={CONTACT_CTA.title}
        titleAccent={CONTACT_CTA.titleAccent}
        copy={CONTACT_CTA.copy}
        primary={CONTACT_CTA.primary}
        secondary={CONTACT_CTA.secondary}
      />
      <Toast message={toast} onClear={clearToast} />
    </main>
  );
}
