/**
 * Shared HTTP helpers for backend API calls.
 * Keeps Authorization headers and planner 402 handling in one place.
 */

export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }
  return base;
}

export function buildAuthHeaders(token: string, init?: HeadersInit): Headers {
  const headers = new Headers(init);
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

/** Redirect planner CRM users to billing when the API returns 402 (subscription expired). */
export function redirectPlannerIfPaymentRequired(response: Response): void {
  if (response.status === 402 && typeof window !== "undefined") {
    window.location.assign("/planner/billing?expired=1");
    throw new Error("Planner subscription expired.");
  }
}

export type ApiFetchOptions = {
  /** When true, redirects to planner billing on HTTP 402. */
  planner?: boolean;
};

export async function apiFetch(
  token: string,
  input: string,
  init?: RequestInit,
  options?: ApiFetchOptions
): Promise<Response> {
  const headers = buildAuthHeaders(token, init?.headers);
  if (init?.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, { ...init, headers });

  if (options?.planner) {
    redirectPlannerIfPaymentRequired(response);
  }

  return response;
}
