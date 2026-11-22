import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Nalyanya · Family lineage, finance & memories",
    template: "%s · Nalyanya",
  },
  description:
    "A warm, heritage-first family platform for the Nalyanya family, rooted at Mzee Victor Nalyanya: a living 3D family tree, family finance and memories.",
};

export const viewport: Viewport = {
  themeColor: "#1f4d3a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-surface-0 font-sans text-text-primary antialiased">{children}</body>
    </html>
  );
}
