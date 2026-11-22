import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/foundation";
import "./foundation.css";

export default function FoundationPage() {
  return <ModuleWorkspace config={pageData} />;
}
