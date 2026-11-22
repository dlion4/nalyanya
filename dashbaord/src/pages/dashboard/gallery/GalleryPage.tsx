import ModuleWorkspace from "../shared/ModuleWorkspace";
import { pageData } from "@/data/dashboard/gallery";
import "./gallery.css";

export default function GalleryPage() {
  return <ModuleWorkspace config={pageData} />;
}
