import { redirect } from "next/navigation";

/** Legacy route — primary admin URL is `/admin`. */
export default function AdminDashboardRedirect() {
  redirect("/admin");
}
