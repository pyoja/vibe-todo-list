import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LandingPage } from "@/components/landing-page";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/todo");
  }

  return <LandingPage />;
}
