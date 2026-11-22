import type { ReactNode } from "react";
import { DashboardShell } from "@/components/shell/DashboardShell";

/* Every /dashboard/* route mounts inside the shared shell (sidebar + top bar). */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
