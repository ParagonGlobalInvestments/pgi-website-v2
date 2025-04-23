import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Redirect to the portal dashboard which has the sidebar
  redirect("/portal/dashboard");
}
