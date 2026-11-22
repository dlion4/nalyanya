import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/settings";
import "./settings.css";

export default function SettingsPage() {
  return <ModuleWorkspace config={pageData} />;
}
