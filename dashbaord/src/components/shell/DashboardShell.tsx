"use client";

import { Dialog, DialogBackdrop, DialogPanel } from "@headlessui/react";
import { useState, type ReactNode } from "react";
import { SidebarContent } from "@/components/shell/Sidebar";
import { TopBar } from "@/components/shell/TopBar";
import { PrefsProvider } from "@/components/shell/PrefsProvider";
import { ToastProvider } from "@/components/ui/Toast";

/** Sticky glass top bar · evergreen sidebar (xl+) · offcanvas drawer (< xl) · toasts. */
export function DashboardShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <PrefsProvider>
      <ToastProvider>
        <div className="ny-ambient min-h-dvh">
          <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 bg-brand-primary xl:block">
            <SidebarContent />
          </aside>

          <Dialog open={drawerOpen} onClose={setDrawerOpen} className="relative z-50 xl:hidden">
            <DialogBackdrop
              transition
              className="fixed inset-0 bg-brand-deep/55 backdrop-blur-sm transition duration-300 ease-out data-closed:opacity-0"
            />
            <DialogPanel
              transition
              className="fixed inset-y-0 left-0 w-80 max-w-[86vw] bg-brand-primary shadow-lift transition duration-300 ease-out data-closed:-translate-x-full"
            >
              <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            </DialogPanel>
          </Dialog>

          <div className="min-w-0 xl:pl-72">
            <TopBar onMenu={() => setDrawerOpen(true)} />
            <main id="main" className="mx-auto w-full max-w-[1440px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </PrefsProvider>
  );
}
