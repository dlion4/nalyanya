"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CircleCheck, Info, TriangleAlert } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/format";

type Tone = "success" | "info" | "warning" | "danger";

interface ToastItem {
  id: number;
  title: string;
  body?: string;
  tone: Tone;
}

interface ToastApi {
  notify: (toast: { title: string; body?: string; tone?: Tone }) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const notify = useCallback<ToastApi["notify"]>((toast) => {
    idRef.current += 1;
    const id = idRef.current;
    setItems((prev) => [...prev.slice(-3), { id, title: toast.title, body: toast.body, tone: toast.tone ?? "info" }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 4600);
  }, []);

  const api = useMemo<ToastApi>(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const Icon = item.tone === "success" ? CircleCheck : item.tone === "info" ? Info : TriangleAlert;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-hairline bg-surface-1 p-4 shadow-lift"
                role="status"
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
                    item.tone === "success" && "bg-[#e4f1e5] text-success",
                    item.tone === "info" && "bg-[#e3eef6] text-info",
                    item.tone === "warning" && "bg-[#fbf0d6] text-[#8a5d00]",
                    item.tone === "danger" && "bg-[#fbe5e5] text-danger",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                  {item.body && <p className="mt-0.5 text-sm leading-snug text-text-secondary">{item.body}</p>}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
