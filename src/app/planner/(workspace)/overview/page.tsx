import { redirect } from "next/navigation";

/** Legacy route — planner dashboard is at `/planner/dashboard`. */
export default function PlannerOverviewRedirect() {
  redirect("/planner/dashboard");
}
