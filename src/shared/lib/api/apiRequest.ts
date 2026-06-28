import { apiFetch, getApiBaseUrl, type ApiFetchOptions } from "@/shared/lib/api/apiClient";
import { parseApiError } from "@/shared/lib/api/parseApiError";

/** Build an absolute API URL from a path (e.g. `/api/events`). */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalized}`;
}

export type ApiRequestOptions = ApiFetchOptions & {
  fallbackError?: string;
};

/** Authenticated JSON request with shared error parsing. */
export async function apiRequest(
  token: string,
  path: string,
  init?: RequestInit,
  options?: ApiRequestOptions
): Promise<Response> {
  const response = await apiFetch(token, apiUrl(path), init, options);
  if (!response.ok) {
    throw new Error(
      await parseApiError(response, options?.fallbackError ?? "API request failed.")
    );
  }
  return response;
}

export async function apiRequestJson<T>(
  token: string,
  path: string,
  init?: RequestInit,
  options?: ApiRequestOptions
): Promise<T> {
  const response = await apiRequest(token, path, init, options);
  return response.json() as Promise<T>;
}

/** Public GET (no auth) — e.g. vendor catalog with ISR. */
export async function publicRequest(
  path: string,
  init?: RequestInit,
  fallbackError = "API request failed."
): Promise<Response> {
  const response = await fetch(apiUrl(path), init);
  if (!response.ok) {
    throw new Error(await parseApiError(response, fallbackError));
  }
  return response;
}

export async function publicRequestJson<T>(
  path: string,
  init?: RequestInit,
  fallbackError = "API request failed."
): Promise<T> {
  const response = await publicRequest(path, init, fallbackError);
  return response.json() as Promise<T>;
}
