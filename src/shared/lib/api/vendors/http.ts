import { apiFetch } from "@/shared/lib/api/apiClient";
import { apiUrl } from "@/shared/lib/api/apiRequest";
import { parseApiError } from "@/shared/lib/api/parseApiError";

export async function vendorAuthedJson<T>(
  token: string,
  path: string,
  init?: RequestInit
): Promise<T> {
  const response = await apiFetch(token, apiUrl(path), init);
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Vendor API request failed"));
  }
  return response.json() as Promise<T>;
}

export async function vendorPublicJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), init);
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Vendor API request failed"));
  }
  return response.json() as Promise<T>;
}

export async function vendorAuthedVoid(
  token: string,
  path: string,
  init?: RequestInit
): Promise<void> {
  const response = await apiFetch(token, apiUrl(path), init);
  if (!response.ok) {
    throw new Error(await parseApiError(response, "Vendor API request failed"));
  }
}
