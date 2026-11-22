import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/finance-access";
import "./finance-access.css";

export default function AllocationsPage() {
  return <ModuleWorkspace config={pageData} />;
}
