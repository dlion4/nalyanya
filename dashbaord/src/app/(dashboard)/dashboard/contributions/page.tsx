import type { Metadata } from "next";
import "@/styles/pages/dashboard/contributions.css";
import { DashboardModulePage } from "@/views/dashboard/stub/DashboardModulePage";

export const metadata: Metadata = { title: "Contributions · T-7" };

export default function ContributionsRoute() {
  return <DashboardModulePage slug="contributions" />;
}
