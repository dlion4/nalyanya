import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/communications";
import "./communications.css";

export default function CommunicationsPage() {
  return <ModuleWorkspace config={pageData} />;
}
