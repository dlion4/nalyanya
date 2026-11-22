import type { Metadata } from "next";
import "@/styles/pages/dashboard/foundation.css";
import { DashboardModulePage } from "@/views/dashboard/stub/DashboardModulePage";

export const metadata: Metadata = { title: "Foundation · T-11" };

export default function FoundationRoute() {
  return <DashboardModulePage slug="foundation" />;
}
