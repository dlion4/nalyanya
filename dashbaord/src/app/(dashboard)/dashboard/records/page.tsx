import type { Metadata } from "next";
import "@/styles/pages/dashboard/records.css";
import { DashboardModulePage } from "@/views/dashboard/stub/DashboardModulePage";

export const metadata: Metadata = { title: "Records · T-12" };

export default function RecordsRoute() {
  return <DashboardModulePage slug="records" />;
}
