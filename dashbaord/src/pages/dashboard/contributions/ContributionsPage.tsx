import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/contributions";
import "./contributions.css";

export default function ContributionsPage() {
  return <ModuleWorkspace config={pageData} />;
}
