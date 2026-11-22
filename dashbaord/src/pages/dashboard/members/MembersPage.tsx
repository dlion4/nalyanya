import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/members";
import "./members.css";

export default function MembersPage() {
  return <ModuleWorkspace config={pageData} />;
}
