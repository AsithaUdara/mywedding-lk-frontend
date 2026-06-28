import { apiRequest, apiRequestJson } from "@/shared/lib/api/apiRequest";

export interface Conversation {
  id: string;
  name: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  createdAt: string;
  senderId: string;
  senderFirstName: string;
  senderLastName: string;
  senderEmail: string;
  attachment: unknown | null;
}

function mapConversation(raw: Record<string, unknown>): Conversation {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    name: String(raw.name ?? raw.Name ?? ""),
  };
}

export function mapMessage(raw: Record<string, unknown>, conversationId?: string): Message {
  return {
    id: String(raw.id ?? raw.Id ?? ""),
    conversationId: String(raw.conversationId ?? raw.ConversationId ?? conversationId ?? ""),
    content: String(raw.content ?? raw.Content ?? ""),
    createdAt: String(raw.createdAt ?? raw.CreatedAt ?? ""),
    senderId: String(raw.senderId ?? raw.SenderId ?? ""),
    senderFirstName: String(raw.senderFirstName ?? raw.SenderFirstName ?? ""),
    senderLastName: String(raw.senderLastName ?? raw.SenderLastName ?? ""),
    senderEmail: String(raw.senderEmail ?? raw.SenderEmail ?? ""),
    attachment: raw.attachment ?? raw.Attachment ?? null,
  };
}

export const getConversations = async (token: string, eventId: string): Promise<Conversation[]> => {
  const data = await apiRequestJson<unknown[]>(
    token,
    `/api/events/${eventId}/conversations`,
    { method: "GET" },
    { fallbackError: "Failed to fetch conversations." }
  );
  return (Array.isArray(data) ? data : []).map((row) =>
    mapConversation(row as Record<string, unknown>)
  );
};

export const getMessages = async (token: string, conversationId: string): Promise<Message[]> => {
  const data = await apiRequestJson<unknown[]>(
    token,
    `/api/conversations/${conversationId}/messages`,
    { method: "GET" },
    { fallbackError: "Failed to fetch messages." }
  );
  return (Array.isArray(data) ? data : []).map((row) =>
    mapMessage(row as Record<string, unknown>, conversationId)
  );
};

export const postMessage = async (token: string, conversationId: string, content: string) => {
  const response = await apiRequest(
    token,
    `/api/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    },
    { fallbackError: "Failed to post message." }
  );
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return { success: true };
};
