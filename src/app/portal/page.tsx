import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function PortalPage() {
  const user = await currentUser();

  if (user) {
    redirect("/portal/dashboard");
  } else {
    redirect("/portal/signin");
  }
}
