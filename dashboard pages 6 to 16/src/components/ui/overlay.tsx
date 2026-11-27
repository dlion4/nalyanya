"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Modal — medium & small sizes, mechanical camera-shutter entrance     */
/* ------------------------------------------------------------------ */

const MODAL_SIZES = {
  sm: "max-w-[380px]",
  md: "max-w-[540px]",
  lg: "max-w-[760px]",
  xl: "max-w-[1000px]",
} as const;

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  sub?: string;
  size?: keyof typeof MODAL_SIZES;
  children: ReactNode;
  footer?: ReactNode;
  tone?: "brand" | "gold" | "danger";
};

export function Modal({ open, onClose, title, sub, size = "md", children, footer, tone = "brand" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const barColor =
    tone === "gold" ? "bg-brand-accent" : tone === "danger" ? "bg-danger" : "bg-brand-primary";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center p-3 sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-[rgba(26,38,24,0.55)] backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`relative w-full ${MODAL_SIZES[size]} overflow-hidden rounded-t-2xl border border-border-subtle bg-surface-1 shadow-[var(--shadow-modal)] sm:rounded-2xl`}
            initial={{ opacity: 0, y: 26, scale: 0.965 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.7 }}
          >
            <div className={`h-1 w-full ${barColor}`} />
            <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
              <div className="min-w-0">
                <h2 className="ny-display text-lg leading-tight text-text-primary">{title}</h2>
                {sub && <p className="mt-1 text-sm text-text-secondary">{sub}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="ny-btn ny-btn-ghost ny-btn-sm shrink-0 !px-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="ny-scroll max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
            {footer && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border-subtle bg-surface-2 px-5 py-3.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Drawer — right/left side sheet, full-screen below lg                 */
/* ------------------------------------------------------------------ */

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  sub?: string;
  side?: "right" | "left";
  width?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Drawer({ open, onClose, title, sub, side = "right", width = "max-w-[520px]", children, footer }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const from = side === "right" ? { x: 40, opacity: 0 } : { x: -40, opacity: 0 };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[88]">
          <motion.div
            className="absolute inset-0 bg-[rgba(26,38,24,0.5)] backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`absolute inset-y-0 ${side === "right" ? "right-0" : "left-0"} w-full ${width} flex flex-col border-border-subtle bg-surface-1 shadow-[var(--shadow-modal)]`}
            initial={from}
            animate={{ x: 0, opacity: 1 }}
            exit={from}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
              <div className="min-w-0">
                <h2 className="ny-display text-lg leading-tight">{title}</h2>
                {sub && <p className="mt-1 text-sm text-text-secondary">{sub}</p>}
              </div>
              <button type="button" onClick={onClose} aria-label="Close panel" className="ny-btn ny-btn-ghost ny-btn-sm !px-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="ny-scroll flex-1 overflow-y-auto px-5 py-4">{children}</div>
            {footer && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border-subtle bg-surface-2 px-5 py-3.5">
                {footer}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Toasts — slide in from bottom-end, 4s auto-hide (≤4 triggers/page)   */
/* ------------------------------------------------------------------ */

type Toast = { id: number; tone: "ok" | "warn" | "info" | "danger"; title: string; body?: string };
type ToastFn = (t: Omit<Toast, "id">) => void;

const ToastCtx = createContext<ToastFn | null>(null);

export function useToast(): ToastFn {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const seq = useRef(0);

  const push = useCallback<ToastFn>((t) => {
    seq.current += 1;
    const id = seq.current;
    setItems((prev) => [...prev.slice(-3), { ...t, id }]);
    window.setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  const value = useMemo(() => push, [push]);

  const icon = {
    ok: <CheckCircle2 className="h-4 w-4 text-success" />,
    warn: <AlertTriangle className="h-4 w-4 text-warning" />,
    danger: <AlertTriangle className="h-4 w-4 text-danger" />,
    info: <Info className="h-4 w-4 text-info" />,
  } as const;

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 right-4 z-[120] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-1 px-4 py-3 shadow-[var(--shadow-lift)]"
            >
              <span className="mt-0.5">{icon[t.tone]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug text-text-primary">{t.title}</p>
                {t.body && <p className="mt-0.5 text-xs leading-relaxed text-text-secondary">{t.body}</p>}
              </div>
              <button
                type="button"
                onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
                aria-label="Dismiss notification"
                className="ny-btn ny-btn-ghost ny-btn-sm !min-h-0 !px-1.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
