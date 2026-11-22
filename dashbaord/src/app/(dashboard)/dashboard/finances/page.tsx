import type { Metadata } from "next";
import "@/styles/pages/dashboard/finances.css";
import { DashboardModulePage } from "@/views/dashboard/stub/DashboardModulePage";

export const metadata: Metadata = { title: "Finances · T-8" };

export default function FinancesRoute() {
  return <DashboardModulePage slug="finances" />;
}
