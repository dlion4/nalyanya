"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/format";

/** Accessible modal (center) or drawer (right) built on Headless UI Dialog. */
export type ModalSize = "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-4xl",
};

export function ModalDialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  side = "center",
  wide = false,
  size,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: "center" | "right";
  wide?: boolean;
  size?: ModalSize;
}) {
  const isDrawer = side === "right";
  const resolvedSize: ModalSize = size ?? (wide ? "lg" : "md");
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-brand-deep/45 backdrop-blur-sm transition duration-300 ease-out data-closed:opacity-0"
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className={cn("flex min-h-full", isDrawer ? "justify-end" : "items-center justify-center p-4 sm:p-8")}>
          <DialogPanel
            transition
            className={cn(
              "relative flex w-full flex-col bg-surface-1 shadow-lift transition duration-300 ease-out",
              isDrawer
                ? "h-dvh max-w-xl rounded-l-[28px] data-closed:translate-x-full"
                : cn("max-h-[90dvh] rounded-[28px] data-closed:translate-y-4 data-closed:scale-95 data-closed:opacity-0", SIZE_MAP[resolvedSize]),
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-hairline p-5 sm:p-6">
              <div className="min-w-0">
                <DialogTitle as="h2" className="ny-title text-2xl">
                  {title}
                </DialogTitle>
                {description && <p className="mt-1 text-sm leading-relaxed text-text-secondary">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="ny-btn ny-btn-ghost ny-btn-sm size-10 shrink-0 p-0"
              >
                <X className="size-4" />
              </button>
            </header>
            <div className="ny-scroll min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
            {footer && <footer className="border-t border-hairline bg-surface-0/70 p-4 sm:p-5">{footer}</footer>}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
