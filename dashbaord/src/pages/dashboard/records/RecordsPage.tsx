import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/records";
import "./records.css";

export default function RecordsPage() {
  return <ModuleWorkspace config={pageData} />;
}
