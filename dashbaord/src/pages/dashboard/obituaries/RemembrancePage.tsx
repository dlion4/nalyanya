import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/obituaries";
import "./obituaries.css";

export default function RemembrancePage() {
  return <ModuleWorkspace config={pageData} />;
}
