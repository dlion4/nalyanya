/* ── SimulatedReady — the one honest "sent" state of the frontend-only build ── */

import type { ReactNode } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";

export default function SimulatedReady({
  title = "Ready — connects when the backend is wired.",
  body,
  reference,
  children,
  onReset,
  resetLabel = "Start again",
}: {
  title?: string;
  body: string;
  reference?: string;
  children?: ReactNode;
  onReset?: () => void;
  resetLabel?: string;
}) {
  return (
    <div role="status" className="rounded-2xl border border-brand-success/30 bg-brand-success-tint p-5 text-center">
      <CheckCircle2 className="mx-auto size-8 text-brand-success" aria-hidden="true" />
      <p className="mt-2 font-display text-lg font-semibold leading-snug text-brand-primary">{title}</p>
      {reference && (
        <p className="ny-num mx-auto mt-3 inline-block rounded-pill border border-dashed border-brand-primary/40 bg-surface-0 px-4 py-1.5 text-base font-bold tracking-[0.1em] text-brand-primary">
          {reference}
        </p>
      )}
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">{body}</p>
      {children}
      {onReset && (
        <button type="button" onClick={onReset} className="ny-btn-ghost mt-4 text-sm">
          <RotateCcw className="size-4" aria-hidden="true" />
          {resetLabel}
        </button>
      )}
    </div>
  );
}
