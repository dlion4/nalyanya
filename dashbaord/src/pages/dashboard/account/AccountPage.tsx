import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/account";
import "./account.css";

export default function AccountPage() {
  return <ModuleWorkspace config={pageData} />;
}
