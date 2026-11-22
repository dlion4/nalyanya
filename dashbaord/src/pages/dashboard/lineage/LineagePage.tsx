import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/lineage";
import "./lineage.css";

export default function LineagePage() {
  return <ModuleWorkspace config={pageData} />;
}
