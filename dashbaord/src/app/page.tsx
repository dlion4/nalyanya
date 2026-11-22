import { redirect } from "next/navigation";

/* The public home pages come in later build steps; the family console opens first. */
export default function RootPage() {
  redirect("/dashboard");
}
