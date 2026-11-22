import type { Metadata } from "next";
import "@/styles/pages/dashboard/command-center.css";
import { CommandCenterPage } from "@/views/dashboard/command-center/CommandCenterPage";

export const metadata: Metadata = {
  title: "Command center · T-1",
};

export default function DashboardPage() {
  return <CommandCenterPage />;
}
