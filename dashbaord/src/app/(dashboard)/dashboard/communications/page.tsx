import type { Metadata } from "next";
import "@/styles/pages/dashboard/communications.css";
import { DashboardModulePage } from "@/views/dashboard/stub/DashboardModulePage";

export const metadata: Metadata = { title: "Communications · T-14" };

export default function CommunicationsRoute() {
  return <DashboardModulePage slug="communications" />;
}
