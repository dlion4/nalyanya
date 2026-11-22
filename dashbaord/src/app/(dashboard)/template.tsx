import type { ReactNode } from "react";

/* Re-mounts on every navigation: each page opens like a camera shutter (see app-shell.css). */
export default function DashboardTemplate({ children }: { children: ReactNode }) {
  return <div className="ny-iris-in min-w-0">{children}</div>;
}
