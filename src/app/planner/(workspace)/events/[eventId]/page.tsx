import { redirect } from "next/navigation";

export default async function PlannerEventDetailRedirectPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  redirect(`/events/${eventId}`);
}
