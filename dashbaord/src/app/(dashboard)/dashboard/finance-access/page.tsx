import type { Metadata } from "next";
import "@/styles/pages/dashboard/finance-access.css";
import { DashboardModulePage } from "@/views/dashboard/stub/DashboardModulePage";

export const metadata: Metadata = { title: "Finance access · T-9" };

export default function FinanceAccessRoute() {
  return <DashboardModulePage slug="finance-access" />;
}
