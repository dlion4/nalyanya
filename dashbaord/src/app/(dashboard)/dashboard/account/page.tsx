import type { Metadata } from "next";
import "@/styles/pages/dashboard/account.css";
import { DashboardModulePage } from "@/views/dashboard/stub/DashboardModulePage";

export const metadata: Metadata = { title: "Account · T-15" };

export default function AccountRoute() {
  return <DashboardModulePage slug="account" />;
}
