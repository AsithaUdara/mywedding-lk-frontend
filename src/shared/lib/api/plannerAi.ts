import { plannerFetch } from "@/shared/lib/api/plannerHttp";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface ProposedTask {
  title: string;
  description?: string | null;
  suggestedDueDate?: string | null;
  priority: string;
}

export interface TaskSuggestionResponse {
  executiveSummary: string;
  proposedTasks: ProposedTask[];
  isSimulated: boolean;
}

export interface VendorSuggestion {
  vendorServiceId: string;
  vendorUserId: string;
  businessName: string;
  serviceName: string;
  categoryName: string;
  basePrice: number;
  averageRating: number;
  score: number;
  reason: string;
}

export async function suggestTasksFromNotes(
  token: string,
  payload: { eventId: string; eventName: string; notes: string }
): Promise<TaskSuggestionResponse> {
  const res = await plannerFetch(token, `${BASE}/api/planner/ai/suggest-tasks`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || "Failed to suggest tasks.");
  }
  return res.json();
}

export async function suggestVendors(
  token: string,
  payload: { eventId: string; category: string; topN?: number }
): Promise<VendorSuggestion[]> {
  const res = await plannerFetch(token, `${BASE}/api/planner/ai/suggest-vendors`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || "Failed to suggest vendors.");
  }
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((row: Record<string, unknown>) => ({
    vendorServiceId: String(row.vendorServiceId ?? row.VendorServiceId ?? ""),
    vendorUserId: String(row.vendorUserId ?? row.VendorUserId ?? ""),
    businessName: String(row.businessName ?? row.BusinessName ?? ""),
    serviceName: String(row.serviceName ?? row.ServiceName ?? ""),
    categoryName: String(row.categoryName ?? row.CategoryName ?? ""),
    basePrice: Number(row.basePrice ?? row.BasePrice ?? 0),
    averageRating: Number(row.averageRating ?? row.AverageRating ?? 0),
    score: Number(row.score ?? row.Score ?? 0),
    reason: String(row.reason ?? row.Reason ?? ""),
  }));
}
