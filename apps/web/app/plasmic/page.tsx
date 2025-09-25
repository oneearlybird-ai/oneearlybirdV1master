import { redirect } from "next/navigation";

export default function PlasmicIndex() {
  // Redirect /plasmic to a default page key you set in Plasmic (e.g., 'homepage').
  redirect("/plasmic/homepage");
}

