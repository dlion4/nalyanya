import type { Metadata } from "next";
import "@/styles/pages/dashboard/obituaries.css";
import { DashboardModulePage } from "@/views/dashboard/stub/DashboardModulePage";

export const metadata: Metadata = { title: "Obituaries · T-6" };

export default function ObituariesRoute() {
  return <DashboardModulePage slug="obituaries" />;
}
