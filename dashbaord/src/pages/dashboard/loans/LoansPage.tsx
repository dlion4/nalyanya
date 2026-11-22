import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/loans";
import "./loans.css";

export default function LoansPage() {
  return <ModuleWorkspace config={pageData} />;
}
