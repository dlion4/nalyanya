/* ── Toast — one loud, honest line after an action. Auto-dismisses. ─────── */

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";

export default function Toast({ message, onClear }: { message: string; onClear: () => void }) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onClear, 6000);
    return () => window.clearTimeout(t);
  }, [message, onClear]);
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-4 bottom-4 z-[85] mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-brand-success/40 bg-surface-1 p-4 shadow-panel"
        >
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
