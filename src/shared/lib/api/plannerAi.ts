const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export interface DraftInquiryPayload {
  plannerName: string;
  vendorBusinessName: string;
  vendorCategory: string;
  eventName: string;
  weddingDate: string;
  venue?: string;
  budgetLkr?: number;
  styleNotes?: string;
  serviceRequirements?: string[];
}

export interface DraftInquiryResponse {
  subject: string;
  body: string;
  isSimulated: boolean;
}

export interface ProposedTask {
  title: string;
  description?: string | null;
  suggestedDueDate?: string | null;
  priority: string;
}

export interface MeetingSummaryResponse {
  executiveSummary: string;
  proposedTasks: ProposedTask[];
  isSimulated: boolean;
}

export async function draftInquiryEmail(
  token: string,
  payload: DraftInquiryPayload
): Promise<DraftInquiryResponse> {
  const res = await fetch(`${BASE}/api/planner/ai/draft-inquiry`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || "Failed to draft inquiry email.");
  }
  return res.json();
}

export async function summarizeMeeting(
  token: string,
  payload: { eventId: string; eventName: string; meetingNotesOrTranscript: string }
): Promise<MeetingSummaryResponse> {
  const res = await fetch(`${BASE}/api/planner/ai/summarize-meeting`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || "Failed to summarize meeting notes.");
  }
  return res.json();
}
