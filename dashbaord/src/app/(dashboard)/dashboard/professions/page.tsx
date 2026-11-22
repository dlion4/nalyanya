import type { Metadata } from "next";
import "@/styles/pages/dashboard/professions.css";
import { DashboardModulePage } from "@/views/dashboard/stub/DashboardModulePage";

export const metadata: Metadata = { title: "Professions · T-13" };

export default function ProfessionsRoute() {
  return <DashboardModulePage slug="professions" />;
}
