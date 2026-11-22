import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/professions";
import "./professions.css";

export default function ProfessionsPage() {
  return <ModuleWorkspace config={pageData} />;
}
