import type { ReactNode } from "react";
import { DashboardShell } from "@/components/shell/DashboardShell";
import { ToastProvider } from "@/components/ui/overlay";

export const metadata = {
  title: "Nalyanya · Family dashboard",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <DashboardShell>{children}</DashboardShell>
    </ToastProvider>
  );
}
