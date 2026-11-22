import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/events";
import "./events.css";

export default function EventsPage() {
  return <ModuleWorkspace config={pageData} />;
}
