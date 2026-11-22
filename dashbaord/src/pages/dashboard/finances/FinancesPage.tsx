import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/finances";
import "./finances.css";

export default function FinancesPage() {
  return <ModuleWorkspace config={pageData} />;
}
