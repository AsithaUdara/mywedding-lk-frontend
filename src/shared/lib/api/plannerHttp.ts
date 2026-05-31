/** Redirect planner CRM users to billing when the API returns 402 (subscription expired). */
export function redirectPlannerIfPaymentRequired(response: Response): void {
  if (response.status === 402 && typeof window !== "undefined") {
    window.location.assign("/planner/billing?expired=1");
    throw new Error("Planner subscription expired.");
  }
}

export async function plannerFetch(
  token: string,
  input: string,
  init?: RequestInit
): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(input, { ...init, headers });
  redirectPlannerIfPaymentRequired(res);
  return res;
}
