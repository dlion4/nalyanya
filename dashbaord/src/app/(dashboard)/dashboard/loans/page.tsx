import type { Metadata } from "next";
import "@/styles/pages/dashboard/loans.css";
import { DashboardModulePage } from "@/views/dashboard/stub/DashboardModulePage";

export const metadata: Metadata = { title: "Loans · T-10" };

export default function LoansRoute() {
  return <DashboardModulePage slug="loans" />;
}
