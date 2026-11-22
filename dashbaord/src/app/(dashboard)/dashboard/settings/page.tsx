import type { Metadata } from "next";
import "@/styles/pages/dashboard/settings.css";
import { DashboardModulePage } from "@/views/dashboard/stub/DashboardModulePage";

export const metadata: Metadata = { title: "Settings · T-16" };

export default function SettingsRoute() {
  return <DashboardModulePage slug="settings" />;
}
