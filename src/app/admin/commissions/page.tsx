import { redirect } from "next/navigation";

export default function AdminCommissionsRedirect() {
  redirect("/admin/dashboard/commissions");
}
