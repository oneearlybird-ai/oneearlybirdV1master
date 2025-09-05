import { redirect } from "next/navigation";

export const dynamic = "force-static";
export const metadata = { robots: { index: false, follow: false } };

export default function SignupThanksAlias() {
  redirect("/thanks");
}
