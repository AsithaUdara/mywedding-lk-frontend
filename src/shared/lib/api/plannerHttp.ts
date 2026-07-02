import { apiFetch, redirectPlannerIfPaymentRequired } from "@/shared/lib/api/apiClient";

export { redirectPlannerIfPaymentRequired };

export async function plannerFetch(
  token: string,
  input: string,
  init?: RequestInit
): Promise<Response> {
  return apiFetch(token, input, init, { planner: true });
}
